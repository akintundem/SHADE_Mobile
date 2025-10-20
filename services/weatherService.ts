import { http } from './httpClient';
import { ApiResponse, WeatherData, CurrentWeather, WeatherForecast, WeatherAlert, WeatherThresholds, NotificationSettings, Location } from '../types';

export type CreateWeatherAlertRequest = {
  eventId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: Location;
  thresholds: WeatherThresholds;
  notificationSettings: NotificationSettings;
  description: string;
};

export type UpdateWeatherAlertRequest = {
  alertType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  thresholds?: WeatherThresholds;
  notificationSettings?: NotificationSettings;
  status?: 'active' | 'inactive' | 'expired';
  description?: string;
};

export const weatherService = {
  // Current weather data
  async getCurrentWeather(lat: number, lon: number) {
    const res = await http.get<ApiResponse<CurrentWeather>>(`/api/v1/weather/current?lat=${lat}&lon=${lon}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get current weather');
  },

  async getCurrentWeatherByCity(city: string) {
    const res = await http.get<ApiResponse<CurrentWeather>>(`/api/v1/weather/city/${encodeURIComponent(city)}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get current weather by city');
  },

  async getCurrentWeatherByZipCode(zipCode: string) {
    const res = await http.get<ApiResponse<CurrentWeather>>(`/api/v1/weather/zipcode/${zipCode}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get current weather by zip code');
  },

  // Weather forecast
  async getWeatherForecast(lat: number, lon: number, days: number = 5) {
    const res = await http.get<ApiResponse<WeatherForecast[]>>(`/api/v1/weather/forecast?lat=${lat}&lon=${lon}&days=${days}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather forecast');
  },

  async getEventWeatherForecast(eventId: string) {
    const res = await http.get<ApiResponse<WeatherForecast[]>>(`/api/v1/events/${eventId}/weather/forecast`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event weather forecast');
  },

  // Weather alerts management
  async createWeatherAlert(request: CreateWeatherAlertRequest) {
    const res = await http.post<ApiResponse<WeatherAlert>>('/api/v1/weather/alerts', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create weather alert');
  },

  async getWeatherAlert(alertId: string) {
    const res = await http.get<ApiResponse<WeatherAlert>>(`/api/v1/weather/alerts/${alertId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather alert');
  },

  async updateWeatherAlert(alertId: string, updates: UpdateWeatherAlertRequest) {
    const res = await http.put<ApiResponse<WeatherAlert>>(`/api/v1/weather/alerts/${alertId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update weather alert');
  },

  async deleteWeatherAlert(alertId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/weather/alerts/${alertId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete weather alert');
  },

  async getWeatherAlerts(params?: {
    eventId?: string;
    status?: string;
    severity?: string;
    location?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.location) queryParams.append('location', params.location);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/weather/alerts?${queryString}` : '/api/v1/weather/alerts';
    
    const res = await http.get<ApiResponse<WeatherAlert[]>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather alerts');
  },

  async getEventWeatherAlerts(eventId: string) {
    const res = await http.get<ApiResponse<WeatherAlert[]>>(`/api/v1/events/${eventId}/weather/alerts`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event weather alerts');
  },

  // Weather recommendations
  async getWeatherRecommendations(eventId: string) {
    const res = await http.get<ApiResponse<{
      eventId: string;
      recommendations: Array<{
        type: 'clothing' | 'equipment' | 'timing' | 'location' | 'safety';
        priority: 'low' | 'medium' | 'high';
        title: string;
        description: string;
        weatherCondition: string;
        impact: string;
      }>;
      overallRisk: 'low' | 'medium' | 'high';
      weatherSummary: string;
      lastUpdated: string;
    }>>(`/api/v1/events/${eventId}/weather/recommendations`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather recommendations');
  },

  async getWeatherImpactReport(eventId: string) {
    const res = await http.get<ApiResponse<{
      eventId: string;
      impactAssessment: {
        overallImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
        attendanceImpact: number;
        logisticsImpact: number;
        safetyImpact: number;
        costImpact: number;
      };
      weatherConditions: {
        temperature: { current: number; forecast: number[]; impact: string };
        precipitation: { current: number; forecast: number[]; impact: string };
        wind: { current: number; forecast: number[]; impact: string };
        visibility: { current: number; forecast: number[]; impact: string };
      };
      recommendations: string[];
      contingencyPlans: string[];
      lastUpdated: string;
    }>>(`/api/v1/events/${eventId}/weather/impact-report`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather impact report');
  },

  // Weather dashboard and analytics
  async getWeatherDashboard(eventId?: string) {
    const url = eventId ? `/api/v1/events/${eventId}/weather/dashboard` : '/api/v1/weather/dashboard';
    const res = await http.get<ApiResponse<{
      currentConditions: CurrentWeather;
      forecast: WeatherForecast[];
      activeAlerts: WeatherAlert[];
      weatherTrends: Array<{
        date: string;
        temperature: { high: number; low: number };
        precipitation: number;
        windSpeed: number;
        condition: string;
      }>;
      alertsSummary: {
        total: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
      };
      recommendations: string[];
      lastUpdated: string;
    }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather dashboard');
  },

  async getWeatherTrends(lat: number, lon: number, period: number = 30) {
    const res = await http.get<ApiResponse<{
      period: number;
      trends: Array<{
        date: string;
        averageTemperature: number;
        totalPrecipitation: number;
        averageWindSpeed: number;
        dominantCondition: string;
      }>;
      statistics: {
        averageTemperature: number;
        totalPrecipitation: number;
        averageWindSpeed: number;
        extremeTemperatures: { min: number; max: number };
        precipitationDays: number;
      };
    }>>(`/api/v1/weather/trends?period=${period}&lat=${lat}&lon=${lon}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather trends');
  },

  // Weather data for multiple locations
  async getMultiLocationWeather(locations: Array<{ lat: number; lon: number; name: string }>) {
    const res = await http.post<ApiResponse<Array<{
      location: { lat: number; lon: number; name: string };
      current: CurrentWeather;
      forecast: WeatherForecast[];
    }>>>('/api/v1/weather/multi-location', { locations });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get multi-location weather');
  },

  // Weather alert notifications
  async triggerWeatherAlert(alertId: string) {
    const res = await http.post<ApiResponse<{
      alertId: string;
      triggered: boolean;
      notificationsSent: number;
      triggeredAt: string;
    }>>(`/api/v1/weather/alerts/${alertId}/trigger`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to trigger weather alert');
  },

  async getWeatherAlertHistory(alertId: string) {
    const res = await http.get<ApiResponse<Array<{
      triggerId: string;
      alertId: string;
      triggeredAt: string;
      weatherConditions: CurrentWeather;
      notificationsSent: number;
      responseRate: number;
    }>>>(`/api/v1/weather/alerts/${alertId}/history`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get weather alert history');
  },

  // Weather data export
  async exportWeatherData(eventId: string, format: 'csv' | 'excel' | 'pdf', dataType: 'forecast' | 'alerts' | 'recommendations') {
    const res = await http.get(`/api/v1/events/${eventId}/weather/export?format=${format}&type=${dataType}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/weather/actuator/health');
    return res.data;
  },
};
