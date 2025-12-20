import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
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
  const { colors, typography, spacing, borderRadius, brand, isDark } = useTheme();

  if (isLastStep) {
    return (
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <TouchableOpacity
          onPress={onClose}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 999,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
            }}
          >
            Save Draft
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!canProceed || isLoading}
          onPress={onCreate}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 999,
            backgroundColor: canProceed && !isLoading ? brand.secondary : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: spacing.sm,
          }}
        >
          <Text
            style={{
              color: colors.background,
              fontWeight: typography.weight.semibold,
            }}
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </Text>
          {!isLoading && <Check size={20} color={colors.background} />}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'flex-end' }}>
      <TouchableOpacity
        disabled={!canProceed}
        onPress={onNext}
        style={{
          height: 48,
          borderRadius: 999,
          backgroundColor: canProceed ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          minWidth: 140,
        }}
      >
        <Text
          style={{
            color: canProceed ? (isDark ? '#000000' : '#FFFFFF') : colors.text.tertiary,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.base,
          }}
        >
          Next
        </Text>
        <ChevronRight
          size={18}
          color={canProceed ? (isDark ? '#000000' : '#FFFFFF') : colors.text.tertiary}
        />
      </TouchableOpacity>
    </View>
  );
}
