import { http } from '../../../common/services/httpClient';
import { ApiResponse } from '../../auth/types/auth';
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
    // MOCK for local dev
    return {
      id: 'mock-budget-1',
      eventId: request.eventId,
      totalBudget: request.totalBudget,
      spentAmount: 0,
      remainingAmount: request.totalBudget,
      currency: 'USD',
      categories: request.categories.map((c, i) => ({
        id: `mock-cat-${i}`,
        name: c.name,
        allocatedAmount: c.allocatedAmount,
        spentAmount: 0,
        remainingAmount: c.allocatedAmount,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
  },

  async getBudget(budgetId: string) {
    // MOCK for local dev
    return {
      id: budgetId,
      eventId: 'mock-event-1',
      totalBudget: 10000,
      spentAmount: 6500,
      remainingAmount: 3500,
      currency: 'USD',
      categories: [
        { id: '1', name: 'Venue', allocatedAmount: 3000, spentAmount: 3000, remainingAmount: 0 },
        { id: '2', name: 'Catering', allocatedAmount: 2500, spentAmount: 1800, remainingAmount: 700 },
        { id: '3', name: 'Marketing', allocatedAmount: 1500, spentAmount: 1200, remainingAmount: 300 },
        { id: '4', name: 'Equipment', allocatedAmount: 2000, spentAmount: 500, remainingAmount: 1500 },
        { id: '5', name: 'Miscellaneous', allocatedAmount: 1000, spentAmount: 0, remainingAmount: 1000 }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    } as any;
  },

  async getBudgetByEvent(eventId: string) {
    // MOCK for local dev
    return this.getBudget('mock-budget-1');
  },

  async updateBudget(budgetId: string, updates: UpdateBudgetRequest) {
    // MOCK for local dev
    return {
      id: budgetId,
      eventId: 'mock-event-1',
      totalBudget: updates.totalBudget || 10000,
      spentAmount: 6500,
      remainingAmount: (updates.totalBudget || 10000) - 6500,
      currency: 'USD',
      categories: updates.categories?.map((c, i) => ({
        id: c.categoryId || `mock-cat-${i}`,
        name: c.name || 'Category',
        allocatedAmount: c.allocatedAmount || 1000,
        spentAmount: 0,
        remainingAmount: c.allocatedAmount || 1000
      })) || [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    } as any;
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
    // MOCK for local dev
    return {
      expenses: [
        {
          id: '1',
          budgetId: 'mock-budget-1',
          categoryId,
          categoryName: 'Category',
          description: 'Mock Expense 1',
          amount: 500,
          date: new Date().toISOString(),
          status: 'PAID'
        }
      ],
      total: 1,
      page: 0,
      size: 20
    } as any;
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
    // MOCK for local dev
    return {
      totalBudget: 10000,
      allocatedAmount: 10000,
      spentAmount: 6500,
      remainingAmount: 3500,
      utilizationPercentage: 65,
      categoryBreakdown: [
        { categoryId: '1', categoryName: 'Venue', allocatedAmount: 3000, spentAmount: 3000, remainingAmount: 0, utilizationPercentage: 100 },
        { categoryId: '2', categoryName: 'Catering', allocatedAmount: 2500, spentAmount: 1800, remainingAmount: 700, utilizationPercentage: 72 },
        { categoryId: '3', categoryName: 'Marketing', allocatedAmount: 1500, spentAmount: 1200, remainingAmount: 300, utilizationPercentage: 80 },
        { categoryId: '4', categoryName: 'Equipment', allocatedAmount: 2000, spentAmount: 500, remainingAmount: 1500, utilizationPercentage: 25 },
        { categoryId: '5', categoryName: 'Miscellaneous', allocatedAmount: 1000, spentAmount: 0, remainingAmount: 1000, utilizationPercentage: 0 }
      ],
      recentExpenses: [
        { id: '1', description: 'Grand Ballroom rental', amount: 3000, date: '2024-01-10T00:00:00Z', vendor: 'Grand Ballroom Inc.', status: 'PAID' },
        { id: '2', description: 'Catering service', amount: 1800, date: '2024-01-12T00:00:00Z', vendor: 'Elite Catering', status: 'PAID' },
        { id: '3', description: 'Social media advertising', amount: 800, date: '2024-01-14T00:00:00Z', vendor: 'Digital Ads Co.', status: 'PAID' }
      ],
      topVendors: [
        { vendor: 'Grand Ballroom Inc.', totalSpent: 3000, expenseCount: 1 },
        { vendor: 'Elite Catering', totalSpent: 1800, expenseCount: 1 }
      ],
    } as any;
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
