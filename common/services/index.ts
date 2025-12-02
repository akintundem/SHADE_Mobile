// Re-export services from their feature locations for backward compatibility
export { authService } from '../../features/auth/services/authService';
export { eventService } from '../../features/events/services/eventService';
export { assistantService } from '../../features/agent/services/assistantService';
export { vendorService } from '../../features/events/services/vendorService';
export { attendeeService } from '../../features/events/attendees/services/attendeeService';
export { budgetService } from '../../features/events/budget/services/budgetService';
export { commsService } from '../../features/chat/services/commsService';
export { riskService } from '../../features/events/risk/services/riskService';
export { timelineService } from '../../features/events/timeline/services/timelineService';
export { paymentsService } from '../../features/events/services/paymentsService';
export { weatherService } from '../../features/events/services/weatherService';
export { aiService } from '../../features/agent/services/aiService';

// Re-export common services
export { http, httpUnauthenticated, persistTokenFrom } from './httpClient';
export { geolocationService } from './geolocationService';

// Re-export types for convenience
export * from '../../features/auth/types/auth';
export * from '../../features/events/types/events';
export * from '../../features/events/types/enums';
export * from '../../features/events/types/vendors';
export * from '../../features/events/types/payments';
export * from '../../features/events/types/weather';
export * from '../../features/events/attendees/types/attendees';
export * from '../../features/events/budget/types/budget';
export * from '../../features/events/risk/types/risk';
export * from '../../features/events/timeline/types/timeline';
export * from '../../features/chat/types/communications';
export * from '../../features/agent/types/assistant';
