import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken } from '../storage/authStorage';
import yamlConfig from '../dev-config.yml';
import jsonConfig from '../dev-config.json';

type DevConfig = {
  apiBaseUrl?: string;
};

const sanitizeBaseUrl = (value?: string) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const configs: DevConfig[] = [jsonConfig, yamlConfig];
const resolvedConfig = configs.find((cfg) => sanitizeBaseUrl(cfg?.apiBaseUrl));

const FALLBACK_BASE_URL =
  Platform.select({
    ios: 'http://localhost:8080',
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }) ?? 'http://localhost:8080';

if (__DEV__ && !sanitizeBaseUrl(resolvedConfig?.apiBaseUrl)) {
  console.warn(
    '⚠️  dev-config.json / dev-config.yml do not define apiBaseUrl. Falling back to platform default:',
    FALLBACK_BASE_URL
  );
}

const BASE_URL = sanitizeBaseUrl(resolvedConfig?.apiBaseUrl) || FALLBACK_BASE_URL;

// Base HTTP client for unauthenticated requests (registration, login, health checks)
export const httpUnauthenticated = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client-ID': 'web-app' // Use web-app to match working API docs
  },
});

// Authenticated HTTP client
export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client-ID': 'web-app' // Use web-app to match working API docs
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
    console.log('🔐 Adding Authorization header to request:', config.url);
    console.log('🔐 Token being used:', token.substring(0, 30) + '...');
    
    const url = config.url ?? '';
    const method = (config.method ?? 'get').toLowerCase();
    const needsUserHeader =
      url.includes('/assistant/chat') ||
      url.includes('/api/v1/events/my-events') ||
      url.includes('/api/v1/events/user/') ||
      (url.includes('/api/v1/events') && (method === 'post' || method === 'put' || method === 'patch'));

    if (needsUserHeader) {
      try {
        const { getUser } = await import('../storage/authStorage');
        const cachedUser = await getUser<{ userId?: string }>();
        if (cachedUser && typeof cachedUser.userId === 'string') {
          config.headers['X-User-Id'] = cachedUser.userId;
          console.log('🔐 Adding X-User-Id header:', cachedUser.userId);
        }
      } catch (error) {
        console.log('⚠️  Could not get user ID for X-User-Id header');
      }
    }
  } else {
    console.log('⚠️  No token found for authenticated request:', config.url);
  }
  return config;
});

// Unified response/error handling for both clients
const responseErrorHandler = async (error: any) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const validationErrors = responseData?.validationErrors;

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

  console.log('❌ HTTP Error:', {
    status,
    message,
    url: error?.config?.url,
    method: error?.config?.method
  });

  // Don't automatically clear token on 401 - let the calling code handle it
  // This prevents race conditions during token validation
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
    console.log('🔐 Token saved to storage:', data.token.substring(0, 20) + '...');
  }
}
