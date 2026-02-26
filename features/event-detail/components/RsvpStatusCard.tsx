import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, X, HelpCircle, Clock } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { AttendeeStatus } from '../../../core/attendee/types/attendee';
import { useRsvpStatus } from '../hooks/useRsvpStatus';
import { useTheme } from '../../../common/theme/ThemeProvider';

type StatusOption = {
  status: AttendeeStatus;
  label: string;
  icon: typeof Check;
  color: string;
  bgColor: string;
};

type Props = {
  eventId: string;
  showActions?: boolean;
  compact?: boolean;
};

export function RsvpStatusCard({ eventId, showActions = true, compact = false }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const borderColor = colors.borderLight;
  const pendingColor = colors.text.tertiary;

  const { status, isLoading, rsvp, updateStatus, cancelRsvp } = useRsvpStatus({
    eventId,
  });

  const statusOptions: StatusOption[] = useMemo(
    () => [
      {
        status: AttendeeStatus.CONFIRMED,
        label: t('Going'),
        icon: Check,
        color: colors.semantic.success,
        bgColor: isDark ? `${colors.semantic.success}25` : colors.semantic.successLight,
      },
      {
        status: AttendeeStatus.TENTATIVE,
        label: t('Maybe'),
        icon: HelpCircle,
        color: colors.semantic.warning,
        bgColor: isDark ? `${colors.semantic.warning}25` : colors.semantic.warningLight,
      },
      {
        status: AttendeeStatus.DECLINED,
        label: t('CantGo'),
        icon: X,
        color: colors.semantic.error,
        bgColor: isDark ? `${colors.semantic.error}25` : colors.semantic.errorLight,
      },
    ],
    [colors, isDark, t]
  );

  const currentStatusOption = useMemo(() => {
    if (!status) return null;
    return statusOptions.find(opt => opt.status === status);
  }, [status, statusOptions]);

  const handleStatusPress = useCallback(
    async (newStatus: AttendeeStatus) => {
      try {
        if (!status) {
          // First time RSVPing - just RSVP then update status
          await rsvp();
        }
        if (newStatus !== status) {
          await updateStatus(newStatus);
        }
      } catch {
        // Error handled in hook
      }
    },
    [rsvp, status, updateStatus]
  );

  const handleCancelPress = useCallback(async () => {
    try {
      await cancelRsvp();
    } catch {
      // Error handled in hook
    }
  }, [cancelRsvp]);

  // No RSVP yet - show RSVP prompt
  if (!status && !isLoading) {
    return (
      <View className={`rounded-lg border border-light-border-muted bg-light-background dark:bg-dark-card ${compact ? 'p-md' : 'p-lg'}`}>
        <Text
          className={`${compact ? 'text-sm mb-sm' : 'text-base mb-md'} font-semibold text-txt-primary dark:text-txt-dark-primary`}
        >
          {t('WillYouAttend')}
        </Text>

        {showActions && (
          <View className="flex-row gap-sm">
            {statusOptions.map(option => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.status}
                  onPress={() => handleStatusPress(option.status)}
                  activeOpacity={0.7}
                  className={`flex-1 flex-row items-center justify-center gap-[4px] rounded-md px-sm ${compact ? 'py-sm' : 'py-[10px]'}`}
                  style={{ backgroundColor: option.bgColor }}
                >
                  <Icon size={compact ? 14 : 16} color={option.color} strokeWidth={2.5} />
                  <Text
                    className={`${compact ? 'text-xs' : 'text-sm'} font-semibold`}
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  // Has RSVP - show current status
  return (
    <View className={`rounded-lg border border-light-border-muted bg-light-background dark:bg-dark-card ${compact ? 'p-md' : 'p-lg'}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text.secondary} />
          ) : currentStatusOption ? (
            <>
              <View
                className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} rounded-full items-center justify-center`}
                style={{ backgroundColor: currentStatusOption.bgColor }}
              >
                <currentStatusOption.icon
                  size={compact ? 14 : 16}
                  color={currentStatusOption.color}
                  strokeWidth={2.5}
                />
              </View>
              <View>
                <Text
                  className={`${compact ? 'text-sm' : 'text-sm'} font-semibold text-txt-primary dark:text-txt-dark-primary`}
                >
                  {t('YourRSVP')}
                </Text>
                <Text
                  className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}
                  style={{ color: currentStatusOption.color }}
                >
                  {currentStatusOption.label}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row items-center gap-sm">
              <Clock size={compact ? 14 : 16} color={pendingColor} strokeWidth={2} />
              <Text
                className={`${compact ? 'text-sm' : 'text-sm'} text-txt-tertiary dark:text-txt-dark-tertiary`}
              >
                {t('RSVPPending')}
              </Text>
            </View>
          )}
        </View>

        {showActions && status && (
          <TouchableOpacity
            onPress={handleCancelPress}
            activeOpacity={0.7}
            disabled={isLoading}
            className="rounded-sm px-md py-[6px] bg-light-surface-soft dark:bg-dark-surface-strong"
          >
            <Text
              className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary"
            >
              {t('CancelRSVP')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showActions && status && (
        <View
          className={`flex-row gap-sm border-t border-light-border-muted dark:border-dark-border-strong ${compact ? 'mt-md pt-md' : 'mt-lg pt-lg'}`}
        >
          {statusOptions.map(option => {
            const Icon = option.icon;
            const isActive = status === option.status;
            return (
              <TouchableOpacity
                key={option.status}
                onPress={() => handleStatusPress(option.status)}
                activeOpacity={0.7}
                disabled={isLoading}
                className={`flex-1 flex-row items-center justify-center gap-[4px] rounded-md px-sm ${compact ? 'py-[6px]' : 'py-sm'} border`}
                style={{
                  backgroundColor: isActive ? option.bgColor : 'transparent',
                  borderColor: isActive ? option.color : borderColor,
                }}
              >
                <Icon
                  size={compact ? 12 : 14}
                  color={isActive ? option.color : colors.text.secondary}
                  strokeWidth={2.5}
                />
                <Text
                  className={`${compact ? 'text-xs' : 'text-xs'} font-semibold`}
                  style={{ color: isActive ? option.color : colors.text.secondary }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
