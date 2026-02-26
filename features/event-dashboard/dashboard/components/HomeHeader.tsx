import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  onCreateEvent?: () => void;
};

export const HomeHeader = ({ onCreateEvent }: Props) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const brandFont = Platform.select({
    ios: 'Snell Roundhand',
    android: 'cursive',
  });

  const buttonIcon = colors.text.inverse;

  return (
    <View className="bg-light-background dark:bg-dark-background">
      <View className="flex-row items-center justify-between px-lg pt-xl pb-md">
        <View className="flex-1">
          <Text
            className="text-txt-primary dark:text-txt-dark-primary"
            style={{
              fontFamily: brandFont || undefined,
              fontWeight: brandFont ? '800' : '800',
              fontSize: 36,
              lineHeight: 36 * 1.05,
              letterSpacing: brandFont ? 0.4 : -0.6,
              textAlign: 'left',
              includeFontPadding: false,
            }}
          >
            Shade
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary mt-xs tracking-wide">
            {t('HomeTagline')}
          </Text>
        </View>

        {onCreateEvent && (
          <TouchableOpacity
            onPress={onCreateEvent}
            activeOpacity={0.8}
            className="w-8 h-8 rounded-full items-center justify-center bg-neutral-black dark:bg-neutral-white"
            accessibilityRole="button"
            accessibilityLabel={t('CreateEvent')}
          >
            <Plus size={16} color={buttonIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
