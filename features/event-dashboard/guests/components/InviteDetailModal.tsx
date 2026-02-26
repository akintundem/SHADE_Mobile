import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Mail, User, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import { AttendeeInviteResponse, AttendeeInviteStatus } from '../../../../core/attendee/types/attendee';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  inviteId: string | null;
  onClose: () => void;
};

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const formatDateTime = (isoDate?: string | null) => {
  if (!isoDate) return null;
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

const withAlpha = (hex: string, alpha: number) => {
  if (!hex.startsWith('#')) return hex;
  const value = hex.replace('#', '');
  const isShort = value.length === 3;
  const r = parseInt(isShort ? value[0] + value[0] : value.slice(0, 2), 16);
  const g = parseInt(isShort ? value[1] + value[1] : value.slice(2, 4), 16);
  const b = parseInt(isShort ? value[2] + value[2] : value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const StatusPill = ({ status }: { status: AttendeeInviteStatus }) => {
  const { colors, isDark } = useTheme();

  let backgroundColor = isDark ? withAlpha(colors.text.primary, 0.08) : colors.borderLight;
  let textColor = colors.text.tertiary;
  let borderColor = isDark ? withAlpha(colors.text.primary, 0.08) : colors.border;

  switch (status) {
    case AttendeeInviteStatus.ACCEPTED:
      backgroundColor = isDark ? withAlpha(colors.semantic.success, 0.2) : colors.semantic.successLight;
      textColor = colors.semantic.success;
      borderColor = colors.semantic.success;
      break;
    case AttendeeInviteStatus.DECLINED:
    case AttendeeInviteStatus.REVOKED:
      backgroundColor = isDark ? withAlpha(colors.semantic.error, 0.2) : colors.semantic.errorLight;
      textColor = colors.semantic.error;
      borderColor = colors.semantic.error;
      break;
    case AttendeeInviteStatus.EXPIRED:
      backgroundColor = isDark ? withAlpha(colors.semantic.warning, 0.2) : colors.semantic.warningLight;
      textColor = colors.semantic.warning;
      borderColor = colors.semantic.warning;
      break;
    default:
      break;
  }

  return (
    <View className="px-md py-xs rounded-full border" style={{ backgroundColor, borderColor }}>
      <Text className="text-xs font-semibold" style={{ color: textColor }}>
        {formatEnumLabel(status)}
      </Text>
    </View>
  );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value: string | null | undefined;
}) => {
  const { colors } = useTheme();

  if (!value) return null;

  return (
    <View className="flex-row items-start py-md border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle">
      <View className="w-8 items-center pt-[2px]">
        <Icon size={16} color={colors.text.tertiary} strokeWidth={2} />
      </View>
      <View className="flex-1 ml-sm">
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
          {label}
        </Text>
        <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
          {value}
        </Text>
      </View>
    </View>
  );
};

export function InviteDetailModal({ visible, eventId, inviteId, onClose }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [invite, setInvite] = useState<AttendeeInviteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvite = useCallback(async () => {
    if (!eventId || !inviteId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await attendeeService.getInvite(eventId, inviteId);
      setInvite(data);
    } catch (err) {
      setError(t('FailedToLoadInviteDetail'));
      ErrorHandler.handle(err, 'getInvite');
    } finally {
      setLoading(false);
    }
  }, [eventId, inviteId, t]);

  useEffect(() => {
    if (visible && inviteId) {
      fetchInvite();
    } else {
      setInvite(null);
      setError(null);
    }
  }, [visible, inviteId, fetchInvite]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  const statusLabels: Record<AttendeeInviteStatus, string> = {
    [AttendeeInviteStatus.ACCEPTED]: t('Accepted'),
    [AttendeeInviteStatus.DECLINED]: t('Declined'),
    [AttendeeInviteStatus.REVOKED]: t('Revoked'),
    [AttendeeInviteStatus.EXPIRED]: t('Expired'),
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
        <View
          className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[80%]"
          style={{ paddingBottom: modalPaddingBottom }}
        >
          <View className="flex-row items-center justify-between px-xl mb-xl">
            <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
              {t('InviteDetails')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
            >
              <X size={18} color={text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View className="px-xl">
            {loading && (
              <View className="py-2xl items-center">
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                  {t('LoadingInvites')}
                </Text>
              </View>
            )}

            {error && !loading && (
              <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                <Text className="text-sm text-semantic-error">
                  {error}
                </Text>
              </View>
            )}

            {invite && !loading && (
              <View>
                <View className="items-center mb-xl">
                  <View className="w-14 h-14 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong mb-md">
                    <Mail size={24} color={text.tertiary} strokeWidth={1.8} />
                  </View>
                  <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
                    {invite.inviteeEmail || t('Guest')}
                  </Text>
                  <StatusPill status={invite.status} />
                </View>

                <View className="mb-lg">
                  {invite.message && (
                    <View className="rounded-lg p-md mb-lg bg-light-surface-subtle dark:bg-dark-surface-muted border border-light-border-muted dark:border-dark-border-subtle">
                      <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                        {t('Message')}
                      </Text>
                      <Text className="text-sm text-txt-primary dark:text-txt-dark-primary leading-relaxed">
                        {invite.message}
                      </Text>
                    </View>
                  )}

                  <DetailRow
                    icon={User}
                    label={t('Status')}
                    value={statusLabels[invite.status] || formatEnumLabel(invite.status)}
                  />
                  <DetailRow
                    icon={Calendar}
                    label={t('InvitedOn')}
                    value={formatDateTime(invite.createdAt)}
                  />
                  <DetailRow
                    icon={Clock}
                    label={t('ExpiresAt')}
                    value={formatDateTime(invite.expiresAt)}
                  />
                  <DetailRow
                    icon={Calendar}
                    label={t('RespondedAt')}
                    value={formatDateTime(invite.respondedAt)}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
