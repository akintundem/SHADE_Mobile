/**
 * Timeline related types
 */

// Base Enums
export enum TimelineStatus {
    PENDING = 'PENDING',
    TO_DO = 'TO_DO',
    ACTIVE = 'ACTIVE',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED',
    POSTPONED = 'POSTPONED',
    OVERDUE = 'OVERDUE',
  }
  
  // Checklist Item Response Types
  export type ChecklistItemResponse = {
    id: string; // UUID
    title: string; // Checklist item title
    description?: string | null; // Checklist item description
    dueDate?: string | null; // ISO datetime - due date
    status?: TimelineStatus | null; // Status, default: PENDING
    assignedTo?: string | null; // UUID - Assigned user ID
    assignedToName?: string | null; // Assigned user name
    taskOrder?: number | null; // Order among subtasks
    isDraft?: boolean | null; // Whether this is a draft item, default: true
  };
  
  // Task Response Types
  export type TaskDetailResponse = {
    id: string; // UUID
    title: string; // Task title
    description?: string | null; // Task description
    startDate?: string | null; // ISO datetime - task start date
    dueDate?: string | null; // ISO datetime - task due date
    priority?: string | null; // Priority level (e.g., "LOW", "MEDIUM", "HIGH"), default: "MEDIUM"
    category?: string | null; // Task category
    status?: TimelineStatus | null; // Task status, default: PENDING
    progressPercentage?: number | null; // Progress percentage (0-100), default: 0
    assignedTo?: string | null; // UUID - User ID assigned to this task
    assignedToName?: string | null; // Assigned user name
    taskOrder?: number | null; // Order of this task
    completedSubtasksCount?: number | null; // Number of completed subtasks, default: 0
    totalSubtasksCount?: number | null; // Total number of subtasks, default: 0
    isDraft?: boolean | null; // Whether this is a draft task, default: true
    checklist?: ChecklistItemResponse[] | null; // List of checklist items
  };
  
  // Task Request Types
  export type TaskAutoSaveRequest = {
    id?: string | null; // UUID - Task ID (null for new task)
    title?: string | null; // Task title, max 255 characters
    description?: string | null; // Task description, max 2000 characters
    startDate?: string | null; // ISO datetime - task start date
    dueDate?: string | null; // ISO datetime - task due date
    priority?: string | null; // Priority level
    category?: string | null; // Task category
    assignedTo?: string | null; // UUID - User ID assigned to this task
    status?: TimelineStatus | null; // Task status
    taskOrder?: number | null; // Order of this task
  };
  
  // Checklist Request Types
  export type ChecklistAutoSaveRequest = {
    id?: string | null; // UUID - Checklist item ID (null for new item)
    title?: string | null; // Checklist item title, max 255 characters
    description?: string | null; // Checklist item description, max 2000 characters
    dueDate?: string | null; // ISO datetime - due date
    assignedTo?: string | null; // UUID - Assigned user ID
    status?: TimelineStatus | null; // Status
    taskOrder?: number | null; // Order among subtasks
  };
  