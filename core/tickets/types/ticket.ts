/**
 * Ticket related types
 */

// ==================== Enums ====================

export enum TicketStatus {
    PENDING = 'PENDING',
    ISSUED = 'ISSUED',
    VALIDATED = 'VALIDATED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export enum BulkTicketAction {
    CANCEL = 'CANCEL',
    REFUND = 'REFUND',
    RESEND = 'RESEND',
}

export enum TicketApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export enum TicketWaitlistStatus {
    WAITING = 'WAITING',
    FULFILLED = 'FULFILLED',
    CANCELLED = 'CANCELLED',
}

export enum TicketTypeCategory {
    GENERAL_ADMISSION = 'GENERAL_ADMISSION',
    VIP = 'VIP',
    EARLY_BIRD = 'EARLY_BIRD',
    STUDENT = 'STUDENT',
    SENIOR = 'SENIOR',
    CHILD = 'CHILD',
    GROUP = 'GROUP',
    PREMIUM = 'PREMIUM',
    BACKSTAGE = 'BACKSTAGE',
    MEET_AND_GREET = 'MEET_AND_GREET',
    ALL_ACCESS = 'ALL_ACCESS',
    SINGLE_DAY = 'SINGLE_DAY',
    WEEKEND_PASS = 'WEEKEND_PASS',
    SEASON_PASS = 'SEASON_PASS',
    STANDING_ROOM = 'STANDING_ROOM',
    RESERVED_SEATING = 'RESERVED_SEATING',
    OTHER = 'OTHER',
}

// ==================== Ticket Response Types ====================

export type TicketResponse = {
    id: string; // UUID
    ticketNumber: string;
    eventId: string; // UUID
    eventName?: string | null;
    checkoutId?: string | null;
    ticketTypeId: string; // UUID
    ticketTypeName?: string | null;
    attendeeId?: string | null; // UUID
    attendeeName?: string | null;
    attendeeEmail?: string | null;
    status: TicketStatus;
    qrCodeData?: string | null;
    pendingAt?: string | null; // ISO datetime
    pendingExpirationTime?: string | null; // ISO datetime
    issuedAt?: string | null; // ISO datetime
    validatedAt?: string | null; // ISO datetime
    canBeValidated?: boolean | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

export type TicketValidationResponse = {
    valid: boolean;
    ticket?: TicketResponse | null;
    message?: string | null;
    errorCode?: string | null; // e.g., INVALID_CODE, ALREADY_VALIDATED, CANCELLED, EXPIRED
};

export type TicketWalletResponse = {
    available?: boolean | null;
    ticketNumber?: string | null;
    ticketTypeName?: string | null;
    eventName?: string | null;
    eventStartDateTime?: string | null; // ISO datetime
    eventEndDateTime?: string | null; // ISO datetime
    venueAddress?: string | null;
    venueCity?: string | null;
    venueState?: string | null;
    venueCountry?: string | null;
    barcodeMessage?: string | null;
};

// ==================== Ticket Action Types ====================

export type UpdateTicketRequest = {
    ownerEmail?: string | null;
    ownerName?: string | null;
};

export type TransferTicketRequest = {
    newAttendeeId?: string | null; // UUID
    newOwnerEmail?: string | null;
    newOwnerName?: string | null;
    sendEmail?: boolean | null;
    sendPush?: boolean | null;
};

export type ResendTicketRequest = {
    sendEmail?: boolean | null;
    sendPush?: boolean | null;
};

export type BulkTicketActionRequest = {
    eventId: string; // UUID
    action: BulkTicketAction;
    ticketIds: string[]; // UUIDs
    reason?: string | null;
    sendEmail?: boolean | null;
    sendPush?: boolean | null;
};

export type BulkTicketActionResult = {
    ticketId: string; // UUID
    success: boolean;
    message?: string | null;
    status?: TicketStatus | null;
};

export type BulkTicketActionResponse = {
    eventId: string; // UUID
    action: BulkTicketAction;
    total: number;
    successCount: number;
    failureCount: number;
    results: BulkTicketActionResult[];
};

// ==================== Promotions ====================

export type TicketPromotion = {
    code: string;
    percentOffBasisPoints?: number | null;
    amountOffMinor?: number | null;
    startsAt?: string | null; // ISO datetime
    endsAt?: string | null; // ISO datetime
    active?: boolean | null;
};

export type TicketPromotionRequest = {
    code: string;
    percentOffBasisPoints?: number | null;
    amountOffMinor?: number | null;
    startsAt?: string | null; // ISO datetime
    endsAt?: string | null; // ISO datetime
    active?: boolean | null;
};

// ==================== Pricing Tier Types ====================

export type TicketPriceTierRequest = {
    name?: string | null; // Max 120 characters
    startsAt?: string | null; // ISO datetime
    endsAt?: string | null; // ISO datetime
    priceMinor?: number | null;
    priority?: number | null; // Default: 0
};

export type TicketPriceTierResponse = {
    id: string; // UUID
    name?: string | null;
    startsAt?: string | null; // ISO datetime
    endsAt?: string | null; // ISO datetime
    priceMinor?: number | null;
    priority?: number | null;
};

// ==================== Ticket Type Dependency Types ====================

export type TicketTypeDependencyRequest = {
    requiredTicketTypeId: string; // UUID
    minQuantity?: number | null; // Default: 1
};

export type TicketTypeDependencyResponse = {
    id: string; // UUID
    requiredTicketTypeId?: string | null; // UUID
    requiredTicketTypeName?: string | null;
    minQuantity?: number | null;
};

// ==================== Ticket Type Response Types ====================

export type TicketTypeResponse = {
    id: string; // UUID
    eventId: string; // UUID
    name: string;
    category?: TicketTypeCategory | null;
    description?: string | null;
    priceMinor?: number | null; // Price in smallest currency unit (e.g., cents); null for free tickets
    currency?: string | null; // ISO 4217 currency code (e.g., "USD", "EUR", "GBP")
    quantityAvailable: number;
    quantitySold?: number | null;
    quantityReserved?: number | null;
    quantityRemaining?: number | null; // Computed: available - sold - reserved
    isActive?: boolean | null;
    saleStartDate?: string | null; // ISO datetime
    saleEndDate?: string | null; // ISO datetime
    isOnSale?: boolean | null; // Computed: checks if currently on sale
    maxTicketsPerPerson?: number | null;
    requiresApproval?: boolean | null;
    earlyBirdPriceMinor?: number | null;
    earlyBirdEndDate?: string | null; // ISO datetime
    groupDiscountMinQuantity?: number | null;
    groupDiscountPercentBps?: number | null;
    priceTiers?: TicketPriceTierResponse[] | null;
    dependencies?: TicketTypeDependencyResponse[] | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

// Ticket type summary for event responses (simplified version included in EventResponse)
export type TicketTypeSummary = {
    id: string;
    name: string;
    category?: TicketTypeCategory | null;
    description?: string | null;
    priceMinor?: number | null;
    currency?: string | null;
    isFree?: boolean | null;
    quantityTotal?: number | null;
    quantityRemaining?: number | null;
    quantitySold?: number | null;
    isAvailable?: boolean | null;
    isActive?: boolean | null;
    isOnSale?: boolean | null;
    saleStartDate?: string | null;
    saleEndDate?: string | null;
    maxPerPerson?: number | null;
    requiresApproval?: boolean | null;
    statusMessage?: string | null;
};

// ==================== Ticket Request Types ====================

export type IssueTicketRequest = {
    eventId: string; // UUID, required
    ticketTypeId: string; // UUID, required
    attendeeId?: string | null; // UUID, optional - use for registered attendees
    ownerEmail?: string | null; // Required if attendeeId is not provided
    ownerName?: string | null; // Required if attendeeId is not provided
    quantity: number; // Required, min: 1, max: 50
    sendEmail?: boolean | null; // Send email notification to attendee
    sendPushNotification?: boolean | null; // Send push notification (requires user account)
};

export type ValidateTicketRequest = {
    qrCodeData: string; // Required
    eventId: string; // UUID, required for validation context
};

// ==================== Ticket Type Request Types ====================

export type CreateTicketTypeRequest = {
    name: string; // Required, min: 1, max: 100 characters
    category?: TicketTypeCategory | null;
    description?: string | null; // Max: 2000 characters
    priceMinor?: number | null; // Price in smallest currency unit, null for free tickets
    currency?: string | null; // ISO 4217 currency code (uppercase), default: "USD"
    quantityAvailable: number; // Required, min: 0, max: 1,000,000
    saleStartDate?: string | null; // ISO datetime
    saleEndDate?: string | null; // ISO datetime
    maxTicketsPerPerson?: number | null; // min: 0 (use default), max: 100
    requiresApproval?: boolean | null; // default: false
    earlyBirdPriceMinor?: number | null;
    earlyBirdEndDate?: string | null; // ISO datetime
    groupDiscountMinQuantity?: number | null;
    groupDiscountPercentBps?: number | null;
    promotions?: TicketPromotionRequest[] | null;
    priceTiers?: TicketPriceTierRequest[] | null;
    dependencies?: TicketTypeDependencyRequest[] | null;
    metadata?: Record<string, unknown> | null;
};

export type UpdateTicketTypeRequest = {
    name?: string | null; // min: 1, max: 100 characters
    category?: TicketTypeCategory | null;
    description?: string | null; // Max: 2000 characters
    priceMinor?: number | null; // Price in smallest currency unit, null for free tickets
    currency?: string | null; // ISO 4217 currency code (uppercase)
    quantityAvailable?: number | null; // min: 0, max: 1,000,000
    saleStartDate?: string | null; // ISO datetime
    saleEndDate?: string | null; // ISO datetime
    maxTicketsPerPerson?: number | null; // min: 0 (use default), max: 100
    isActive?: boolean | null;
    requiresApproval?: boolean | null;
    earlyBirdPriceMinor?: number | null;
    earlyBirdEndDate?: string | null; // ISO datetime
    groupDiscountMinQuantity?: number | null;
    groupDiscountPercentBps?: number | null;
    promotions?: TicketPromotionRequest[] | null;
    priceTiers?: TicketPriceTierRequest[] | null;
    dependencies?: TicketTypeDependencyRequest[] | null;
    metadata?: Record<string, unknown> | null;
};

export type CloneTicketTypeRequest = {
    name?: string | null;
    isActive?: boolean | null;
};

// ==================== Ticket Type Template Types ====================

export type CreateTicketTypeTemplateRequest = {
    name: string; // Required, min: 1, max: 100 characters
    category?: TicketTypeCategory | null;
    description?: string | null; // Max: 2000 characters
    priceMinor?: number | null;
    currency?: string | null; // ISO 4217 currency code (uppercase), default: "USD"
    quantityAvailable: number; // Required, min: 0, max: 1,000,000
    saleStartDate?: string | null; // ISO datetime
    saleEndDate?: string | null; // ISO datetime
    maxTicketsPerPerson?: number | null;
    requiresApproval?: boolean | null;
    earlyBirdPriceMinor?: number | null;
    earlyBirdEndDate?: string | null; // ISO datetime
    groupDiscountMinQuantity?: number | null;
    groupDiscountPercentBps?: number | null;
    metadata?: Record<string, unknown> | null;
};

export type UpdateTicketTypeTemplateRequest = {
    name?: string | null;
    category?: TicketTypeCategory | null;
    description?: string | null;
    priceMinor?: number | null;
    currency?: string | null;
    quantityAvailable?: number | null;
    saleStartDate?: string | null; // ISO datetime
    saleEndDate?: string | null; // ISO datetime
    maxTicketsPerPerson?: number | null;
    requiresApproval?: boolean | null;
    earlyBirdPriceMinor?: number | null;
    earlyBirdEndDate?: string | null; // ISO datetime
    groupDiscountMinQuantity?: number | null;
    groupDiscountPercentBps?: number | null;
    metadata?: Record<string, unknown> | null;
};

export type ApplyTicketTypeTemplateRequest = {
    name?: string | null; // Overrides template name for created ticket type
    isActive?: boolean | null;
};

export type TicketTypeTemplateResponse = {
    id: string; // UUID
    name: string;
    category?: TicketTypeCategory | null;
    description?: string | null;
    priceMinor?: number | null;
    currency?: string | null;
    quantityAvailable?: number | null;
    saleStartDate?: string | null; // ISO datetime
    saleEndDate?: string | null; // ISO datetime
    maxTicketsPerPerson?: number | null;
    requiresApproval?: boolean | null;
    earlyBirdPriceMinor?: number | null;
    earlyBirdEndDate?: string | null; // ISO datetime
    groupDiscountMinQuantity?: number | null;
    groupDiscountPercentBps?: number | null;
    createdBy?: string | null; // UUID
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

// ==================== Paginated Response Types ====================

export type PaginatedTicketResponse = {
    content: TicketResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

export type PaginatedTicketApprovalRequestResponse = {
    content: TicketApprovalRequestResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

export type PaginatedTicketWaitlistEntryResponse = {
    content: TicketWaitlistEntryResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

// ==================== Ticket Checkout Types ====================

export type TicketCheckoutItemRequest = {
    ticketTypeId: string;
    quantity: number; // max 50 per ticket type
};

export type TicketCheckoutRequest = {
    items: TicketCheckoutItemRequest[];
    promotionCode?: string | null;
};

export enum TicketCheckoutStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export type TicketCheckoutCost = {
    currency: string;
    subtotalMinor: number;
    feesMinor: number;
    taxMinor: number;
    discountMinor: number;
    totalMinor: number;
};

export type TicketCheckoutItemResponse = {
    ticketTypeId: string;
    ticketTypeName: string;
    quantity: number;
    unitPriceMinor: number;
    subtotalMinor: number;
    currency: string;
};

export type TicketCheckoutResponse = {
    id: string;
    eventId: string;
    eventName?: string | null;
    status: TicketCheckoutStatus;
    completedAt?: string | null; // ISO datetime
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
    cost: TicketCheckoutCost;
    items: TicketCheckoutItemResponse[];
    tickets?: TicketResponse[] | null;
};

export type TicketPaymentInitResponse = {
    paymentUrl?: string | null;
    checkoutId?: string | null;
    message?: string | null;
};

// ==================== Ticket Approval Types ====================

export type CreateTicketApprovalRequest = {
    ticketTypeId: string; // UUID
    quantity: number;
};

export type TicketApprovalDecisionRequest = {
    note?: string | null;
    sendEmail?: boolean | null;
    sendPush?: boolean | null;
};

export type TicketApprovalRequestResponse = {
    id: string; // UUID
    eventId?: string | null; // UUID
    ticketTypeId?: string | null; // UUID
    ticketTypeName?: string | null;
    requesterUserId?: string | null; // UUID
    requesterEmail?: string | null;
    requesterName?: string | null;
    status: TicketApprovalStatus;
    quantity?: number | null;
    decidedBy?: string | null; // UUID
    decidedAt?: string | null; // ISO datetime
    decisionNote?: string | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

// ==================== Ticket Waitlist Types ====================

export type CreateTicketWaitlistRequest = {
    ticketTypeId: string; // UUID
    quantity: number;
};

export type TicketWaitlistFulfillRequest = {
    sendEmail?: boolean | null;
    sendPush?: boolean | null;
};

export type TicketWaitlistEntryResponse = {
    id: string; // UUID
    eventId?: string | null; // UUID
    ticketTypeId?: string | null; // UUID
    ticketTypeName?: string | null;
    requesterUserId?: string | null; // UUID
    requesterEmail?: string | null;
    requesterName?: string | null;
    status: TicketWaitlistStatus;
    quantity?: number | null;
    fulfilledBy?: string | null; // UUID
    fulfilledAt?: string | null; // ISO datetime
    cancelledAt?: string | null; // ISO datetime
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};
