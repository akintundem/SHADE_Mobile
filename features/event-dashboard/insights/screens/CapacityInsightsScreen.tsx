import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, ChevronLeft, Users } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { eventService } from '../../../../core/events/services/event';
import { EventCapacityResponse } from '../../../../core/events/types/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Params = { eventId?: string };

export function CapacityInsightsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors, isDark } = useTheme();
  const text = colors.text;

  const withAlpha = (hex: string, alpha: number) => {
    if (!hex.startsWith('#')) return hex;
    const value = hex.replace('#', '');
    const isShort = value.length === 3;
    const r = parseInt(isShort ? value[0] + value[0] : value.slice(0, 2), 16);
    const g = parseInt(isShort ? value[1] + value[1] : value.slice(2, 4), 16);
    const b = parseInt(isShort ? value[2] + value[2] : value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [capacity, setCapacity] = useState<EventCapacityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCapacity = useCallback(async (isRefresh = false) => {
    if (!eventId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await eventService.getEventCapacity(eventId);
      setCapacity(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'getEventCapacity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCapacity();
  }, [fetchCapacity]);

  const onRefresh = useCallback(() => {
    fetchCapacity(true);
  }, [fetchCapacity]);

  const utilizationPercentage = capacity?.utilizationPercentage ?? 0;
  const availableSpots = capacity?.availableSpots ?? null;
  const currentCount = capacity?.currentAttendeeCount ?? 0;
  const totalCapacity = capacity?.capacity ?? null;

  const getUtilizationColor = () => {
    if (utilizationPercentage >= 90) return colors.semantic.error;
    if (utilizationPercentage >= 75) return colors.semantic.warning;
    return colors.semantic.success;
  };

  const getUtilizationTextClass = () => {
    if (utilizationPercentage >= 90) return 'text-semantic-error';
    if (utilizationPercentage >= 75) return 'text-semantic-warning';
    return 'text-semantic-success';
  };

  const getUtilizationBgColor = () => {
    if (utilizationPercentage >= 90) {
      return isDark ? withAlpha(colors.semantic.error, 0.2) : colors.semantic.errorLight;
    }
    if (utilizationPercentage >= 75) {
      return isDark ? withAlpha(colors.semantic.warning, 0.2) : colors.semantic.warningLight;
    }
    return isDark ? withAlpha(colors.semantic.success, 0.2) : colors.semantic.successLight;
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['bottom']}>
      <ScreenHeader
        title={t('CapacityInsights')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
      />

      {loading && !refreshing ? (
        <LoadingOverlay visible={true} />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-xl">
          <EmptyState
            icon={<BarChart3 size={40} color={text.tertiary} />}
            title={t('FailedToLoadCapacity')}
            subtitle={error.message}
          />
        </View>
      ) : capacity ? (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={text.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="px-xl pt-lg">
            {/* Utilization Card */}
            <View className="rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-xl mb-lg">
              <View className="flex-row items-center mb-md">
                <BarChart3 size={20} color={text.primary} strokeWidth={2} />
                <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary ml-sm">
                  {t('Utilization')}
                </Text>
              </View>

              <View className="mb-md">
                <View className="flex-row items-baseline mb-xs">
                  <Text className={`text-3xl font-bold ${getUtilizationTextClass()}`}>
                    {utilizationPercentage.toFixed(1)}%
                  </Text>
                  <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary ml-xs">
                    {t('Full')}
                  </Text>
                </View>
                <View
                  className="h-2 rounded-full overflow-hidden bg-light-border-light dark:bg-dark-border-light"
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(utilizationPercentage, 100)}%`,
                      backgroundColor: getUtilizationColor(),
                    }}
                  />
                </View>
              </View>

              <View
                className="rounded-lg p-md"
                style={{ backgroundColor: getUtilizationBgColor() }}
              >
                <Text className={`text-xs font-medium ${getUtilizationTextClass()}`}>
                  {utilizationPercentage >= 90
                    ? t('CapacityNearlyFull')
                    : utilizationPercentage >= 75
                    ? t('CapacityGettingFull')
                    : t('CapacityAvailable')}
                </Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row gap-md mb-lg">
              <View className="flex-1 rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-lg">
                <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                  {t('CurrentAttendees')}
                </Text>
                <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary">
                  {currentCount}
                </Text>
              </View>

              {totalCapacity !== null && (
                <View className="flex-1 rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-lg">
                  <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                    {t('TotalCapacity')}
                  </Text>
                  <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary">
                    {totalCapacity}
                  </Text>
                </View>
              )}
            </View>

            {/* Available Spots */}
            {availableSpots !== null && (
              <View className="rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-lg">
                <View className="flex-row items-center mb-xs">
                  <Users size={16} color={text.secondary} strokeWidth={2} />
                  <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary ml-sm">
                    {t('AvailableSpots')}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary">
                  {availableSpots}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
