/**
 * Checkout UI types. Payment domain types (CardPaymentPayload, etc.) live in core/payment.
 */

import type { CardPaymentPayload } from '../../../core/payment/types';

export type { CardPaymentPayload, PaymentMethodId } from '../../../core/payment/types';

export type CardFormData = {
  /** Raw digits only (for validation). Never send full PAN to BE. */
  number: string;
  /** MM */
  expiryMonth: string;
  /** YY or YYYY */
  expiryYear: string;
  /** 3–4 digits. Never send to BE. */
  cvc: string;
  /** Cardholder name (optional). */
  name: string;
};

export type CardCheckoutModalProps = {
  visible: boolean;
  /** e.g. order total for display */
  amountLabel?: string;
  /** Called when user submits valid card. Payload is safe (last4, expiry only). */
  onPay: (payload: CardPaymentPayload) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  errorMessage?: string | null;
};
