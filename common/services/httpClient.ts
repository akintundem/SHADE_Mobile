import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken } from '../storage/authStorage';
import devConfig from '../../dev-config.json';

type DevConfig = {
  apiBaseUrl?: string;
};

const sanitizeBaseUrl = (value?: string) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const FALLBACK_BASE_URL =
  Platform.select({
    ios: 'http://localhost:8080',
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }) ?? 'http://localhost:8080';

const BASE_URL = sanitizeBaseUrl(devConfig?.apiBaseUrl) || FALLBACK_BASE_URL;

// Base HTTP client for unauthenticated requests (registration, login, health checks)
export const httpUnauthenticated = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
  },
});

// Authenticated HTTP client
export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
http.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    config.headers.Authorization = `Bearer ${token}`;
    
    // Add X-Device-Id header if available (recommended for authenticated requests)
    try {
      const { getDeviceId } = await import('../storage/authStorage');
      const deviceId = await getDeviceId();
      if (deviceId) {
        config.headers['X-Device-Id'] = deviceId;
      }
    } catch (error) {
      // Silently handle device ID retrieval failure
    }
  }
  return config;
});

// Token refresh state to prevent infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Unified response/error handling for both clients
const responseErrorHandler = async (error: any) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const validationErrors = responseData?.validationErrors;
  const originalRequest = error?.config;

  // Handle 401 Unauthorized - try to refresh token
  if (status === 401 && originalRequest && !originalRequest._retry) {
    // Skip refresh for auth endpoints to prevent infinite loops
    const url = originalRequest.url || '';
    const isAuthEndpoint = 
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/refresh-token') ||
      url.includes('/api/v1/auth/logout') ||
      url.includes('/api/v1/auth/validate-token');

    if (isAuthEndpoint) {
      // For auth endpoints, don't try to refresh - just return the error
    } else {
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            // Update token and retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        const { authService } = await import('./authService');
        const refreshResponse = await authService.refreshToken();
        
        // Update token in memory
        if (refreshResponse?.accessToken) {
          await setToken(refreshResponse.accessToken);
        }

        // Process queued requests
        processQueue(null, refreshResponse?.accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
        }
        
        isRefreshing = false;
        return http(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear all auth data and reject all queued requests
        isRefreshing = false;
        const { clearAllAuth } = await import('../storage/authStorage');
        await clearAllAuth();
        processQueue(refreshError);
        
        // Return original error
        const enhancedError: any =
          error && typeof error === 'object' ? error : new Error('Session expired. Please log in again.');
        enhancedError.message = 'Session expired. Please log in again.';
        enhancedError.status = 401;
        enhancedError.data = responseData;
        if (!enhancedError.originalError) {
          enhancedError.originalError = error;
        }
        return Promise.reject(enhancedError);
      }
    }
  }

  let message =
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    'An unexpected error occurred';

  if (validationErrors && typeof validationErrors === 'object') {
    const [firstKey, firstValue] = Object.entries(validationErrors)[0] ?? [];
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      message = String(firstValue[0]);
    } else if (typeof firstValue === 'string' && firstValue.length > 0) {
      message = firstValue;
    } else if (firstKey) {
      const value = validationErrors[firstKey as keyof typeof validationErrors];
      message = `${firstKey}: ${Array.isArray(value) ? value.join(', ') : String(value)}`;
    }
  }

  const isTimeout =
    error?.code === 'ECONNABORTED' ||
    /timeout/i.test(error?.message ?? '') ||
    responseData?.error === 'Request Timeout';

  if (isTimeout) {
    message = 'Request timed out. Please try again.';
  } else if (!error?.response) {
    message = 'Unable to reach the server. Please check your network connection.';
  }

  const enhancedError: any =
    error && typeof error === 'object' ? error : new Error(message);

  enhancedError.message = message;
  enhancedError.status = status;
  enhancedError.data = responseData;
  enhancedError.validationErrors = validationErrors;
  if (!enhancedError.originalError) {
    enhancedError.originalError = error;
  }

  return Promise.reject(enhancedError);
};

// Apply error handling to both clients
http.interceptors.response.use(response => response, responseErrorHandler);
httpUnauthenticated.interceptors.response.use(response => response, responseErrorHandler);

// Utilities to persist token from API replies in one place
export async function persistTokenFrom(data?: { token?: string | null }) {
  if (data?.token) {
    await setToken(data.token);
  }
}
