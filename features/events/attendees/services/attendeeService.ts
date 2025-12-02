import { http } from '../../../../common/services/httpClient';
import { ApiResponse } from '../../../../auth/types/auth';
import { Attendee, AttendeeEmergencyContact } from '../types';

export type CreateAttendeeRequest = {
  eventId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dietaryRestrictions?: string[];
  emergencyContact?: AttendeeEmergencyContact;
  ticketType?: string;
  notes?: string;
};

export type UpdateAttendeeRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dietaryRestrictions?: string[];
  emergencyContact?: AttendeeEmergencyContact;
  ticketType?: string;
  notes?: string;
  status?: 'registered' | 'confirmed' | 'cancelled' | 'attended';
};

export const attendeeService = {
  // Attendee CRUD operations
  async createAttendee(request: CreateAttendeeRequest) {
    const res = await http.post<ApiResponse<Attendee>>('/api/v1/attendees', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create attendee');
  },

  async getAttendee(attendeeId: string) {
    const res = await http.get<ApiResponse<Attendee>>(`/api/v1/attendees/${attendeeId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get attendee');
  },

  async updateAttendee(attendeeId: string, updates: UpdateAttendeeRequest) {
    const res = await http.put<ApiResponse<Attendee>>(`/api/v1/attendees/${attendeeId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update attendee');
  },

  async deleteAttendee(attendeeId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/attendees/${attendeeId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete attendee');
  },

  // Event-specific attendee operations
  async registerForEvent(eventId: string, attendeeData: Omit<CreateAttendeeRequest, 'eventId'>) {
    const res = await http.post<ApiResponse<Attendee>>(`/api/v1/events/${eventId}/attendees`, attendeeData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to register for event');
  },

  async getEventAttendees(eventId: string, params?: {
    page?: number;
    size?: number;
    status?: string;
    ticketType?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.ticketType) queryParams.append('ticketType', params.ticketType);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/events/${eventId}/attendees?${queryString}` : `/api/v1/events/${eventId}/attendees`;
    
    const res = await http.get<ApiResponse<{ attendees: Attendee[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event attendees');
  },

  async getAttendeeByEventAndUser(eventId: string, userId: string) {
    const res = await http.get<ApiResponse<Attendee>>(`/api/v1/events/${eventId}/attendees/user/${userId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get attendee by event and user');
  },

  // Attendee status management
  async confirmAttendee(attendeeId: string) {
    const res = await http.post<ApiResponse<Attendee>>(`/api/v1/attendees/${attendeeId}/confirm`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to confirm attendee');
  },

  async cancelAttendee(attendeeId: string, reason?: string) {
    const res = await http.post<ApiResponse<Attendee>>(`/api/v1/attendees/${attendeeId}/cancel`, {
      reason,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to cancel attendee');
  },

  async markAttended(attendeeId: string) {
    const res = await http.post<ApiResponse<Attendee>>(`/api/v1/attendees/${attendeeId}/attended`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to mark attendee as attended');
  },

  // Bulk operations
  async bulkUpdateAttendees(eventId: string, updates: Array<{ attendeeId: string; updates: UpdateAttendeeRequest }>) {
    const res = await http.put<ApiResponse<{ updated: number; failed: number }>>(`/api/v1/events/${eventId}/attendees/bulk`, {
      updates,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to bulk update attendees');
  },

  async exportAttendees(eventId: string, format: 'csv' | 'excel' | 'pdf') {
    const res = await http.get(`/api/v1/events/${eventId}/attendees/export?format=${format}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Attendee analytics
  async getAttendeeAnalytics(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalRegistered: number;
      totalConfirmed: number;
      totalAttended: number;
      totalCancelled: number;
      attendanceRate: number;
      demographics: Record<string, number>;
      ticketTypeBreakdown: Record<string, number>;
      registrationTrends: Array<{ date: string; count: number }>;
    }>>(`/api/v1/events/${eventId}/attendees/analytics`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get attendee analytics');
  },

  // Check-in functionality
  async checkInAttendee(attendeeId: string, checkInTime?: string) {
    const res = await http.post<ApiResponse<{ checkInTime: string; location?: string }>>(`/api/v1/attendees/${attendeeId}/checkin`, {
      checkInTime: checkInTime || new Date().toISOString(),
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to check in attendee');
  },

  async getCheckInStatus(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalCheckedIn: number;
      totalAttendees: number;
      checkInRate: number;
      recentCheckIns: Array<{
        attendeeId: string;
        attendeeName: string;
        checkInTime: string;
      }>;
    }>>(`/api/v1/events/${eventId}/checkin/status`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get check-in status');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/attendees/actuator/health');
    return res.data;
  },
};
