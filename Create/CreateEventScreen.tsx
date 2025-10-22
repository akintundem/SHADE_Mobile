import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Globe, Users, CalendarDays, Clock, MapPin, Plus, Image as ImageIcon, DollarSign, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAgent } from '../Agent/AgentProvider';
import { AgentBanner } from '../components/AgentBanner';
import { MessageSquare } from 'lucide-react-native';
import { AgentChatSheet } from '../components/AgentChatSheet';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { LoadingOverlay } from '../components/LoadingStates';
import { eventService } from '../services/eventService';
import { CreateEventRequest, EventType, EventStatus } from '../types';
import { createEventValidator, useFormValidation } from '../utils/formValidation';
import { ErrorHandler } from '../utils/errorHandler';
import { GestureHandler } from '../utils/gestureHandler';

type Props = { onClose: () => void; onCreate?: () => void };

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  const [isPublic, setPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>(['Music', 'Amapiano', 'Fashion', 'Food', 'Culture', 'Dance']);
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
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { setContext, ask } = useAgent();
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = React.useRef<any>(null);
  const sectionYRef = React.useRef<Record<string, number>>({});

  // Form validation
  const { errors, validateField, setFieldTouched, getFieldError, validateForm } = useFormValidation(createEventValidator);

  // Memoized form data for validation
  const formData = useMemo(() => ({
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    location: locationName,
    capacity: capacity ? Number(capacity) : undefined,
    price: !free && price ? Number(price) : undefined,
  }), [title, description, startDate, startTime, endDate, endTime, locationName, capacity, price, free]);

  // Validation result
  const validationResult = useMemo(() => validateForm(formData), [formData, validateForm]);
  const canCreate = validationResult.isValid && !isLoading;

  const scrollTo = (key: string) => {
    const y = sectionYRef.current[key];
    if (typeof y === 'number' && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - spacing.lg), animated: true });
    }
  };

  React.useEffect(() => {
    const ctx = {
      surface: 'create_event' as const,
      form: {
        title,
        description,
        access: free ? 'free' : 'paid',
        price: Number(price) || undefined,
        capacity: Number(capacity) || undefined,
      },
    };
    setContext(ctx);
    const id = setTimeout(() => { ask(ctx); }, 450);
    return () => clearTimeout(id);
  }, [title, description, free, price, capacity]);

  const handleCreateEvent = useCallback(async () => {
    if (!canCreate) return;
    
    setIsLoading(true);
    try {
      // Combine date and time
      const startDateTime = `${startDate}T${startTime}:00.000Z`;
      const endDateTime = endDate && endTime ? `${endDate}T${endTime}:00.000Z` : startDateTime;

      const eventData: CreateEventRequest = {
        name: title.trim(),
        description: description.trim(),
        eventType: EventType.PARTY, // Default to PARTY, could be made configurable
        eventStatus: EventStatus.DRAFT,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        capacity: capacity ? Number(capacity) : undefined,
        isPublic: isPublic,
        requiresApproval: false,
        qrCodeEnabled: true,
      };

      const createdEvent = await eventService.createEvent(eventData);
      
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
        ]
      );
    } catch (error) {
      ErrorHandler.handle(error, 'createEvent');
    } finally {
      setIsLoading(false);
    }
  }, [canCreate, startDate, startTime, endDate, endTime, address, locationName, title, description, capacity, free, price, tags, onCreate, onClose]);

  return (
    <SafeAreaWrapper edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header with swipe indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border }}>
          <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, fontSize: 18 }}>Create Event</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {/* Swipe indicator */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
          <View style={{ width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
        </View>

      {/* Shade banner pinned under header (outside scroll) */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <AgentBanner onOpenChat={() => setChatOpen(true)} onSelect={(text) => {
          const t = text.toLowerCase();
          if (t.includes('name') || t.includes('title') || t.includes('description')) return scrollTo('details');
          if (t.includes('date') || t.includes('time')) return scrollTo('datetime');
          if (t.includes('location')) return scrollTo('location');
          if (t.includes('price') || t.includes('paid') || t.includes('access')) return scrollTo('access');
          if (t.includes('capacity')) return scrollTo('capacity');
          if (t.includes('contribution')) return scrollTo('contributions');
          if (t.includes('collaborator')) return scrollTo('collaborators');
          if (t.includes('tag')) return scrollTo('tags');
        }} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: spacing['4xl'] }}>
        {/* Cover image */}
        <Section title="Cover image">
          <TouchableOpacity activeOpacity={0.85} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.xl, overflow: 'hidden' }}>
            <View style={{ height: 160, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}>
              <ImageIcon size={20} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.secondary }}>Add cover image</Text>
            </View>
          </TouchableOpacity>
        </Section>

        {/* Basic details */}
        <View onLayout={(e) => { sectionYRef.current['details'] = e.nativeEvent.layout.y; }}>
        <Section title="Details">
          <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Event name" />
          <Input 
            placeholder="Give your event a name" 
            value={title} 
            onChangeText={(text) => {
              setTitle(text);
              validateField('title', text);
            }}
            onBlur={() => setFieldTouched('title')}
            error={getFieldError('title')}
          />
          <View style={{ height: spacing.sm }} />
          <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Description" />
          <Input 
            placeholder="Describe your event" 
            multiline 
            numberOfLines={4} 
            style={{ height: 100, paddingTop: spacing.md }} 
            value={description} 
            onChangeText={(text) => {
              setDescription(text);
              validateField('description', text);
            }}
            onBlur={() => setFieldTouched('description')}
            error={getFieldError('description')}
          />
        </Section>
        </View>
        {/* Date & Time laid out in two columns like the mock */}
        <View onLayout={(e) => { sectionYRef.current['datetime'] = e.nativeEvent.layout.y; }}>
        <Section title="Date & Time">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<CalendarDays size={16} color={colors.text.secondary} />} label="Start Date" />
              <Input placeholder="yyyy-mm-dd" value={startDate} onChangeText={setStartDate} />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<Clock size={16} color={colors.text.secondary} />} label="Start Time" />
              <Input placeholder="--:-- --" highlighted value={startTime} onChangeText={setStartTime} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<CalendarDays size={16} color={colors.text.secondary} />} label="End Date (Optional)" />
              <Input placeholder="yyyy-mm-dd" value={endDate} onChangeText={setEndDate} />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<Clock size={16} color={colors.text.secondary} />} label="End Time (Optional)" />
              <Input placeholder="--:-- --" value={endTime} onChangeText={setEndTime} />
            </View>
          </View>
        </Section>
        </View>

        {/* Location block boxed as in mock */}
        <View onLayout={(e) => { sectionYRef.current['location'] = e.nativeEvent.layout.y; }}>
        <Section title="Location">
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md }}>
            <Input placeholder="Enter location name" value={locationName} onChangeText={setLocationName} />
            <Input placeholder="Full address (optional)" style={{ marginTop: spacing.sm }} value={address} onChangeText={setAddress} />
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
              <MapPin size={16} color={colors.text.secondary} />
              <Text style={{ color: colors.text.secondary }}>Detect current location</Text>
            </TouchableOpacity>
          </View>
        </Section>
        </View>

        {/* Visibility */}
        <Section title="Visibility">
          <Row label="Public" icon={<Globe size={16} color={colors.text.secondary} />}>
            <Switch value={isPublic} onValueChange={setPublic} />
          </Row>
          <Text style={{ color: colors.text.tertiary, marginTop: spacing.xs }}>{isPublic ? 'Visible to everyone' : 'Visible to invited only'}</Text>
        </Section>

        {/* Access */}
        <View onLayout={(e) => { sectionYRef.current['access'] = e.nativeEvent.layout.y; }}>
        <Section title="Access">
          <RadioRow label="Free" active={free} onPress={() => setFree(true)} />
          <RadioRow label="Paid" active={!free} onPress={() => setFree(false)} />
          {!free && (
            <View style={{ marginTop: spacing.sm }}>
              <FieldLabel icon={<DollarSign size={16} color={colors.text.secondary} />} label="Price (USD)" />
              <Input placeholder="e.g. 25" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
            </View>
          )}
        </Section>
        </View>

        {/* Capacity */}
        <View onLayout={(e) => { sectionYRef.current['capacity'] = e.nativeEvent.layout.y; }}>
        <Section title="Capacity">
          <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Max attendees (optional)" />
          <Input placeholder="e.g. 150" keyboardType="number-pad" value={capacity} onChangeText={setCapacity} />
        </Section>
        </View>

        {/* Contributions */}
        <View onLayout={(e) => { sectionYRef.current['contributions'] = e.nativeEvent.layout.y; }}>
        <Section title="Contributions (optional)">
          <Row label="Enable contributions" icon={<DollarSign size={16} color={colors.text.secondary} />}>
            <Switch value={enableContrib} onValueChange={setEnableContrib} />
          </Row>
          {enableContrib && (
            <View style={{ marginTop: spacing.sm }}>
              <Input placeholder="Suggested contribution (USD)" keyboardType="decimal-pad" />
            </View>
          )}
        </Section>
        </View>

        {/* Collaborators */}
        <View onLayout={(e) => { sectionYRef.current['collaborators'] = e.nativeEvent.layout.y; }}>
        <Section title="Add collaborators">
          {[{ name: 'Alex Martinez', handle: '@alex_m' }, { name: 'Sarah Johnson', handle: '@sarah_j' }, { name: 'Mike Rodriguez', handle: '@mike_r' }].map(u => (
            <View key={u.handle} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.sm }}>
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>{u.name}</Text>
              <Text style={{ color: colors.text.tertiary, marginTop: spacing.xs }}>{u.handle}</Text>
            </View>
          ))}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
            <Plus size={16} color={colors.text.secondary} />
            <Text style={{ color: colors.text.secondary }}>Add more collaborators</Text>
          </TouchableOpacity>
        </Section>
        </View>

        {/* Tags */}
        <View onLayout={(e) => { sectionYRef.current['tags'] = e.nativeEvent.layout.y; }}>
        <Section title="Tags">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Input placeholder="Add a tag..." style={{ flex: 1 }} />
            <TouchableOpacity style={{ backgroundColor: brand.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
            {tags.map(t => (
              <View key={t} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <Text style={{ color: colors.text.primary }}>+{t}</Text>
              </View>
            ))}
          </View>
        </Section>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.lg, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 48, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={!canCreate || isLoading} onPress={handleCreateEvent} style={{ flex: 1, height: 48, borderRadius: 999, backgroundColor: canCreate && !isLoading ? brand.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating chat button */}
      <TouchableOpacity onPress={() => setChatOpen(true)} activeOpacity={0.9} style={{ position: 'absolute', right: spacing.lg, bottom: 96, width: 52, height: 52, borderRadius: 26, backgroundColor: brand.primary, alignItems: 'center', justifyContent: 'center' }}>
        <MessageSquare size={20} color="#FFFFFF" />
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
      <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, icon, children }: any) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
        {icon}
        <Text style={{ color: colors.text.primary }}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function Input({ 
  placeholder, 
  style, 
  highlighted = false, 
  value, 
  onChangeText, 
  error,
  onBlur,
  ...props 
}: any) {
  const { colors, borderRadius, spacing, brand } = useTheme();
  const hasError = !!error;
  
  return (
    <View>
      <View
        style={[
          {
            borderWidth: highlighted ? 2 : 1,
            borderColor: hasError ? colors.error : highlighted ? brand.primary : colors.border,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            height: 42,
            justifyContent: 'center',
            backgroundColor: colors.surface,
          },
          style,
        ]}
      >
        <TextInput 
          placeholder={placeholder} 
          placeholderTextColor={colors.text.tertiary} 
          style={{ color: colors.text.primary }} 
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          {...props}
        />
      </View>
      {hasError && (
        <Text style={{ 
          color: colors.error, 
          fontSize: 12, 
          marginTop: spacing.xs,
          marginLeft: spacing.xs 
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}

function FieldLabel({ icon, label }: any) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
      {icon}
      <Text style={{ color: colors.text.primary }}>{label}</Text>
    </View>
  );
}

function RadioRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, spacing, brand } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs }}>
      <View style={{ height: 16, width: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        {active ? <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: brand.primary }} /> : null}
      </View>
      <Text style={{ color: colors.text.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}
