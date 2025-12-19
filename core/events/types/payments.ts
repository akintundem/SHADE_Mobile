/**
 * Payment related types
 */

export type Payment = {
  paymentId: string;
  eventId: string;
  attendeeId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  processedAt?: string;
  refundedAt?: string;
  createdAt: string;
};
