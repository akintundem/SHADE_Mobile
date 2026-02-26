import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Step = {
  id: number;
  title: string;
  subtitle: string;
};

type Props = {
  currentStep: number;
  steps: Step[];
  onBack: () => void;
  onClose: () => void;
};

export function StepHeader({ currentStep, steps, onBack, onClose }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const iconColor = colors.text.primary;

  return (
    <View className="px-lg pt-xl pb-md">
      <View className="flex-row items-center justify-between mb-md">
        <TouchableOpacity
          onPress={currentStep === 0 ? onClose : onBack}
          className="p-xs"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={iconColor} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary">
            {t('CreateEvent')}
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary mt-[2px]">
            {t('StepProgress', { current: currentStep + 1, total: steps.length })}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <View className="flex-row gap-xs">
        {steps.map((step, index) => (
          <View
            key={step.id}
            className={`flex-1 h-1 rounded-full ${
              index <= currentStep
                ? 'bg-neutral-black dark:bg-neutral-white'
                : 'bg-light-border dark:bg-dark-border'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
