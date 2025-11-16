import React, { useState, useCallback, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { X, Save } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { LoadingOverlay } from '../../../../shared/components/LoadingStates';
import { eventService } from '../../../../shared/services/eventService';
import { UpdateEventRequest, Event, EventType, EventData, isFullEventResponse } from '../../../../shared/types';
import { ErrorHandle } from '../../../../shared/utils/errorHandler';

type EditEventScreenParams = {
  eventId: string;
};

const EVENT_TYPES = [
  { value: EventType.CONFERENCE, label: 'Conference' },
  { value: EventType.WORKSHOP, label: 'Workshop' },
  { value: EventType.SEMINAR, label: 'Seminar' },
  { value: EventType.MEETING, label: 'Meeting' },
  { value: EventType.PARTY, label: 'Party' },
  { value: EventType.WEDDING, label: 'Wedding' },
  { value: EventType.BIRTHDAY, label: 'Birthday' },
  { value: EventType.CORPORATE_EVENT, label: 'Corporate Event' },
  { value: EventType.TRADE_SHOW, label: 'Trade Show' },
  { value: EventType.CONCERT, label: 'Concert' },
  { value: EventType.FESTIVAL, label: 'Festival' },
  { value: EventType.SPORTS_EVENT, label: 'Sports Event' },
  { value: EventType.CHARITY_EVENT, label: 'Charity Event' },
  { value: EventType.NETWORKING, label: 'Networking' },
  { value: EventType.TRAINING, label: 'Training' },
  { value: EventType.RETREAT, label: 'Retreat' },
  { value: EventType.OTHER, label: 'Other' },
];

export default function EditEventScreen() {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: EditEventScreenParams }, 'params'>>();
  const { eventId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>(EventType.OTHER);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [eventWebsiteUrl, setEventWebsiteUrl] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [objectives, setObjectives] = useState('');

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const eventData = await eventService.getEvent(eventId);
      
      // Extract Event from EventData (which can be EventResponseWithScope or EventFeedResponse)
      let event: Event | null = null;
      if (isFullEventResponse(eventData)) {
        // EventResponseWithScope extends EventResponse, so it IS the Event
        event = eventData;
        setEvent(event);
      } else {
        // EventFeedResponse doesn't have all Event fields, so we can't edit it
        Alert.alert('Error', 'Cannot edit event with limited access. Full event details required.');
        navigation.goBack();
        return;
      }

      // Populate form fields
      setName(event.name);
      setDescription(event.description || '');
      setEventType(event.eventType);
      setStartDateTime(event.startDateTime || '');
      setEndDateTime(event.endDateTime || '');
      setCapacity(event.capacity?.toString() || '');
      setIsPublic(event.isPublic ?? true);
      setRequiresApproval(event.requiresApproval ?? false);
      setEventWebsiteUrl(event.eventWebsiteUrl || '');
      setHashtag(event.hashtag || '');
      setTargetAudience(event.targetAudience || '');
      setObjectives(event.objectives || '');
    } catch (err) {
      ErrorHandler.handle(err, 'loadEventForEdit');
      Alert.alert('Error', 'Failed to load event details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Event name is required.');
      return;
    }

    try {
      setSaving(true);

      const updates: UpdateEventRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        eventType,
        startDateTime: startDateTime || undefined,
        endDateTime: endDateTime || undefined,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
        isPublic,
        requiresApproval,
        eventWebsiteUrl: eventWebsiteUrl.trim() || undefined,
        hashtag: hashtag.trim() || undefined,
        targetAudience: targetAudience.trim() || undefined,
        objectives: objectives.trim() || undefined,
      };

      await eventService.updateEvent(eventId, updates);
      Alert.alert('Success', 'Event updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      ErrorHandler.handle(err, 'updateEvent');
      Alert.alert('Error', 'Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading event..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
            }}
          >
            Edit Event
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Save size={20} color={saving ? colors.text.tertiary : brand.primary} />
              <Text
                style={{
                  color: saving ? colors.text.tertiary : brand.primary,
                  fontWeight: typography.weight.semibold,
                }}
              >
                Save
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Name */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Event Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter event name"
              placeholderTextColor={colors.text.tertiary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
              }}
            />
          </View>

          {/* Description */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your event"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Event Type */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Event Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl }}>
                {EVENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setEventType(type.value)}
                    style={{
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.full,
                      backgroundColor: eventType === type.value ? brand.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: eventType === type.value ? brand.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: eventType === type.value ? '#FFFFFF' : colors.text.primary,
                        fontWeight: typography.weight.semibold,
                        fontSize: typography.size.sm,
                      }}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Date & Time */}
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              Date & Time
            </Text>
            <TextInput
              value={startDateTime}
              onChangeText={setStartDateTime}
              placeholder="Start: YYYY-MM-DD HH:MM:SS"
              placeholderTextColor={colors.text.tertiary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
              }}
            />
            <TextInput
              value={endDateTime}
              onChangeText={setEndDateTime}
              placeholder="End: YYYY-MM-DD HH:MM:SS"
              placeholderTextColor={colors.text.tertiary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
              }}
            />
          </View>

          {/* Location */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Location / Website URL
            </Text>
            <TextInput
              value={eventWebsiteUrl}
              onChangeText={setEventWebsiteUrl}
              placeholder="Enter location or URL"
              placeholderTextColor={colors.text.tertiary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
              }}
            />
          </View>

          {/* Capacity */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Capacity
            </Text>
            <TextInput
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Max attendees"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
              }}
            />
          </View>

          {/* Hashtag */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Hashtag
            </Text>
            <TextInput
              value={hashtag}
              onChangeText={setHashtag}
              placeholder="#EventHashtag"
              placeholderTextColor={colors.text.tertiary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
              }}
            />
          </View>

          {/* Target Audience */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Target Audience
            </Text>
            <TextInput
              value={targetAudience}
              onChangeText={setTargetAudience}
              placeholder="Who is this event for?"
              placeholderTextColor={colors.text.tertiary}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Objectives */}
          <View>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
              Objectives
            </Text>
            <TextInput
              value={objectives}
              onChangeText={setObjectives}
              placeholder="What are the goals of this event?"
              placeholderTextColor={colors.text.tertiary}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.size.base,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Settings */}
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              Settings
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
              }}
            >
              <Text style={{ color: colors.text.primary }}>Public Event</Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: colors.border, true: brand.primary }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
              }}
            >
              <Text style={{ color: colors.text.primary }}>Requires Approval</Text>
              <Switch
                value={requiresApproval}
                onValueChange={setRequiresApproval}
                trackColor={{ false: colors.border, true: brand.primary }}
              />
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: spacing['2xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={saving} message="Saving changes..." />
    </SafeAreaView>
  );
}
