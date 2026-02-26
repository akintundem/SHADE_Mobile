import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Mail, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import {
  CollaboratorInviteResponse,
  CollaboratorInviteStatus,
} from '../../../../core/collaboration/types/collaboration';
import { RolePill } from './RolePill';
import { CollaboratorStatusPill } from './CollaboratorStatusPill';

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

type Props = {
  invite: CollaboratorInviteResponse;
  isLast: boolean;
  onRevoke?: (invite: CollaboratorInviteResponse) => void;
};

export function InviteRow({ invite, onRevoke }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const inviteeLabel = invite.inviteeEmail || t('Collaborator');
  const statusLabel = formatEnumLabel(invite.status);
  const roleLabel = formatEnumLabel(invite.role);
  const canRevoke = invite.status === CollaboratorInviteStatus.PENDING;

  return (
    <View className="flex-row items-start py-lg">
      <View className="w-10 h-10 items-center justify-center">
        <Mail size={18} color={colors.text.tertiary} strokeWidth={2.2} />
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
          {inviteeLabel}
        </Text>
        <View className="flex-row flex-wrap items-center mb-sm gap-sm">
          <RolePill label={roleLabel} />
          <CollaboratorStatusPill label={statusLabel} status={invite.status} />
        </View>
        {invite.message ? (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
            {invite.message}
          </Text>
        ) : null}
      </View>
      {canRevoke && onRevoke && (
        <TouchableOpacity onPress={() => onRevoke(invite)} className="ml-md p-sm">
          <X size={18} color={colors.semantic.error} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}
