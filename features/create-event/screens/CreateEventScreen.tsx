import 'react-native-get-random-values';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { SafeAreaWrapper } from '../../../common/components/SafeAreaWrapper';
import { LoadingOverlay } from '../../../common/components/LoadingStates';
import { eventService } from '../../../core/events/services/event';
import { CreateEventRequest, EventType, EventStatus, EventMediaUploadRequest } from '../../../core/events/types/event';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { createEventValidator } from '../../../common/utils/formValidation';
import {
  EventBasicsStep,
  CategorizeStep,
  WhenStep,
  LocationStep,
  AccessStep,
  TeamContributionsStep,
  ReviewStep,
} from '../components/steps';
import { StepHeader } from '../components/StepHeader';
import { StepFooter } from '../components/StepFooter';
import { STEPS } from '../constants';

// Local Venue type for form input (matches LocationStep)
type Venue = {
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

type Props = { onClose: () => void; onCreate?: () => void };

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<Asset | null>(null);
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  
  // Generate idempotency key once when component mounts
  // This ensures the same key is used for all create attempts (prevents duplicate events)
  const idempotencyKeyRef = useRef<string>(uuidv4());

  // Form state
  const [isPublic, setIsPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [enableContrib, setEnableContrib] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState<Venue | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Validation state
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation helpers
  const validateField = useCallback((field: string, value: any) => {
    const error = createEventValidator.validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error || '' }));
    return error;
  }, []);

  const setFieldTouched = useCallback((field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return touchedFields[field] ? fieldErrors[field] : undefined;
  }, [touchedFields, fieldErrors]);

  // Validate entire form
  const validationResult = useMemo(() => {
    const formData = {
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location: venue?.address || '',
      capacity: capacity || undefined,
      price: free ? undefined : price,
    };
    return createEventValidator.validateForm(formData);
  }, [title, description, startDate, startTime, endDate, endTime, venue, capacity, price, free]);

  // Check if current step can proceed
  const canProceedToNextStep = useMemo((): boolean => {
    switch (currentStep) {
      case 0:
        return title.length >= 3 && description.length >= 10;
      case 1:
        return selectedEventType !== null;
      case 2:
        return Boolean(startDate && startTime);
      case 3:
        return venue !== null && Boolean(venue.address);
      case 4:
        return free || Boolean(price && Number(price) > 0);
      case 5:
        return true;
      case 6:
        return validationResult.isValid;
      default:
        return false;
    }
  }, [currentStep, title, description, selectedEventType, startDate, startTime, venue, free, price, validationResult]);

  const canCreate = validationResult.isValid && !isLoading;

  const handleCreateEvent = useCallback(async () => {
    if (!canCreate) return;

    setIsLoading(true);
    try {
      // Use the same idempotency key for all create attempts
      // This prevents duplicate events if user clicks create multiple times or request is retried
      const idempotencyKey = idempotencyKeyRef.current;

      const startDateTime = `${startDate}T${startTime}:00.000Z`;
      const endDateTime = endDate && endTime ? `${endDate}T${endTime}:00.000Z` : startDateTime;
      const parsedPrice = !free && price ? Number(price) : undefined;
      const parsedContribution =
        enableContrib && contributionAmount ? Number(contributionAmount) : undefined;
      
      // Sanitize venue for top-level venue field (not metadata)
      // Build venue object with only defined, non-empty fields
      let cleanedVenue: CreateEventRequest['venue'] = undefined;
      if (venue) {
        const venueFields: CreateEventRequest['venue'] = {
          address: venue.address,
          city: venue.city,
          state: venue.state,
          country: venue.country,
          zipCode: venue.zipCode,
          latitude: venue.latitude,
          longitude: venue.longitude,
          googlePlaceId: venue.googlePlaceId,
          googlePlaceData: venue.googlePlaceData,
        };
        
        // Remove undefined/null/empty fields
        const filtered = Object.fromEntries(
          Object.entries(venueFields).filter(
            ([, value]) => value !== undefined && value !== null && value !== '',
          ),
        );
        
        // Only set venue if there are actual fields
        if (Object.keys(filtered).length > 0) {
          cleanedVenue = filtered as CreateEventRequest['venue'];
        }
      }

      const metadataPayload: Record<string, unknown> = {};

      metadataPayload.access = free ? 'free' : 'paid';
      if (parsedPrice !== undefined && !Number.isNaN(parsedPrice)) {
        metadataPayload.price = parsedPrice;
      }
      if (enableContrib) {
        metadataPayload.contributions = {
          enabled: true,
          suggestedAmount:
            parsedContribution !== undefined && !Number.isNaN(parsedContribution)
              ? parsedContribution
              : undefined,
        };
      }
      // Note: venue is now in top-level field, not metadata
      if (locationSearchQuery.trim().length > 0) {
        metadataPayload.locationQuery = locationSearchQuery.trim();
      }

      const metadataKeys = Object.keys(metadataPayload);

      const eventData: CreateEventRequest = {
        name: title.trim(),
        description: description.trim(),
        eventType: selectedEventType || EventType.PARTY,
        eventStatus: EventStatus.DRAFT,
        startDateTime,
        endDateTime,
        capacity: capacity ? Number(capacity) : undefined,
        isPublic,
        requiresApproval: !isPublic,
        venue: cleanedVenue,
        metadata: metadataKeys.length ? JSON.stringify(metadataPayload) : undefined,
      };

      // Prepare cover upload request (required by new API)
      const coverUploadRequest: EventMediaUploadRequest = {
        fileName: coverImage?.fileName || 'cover-image.jpg',
        contentType: coverImage?.type || 'image/jpeg',
        category: 'cover',
        isPublic: true,
        description: 'Event cover image',
      };

      // Create event with cover upload request
      const response = await eventService.createEvent(
        {
          event: eventData,
          coverUpload: coverUploadRequest,
        },
        idempotencyKey
      );

      const createdEvent = response.event;

      // Reset idempotency key after successful creation
      // This ensures each new event creation gets a unique key
      idempotencyKeyRef.current = uuidv4();

      // Upload cover image if provided
      if (coverImage?.uri && response.coverUpload) {
        try {
          // Step 1: Upload image to S3 using presigned URL
          const imageResponse = await fetch(coverImage.uri);
          const blob = await imageResponse.blob();
          
          const uploadResponse = await fetch(response.coverUpload.uploadUrl, {
            method: response.coverUpload.uploadMethod || 'PUT',
            body: blob,
            headers: response.coverUpload.headers,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to S3');
          }

          // Step 2: Complete the cover image upload
          await eventService.completeCoverImageUploadBody(createdEvent.id, {
            coverId: response.coverUpload.mediaId,
            upload: {
              objectKey: response.coverUpload.objectKey,
              resourceUrl: response.coverUpload.resourceUrl,
              fileName: coverUploadRequest.fileName,
              contentType: coverUploadRequest.contentType,
              category: coverUploadRequest.category,
              isPublic: coverUploadRequest.isPublic,
              description: coverUploadRequest.description,
            },
          });
        } catch (imageError) {
          Alert.alert(
            'Image Upload Failed',
            'The event was created but the cover image upload failed.',
            [{ text: 'OK' }],
          );
        }
      }

      Alert.alert(
        'Success',
        `Event "${createdEvent.name}" created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onCreate?.();
              onClose();
            },
          },
        ],
      );
    } catch (error) {
      ErrorHandler.handle(error, 'createEvent');
    } finally {
      setIsLoading(false);
    }
  }, [
    canCreate,
    startDate,
    startTime,
    endDate,
    endTime,
    title,
    description,
    selectedEventType,
    capacity,
    isPublic,
    free,
    price,
    enableContrib,
    contributionAmount,
    venue,
    locationSearchQuery,
    coverImage,
    onCreate,
    onClose,
    t,
  ]);

  const handleNext = useCallback(() => {
    if (canProceedToNextStep && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [canProceedToNextStep, currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <EventBasicsStep
            title={title}
            description={description}
            onTitleChange={(text) => {
              setTitle(text);
              validateField('title', text);
            }}
            onDescriptionChange={(text) => {
              setDescription(text);
              validateField('description', text);
            }}
            onTitleBlur={() => setFieldTouched('title')}
            onDescriptionBlur={() => setFieldTouched('description')}
            titleError={getFieldError('title')}
            descriptionError={getFieldError('description')}
          />
        );
      case 1:
        return (
          <CategorizeStep
            selectedEventType={selectedEventType}
            onEventTypeSelect={setSelectedEventType}
          />
        );
      case 2:
        return (
          <WhenStep
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            onStartDateChange={(text) => {
              setStartDate(text);
              validateField('startDate', text);
            }}
            onStartTimeChange={(text) => {
              setStartTime(text);
              validateField('startTime', text);
            }}
            onEndDateChange={setEndDate}
            onEndTimeChange={setEndTime}
            onStartDateBlur={() => setFieldTouched('startDate')}
            onStartTimeBlur={() => setFieldTouched('startTime')}
            startDateError={getFieldError('startDate')}
            startTimeError={getFieldError('startTime')}
          />
        );
      case 3:
        return (
          <LocationStep
            venue={venue}
            locationSearchQuery={locationSearchQuery}
            onVenueChange={setVenue}
            onLocationSearchChange={setLocationSearchQuery}
          />
        );
      case 4:
        return (
          <AccessStep
            isPublic={isPublic}
            free={free}
            price={price}
            capacity={capacity}
            onPublicChange={setIsPublic}
            onFreeChange={setFree}
            onPriceChange={(text) => {
              setPrice(text);
              validateField('price', text);
            }}
            onPriceBlur={() => setFieldTouched('price')}
            priceError={getFieldError('price')}
            onCapacityChange={(text) => {
              setCapacity(text);
              validateField('capacity', text);
            }}
            onCapacityBlur={() => setFieldTouched('capacity')}
            capacityError={getFieldError('capacity')}
          />
        );
      case 5:
        return (
          <TeamContributionsStep
            enableContrib={enableContrib}
            contributionAmount={contributionAmount}
            onContributionAmountChange={setContributionAmount}
            onEnableContribChange={(value) => {
              setEnableContrib(value);
              if (!value) {
                setContributionAmount('');
              }
            }}
          />
        );
      case 6:
        return (
          <ReviewStep
            title={title}
            description={description}
            selectedEventType={selectedEventType}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            venue={venue}
            isPublic={isPublic}
            free={free}
            price={price}
            capacity={capacity}
            enableContrib={enableContrib}
            contributionAmount={contributionAmount}
            onEditStep={setCurrentStep}
            onImageSelected={(imageUri) => {
              setCoverImage({
                uri: imageUri,
                type: 'image/jpeg',
                fileName: 'event-cover.jpg',
              } as Asset);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaWrapper edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StepHeader
          currentStep={currentStep}
          steps={STEPS}
          onBack={handleBack}
          onClose={onClose}
        />

        <View style={{ flex: 1 }}>
          {renderStepContent()}
        </View>

        <View style={{ padding: spacing.lg }}>
          <StepFooter
            isLastStep={currentStep === STEPS.length - 1}
            canProceed={canProceedToNextStep}
            isLoading={isLoading}
            onNext={handleNext}
            onClose={onClose}
            onCreate={handleCreateEvent}
          />
        </View>

        <LoadingOverlay visible={isLoading} message="Creating Event..." />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
