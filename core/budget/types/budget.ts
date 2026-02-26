/**
 * Budget related types
 */

// Base Enums
export enum PlanningStatus {
    PLANNED = 'PLANNED',
    QUOTED = 'QUOTED',
    BOOKED = 'BOOKED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    ON_HOLD = 'ON_HOLD',
  }
  
  export enum BudgetStatus {
    DRAFT = 'DRAFT',
    PLANNING = 'PLANNING',
    APPROVED = 'APPROVED',
    ACTIVE = 'ACTIVE',
    LOCKED = 'LOCKED',
    ARCHIVED = 'ARCHIVED',
  }
  
  // Budget Response Types
  export type BudgetDetailResponse = {
    id: string; // UUID
    eventId: string; // UUID
    totalBudget: number; // BigDecimal as number
    currency?: string | null; // ISO currency code (e.g., "USD"), default: "USD"
    contingencyPercentage?: number | null; // BigDecimal as number, default: 10.00
    contingencyAmount?: number | null; // BigDecimal as number
    totalEstimated?: number | null; // BigDecimal as number
    totalActual?: number | null; // BigDecimal as number
    variance?: number | null; // BigDecimal as number
    variancePercentage?: number | null; // BigDecimal as number
    budgetStatus?: string | null; // Budget status string, default: "DRAFT"
    notes?: string | null; // Text notes
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
    categories?: BudgetCategoryResponse[] | null; // List of budget categories
  };
  
  // Budget Category Response Types
  export type BudgetCategoryResponse = {
    id: string; // UUID
    budgetId: string; // UUID
    name: string; // Category name (e.g., "Marketing", "Catering", "Venue & Facilities")
    description?: string | null; // Description of what this category covers
    allocatedAmount: number; // BigDecimal as number - allocated budget amount for this category
    totalEstimated?: number | null; // BigDecimal as number - total estimated cost from all line items
    totalActual?: number | null; // BigDecimal as number - total actual cost from all line items
    remaining?: number | null; // BigDecimal as number - remaining budget (allocatedAmount - totalActual)
    displayOrder?: number | null; // Display order for sorting categories
    lineItemCount?: number | null; // Number of line items in this category
    lineItems?: BudgetLineItemResponse[] | null; // List of line items within this category
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
  };
  
  // Budget Line Item Response Types (Expenses)
  export type BudgetLineItemResponse = {
    id: string; // UUID
    budgetId: string; // UUID
    budgetCategoryId: string; // UUID
    budgetCategoryName?: string | null; // Category name for display
    subcategory?: string | null; // Subcategory name
    description?: string | null; // Line item description
    estimatedCost?: number | null; // BigDecimal as number - estimated cost
    actualCost?: number | null; // BigDecimal as number - actual cost
    variance?: number | null; // BigDecimal as number - variance (actualCost - estimatedCost)
    variancePercentage?: number | null; // BigDecimal as number - variance percentage
    quantity?: number | null; // Quantity of items
    unitCost?: number | null; // BigDecimal as number - cost per unit
    planningStatus?: PlanningStatus | null; // Planning status enum
    isEssential?: boolean | null; // Whether this item is essential
    priority?: string | null; // Priority level (e.g., "HIGH", "MEDIUM", "LOW")
    notes?: string | null; // Additional notes
    isDraft?: boolean | null; // Whether this is a draft line item
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
  };
  
  // Budget Request Types
  export type UpdateBudgetRequest = {
    totalBudget: number; // Required, BigDecimal as number, must be greater than 0
    contingencyPercentage?: number | null; // BigDecimal as number, must be non-negative, max 50.0
    currency?: string | null; // ISO currency code
    notes?: string | null; // Text notes
    budgetStatus?: string | null; // Budget status string
  };
  
  // Budget Line Item Request Types
  export type BudgetLineItemAutoSaveRequest = {
    id?: string | null; // UUID - Optional, if provided updates existing, if null creates new
    budgetCategoryId?: string | null; // UUID - Required for creation, optional for updates
    categoryName?: string | null; // Used for imports when ID is not known
    subcategory?: string | null; // Subcategory name
    description?: string | null; // Line item description
    estimatedCost?: number | null; // BigDecimal as number, must be non-negative
    actualCost?: number | null; // BigDecimal as number, must be non-negative
    quantity?: number | null; // Must be at least 1
    unitCost?: number | null; // BigDecimal as number, must be non-negative
    planningStatus?: PlanningStatus | null; // Planning status enum
    isEssential?: boolean | null; // Whether this item is essential
    priority?: string | null; // Priority level
    notes?: string | null; // Additional notes
  };
  
  // Bulk Line Item Request Types
  export type BulkLineItemRequest = {
    budgetId: string; // UUID
    lineItems: BudgetLineItemAutoSaveRequest[]; // Required, non-empty list of line items
  };
  
  // Paginated Response Types
  export type PaginatedBudgetResponse = {
    content: BudgetDetailResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  export type PaginatedBudgetCategoryResponse = {
    content: BudgetCategoryResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  export type PaginatedBudgetLineItemResponse = {
    content: BudgetLineItemResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };