// Re-export services from their feature locations for backward compatibility
export { authService } from '../../features/auth/services/authService';

// Re-export common services
export { http, httpUnauthenticated, persistTokenFrom } from './httpClient';
export { GeolocationService } from './geolocationService';

// Re-export types for convenience
export * from '../../features/auth/types/auth';
