import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Asset } from 'react-native-image-picker';
import Input from '../../../shared/components/ui/Input';
import {
  X,
  Globe,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { useAgent } from '../../../features/agent/Agent/AgentProvider';
import { AgentBanner } from '../../../shared/components/AgentBanner';
import { MessageSquare } from 'lucide-react-native';
import { AgentChatSheet } from '../../../shared/components/AgentChatSheet';
import { SafeAreaWrapper } from '../../../shared/components/SafeAreaWrapper';
import { LoadingOverlay } from '../../../shared/components/LoadingStates';
import { eventService } from '../../../shared/services/eventService';
import { CreateEventRequest, EventType, EventStatus } from '../../../shared/types';
import {
  createEventValidator,
  useFormValidation,
} from '../../../shared/utils/formValidation';
import { ErrorHandler } from '../../../shared/utils/errorHandler';
import { GestureHandler } from '../../../shared/utils/gestureHandler';
import { GeolocationService } from '../../../shared/services/geolocationService';
import { WhenStep } from './components/steps/WhenStep';
import { LocationStep } from './components/steps/LocationStep';

type Props = { onClose: () => void; onCreate?: () => void };

const STEPS = [
  { id: 0, title: 'Event Basics', subtitle: 'Start creating your event' },
  { id: 1, title: 'Categorize', subtitle: 'Help people find your event' },
  { id: 2, title: 'When', subtitle: 'Schedule your event' },
  { id: 3, title: 'Location', subtitle: 'Where is your event' },
  { id: 4, title: 'Access & Capacity', subtitle: 'Set who can attend your event' },
  { id: 5, title: 'Team & Contributions', subtitle: 'Add collaborators and funding options' },
  { id: 6, title: 'Review', subtitle: 'Double-check everything looks good' },
];

// ReviewItem component for the review step
function ReviewItem({ 
  label, 
  value, 
  onEdit,
  colors,
  typography,
  spacing,
  brand 
}: { 
  label: string; 
  value: string; 
  onEdit: () => void;
  colors: any;
  typography: any;
  spacing: any;
  brand: any;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, marginBottom: 4 }}>
          {label}
        </Text>
        <Text style={{ color: colors.text.primary, fontSize: typography.size.base }}>
          {value}
        </Text>
      </View>
      <TouchableOpacity onPress={onEdit} style={{ paddingLeft: spacing.md }}>
        <Text style={{ color: brand.secondary, fontSize: typography.size.sm }}>
          Edit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  // Current step state
  const [currentStep, setCurrentStep] = useState(0);

  // Available tags
  const AVAILABLE_TAGS = [
    'Music',
    'Amapiano',
    'Fashion',
    'Food',
    'Culture',
    'Dance',
    'Art',
    'Sports',
    'Tech',
    'Business',
    'Networking',
    'Workshop',
  ];

  // Form state
  const [isPublic, setPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [enableContrib, setEnableContrib] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState<{
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    googlePlaceData?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<Asset | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const { colors, typography, spacing, borderRadius, brand, shadows, isDark } = useTheme();
  const { setContext, ask } = useAgent();
  const [chatOpen, setChatOpen] = useState(false);

  // Form validation
  const {
    errors,
    validateField: validateFieldRaw,
    setFieldTouched: setFieldTouchedRaw,
    getFieldError: getFieldErrorRaw,
    validateForm,
  } = useFormValidation(createEventValidator);

  // Wrap validation functions in useCallback to stabilize them
  const validateField = useCallback((field: string, value: any) => {
    validateFieldRaw(field, value);
  }, [validateFieldRaw]);

  const setFieldTouched = useCallback((field: string) => {
    setFieldTouchedRaw(field);
  }, [setFieldTouchedRaw]);

  const getFieldError = useCallback((field: string) => {
    return getFieldErrorRaw(field);
  }, [getFieldErrorRaw]);

  // Memoized form data for validation
  const formData = useMemo(
    () => ({
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location: venue?.address || '',
      capacity: capacity ? Number(capacity) : undefined,
      price: !free && price ? Number(price) : undefined,
    }),
    [
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      venue,
      capacity,
      price,
      free,
    ],
  );

  // Validation result
  const validationResult = useMemo(
    () => validateForm(formData),
    [formData, validateForm],
  );

  // Check if current step can proceed
  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 0: // Event Basics
        return title.length >= 3 && description.length >= 10;
      case 1: // Categorize
        return selectedEventType !== null;
      case 2: // When
        return startDate && startTime;
      case 3: // Location
        return venue !== null && venue.address; // Only require address, city is optional
      case 4: // Access & Capacity
        return free || (price && Number(price) > 0);
      case 5: // Team & Contributions
        return true; // All optional
      case 6: // Review
        return validationResult.isValid;
      default:
        return false;
    }
  }, [currentStep, title, description, selectedEventType, startDate, startTime, venue, free, price, validationResult]);

  const canCreate = validationResult.isValid && !isLoading;

  // Update agent context with current step
  React.useEffect(() => {
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
  }, [currentStep, title, description, free, price, capacity]);

  const handleCreateEvent = useCallback(async () => {
    if (!canCreate) return;

    setIsLoading(true);
    try {
      // Combine date and time
      const startDateTime = `${startDate}T${startTime}:00.000Z`;
      const endDateTime =
        endDate && endTime ? `${endDate}T${endTime}:00.000Z` : startDateTime;

      const eventData: CreateEventRequest = {
        name: title.trim(),
        description: description.trim(),
        eventType: selectedEventType || EventType.PARTY,
        eventStatus: EventStatus.DRAFT,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        capacity: capacity ? Number(capacity) : undefined,
        isPublic: isPublic,
        requiresApproval: false,
        qrCodeEnabled: true,
      };

      // Step 1: Create the event
      const createdEvent = await eventService.createEvent(eventData);

      // Step 2: Upload cover image if one was selected
      if (coverImage?.uri) {
        try {
          console.log('Starting cover image upload...', {
            uri: coverImage.uri,
            fileName: coverImage.fileName,
            type: coverImage.type,
            size: coverImage.fileSize
          });

          // Get presigned URL for cover image upload
          const uploadRequest = {
            fileName: coverImage.fileName || 'cover-image.jpg',
            contentType: coverImage.type || 'image/jpeg',
            category: 'cover',
            isPublic: true,
            description: 'Event cover image'
          };

          console.log('Upload request:', uploadRequest);

          // Upload the cover image
          await eventService.uploadCoverImage(createdEvent.id, uploadRequest, coverImage);
          console.log('Cover image uploaded successfully');
        } catch (imageError) {
          console.warn('Failed to upload cover image:', imageError);
          // Don't fail the entire event creation if image upload fails
          Alert.alert(
            'Image Upload Failed',
            'Your event was created successfully, but the cover image could not be uploaded. You can add it later from the event settings.',
            [{ text: 'OK' }]
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
    venue,
    title,
    description,
    capacity,
    free,
    price,
    tags,
    onCreate,
    onClose,
    isPublic,
    coverImage,
  ]);

  const handleNext = () => {
    if (canProceedToNextStep && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleToggleTag = useCallback((tag: string) => {
    setTags(prevTags => {
      if (prevTags.includes(tag)) {
        // Remove tag if already selected
        return prevTags.filter(t => t !== tag);
      } else {
        // Add tag if not selected
        return [...prevTags, tag];
      }
    });
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return step1Content;
      case 1:
        return Step2Categorize;
      case 2:
        return Step3When;
      case 3:
        return Step4Location;
      case 4:
        return Step5AccessCapacity;
      case 5:
        return Step6TeamContributions;
      case 6:
        return Step7Review;
      default:
        return null;
    }
  };

  // Step 1: Event Basics - Memoized
  const step1Content = useMemo(() => (
    <ScrollView 
      contentContainerStyle={{ 
        paddingBottom: 120,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}
    >
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size['2xl'],
            marginBottom: spacing.xs,
          }}
        >
          Event Basics
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
          }}
        >
          Let's start with the essentials
        </Text>
      </View>

      <View style={{ gap: spacing.lg }}>
        <View>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.sm,
            }}
          >
            Event Name
          </Text>
          <TextInput
            placeholder="Give your event a name..."
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={text => {
              setTitle(text);
              validateField('title', text);
            }}
            onBlur={() => setFieldTouched('title')}
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              fontSize: typography.size.base,
              color: colors.text.primary,
              minHeight: 48,
            }}
          />
          {getFieldError('title') && (
            <Text style={{ color: colors.semantic.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
              {getFieldError('title')}
            </Text>
          )}
        </View>

        <View>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.sm,
            }}
          >
            Description
          </Text>
          <TextInput
            placeholder="Describe your event..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={text => {
              setDescription(text);
              validateField('description', text);
            }}
            onBlur={() => setFieldTouched('description')}
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              fontSize: typography.size.base,
              color: colors.text.primary,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
          />
          {getFieldError('description') && (
            <Text style={{ color: colors.semantic.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
              {getFieldError('description')}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  ), [title, description, errors, colors, spacing, borderRadius, brand, typography, validateField, setFieldTouched, getFieldError]);

  // Step 2: Categorize - Memoized
  const Step2Categorize = useMemo(() => {
    const EVENT_CATEGORIES = [
      { label: 'Conference', value: EventType.CONFERENCE },
      { label: 'Party', value: EventType.PARTY },
      { label: 'Concert', value: EventType.CONCERT },
      { label: 'Workshop', value: EventType.WORKSHOP },
      { label: 'Networking', value: EventType.NETWORKING },
      { label: 'Exhibition', value: EventType.TRADE_SHOW },
    ];

    return (
      <ScrollView 
        contentContainerStyle={{ 
          paddingBottom: 120,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
        }}
      >
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size['2xl'],
              marginBottom: spacing.xs,
            }}
          >
            Categorize
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
            }}
          >
            Help people find your event
          </Text>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Event Category
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {EVENT_CATEGORIES.map((category) => {
              const isSelected = selectedEventType === category.value;
              return (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => setSelectedEventType(category.value)}
                  activeOpacity={0.7}
                  style={{
                    width: '47%',
                    height: 56,
                    borderRadius: borderRadius.lg,
                    borderWidth: 1,
                    borderColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
                    backgroundColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.text.primary,
                      fontWeight: typography.weight.medium,
                      fontSize: typography.size.base,
                    }}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Tags (Optional)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {AVAILABLE_TAGS.map(tag => {
              const isSelected = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleToggleTag(tag)}
                  activeOpacity={0.7}
                  style={{
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.text.primary,
                      fontWeight: isSelected ? typography.weight.semibold : typography.weight.regular,
                      fontSize: typography.size.sm,
                    }}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  }, [selectedEventType, tags, colors, spacing, borderRadius, brand, typography, isDark, handleToggleTag, AVAILABLE_TAGS]);

  // Step 3: When - Using WhenStep component
  const Step3When = (
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

  // Step 4: Location - Using LocationStep component
  const Step4Location = (
    <LocationStep
      venue={venue}
      locationSearchQuery={locationSearchQuery}
      isGettingLocation={isGettingLocation}
      capacity={capacity}
      onVenueChange={setVenue}
      onLocationSearchChange={setLocationSearchQuery}
      onGettingLocationChange={setIsGettingLocation}
      onCapacityChange={setCapacity}
    />
  );

  // Step 5: Access & Capacity - Memoized
  const Step5AccessCapacity = useMemo(() => (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <Section title="Visibility">
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
          }}
        >
          <Row
            label="Public Event"
            icon={<Globe size={16} color={colors.text.secondary} />}
          >
            <Switch value={isPublic} onValueChange={setPublic} />
          </Row>
          <Text
            style={{ color: colors.text.tertiary, fontSize: typography.size.sm }}
          >
            {isPublic ? 'Visible to everyone' : 'Visible to invited only'}
          </Text>
        </View>
      </Section>

      <Section title="Access">
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
          }}
        >
          <RadioRow
            label="Free"
            active={free}
            onPress={() => setFree(true)}
          />
          <RadioRow
            label="Paid"
            active={!free}
            onPress={() => setFree(false)}
          />
          {!free && (
            <View style={{ marginTop: spacing.md }}>
              <FieldLabel
                icon={<DollarSign size={16} color={colors.text.secondary} />}
                label="Price (USD)"
              />
              <Input
                placeholder="e.g. 25"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={text => {
                  setPrice(text);
                  validateField('price', text);
                }}
                onBlur={() => setFieldTouched('price')}
                error={getFieldError('price')}
              />
            </View>
          )}
        </View>
      </Section>

      <Section title="Capacity (optional)">
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
          }}
        >
          <FieldLabel
            icon={<Users size={16} color={colors.text.secondary} />}
            label="Max attendees"
          />
          <Input
            placeholder="e.g. 150"
            keyboardType="number-pad"
            value={capacity}
            onChangeText={setCapacity}
          />
        </View>
      </Section>

      {/* Agent banner at bottom */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
        <AgentBanner
          onOpenChat={() => setChatOpen(true)}
          onSelect={() => {}}
        />
      </View>
    </ScrollView>
  ), [isPublic, free, price, capacity, errors, colors, spacing, borderRadius, brand, typography, validateField, setFieldTouched, getFieldError]);

  // Step 6: Team & Contributions - Memoized
  const Step6TeamContributions = useMemo(() => (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <Section title="Contributions (optional)">
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
          }}
        >
          <Row
            label="Enable contributions"
            icon={<DollarSign size={16} color={colors.text.secondary} />}
          >
            <Switch
              value={enableContrib}
              onValueChange={setEnableContrib}
            />
          </Row>
          {enableContrib && (
            <View style={{ marginTop: spacing.md }}>
              <Input
                placeholder="Suggested contribution (USD)"
                keyboardType="decimal-pad"
              />
            </View>
          )}
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.size.sm,
              marginTop: spacing.sm,
            }}
          >
            Allow guests to contribute financially to your event
          </Text>
        </View>
      </Section>

      <Section title="Collaborators (optional)">
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.cardElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={20} color={colors.text.secondary} />
            </View>
            <Text style={{ color: colors.text.secondary }}>
              Add collaborators
            </Text>
          </TouchableOpacity>
        </View>
      </Section>

      {/* Agent banner at bottom */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
        <AgentBanner
          onOpenChat={() => setChatOpen(true)}
          onSelect={() => {}}
        />
      </View>
    </ScrollView>
  ), [enableContrib, colors, spacing, borderRadius, brand, typography]);

  // Step 7: Review - Memoized
  const Step7Review = useMemo(() => (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <Section title="Review Your Event">
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            gap: spacing.md,
          }}
        >
          <ReviewItem
            label="Event Name"
            value={title}
            onEdit={() => setCurrentStep(0)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          <ReviewItem
            label="Description"
            value={description}
            onEdit={() => setCurrentStep(0)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          {selectedEventType && (
            <ReviewItem
              label="Category"
              value={(() => {
                const categoryMap: Record<EventType, string> = {
                  [EventType.CONFERENCE]: 'Conference',
                  [EventType.WORKSHOP]: 'Workshop',
                  [EventType.SEMINAR]: 'Seminar',
                  [EventType.MEETING]: 'Meeting',
                  [EventType.PARTY]: 'Party',
                  [EventType.WEDDING]: 'Wedding',
                  [EventType.BIRTHDAY]: 'Birthday',
                  [EventType.CORPORATE_EVENT]: 'Corporate Event',
                  [EventType.TRADE_SHOW]: 'Exhibition',
                  [EventType.CONCERT]: 'Concert',
                  [EventType.FESTIVAL]: 'Festival',
                  [EventType.SPORTS_EVENT]: 'Sports Event',
                  [EventType.CHARITY_EVENT]: 'Charity Event',
                  [EventType.NETWORKING]: 'Networking',
                  [EventType.TRAINING]: 'Training',
                  [EventType.RETREAT]: 'Retreat',
                  [EventType.OTHER]: 'Other',
                };
                return categoryMap[selectedEventType] || selectedEventType;
              })()}
              onEdit={() => setCurrentStep(1)}
              colors={colors}
              typography={typography}
              spacing={spacing}
              brand={brand}
            />
          )}
          <ReviewItem
            label="Start"
            value={`${startDate} at ${startTime}`}
            onEdit={() => setCurrentStep(2)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          {endDate && endTime && (
            <ReviewItem
              label="End"
              value={`${endDate} at ${endTime}`}
              onEdit={() => setCurrentStep(2)}
              colors={colors}
              typography={typography}
              spacing={spacing}
              brand={brand}
            />
          )}
          {venue && (
            <ReviewItem
              label="Location"
              value={venue.address ? `${venue.address}, ${venue.city || ''}${venue.state ? `, ${venue.state}` : ''}` : 'Location not set'}
              onEdit={() => setCurrentStep(3)}
              colors={colors}
              typography={typography}
              spacing={spacing}
              brand={brand}
            />
          )}
          <ReviewItem
            label="Visibility"
            value={isPublic ? 'Public' : 'Private'}
            onEdit={() => setCurrentStep(4)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          <ReviewItem
            label="Access"
            value={free ? 'Free' : `$${price}`}
            onEdit={() => setCurrentStep(4)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          {capacity && (
            <ReviewItem
              label="Capacity"
              value={`${capacity} attendees`}
              onEdit={() => setCurrentStep(4)}
              colors={colors}
              typography={typography}
              spacing={spacing}
              brand={brand}
            />
          )}
        </View>
      </Section>

      {/* Agent banner at bottom */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
        <AgentBanner
          onOpenChat={() => setChatOpen(true)}
          onSelect={() => {}}
        />
      </View>
    </ScrollView>
  ), [title, description, selectedEventType, startDate, startTime, endDate, endTime, venue, isPublic, free, price, capacity, colors, spacing, borderRadius, brand, typography]);

  return (
    <SafeAreaWrapper edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <TouchableOpacity onPress={currentStep === 0 ? onClose : handleBack} style={{ padding: spacing.xs }}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size.xl,
                }}
              >
                Create Event
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  marginTop: spacing.xs / 2,
                }}
              >
                Step {currentStep + 1} of {STEPS.length}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress indicator */}
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {STEPS.map((step, index) => (
              <View
                key={step.id}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: index <= currentStep ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
                }}
              />
            ))}
          </View>
        </View>

        {/* Step content */}
        <View style={{ flex: 1 }}>
          {renderStepContent()}
        </View>

        {/* Footer navigation */}
        <View
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.border,
            ...shadows.lg,
          }}
        >
          {currentStep < STEPS.length - 1 ? (
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                disabled={!canProceedToNextStep}
                onPress={handleNext}
                style={{
                  height: 56,
                  borderRadius: borderRadius.lg,
                  backgroundColor: canProceedToNextStep ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: spacing.sm,
                  paddingHorizontal: spacing.xl,
                  minWidth: 120,
                }}
              >
                <Text
                  style={{
                    color: canProceedToNextStep ? (isDark ? '#000000' : '#FFFFFF') : colors.text.tertiary,
                    fontWeight: typography.weight.semibold,
                    fontSize: typography.size.lg,
                  }}
                >
                  Next
                </Text>
                <ChevronRight size={22} color={canProceedToNextStep ? (isDark ? '#000000' : '#FFFFFF') : colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  Save Draft
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!canCreate || isLoading}
                onPress={handleCreateEvent}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  backgroundColor:
                    canCreate && !isLoading ? brand.secondary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: spacing.sm,
                }}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Event'}
                </Text>
                {!isLoading && <Check size={20} color={colors.background} />}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Floating chat button */}
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

        {/* Chat sheet */}
        <AgentChatSheet visible={chatOpen} onClose={() => setChatOpen(false)} />

        {/* Loading overlay */}
        <LoadingOverlay visible={isLoading} message="Creating event..." />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

function Section({ title, children }: any) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: typography.weight.semibold,
          marginBottom: spacing.md,
          fontSize: typography.size.base,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, icon, children }: any) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          {icon}
          <Text style={{ color: colors.text.primary }}>{label}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

function FieldLabel({ icon, label }: any) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
      }}
    >
      {icon}
      <Text style={{ color: colors.text.primary }}>{label}</Text>
    </View>
  );
}

function RadioRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, spacing, brand } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
      }}
    >
      <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: active ? brand.primary : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {active ? (
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 5,
              backgroundColor: brand.primary,
            }}
          />
        ) : null}
      </View>
      <Text style={{ color: colors.text.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}
