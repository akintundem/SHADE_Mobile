import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useAgent } from '../../../../features/agent/providers/AgentProvider';
import { AgentChatSheet } from '../../../../shared/components/AgentChatSheet';
import { SafeAreaWrapper } from '../../../../shared/components/SafeAreaWrapper';
import { LoadingOverlay } from '../../../../shared/components/LoadingStates';
import { eventService } from '../../../../shared/services/eventService';
import { CreateEventRequest, EventType, EventStatus } from '../../../../shared/types';
import { ErrorHandler } from '../../../../shared/utils/errorHandler';
import { STEPS } from '../constants';
import { useCreateEventForm } from '../hooks/useCreateEventForm';
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

type Props = { onClose: () => void; onCreate?: () => void };

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<Asset | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const { colors, spacing, borderRadius, brand, shadows } = useTheme();
  const { setContext, ask } = useAgent();

  const form = useCreateEventForm();
  const {
    isPublic,
    free,
    tags,
    selectedEventType,
    title,
    description,
    price,
    capacity,
    enableContrib,
    startDate,
    startTime,
    endDate,
    endTime,
    venue,
    locationSearchQuery,
    isGettingLocation,
    setPublic,
    setFree,
    setSelectedEventType,
    setTitle,
    setDescription,
    setPrice,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
    setVenue,
    setLocationSearchQuery,
    setIsGettingLocation,
    setEnableContrib,
    validateField,
    setFieldTouched,
    getFieldError,
    validationResult,
    handleToggleTag,
  } = form;

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

  // Update agent context with current step
  useEffect(() => {
    const ctx = {
      surface: 'create_event' as const,
      currentStep,
      stepName: STEPS[currentStep].id,
      form: {
        title,
        description,
        access: (free ? 'free' : 'paid') as 'free' | 'paid',
        price: Number(price) || undefined,
        capacity: Number(capacity) || undefined,
      },
    };
    setContext(ctx);
    const id = setTimeout(() => {
      ask(ctx);
    }, 450);
    return () => clearTimeout(id);
  }, [currentStep, title, description, free, price, capacity, setContext, ask]);

  const handleCreateEvent = useCallback(async () => {
    if (!canCreate) return;

    setIsLoading(true);
    try {
      const startDateTime = `${startDate}T${startTime}:00.000Z`;
      const endDateTime = endDate && endTime ? `${endDate}T${endTime}:00.000Z` : startDateTime;

      const eventData: CreateEventRequest = {
        name: title.trim(),
        description: description.trim(),
        eventType: selectedEventType || EventType.PARTY,
        eventStatus: EventStatus.DRAFT,
        startDateTime,
        endDateTime,
        capacity: capacity ? Number(capacity) : undefined,
        isPublic,
        requiresApproval: false,
        qrCodeEnabled: true,
      };

      const createdEvent = await eventService.createEvent(eventData);

      if (coverImage?.uri) {
        try {
          const uploadRequest = {
            fileName: coverImage.fileName || 'cover-image.jpg',
            contentType: coverImage.type || 'image/jpeg',
            category: 'cover',
            isPublic: true,
            description: 'Event cover image',
          };
          await eventService.uploadCoverImage(createdEvent.id, uploadRequest, coverImage);
        } catch (imageError) {
          console.warn('Failed to upload cover image:', imageError);
          Alert.alert(
            'Image Upload Failed',
            'Your event was created successfully, but the cover image could not be uploaded. You can add it later from the event settings.',
            [{ text: 'OK' }],
          );
        }
      }

      Alert.alert(
        'Success!',
        `Event "${createdEvent.name}" has been created successfully.`,
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
    coverImage,
    onCreate,
    onClose,
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
            tags={tags}
            onEventTypeSelect={setSelectedEventType}
            onTagToggle={handleToggleTag}
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
            isGettingLocation={isGettingLocation}
            onVenueChange={setVenue}
            onLocationSearchChange={setLocationSearchQuery}
            onGettingLocationChange={setIsGettingLocation}
          />
        );
      case 4:
        return (
          <AccessStep
            isPublic={isPublic}
            free={free}
            price={price}
            onPublicChange={setPublic}
            onFreeChange={setFree}
            onPriceChange={(text) => {
              setPrice(text);
              validateField('price', text);
            }}
            onPriceBlur={() => setFieldTouched('price')}
            priceError={getFieldError('price')}
          />
        );
      case 5:
        return (
          <TeamContributionsStep
            enableContrib={enableContrib}
            onEnableContribChange={setEnableContrib}
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
            onEditStep={setCurrentStep}
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

        <View
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.border,
            ...shadows.lg,
          }}
        >
          <StepFooter
            isLastStep={currentStep === STEPS.length - 1}
            canProceed={canProceedToNextStep}
            isLoading={isLoading}
            onNext={handleNext}
            onClose={onClose}
            onCreate={handleCreateEvent}
          />
        </View>

        <TouchableOpacity
          onPress={() => setChatOpen(true)}
          activeOpacity={0.9}
          style={{
            position: 'absolute',
            right: spacing.lg,
            bottom: 96,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: brand.secondary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.lg,
          }}
        >
          <MessageSquare size={20} color={colors.background} />
        </TouchableOpacity>

        <AgentChatSheet visible={chatOpen} onClose={() => setChatOpen(false)} />
        <LoadingOverlay visible={isLoading} message="Creating event..." />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
