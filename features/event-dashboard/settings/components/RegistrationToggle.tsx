import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Lock, Unlock } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';

const withAlpha = (hex: string, alpha: number) => {
  if (!hex.startsWith('#')) return hex;
  const value = hex.replace('#', '');
  const isShort = value.length === 3;
  const r = parseInt(isShort ? value[0] + value[0] : value.slice(0, 2), 16);
  const g = parseInt(isShort ? value[1] + value[1] : value.slice(2, 4), 16);
  const b = parseInt(isShort ? value[2] + value[2] : value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  onToggle: (open: boolean) => Promise<void>;
  disabled?: boolean;
};

export function RegistrationToggle({ isOpen, isLoading = false, onToggle, disabled = false }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isLoading || localLoading;

  const handleToggle = useCallback(async () => {
    if (loading || disabled) return;
    setLocalLoading(true);
    try {
      await onToggle(!isOpen);
    } finally {
      setLocalLoading(false);
    }
  }, [disabled, isOpen, loading, onToggle]);

  const statusBg = isOpen
    ? isDark ? withAlpha(colors.semantic.success, 0.2) : colors.semantic.successLight
    : isDark ? withAlpha(colors.semantic.error, 0.2) : colors.semantic.errorLight;
  const statusText = isOpen ? colors.semantic.success : colors.semantic.error;
  const StatusIcon = isOpen ? Unlock : Lock;

  return (
    <View className="rounded-lg border border-light-border-muted bg-light-background p-lg dark:border-dark-border-strong dark:bg-dark-card">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
            {t('EventRegistration')}
          </Text>
          <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
            {isOpen ? t('RegistrationOpenDescription') : t('RegistrationClosedDescription')}
          </Text>
        </View>

        <View className="flex-row items-center gap-md">
          {/* Status Badge */}
          <View
            className="flex-row items-center gap-[4px] rounded-full px-[10px] py-xs"
            style={{ backgroundColor: statusBg }}
          >
            <StatusIcon size={12} color={statusText} strokeWidth={2.5} />
            <Text className={`text-xs font-semibold ${isOpen ? 'text-semantic-success' : 'text-semantic-error'}`}>
              {isOpen ? t('Open') : t('Closed')}
            </Text>
          </View>

          {/* Toggle Button */}
          <TouchableOpacity
            onPress={handleToggle}
            disabled={loading || disabled}
            activeOpacity={0.7}
            className={`rounded-md px-[14px] py-sm ${disabled ? 'opacity-50' : ''}`}
            style={{
              backgroundColor: isOpen
                ? isDark ? withAlpha(colors.semantic.error, 0.2) : colors.semantic.errorLight
                : isDark ? withAlpha(colors.semantic.success, 0.2) : colors.semantic.successLight,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={isOpen ? colors.semantic.error : colors.semantic.success} />
            ) : (
              <Text className={`text-sm font-semibold ${isOpen ? 'text-semantic-error' : 'text-semantic-success'}`}>
                {isOpen ? t('CloseRegistration') : t('OpenRegistration')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
