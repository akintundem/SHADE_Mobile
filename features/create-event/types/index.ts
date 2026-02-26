import type { Asset } from 'react-native-image-picker';
import type { EventType } from '../../../core/events/types/event';
import type { EventUserType } from '../../../core/collaboration/types/collaboration';

export type CreateEventVenue = {
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

export type PendingCollaborator = {
  emailOrUsername: string;
  role: EventUserType;
};

export type CreateEventFormState = {
  title: string;
  description: string;
  selectedEventType: EventType | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: CreateEventVenue | null;
  locationSearchQuery: string;
  isPublic: boolean;
  free: boolean;
  price: string;
  capacity: string;
  enableContrib: boolean;
  contributionAmount: string;
  coverImage: Asset | null;
  pendingCollaborators: PendingCollaborator[];
};

export type CreateEventBanner = {
  type: 'warning' | 'error';
  message: string;
};

export type LocationSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  displayName: string;
  components: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
};

export type CreateEventFlowState = {
  currentStep: number;
  maxVisitedStep: number;
  maxReachableStep: number;
  canProceed: boolean;
  canCreate: boolean;
};

export type CreateEventStatusState = {
  isSubmitting: boolean;
  banner: CreateEventBanner | null;
};

export type CreateEventContextState = {
  form: CreateEventFormState;
  flow: CreateEventFlowState;
  status: CreateEventStatusState;
  validation: {
    getFieldError: (field: string) => string;
    validateField: (field: string, value: any) => string | null;
    setFieldTouched: (field: string) => void;
  };
};

export type CreateEventContextActions = {
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setSelectedEventType: (value: EventType | null) => void;
  setStartDate: (value: string) => void;
  setStartTime: (value: string) => void;
  setEndDate: (value: string) => void;
  setEndTime: (value: string) => void;
  setVenue: (value: CreateEventVenue | null) => void;
  setLocationSearchQuery: (value: string) => void;
  setIsPublic: (value: boolean) => void;
  setFree: (value: boolean) => void;
  setPrice: (value: string) => void;
  setCapacity: (value: string) => void;
  setEnableContrib: (value: boolean) => void;
  setContributionAmount: (value: string) => void;
  setCoverImage: (value: Asset | null) => void;
  addCollaborator: (collab: PendingCollaborator) => void;
  removeCollaborator: (index: number) => void;
  clearBanner: () => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  submit: () => Promise<void>;
  close: () => void;
};

export type CreateEventContextValue = CreateEventContextState & {
  actions: CreateEventContextActions;
};
