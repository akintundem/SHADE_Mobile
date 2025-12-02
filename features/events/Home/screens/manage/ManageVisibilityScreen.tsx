import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, ShieldCheck, Globe, EyeOff, Upload, CheckCircle2, XCircle } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { eventService } from '../../../services/eventService';
import { Event, EventVisibilityResponse, EventStatus } from '../../../../../common/types';

type RouteParams = { eventId: string };

const ManageVisibilityScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [event, setEvent] = useState<Event | null>(null);
  const [visibility, setVisibility] = useState<EventVisibilityResponse | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [eventData, visibilityData] = await Promise.all([
        eventService.getEvent(params.eventId),
        eventService.getEventVisibility(params.eventId),
      ]);
      setEvent(eventData);
      setVisibility(visibilityData);
      setIsPublic(
        visibilityData?.isPublic ?? (typeof eventData.isPublic === 'boolean' ? eventData.isPublic : true),
      );
      setRequiresApproval(
        visibilityData?.requiresApproval ??
          (typeof eventData.requiresApproval === 'boolean' ? eventData.requiresApproval : false),
      );
    } catch (error) {
      Alert.alert('Error', 'Unable to load event visibility.');
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveVisibility = useCallback(async () => {
    setBusy(true);
    try {
      await eventService.updateEventVisibility(params.eventId, {
        isPublic,
        requiresApproval,
      });
      await load();
      Alert.alert('Success', 'Visibility updated.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Update failed.');
    } finally {
      setBusy(false);
    }
  }, [isPublic, load, params.eventId, requiresApproval]);

  const handleQuick = useCallback(
    async (action: 'public' | 'private' | 'publish' | 'cancel' | 'complete') => {
      setBusy(true);
      try {
        if (action === 'public') {
          await eventService.makeEventPublic(params.eventId);
        } else if (action === 'private') {
          await eventService.makeEventPrivate(params.eventId);
        } else if (action === 'publish') {
          await eventService.publishEvent(params.eventId);
        } else if (action === 'cancel') {
          await eventService.cancelEvent(params.eventId, 'Cancelled via console');
        } else {
          await eventService.completeEvent(params.eventId);
        }
        await load();
        Alert.alert('Success', 'Status updated.');
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Action failed.');
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
            Visibility & Status
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
            <ShieldCheck size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Current status
            </Text>
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            {event ? statusLabel(event.eventStatus) : '—'}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            Visibility: {isPublic ? 'Public' : 'Private'}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            Approval required: {requiresApproval ? 'Yes' : 'No'}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            Updated: {visibility?.updatedAt ?? '—'}
          </Text>
        </View>

        <ToggleRow
          label="Public event"
          active={isPublic}
          onToggle={() => setIsPublic(prev => !prev)}
        />
        <ToggleRow
          label="Require approval for new attendees"
          active={requiresApproval}
          onToggle={() => setRequiresApproval(prev => !prev)}
        />

        <TouchableOpacity
          onPress={handleSaveVisibility}
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
            Save Visibility
          </Text>
        </TouchableOpacity>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>QUICK ACTIONS</Text>
          <ActionRow
            icon={Globe}
            label="Make Public"
            onPress={() => handleQuick('public')}
            disabled={busy}
          />
          <ActionRow
            icon={EyeOff}
            label="Make Private"
            onPress={() => handleQuick('private')}
            disabled={busy}
          />
          <ActionRow
            icon={Upload}
            label="Publish"
            onPress={() => handleQuick('publish')}
            disabled={busy}
          />
          <ActionRow
            icon={CheckCircle2}
            label="Mark Complete"
            onPress={() => handleQuick('complete')}
            disabled={busy}
          />
          <ActionRow
            icon={XCircle}
            label="Cancel Event"
            onPress={() => handleQuick('cancel')}
            disabled={busy}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ToggleRow = ({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.text.primary,
        borderRadius: borderRadius.lg,
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: typography.size.sm }}>{label}</Text>
      <View
        style={{
          width: 36,
          height: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.text.primary,
          padding: 2,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: active ? colors.text.primary : colors.background,
            alignSelf: active ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const ActionRow = ({
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: color,
        borderRadius: borderRadius.lg,
      }}
    >
      <Icon size={18} color={color} />
      <Text style={{ color, fontWeight: typography.weight.semibold }}>{label}</Text>
    </TouchableOpacity>
  );
};

const statusLabel = (status?: EventStatus) => {
  if (!status) return 'Unknown';
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default ManageVisibilityScreen;

