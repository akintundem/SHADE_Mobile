import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

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
  const { colors, typography, spacing, isDark } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <TouchableOpacity onPress={currentStep === 0 ? onClose : onBack} style={{ padding: spacing.xs }}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.xl,
            }}
          >
            Create Event
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
              marginTop: spacing.xs / 2,
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress indicator */}
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {steps.map((step, index) => (
          <View
            key={step.id}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index <= currentStep ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}

