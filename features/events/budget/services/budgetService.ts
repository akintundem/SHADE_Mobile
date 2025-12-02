import { http } from '../../../../common/services/httpClient';
import { ApiResponse } from '../../../auth/types/auth';
import { Budget, BudgetCategory, Expense } from '../types/budget';

export type CreateBudgetRequest = {
  eventId: string;
  totalBudget: number;
  categories: Array<{
    name: string;
    allocatedAmount: number;
  }>;
};

export type CreateExpenseRequest = {
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  receiptUrl?: string;
};

export type UpdateBudgetRequest = {
  totalBudget?: number;
  categories?: Array<{
    categoryId?: string;
    name?: string;
    allocatedAmount?: number;
  }>;
};

export const budgetService = {
  // Budget CRUD operations
  async createBudget(request: CreateBudgetRequest) {
    const res = await http.post<ApiResponse<Budget>>('/api/v1/budgets', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create budget');
  },

  async getBudget(budgetId: string) {
    const res = await http.get<ApiResponse<Budget>>(`/api/v1/budgets/${budgetId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get budget');
  },

  async getBudgetByEvent(eventId: string) {
    const res = await http.get<ApiResponse<Budget>>(`/api/v1/events/${eventId}/budget`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event budget');
  },

  async updateBudget(budgetId: string, updates: UpdateBudgetRequest) {
    const res = await http.put<ApiResponse<Budget>>(`/api/v1/budgets/${budgetId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update budget');
  },

  async deleteBudget(budgetId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/budgets/${budgetId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete budget');
  },

  // Budget category management
  async addBudgetCategory(budgetId: string, category: { name: string; allocatedAmount: number }) {
    const res = await http.post<ApiResponse<BudgetCategory>>(`/api/v1/budgets/${budgetId}/categories`, category);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to add budget category');
  },

  async updateBudgetCategory(categoryId: string, updates: { name?: string; allocatedAmount?: number }) {
    const res = await http.put<ApiResponse<BudgetCategory>>(`/api/v1/budget-categories/${categoryId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update budget category');
  },

  async deleteBudgetCategory(categoryId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/budget-categories/${categoryId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete budget category');
  },

  // Expense management
  async createExpense(request: CreateExpenseRequest) {
    const res = await http.post<ApiResponse<Expense>>('/api/v1/expenses', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create expense');
  },

  async getExpense(expenseId: string) {
    const res = await http.get<ApiResponse<Expense>>(`/api/v1/expenses/${expenseId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get expense');
  },

  async updateExpense(expenseId: string, updates: Partial<CreateExpenseRequest>) {
    const res = await http.put<ApiResponse<Expense>>(`/api/v1/expenses/${expenseId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update expense');
  },

  async deleteExpense(expenseId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/expenses/${expenseId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete expense');
  },

  async getExpensesByCategory(categoryId: string, params?: {
    page?: number;
    size?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/budget-categories/${categoryId}/expenses?${queryString}` : `/api/v1/budget-categories/${categoryId}/expenses`;
    
    const res = await http.get<ApiResponse<{ expenses: Expense[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get expenses by category');
  },

  // Expense approval workflow
  async approveExpense(expenseId: string) {
    const res = await http.post<ApiResponse<Expense>>(`/api/v1/expenses/${expenseId}/approve`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to approve expense');
  },

  async rejectExpense(expenseId: string, reason: string) {
    const res = await http.post<ApiResponse<Expense>>(`/api/v1/expenses/${expenseId}/reject`, {
      reason,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to reject expense');
  },

  // Budget analytics and reporting
  async getBudgetSummary(budgetId: string) {
    const res = await http.get<ApiResponse<{
      totalBudget: number;
      allocatedAmount: number;
      spentAmount: number;
      remainingAmount: number;
      utilizationPercentage: number;
      categoryBreakdown: Array<{
        categoryId: string;
        categoryName: string;
        allocatedAmount: number;
        spentAmount: number;
        remainingAmount: number;
        utilizationPercentage: number;
      }>;
      recentExpenses: Expense[];
      topVendors: Array<{
        vendor: string;
        totalSpent: number;
        expenseCount: number;
      }>;
    }>>(`/api/v1/budgets/${budgetId}/summary`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get budget summary');
  },

  async getBudgetReports(eventId: string, reportType: 'summary' | 'detailed' | 'vendor' | 'category') {
    const res = await http.get<ApiResponse<any>>(`/api/v1/events/${eventId}/budget/reports?type=${reportType}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get budget reports');
  },

  async exportBudgetReport(budgetId: string, format: 'csv' | 'excel' | 'pdf') {
    const res = await http.get(`/api/v1/budgets/${budgetId}/export?format=${format}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Budget alerts and notifications
  async getBudgetAlerts(budgetId: string) {
    const res = await http.get<ApiResponse<Array<{
      alertId: string;
      type: 'over_budget' | 'approaching_limit' | 'unusual_spending';
      severity: 'low' | 'medium' | 'high';
      message: string;
      categoryId?: string;
      threshold?: number;
      currentValue?: number;
      createdAt: string;
    }>>>(`/api/v1/budgets/${budgetId}/alerts`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get budget alerts');
  },

  async setBudgetAlert(budgetId: string, alertConfig: {
    type: 'over_budget' | 'approaching_limit' | 'unusual_spending';
    threshold: number;
    categoryId?: string;
    enabled: boolean;
  }) {
    const res = await http.post<ApiResponse<{ alertId: string }>>(`/api/v1/budgets/${budgetId}/alerts`, alertConfig);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to set budget alert');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/budget/actuator/health');
    return res.data;
  },
};
