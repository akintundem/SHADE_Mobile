import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import {
  Bell,
  Download,
  FileText,
  Globe,
  HardDrive,
  HelpCircle,
  Info,
  Key,
  Lock,
  LogOut,
  Mail,
  Moon,
  Shield,
  Trash2,
  User,
  X,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import CustomSwitch from '../../../common/components/ui/CustomSwitch';
import { User as AuthUser } from '../../../core/auth/types/auth';
import { SettingsHeader, SettingsSection, SettingsRow } from '../components';
import ChangePasswordScreen from './ChangePasswordScreen';

type Props = {
  user: AuthUser;
  onClose?: () => void;
  onLogout?: () => void;
};

type BannerState = {
  text: string;
  tone: 'success' | 'error';
};

export default function SettingsScreen({
  user,
  onClose,
  onLogout,
}: Props) {
  const { isDark, setDark, colors, spacing, typography } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [isPrivate, setIsPrivate] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  if (showChangePassword) {
    return (
      <ChangePasswordScreen
        onBack={() => setShowChangePassword(false)}
        onSuccess={() => {
          setBanner({
            text: t('PasswordChangedSuccessfully'),
            tone: 'success',
          });
        }}
      />
    );
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
          icon={User}
          title={t('EditProfile')}
          subtitle={t('UpdateYourProfileInformation')}
        />
        <SettingsRow
          icon={Key}
          title={t('ChangePassword')}
          subtitle={t('UpdateYourPasswordSecurely')}
          onPress={() => {
            setBanner(null);
            setShowChangePassword(true);
          }}
        />
        <SettingsRow
          icon={Mail}
          title={t('ResendVerificationEmail')}
          subtitle={`${t('SendTo')} ${user.email ?? t('YourEmail')}`}
          end={
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
              }}
            >
              {isResendingVerification ? t('Sending') : t('Send')}
            </Text>
          }
        />
        <SettingsRow
          icon={Lock}
          title={t('PrivacyAndSafety')}
          subtitle={t('ControlWhoCanSeeYourContent')}
        />
        <SettingsRow
          icon={Bell}
          title={t('Notifications')}
          subtitle={t('ManageYourNotificationPreferences')}
        />
        <SettingsRow
          icon={Shield}
          title={t('Security')}
          subtitle={t('TwoFactorAuthenticationAndMore')}
          end={
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>
              {t('SetupRecommended')}
            </Text>
          }
        />

        <SettingsSection title={t('QuickSettings')} />
        <SettingsRow
          icon={Lock}
          title={t('PrivateAccount')}
          subtitle={t('OnlyFollowersCanSeeYourPosts')}
          end={<CustomSwitch value={isPrivate} onValueChange={setIsPrivate} />}
        />
        <SettingsRow
          icon={Bell}
          title={t('PushNotifications')}
          subtitle={t('GetNotifiedAboutActivity')}
          end={<CustomSwitch value={pushEnabled} onValueChange={setPushEnabled} />}
        />
        <SettingsRow
          icon={Moon}
          title={t('Theme')}
          subtitle={isDark ? t('Dark') : t('Light')}
          end={<CustomSwitch value={isDark} onValueChange={setDark} />}
        />

        <SettingsSection title={t('AppPreferences')} />
        <SettingsRow
          icon={Globe}
          title={t('Language')}
          subtitle={lang === 'en' ? t('English') : t('French')}
          end={
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <TouchableOpacity
                onPress={() => setLang('en')}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs / 2,
                  borderRadius: 6,
                  backgroundColor:
                    lang === 'en'
                      ? colors.text.primary
                      : colors.surfaceElevated,
                }}
              >
                <Text
                  style={{
                    color:
                      lang === 'en' ? colors.text.inverse : colors.text.primary,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLang('fr')}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs / 2,
                  borderRadius: 6,
                  backgroundColor:
                    lang === 'fr'
                      ? colors.text.primary
                      : colors.surfaceElevated,
                }}
              >
                <Text
                  style={{
                    color:
                      lang === 'fr' ? colors.text.inverse : colors.text.primary,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  FR
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
        <SettingsRow
          icon={HardDrive}
          title={t('DataAndStorage')}
          subtitle={t('ManageDownloadsAndStorage')}
        />
        <SettingsRow
          icon={SettingsIcon}
          title={t('Accessibility')}
          subtitle={t('FeaturesToImproveYourExperience')}
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
        <SettingsRow
          icon={FileText}
          title={t('ReportAProblem')}
          subtitle={t('LetUsKnowAboutAnyIssues')}
        />

        <SettingsSection title={t('AccountManagement')} />
        <SettingsRow
          icon={LogOut}
          title={t('LogOut')}
          subtitle={t('SignOutOfYourAccount')}
          onPress={onLogout}
          danger
        />

        <SettingsSection title={t('DangerZone')} />
        <SettingsRow
          icon={Download}
          title={t('DownloadYourData')}
          subtitle={t('RequestACopyOfYourInformation')}
        />
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

        <View
          style={{
            alignItems: 'flex-start',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.xs,
            gap: spacing.xs / 2,
          }}
        >
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.medium }}>Capsule v1.0.0</Text>
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
            Terms • Privacy • Cookies
          </Text>
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginTop: spacing.xs / 2 }}>
            © {new Date().getFullYear()} Capsule. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

