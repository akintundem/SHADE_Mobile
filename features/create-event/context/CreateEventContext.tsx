import 'react-native-get-random-values';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { eventService } from '../../../core/events/services/event';
import { collaborationService } from '../../../core/collaboration/services/collaboration';
import { EventUserType } from '../../../core/collaboration/types/collaboration';
import { STEPS } from '../../../core/events/constants';
import { createEventValidator, useFormValidation } from '../../../common/utils/formValidation';
import { useI18n } from '../../../common/i18n/I18nProvider';
import type {
  CreateEventContextValue,
  CreateEventFormState,
  PendingCollaborator,
} from '../types';
import { buildCreateEventPayload, uploadEventCoverImage } from '../utils';

const initialFormState: CreateEventFormState = {
  title: '',
  description: '',
  selectedEventType: null,
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  venue: null,
  locationSearchQuery: '',
  isPublic: true,
  free: true,
  price: '',
  capacity: '',
  enableContrib: false,
  contributionAmount: '',
  coverImage: null,
  pendingCollaborators: [],
};

type FormAction =
  | { type: 'SET_FIELD'; field: keyof CreateEventFormState; value: any }
  | { type: 'SET_FORM'; payload: Partial<CreateEventFormState> }
  | { type: 'RESET' };

function formReducer(state: CreateEventFormState, action: FormAction): CreateEventFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'SET_FORM':
      return {
        ...state,
        ...action.payload,
      };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

type CreateEventProviderProps = {
  children: React.ReactNode;
  onClose: () => void;
  onCreate?: () => void;
};

const CreateEventContext = createContext<CreateEventContextValue | null>(null);

export function CreateEventProvider({ children, onClose, onCreate }: CreateEventProviderProps) {
  const { t } = useI18n();
  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [currentStep, setCurrentStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<{
    type: 'warning' | 'error';
    message: string;
  } | null>(null);
  const idempotencyKeyRef = useRef<string>(uuidv4());

  const validation = useFormValidation(createEventValidator);

  const validationData = useMemo(() => ({
    title: form.title,
    description: form.description,
    startDate: form.startDate,
    startTime: form.startTime,
    endDate: form.endDate,
    endTime: form.endTime,
    location: form.venue?.address || '',
    capacity: form.capacity || undefined,
    price: form.free ? undefined : form.price,
  }), [
    form.title,
    form.description,
    form.startDate,
    form.startTime,
    form.endDate,
    form.endTime,
    form.venue,
    form.capacity,
    form.price,
    form.free,
  ]);

  const validationResult = useMemo(
    () => createEventValidator.validateForm(validationData),
    [validationData],
  );

  const stepValidity = useMemo(() => ([
    form.title.trim().length >= 3 && form.description.trim().length >= 10,
    form.selectedEventType !== null,
    Boolean(form.startDate && form.startTime),
    Boolean(form.venue?.address),
    form.free || Boolean(form.price && Number(form.price) > 0),
    true,
    validationResult.isValid,
  ]), [
    form.title,
    form.description,
    form.selectedEventType,
    form.startDate,
    form.startTime,
    form.venue,
    form.free,
    form.price,
    validationResult.isValid,
  ]);

  const maxValidStep = useMemo(() => {
    let max = 0;
    for (let index = 0; index < stepValidity.length; index += 1) {
      if (!stepValidity[index]) {
        break;
      }
      max = index + 1;
    }
    return Math.min(max, STEPS.length - 1);
  }, [stepValidity]);

  const maxReachableStep = Math.min(maxVisitedStep, maxValidStep);
  const canProceed = stepValidity[currentStep] ?? false;
  const canCreate = validationResult.isValid && !isSubmitting;

  useEffect(() => {
    if (currentStep > maxReachableStep) {
      setCurrentStep(maxReachableStep);
    }
  }, [currentStep, maxReachableStep]);

  const setField = useCallback(
    <K extends keyof CreateEventFormState>(field: K, value: CreateEventFormState[K]) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    [],
  );

  const goNext = useCallback(() => {
    if (!canProceed || currentStep >= STEPS.length - 1) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setMaxVisitedStep(prev => Math.max(prev, nextStep));
  }, [canProceed, currentStep]);

  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step < 0 || step > maxReachableStep) return;
    setCurrentStep(step);
  }, [maxReachableStep]);

  const clearBanner = useCallback(() => {
    setBanner(null);
  }, []);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const addCollaborator = useCallback((collab: PendingCollaborator) => {
    dispatch({
      type: 'SET_FIELD',
      field: 'pendingCollaborators',
      value: [...form.pendingCollaborators, collab],
    });
  }, [form.pendingCollaborators]);

  const removeCollaborator = useCallback((index: number) => {
    dispatch({
      type: 'SET_FIELD',
      field: 'pendingCollaborators',
      value: form.pendingCollaborators.filter((_, i) => i !== index),
    });
  }, [form.pendingCollaborators]);

  const submit = useCallback(async () => {
    if (!canCreate) return;

    setIsSubmitting(true);
    setBanner(null);

    try {
      const idempotencyKey = idempotencyKeyRef.current;
      const eventData = buildCreateEventPayload(form);

      const createdEvent = await eventService.createEvent(eventData, idempotencyKey);

      idempotencyKeyRef.current = uuidv4();

      if (form.coverImage?.uri) {
        try {
          await uploadEventCoverImage(createdEvent.id, form.coverImage);
        } catch (imageError: unknown) {
          if (__DEV__) {
            console.error('[CreateEvent] Cover image upload failed:', imageError);
          }
          setBanner({
            type: 'warning',
            message: t('ImageUploadFailedMessage'),
          });
        }
      }

      // Send collaborator invites — best-effort, non-blocking
      if (form.pendingCollaborators.length > 0) {
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        await Promise.allSettled(
          form.pendingCollaborators.map(collab =>
            collaborationService.createInvite(createdEvent.id, {
              inviteeEmail: EMAIL_REGEX.test(collab.emailOrUsername) ? collab.emailOrUsername : null,
              role: collab.role as unknown as EventUserType,
              sendEmail: true,
              sendPush: true,
            }),
          ),
        );
      }

      onCreate?.();
      onClose();
    } catch (error: unknown) {
      if (__DEV__) {
        console.error('[CreateEvent] Event creation failed:', error);
      }
      setBanner({
        type: 'error',
        message: t('CreateEventFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [canCreate, form, onClose, onCreate, t]);

  const value = useMemo<CreateEventContextValue>(() => ({
    form,
    flow: {
      currentStep,
      maxVisitedStep,
      maxReachableStep,
      canProceed,
      canCreate,
    },
    status: {
      isSubmitting,
      banner,
    },
    validation: {
      getFieldError: validation.getFieldError,
      validateField: validation.validateField,
      setFieldTouched: validation.setFieldTouched,
    },
    actions: {
      setTitle: value => setField('title', value),
      setDescription: value => setField('description', value),
      setSelectedEventType: value => setField('selectedEventType', value),
      setStartDate: value => setField('startDate', value),
      setStartTime: value => setField('startTime', value),
      setEndDate: value => setField('endDate', value),
      setEndTime: value => setField('endTime', value),
      setVenue: value => setField('venue', value),
      setLocationSearchQuery: value => setField('locationSearchQuery', value),
      setIsPublic: value => setField('isPublic', value),
      setFree: value => setField('free', value),
      setPrice: value => setField('price', value),
      setCapacity: value => setField('capacity', value),
      setEnableContrib: value => setField('enableContrib', value),
      setContributionAmount: value => setField('contributionAmount', value),
      setCoverImage: value => setField('coverImage', value),
      addCollaborator,
      removeCollaborator,
      clearBanner,
      goNext,
      goBack,
      goToStep,
      submit,
      close,
    },
  }), [
    addCollaborator,
    banner,
    canCreate,
    canProceed,
    clearBanner,
    close,
    currentStep,
    form,
    goBack,
    goNext,
    goToStep,
    isSubmitting,
    maxReachableStep,
    maxVisitedStep,
    removeCollaborator,
    setField,
    submit,
    validation.getFieldError,
    validation.setFieldTouched,
    validation.validateField,
  ]);

  return (
    <CreateEventContext.Provider value={value}>
      {children}
    </CreateEventContext.Provider>
  );
}

export function useCreateEvent(): CreateEventContextValue {
  const context = useContext(CreateEventContext);
  if (!context) {
    throw new Error('useCreateEvent must be used within a CreateEventProvider');
  }
  return context;
}
