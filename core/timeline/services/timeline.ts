import { http } from '../../../common/services/httpClient';
import {
    TaskDetailResponse,
    ChecklistItemResponse,
    TaskAutoSaveRequest,
    ChecklistAutoSaveRequest,
} from '../types/timeline';

export const timelineService = {
    // ==================== TASK MANAGEMENT ====================

    /**
     * Get all tasks for an event
     * Retrieves all tasks for a specific event.
     * @param eventId - Event ID
     * @returns List of task detail responses
     */
    async getAllTasks(eventId: string): Promise<TaskDetailResponse[]> {
        const res = await http.get<TaskDetailResponse[]>(`/api/v1/events/${eventId}/tasks`);
        return res.data;
    },

    /**
     * Auto-save task draft
     * Creates or updates a task as draft. If id is null, creates new. If id is provided, updates existing.
     * @param eventId - Event ID
     * @param request - Task auto-save request
     * @returns Saved task detail response
     */
    async autoSaveTask(
        eventId: string,
        request: TaskAutoSaveRequest
    ): Promise<TaskDetailResponse> {
        const res = await http.patch<TaskDetailResponse>(
            `/api/v1/events/${eventId}/tasks/auto-save`,
            request
        );
        return res.data;
    },

    /**
     * Finalize task
     * Takes task out of draft or deletes if empty.
     * @param eventId - Event ID
     * @param taskId - Task ID
     * @param request - Task auto-save request with final data
     * @returns Finalized task detail response, or null if task was deleted
     */
    async finalizeTask(
        eventId: string,
        taskId: string,
        request: TaskAutoSaveRequest
    ): Promise<TaskDetailResponse | null> {
        const res = await http.put<TaskDetailResponse>(
            `/api/v1/events/${eventId}/tasks/${taskId}/finalize`,
            request
        );
        // If the response is 204 No Content, return null
        // Otherwise return the response data
        return res.data || null;
    },

    /**
     * Update tasks order
     * Updates the order of tasks for an event.
     * @param eventId - Event ID
     * @param taskIds - Ordered list of task IDs
     */
    async updateTaskOrder(eventId: string, taskIds: string[]): Promise<void> {
        await http.patch(`/api/v1/events/${eventId}/tasks/order`, taskIds);
    },

    /**
     * Delete task and its checklist
     * Deletes a task and all its associated checklist items.
     * @param eventId - Event ID
     * @param taskId - Task ID
     */
    async deleteTask(eventId: string, taskId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/tasks/${taskId}`);
    },

    // ==================== CHECKLIST MANAGEMENT ====================

    /**
     * Auto-save checklist item draft
     * Creates or updates a checklist item as draft. If id is null, creates new. If id is provided, updates existing.
     * @param taskId - Task ID
     * @param request - Checklist auto-save request
     * @returns Saved checklist item response
     */
    async autoSaveChecklistItem(
        taskId: string,
        request: ChecklistAutoSaveRequest
    ): Promise<ChecklistItemResponse> {
        const res = await http.patch<ChecklistItemResponse>(
            `/api/v1/tasks/${taskId}/checklist/auto-save`,
            request
        );
        return res.data;
    },

    /**
     * Finalize checklist item
     * Takes checklist item out of draft or deletes if empty.
     * @param taskId - Task ID
     * @param itemId - Checklist item ID
     * @param request - Checklist auto-save request with final data
     * @returns Finalized checklist item response, or null if item was deleted
     */
    async finalizeChecklistItem(
        taskId: string,
        itemId: string,
        request: ChecklistAutoSaveRequest
    ): Promise<ChecklistItemResponse | null> {
        const res = await http.put<ChecklistItemResponse>(
            `/api/v1/tasks/${taskId}/checklist/${itemId}/finalize`,
            request
        );
        // If the response is 204 No Content, return null
        // Otherwise return the response data
        return res.data || null;
    },

    /**
     * Update checklist items order
     * Updates the order of checklist items for a task.
     * @param taskId - Task ID
     * @param itemIds - Ordered list of checklist item IDs
     */
    async updateChecklistOrder(taskId: string, itemIds: string[]): Promise<void> {
        await http.patch(`/api/v1/tasks/${taskId}/checklist/order`, itemIds);
    },

    /**
     * Delete checklist item
     * Deletes a checklist item.
     * @param taskId - Task ID
     * @param itemId - Checklist item ID
     */
    async deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
        await http.delete(`/api/v1/tasks/${taskId}/checklist/${itemId}`);
    },
};

