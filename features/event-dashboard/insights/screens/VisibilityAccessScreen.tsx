import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, Globe, Lock, Users } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { eventService } from '../../../../core/events/services/event';
import { EventVisibilityResponse } from '../../../../core/events/types/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Params = { eventId?: string };

export function VisibilityAccessScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const text = colors.text;

  const [visibility, setVisibility] = useState<EventVisibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVisibility = useCallback(async (isRefresh = false) => {
    if (!eventId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await eventService.getEventVisibility(eventId);
      setVisibility(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'getEventVisibility');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchVisibility();
  }, [fetchVisibility]);

  const onRefresh = useCallback(() => {
    fetchVisibility(true);
  }, [fetchVisibility]);

  const getAccessTypeIcon = (accessType?: string) => {
    switch (accessType) {
      case 'PUBLIC':
        return Globe;
      case 'PRIVATE':
        return Lock;
      case 'FRIENDS_ONLY':
        return Users;
      default:
        return Eye;
    }
  };

  const getAccessTypeLabel = (accessType?: string) => {
    switch (accessType) {
      case 'PUBLIC':
        return t('Public');
      case 'PRIVATE':
        return t('Private');
      case 'FRIENDS_ONLY':
        return t('FriendsOnly');
      default:
        return accessType || t('Unknown');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['bottom']}>
      <ScreenHeader
        title={t('VisibilityAccess')}
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
            icon={<Eye size={40} color={text.tertiary} />}
            title={t('FailedToLoadVisibility')}
            subtitle={error.message}
          />
        </View>
      ) : visibility ? (
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
            {/* Access Type Card */}
            <View className="rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-xl mb-lg">
              <View className="flex-row items-center mb-md">
                {React.createElement(getAccessTypeIcon(visibility.accessType), {
                  size: 20,
                  color: text.primary,
                  strokeWidth: 2,
                })}
                <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary ml-sm">
                  {t('AccessType')}
                </Text>
              </View>
              <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary">
                {getAccessTypeLabel(visibility.accessType)}
              </Text>
              {visibility.accessTypeDescription && (
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {visibility.accessTypeDescription}
                </Text>
              )}
            </View>

            {/* Visibility Settings */}
            <View className="rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-xl mb-lg">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary mb-md">
                {t('VisibilitySettings')}
              </Text>

              <View className="space-y-md">
                <View className="flex-row items-center justify-between py-sm">
                  <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
                    {t('IsPublic')}
                  </Text>
                  <View className="px-sm py-xs rounded-full bg-light-surface-soft dark:bg-dark-surface-strong">
                    <Text className="text-xs font-medium text-txt-primary dark:text-txt-dark-primary">
                      {visibility.isPublic ? t('Yes') : t('No')}
                    </Text>
                  </View>
                </View>

                {visibility.isSearchable !== undefined && (
                  <View className="flex-row items-center justify-between py-sm">
                    <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
                      {t('IsSearchable')}
                    </Text>
                    <View className="px-sm py-xs rounded-full bg-light-surface-soft dark:bg-dark-surface-strong">
                      <Text className="text-xs font-medium text-txt-primary dark:text-txt-dark-primary">
                        {visibility.isSearchable ? t('Yes') : t('No')}
                      </Text>
                    </View>
                  </View>
                )}

                {visibility.requiresApproval !== undefined && (
                  <View className="flex-row items-center justify-between py-sm">
                    <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
                      {t('RequiresApproval')}
                    </Text>
                    <View className="px-sm py-xs rounded-full bg-light-surface-soft dark:bg-dark-surface-strong">
                      <Text className="text-xs font-medium text-txt-primary dark:text-txt-dark-primary">
                        {visibility.requiresApproval ? t('Yes') : t('No')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
