import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken, clearToken } from '../storage/authStorage';

// Choose a sensible default for dev. Override via `API_BASE_URL` if you have env wiring.
// - iOS simulator can reach localhost directly
// - Android emulator uses 10.0.2.2 to reach host machine
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEFAULT_BASE = `http://${HOST}:8080`;

const BASE_URL = `${DEFAULT_BASE}/api`;

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization header if token exists
http.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unified response/error handling
http.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      // Token invalid — clear it. Upstream UI can decide how to react.
      await clearToken();
    }
    return Promise.reject(error);
  },
);

// Utilities to persist token from API replies in one place
export async function persistTokenFrom(data?: { token?: string | null }) {
  if (data?.token) await setToken(data.token);
}

