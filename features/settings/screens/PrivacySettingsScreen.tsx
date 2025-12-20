import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Lock, Eye, EyeOff, Search } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../components';
import CustomSwitch from '../../../common/components/ui/CustomSwitch';
import { useCurrentUser } from '../../../common/hooks/useCurrentUser';
import { authService } from '../../../core/auth/services/authService';
import { VisibilityLevel } from '../../../core/auth/types/auth';

type Props = {
  onBack?: () => void;
};

export default function PrivacySettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors, spacing, typography } = useTheme();
  const { user, refetch } = useCurrentUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const settings = user?.settings;

  const [profileVisibility, setProfileVisibility] = useState<VisibilityLevel>(
    settings?.profileVisibility || VisibilityLevel.PUBLIC
  );
  const [searchVisibility, setSearchVisibility] = useState<boolean>(
    settings?.searchVisibility ?? true
  );

  useEffect(() => {
    if (settings) {
      setProfileVisibility(settings.profileVisibility || VisibilityLevel.PUBLIC);
      setSearchVisibility(settings.searchVisibility ?? true);
    }
  }, [settings]);

  const handleProfileVisibilityChange = async (value: VisibilityLevel) => {
    if (!user) return;
    setProfileVisibility(value);
    setIsUpdating(true);
    try {
      await authService.updateUserProfile(user.id, {
        name: user.name,
        settings: { profileVisibility: value },
      });
      await refetch();
    } catch (error) {
      // Revert on error
      setProfileVisibility(settings?.profileVisibility || VisibilityLevel.PUBLIC);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearchVisibilityChange = async (value: boolean) => {
    if (!user) return;
    setSearchVisibility(value);
    setIsUpdating(true);
    try {
      await authService.updateUserProfile(user.id, {
        name: user.name,
        settings: { searchVisibility: value },
      });
      await refetch();
    } catch (error) {
      // Revert on error
      setSearchVisibility(settings?.searchVisibility ?? true);
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderBottomWidth: 0.5,
          borderColor: colors.divider,
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.xs }}>
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.base,
          }}
        >
          {t('PrivacyAndSafety')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SettingsSection title={t('ProfileVisibility')} />
        <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, marginBottom: spacing.md }}>
            {t('ControlWhoCanSeeYourProfile')}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={() => handleProfileVisibilityChange(VisibilityLevel.PUBLIC)}
              style={{
                flex: 1,
                padding: spacing.md,
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  profileVisibility === VisibilityLevel.PUBLIC
                    ? colors.text.primary
                    : colors.divider,
                backgroundColor:
                  profileVisibility === VisibilityLevel.PUBLIC
                    ? colors.surfaceElevated
                    : colors.background,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                <Eye size={16} color={colors.text.primary} />
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: typography.weight.semibold,
                    fontSize: typography.size.sm,
                  }}
                >
                  {t('Public')}
                </Text>
              </View>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
                {t('AnyoneCanSeeYourProfile')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleProfileVisibilityChange(VisibilityLevel.PRIVATE)}
              style={{
                flex: 1,
                padding: spacing.md,
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  profileVisibility === VisibilityLevel.PRIVATE
                    ? colors.text.primary
                    : colors.divider,
                backgroundColor:
                  profileVisibility === VisibilityLevel.PRIVATE
                    ? colors.surfaceElevated
                    : colors.background,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                <EyeOff size={16} color={colors.text.primary} />
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: typography.weight.semibold,
                    fontSize: typography.size.sm,
                  }}
                >
                  {t('Private')}
                </Text>
              </View>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
                {t('OnlyYouCanSeeYourProfile')}
              </Text>
            </TouchableOpacity>
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

      </ScrollView>
    </SafeAreaView>
  );
}

