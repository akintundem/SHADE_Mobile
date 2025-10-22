/**
 * AI Assistant/Chat related types
 */

export type ChatRequest = {
  message: string;
  userId?: string;
  chatId?: string;
  context?: Record<string, any>;
  intent?: string;
  eventId?: string;
};

export type ShadeChatRequest = {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
  intent?: string;
  collectedData?: Record<string, any>;
};

export type VenueCardDTO = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  guestCapacity: string;
  priceRange: string;
  description: string;
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
  website: string;
};

export type ChipDTO = {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
  action: string;
};

export type EmailTemplateDTO = {
  id: string;
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  templateType: string;
  venueId: string;
};

export type ActionButtonDTO = {
  id: string;
  label: string;
  icon: string;
  action: string;
  style: string;
  disabled: boolean;
};

export type StructuredResponseDTO = {
  responseType: 'text' | 'venue_cards' | 'email_template' | 'chips' | 'mixed';
  text: string;
  venueCards?: VenueCardDTO[];
  emailCards?: EmailCardDTO[];
  approvalCards?: ApprovalCardDTO[];
  taskCards?: TaskCardDTO[];
  budgetCards?: BudgetCardDTO[];
  timelineCards?: TimelineCardDTO[];
  emailTemplate?: EmailTemplateDTO;
  chips?: ChipDTO[];
  actionButtons?: ActionButtonDTO[];
  metadata?: Record<string, any>;
};

export type AssistantChatResponse = {
  reply: string;
  toolUsed?: string;
  data?: Record<string, any>;
  showChips: boolean;
  chatId: string;
  userId: string;
  eventId?: string;
  ui?: Record<string, any>;
  structuredResponse?: StructuredResponseDTO;
  uitype: 'chat' | 'venue_cards' | 'email_template' | 'chips' | 'mixed';
  success: boolean;
  error?: string;
};

// Enhanced Chat Types for Interactive Components
export type ApprovalCardDTO = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approverName: string;
  approverEmail: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'budget' | 'venue' | 'vendor' | 'timeline' | 'other';
  attachments?: string[];
  comments?: string;
  metadata?: Record<string, any>;
};

export type EmailCardDTO = {
  id: string;
  toName: string;
  toEmail: string;
  subject: string;
  preview: string;
  status: 'draft' | 'sent' | 'scheduled' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  templateType: 'invitation' | 'reminder' | 'confirmation' | 'update' | 'custom';
  priority: 'low' | 'normal' | 'high';
  attachments?: string[];
  metadata?: Record<string, any>;
};

export type TaskCardDTO = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo: string;
  category: 'planning' | 'logistics' | 'marketing' | 'technical' | 'other';
  progress: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
};

export type BudgetCardDTO = {
  id: string;
  category: string;
  amount: number;
  currency: string;
  status: 'approved' | 'pending' | 'rejected';
  description: string;
  vendor: string;
  date: string;
  receiptUrl?: string;
  approvedBy?: string;
  metadata?: Record<string, any>;
};

export type TimelineCardDTO = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dependencies?: string[];
  progress: number;
  metadata?: Record<string, any>;
};
