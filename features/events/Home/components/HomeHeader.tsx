import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../../shared/i18n/I18nProvider';
import { MessageCircle } from 'lucide-react-native';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onOpenChat?: () => void;
};

export const HomeHeader = ({ user, onOpenChat }: Props) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const name = user.name || user.email;
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          height: 56,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: 24 }} />
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          <Text style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size.xl,
            letterSpacing: -0.5,
            textAlign: 'left',
          }}>
            Shade
          </Text>
        </View>
        <TouchableOpacity
          onPress={onOpenChat}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MessageCircle size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
