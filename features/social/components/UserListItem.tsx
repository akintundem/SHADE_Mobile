import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FollowButton } from './FollowButton';
import { useFollowActions } from '../hooks/useFollowActions';
import { getImageUrl } from '../../../config/appConfig';
import { getDisplayNameFromUser } from '../../profile/utils/profile';
import type { UserProfileResponse } from '../../../core/social/types/userFollow';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

type Props = {
  user: UserProfileResponse;
  onPress?: (user: UserProfileResponse) => void;
  showFollowButton?: boolean;
  hideCurrentUserButton?: boolean;
  currentUserId?: string;
  isLast?: boolean;
  badgeLabel?: string;
};

export function UserListItem({
  user,
  onPress,
  showFollowButton = true,
  hideCurrentUserButton = true,
  currentUserId,
  isLast = false,
  badgeLabel,
}: Props) {
  const isCurrentUser = hideCurrentUserButton && currentUserId === user.id;

  const { isFollowing, isLoading, toggleFollow } = useFollowActions({
    userId: user.id,
    initialIsFollowing: user.isFollowing ?? false,
  });

  const handlePress = useCallback(() => {
    onPress?.(user);
  }, [onPress, user]);

  const handleFollowPress = useCallback(async () => {
    try {
      await toggleFollow();
    } catch {
      // Error handled in hook
    }
  }, [toggleFollow]);

  const avatarUri = getImageUrl(user.profilePictureUrl) || DEFAULT_AVATAR;
  const displayName = getDisplayNameFromUser(user, 'User');

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || '?';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      className="flex-row items-center px-xl py-md"
    >
      {user.profilePictureUrl ? (
        <Image
          source={{ uri: avatarUri }}
          className="w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface"
          resizeMode="cover"
        />
      ) : (
        <View
          className="w-11 h-11 rounded-full items-center justify-center bg-light-surface dark:bg-dark-surface"
        >
          <Text
            className="text-sm font-semibold text-txt-secondary dark:text-txt-dark-secondary"
          >
            {getInitials(displayName)}
          </Text>
        </View>
      )}

      <View className="flex-1 ml-md">
        <View className="flex-row items-center gap-xs">
          <Text
            className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary flex-shrink"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {badgeLabel ? (
            <View className="px-sm py-[2px] rounded-full border border-light-border-muted dark:border-dark-border-muted bg-light-surface-soft dark:bg-dark-surface-muted">
              <Text className="text-xs font-semibold uppercase tracking-[0.6px] text-txt-tertiary dark:text-txt-dark-tertiary">
                {badgeLabel}
              </Text>
            </View>
          ) : null}
        </View>
        {user.email && (
          <Text
            className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]"
            numberOfLines={1}
          >
            {user.email}
          </Text>
        )}
        {user.isMutual && (
          <Text
            className="text-xs mt-[2px] text-txt-disabled dark:text-txt-dark-disabled"
          >
            Follows you
          </Text>
        )}
      </View>

      {showFollowButton && !isCurrentUser && (
        <FollowButton
          isFollowing={isFollowing}
          isLoading={isLoading}
          onPress={handleFollowPress}
          variant="compact"
        />
      )}
    </TouchableOpacity>
  );
}
