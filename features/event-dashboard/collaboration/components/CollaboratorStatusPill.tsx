import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { CollaboratorInviteStatus } from '../../../../core/collaboration/types/collaboration';

const withAlpha = (hex: string, alpha: number) => {
  if (!hex.startsWith('#')) return hex;
  const value = hex.replace('#', '');
  const isShort = value.length === 3;
  const r = parseInt(isShort ? value[0] + value[0] : value.slice(0, 2), 16);
  const g = parseInt(isShort ? value[1] + value[1] : value.slice(2, 4), 16);
  const b = parseInt(isShort ? value[2] + value[2] : value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type Props = {
  label: string;
  status: CollaboratorInviteStatus;
};

export function CollaboratorStatusPill({ label, status }: Props) {
  const { colors, isDark } = useTheme();

  let backgroundColor = isDark ? withAlpha(colors.text.primary, 0.08) : colors.borderLight;
  let textColor = colors.text.tertiary;
  let borderColor = isDark ? withAlpha(colors.text.primary, 0.08) : colors.border;

  switch (status) {
    case CollaboratorInviteStatus.PENDING:
      backgroundColor = isDark ? withAlpha(colors.semantic.warning, 0.2) : colors.semantic.warningLight;
      textColor = colors.semantic.warning;
      borderColor = colors.semantic.warning;
      break;
    case CollaboratorInviteStatus.ACCEPTED:
      backgroundColor = isDark ? withAlpha(colors.semantic.success, 0.2) : colors.semantic.successLight;
      textColor = colors.semantic.success;
      borderColor = colors.semantic.success;
      break;
    case CollaboratorInviteStatus.DECLINED:
    case CollaboratorInviteStatus.REVOKED:
      backgroundColor = isDark ? withAlpha(colors.semantic.error, 0.2) : colors.semantic.errorLight;
      textColor = colors.semantic.error;
      borderColor = colors.semantic.error;
      break;
    case CollaboratorInviteStatus.EXPIRED:
      backgroundColor = isDark ? withAlpha(colors.text.primary, 0.08) : colors.borderLight;
      textColor = colors.text.tertiary;
      borderColor = isDark ? withAlpha(colors.text.primary, 0.08) : colors.border;
      break;
    default:
      break;
  }

  return (
    <View className="px-sm py-[2px] rounded-full border" style={{ backgroundColor, borderColor }}>
      <Text className="text-xs font-medium" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
