// Re-export services from core auth
export { authService } from '../../core/auth/authService';

// Re-export common services
export { http, httpUnauthenticated, persistTokenFrom } from './httpClient';
export { GeolocationService } from './geolocationService';

// Re-export auth types for convenience
export * from '../../core/auth/types/auth';
