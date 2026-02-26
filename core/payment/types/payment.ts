/**
 * Shared payment types used across checkout UI and payment API calls.
 * No PAN or CVV; only last4 and expiry for audit/display.
 */

/** Safe payload sent when completing a payment. No full card number, no CVV. */
export type CardPaymentPayload = {
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  /** Optional for display (e.g. "Visa •••• 4242"). */
  brand?: string;
};

export type PaymentMethodId = 'paypal' | 'card' | 'apple' | 'google';

/** Request body for completing a payment (e.g. ticket checkout). */
export type PaymentRequestPayload = {
  paymentMethod?: PaymentMethodId;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
};

/** Generic payment completion result. */
export type PaymentResult = {
  success: boolean;
  message?: string | null;
};
