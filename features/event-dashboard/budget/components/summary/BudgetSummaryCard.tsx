import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BudgetDetailResponse } from '../../../../../core/budget/types/budget';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { BudgetSummaryBack, BudgetSummaryFront, type PieSlice } from './BudgetSummaryCardFaces';

type Props = {
  budget: BudgetDetailResponse;
};

export function BudgetSummaryCard({ budget }: Props) {
  const { t } = useI18n();
  const { colors, spacing, borderRadius, typography, isDark } = useTheme();

  const totalBudget = budget.totalBudget || 0;
  const totalSpent = budget.totalActual || budget.totalEstimated || 0;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const currency = budget.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverBudget = remaining < 0;
  const isWarning = spentPercentage >= 80 && spentPercentage < 100;

  const cardHeight = 220;
  const cardWidth = '100%';

  const cardBgColor = isDark ? colors.surfaceElevated : colors.text.primary;
  const cardTextColor = colors.text.inverse;

  const chartSize = 120;
  const chartInnerRadius = 40;

  const spentColor = isOverBudget ? colors.semantic.error : colors.semantic.warning;
  const remainingColor = remaining > 0 ? colors.semantic.success : colors.semantic.error;
  const remainingTextColor = isOverBudget ? colors.semantic.error : isWarning ? colors.semantic.warning : cardTextColor;

  const slices: PieSlice[] = [
    { value: Math.max(totalSpent, 0), color: spentColor },
    { value: Math.max(remaining, 0), color: remainingColor },
  ];

  const flipAnim = useRef(new Animated.Value(0)).current;
  const isAnimatingRef = useRef(false);

  const runFlipSequence = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 180,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimatingRef.current = false;
    });
  }, [flipAnim]);

  const handleToggle = () => {
    runFlipSequence();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runFlipSequence();
    }, 350);

    return () => clearTimeout(timer);
  }, [runFlipSequence]);

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const renderCardDecorations = () => (
    <>
      <View
        className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full bg-neutral-white/[0.05] dark:bg-dark-surface-muted"
      />
      <View
        className="absolute -bottom-[30px] -left-[30px] w-[150px] h-[150px] rounded-full bg-neutral-white/[0.03] dark:bg-dark-surface-subtle"
      />
    </>
  );

  const faceStyle = {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden' as const,
  };

  const surfaceStyle = {
    flex: 1,
    backgroundColor: cardBgColor,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    overflow: 'hidden' as const,
  };

  return (
    <View className="mb-xl mx-xl">
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: borderRadius['2xl'],
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: cardBgColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Animated.View style={[faceStyle, { transform: [{ perspective: 1000 }, { rotateY: frontRotation }] }]}>
          <View style={surfaceStyle}>
            {renderCardDecorations()}
            <BudgetSummaryFront
              metrics={{ totalBudget, totalSpent, remaining, spentPercentage }}
              palette={{ cardBgColor, cardTextColor, remainingTextColor, spentColor, remainingColor }}
              tokens={{ spacing, typography, borderRadius }}
              formatCurrency={formatCurrency}
              t={t}
            />
          </View>
        </Animated.View>

        <Animated.View style={[faceStyle, { transform: [{ perspective: 1000 }, { rotateY: backRotation }] }]}>
          <View style={surfaceStyle}>
            {renderCardDecorations()}
            <BudgetSummaryBack
              metrics={{ totalBudget, totalSpent, remaining, spentPercentage }}
              palette={{ cardBgColor, cardTextColor, remainingTextColor, spentColor, remainingColor }}
              tokens={{ spacing, typography }}
              chartSize={chartSize}
              chartInnerRadius={chartInnerRadius}
              slices={slices}
              formatCurrency={formatCurrency}
              t={t}
            />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
