import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Mail, Check, X } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { CollaboratorInviteResponse, CollaboratorInviteStatus } from '../../../core/collaboration/types/collaboration';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  invite: CollaboratorInviteResponse;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
  isLast?: boolean;
};

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export function CollaboratorInviteCard({ invite, onAccept, onDecline, isLast = false }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const isPending = invite.status === CollaboratorInviteStatus.PENDING;

  const handleAccept = () => {
    Alert.alert(
      t('AcceptCollaboratorInvite'),
      t('AcceptCollaboratorInviteConfirm'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Accept'),
          onPress: async () => {
            try {
              await onAccept(invite.inviteId);
              // Navigate to event after accepting
              navigation.navigate('EventAdmin', {
                eventId: invite.eventId,
              });
            } catch (err) {
              // Error already handled in hook
            }
          },
        },
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      t('DeclineCollaboratorInvite'),
      t('DeclineCollaboratorInviteConfirm'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Decline'),
          style: 'destructive',
          onPress: async () => {
            try {
              await onDecline(invite.inviteId);
            } catch (err) {
              // Error already handled in hook
            }
          },
        },
      ]
    );
  };

  const statusColors = {
    [CollaboratorInviteStatus.PENDING]: {
      bg: isDark ? `${colors.semantic.warning}25` : colors.semantic.warningLight,
      text: colors.semantic.warning,
      border: colors.semantic.warning,
    },
    [CollaboratorInviteStatus.ACCEPTED]: {
      bg: isDark ? `${colors.semantic.success}25` : colors.semantic.successLight,
      text: colors.semantic.success,
      border: colors.semantic.success,
    },
    [CollaboratorInviteStatus.DECLINED]: {
      bg: isDark ? `${colors.semantic.error}25` : colors.semantic.errorLight,
      text: colors.semantic.error,
      border: colors.semantic.error,
    },
    [CollaboratorInviteStatus.REVOKED]: {
      bg: isDark ? `${colors.semantic.error}25` : colors.semantic.errorLight,
      text: colors.semantic.error,
      border: colors.semantic.error,
    },
    [CollaboratorInviteStatus.EXPIRED]: {
      bg: isDark ? colors.surfaceElevated : colors.surface,
      text: colors.text.tertiary,
      border: colors.borderLight,
    },
  };

  const statusColor = statusColors[invite.status] || statusColors[CollaboratorInviteStatus.PENDING];
  const statusLabel = formatEnumLabel(invite.status);

  return (
    <View
      className="flex-row items-start py-lg"
    >
      <View className="w-10 h-10 items-center justify-center">
        <Mail size={18} color={statusColor.text} strokeWidth={2.2} />
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
          {t('CollaboratorInvite')}
        </Text>
        <View className="flex-row flex-wrap items-center mb-sm gap-sm">
          <View
            className="px-sm py-[2px] rounded-full border"
            style={{
              backgroundColor: statusColor.bg,
              borderColor: statusColor.border,
            }}
          >
            <Text className="text-xs font-medium" style={{ color: statusColor.text }}>
              {statusLabel}
            </Text>
          </View>
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
            {formatEnumLabel(invite.role)}
          </Text>
        </View>
        {invite.message && (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed mb-sm">
            {invite.message}
          </Text>
        )}
        {isPending && (
          <View className="flex-row gap-sm mt-sm">
            <TouchableOpacity
              onPress={handleAccept}
              className="flex-row items-center px-md py-sm rounded-lg"
              style={{ backgroundColor: statusColors[CollaboratorInviteStatus.ACCEPTED].bg }}
            >
              <Check size={14} color={statusColors[CollaboratorInviteStatus.ACCEPTED].text} strokeWidth={2.5} />
              <Text
                className="text-xs font-medium ml-xs"
                style={{ color: statusColors[CollaboratorInviteStatus.ACCEPTED].text }}
              >
                {t('Accept')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDecline}
              className="flex-row items-center px-md py-sm rounded-lg"
              style={{ backgroundColor: statusColors[CollaboratorInviteStatus.DECLINED].bg }}
            >
              <X size={14} color={statusColors[CollaboratorInviteStatus.DECLINED].text} strokeWidth={2.5} />
              <Text
                className="text-xs font-medium ml-xs"
                style={{ color: statusColors[CollaboratorInviteStatus.DECLINED].text }}
              >
                {t('Decline')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
