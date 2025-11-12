import { http } from './httpClient';
import { ApiResponse, Message } from '../types';

export type CreateMessageRequest = {
  eventId: string;
  recipientId?: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  scheduledAt?: string;
};

export type MessageTemplate = {
  templateId: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  variables: string[];
  createdAt: string;
  updatedAt: string;
};

export const commsService = {
  // Message CRUD operations
  async createMessage(request: CreateMessageRequest) {
    const res = await http.post<ApiResponse<Message>>('/api/v1/messages', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create message');
  },

  async getMessage(messageId: string) {
    const res = await http.get<ApiResponse<Message>>(`/api/v1/messages/${messageId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get message');
  },

  async updateMessage(messageId: string, updates: Partial<CreateMessageRequest>) {
    const res = await http.put<ApiResponse<Message>>(`/api/v1/messages/${messageId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update message');
  },

  async deleteMessage(messageId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/messages/${messageId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete message');
  },

  // Event-specific messaging
  async getEventMessages(eventId: string, params?: {
    page?: number;
    size?: number;
    type?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/events/${eventId}/messages?${queryString}` : `/api/v1/events/${eventId}/messages`;
    
    const res = await http.get<ApiResponse<{ messages: Message[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event messages');
  },

  // Bulk messaging
  async sendBulkMessage(eventId: string, messageData: {
    subject: string;
    content: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    recipientIds?: string[];
    recipientFilters?: {
      status?: string[];
      ticketType?: string[];
      registrationDate?: { from: string; to: string };
    };
    scheduledAt?: string;
  }) {
    const res = await http.post<ApiResponse<{ messageId: string; recipientCount: number }>>(`/api/v1/events/${eventId}/messages/bulk`, messageData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to send bulk message');
  },

  // Message scheduling
  async scheduleMessage(messageId: string, scheduledAt: string) {
    const res = await http.post<ApiResponse<Message>>(`/api/v1/messages/${messageId}/schedule`, {
      scheduledAt,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to schedule message');
  },

  async cancelScheduledMessage(messageId: string) {
    const res = await http.post<ApiResponse<Message>>(`/api/v1/messages/${messageId}/cancel`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to cancel scheduled message');
  },

  // Message templates
  async getMessageTemplates(eventId?: string) {
    const url = eventId ? `/api/v1/events/${eventId}/message-templates` : '/api/v1/message-templates';
    const res = await http.get<ApiResponse<MessageTemplate[]>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get message templates');
  },

  async createMessageTemplate(template: {
    name: string;
    subject: string;
    content: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    variables: string[];
    eventId?: string;
  }) {
    const res = await http.post<ApiResponse<MessageTemplate>>('/api/v1/message-templates', template);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create message template');
  },

  async updateMessageTemplate(templateId: string, updates: Partial<{
    name: string;
    subject: string;
    content: string;
    variables: string[];
  }>) {
    const res = await http.put<ApiResponse<MessageTemplate>>(`/api/v1/message-templates/${templateId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update message template');
  },

  async deleteMessageTemplate(templateId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/message-templates/${templateId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete message template');
  },

  // Email notifications
  async sendEmailNotification(eventId: string, notificationData: {
    subject: string;
    content: string;
    recipientIds?: string[];
    templateId?: string;
    templateVariables?: Record<string, string>;
  }) {
    const res = await http.post<ApiResponse<{ messageId: string; recipientCount: number }>>(`/api/v1/events/${eventId}/notifications/email`, notificationData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to send email notification');
  },

  // SMS notifications
  async sendSMSNotification(eventId: string, notificationData: {
    content: string;
    recipientIds?: string[];
    templateId?: string;
    templateVariables?: Record<string, string>;
  }) {
    const res = await http.post<ApiResponse<{ messageId: string; recipientCount: number }>>(`/api/v1/events/${eventId}/notifications/sms`, notificationData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to send SMS notification');
  },

  // Push notifications
  async sendPushNotification(eventId: string, notificationData: {
    title: string;
    body: string;
    data?: Record<string, any>;
    recipientIds?: string[];
  }) {
    const res = await http.post<ApiResponse<{ messageId: string; recipientCount: number }>>(`/api/v1/events/${eventId}/notifications/push`, notificationData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to send push notification');
  },

  // Message status and delivery tracking
  async getMessageStatus(messageId: string) {
    const res = await http.get<ApiResponse<{
      messageId: string;
      status: 'draft' | 'sent' | 'delivered' | 'failed';
      sentAt?: string;
      deliveredAt?: string;
      failureReason?: string;
      recipientCount: number;
      deliveryStats: {
        sent: number;
        delivered: number;
        failed: number;
        pending: number;
      };
    }>>(`/api/v1/messages/${messageId}/status`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get message status');
  },

  // Communication dashboard
  async getCommunicationDashboard(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalMessages: number;
      messagesByType: Record<string, number>;
      messagesByStatus: Record<string, number>;
      deliveryRates: {
        email: number;
        sms: number;
        push: number;
        in_app: number;
      };
      recentActivity: Array<{
        messageId: string;
        type: string;
        subject: string;
        status: string;
        sentAt: string;
        recipientCount: number;
      }>;
      topTemplates: Array<{
        templateId: string;
        name: string;
        usageCount: number;
      }>;
    }>>(`/api/v1/events/${eventId}/communications/dashboard`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get communication dashboard');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/comms/actuator/health');
    return res.data;
  },
};
