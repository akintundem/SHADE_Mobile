/**
 * Weather related types
 */

import { Location } from './events';

export type WeatherData = {
  location: Location;
  current: CurrentWeather;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
};

export type CurrentWeather = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  icon: string;
  timestamp: string;
};

export type WeatherForecast = {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
};

export type WeatherAlert = {
  alertId: string;
  eventId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: Location;
  thresholds: WeatherThresholds;
  notificationSettings: NotificationSettings;
  status: 'active' | 'inactive' | 'expired';
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type WeatherThresholds = {
  temperature?: { min: number; max: number };
  precipitation?: { max: number };
  windSpeed?: { max: number };
};

export type NotificationSettings = {
  email: boolean;
  push: boolean;
};
