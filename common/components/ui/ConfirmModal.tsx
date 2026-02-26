import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type ConfirmModalVariant = 'default' | 'danger' | 'warning' | 'success';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  showIcon?: boolean;
};

const ICONS = {
  default: Info,
  danger: XCircle,
  warning: AlertTriangle,
  success: CheckCircle,
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
  showIcon = true,
}: Props) {
  const { colors, isDark, disabledButtonBackground } = useTheme();

  const getConfirmBgClasses = () => {
    if (isLoading) return '';
    switch (variant) {
      case 'danger':
        return 'bg-semantic-error';
      case 'warning':
        return 'bg-semantic-warning';
      case 'success':
        return 'bg-semantic-success';
      default:
        return 'bg-brand-primary dark:bg-txt-inverse';
    }
  };

  const getConfirmBgStyle = () => (isLoading ? { backgroundColor: disabledButtonBackground } : undefined);

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return colors.semantic.error;
      case 'warning':
        return colors.semantic.warning;
      case 'success':
        return colors.semantic.success;
      default:
        return colors.text.tertiary;
    }
  };

  // Default variant: dark button in light mode (inverse text), light button in dark mode (primary text)
  const getConfirmTextClasses = () => {
    const baseClasses = 'text-base font-semibold';
    if (variant === 'default') {
      return `${baseClasses} text-txt-inverse dark:text-txt-dark-primary`;
    }
    return `${baseClasses} text-txt-inverse`;
  };

  const getActivityIndicatorColor = () => {
    if (variant === 'default') {
      return isDark ? colors.text.primary : colors.text.inverse;
    }
    return colors.text.inverse;
  };

  const Icon = ICONS[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center p-2xl bg-light-overlay dark:bg-dark-overlay-stronger">
        <View className="w-full max-w-[340px] rounded-xl bg-light-background dark:bg-dark-background p-2xl">
          {showIcon && (
            <View className="self-center mb-lg">
              <Icon size={40} color={getIconColor()} strokeWidth={1.5} />
            </View>
          )}

          <Text className="text-lg font-bold text-center text-txt-primary dark:text-txt-dark-primary mb-sm">
            {title}
          </Text>

          <Text className="text-sm text-center text-txt-tertiary dark:text-txt-dark-tertiary leading-[20px] mb-2xl">
            {message}
          </Text>

          <View className="flex-row gap-md">
            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg py-[14px] bg-light-surface dark:bg-dark-surface-elevated"
            >
              <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-lg py-[14px] ${getConfirmBgClasses()}`}
              style={getConfirmBgStyle()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={getActivityIndicatorColor()} />
              ) : (
                <Text className={getConfirmTextClasses()}>
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
