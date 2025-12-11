import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  ShieldCheck,
  Globe,
  EyeOff,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { eventService } from '../../../services/eventService';
import { Event, EventVisibilityResponse, EventStatus } from '../../../../../common/types';

type RouteParams = { eventId: string };

const ManageVisibilityScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const eventId = params?.eventId;

  const [event, setEvent] = useState<Event | null>(null);
  const [visibility, setVisibility] = useState<EventVisibilityResponse | null>(null);
  const [currentStatus, setCurrentStatus] = useState<EventStatus | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [busy, setBusy] = useState(false);
  const [initialIsPublic, setInitialIsPublic] = useState<boolean | null>(null);
  const [initialRequiresApproval, setInitialRequiresApproval] = useState<boolean | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const hasVisibilityChanges =
    initialIsPublic !== null &&
    initialRequiresApproval !== null &&
    (isPublic !== initialIsPublic || requiresApproval !== initialRequiresApproval);

  const load = useCallback(async () => {
    if (!eventId) {
      Alert.alert('Error', 'Event ID is missing. Please reopen from the event details.');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const [eventData, visibilityData, statusData] = await Promise.all([
        eventService.getEvent(eventId),
        eventService.getEventVisibility(eventId),
        eventService.getEventStatus(eventId).catch(() => null),
      ]);
      setEvent(eventData);
      setVisibility(visibilityData);
      setCurrentStatus(statusData || eventData.eventStatus);
      setIsPublic(
        visibilityData?.isPublic ?? (typeof eventData.isPublic === 'boolean' ? eventData.isPublic : true),
      );
      setInitialIsPublic(
        visibilityData?.isPublic ?? (typeof eventData.isPublic === 'boolean' ? eventData.isPublic : true),
      );
      setRequiresApproval(
        visibilityData?.requiresApproval ??
          (typeof eventData.requiresApproval === 'boolean' ? eventData.requiresApproval : false),
      );
      setInitialRequiresApproval(
        visibilityData?.requiresApproval ??
          (typeof eventData.requiresApproval === 'boolean' ? eventData.requiresApproval : false),
      );
    } catch (error) {
      const msg = (error as { message?: string })?.message || 'Unable to load event data.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }, [eventId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveVisibility = useCallback(async () => {
    if (!eventId) return;
    setBusy(true);
    try {
      await eventService.updateEventVisibility(eventId, {
        isPublic,
        requiresApproval,
      });
      await load();
      setInitialIsPublic(isPublic);
      setInitialRequiresApproval(requiresApproval);
      Alert.alert('Success', 'Visibility settings updated successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Update failed.');
    } finally {
      setBusy(false);
    }
  }, [isPublic, load, params.eventId, requiresApproval]);

  const handleUpdateStatus = useCallback(async () => {
    if (!eventId) return;
    if (!selectedStatus) return;
    setBusy(true);
    try {
      await eventService.updateEventStatus(eventId, selectedStatus);
      setShowStatusModal(false);
      await load();
      Alert.alert('Success', 'Event status updated successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Status update failed.');
    } finally {
      setBusy(false);
    }
  }, [selectedStatus, load, params.eventId]);

  const handleQuickAction = useCallback(
    async (
      action:
        | 'public'
        | 'private'
        | 'publish'
        | 'cancel'
        | 'complete',
    ) => {
      if (!eventId) {
        Alert.alert('Error', 'Event ID is missing. Please reopen from the event details.');
        return;
      }
      setBusy(true);
      try {
        if (action === 'public') {
          await eventService.makeEventPublic(eventId);
        } else if (action === 'private') {
          await eventService.makeEventPrivate(eventId);
        } else if (action === 'publish') {
          await eventService.publishEvent(eventId);
        } else if (action === 'cancel') {
          Alert.alert(
            'Cancel Event',
            'Are you sure you want to cancel this event?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                  await eventService.cancelEvent(eventId, 'Cancelled by organizer');
                  await load();
                  Alert.alert('Success', 'Event has been cancelled.');
                },
              },
            ],
          );
          setBusy(false);
          return;
        } else if (action === 'complete') {
          await eventService.completeEvent(eventId);
        }
        await load();
        Alert.alert('Success', 'Action completed successfully.');
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Action failed.');
      } finally {
        setBusy(false);
      }
    },
    [load, eventId],
  );

  const updateVisibility = useCallback(
    async (nextIsPublic: boolean, nextRequiresApproval: boolean, revert: () => void) => {
      if (!eventId) return;
      setBusy(true);
      try {
        await eventService.updateEventVisibility(eventId, {
          isPublic: nextIsPublic,
          requiresApproval: nextRequiresApproval,
        });
        setInitialIsPublic(nextIsPublic);
        setInitialRequiresApproval(nextRequiresApproval);
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Update failed.');
        revert();
      } finally {
        setBusy(false);
      }
    },
    [eventId],
  );

  const allStatuses = Object.values(EventStatus);

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
          backgroundColor: colors.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
            }}
          >
            Visibility & Status
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSaveVisibility}
          disabled={busy || !hasVisibilityChanges}
          style={{
            width: 40,
            height: 40,
            borderRadius: borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: busy || !hasVisibilityChanges ? colors.background : colors.text.primary,
            opacity: busy ? 0.5 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <CheckCircle2
              size={20}
              color={busy || !hasVisibilityChanges ? colors.text.secondary : colors.text.inverse}
            />
          )}
        </TouchableOpacity>

      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={{ paddingVertical: spacing.lg }}>
            <ActivityIndicator size="small" color={colors.text.primary} />
          </View>
        )}

        {/* Current Status Card */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.text.primary,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <ShieldCheck size={24} color={colors.text.primary} />
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.lg,
              }}
            >
              Current Status
            </Text>
          </View>

          {currentStatus && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.sm,
                    marginBottom: spacing.xs,
                  }}
                >
                  Event Status
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: colors.text.primary,
                    }}
                  >
                    <Text
                      style={{
                    color: colors.text.primary,
                        fontWeight: typography.weight.semibold,
                        fontSize: typography.size.base,
                      }}
                    >
                      {statusLabel(currentStatus)}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedStatus(currentStatus);
                  setShowStatusModal(true);
                }}
                disabled={busy}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: colors.text.primary,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Text style={{ color: colors.text.primary, fontSize: typography.size.sm }}>Change</Text>
                <ChevronDown size={16} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ gap: spacing.sm }}>
            <InfoRow
              label="Visibility"
              value={isPublic ? 'Public' : 'Private'}
              icon={isPublic ? Globe : EyeOff}
              iconColor={colors.text.primary}
            />
            <InfoRow
              label="Approval Required"
              value={requiresApproval ? 'Yes' : 'No'}
              icon={ShieldCheck}
              iconColor={colors.text.primary}
            />
          </View>
        </View>

        {/* Event Status Management */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.text.primary,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.lg,
              marginBottom: spacing.lg,
            }}
          >
            Status Management
          </Text>

          <View style={{ gap: spacing.md }}>
            <ActionRow
              icon={Upload}
              label="Publish Event"
              description="Make event visible to the public"
              onPress={() => handleQuickAction('publish')}
              disabled={busy || currentStatus === EventStatus.PUBLISHED}
            />
            <ActionRow
              icon={CheckCircle2}
              label="Mark as Complete"
              description="Mark this event as completed"
              onPress={() => handleQuickAction('complete')}
              disabled={busy || currentStatus === EventStatus.COMPLETED}
            />
            <ActionRow
              icon={XCircle}
              label="Cancel Event"
              description="Cancel this event permanently"
              onPress={() => handleQuickAction('cancel')}
              disabled={busy || currentStatus === EventStatus.CANCELLED}
              destructive
            />
          </View>
        </View>

        {/* Registration Management */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.text.primary,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.lg,
              marginBottom: spacing.lg,
            }}
          >
            Visibility Settings
          </Text>

          <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
            <ToggleRow
              label="Public Event"
              description="Event is visible to everyone"
              active={isPublic}
              disabled={busy}
              onToggle={() => {
                const prev = isPublic;
                const next = !prev;
                setIsPublic(next);
                updateVisibility(next, requiresApproval, () => setIsPublic(prev));
              }}
              icon={Globe}
            />
            <ToggleRow
              label="Require Approval"
              description="New attendees need approval to join"
              active={requiresApproval}
              disabled={busy}
              onToggle={() => {
                const prev = requiresApproval;
                const next = !prev;
                setRequiresApproval(next);
                updateVisibility(isPublic, next, () => setRequiresApproval(prev));
              }}
              icon={ShieldCheck}
            />
          </View>

          {/* Make Public/Private removed to avoid duplication with toggles */}
        </View>
      </ScrollView>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              padding: spacing.xl,
              maxHeight: '70%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size.lg,
                }}
              >
                Select Status
              </Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <XCircle size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: spacing.sm }}>
                {allStatuses.map(status => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setSelectedStatus(status)}
                    style={{
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      borderWidth: 1,
                      borderColor: selectedStatus === status ? colors.text.primary : colors.border,
                      backgroundColor: selectedStatus === status ? colors.text.primary : colors.background,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedStatus === status ? colors.text.inverse : colors.text.primary,
                        fontWeight:
                          selectedStatus === status
                            ? typography.weight.semibold
                            : typography.weight.regular,
                        fontSize: typography.size.base,
                      }}
                    >
                      {statusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateStatus}
                disabled={busy || !selectedStatus}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.lg,
                backgroundColor: colors.text.primary,
                  alignItems: 'center',
                  opacity: busy || !selectedStatus ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: typography.weight.bold,
                  }}
                >
                  Update Status
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ToggleRow = ({
  label,
  description,
  active,
  onToggle,
  icon: Icon,
  disabled,
}: {
  label: string;
  description?: string;
  active: boolean;
  onToggle: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  disabled?: boolean;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => {
        if (disabled) return;
        onToggle();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.text.primary,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background,
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {Icon && <Icon size={20} color={colors.text.primary} />}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
            }}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                marginTop: spacing.xs,
              }}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      <View
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.text.primary,
          padding: 2,
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.text.primary,
            opacity: active ? 1 : 0.3,
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
  description,
  onPress,
  disabled,
  destructive,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  description?: string;
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
        gap: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: disabled ? colors.border : color,
        borderRadius: borderRadius.lg,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon size={20} color={disabled ? colors.text.tertiary : color} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: disabled ? colors.text.tertiary : color,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.base,
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginTop: spacing.xs,
            }}
          >
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const InfoRow = ({
  label,
  value,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
}) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
      }}
    >
      <Icon size={18} color={iconColor} />
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm,
          flex: 1,
        }}
      >
        {label}:
      </Text>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
        }}
      >
        {value}
      </Text>
    </View>
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

