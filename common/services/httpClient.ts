import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken } from '../storage/authStorage';
import { appConfig } from '../../config/appConfig';

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

const BASE_URL = sanitizeBaseUrl(appConfig.apiBaseUrl) || FALLBACK_BASE_URL;

export const httpUnauthenticated = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_CACHE_TTL_MS = 60 * 1000;
let cachedToken: { value: string | null; fetchedAt: number } = { value: null, fetchedAt: 0 };
let tokenFetchPromise: Promise<string | null> | null = null;

/** Invalidate the in-memory token cache. Call this on login / logout / user switch. */
export function clearTokenCache() {
  cachedToken = { value: null, fetchedAt: 0 };
  tokenFetchPromise = null;
}

async function getTokenCached(): Promise<string | null> {
  const now = Date.now();
  const isStale = now - cachedToken.fetchedAt > TOKEN_CACHE_TTL_MS;

  if (cachedToken.value && !isStale) {
    return cachedToken.value;
  }

  // Deduplicate concurrent token fetches with a shared in-flight promise
  if (!tokenFetchPromise) {
    tokenFetchPromise = getToken().then(token => {
      cachedToken = { value: token, fetchedAt: Date.now() };
      tokenFetchPromise = null;
      return token;
    }).catch(err => {
      tokenFetchPromise = null;
      throw err;
    });
  }

  return tokenFetchPromise;
}

http.interceptors.request.use(async config => {
  if (!config.headers) {
    config.headers = {} as any;
  }

  const token = await getTokenCached();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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

const MAX_RETRIES = 4;
const RETRY_DELAYS_MS = [3000, 6000, 12000, 20000];
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: any, retryCount: number): boolean => {
  const status = error?.response?.status;
  return (
    retryCount < MAX_RETRIES &&
    (status === 429 || (status >= 500 && status < 600))
  );
};

const responseErrorHandler = async (error: any) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const validationErrors = responseData?.validationErrors;
  const originalRequest = error?.config;

  if (originalRequest && shouldRetry(error, originalRequest._retryCount || 0)) {
    const retryCount = originalRequest._retryCount || 0;
    originalRequest._retryCount = retryCount + 1;
    const delay = RETRY_DELAYS_MS[retryCount] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
    await sleep(delay);
    return http(originalRequest);
  }

  if (status === 401 && originalRequest && !originalRequest._retry) {
    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/signup') ||
      url.includes('/api/v1/auth/refresh-token') ||
      url.includes('/api/v1/auth/logout') ||
      url.includes('/api/v1/auth/validate-token');

    if (!isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const { authService } = await import('../../core/auth/services/authService');
        const { accessToken } = await authService.refreshToken();
        await setToken(accessToken);
        cachedToken = { value: accessToken, fetchedAt: Date.now() };
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        isRefreshing = false;
        return http(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        const { clearAllAuth } = await import('../storage/authStorage');
        await clearAllAuth();
        processQueue(refreshError);
        const enhancedError: any =
          error && typeof error === 'object' ? error : new Error('Session expired. Please log in again.');
        enhancedError.message = 'Session expired. Please log in again.';
        enhancedError.status = 401;
        enhancedError.data = responseData;
        if (!enhancedError.originalError) enhancedError.originalError = error;
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
  if (!enhancedError.originalError) enhancedError.originalError = error;

  return Promise.reject(enhancedError);
};

http.interceptors.response.use(response => response, responseErrorHandler);
httpUnauthenticated.interceptors.response.use(response => response, responseErrorHandler);

export async function persistTokenFrom(data?: { token?: string | null }) {
  if (data?.token) {
    await setToken(data.token);
  }
}
