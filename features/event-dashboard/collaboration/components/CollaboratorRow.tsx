import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventCollaboratorResponse } from '../../../../core/collaboration/types/collaboration';
import { RolePill } from './RolePill';

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const getInitials = (value?: string | null) => {
  if (!value) return '?';
  const trimmed = value.trim();
  if (!trimmed) return '?';
  if (trimmed.includes('@')) return trimmed[0]?.toUpperCase() || '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
  if (initials) return initials;
  return trimmed.slice(0, 2).toUpperCase();
};

type Props = {
  collaborator: EventCollaboratorResponse;
  isLast: boolean;
  onEdit?: (collaborator: EventCollaboratorResponse) => void;
  onRemove?: (collaborator: EventCollaboratorResponse) => void;
};

export function CollaboratorRow({ collaborator, onEdit, onRemove }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const name = collaborator.userName || collaborator.email || t('Collaborator');
  const email = collaborator.userName ? collaborator.email || null : null;
  const initials = getInitials(name || email);
  const permissionsLabel =
    collaborator.permissions && collaborator.permissions.length > 0
      ? collaborator.permissions.map(formatEnumLabel).join(', ')
      : null;
  const registrationLabel = collaborator.registrationStatus
    ? formatEnumLabel(collaborator.registrationStatus)
    : null;

  return (
    <View className="flex-row items-center py-lg">
      <View className="w-10 h-10 rounded-full items-center justify-center">
        <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
          {initials}
        </Text>
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
          {name}
        </Text>
        {email ? (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
            {email}
          </Text>
        ) : null}
        {(permissionsLabel || registrationLabel) && (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
            {permissionsLabel}
            {permissionsLabel && registrationLabel ? ' • ' : ''}
            {registrationLabel ? `${t('Registration')}: ${registrationLabel}` : ''}
          </Text>
        )}
      </View>
      <RolePill label={formatEnumLabel(collaborator.role)} />
      {(onEdit || onRemove) && (
        <TouchableOpacity
          onPress={() => {
            const actions: {
              text: string;
              style?: 'cancel' | 'destructive' | 'default';
              onPress?: () => void;
            }[] = [];
            if (onEdit) actions.push({ text: t('Edit'), onPress: () => onEdit(collaborator) });
            if (onRemove)
              actions.push({ text: t('Remove'), style: 'destructive', onPress: () => onRemove(collaborator) });
            actions.push({ text: t('Cancel'), style: 'cancel' });
            Alert.alert(t('CollaboratorActions'), t('ChooseAction'), actions);
          }}
          className="ml-md p-sm"
        >
          <MoreVertical size={18} color={colors.text.tertiary} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}
