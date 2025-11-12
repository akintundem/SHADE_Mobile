import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../../shared/i18n/I18nProvider';
import { Plus } from 'lucide-react-native';

type Props = { onCreate?: () => void };

export const TopBar = ({ onCreate }: Props) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        height: 56,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{
        color: colors.text.primary,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.xl,
        letterSpacing: -0.5,
      }}>
        {t('Manage')}
      </Text>
      <TouchableOpacity onPress={onCreate} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Plus size={22} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};
