import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Users, CalendarDays, Clock, Globe, Hash, Target, BarChart3, Palette, Building, Wifi, Accessibility, Shield, FileText, Settings } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useFormValidation } from '../../../../shared/utils/formValidation';
import { CreateEventRequest, EventType, EventStatus } from '../../../../shared/types';
import { eventService } from '../../../../shared/services';
import { useErrorHandle } from '../../../../shared/hooks/useErrorHandler';
import ErrorM from '../../../../shared/components/common/ErrorModal';
import { Section, FieldLabel, Input, SelectInput, Toggle } from '../../../../shared/components/common/FormComponents';

type Props = { 
  onClose: () => void; 
  onCreate?: (event: any) => void;
};

export default function EnhancedCreateEventScreen({ onClose, onCreate }: Props) {
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'advanced' | 'settings'>('basic');
  
  // Basic Event Information
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('CONFERENCE');
  const [eventStatus, setEventStatus] = useState<EventStatus>('DRAFT');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [qrCodeEnabled, setQrCodeEnabled] = useState(false);

  // Event Details
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [eventWebsiteUrl, setEventWebsiteUrl] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [theme, setTheme] = useState('');
  const [objectives, setObjectives] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [successMetrics, setSuccessMetrics] = useState('');
  const [brandingGuidelines, setBrandingGuidelines] = useState('');

  // Advanced Configuration
  const [venueRequirements, setVenueRequirements] = useState('');
  const [technicalRequirements, setTechnicalRequirements] = useState('');
  const [accessibilityFeatures, setAccessibilityFeatures] = useState('');
  const [emergencyPlan, setEmergencyPlan] = useState('');
  const [backupPlan, setBackupPlan] = useState('');
  const [postEventTasks, setPostEventTasks] = useState('');
  const [metadata, setMetadata] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Form validation
  const { errors, validateField, setFieldTouched, getFieldError, validateForm } = useFormValidation(createEventValidator);

  // Memoized form data for validation
  const formData = useMemo(() => ({
    name,
    description,
    startDateTime,
    endDateTime,
    capacity: capacity ? Number(capacity) : undefined,
  }), [name, description, startDateTime, endDateTime, capacity]);

  // Validation result
  const validationResult = useMemo(() => validateForm(formData), [formData, validateForm]);
  const canCreate = validationResult.isValid && !isLoading;


  const handleCreateEvent = async () => {
    if (!canCreate) return;

    setIsLoading(true);
    try {
      const eventData: CreateEventRequest = {
        name,
        description,
        eventType,
        eventStatus,
        startDateTime,
        endDateTime,
        registrationDeadline,
        capacity: capacity ? Number(capacity) : undefined,
        isPublic,
        requiresApproval,
        qrCodeEnabled,
      };

      const response = await eventService.createEvent(eventData);
      if (response.data) {
        onCreate?.(response.data);
        onClose();
      }
    } catch (err) {
      handleError(err, 'Creating event');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: 'basic', label: 'Basic', icon: <Users size={16} color={colors.text.tertiary} /> },
    { key: 'details', label: 'Details', icon: <FileText size={16} color={colors.text.tertiary} /> },
    { key: 'advanced', label: 'Advanced', icon: <Settings size={16} color={colors.text.tertiary} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} color={colors.text.tertiary} /> },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: spacing.lg, 
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <TouchableOpacity onPress={onClose} style={{ padding: spacing.sm }}>
            <X size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ 
            color: colors.text.primary, 
            fontWeight: '700',
            fontSize: typography.size.lg
          }}>
            Create Event
          </Text>
          <TouchableOpacity 
            onPress={handleCreateEvent}
            disabled={!canCreate}
            style={{ 
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: canCreate ? brand.primary : colors.text.disabled,
              borderRadius: borderRadius.md
            }}
          >
            <Text style={{ 
              color: canCreate ? colors.text.inverse : colors.text.tertiary,
              fontWeight: '600'
            }}>
              {isLoading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.sm, 
          padding: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border
        }}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={{ 
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.full,
                backgroundColor: activeTab === tab.key ? brand.primary : colors.surface
              }}
            >
              {React.cloneElement(tab.icon, { 
                color: activeTab === tab.key ? colors.text.inverse : colors.text.tertiary 
              })}
              <Text style={{ 
                color: activeTab === tab.key ? colors.text.inverse : colors.text.primary,
                fontWeight: '600',
                fontSize: typography.size.sm
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView 
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Event Information">
                <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Event Name" />
                <Input 
                  placeholder="Enter event name" 
                  value={name} 
                  onChangeText={(text) => {
                    setName(text);
                    validateField('name', text);
                  }}
                  onBlur={() => setFieldTouched('name')}
                  error={getFieldError('name')}
                />
                
                <FieldLabel icon={<FileText size={16} color={colors.text.secondary} />} label="Description" />
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

              <Section title="Event Type & Status">
                <FieldLabel icon={<Target size={16} color={colors.text.secondary} />} label="Event Type" />
                <SelectInput
                  value={eventType}
                  onValueChange={setEventType}
                  options={[
                    { label: 'Conference', value: 'CONFERENCE' },
                    { label: 'Workshop', value: 'WORKSHOP' },
                    { label: 'Seminar', value: 'SEMINAR' },
                    { label: 'Networking', value: 'NETWORKING' },
                    { label: 'Social', value: 'SOCIAL' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                />

                <FieldLabel icon={<BarChart3 size={16} color={colors.text.secondary} />} label="Event Status" />
                <SelectInput
                  value={eventStatus}
                  onValueChange={setEventStatus}
                  options={[
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Published', value: 'PUBLISHED' },
                    { label: 'Cancelled', value: 'CANCELLED' },
                    { label: 'Completed', value: 'COMPLETED' },
                  ]}
                />
              </Section>

              <Section title="Date & Time">
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <FieldLabel icon={<CalendarDays size={16} color={colors.text.secondary} />} label="Start Date" />
                    <Input 
                      placeholder="YYYY-MM-DD" 
                      value={startDateTime} 
                      onChangeText={(text) => {
                        setStartDateTime(text);
                        validateField('startDateTime', text);
                      }}
                      onBlur={() => setFieldTouched('startDateTime')}
                      error={getFieldError('startDateTime')}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FieldLabel icon={<Clock size={16} color={colors.text.secondary} />} label="End Date" />
                    <Input 
                      placeholder="YYYY-MM-DD" 
                      value={endDateTime} 
                      onChangeText={setEndDateTime}
                    />
                  </View>
                </View>

                <FieldLabel icon={<CalendarDays size={16} color={colors.text.secondary} />} label="Registration Deadline" />
                <Input 
                  placeholder="YYYY-MM-DD" 
                  value={registrationDeadline} 
                  onChangeText={setRegistrationDeadline}
                />
              </Section>

              <Section title="Capacity & Access">
                <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Capacity" />
                <Input 
                  placeholder="Maximum attendees" 
                  value={capacity} 
                  onChangeText={(text) => {
                    setCapacity(text);
                    validateField('capacity', text);
                  }}
                  onBlur={() => setFieldTouched('capacity')}
                  error={getFieldError('capacity')}
                  keyboardType="numeric"
                />

                <View style={{ gap: spacing.sm }}>
                  <ToggleRow 
                    label="Public Event" 
                    value={isPublic} 
                    onValueChange={setIsPublic}
                    icon={<Globe size={16} color={colors.text.secondary} />}
                  />
                  <ToggleRow 
                    label="Requires Approval" 
                    value={requiresApproval} 
                    onValueChange={setRequiresApproval}
                    icon={<Shield size={16} color={colors.text.secondary} />}
                  />
                  <ToggleRow 
                    label="QR Code Enabled" 
                    value={qrCodeEnabled} 
                    onValueChange={setQrCodeEnabled}
                    icon={<Hash size={16} color={colors.text.secondary} />}
                  />
                </View>
              </Section>
            </View>
          )}

          {/* Event Details Tab */}
          {activeTab === 'details' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Visual Identity">
                <FieldLabel icon={<Palette size={16} color={colors.text.secondary} />} label="Cover Image URL" />
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={coverImageUrl} 
                  onChangeText={setCoverImageUrl}
                />

                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Event Website" />
                <Input 
                  placeholder="https://yourevent.com" 
                  value={eventWebsiteUrl} 
                  onChangeText={setEventWebsiteUrl}
                />

                <FieldLabel icon={<Hash size={16} color={colors.text.secondary} />} label="Hashtag" />
                <Input 
                  placeholder="#YourEvent" 
                  value={hashtag} 
                  onChangeText={setHashtag}
                />

                <FieldLabel icon={<Palette size={16} color={colors.text.secondary} />} label="Theme" />
                <Input 
                  placeholder="Event theme or style" 
                  value={theme} 
                  onChangeText={setTheme}
                />
              </Section>

              <Section title="Event Objectives">
                <FieldLabel icon={<Target size={16} color={colors.text.secondary} />} label="Objectives" />
                <Input 
                  placeholder="What are the main objectives of this event?" 
                  multiline 
                  numberOfLines={3} 
                  value={objectives} 
                  onChangeText={setObjectives}
                />

                <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Target Audience" />
                <Input 
                  placeholder="Who is this event for?" 
                  multiline 
                  numberOfLines={2} 
                  value={targetAudience} 
                  onChangeText={setTargetAudience}
                />

                <FieldLabel icon={<BarChart3 size={16} color={colors.text.secondary} />} label="Success Metrics" />
                <Input 
                  placeholder="How will you measure success?" 
                  multiline 
                  numberOfLines={2} 
                  value={successMetrics} 
                  onChangeText={setSuccessMetrics}
                />
              </Section>

              <Section title="Branding Guidelines">
                <FieldLabel icon={<Palette size={16} color={colors.text.secondary} />} label="Branding Guidelines" />
                <Input 
                  placeholder="Brand colors, fonts, logo usage, etc." 
                  multiline 
                  numberOfLines={4} 
                  value={brandingGuidelines} 
                  onChangeText={setBrandingGuidelines}
                />
              </Section>
            </View>
          )}

          {/* Advanced Configuration Tab */}
          {activeTab === 'advanced' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Venue & Technical Requirements">
                <FieldLabel icon={<Building size={16} color={colors.text.secondary} />} label="Venue Requirements" />
                <Input 
                  placeholder="Space size, layout, amenities needed" 
                  multiline 
                  numberOfLines={3} 
                  value={venueRequirements} 
                  onChangeText={setVenueRequirements}
                />

                <FieldLabel icon={<Wifi size={16} color={colors.text.secondary} />} label="Technical Requirements" />
                <Input 
                  placeholder="AV equipment, internet, power, etc." 
                  multiline 
                  numberOfLines={3} 
                  value={technicalRequirements} 
                  onChangeText={setTechnicalRequirements}
                />

                <FieldLabel icon={<Accessibility size={16} color={colors.text.secondary} />} label="Accessibility Features" />
                <Input 
                  placeholder="Wheelchair access, sign language, etc." 
                  multiline 
                  numberOfLines={2} 
                  value={accessibilityFeatures} 
                  onChangeText={setAccessibilityFeatures}
                />
              </Section>

              <Section title="Risk Management">
                <FieldLabel icon={<AlertTriangle size={16} color={colors.text.secondary} />} label="Emergency Plan" />
                <Input 
                  placeholder="Emergency procedures and contacts" 
                  multiline 
                  numberOfLines={3} 
                  value={emergencyPlan} 
                  onChangeText={setEmergencyPlan}
                />

                <FieldLabel icon={<Shield size={16} color={colors.text.secondary} />} label="Backup Plan" />
                <Input 
                  placeholder="Alternative arrangements if needed" 
                  multiline 
                  numberOfLines={2} 
                  value={backupPlan} 
                  onChangeText={setBackupPlan}
                />
              </Section>

              <Section title="Post-Event">
                <FieldLabel icon={<CheckSquare size={16} color={colors.text.secondary} />} label="Post-Event Tasks" />
                <Input 
                  placeholder="Follow-up actions, thank you notes, etc." 
                  multiline 
                  numberOfLines={3} 
                  value={postEventTasks} 
                  onChangeText={setPostEventTasks}
                />
              </Section>

              <Section title="Additional Information">
                <FieldLabel icon={<FileText size={16} color={colors.text.secondary} />} label="Metadata" />
                <Input 
                  placeholder="Additional notes or custom data" 
                  multiline 
                  numberOfLines={2} 
                  value={metadata} 
                  onChangeText={setMetadata}
                />
              </Section>
            </View>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Event Settings">
                <Text style={{ 
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  marginBottom: spacing.md
                }}>
                  Configure additional settings for your event
                </Text>
                
                <View style={{ gap: spacing.md }}>
                  <ToggleRow 
                    label="Public Event" 
                    value={isPublic} 
                    onValueChange={setIsPublic}
                    icon={<Globe size={16} color={colors.text.secondary} />}
                    description="Make this event visible to everyone"
                  />
                  <ToggleRow 
                    label="Requires Approval" 
                    value={requiresApproval} 
                    onValueChange={setRequiresApproval}
                    icon={<Shield size={16} color={colors.text.secondary} />}
                    description="Manually approve attendees"
                  />
                  <ToggleRow 
                    label="QR Code Enabled" 
                    value={qrCodeEnabled} 
                    onValueChange={setQrCodeEnabled}
                    icon={<Hash size={16} color={colors.text.secondary} />}
                    description="Generate QR codes for check-in"
                  />
                </View>
              </Section>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

