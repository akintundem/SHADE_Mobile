import { http } from '../../../common/services/httpClient';
import type { CardPaymentPayload, PaymentRequestPayload, PaymentResult } from '../types';

/**
 * Complete payment for a ticket checkout.
 * Calls the ticket checkout payment endpoint; use when in-app payment is enabled.
 */
export async function completeTicketCheckoutPayment(
  eventId: string,
  checkoutId: string,
  payload?: CardPaymentPayload | null
): Promise<PaymentResult> {
  const body: PaymentRequestPayload | undefined = payload
    ? {
        paymentMethod: 'card',
        last4: payload.last4,
        expiryMonth: payload.expiryMonth,
        expiryYear: payload.expiryYear,
      }
    : undefined;
  const res = await http.post<PaymentResult>(
    `/api/v1/events/${eventId}/tickets/checkout/${checkoutId}/fake-payment`,
    body
  );
  return res.data;
}

export const paymentService = {
  completeTicketCheckoutPayment,
};
