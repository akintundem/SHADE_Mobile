import { http } from './httpClient';
import { ApiResponse, Payment } from '../types';

export type CreatePaymentRequest = {
  eventId: string;
  attendeeId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
};

export type PaymentMethod = {
  methodId: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'crypto';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
};

export type RefundRequest = {
  paymentId: string;
  amount?: number;
  reason: string;
};

export const paymentsService = {
  // Payment CRUD operations
  async createPayment(request: CreatePaymentRequest) {
    const res = await http.post<ApiResponse<Payment>>('/api/v1/payments', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create payment');
  },

  async getPayment(paymentId: string) {
    const res = await http.get<ApiResponse<Payment>>(`/api/v1/payments/${paymentId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment');
  },

  async updatePayment(paymentId: string, updates: Partial<CreatePaymentRequest>) {
    const res = await http.put<ApiResponse<Payment>>(`/api/v1/payments/${paymentId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update payment');
  },

  async deletePayment(paymentId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/payments/${paymentId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete payment');
  },

  // Event-specific payment operations
  async getEventPayments(eventId: string, params?: {
    page?: number;
    size?: number;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/events/${eventId}/payments?${queryString}` : `/api/v1/events/${eventId}/payments`;
    
    const res = await http.get<ApiResponse<{ payments: Payment[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event payments');
  },

  async getAttendeePayments(attendeeId: string) {
    const res = await http.get<ApiResponse<Payment[]>>(`/api/v1/attendees/${attendeeId}/payments`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get attendee payments');
  },

  // Payment processing
  async processPayment(paymentId: string, paymentData: {
    paymentMethodId: string;
    savePaymentMethod?: boolean;
  }) {
    const res = await http.post<ApiResponse<{
      paymentId: string;
      status: string;
      transactionId?: string;
      processedAt?: string;
      failureReason?: string;
    }>>(`/api/v1/payments/${paymentId}/process`, paymentData);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to process payment');
  },

  async getPaymentStatus(paymentId: string) {
    const res = await http.get<ApiResponse<{
      paymentId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
      transactionId?: string;
      processedAt?: string;
      failureReason?: string;
      amount: number;
      currency: string;
    }>>(`/api/v1/payments/${paymentId}/status`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment status');
  },

  // Refund operations
  async refundPayment(request: RefundRequest) {
    const res = await http.post<ApiResponse<{
      refundId: string;
      paymentId: string;
      amount: number;
      status: string;
      refundedAt: string;
    }>>(`/api/v1/payments/${request.paymentId}/refund`, request);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to refund payment');
  },

  async getRefunds(paymentId: string) {
    const res = await http.get<ApiResponse<Array<{
      refundId: string;
      paymentId: string;
      amount: number;
      reason: string;
      status: string;
      refundedAt: string;
    }>>>(`/api/v1/payments/${paymentId}/refunds`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get refunds');
  },

  // Payment methods management
  async getPaymentMethods(userId?: string) {
    const url = userId ? `/api/v1/payment-methods?userId=${userId}` : '/api/v1/payment-methods';
    const res = await http.get<ApiResponse<PaymentMethod[]>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment methods');
  },

  async addPaymentMethod(paymentMethodData: {
    type: string;
    token: string;
    isDefault?: boolean;
  }) {
    const res = await http.post<ApiResponse<PaymentMethod>>('/api/v1/payment-methods', paymentMethodData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to add payment method');
  },

  async updatePaymentMethod(methodId: string, updates: { isDefault?: boolean }) {
    const res = await http.put<ApiResponse<PaymentMethod>>(`/api/v1/payment-methods/${methodId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update payment method');
  },

  async deletePaymentMethod(methodId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/payment-methods/${methodId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete payment method');
  },

  // Payment analytics and reporting
  async getPaymentReports(eventId: string, reportType: 'summary' | 'detailed' | 'refunds' | 'methods') {
    const res = await http.get<ApiResponse<any>>(`/api/v1/events/${eventId}/payments/reports?type=${reportType}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment reports');
  },

  async getPaymentAnalytics(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalRevenue: number;
      totalPayments: number;
      successfulPayments: number;
      failedPayments: number;
      refundedPayments: number;
      successRate: number;
      averagePaymentAmount: number;
      paymentsByMethod: Record<string, number>;
      paymentsByStatus: Record<string, number>;
      revenueByDate: Array<{
        date: string;
        amount: number;
        count: number;
      }>;
      topAttendees: Array<{
        attendeeId: string;
        attendeeName: string;
        totalPaid: number;
        paymentCount: number;
      }>;
    }>>(`/api/v1/events/${eventId}/payments/analytics`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment analytics');
  },

  async exportPaymentReport(eventId: string, format: 'csv' | 'excel' | 'pdf') {
    const res = await http.get(`/api/v1/events/${eventId}/payments/export?format=${format}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Payment webhooks and notifications
  async getPaymentWebhooks(eventId?: string) {
    const url = eventId ? `/api/v1/events/${eventId}/payments/webhooks` : '/api/v1/payments/webhooks';
    const res = await http.get<ApiResponse<Array<{
      webhookId: string;
      url: string;
      events: string[];
      isActive: boolean;
      createdAt: string;
    }>>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment webhooks');
  },

  async createPaymentWebhook(webhookData: {
    url: string;
    events: string[];
    eventId?: string;
  }) {
    const res = await http.post<ApiResponse<{ webhookId: string }>>('/api/v1/payments/webhooks', webhookData);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create payment webhook');
  },

  // Payment disputes and chargebacks
  async getPaymentDisputes(eventId?: string) {
    const url = eventId ? `/api/v1/events/${eventId}/payments/disputes` : '/api/v1/payments/disputes';
    const res = await http.get<ApiResponse<Array<{
      disputeId: string;
      paymentId: string;
      reason: string;
      status: string;
      amount: number;
      currency: string;
      createdAt: string;
      dueDate: string;
    }>>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get payment disputes');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/payments/actuator/health');
    return res.data;
  },
};
