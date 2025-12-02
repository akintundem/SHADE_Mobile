/**
 * Timeline related types
 */

export type Timeline = {
  timelineId: string;
  eventId: string;
  title: string;
  description: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
};

export type TimelineDTO = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskDTO[];
  createdAt: string;
  updatedAt: string;
};

export type TaskDTO = {
  id: string;
  timelineId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  tags: string[];
  subtasks?: TaskDTO[];
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  milestoneId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
  dependencies?: string[];
  completedAt?: string;
};
