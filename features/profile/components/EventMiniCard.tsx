import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Image } from 'react-native';
import { Archive, Trash2, Lock, UserCheck, Mail, ChevronRight } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { EventAccessType, UserEventContext } from '../../../core/events/types/event';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

const SWIPE_THRESHOLD = 80;

type Props = {
  title: string;
  date: string;
  location: string;
  tagLeft?: string;
  tagRight?: string;
  imageUrl: string;
  accessType?: EventAccessType | null;
  userContext?: UserEventContext | null;
  onPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enableSwipe?: boolean;
};

const AccessBadge = ({
  Icon,
  bgColor,
  fgColor,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  bgColor: string;
  fgColor: string;
}) => (
  <View
    className="absolute bottom-0 right-0 h-5 w-5 rounded-full items-center justify-center"
    style={{ backgroundColor: bgColor }}
  >
    <Icon size={10} color={fgColor} strokeWidth={2.5} />
  </View>
);

export const EventMiniCard = React.memo(function EventMiniCard({
  title,
  date,
  location,
  tagLeft,
  tagRight,
  imageUrl,
  accessType,
  userContext,
  onPress,
  onSwipeLeft,
  onSwipeRight,
  enableSwipe = true,
}: Props) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const contrastLight = isDark ? colors.text.primary : colors.text.inverse;
  const deleteColor = colors.semantic.error;
  const archiveColor = colors.semantic.warning;

  const canViewContent = (userContext?.isOwner || userContext?.isCollaborator) ?? true;
  const overlayIcon =
    accessType === EventAccessType.TICKETED && !canViewContent
      ? Lock
      : accessType === EventAccessType.RSVP_REQUIRED && !canViewContent
      ? UserCheck
      : accessType === EventAccessType.INVITE_ONLY && !canViewContent
      ? Mail
      : null;

  const translateX = useRef(new Animated.Value(0)).current;
  const deleteActionOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const archiveActionOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 0,
    }).start();
  }, [translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8,
        onPanResponderMove: (_, { dx }) => {
          translateX.setValue(Math.max(-120, Math.min(120, dx)));
        },
        onPanResponderRelease: (_, { dx }) => {
          if (dx <= -SWIPE_THRESHOLD) onSwipeLeft?.();
          else if (dx >= SWIPE_THRESHOLD) onSwipeRight?.();
          resetPosition();
        },
        onPanResponderTerminate: resetPosition,
      }),
    [onSwipeLeft, onSwipeRight, resetPosition, translateX]
  );

  const resolvedImageUrl = getImageUrl(imageUrl) ?? imageUrl;

  return (
    <View className="overflow-hidden">
      {/* Swipe action backgrounds */}
      {enableSwipe ? (
        <View pointerEvents="none" className="absolute inset-0 flex-row">
          <Animated.View
            className="flex-1 items-start justify-center px-xl"
            style={{ backgroundColor: deleteColor, opacity: deleteActionOpacity }}
          >
            <View className="items-center gap-xs">
              <Trash2 size={18} color={contrastLight} strokeWidth={2} />
              <Text className="text-xs font-bold uppercase tracking-wider text-txt-inverse">
                {t('Delete')}
              </Text>
            </View>
          </Animated.View>
          <Animated.View
            className="flex-1 items-end justify-center px-xl"
            style={{ backgroundColor: archiveColor, opacity: archiveActionOpacity }}
          >
            <View className="items-center gap-xs">
              <Archive size={18} color={contrastLight} strokeWidth={2} />
              <Text className="text-xs font-bold uppercase tracking-wider text-txt-inverse">
                {t('Archive')}
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : null}

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...(enableSwipe ? panResponder.panHandlers : undefined)}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onPress}
          className="flex-row items-center gap-md py-md px-xl"
        >
          {/* Thumbnail */}
          <View className="relative">
            <Image
              source={{ uri: resolvedImageUrl }}
              className="h-[68px] w-[68px] rounded-xl bg-light-surface dark:bg-dark-surface"
              resizeMode="cover"
            />
            {overlayIcon ? (
              <AccessBadge
                Icon={overlayIcon}
                bgColor={colors.background}
                fgColor={colors.text.primary}
              />
            ) : null}
            {tagRight ? (
              <View className="absolute -top-1.5 -right-1.5 bg-light-text dark:bg-dark-text px-[6px] py-[2px] rounded-[4px]">
                <Text className="text-xs font-bold uppercase tracking-wider text-txt-inverse dark:text-txt-dark-inverse">
                  {tagRight}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Info */}
          <View className="flex-1 justify-center">
            {tagLeft ? (
              <Text className="text-xs font-bold uppercase tracking-[0.8px] text-txt-tertiary dark:text-txt-dark-tertiary mb-[3px]">
                {tagLeft}
              </Text>
            ) : null}
            <Text
              className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary tracking-[-0.3px] leading-snug"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary mt-[2px]">
              {date}
            </Text>
            {location ? (
              <Text
                className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]"
                numberOfLines={1}
              >
                {location}
              </Text>
            ) : null}
          </View>

          <ChevronRight size={16} color={colors.text.tertiary} strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});
