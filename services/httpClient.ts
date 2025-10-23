import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken, clearToken } from '../storage/authStorage';

// Choose a sensible default for dev. Override via `API_BASE_URL` if you have env wiring.
// - iOS simulator can reach localhost directly
// - Android emulator uses 10.0.2.2 to reach host machine
// - Physical devices need the actual IP address of the development machine
// - Use __DEV__ to detect development mode and choose appropriate host
const getHost = () => {
  if (__DEV__) {
    // In development, use IP address for physical devices, localhost for simulators
    return Platform.OS === 'android' ? '10.0.2.2' : '192.168.2.17';
  }
  // In production, use your production API URL
  return 'your-production-api.com';
};

const HOST = getHost();
const DEFAULT_BASE = `http://${HOST}:8080`;

const BASE_URL = `${DEFAULT_BASE}/api`;

// Base HTTP client for unauthenticated requests (registration, login, health checks)
export const httpUnauthenticated = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client-ID': 'mobile-app' // Required for all API requests
  },
});

// Authenticated HTTP client
export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client-ID': 'mobile-app' // Required for all API requests
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
  }
  return config;
});

// Unified response/error handling for both clients
const responseErrorHandler = async (error: any) => {
  if (error?.response?.status === 401) {
    // Token invalid — clear it. Upstream UI can decide how to react.
    await clearToken();
  }
  
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
  if (data?.token) await setToken(data.token);
}

