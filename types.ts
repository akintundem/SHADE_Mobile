export type User = {
  id: string;
  email: string;
  name?: string;
  provider?: 'password' | 'spotify';
};

// API Response Types
export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T | null;
};

// Auth Types
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  clientId?: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

// Event Types
export type Event = {
  eventId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: Location;
  organizerId: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  capacity?: number;
  price?: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Location = {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
};

export type CreateEventRequest = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: Location;
  capacity?: number;
  price?: number;
  category: string;
  tags: string[];
  imageUrl?: string;
};

// Vendor Types
export type Vendor = {
  vendorId: string;
  name: string;
  description: string;
  category: string;
  location: Location;
  contactInfo: ContactInfo;
  rating: number;
  priceRange: string;
  availability: string[];
  services: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  website?: string;
  socialMedia?: Record<string, string>;
};

// Attendee Types
export type Attendee = {
  attendeeId: string;
  eventId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  registrationDate: string;
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended';
  dietaryRestrictions?: string[];
  emergencyContact?: EmergencyContact;
  ticketType?: string;
  notes?: string;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

// Budget Types
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

// Communication Types
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

// Risk Types
export type Risk = {
  riskId: string;
  eventId: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'assessed' | 'mitigated' | 'resolved';
  mitigationPlan?: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

// Timeline Types
export type Timeline = {
  timelineId: string;
  eventId: string;
  title: string;
  description: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  milestoneId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
  dependencies?: string[];
  completedAt?: string;
};

// Payment Types
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

// Weather Types
export type WeatherData = {
  location: Location;
  current: CurrentWeather;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
};

export type CurrentWeather = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  icon: string;
  timestamp: string;
};

export type WeatherForecast = {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
};

export type WeatherAlert = {
  alertId: string;
  eventId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: Location;
  thresholds: WeatherThresholds;
  notificationSettings: NotificationSettings;
  status: 'active' | 'inactive' | 'expired';
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type WeatherThresholds = {
  temperature?: { min: number; max: number };
  precipitation?: { max: number };
  windSpeed?: { max: number };
};

export type NotificationSettings = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

