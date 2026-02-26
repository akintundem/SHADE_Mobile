import React, { useCallback, useMemo, useState } from 'react';
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
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { SettingsHeader, SettingsSection, SettingsRow } from '../../components';
import PrivacySettingsScreen from '../detail/PrivacySettingsScreen';
import NotificationSettingsScreen from '../detail/NotificationSettingsScreen';
import SecuritySettingsScreen from '../detail/SecuritySettingsScreen';
import DataSettingsScreen from '../detail/DataSettingsScreen';
import { ThemePreference } from '../../../../core/auth/types/auth';
import { SettingsProvider, useSettings } from '../../context';
import { useSettingsFlow } from '../../hooks';
import type { SettingsBanner } from '../../types';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import { authService } from '../../../../core/auth/services/authService';
import { clearAllAuth } from '../../../../common/storage/authStorage';

type Props = {
  onClose?: () => void;
  onLogout?: () => void;
};

function SettingsScreenContent({ onClose, onLogout }: Props) {
  const { t, lang, setLang } = useI18n();
  const { themePreference, setThemePreference, colors } = useTheme();
  const iconColors = { primary: colors.text.primary, secondary: colors.text.secondary };

  const { settings, updateProfileSettings, userId } = useSettings();
  const flow = useSettingsFlow();

  const [banner, setBanner] = useState<SettingsBanner | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleThemePreferenceChange = useCallback(
    async (pref: ThemePreference) => {
      // Apply immediately — local AsyncStorage is source of truth, so this
      // persists regardless of whether the backend sync succeeds.
      await setThemePreference(pref);
      // Best-effort sync to backend; never revert the local choice on failure.
      if (userId) {
        const ok = await updateProfileSettings({ themePreference: pref });
        if (!ok) {
          setBanner({ text: t('FailedToSyncTheme'), tone: 'error' });
        }
      }
    },
    [setThemePreference, t, updateProfileSettings, userId]
  );

  const handleLanguageChange = useCallback(
    async (value: string) => {
      if (!userId) return;
      const localValue = value.toLowerCase() as 'en' | 'fr';
      const previous = lang;
      setLang(localValue);
      const ok = await updateProfileSettings({ preferredLanguage: localValue });
      if (!ok) {
        setLang(previous as 'en' | 'fr');
        setBanner({ text: t('FailedToUpdateProfile'), tone: 'error' });
      }
    },
    [lang, setLang, t, updateProfileSettings, userId]
  );

  const themeOptions = useMemo(
    () => [
      { value: ThemePreference.LIGHT, label: t('Light') },
      { value: ThemePreference.DARK, label: t('Dark') },
      { value: ThemePreference.SYSTEM, label: t('System') },
    ],
    [t]
  );

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: t('English') },
      { value: 'fr', label: t('French') },
    ],
    [t]
  );

  const activePillBackground = colors.text.primary;
  const activePillText = colors.text.inverse;
  const inactivePillBackground = colors.surface;
  const inactiveBorder = colors.borderLight;

  const handleDeleteAccount = useCallback(async () => {
    if (!userId) return;

    setIsDeleting(true);
    try {
      await authService.deleteUser(userId);
      await clearAllAuth();
      setBanner({ text: t('DeleteAccountSuccess'), tone: 'success' });
      // Call logout after a brief delay to show success message
      setTimeout(() => {
        onLogout?.();
      }, 1500);
    } catch (error) {
      if (__DEV__) console.error('Failed to delete account:', error);
      setBanner({ text: t('DeleteAccountError'), tone: 'error' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [userId, t, onLogout]);

  if (flow.view === 'privacy') {
    return <PrivacySettingsScreen onBack={flow.goBack} />;
  }

  if (flow.view === 'notifications') {
    return <NotificationSettingsScreen onBack={flow.goBack} />;
  }

  if (flow.view === 'security') {
    return <SecuritySettingsScreen onBack={flow.goBack} />;
  }

  if (flow.view === 'data') {
    return <DataSettingsScreen onBack={flow.goBack} />;
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-2">
          <SettingsHeader onClose={onClose} />

        {banner ? (
          <View
            className="mx-lg mt-md rounded-lg border px-sm py-sm"
            style={{
              backgroundColor:
                banner.tone === 'success' ? colors.semantic.successLight : colors.semantic.errorLight,
              borderColor:
                banner.tone === 'success' ? colors.semantic.success : colors.semantic.error,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: banner.tone === 'success' ? colors.semantic.successDark : colors.semantic.errorDark,
              }}
            >
              {banner.text}
            </Text>
            <TouchableOpacity onPress={() => setBanner(null)} accessibilityRole="button">
              <Text
                className="text-xs font-medium underline mt-xs"
                style={{
                  color: banner.tone === 'success' ? colors.semantic.successDark : colors.semantic.errorDark,
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
          onPress={() => flow.goTo('privacy')}
        />
        <SettingsRow
          icon={Bell}
          title={t('Notifications')}
          subtitle={t('ManageYourNotificationPreferences')}
          onPress={() => flow.goTo('notifications')}
        />
        <SettingsRow
          icon={Shield}
          title={t('Security')}
          subtitle={t('TwoFactorAuthenticationAndMore')}
          onPress={() => flow.goTo('security')}
          end={
            settings?.mfaEnabled ? (
              <Text className="text-xs text-semantic-success">{t('Enabled')}</Text>
            ) : (
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('SetupRecommended')}
              </Text>
            )
          }
        />

        <SettingsSection title={t('QuickSettings')} />
        <View className="px-xl py-md">
          <View className="flex-row items-center gap-md mb-sm">
            <View className="w-7 h-7 rounded-md bg-light-surface dark:bg-dark-surface items-center justify-center">
              <Moon size={16} color={iconColors.primary} strokeWidth={1.5} />
            </View>
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary tracking-[-0.1px]">
              {t('Theme')}
            </Text>
          </View>
          <View className="flex-row gap-xs ml-9">
            {themeOptions.map((option) => {
              const isActive = themePreference === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleThemePreferenceChange(option.value)}
                  className="px-md py-xs rounded-md border"
                  style={{
                    backgroundColor: isActive ? activePillBackground : inactivePillBackground,
                    borderColor: isActive ? activePillBackground : inactiveBorder,
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color: isActive ? activePillText : iconColors.secondary,
                      fontWeight: isActive ? '600' : '500',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="px-xl py-md">
          <View className="flex-row items-center gap-md mb-sm">
            <View className="w-7 h-7 rounded-md bg-light-surface dark:bg-dark-surface items-center justify-center">
              <Globe size={16} color={iconColors.primary} strokeWidth={1.5} />
            </View>
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary tracking-[-0.1px]">
              {t('Language')}
            </Text>
          </View>
          <View className="flex-row gap-xs ml-9">
            {languageOptions.map((option) => {
              const isActive = lang === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleLanguageChange(option.value)}
                  className="px-md py-xs rounded-md border"
                  style={{
                    backgroundColor: isActive ? activePillBackground : inactivePillBackground,
                    borderColor: isActive ? activePillBackground : inactiveBorder,
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color: isActive ? activePillText : iconColors.secondary,
                      fontWeight: isActive ? '600' : '500',
                    }}
                  >
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
          onPress={() => flow.goTo('data')}
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
          onPress={() => setShowDeleteConfirm(true)}
        />
        <SettingsRow
          icon={LogOut}
          title={t('LogOut')}
          subtitle={t('SignOutOfYourAccount')}
          onPress={onLogout}
          danger
        />

        <View className="items-center px-xl pt-md pb-xs">
          <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
            {t('AppNameWithVersion', { app: 'Shade', version: '1.0.0' })}
          </Text>
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
            {t('LegalLinks', { defaultValue: 'Terms • Privacy • Cookies' })}
          </Text>
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
            {t('AllRightsReserved', { year: new Date().getFullYear(), app: 'Shade' })}
          </Text>
        </View>
        </View>
      </ScrollView>
      <ConfirmModal
        visible={showDeleteConfirm}
        title={t('DeleteAccountConfirmTitle')}
        message={t('DeleteAccountConfirmMessage')}
        confirmLabel={t('DeleteAccountConfirmButton')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

export default function SettingsScreen({ onClose, onLogout }: Props) {
  return (
    <SettingsProvider>
      <SettingsScreenContent onClose={onClose} onLogout={onLogout} />
    </SettingsProvider>
  );
}
