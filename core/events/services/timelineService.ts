import { http } from '../../../common/services/httpClient';
import { ApiResponse } from '../../auth/types/auth';
import { Timeline, Milestone } from '../types/timeline';

export type CreateTimelineRequest = {
  eventId: string;
  title: string;
  description: string;
  milestones: Array<{
    title: string;
    description: string;
    dueDate: string;
    assignedTo?: string;
    dependencies?: string[];
  }>;
};

export type CreateMilestoneRequest = {
  timelineId: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo?: string;
  dependencies?: string[];
};

export type UpdateMilestoneRequest = {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
  dependencies?: string[];
};

export const timelineService = {
  // Timeline CRUD operations
  async createTimeline(request: CreateTimelineRequest) {
    const res = await http.post<ApiResponse<Timeline>>('/api/v1/timelines', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create timeline');
  },

  async getTimeline(timelineId: string) {
    const res = await http.get<ApiResponse<Timeline>>(`/api/v1/timelines/${timelineId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get timeline');
  },

  async getTimelineByEvent(eventId: string) {
    const res = await http.get<ApiResponse<Timeline>>(`/api/v1/events/${eventId}/timeline`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event timeline');
  },

  async updateTimeline(timelineId: string, updates: {
    title?: string;
    description?: string;
  }) {
    const res = await http.put<ApiResponse<Timeline>>(`/api/v1/timelines/${timelineId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update timeline');
  },

  async deleteTimeline(timelineId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/timelines/${timelineId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete timeline');
  },

  // Milestone management
  async createMilestone(request: CreateMilestoneRequest) {
    const res = await http.post<ApiResponse<Milestone>>('/api/v1/milestones', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create milestone');
  },

  async getMilestone(milestoneId: string) {
    const res = await http.get<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get milestone');
  },

  async updateMilestone(milestoneId: string, updates: UpdateMilestoneRequest) {
    const res = await http.put<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update milestone');
  },

  async deleteMilestone(milestoneId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/milestones/${milestoneId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete milestone');
  },

  // Milestone status management
  async updateMilestoneStatus(milestoneId: string, status: 'pending' | 'in_progress' | 'completed' | 'overdue') {
    const res = await http.post<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}/status`, { status });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update milestone status');
  },

  async completeMilestone(milestoneId: string, completedAt?: string) {
    const res = await http.post<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}/complete`, {
      completedAt: completedAt || new Date().toISOString(),
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to complete milestone');
  },

  async assignMilestone(milestoneId: string, assignedTo: string) {
    const res = await http.post<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}/assign`, { assignedTo });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to assign milestone');
  },

  // Timeline progress tracking
  async getTimelineProgress(timelineId: string) {
    const res = await http.get<ApiResponse<{
      timelineId: string;
      totalMilestones: number;
      completedMilestones: number;
      inProgressMilestones: number;
      completionPercentage: number;
      progressByStatus: Record<string, number>;
      upcomingMilestones: Milestone[];
      overdueMilestones: Milestone[];
    }>>(`/api/v1/timelines/${timelineId}/progress`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get timeline progress');
  },

  async getUpcomingMilestones(eventId: string, days: number = 7) {
    const res = await http.get<ApiResponse<Milestone[]>>(`/api/v1/events/${eventId}/timeline/upcoming?days=${days}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get upcoming milestones');
  },

  async getOverdueMilestones(eventId: string) {
    const res = await http.get<ApiResponse<Milestone[]>>(`/api/v1/events/${eventId}/timeline/overdue`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get overdue milestones');
  },

  // Timeline analytics and reporting
  async getTimelineAnalytics(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalMilestones: number;
      completedMilestones: number;
      inProgressMilestones: number;
      overdueMilestones: number;
      completionRate: number;
      averageCompletionTime: number;
      milestonesByStatus: Record<string, number>;
      milestonesByAssignee: Record<string, number>;
      completionTrends: Array<{
        date: string;
        completed: number;
        created: number;
      }>;
      performanceMetrics: {
        onTimeCompletion: number;
        delayedCompletion: number;
        averageDelay: number;
      };
    }>>(`/api/v1/events/${eventId}/timeline/analytics`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get timeline analytics');
  },

  // Timeline templates
  async getTimelineTemplates(category?: string) {
    const url = category ? `/api/v1/timeline-templates?category=${category}` : '/api/v1/timeline-templates';
    const res = await http.get<ApiResponse<Array<{
      templateId: string;
      name: string;
      description: string;
      category: string;
      milestones: Array<{
        title: string;
        description: string;
        daysFromStart: number;
        dependencies?: string[];
      }>;
    }>>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get timeline templates');
  },

  async createTimelineFromTemplate(eventId: string, templateId: string, startDate: string) {
    const res = await http.post<ApiResponse<Timeline>>(`/api/v1/events/${eventId}/timeline/from-template`, {
      templateId,
      startDate,
    });
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create timeline from template');
  },

  // Timeline notifications and alerts
  async getTimelineAlerts(eventId: string) {
    const res = await http.get<ApiResponse<Array<{
      alertId: string;
      milestoneId: string;
      type: 'upcoming' | 'overdue' | 'dependency_blocked';
      severity: 'low' | 'medium' | 'high';
      message: string;
      dueDate: string;
      createdAt: string;
    }>>>(`/api/v1/events/${eventId}/timeline/alerts`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get timeline alerts');
  },

  // Dependency management
  async addMilestoneDependency(milestoneId: string, dependencyMilestoneId: string) {
    const res = await http.post<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}/dependencies`, {
      dependencyMilestoneId,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to add milestone dependency');
  },

  async removeMilestoneDependency(milestoneId: string, dependencyMilestoneId: string) {
    const res = await http.delete<ApiResponse<Milestone>>(`/api/v1/milestones/${milestoneId}/dependencies/${dependencyMilestoneId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to remove milestone dependency');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/timeline/actuator/health');
    return res.data;
  },
};