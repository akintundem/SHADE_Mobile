import React, { useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Lock, Eye, EyeOff, Search } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../../components';
import CustomSwitch from '../../../../common/components/ui/CustomSwitch';
import { VisibilityLevel } from '../../../../core/auth/types/auth';
import { useSettings } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  onBack?: () => void;
};

export default function PrivacySettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const iconColors = { primary: colors.text.primary, secondary: colors.text.secondary };
  const borderColor = colors.borderLight;
  const { settings, updatePrivacy, isUpdating } = useSettings();

  const profileVisibility = settings?.profileVisibility ?? VisibilityLevel.PUBLIC;
  const searchVisibility = settings?.searchVisibility ?? true;
  const eventParticipationVisibility = settings?.eventParticipationVisibility ?? VisibilityLevel.PUBLIC;
  const showInEventDirectory = settings?.showInEventDirectory ?? true;

  const handleProfileVisibilityChange = useCallback(
    async (value: VisibilityLevel) => {
      await updatePrivacy({ profileVisibility: value });
    },
    [updatePrivacy]
  );

  const handleSearchVisibilityChange = useCallback(
    async (value: boolean) => {
      await updatePrivacy({ searchVisibility: value });
    },
    [updatePrivacy]
  );

  const handleEventParticipationChange = useCallback(
    async (value: VisibilityLevel) => {
      await updatePrivacy({ eventParticipationVisibility: value });
    },
    [updatePrivacy]
  );

  const handleShowInDirectoryChange = useCallback(
    async (value: boolean) => {
      await updatePrivacy({ showInEventDirectory: value });
    },
    [updatePrivacy]
  );

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-row items-center justify-between px-xl py-md">
        <TouchableOpacity onPress={onBack} className="p-xs">
          <ArrowLeft size={20} color={iconColors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
          {t('PrivacyAndSafety')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-5">
        <SettingsSection title={t('ProfileVisibility')} />
        <View className="px-xl py-sm">
          <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary mb-md">
            {t('ControlWhoCanSeeYourProfile')}
          </Text>
          <View className="flex-row gap-sm">
            <TouchableOpacity
              onPress={() => handleProfileVisibilityChange(VisibilityLevel.PUBLIC)}
              className="flex-1 p-md rounded-lg border"
              style={{
                borderColor:
                  profileVisibility === VisibilityLevel.PUBLIC ? iconColors.primary : borderColor,
                backgroundColor:
                  profileVisibility === VisibilityLevel.PUBLIC
                    ? colors.surfaceElevated
                    : 'transparent',
              }}
              disabled={isUpdating}
            >
              <View className="flex-row items-center gap-xs mb-xs">
                <Eye size={16} color={iconColors.primary} />
                <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('Public')}
                </Text>
              </View>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('AnyoneCanSeeYourProfile')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleProfileVisibilityChange(VisibilityLevel.PRIVATE)}
              className="flex-1 p-md rounded-lg border"
              style={{
                borderColor:
                  profileVisibility === VisibilityLevel.PRIVATE ? iconColors.primary : borderColor,
                backgroundColor:
                  profileVisibility === VisibilityLevel.PRIVATE
                    ? colors.surfaceElevated
                    : 'transparent',
              }}
              disabled={isUpdating}
            >
              <View className="flex-row items-center gap-xs mb-xs">
                <EyeOff size={16} color={iconColors.primary} />
                <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('Private')}
                </Text>
              </View>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('OnlyYouCanSeeYourProfile')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <SettingsSection title={t('EventParticipationVisibility')} />
        <View className="px-xl py-sm">
          <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary mb-md">
            {t('ControlWhoSeesEventParticipation')}
          </Text>
          <View className="flex-row gap-sm">
            {[VisibilityLevel.PUBLIC, VisibilityLevel.FRIENDS_ONLY, VisibilityLevel.PRIVATE].map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => handleEventParticipationChange(option)}
                className="flex-1 p-md rounded-lg border"
                style={{
                  borderColor:
                    eventParticipationVisibility === option ? iconColors.primary : borderColor,
                  backgroundColor:
                    eventParticipationVisibility === option
                      ? colors.surfaceElevated
                      : 'transparent',
                }}
                disabled={isUpdating}
              >
                <Text className="text-sm font-semibold text-center text-txt-primary dark:text-txt-dark-primary">
                  {t(option === VisibilityLevel.PUBLIC ? 'Public' : option === VisibilityLevel.PRIVATE ? 'Private' : 'FriendsOnly')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SettingsSection title={t('SearchAndDiscovery')} />
        <SettingsRow
          icon={Search}
          title={t('SearchVisibility')}
          subtitle={t('AllowOthersToFindYouInSearch')}
          end={
            <CustomSwitch
              value={searchVisibility}
              onValueChange={handleSearchVisibilityChange}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Lock}
          title={t('ShowInEventDirectory')}
          subtitle={t('ShowInEventDirectoryDescription')}
          end={
            <CustomSwitch
              value={showInEventDirectory}
              onValueChange={handleShowInDirectoryChange}
              disabled={isUpdating}
            />
          }
        />
        </View>
      </ScrollView>
    </View>
  );
}
