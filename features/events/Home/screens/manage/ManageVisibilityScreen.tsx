import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { eventService } from '../../../services/eventService';
import { EventStatus } from '../../../../../common/types';

type RouteParams = { eventId: string };

const ManageVisibilityScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const eventId = params?.eventId;

  const [currentStatus, setCurrentStatus] = useState<EventStatus | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [selectedIsPublic, setSelectedIsPublic] = useState<boolean | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequiresApproval, setSelectedRequiresApproval] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

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
        eventService.getEventStatus(eventId),
      ]);
      const eventAny = eventData as any;
      setCurrentStatus(statusData ?? (eventData as any)?.eventStatus ?? null);
      setIsPublic(
        visibilityData?.isPublic ??
          (typeof eventAny?.isPublic === 'boolean' ? eventAny.isPublic : true),
      );
      setRequiresApproval(
        visibilityData?.requiresApproval ??
          (typeof eventAny?.requiresApproval === 'boolean'
            ? eventAny.requiresApproval
            : false),
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

  const handleUpdateVisibility = useCallback(async () => {
    if (!eventId) return;
    if (selectedIsPublic === null) return;
    setBusy(true);
    try {
      await eventService.updateEventVisibility(eventId, {
        isPublic: selectedIsPublic,
        requiresApproval,
      });
      setShowVisibilityModal(false);
      await load();
      Alert.alert('Success', 'Visibility updated successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Visibility update failed.');
    } finally {
      setBusy(false);
    }
  }, [eventId, load, requiresApproval, selectedIsPublic]);

  const handleUpdateApproval = useCallback(async () => {
    if (!eventId) return;
    if (selectedRequiresApproval === null) return;
    setBusy(true);
    try {
      await eventService.updateEventVisibility(eventId, {
        isPublic,
        requiresApproval: selectedRequiresApproval,
      });
      setShowApprovalModal(false);
      await load();
      Alert.alert('Success', 'Approval requirement updated successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Approval update failed.');
    } finally {
      setBusy(false);
    }
  }, [eventId, isPublic, load, selectedRequiresApproval]);

  const handleQuickStatusAction = useCallback(
    async (action: 'publish' | 'complete' | 'cancel') => {
      if (!eventId) return;

      if (action === 'cancel') {
        Alert.alert(
          'Cancel Event',
          'Are you sure you want to cancel this event?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes, Cancel',
              style: 'destructive',
              onPress: async () => {
                setBusy(true);
                try {
                  await eventService.updateEventStatus(eventId, EventStatus.CANCELLED);
                  await load();
                  Alert.alert('Success', 'Event status updated successfully.');
                } catch (error) {
                  Alert.alert(
                    'Error',
                    (error as { message?: string })?.message ?? 'Status update failed.',
                  );
                } finally {
                  setBusy(false);
                }
              },
            },
          ],
        );
        return;
      }

      setBusy(true);
      try {
        const nextStatus =
          action === 'publish' ? EventStatus.PUBLISHED : EventStatus.COMPLETED;
        await eventService.updateEventStatus(eventId, nextStatus);
        await load();
        Alert.alert('Success', 'Event status updated successfully.');
      } catch (error) {
        Alert.alert(
          'Error',
          (error as { message?: string })?.message ?? 'Status update failed.',
        );
      } finally {
        setBusy(false);
      }
    },
    [eventId, load],
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <RowWithChange
              label="Event Status"
              value={statusLabel(currentStatus ?? undefined)}
              onPress={() => {
                setSelectedStatus(currentStatus ?? EventStatus.DRAFT);
                setShowStatusModal(true);
              }}
              disabled={busy}
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            <RowWithChange
              label="Visibility"
              value={isPublic ? 'Public' : 'Private'}
              onPress={() => {
                setSelectedIsPublic(isPublic);
                setShowVisibilityModal(true);
              }}
              disabled={busy}
            />
            <RowWithChange
              label="Approval Required"
              value={requiresApproval ? 'Yes' : 'No'}
              onPress={() => {
                setSelectedRequiresApproval(requiresApproval);
                setShowApprovalModal(true);
              }}
              disabled={busy}
            />
          </View>
        </View>

        {/* Status Management */}
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
              onPress={() => handleQuickStatusAction('publish')}
              disabled={busy || currentStatus === EventStatus.PUBLISHED}
            />
            <ActionRow
              icon={CheckCircle2}
              label="Mark as Complete"
              description="Mark this event as completed"
              onPress={() => handleQuickStatusAction('complete')}
              disabled={busy || currentStatus === EventStatus.COMPLETED}
            />
            <ActionRow
              icon={XCircle}
              label="Cancel Event"
              description="Cancel this event permanently"
              onPress={() => handleQuickStatusAction('cancel')}
              disabled={busy || currentStatus === EventStatus.CANCELLED}
              destructive
            />
          </View>
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

      {/* Visibility Selection Modal */}
      <Modal
        visible={showVisibilityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVisibilityModal(false)}
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
                Select Visibility
              </Text>
              <TouchableOpacity onPress={() => setShowVisibilityModal(false)}>
                <XCircle size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: spacing.sm }}>
              {[
                { label: 'Public', value: true },
                { label: 'Private', value: false },
              ].map(option => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setSelectedIsPublic(option.value)}
                  style={{
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor:
                      selectedIsPublic === option.value ? colors.text.primary : colors.border,
                    backgroundColor:
                      selectedIsPublic === option.value ? colors.text.primary : colors.background,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedIsPublic === option.value
                          ? colors.text.inverse
                          : colors.text.primary,
                      fontWeight:
                        selectedIsPublic === option.value
                          ? typography.weight.semibold
                          : typography.weight.regular,
                      fontSize: typography.size.base,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              <TouchableOpacity
                onPress={() => setShowVisibilityModal(false)}
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
                onPress={handleUpdateVisibility}
                disabled={busy || selectedIsPublic === null}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.text.primary,
                  alignItems: 'center',
                  opacity: busy || selectedIsPublic === null ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: typography.weight.bold,
                  }}
                >
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Approval Selection Modal */}
      <Modal
        visible={showApprovalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowApprovalModal(false)}
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
                Require Approval?
              </Text>
              <TouchableOpacity onPress={() => setShowApprovalModal(false)}>
                <XCircle size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: spacing.sm }}>
              {[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].map(option => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setSelectedRequiresApproval(option.value)}
                  style={{
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor:
                      selectedRequiresApproval === option.value
                        ? colors.text.primary
                        : colors.border,
                    backgroundColor:
                      selectedRequiresApproval === option.value
                        ? colors.text.primary
                        : colors.background,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedRequiresApproval === option.value
                          ? colors.text.inverse
                          : colors.text.primary,
                      fontWeight:
                        selectedRequiresApproval === option.value
                          ? typography.weight.semibold
                          : typography.weight.regular,
                      fontSize: typography.size.base,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              <TouchableOpacity
                onPress={() => setShowApprovalModal(false)}
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
                onPress={handleUpdateApproval}
                disabled={busy || selectedRequiresApproval === null}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.text.primary,
                  alignItems: 'center',
                  opacity: busy || selectedRequiresApproval === null ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: typography.weight.bold,
                  }}
                >
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const RowWithChange = ({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: colors.text.primary,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
          }}
        >
          {value}
        </Text>
        <ChevronDown size={16} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
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
  const color = destructive ? colors.semantic.error : colors.text.primary;
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
        {description ? (
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginTop: spacing.xs,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
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

