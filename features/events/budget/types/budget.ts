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

export type BudgetDTO = {
  id: string;
  eventId: string;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  categories: Array<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type ExpenseDTO = {
  id: string;
  budgetId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  vendor?: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  date: string;
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
