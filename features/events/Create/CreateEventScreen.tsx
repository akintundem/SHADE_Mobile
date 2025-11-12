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
  Animated,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import Input from '../../../shared/components/ui/Input';
import {
  X,
  Globe,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Image as ImageIcon,
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

type Props = { onClose: () => void; onCreate?: () => void };

const STEPS = [
  { id: 0, title: 'Event Basics', subtitle: 'Start creating your event' },
  { id: 1, title: 'Date & Location', subtitle: 'When and where is your event' },
  { id: 2, title: 'Access & Capacity', subtitle: 'Set who can attend your event' },
  { id: 3, title: 'Team & Contributions', subtitle: 'Add collaborators and funding options' },
  { id: 4, title: 'Review', subtitle: 'Double-check everything looks good' },
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
    'Networking',
  ];

  // Form state
  const [isPublic, setPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [enableContrib, setEnableContrib] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<Asset | null>(null);
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
      location: locationName,
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
      locationName,
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
      case 1: // Date & Location
        return startDate && startTime && locationName.length >= 3;
      case 2: // Access & Capacity
        return free || (price && Number(price) > 0);
      case 3: // Team & Contributions
        return true; // All optional
      case 4: // Review
        return validationResult.isValid;
      default:
        return false;
    }
  }, [currentStep, title, description, startDate, startTime, locationName, free, price, validationResult]);

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
        eventType: EventType.PARTY,
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
    address,
    locationName,
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

  const handlePickImage = useCallback(() => {
    console.log('handlePickImage called');
    console.log('Launching image library...');

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        presentationStyle: 'fullScreen',
      },
      (response: ImagePickerResponse) => {
        console.log('Image picker response:', JSON.stringify(response, null, 2));

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('Image picker error:', response.errorCode, response.errorMessage);
          Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        } else if (response.assets && response.assets.length > 0) {
          console.log('Image selected:', response.assets[0]);
          setCoverImage(response.assets[0]);
        } else {
          console.log('No assets in response');
        }
      }
    );
  }, []);

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
        return Step2DateTime;
      case 2:
        return Step3AccessCapacity;
      case 3:
        return Step4TeamContributions;
      case 4:
        return Step5Review;
      default:
        return null;
    }
  };

  // Step 1: Event Basics - Memoized
  const step1Content = useMemo(() => (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <Section title="Cover image">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePickImage}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.xl,
            overflow: 'hidden',
          }}
        >
          {coverImage?.uri ? (
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: coverImage.uri }}
                style={{
                  height: 160,
                  width: '100%',
                }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setCoverImage(null);
                }}
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 999,
                  padding: spacing.xs,
                }}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                height: 160,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
              }}
            >
              <ImageIcon size={24} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                Add cover image (optional)
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Section>

      <Section title="Details">
        <FieldLabel
          icon={<Users size={16} color={colors.text.secondary} />}
          label="Event name"
        />
        <Input
          placeholder="Give your event a name"
          value={title}
          onChangeText={text => {
            setTitle(text);
            validateField('title', text);
          }}
          onBlur={() => setFieldTouched('title')}
          error={getFieldError('title')}
        />
        <View style={{ height: spacing.sm }} />
        <FieldLabel
          icon={<Users size={16} color={colors.text.secondary} />}
          label="Description"
        />
        <Input
          placeholder="Describe your event"
          multiline
          numberOfLines={4}
          style={{ height: 100, paddingTop: spacing.md }}
          value={description}
          onChangeText={text => {
            setDescription(text);
            validateField('description', text);
          }}
          onBlur={() => setFieldTouched('description')}
          error={getFieldError('description')}
        />
      </Section>

      <Section title="Tags (optional)">
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
          }}
        >
          {AVAILABLE_TAGS.map(tag => {
            const isSelected = tags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => handleToggleTag(tag)}
                activeOpacity={0.7}
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? brand.secondary : colors.border,
                  borderRadius: 999,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  backgroundColor: isSelected ? brand.secondary + '15' : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? brand.secondary : colors.text.primary,
                    fontWeight: isSelected ? typography.weight.semibold : typography.weight.regular,
                  }}
                >
                  {isSelected ? '✓ ' : ''}{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      {/* Agent banner at bottom */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl,  marginBottom: 30 }}>
        <AgentBanner
          onOpenChat={() => setChatOpen(true)}
          onSelect={() => {}}
        />
      </View>
    </ScrollView>
  ), [title, description, tags, coverImage, errors, colors, spacing, borderRadius, brand, typography, handlePickImage, handleToggleTag, AVAILABLE_TAGS, validateField, setFieldTouched, getFieldError]);

  // Step 2: Date, Time & Location - Memoized
  const Step2DateTime = useMemo(() => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
      <Section title="Date & Time">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel
              icon={<CalendarDays size={16} color={colors.text.secondary} />}
              label="Start Date"
            />
            <Input
              placeholder="yyyy-mm-dd"
              value={startDate}
              onChangeText={text => {
                setStartDate(text);
                validateField('startDate', text);
              }}
              onBlur={() => setFieldTouched('startDate')}
              error={getFieldError('startDate')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel
              icon={<Clock size={16} color={colors.text.secondary} />}
              label="Start Time"
            />
            <Input
              placeholder="HH:MM"
              value={startTime}
              onChangeText={text => {
                setStartTime(text);
                validateField('startTime', text);
              }}
              onBlur={() => setFieldTouched('startTime')}
              error={getFieldError('startTime')}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel
              icon={<CalendarDays size={16} color={colors.text.secondary} />}
              label="End Date (Optional)"
            />
            <Input
              placeholder="yyyy-mm-dd"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel
              icon={<Clock size={16} color={colors.text.secondary} />}
              label="End Time (Optional)"
            />
            <Input
              placeholder="HH:MM"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>
      </Section>

      <Section title="Location">
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
            icon={<MapPin size={16} color={colors.text.secondary} />}
            label="Location name"
          />
          <Input
            placeholder="Enter location name"
            value={locationName}
            onChangeText={text => {
              setLocationName(text);
              validateField('location', text);
            }}
            onBlur={() => setFieldTouched('location')}
            error={getFieldError('location')}
          />
          <View style={{ height: spacing.sm }} />
          <FieldLabel
            icon={<MapPin size={16} color={colors.text.secondary} />}
            label="Full address (optional)"
          />
          <Input
            placeholder="Full address"
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              marginTop: spacing.md,
            }}
          >
            <MapPin size={16} color={brand.secondary} />
            <Text style={{ color: brand.secondary, fontSize: typography.size.sm }}>
              Detect current location
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
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  ), [startDate, startTime, endDate, endTime, locationName, address, errors, colors, spacing, borderRadius, brand, typography, validateField, setFieldTouched, getFieldError]);

  // Step 3: Access & Capacity - Memoized
  const Step3AccessCapacity = useMemo(() => (
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

  // Step 4: Team & Contributions - Memoized
  const Step4TeamContributions = useMemo(() => (
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

  // Step 5: Review - Memoized
  const Step5Review = useMemo(() => (
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
          <ReviewItem
            label="Start"
            value={`${startDate} at ${startTime}`}
            onEdit={() => setCurrentStep(1)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          {endDate && endTime && (
            <ReviewItem
              label="End"
              value={`${endDate} at ${endTime}`}
              onEdit={() => setCurrentStep(1)}
              colors={colors}
              typography={typography}
              spacing={spacing}
              brand={brand}
            />
          )}
          <ReviewItem
            label="Location"
            value={locationName}
            onEdit={() => setCurrentStep(1)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          <ReviewItem
            label="Visibility"
            value={isPublic ? 'Public' : 'Private'}
            onEdit={() => setCurrentStep(2)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          <ReviewItem
            label="Access"
            value={free ? 'Free' : `$${price}`}
            onEdit={() => setCurrentStep(2)}
            colors={colors}
            typography={typography}
            spacing={spacing}
            brand={brand}
          />
          {capacity && (
            <ReviewItem
              label="Capacity"
              value={`${capacity} attendees`}
              onEdit={() => setCurrentStep(2)}
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
  ), [title, description, startDate, startTime, endDate, endTime, locationName, isPublic, free, price, capacity, colors, spacing, borderRadius, brand, typography]);

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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={currentStep === 0 ? onClose : handleBack} style={{ padding: spacing.xs }}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: typography.weight.semibold,
                fontSize: typography.size.base,
              }}
            >
              {STEPS[currentStep].title}
            </Text>
            <Text
              style={{
                color: colors.text.tertiary,
                fontSize: typography.size.xs,
              }}
            >
              Step {currentStep + 1} of {STEPS.length}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress indicator */}
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
            {STEPS.map((step, index) => (
              <View
                key={step.id}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: index <= currentStep ? brand.secondary : colors.border,
                }}
              />
            ))}
          </View>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            textAlign: 'center',
          }}>
            {STEPS[currentStep].subtitle}
          </Text>
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
            <TouchableOpacity
              disabled={!canProceedToNextStep}
              onPress={handleNext}
              style={{
                height: 48,
                borderRadius: 999,
                backgroundColor: canProceedToNextStep ? brand.secondary : colors.border,
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
                  fontSize: typography.size.base,
                }}
              >
                Next
              </Text>
              <ChevronRight size={20} color={colors.background} />
            </TouchableOpacity>
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
