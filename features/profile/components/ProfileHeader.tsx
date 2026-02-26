import React, { useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Settings, Pencil } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import type { ProfileStats, ProfileUser } from '../types';
import { DEFAULT_AVATAR, getDisplayNameFromUser, getHandleFromUser } from '../utils/profile';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

type Props = {
  user: ProfileUser | null;
  stats?: ProfileStats;
  statsLoading?: boolean;
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
};

export const ProfileHeader = React.memo(function ProfileHeader({
  user,
  stats,
  statsLoading,
  onEditProfile,
  onOpenSettings,
  onFollowersPress,
  onFollowingPress,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [avatarError, setAvatarError] = useState(false);

  const handle = useMemo(() => getHandleFromUser(user), [user]);
  const displayName = useMemo(() => getDisplayNameFromUser(user, t('Member')), [user, t]);

  const resolvedUri = getImageUrl(user?.profilePictureUrl);
  const avatarUri = !avatarError && resolvedUri ? resolvedUri : DEFAULT_AVATAR;

  const formatStat = (value?: number) => {
    if (statsLoading) return '—';
    if (typeof value !== 'number') return '0';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  return (
    <View className="bg-light-background dark:bg-dark-background">
      {/* Nav row */}
      <View className="h-14 px-xl flex-row items-center justify-end">
        <TouchableOpacity onPress={onOpenSettings} activeOpacity={0.7} className="p-sm">
          <Settings size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Hero section */}
      <View className="px-xl pb-xl">
        {/* Avatar + edit button */}
        <View className="flex-row items-end justify-between mb-lg">
          <View className="relative">
            <Image
              source={{ uri: avatarUri }}
              className="h-[100px] w-[100px] rounded-full bg-light-surface dark:bg-dark-surface"
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          </View>
          <TouchableOpacity
            onPress={onEditProfile}
            activeOpacity={0.7}
            className="flex-row items-center gap-xs border border-light-border dark:border-dark-border rounded-full px-lg py-sm mb-1"
          >
            <Pencil size={13} color={colors.text.primary} strokeWidth={2} />
            <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary tracking-wide">
              {t('EditProfile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text
          className="text-3xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.8px] leading-tight"
          numberOfLines={1}
        >
          {displayName}
        </Text>

        {/* Handle */}
        <Text className="mt-[3px] text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
          @{handle}
        </Text>

        {/* Bio placeholder space — room to grow */}

        {/* Stats */}
        <View className="flex-row mt-xl gap-2xl">
          <TouchableOpacity
            onPress={onFollowersPress}
            activeOpacity={0.7}
            disabled={!onFollowersPress}
          >
            <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.5px]">
              {formatStat(stats?.followers)}
            </Text>
            <Text className="mt-[2px] text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary uppercase tracking-wider">
              {t('Followers')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onFollowingPress}
            activeOpacity={0.7}
            disabled={!onFollowingPress}
          >
            <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.5px]">
              {formatStat(stats?.following)}
            </Text>
            <Text className="mt-[2px] text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary uppercase tracking-wider">
              {t('Following')}
            </Text>
          </TouchableOpacity>

          <View>
            <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.5px]">
              {formatStat(stats?.events)}
            </Text>
            <Text className="mt-[2px] text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary uppercase tracking-wider">
              {t('Events')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
