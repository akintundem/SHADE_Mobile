import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';

type Props = {
  onClose?: () => void;
};

export function SettingsHeader({ onClose }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 0.5,
        borderColor: colors.divider,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {onClose && (
        <TouchableOpacity 
          onPress={onClose}
          style={{ marginLeft: -spacing.xs }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      )}
      <Text
        style={{
          fontSize: typography.size['2xl'],
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          letterSpacing: -0.5,
          flex: 1,
          marginLeft: onClose ? spacing.md : 0,
        }}
      >
        {t('Settings')}
      </Text>
    </View>
  );
}

