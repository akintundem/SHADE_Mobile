/**
 * Test HTTP Client
 * 
 * Creates an HTTP client for testing that matches the interface
 * expected by core services.
 */

import axios, { AxiosInstance } from 'axios';

export function createHttpClient(
  baseUrl: string,
  accessToken: string,
  deviceId: string,
  serviceApiKey: string
): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'core-service-tests/1.0',
    },
  });

  instance.interceptors.request.use((config) => {
    const headers = config.headers || {};
    
    if (accessToken && !headers.Authorization) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    
    if (deviceId && !headers['X-Device-ID']) {
      headers['X-Device-ID'] = deviceId;
    }
    
    if (serviceApiKey && !headers['x-service-api-key']) {
      headers['x-service-api-key'] = serviceApiKey;
    }
    
    config.headers = headers;
    return config;
  });

  return instance;
}
