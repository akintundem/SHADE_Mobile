import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  onClose?: () => void;
};

export function SettingsHeader({ onClose }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  return (
    <View className="px-xl py-md flex-row items-center justify-between">
      {onClose ? (
        <TouchableOpacity onPress={onClose} className="-ml-1" activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      ) : (
        <View className="w-5" />
      )}
      <Text
        className={`flex-1 text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.5px] ${
          onClose ? 'ml-3' : ''
        }`}
      >
        {t('Settings')}
      </Text>
    </View>
  );
}
