import { http } from '../../../../common/services/httpClient';
import { ApiResponse } from '../../../../auth/types/auth';
import { Risk } from '../types';

export type CreateRiskRequest = {
  eventId: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigationPlan?: string;
  assignedTo?: string;
  dueDate?: string;
};

export type UpdateRiskRequest = {
  title?: string;
  description?: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  probability?: 'low' | 'medium' | 'high';
  impact?: 'low' | 'medium' | 'high';
  status?: 'identified' | 'assessed' | 'mitigated' | 'resolved';
  mitigationPlan?: string;
  assignedTo?: string;
  dueDate?: string;
};

export const riskService = {
  // Risk CRUD operations
  async createRisk(request: CreateRiskRequest) {
    const res = await http.post<ApiResponse<Risk>>('/api/v1/risks', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create risk');
  },

  async getRisk(riskId: string) {
    const res = await http.get<ApiResponse<Risk>>(`/api/v1/risks/${riskId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk');
  },

  async updateRisk(riskId: string, updates: UpdateRiskRequest) {
    const res = await http.put<ApiResponse<Risk>>(`/api/v1/risks/${riskId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update risk');
  },

  async deleteRisk(riskId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/risks/${riskId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete risk');
  },

  // Event-specific risk management
  async getEventRisks(eventId: string, params?: {
    page?: number;
    size?: number;
    category?: string;
    severity?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/events/${eventId}/risks?${queryString}` : `/api/v1/events/${eventId}/risks`;
    
    const res = await http.get<ApiResponse<{ risks: Risk[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event risks');
  },

  // Risk assessment
  async performRiskAssessment(eventId: string) {
    const res = await http.post<ApiResponse<{
      assessmentId: string;
      eventId: string;
      identifiedRisks: Risk[];
      riskScore: number;
      recommendations: string[];
      assessmentDate: string;
    }>>(`/api/v1/events/${eventId}/risks/assess`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to perform risk assessment');
  },

  async getRiskAssessment(eventId: string) {
    const res = await http.get<ApiResponse<{
      assessmentId: string;
      eventId: string;
      riskScore: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      lastAssessmentDate: string;
      risksByCategory: Record<string, number>;
      risksBySeverity: Record<string, number>;
      risksByStatus: Record<string, number>;
    }>>(`/api/v1/events/${eventId}/risks/assessment`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk assessment');
  },

  // Risk status management
  async updateRiskStatus(riskId: string, status: 'identified' | 'assessed' | 'mitigated' | 'resolved') {
    const res = await http.post<ApiResponse<Risk>>(`/api/v1/risks/${riskId}/status`, { status });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update risk status');
  },

  async assignRisk(riskId: string, assignedTo: string) {
    const res = await http.post<ApiResponse<Risk>>(`/api/v1/risks/${riskId}/assign`, { assignedTo });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to assign risk');
  },

  // Risk mitigation
  async addMitigationPlan(riskId: string, mitigationPlan: string) {
    const res = await http.post<ApiResponse<Risk>>(`/api/v1/risks/${riskId}/mitigation`, { mitigationPlan });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to add mitigation plan');
  },

  async markRiskMitigated(riskId: string, mitigationNotes?: string) {
    const res = await http.post<ApiResponse<Risk>>(`/api/v1/risks/${riskId}/mitigated`, { mitigationNotes });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to mark risk as mitigated');
  },

  // Risk dashboard and analytics
  async getRiskDashboard(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalRisks: number;
      risksBySeverity: Record<string, number>;
      risksByStatus: Record<string, number>;
      risksByCategory: Record<string, number>;
      riskScore: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      criticalRisks: Risk[];
      overdueRisks: Risk[];
      recentActivity: Array<{
        riskId: string;
        title: string;
        action: string;
        timestamp: string;
        user: string;
      }>;
    }>>(`/api/v1/events/${eventId}/risks/dashboard`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk dashboard');
  },

  async getRiskTrends(eventId: string, period: '7d' | '30d' | '90d' = '30d') {
    const res = await http.get<ApiResponse<{
      period: string;
      trends: Array<{
        date: string;
        totalRisks: number;
        newRisks: number;
        resolvedRisks: number;
        riskScore: number;
      }>;
      categoryTrends: Record<string, Array<{
        date: string;
        count: number;
      }>>;
    }>>(`/api/v1/events/${eventId}/risks/trends?period=${period}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk trends');
  },

  // Risk categories and templates
  async getRiskCategories() {
    const res = await http.get<ApiResponse<string[]>>('/api/v1/risks/categories');
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk categories');
  },

  async getRiskTemplates(category?: string) {
    const url = category ? `/api/v1/risks/templates?category=${category}` : '/api/v1/risks/templates';
    const res = await http.get<ApiResponse<Array<{
      templateId: string;
      title: string;
      description: string;
      category: string;
      severity: string;
      probability: string;
      impact: string;
      mitigationPlan: string;
    }>>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk templates');
  },

  // Risk alerts and notifications
  async getRiskAlerts(eventId: string) {
    const res = await http.get<ApiResponse<Array<{
      alertId: string;
      riskId: string;
      type: 'new_risk' | 'severity_change' | 'overdue' | 'mitigation_due';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      createdAt: string;
    }>>>(`/api/v1/events/${eventId}/risks/alerts`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get risk alerts');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/risk/actuator/health');
    return res.data;
  },
};
