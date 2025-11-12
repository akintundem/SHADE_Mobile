import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { colors } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: colors.border,
          borderRadius,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
};

export const EventCardSkeleton: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      <Skeleton width="80%" height={20} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="60%" height={16} style={{ marginBottom: spacing.md }} />
      <Skeleton width="100%" height={120} borderRadius={borderRadius.md} style={{ marginBottom: spacing.sm }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="20%" height={16} />
      </View>
    </View>
  );
};

export const EventListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = false,
}) => {
  const { colors, spacing, typography } = useTheme();
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnimation]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: transparent ? 'transparent' : colors.background + 'CC',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        opacity: fadeAnimation,
      }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          padding: spacing.xl,
          borderRadius: 12,
          alignItems: 'center',
          minWidth: 120,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 16,
            fontWeight: typography.weight.medium,
            marginTop: spacing.md,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      {children}
      {refreshing && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  const { colors, spacing, typography, borderRadius, brand } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
      }}
    >
      {icon && (
        <View style={{ marginBottom: spacing.lg }}>
          {icon}
        </View>
      )}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: 20,
          fontWeight: typography.weight.semibold,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: spacing.lg,
          }}
        >
          {subtitle}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          style={{
            backgroundColor: brand.primary,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
          }}
          onPress={action.onPress}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: typography.weight.semibold,
            }}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
