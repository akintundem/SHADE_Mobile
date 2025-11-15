import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Users, CalendarClock, Unlock, Lock } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import { EventCapacityResponse } from '../../../../../shared/types';

type RouteParams = { eventId: string };

const ManageCapacityScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [capacityInfo, setCapacityInfo] = useState<EventCapacityResponse | null>(null);
  const [deadline, setDeadline] = useState('');
  const [capacity, setCapacity] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [info] = await Promise.all([eventService.getEventCapacity(params.eventId)]);
      setCapacityInfo(info);
      setCapacity(info.capacity != null ? String(info.capacity) : '');
      const event = await eventService.getEvent(params.eventId);
      setDeadline(event.registrationDeadline ?? '');
    } catch (error) {
      Alert.alert('Error', 'Unable to load capacity details.');
      console.warn(error);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateCapacity = useCallback(async () => {
    const value = parseInt(capacity, 10);
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid capacity', 'Enter a positive integer.');
      return;
    }
    setBusy(true);
    try {
      await eventService.updateEventCapacity(params.eventId, { capacity: value });
      await load();
      Alert.alert('Success', 'Capacity updated.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Update failed.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [capacity, load, params.eventId]);

  const handleUpdateDeadline = useCallback(async () => {
    if (!deadline) {
      Alert.alert('Missing deadline', 'Enter an ISO 8601 datetime.');
      return;
    }
    setBusy(true);
    try {
      await eventService.updateRegistrationDeadline(params.eventId, { deadline });
      Alert.alert('Success', 'Registration deadline updated.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Update failed.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [deadline, params.eventId]);

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
        Alert.alert('Success', `Registration ${action === 'open' ? 'opened' : 'closed'}.`);
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
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Users size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Attendance
            </Text>
          </View>
          <Text style={{ color: colors.text.secondary }}>
            {capacityInfo
              ? `${capacityInfo.currentAttendeeCount ?? 0} attending • ${capacityInfo.availableSpots} spots available`
              : 'No capacity data yet.'}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
            }}
          >
            Utilization: {capacityInfo?.utilizationPercentage?.toFixed(1) ?? '0.0'}%
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>CAPACITY</Text>
          <TextInput
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
            placeholder="200"
            placeholderTextColor={colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
          <TouchableOpacity
            onPress={handleUpdateCapacity}
            disabled={busy}
            style={{
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.text.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              Update Capacity
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <CalendarClock size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Registration deadline
            </Text>
          </View>
          <TextInput
            value={deadline}
            onChangeText={setDeadline}
            placeholder="2025-05-01T18:00:00Z"
            placeholderTextColor={colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
          <TouchableOpacity
            onPress={handleUpdateDeadline}
            disabled={busy}
            style={{
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.text.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              Save Deadline
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <ActionButton
            icon={Unlock}
            label="Open Registration"
            onPress={() => handleRegistrationToggle('open')}
            disabled={busy}
          />
          <ActionButton
            icon={Lock}
            label="Close Registration"
            onPress={() => handleRegistrationToggle('close')}
            disabled={busy}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  onPress,
  disabled,
  destructive,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const color = destructive ? colors.error?.text ?? '#ef4444' : colors.text.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: color,
      }}
    >
      <Icon size={18} color={color} />
      <Text style={{ color, fontWeight: typography.weight.semibold, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ManageCapacityScreen;

