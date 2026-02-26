import React from 'react';
import { Text, View } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BorderRadius, Spacing, Typography } from '../../../../../common/theme/designSystem';

export type PieSlice = {
  value: number;
  color: string;
};

type SummaryMetrics = {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  spentPercentage: number;
};

type CardPalette = {
  cardBgColor: string;
  cardTextColor: string;
  remainingTextColor: string;
  spentColor: string;
  remainingColor: string;
};

type ThemeTokens = {
  spacing: typeof Spacing;
  typography: typeof Typography;
  borderRadius: typeof BorderRadius;
};

type FormatCurrency = (amount: number) => string;
type Translate = ReturnType<typeof useI18n>['t'];

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
};

const PieChart = ({
  slices,
  size,
  innerRadius,
  backgroundColor,
  placeholderColor,
  placeholderOpacity = 0.1,
}: {
  slices: PieSlice[];
  size: number;
  innerRadius: number;
  backgroundColor: string;
  placeholderColor?: string;
  placeholderOpacity?: number;
}) => {
  const radius = size / 2;
  const visibleSlices = slices.filter(slice => slice.value > 0);
  const total = visibleSlices.reduce((sum, slice) => sum + slice.value, 0);

  if (total <= 0 || visibleSlices.length === 0) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          fill={placeholderColor ?? backgroundColor}
          fillOpacity={placeholderOpacity}
        />
        {innerRadius > 0 ? (
          <Circle cx={radius} cy={radius} r={innerRadius} fill={backgroundColor} />
        ) : null}
      </Svg>
    );
  }

  if (visibleSlices.length === 1) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={radius} cy={radius} r={radius} fill={visibleSlices[0].color} />
        {innerRadius > 0 ? (
          <Circle cx={radius} cy={radius} r={innerRadius} fill={backgroundColor} />
        ) : null}
      </Svg>
    );
  }

  let startAngle = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {visibleSlices.map((slice, index) => {
        const angle = (slice.value / total) * 360;
        const endAngle = startAngle + angle;
        const path = describeArc(radius, radius, radius, startAngle, endAngle);
        startAngle = endAngle;

        return <Path key={`slice-${index}`} d={path} fill={slice.color} />;
      })}
      {innerRadius > 0 ? <Circle cx={radius} cy={radius} r={innerRadius} fill={backgroundColor} /> : null}
    </Svg>
  );
};

type BudgetSummaryFrontProps = {
  metrics: SummaryMetrics;
  palette: CardPalette;
  tokens: ThemeTokens;
  formatCurrency: FormatCurrency;
  t: Translate;
};

export const BudgetSummaryFront = ({ metrics, palette, tokens, formatCurrency, t }: BudgetSummaryFrontProps) => {
  const { spacing, typography, borderRadius } = tokens;
  const { cardTextColor, remainingTextColor } = palette;
  const { totalBudget, totalSpent, remaining, spentPercentage } = metrics;

  return (
    <View className="flex-1 justify-between" style={{ position: 'relative', zIndex: 1 }}>
      <View>
        <View
          className="flex-row justify-between items-start"
          style={{ marginBottom: spacing['2xl'] }}
        >
          <View className="flex-1" style={{ paddingRight: spacing.sm }}>
            <Text
              style={{
                color: cardTextColor,
                opacity: 0.6,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: spacing.sm,
              }}
            >
              {t('TotalBudget')}
            </Text>
            <Text
              style={{
                color: cardTextColor,
                fontSize: typography.size['5xl'],
                fontWeight: typography.weight.bold,
                letterSpacing: -1.5,
                lineHeight: typography.size['5xl'] * 1.1,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {formatCurrency(totalBudget)}
            </Text>
          </View>

          <View
            className="w-12 h-12 rounded-lg items-center justify-center bg-neutral-white/10"
          >
            <DollarSign size={24} color={cardTextColor} strokeWidth={2.5} />
          </View>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <View
            className="h-2 rounded-full overflow-hidden bg-neutral-white/[0.15]"
            style={{ marginBottom: spacing.xs }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min(spentPercentage, 100)}%`,
                backgroundColor: cardTextColor,
                borderRadius: borderRadius.full,
              }}
            />
          </View>
          <Text
            style={{
              color: cardTextColor,
              opacity: 0.6,
              fontSize: typography.size.xs,
              fontWeight: typography.weight.medium,
            }}
          >
            {spentPercentage.toFixed(1)}% {t('Spent')}
          </Text>
        </View>
      </View>

      <View
        className="flex-row justify-between gap-lg"
      >
        <View className="flex-1">
          <Text
            style={{
              color: cardTextColor,
              opacity: 0.6,
              fontSize: typography.size.xs,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.xs,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {t('Spent')}
          </Text>
          <Text
            style={{
              color: cardTextColor,
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              letterSpacing: -0.5,
            }}
          >
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <Text
            style={{
              color: cardTextColor,
              opacity: 0.6,
              fontSize: typography.size.xs,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.xs,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {t('Remaining')}
          </Text>
          <Text
            style={{
              color: remainingTextColor,
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              letterSpacing: -0.5,
            }}
          >
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};

type BudgetSummaryBackProps = {
  metrics: SummaryMetrics;
  palette: CardPalette;
  tokens: Pick<ThemeTokens, 'spacing' | 'typography'>;
  chartSize: number;
  chartInnerRadius: number;
  slices: PieSlice[];
  formatCurrency: FormatCurrency;
  t: Translate;
};

export const BudgetSummaryBack = ({
  metrics,
  palette,
  tokens,
  chartSize,
  chartInnerRadius,
  slices,
  formatCurrency,
  t,
}: BudgetSummaryBackProps) => {
  const { spacing, typography } = tokens;
  const { cardBgColor, cardTextColor, remainingTextColor, spentColor, remainingColor } = palette;
  const { totalBudget, totalSpent, remaining, spentPercentage } = metrics;

  return (
    <View className="flex-1 justify-between" style={{ position: 'relative', zIndex: 1 }}>
      <View
        className="flex-row justify-between items-center"
        style={{ marginBottom: spacing.sm }}
      >
        <Text
          style={{
            color: cardTextColor,
            opacity: 0.6,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {t('BudgetOverview')}
        </Text>
        <Text
          style={{
            color: cardTextColor,
            fontSize: typography.size.lg,
            fontWeight: typography.weight.semibold,
            letterSpacing: -0.3,
          }}
        >
          {formatCurrency(totalBudget)}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="items-center justify-center" style={{ width: chartSize, height: chartSize }}>
          <PieChart
            slices={slices}
            size={chartSize}
            innerRadius={chartInnerRadius}
            backgroundColor={cardBgColor}
            placeholderColor={cardTextColor}
            placeholderOpacity={0.1}
          />
          <View className="absolute items-center">
            <Text
              style={{
                color: cardTextColor,
                fontSize: typography.size['3xl'],
                fontWeight: typography.weight.bold,
                letterSpacing: -0.5,
              }}
            >
              {spentPercentage.toFixed(0)}%
            </Text>
            <Text
              style={{
                color: cardTextColor,
                opacity: 0.6,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('Spent')}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between gap-lg">
        <View className="flex-1">
          <View className="flex-row items-center gap-xs" style={{ marginBottom: spacing.xs }}>
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: spentColor }} />
            <Text
              style={{
                color: cardTextColor,
                opacity: 0.6,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('Spent')}
            </Text>
          </View>
          <Text
            style={{
              color: cardTextColor,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
              letterSpacing: -0.3,
            }}
          >
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <View className="flex-row items-center gap-xs" style={{ marginBottom: spacing.xs }}>
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: remainingColor }} />
            <Text
              style={{
                color: cardTextColor,
                opacity: 0.6,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('Remaining')}
            </Text>
          </View>
          <Text
            style={{
              color: remainingTextColor,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
              letterSpacing: -0.3,
            }}
          >
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};
