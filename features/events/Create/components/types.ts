import { EventType } from '../../../../shared/types';

export type Venue = {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  googlePlaceData?: string;
};

export type StepProps = {
  onNext?: () => void;
  onBack?: () => void;
};

export type EventFormData = {
  title: string;
  description: string;
  selectedEventType: EventType | null;
  tags: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: Venue | null;
  isPublic: boolean;
  free: boolean;
  price: string;
  capacity: string;
  enableContrib: boolean;
};

