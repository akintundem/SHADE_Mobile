/**
 * Budget related types
 */

export type Budget = {
  budgetId: string;
  eventId: string;
  totalBudget: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
};

export type BudgetCategory = {
  categoryId: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  expenses: Expense[];
};

export type Expense = {
  expenseId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
};
