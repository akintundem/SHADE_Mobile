// Export all services for easy importing
export { authService } from './authService';
export { eventService } from './eventService';
export { vendorService } from './vendorService';
export { attendeeService } from './attendeeService';
export { budgetService } from './budgetService';
export { commsService } from './commsService';
export { riskService } from './riskService';
export { timelineService } from './timelineService';
export { paymentsService } from './paymentsService';
export { weatherService } from './weatherService';

// Re-export types for convenience
export type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  Event,
  CreateEventRequest,
  Location,
  Vendor,
  ContactInfo,
  Attendee,
  EmergencyContact,
  Budget,
  BudgetCategory,
  Expense,
  Message,
  Risk,
  Timeline,
  Milestone,
  Payment,
  WeatherData,
  CurrentWeather,
  WeatherForecast,
  WeatherAlert,
  WeatherThresholds,
  NotificationSettings,
} from '../types';
