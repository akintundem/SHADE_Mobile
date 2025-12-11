import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Users, CalendarClock, CheckCircle, Plus, Minus, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { eventService } from '../../../services/eventService';
import { EventCapacityResponse } from '../../../../../common/types';
import { DateTimePickerModal } from '../../../../../common/datetime';
import { dateUtils } from '../../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../../common/utils/constants';
import { ErrorHandler } from '../../../../../common/utils/errorHandler';
import { isFullEventResponse, Event, EventStatus } from '../../../types/events';

type RouteParams = { eventId: string };

// Helper function to create EventCapacityResponse from Event data
const createCapacityResponse = (event: Event): EventCapacityResponse => {
  const capacity = event.capacity ?? 0;
  const currentAttendeeCount = event.currentAttendeeCount ?? 0;
  const availableSpots = Math.max(0, capacity - currentAttendeeCount);
  const utilizationPercentage = capacity > 0 ? (currentAttendeeCount / capacity) * 100 : 0;
  const isRegistrationOpen = event.eventStatus === EventStatus.REGISTRATION_OPEN;

  return {
    eventId: event.id,
    capacity,
    currentAttendeeCount,
    availableSpots,
    utilizationPercentage,
    isRegistrationOpen,
  };
};

// Number Input Component
const NumberInput = ({
  value,
  onChange,
  min = 1,
  max = 10000,
  label,
  icon: Icon,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        {Icon && <Icon size={16} color={colors.text.secondary} />}
        <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.text.primary,
          borderRadius: borderRadius.xl,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          style={{
            padding: spacing.md,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            opacity: value <= min ? 0.3 : 1,
          }}
        >
          <Minus size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.md }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size['2xl'], fontWeight: typography.weight.bold }}>
            {value}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          style={{
            padding: spacing.md,
            borderLeftWidth: 1,
            borderLeftColor: colors.border,
            opacity: value >= max ? 0.3 : 1,
          }}
        >
          <Plus size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Date Picker Button Component
const DatePickerButton = ({
  value,
  onSelect,
  label,
  icon: Icon,
}: {
  value: Date | null;
  onSelect: (date: Date, time: { hour: number; minute: number }) => void;
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (date: Date, time: { hour: number; minute: number }) => {
    const combined = new Date(date);
    combined.setHours(time.hour, time.minute, 0, 0);
    onSelect(combined, time);
    setShowPicker(false);
  };

  const displayValue = value
    ? dateUtils.formatDate(value.toISOString(), DATE_FORMATS.DISPLAY_DATETIME)
    : 'Not set';

  return (
    <>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {Icon && <Icon size={16} color={colors.text.secondary} />}
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.medium }}>
            {displayValue}
          </Text>
          <CalendarClock size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        visible={showPicker}
        initialDate={value || new Date()}
        initialTime={value ? { hour: value.getHours(), minute: value.getMinutes() } : undefined}
        onClose={() => setShowPicker(false)}
        onConfirm={handleConfirm}
        title="Select Registration Deadline"
      />
    </>
  );
};

// Stats Card Component
const StatsCard = ({ capacityInfo }: { capacityInfo: EventCapacityResponse | null }) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  if (!capacityInfo) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.text.secondary }}>No capacity data available</Text>
      </View>
    );
  }

  const { currentAttendeeCount = 0, capacity = 0, availableSpots = 0, utilizationPercentage = 0 } = capacityInfo;
  const isFull = availableSpots === 0;
  const isNearFull = utilizationPercentage >= 80;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.text.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Users size={24} color={colors.text.primary} />
        <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }}>
          Attendance Overview
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Registered</Text>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.bold }}>
            {currentAttendeeCount}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Capacity</Text>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.bold }}>
            {capacity}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Available</Text>
          <Text
            style={{
              color: isFull ? '#ef4444' : isNearFull ? '#f59e0b' : colors.text.primary,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
            }}
          >
            {availableSpots}
          </Text>
        </View>

        <View
          style={{
            marginTop: spacing.sm,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Utilization</Text>
            <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
              {utilizationPercentage.toFixed(1)}%
            </Text>
          </View>
          <View
            style={{
              marginTop: spacing.xs,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min(utilizationPercentage, 100)}%`,
                backgroundColor: isFull ? '#ef4444' : isNearFull ? '#f59e0b' : colors.text.primary,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// Action Button Component
const ActionButton = ({
  icon: Icon,
  label,
  onPress,
  disabled,
  variant = 'default',
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'primary';
}) => {
  const { colors, spacing, borderRadius, typography, brand } = useTheme();

  const getStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          borderColor: '#ef4444',
          backgroundColor: disabled ? colors.background : 'transparent',
          textColor: '#ef4444',
        };
      case 'primary':
        return {
          borderColor: brand.primary,
          backgroundColor: disabled ? colors.background : brand.primary,
          textColor: colors.text.inverse,
        };
      default:
        return {
          borderColor: colors.text.primary,
          backgroundColor: disabled ? colors.background : 'transparent',
          textColor: colors.text.primary,
        };
    }
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon size={18} color={styles.textColor} />
      <Text style={{ color: styles.textColor, fontWeight: typography.weight.semibold, textTransform: 'uppercase', fontSize: typography.size.sm }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ManageCapacityScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius, brand } = useTheme();

  const [capacityInfo, setCapacityInfo] = useState<EventCapacityResponse | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [capacity, setCapacity] = useState<number>(0);
  const [originalCapacity, setOriginalCapacity] = useState<number>(0);
  const [originalDeadline, setOriginalDeadline] = useState<Date | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'open' | 'closed'>('closed');
  const [originalRegistrationStatus, setOriginalRegistrationStatus] = useState<'open' | 'closed'>('closed');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!params?.eventId) {
      Alert.alert('Error', 'Event ID is missing. Please try again.');
      navigation.goBack();
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      const eventData = await eventService.getEvent(params.eventId);

      // Only process if we have full event data (not feed response)
      if (!isFullEventResponse(eventData)) {
        Alert.alert('Error', 'Unable to load full event details. Capacity management requires full access.');
        return;
      }

      const event = eventData as Event;

      // Create capacity response from event data
      const capacityResponse = createCapacityResponse(event);
      setCapacityInfo(capacityResponse);
      setCapacity(capacityResponse.capacity || 0);
      setOriginalCapacity(capacityResponse.capacity || 0);

      // Set registration status
      const newStatus = event.eventStatus === EventStatus.REGISTRATION_OPEN ? 'open' : 'closed';
      setRegistrationStatus(newStatus);
      setOriginalRegistrationStatus(newStatus);

      // Set registration deadline
      const newDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
      setDeadline(newDeadline);
      setOriginalDeadline(newDeadline);
      
      setHasChanges(false);
    } catch (error) {
      const errorMessage = (error as { message?: string })?.message || 'Unable to load capacity details.';
      ErrorHandler.handle(error, 'loadCapacityDetails');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params?.eventId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  // Track changes
  useEffect(() => {
    const capacityChanged = capacity !== originalCapacity;
    const deadlineChanged = deadline?.getTime() !== originalDeadline?.getTime();
    const statusChanged = registrationStatus !== originalRegistrationStatus;
    setHasChanges(capacityChanged || deadlineChanged || statusChanged);
  }, [capacity, deadline, registrationStatus, originalCapacity, originalDeadline, originalRegistrationStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const handleSaveChanges = useCallback(async () => {
    if (!params?.eventId) {
      Alert.alert('Error', 'Event ID is missing.');
      return;
    }
    if (capacity <= 0) {
      Alert.alert('Invalid Input', 'Capacity must be greater than 0.');
      return;
    }
    
    setBusy(true);
    try {
      // Handle registration status change
      if (registrationStatus !== originalRegistrationStatus) {
        if (registrationStatus === 'open') {
          await eventService.openRegistration(params.eventId);
        } else {
          await eventService.closeRegistration(params.eventId);
        }
      }

      const updates: Partial<Event> = {};
      
      // Add capacity if changed
      if (capacity !== originalCapacity) {
        updates.capacity = capacity;
      }
      
      // Add deadline if changed
      if (deadline?.getTime() !== originalDeadline?.getTime()) {
        updates.registrationDeadline = deadline?.toISOString() || null;
      }

      // Update event if there are other changes
      if (Object.keys(updates).length > 0) {
        await eventService.updateEvent(params.eventId, updates);
      }

      // Reload to get fresh data
      await load(true);
      Alert.alert('Success', 'Changes saved successfully.');
    } catch (error) {
      ErrorHandler.handle(error, 'saveChanges');
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Failed to save changes.');
    } finally {
      setBusy(false);
    }
  }, [capacity, deadline, registrationStatus, load, originalCapacity, originalDeadline, originalRegistrationStatus, params?.eventId]);

  const handleDeadlineChange = useCallback((date: Date, _time: { hour: number; minute: number }) => {
    setDeadline(date);
  }, []);

  const handleRegistrationToggle = useCallback(
    (action: 'open' | 'close') => {
      // Update state immediately for responsive UI
      if (action === 'open') {
        setRegistrationStatus('open');
      } else {
        setRegistrationStatus('closed');
      }
    },
    [],
  );

  // Handle back navigation with unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!hasChanges) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them before leaving?',
        [
          {
            text: "Don't Save",
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: () => {
              handleSaveChanges().then(() => {
                navigation.dispatch(e.data.action);
              }).catch(() => {
                // If save fails, still allow navigation
                navigation.dispatch(e.data.action);
              });
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [hasChanges, navigation, handleSaveChanges]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs, marginRight: spacing.sm }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
            }}
          >
            Capacity & Registration
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
            }}
          >
            Capacity & Registration
          </Text>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSaveChanges} 
          disabled={!hasChanges || busy}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: borderRadius.lg,
            backgroundColor: hasChanges && !busy ? '#000' : colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: (!hasChanges || busy) ? 0.5 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <CheckCircle2 size={20} color={hasChanges ? colors.text.inverse : colors.text.secondary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={brand.primary}
            colors={[brand.primary]}
          />
        }
      >
        {/* Stats Overview */}
        <StatsCard capacityInfo={capacityInfo} />

        {/* Capacity Settings */}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
            Maximum Capacity
          </Text>
          <NumberInput value={capacity} onChange={setCapacity} label="Capacity" icon={Users} />
        </View>

        {/* Registration Deadline */}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
            Registration Deadline
          </Text>
          <DatePickerButton value={deadline} onSelect={handleDeadlineChange} label="Deadline" icon={CalendarClock} />
        </View>

        {/* Registration Status Toggle */}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
            Registration Status
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => handleRegistrationToggle('open')}
              disabled={busy}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.xl,
                borderWidth: 2,
                borderColor: registrationStatus === 'open' 
                  ? '#000' 
                  : registrationStatus === 'closed' 
                    ? colors.semantic.success 
                    : colors.border,
                backgroundColor: registrationStatus === 'open' ? '#000' : colors.background,
                opacity: busy ? 0.5 : 1,
              }}
            >
              {registrationStatus === 'open' && <CheckCircle size={18} color={colors.text.inverse} />}
              <Text 
                style={{ 
                  color: registrationStatus === 'open' ? colors.text.inverse : colors.text.primary,
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.sm,
                }}
              >
                Open
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRegistrationToggle('close')}
              disabled={busy}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.xl,
                borderWidth: 2,
                borderColor: registrationStatus === 'closed' 
                  ? '#000' 
                  : registrationStatus === 'open' 
                    ? colors.semantic.error 
                    : colors.border,
                backgroundColor: registrationStatus === 'closed' ? '#000' : colors.background,
                opacity: busy ? 0.5 : 1,
              }}
            >
              {registrationStatus === 'closed' && <CheckCircle size={18} color={colors.text.inverse} />}
              <Text 
                style={{ 
                  color: registrationStatus === 'closed' ? colors.text.inverse : colors.text.primary,
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.sm,
                }}
              >
                Closed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageCapacityScreen;
