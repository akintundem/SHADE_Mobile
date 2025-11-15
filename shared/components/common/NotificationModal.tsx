import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

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

const getNotificationConfig = (type: NotificationType, colors: any, brand: any) => {
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
  }, [visible, notification]);

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
        style={{
          flex: 1,
          backgroundColor: backdropAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
          }),
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            width: '100%',
            maxWidth: 400,
            borderWidth: 2,
            borderColor: config.borderColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
              <Animated.View
                style={{
                  transform: [{ scale: iconScale }],
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: config.bgColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconComponent size={24} color={config.iconColor} />
              </Animated.View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.bold,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: spacing.xs,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.background,
              }}
            >
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.base,
              lineHeight: 24,
              marginBottom: spacing.md,
            }}
          >
            {notification.message}
          </Text>

          {/* Error Code */}
          {notification.code && (
            <View
              style={{
                backgroundColor: colors.background,
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.size.sm,
                  fontFamily: 'monospace',
                }}
              >
                Error Code: {notification.code}
              </Text>
            </View>
          )}

          {/* Details */}
          {notification.details && (
            <View
              style={{
                backgroundColor: colors.background,
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.size.sm,
                  lineHeight: 20,
                }}
              >
                {notification.details}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              justifyContent: 'flex-end',
              marginTop: spacing.sm,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: typography.weight.semibold,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>

            {notification.retryable && (
              <TouchableOpacity
                onPress={handleRetry}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
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


