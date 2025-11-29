import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Users, CalendarClock, Unlock, Lock, Plus, Minus, RefreshCcw } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import { EventCapacityResponse } from '../../../../../shared/types';
import { DateTimePickerModal } from '../../../../../common/DateTimePickerModal';
import { dateUtils } from '../../../../../shared/utils/helpers';
import { DATE_FORMAT } from '../../../../../shared/utils/constants';

type RouteParams = { eventId: string };

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
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [capacityInfo, setCapacityInfo] = useState<EventCapacityResponse | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [capacity, setCapacity] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [info, event] = await Promise.all([
        eventService.getEventCapacity(params.eventId),
        eventService.getEvent(params.eventId),
      ]);
      setCapacityInfo(info);
      setCapacity(info.capacity || 0);
      if (event.registrationDeadline) {
        setDeadline(new Date(event.registrationDeadline));
      } else {
        setDeadline(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load capacity details.');
      console.warn(error);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleUpdateCapacity = useCallback(async () => {
    if (capacity <= 0) {
      Alert.alert('Invalid capacity', 'Capacity must be greater than 0.');
      return;
    }
    setBusy(true);
    try {
      await eventService.updateEventCapacity(params.eventId, { capacity });
      await load();
      Alert.alert('Success', 'Capacity updated successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Failed to update capacity.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [capacity, load, params.eventId]);

  const handleUpdateDeadline = useCallback(
    async (date: Date, _time: { hour: number; minute: number }) => {
      setDeadline(date);
      setBusy(true);
      try {
        await eventService.updateRegistrationDeadline(params.eventId, { deadline: date.toISOString() });
        Alert.alert('Success', 'Registration deadline updated successfully.');
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Failed to update deadline.');
        console.warn(error);
      } finally {
        setBusy(false);
      }
    },
    [params.eventId],
  );

  const handleRegistrationToggle = useCallback(
    async (action: 'open' | 'close') => {
      setBusy(true);
      try {
        if (action === 'open') {
          await eventService.openRegistration(params.eventId);
        } else {
          await eventService.closeRegistration(params.eventId);
        }
        await load();
        Alert.alert('Success', `Registration ${action === 'open' ? 'opened' : 'closed'} successfully.`);
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Action failed.');
        console.warn(error);
      } finally {
        setBusy(false);
      }
    },
    [load, params.eventId],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
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
              textTransform: 'uppercase',
            }}
          >
            Capacity & Registration
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing} style={{ padding: spacing.xs }}>
          <RefreshCcw size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <StatsCard capacityInfo={capacityInfo} />

        {/* Capacity Settings */}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
            Capacity Settings
          </Text>
          <NumberInput value={capacity} onChange={setCapacity} label="Maximum Capacity" icon={Users} />
          <ActionButton
            icon={Users}
            label="Update Capacity"
            onPress={handleUpdateCapacity}
            disabled={busy || capacity <= 0}
            variant="primary"
          />
        </View>

        {/* Registration Deadline */}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
            Registration Deadline
          </Text>
          <DatePickerButton value={deadline} onSelect={handleUpdateDeadline} label="Deadline" icon={CalendarClock} />
        </View>

        {/* Registration Controls */}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
            Registration Status
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <ActionButton
                icon={Unlock}
                label="Open"
                onPress={() => handleRegistrationToggle('open')}
                disabled={busy}
                variant="primary"
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                icon={Lock}
                label="Close"
                onPress={() => handleRegistrationToggle('close')}
                disabled={busy}
                variant="destructive"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageCapacityScreen;
