import { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

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
  const { colors, isDark } = useTheme();
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
      outputRange: isDark ? [0.4, 0.6] : [0.3, 0.7],
    }),
  };

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: isDark ? colors.surfaceElevated : colors.border,
          borderRadius,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
};

interface ImageSkeletonProps {
  aspectRatio?: number;
  borderRadius?: number;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  aspectRatio = 1,
  borderRadius = 0,
}) => {
  const { colors, isDark } = useTheme();
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
      outputRange: isDark ? [0.4, 0.6] : [0.3, 0.7],
    }),
  };

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          aspectRatio,
          backgroundColor: isDark ? colors.surfaceElevated : colors.border,
          borderRadius,
        },
        shimmerStyle,
      ]}
    />
  );
};

export const EventCardSkeleton: React.FC = () => {
  const { spacing, borderRadius } = useTheme();

  return (
    <View className="bg-light-background dark:bg-dark-background">
      {/* Square image placeholder - matches EventCard aspectRatio: 1 */}
      <ImageSkeleton aspectRatio={1} />
      
      {/* Content below image - matches EventCard layout */}
      <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.lg }}>
        {/* Tags and status row */}
        <View className="flex-row items-center" style={{ gap: spacing.md, marginBottom: spacing.md }}>
          <Skeleton width={60} height={14} borderRadius={borderRadius.xs} />
          <Skeleton width={70} height={14} borderRadius={borderRadius.xs} />
        </View>
        
        {/* Title */}
        <Skeleton width="90%" height={24} borderRadius={borderRadius.xs} style={{ marginBottom: spacing.sm }} />
        
        {/* Description */}
        <Skeleton width="100%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="75%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: spacing.md }} />
        
        {/* Location and time */}
        <View className="flex-row" style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
          <View className="flex-row items-center" style={{ gap: spacing.xs }}>
            <Skeleton width={16} height={16} borderRadius={borderRadius.full} />
            <Skeleton width={100} height={14} borderRadius={borderRadius.xs} />
          </View>
          <View className="flex-row items-center" style={{ gap: spacing.xs }}>
            <Skeleton width={16} height={16} borderRadius={borderRadius.full} />
            <Skeleton width={60} height={14} borderRadius={borderRadius.xs} />
          </View>
        </View>
        
        {/* Stats and participants row */}
        <View className="flex-row items-center justify-between border-t border-light-border dark:border-dark-border pt-lg">
          {/* Stats */}
          <View className="flex-row items-center" style={{ gap: spacing.xl }}>
            <View className="flex-row items-center" style={{ gap: spacing.xs }}>
              <Skeleton width={18} height={18} borderRadius={borderRadius.full} />
              <Skeleton width={20} height={14} borderRadius={borderRadius.xs} />
            </View>
          </View>
          
          {/* Participants */}
          <View className="flex-row items-center" style={{ gap: spacing.sm }}>
            <View className="flex-row">
              <Skeleton width={32} height={32} borderRadius={16} />
              <Skeleton width={32} height={32} borderRadius={16} style={{ marginLeft: -spacing.sm }} />
            </View>
            <Skeleton width={60} height={12} borderRadius={borderRadius.xs} />
          </View>
        </View>
      </View>
    </View>
  );
};

export const EventMiniCardSkeleton: React.FC = () => {
  const { spacing, borderRadius } = useTheme();

  return (
    <View className="flex-row items-center" style={{ gap: spacing.lg, paddingVertical: spacing.sm }}>
      <Skeleton width={72} height={72} borderRadius={borderRadius.md} />
      <View className="flex-1" style={{ gap: spacing.xs }}>
        <Skeleton width="30%" height={12} />
        <Skeleton width="80%" height={16} />
        <Skeleton width="55%" height={12} />
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
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  const hasAnimatedOut = useRef(false);

  useEffect(() => {
    if (visible) {
      hasAnimatedOut.current = false;
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Set flag after animation completes
        hasAnimatedOut.current = true;
      });
    }
  }, [visible, fadeAnimation, scaleAnimation]);

  if (!visible && hasAnimatedOut.current) return null;

  return (
    <Animated.View
      className={`absolute inset-0 items-center justify-center ${transparent ? '' : 'bg-light-background dark:bg-dark-background'}`}
      style={{
        zIndex: 1000,
        opacity: fadeAnimation,
      }}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View
        className="items-center justify-center"
        style={{
          transform: [{ scale: scaleAnimation }],
        }}
      >
        {/* Minimalist Spinner - Wealthsimple style */}
        <View
          className="w-10 h-10 items-center justify-center"
          style={{ marginBottom: spacing.md }}
        >
          <ActivityIndicator 
            size="large" 
            color={colors.text.primary}
            style={{
              transform: [{ scale: 1.1 }],
            }}
          />
        </View>

        {/* Message Text */}
        {message && (
          <Text
            className="text-center tracking-[0.2px] text-txt-secondary dark:text-txt-dark-secondary"
            style={{
              fontSize: typography.size.sm,
              fontFamily: typography.family.regular,
              fontWeight: typography.weight.regular,
            }}
          >
            {message}
          </Text>
        )}
      </Animated.View>
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
  onRefresh: _onRefresh,
  children,
}) => {
  const { colors } = useTheme();

  return (
      <View className="flex-1">
        {children}
        {refreshing && (
          <View
            className="absolute top-0 left-0 right-0 h-[60px] items-center justify-center bg-light-background dark:bg-dark-background"
            style={{
              zIndex: 100,
            }}
          >
            <ActivityIndicator size="small" color={colors.text.primary} />
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
  const { spacing, typography, borderRadius, brand } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{
        padding: spacing.xl,
      }}
    >
      {icon && (
        <View style={{ marginBottom: spacing.lg }}>
          {icon}
        </View>
      )}
      <Text
        className="text-center text-txt-primary dark:text-txt-dark-primary"
        style={{
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-center text-txt-secondary dark:text-txt-dark-secondary"
          style={{
            fontSize: typography.size.sm,
            lineHeight: typography.size.sm * 1.5,
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
            className="text-txt-inverse"
            style={{
              fontSize: typography.size.sm,
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
