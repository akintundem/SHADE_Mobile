import axios from 'axios';
import { NativeModules } from 'react-native';
import { getToken, setToken } from '../storage/authStorage';

// Choose a sensible default for dev. Override via `API_BASE_URL` if you have env wiring.
// - iOS simulator can reach localhost directly
// - Android emulator uses 10.0.2.2 to reach host machine
// - Physical devices need the actual IP address of the development machine
// - Use __DEV__ to detect development mode and choose appropriate host
const getPackagerHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (!scriptURL) return null;
  try {
    const { hostname } = new URL(scriptURL);
    return hostname || null;
  } catch (error) {
    console.log('⚠️  Unable to parse Metro host from scriptURL');
    return null;
  }
};

const getHost = () => {
  if (__DEV__) {
    const detectedHost = getPackagerHost();
    if (detectedHost && detectedHost !== 'localhost' && detectedHost !== '127.0.0.1') {
      console.log('🌐 Using Metro host for API:', detectedHost);
      return detectedHost;
    }
    // Fall back to localhost (iOS simulator) when no packager host detected
    return 'localhost';
  }
  // In production, use your production API URL
  return 'your-production-api.com';
};

const HOST = getHost();
const DEFAULT_BASE = `http://${HOST}:8080`;

const sanitizeBaseUrl = (url: string | null | undefined) => {
  if (!url || url.trim().length === 0) {
    return DEFAULT_BASE;
  }
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const resolveConfiguredBase = (): string | null => {
  if (typeof globalThis !== 'undefined') {
    const fromGlobal = (globalThis as Record<string, unknown>).API_BASE_URL;
    if (typeof fromGlobal === 'string') {
      return fromGlobal;
    }
    const maybeProcess = (globalThis as { process?: { env?: Record<string, unknown> } }).process;
    const fromEnv = maybeProcess?.env?.API_BASE_URL;
    if (typeof fromEnv === 'string') {
      return fromEnv;
    }
  }
  return null;
};

const BASE_URL = sanitizeBaseUrl(resolveConfiguredBase());

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
    
    // Add X-User-Id header only for POST/PUT events and chat endpoints that require it
    if ((config.url?.includes('/events') && (config.method === 'post' || config.method === 'put')) || 
        config.url?.includes('/assistant/chat')) {
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
  console.log('❌ HTTP Error:', {
    status: error?.response?.status,
    message: error?.response?.data?.message || error?.message,
    url: error?.config?.url,
    method: error?.config?.method
  });
  
  // Don't automatically clear token on 401 - let the calling code handle it
  // This prevents race conditions during token validation
  
  // Enhanced error handling
  const enhancedError = {
    ...error,
    message: error?.response?.data?.message || error?.message || 'An unexpected error occurred',
    status: error?.response?.status,
    data: error?.response?.data,
  };
  
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
