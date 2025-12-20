import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import {
  Bell,
  Globe,
  HardDrive,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Moon,
  Shield,
  Trash2,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { SettingsHeader, SettingsSection, SettingsRow } from '../components';
import ChangePasswordScreen from '../detail/ChangePasswordScreen';
import PrivacySettingsScreen from '../detail/PrivacySettingsScreen';
import NotificationSettingsScreen from '../detail/NotificationSettingsScreen';
import SecuritySettingsScreen from '../detail/SecuritySettingsScreen';
import DataSettingsScreen from '../detail/DataSettingsScreen';
import { useCurrentUser } from '../../../common/hooks/useCurrentUser';
import { authService } from '../../../core/auth/services/authService';
import { ThemePreference } from '../../../core/auth/types/auth';

type Props = {
  onClose?: () => void;
  onLogout?: () => void;
};

type BannerState = {
  text: string;
  tone: 'success' | 'error';
};

type ActiveScreen = 
  | 'main' 
  | 'changePassword' 
  | 'privacy' 
  | 'notifications' 
  | 'security' 
  | 'data';

export default function SettingsScreen({
  onClose,
  onLogout,
}: Props) {
  const { themePreference, setThemePreference, colors, spacing, typography, borderRadius } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { user, refetch } = useCurrentUser();
  
  const settings = user?.settings;

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('main');
  const [banner, setBanner] = useState<BannerState | null>(null);

  // Sync theme preference from user settings on load (only if different)
  useEffect(() => {
    if (settings?.themePreference && settings.themePreference !== themePreference) {
      setThemePreference(settings.themePreference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.themePreference]);

  // Handle theme preference change
  const handleThemePreferenceChange = async (pref: ThemePreference) => {
    if (!user) return;
    // Update local state immediately for instant feedback
    setThemePreference(pref);
    try {
      await authService.updateUserProfile(user.id, {
        name: user.name,
        settings: { themePreference: pref },
      });
      // Refetch to sync with backend
      await refetch();
    } catch (error) {
      // Revert on error
      if (settings?.themePreference) {
        setThemePreference(settings.themePreference);
      } else {
        setThemePreference(ThemePreference.SYSTEM);
      }
    }
  };

  // Handle language change
  const handleLanguageChange = async (value: string) => {
    if (!user) return;
    // Immediately update the app language for instant feedback
    setLang(value as 'en' | 'fr');
    try {
      await authService.updateUserProfile(user.id, {
        name: user.name,
        settings: { preferredLanguage: value },
      });
      // Refetch to sync with backend
      await refetch();
    } catch (error) {
      // Revert on error
      const previousLang = settings?.preferredLanguage || 'en';
      setLang(previousLang as 'en' | 'fr');
    }
  };

  if (activeScreen === 'changePassword') {
    return (
      <ChangePasswordScreen
        onBack={() => setActiveScreen('main')}
        onSuccess={() => {
          setBanner({
            text: t('PasswordChangedSuccessfully'),
            tone: 'success',
          });
          setActiveScreen('main');
        }}
      />
    );
  }

  if (activeScreen === 'privacy') {
    return <PrivacySettingsScreen onBack={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'notifications') {
    return <NotificationSettingsScreen onBack={() => setActiveScreen('main')} />;
  }


  if (activeScreen === 'security') {
    return (
      <SecuritySettingsScreen
        onBack={() => setActiveScreen('main')}
        onChangePassword={() => setActiveScreen('changePassword')}
      />
    );
  }

  if (activeScreen === 'data') {
    return <DataSettingsScreen onBack={() => setActiveScreen('main')} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xs }}
      >
        <SettingsHeader onClose={onClose} />

        {banner ? (
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginTop: spacing.md,
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor:
                banner.tone === 'success'
                  ? colors.semantic.successLight
                  : colors.semantic.errorLight,
              borderWidth: 0.5,
              borderColor:
                banner.tone === 'success'
                  ? colors.semantic.success
                  : colors.semantic.error,
              gap: spacing.xs,
            }}
          >
            <Text
              style={{
                color:
                  banner.tone === 'success'
                    ? colors.semantic.successDark
                    : colors.semantic.errorDark,
                fontWeight: typography.weight.semibold,
                fontSize: typography.size.xs,
              }}
            >
              {banner.text}
            </Text>
            <TouchableOpacity
              onPress={() => setBanner(null)}
              accessibilityRole="button"
            >
              <Text
                style={{
                  color:
                    banner.tone === 'success'
                      ? colors.semantic.successDark
                      : colors.semantic.errorDark,
                  fontWeight: typography.weight.medium,
                  fontSize: typography.size.xs,
                  textDecorationLine: 'underline',
                }}
              >
                {t('Dismiss')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <SettingsSection title={t('Account')} />
        <SettingsRow
          icon={Lock}
          title={t('PrivacyAndSafety')}
          subtitle={t('ControlWhoCanSeeYourContent')}
          onPress={() => setActiveScreen('privacy')}
        />
        <SettingsRow
          icon={Bell}
          title={t('Notifications')}
          subtitle={t('ManageYourNotificationPreferences')}
          onPress={() => setActiveScreen('notifications')}
        />
        <SettingsRow
          icon={Shield}
          title={t('Security')}
          subtitle={t('TwoFactorAuthenticationAndMore')}
          onPress={() => setActiveScreen('security')}
          end={
            settings?.mfaEnabled ? (
              <Text style={{ color: colors.semantic.success, fontSize: typography.size.xs }}>
                {t('Enabled')}
              </Text>
            ) : (
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>
                {t('SetupRecommended')}
              </Text>
            )
          }
        />

        <SettingsSection title={t('QuickSettings')} />
        <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 0.5, borderColor: colors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
            <View style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Moon size={16} color={colors.text.primary} strokeWidth={1.5} />
            </View>
            <Text style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.sm,
              letterSpacing: -0.1,
            }}>
              {t('Theme')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginLeft: 36 }}>
            {[
              { value: ThemePreference.LIGHT, label: t('Light') },
              { value: ThemePreference.DARK, label: t('Dark') },
              { value: ThemePreference.SYSTEM, label: t('System') },
            ].map((option) => {
              const isActive = themePreference === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleThemePreferenceChange(option.value)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                    backgroundColor: isActive ? colors.text.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? colors.text.primary : colors.divider,
                  }}
                >
                  <Text style={{
                    color: isActive ? colors.text.inverse : colors.text.secondary,
                    fontSize: typography.size.xs,
                    fontWeight: isActive ? typography.weight.semibold : typography.weight.medium,
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 0.5, borderColor: colors.divider }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
            <View style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Globe size={16} color={colors.text.primary} strokeWidth={1.5} />
            </View>
            <Text style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.sm,
              letterSpacing: -0.1,
            }}>
              {t('Language')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginLeft: 36 }}>
            {[
              { value: 'en', label: t('English') },
              { value: 'fr', label: t('French') },
            ].map((option) => {
              const isActive = lang === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleLanguageChange(option.value)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                    backgroundColor: isActive ? colors.text.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? colors.text.primary : colors.divider,
                  }}
                >
                  <Text style={{
                    color: isActive ? colors.text.inverse : colors.text.secondary,
                    fontSize: typography.size.xs,
                    fontWeight: isActive ? typography.weight.semibold : typography.weight.medium,
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <SettingsSection title={t('DataAndStorage')} />
        <SettingsRow
          icon={HardDrive}
          title={t('DataAndStorage')}
          subtitle={t('ManageDownloadsAndStorage')}
          onPress={() => setActiveScreen('data')}
        />

        <SettingsSection title={t('SupportAbout')} />
        <SettingsRow
          icon={HelpCircle}
          title={t('HelpCenter')}
          subtitle={t('GetSupportAndFindAnswers')}
        />
        <SettingsRow
          icon={Info}
          title={t('About')}
          subtitle={t('AppVersionAndLegalInformation')}
        />

        <SettingsSection title={t('AccountManagement')} />
        <SettingsRow
          icon={X}
          title={t('DeactivateAccount')}
          subtitle={t('TemporarilyDisableYourAccount')}
        />
        <SettingsRow
          icon={Trash2}
          title={t('DeleteAccount')}
          subtitle={t('PermanentlyDeleteYourAccountAndData')}
          danger
        />
        <SettingsRow
          icon={LogOut}
          title={t('LogOut')}
          subtitle={t('SignOutOfYourAccount')}
          onPress={onLogout}
          danger
        />

        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.xs,
            gap: spacing.xs / 2,
          }}
        >
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.medium }}>Shade v1.0.0</Text>
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
            Terms • Privacy • Cookies
          </Text>
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginTop: spacing.xs / 2 }}>
            © {new Date().getFullYear()} Shade. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

