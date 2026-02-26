import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';

type FollowButtonVariant = 'default' | 'compact';

type Props = {
  isFollowing: boolean;
  isLoading?: boolean;
  onPress: () => void;
  variant?: FollowButtonVariant;
  disabled?: boolean;
};

export function FollowButton({
  isFollowing,
  isLoading = false,
  onPress,
  variant = 'default',
  disabled = false,
}: Props) {
  const { t } = useI18n();
  const { colors, isDark, disabledButtonBackground } = useTheme();

  const isDisabled = disabled || isLoading;

  const isCompact = variant === 'compact';
  const sizeClasses = isCompact
    ? { container: 'px-md py-[6px] min-w-[72px]', text: 'text-xs' }
    : { container: 'px-lg py-sm min-w-[88px]', text: 'text-sm' };

  // Build dynamic className based on state (disabled bg overridden via style)
  const getContainerClasses = () => {
    const baseClasses = `border rounded-full flex-row items-center justify-center ${sizeClasses.container}`;
    
    if (isDisabled && !isLoading) {
      return `${baseClasses} border-light-border dark:border-dark-border`;
    }
    
    if (isFollowing) {
      return `${baseClasses} bg-transparent border-light-border dark:border-dark-border`;
    }
    
    return `${baseClasses} bg-brand-primary dark:bg-txt-inverse border-brand-primary dark:border-txt-inverse`;
  };

  const getContainerStyle = () => {
    if (isDisabled && !isLoading) return { backgroundColor: disabledButtonBackground };
    return undefined;
  };

  const getTextClasses = () => {
    const baseClasses = `font-semibold tracking-[0.2px] ${sizeClasses.text}`;
    
    if (isDisabled && !isLoading) {
      return `${baseClasses} text-txt-disabled dark:text-txt-dark-disabled`;
    }
    
    if (isFollowing) {
      return `${baseClasses} text-txt-primary dark:text-txt-dark-primary`;
    }
    
    return `${baseClasses} text-txt-inverse dark:text-txt-primary`;
  };

  const getActivityIndicatorColor = () => {
    if (isDisabled && !isLoading) {
      return colors.text.disabled;
    }
    if (isFollowing) {
      return colors.text.primary;
    }
    return isDark ? colors.text.primary : colors.text.inverse;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={getContainerClasses()}
      style={getContainerStyle()}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getActivityIndicatorColor()} />
      ) : (
        <Text className={getTextClasses()}>
          {isFollowing ? t('Following') : t('Follow')}
        </Text>
      )}
    </TouchableOpacity>
  );
}
