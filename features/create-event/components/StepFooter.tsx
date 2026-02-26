import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  isLastStep: boolean;
  canProceed: boolean;
  isLoading?: boolean;
  onNext: () => void;
  onClose?: () => void;
  onCreate?: () => void;
};

export function StepFooter({
  isLastStep,
  canProceed,
  isLoading = false,
  onNext,
  onClose,
  onCreate,
}: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();

  if (isLastStep) {
    const createEnabled = canProceed && !isLoading;
    return (
      <View className="flex-row gap-md">
        <TouchableOpacity
          onPress={() => onClose?.()}
          className="flex-1 h-12 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-txt-primary dark:text-txt-dark-primary font-semibold">
            {t('SaveDraft')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!createEnabled}
          onPress={onCreate}
          activeOpacity={0.8}
          className={`flex-1 h-12 rounded-full items-center justify-center flex-row gap-sm ${
            createEnabled ? 'bg-brand-secondary' : 'bg-light-surface-strong dark:bg-dark-surface-strong'
          }`}
        >
          <Text className={`font-semibold ${createEnabled ? 'text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
            {isLoading ? t('Creating') : t('CreateEvent')}
          </Text>
          {!isLoading && (
            <Check size={20} color={createEnabled ? colors.text.primary : colors.text.tertiary} />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const nextEnabled = canProceed;

  return (
    <View className="items-end">
      <TouchableOpacity
        disabled={!nextEnabled}
        onPress={onNext}
        activeOpacity={0.8}
        className={`h-12 rounded-full flex-row items-center justify-center gap-sm px-xl min-w-[140px] ${
          nextEnabled ? 'bg-txt-primary dark:bg-txt-dark-primary' : 'bg-light-surface-strong dark:bg-dark-surface-strong'
        }`}
      >
        <Text className={`text-base font-semibold ${nextEnabled ? 'text-txt-inverse dark:text-txt-dark-inverse' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
          {t('Next')}
        </Text>
        <ChevronRight size={18} color={nextEnabled ? colors.text.inverse : colors.text.tertiary} />
      </TouchableOpacity>
    </View>
  );
}
