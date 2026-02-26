import { http } from '../../../common/services/httpClient';
import {
    BudgetDetailResponse,
    BudgetCategoryResponse,
    BudgetLineItemResponse,
    UpdateBudgetRequest,
    BudgetLineItemAutoSaveRequest,
} from '../types/budget';

export const budgetService = {
    // ==================== CORE BUDGET CRUD ====================

    /**
     * Get event budget
     * Retrieves budget for a specific event. Creates a budget if one doesn't exist.
     * @param eventId - Event ID
     * @returns Budget detail response
     */
    async getBudget(eventId: string): Promise<BudgetDetailResponse> {
        const res = await http.get<BudgetDetailResponse>(`/api/v1/events/${eventId}/budget`);
        return res.data;
    },

    /**
     * Update budget details
     * Updates budget information including total budget, contingency percentage, currency, notes, and status.
     * Supports optimistic locking via If-Match header.
     * @param eventId - Event ID
     * @param request - Update budget request
     * @param ifMatch - Optional ETag for optimistic locking
     * @returns Updated budget detail response
     */
    async updateBudget(
        eventId: string,
        request: UpdateBudgetRequest,
        ifMatch?: string
    ): Promise<BudgetDetailResponse> {
        const headers: Record<string, string> = {};
        if (ifMatch) {
            headers['If-Match'] = ifMatch;
        }

        const res = await http.put<BudgetDetailResponse>(
            `/api/v1/events/${eventId}/budget`,
            request,
            { headers }
        );
        return res.data;
    },

    // ==================== CATEGORY MANAGEMENT ====================

    /**
     * Get all budget categories
     * Retrieves all categories for the event budget.
     * @param eventId - Event ID
     * @returns List of budget category responses
     */
    async getCategories(eventId: string): Promise<BudgetCategoryResponse[]> {
        const res = await http.get<BudgetCategoryResponse[]>(
            `/api/v1/events/${eventId}/budget/categories`
        );
        return res.data;
    },

    // ==================== LINE ITEM MANAGEMENT (EXPENSES) ====================

    /**
     * Auto-save expense draft
     * Creates or updates a line item as draft. If id is null, creates new. If id is provided, updates existing.
     * @param eventId - Event ID
     * @param request - Line item auto-save request
     * @returns Saved line item response
     */
    async autoSaveDraft(
        eventId: string,
        request: BudgetLineItemAutoSaveRequest
    ): Promise<BudgetLineItemResponse> {
        const res = await http.patch<BudgetLineItemResponse>(
            `/api/v1/events/${eventId}/budget/line-items/auto-save`,
            request
        );
        return res.data;
    },

    /**
     * Get all expenses (line items)
     * Retrieves all line items for the event budget.
     * @param eventId - Event ID
     * @returns List of budget line item responses
     */
    async getLineItems(eventId: string): Promise<BudgetLineItemResponse[]> {
        const res = await http.get<BudgetLineItemResponse[]>(
            `/api/v1/events/${eventId}/budget/line-items`
        );
        return res.data;
    },

    /**
     * Delete expense (line item)
     * Removes a line item from the budget.
     * @param eventId - Event ID
     * @param itemId - Line item ID
     */
    async deleteLineItem(eventId: string, itemId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/budget/line-items/${itemId}`);
    },

    /**
     * Finalize expense (line item)
     * Publishes a draft line item. Deletes the item if it has no content.
     * @param eventId - Event ID
     * @param itemId - Line item ID
     * @param request - Line item auto-save request with final data
     * @returns Finalized line item response, or null if item was deleted
     */
    async finalizeLineItem(
        eventId: string,
        itemId: string,
        request: BudgetLineItemAutoSaveRequest
    ): Promise<BudgetLineItemResponse | null> {
        const res = await http.put<BudgetLineItemResponse>(
            `/api/v1/events/${eventId}/budget/line-items/${itemId}/finalize`,
            request
        );
        // If the response is 204 No Content, return null
        // Otherwise return the response data
        return res.data || null;
    },
};

