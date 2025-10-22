/**
 * Communication related types
 */

export type Message = {
  messageId: string;
  eventId: string;
  senderId: string;
  recipientId?: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
};

export type CommunicationDTO = {
  id: string;
  eventId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  subject: string;
  content: string;
  recipients: string[];
  status: 'DRAFT' | 'SENT' | 'SCHEDULED' | 'FAILED';
  scheduledAt: string;
  sentAt?: string;
  templateId?: string;
  metadata?: Record<string, any>;
};

export type NotificationDTO = {
  id: string;
  eventId: string;
  type: 'EVENT_REMINDER' | 'REGISTRATION_CONFIRMATION' | 'CANCELLATION' | 'UPDATE';
  title: string;
  message: string;
  recipientId: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: string;
  metadata?: Record<string, any>;
};
