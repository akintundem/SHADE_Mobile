import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Colors } from '../../theme/designSystem';

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface NotificationInfo {
  type: NotificationType;
  title: string;
  message: string;
  code?: string;
  details?: string;
  retryable?: boolean;
  onRetry?: () => void;
}

interface NotificationModalProps {
  visible: boolean;
  notification: NotificationInfo | null;
  onClose: () => void;
  onRetry?: () => void;
}

const getNotificationConfig = (type: NotificationType, colors: any, _brand: any) => {
  switch (type) {
    case 'error':
      return {
        icon: AlertTriangle,
        iconColor: colors.semantic.error,
        bgColor: colors.semantic.errorLight,
        borderColor: colors.semantic.error,
      };
    case 'success':
      return {
        icon: CheckCircle,
        iconColor: colors.semantic.success,
        bgColor: colors.semantic.successLight,
        borderColor: colors.semantic.success,
      };
    case 'warning':
      return {
        icon: AlertCircle,
        iconColor: colors.semantic.warning,
        bgColor: colors.semantic.warningLight,
        borderColor: colors.semantic.warning,
      };
    case 'info':
    default:
      return {
        icon: Info,
        iconColor: colors.semantic.info,
        bgColor: colors.semantic.infoLight,
        borderColor: colors.semantic.info,
      };
  }
};

export default function NotificationModal({
  visible,
  notification,
  onClose,
  onRetry,
}: NotificationModalProps) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const overlayTransparent = colors.overlay.replace(
    /rgba\((\s*\d+\s*,\s*\d+\s*,\s*\d+)\s*,\s*[\d.]+\)/,
    'rgba($1, 0)'
  );

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && notification) {
      // Reset animations
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
      backdropAnim.setValue(0);
      iconScale.setValue(0);

      // Start animations
      Animated.parallel([
        // Backdrop fade in
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Content fade and scale in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: 100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
        // Icon bounce in
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, notification, backdropAnim, fadeAnim, iconScale, scaleAnim]);

  if (!notification) return null;

  const config = getNotificationConfig(notification.type, colors, brand);
  const IconComponent = config.icon;

  const handleRetry = () => {
    if (notification.onRetry) {
      notification.onRetry();
    } else if (onRetry) {
      onRetry();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: backdropAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [overlayTransparent, colors.overlay],
          }),
          padding: spacing.lg,
        }}
      >
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          className="w-full max-w-[400px] rounded-xl p-lg border-2 bg-light-surface dark:bg-dark-surface"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            borderColor: config.borderColor,
            shadowColor: Colors.dark.text.inverse,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-md">
            <View className="flex-row items-center flex-1 gap-sm">
              <Animated.View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  transform: [{ scale: iconScale }],
                  backgroundColor: config.bgColor,
                }}
              >
                <IconComponent size={24} color={config.iconColor} />
              </Animated.View>
              <Text
                className="flex-1 text-lg font-bold text-txt-primary dark:text-txt-dark-primary"
                numberOfLines={1}
              >
                {notification.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-xs rounded-sm bg-light-background dark:bg-dark-background"
            >
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Text className="leading-6 text-base text-txt-secondary dark:text-txt-dark-secondary mb-md">
            {notification.message}
          </Text>

          {/* Error Code */}
          {notification.code && (
            <View className="bg-light-background dark:bg-dark-background p-sm rounded-md mb-md">
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary font-mono">
                Error Code: {notification.code}
              </Text>
            </View>
          )}

          {/* Details */}
          {notification.details && (
            <View className="bg-light-background dark:bg-dark-background p-sm rounded-md mb-md">
              <Text className="leading-5 text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                {notification.details}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row justify-end gap-sm mt-sm">
            <TouchableOpacity
              onPress={onClose}
              className="flex-row items-center px-lg py-sm rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
            >
              <Text className="font-semibold text-txt-primary dark:text-txt-dark-primary">
                Close
              </Text>
            </TouchableOpacity>

            {notification.retryable && (
              <TouchableOpacity
                onPress={handleRetry}
                className="flex-row items-center"
                style={{
                  gap: spacing.xs,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  backgroundColor: brand.primary,
                  borderRadius: borderRadius.md,
                }}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
