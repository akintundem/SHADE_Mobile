import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Accessibility,
  Bell,
  ChevronRight,
  Download,
  FlagTriangleRight,
  Globe,
  HardDrive,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
  LogOut,
  MailCheck,
  Palette,
  Shield,
  Trash2,
  User,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../shared/i18n/I18nProvider';
import Button from '../../../shared/components/ui/Button';
import KeyboardOptimizedInput from '../../../shared/components/ui/KeyboardOptimizedInput';
import { authService } from '../../../shared/services/authService';
import { User as AuthUser } from '../../../shared/types';

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
  onClose: _onClose,
  onLogout,
}: Props) {
  const { isDark, setDark, colors, spacing, borderRadius, typography } =
    useTheme();
  const { lang, setLang, t } = useI18n();

  const [isPrivate, setIsPrivate] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [banner, setBanner] = useState<BannerState | null>(null);

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSubmitting, setChangeSubmitting] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const Section = ({ title }: { title: string }) => (
    <View
      style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
    >
      <Text
        style={{
          color: colors.text.tertiary,
          fontWeight: typography.weight.semibold,
        }}
      >
        {title}
      </Text>
    </View>
  );

  const Row = ({
    icon: Icon,
    title,
    subtitle,
    end,
    onPress,
    danger,
  }: {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    title: string;
    subtitle?: string;
    end?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      activeOpacity={onPress ? 0.65 : 1}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          flex: 1,
        }}
      >
        <Icon
          size={18}
          color={danger ? colors.semantic.error : colors.text.primary}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: danger ? colors.semantic.error : colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.sm,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                color: colors.text.tertiary,
                marginTop: 2,
                fontSize: typography.size.xs,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {end ?? <ChevronRight size={16} color={colors.text.tertiary} />}
    </TouchableOpacity>
  );

  const closeChangePasswordModal = () => {
    setChangePasswordVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangeError(null);
  };

  const handleChangePassword = async () => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent) {
      setChangeError('Current password is required');
      return;
    }

    if (!trimmedNew) {
      setChangeError('New password is required');
      return;
    }

    if (trimmedNew.length < 8) {
      setChangeError('New password must be at least 8 characters long');
      return;
    }

    if (
      !/[A-Z]/.test(trimmedNew) ||
      !/[a-z]/.test(trimmedNew) ||
      !/[0-9]/.test(trimmedNew) ||
      !/[!@#$%^&*()_\-+=\[{\]};:'"\\|,.<>/?]/.test(trimmedNew)
    ) {
      setChangeError(
        'Password must include uppercase, lowercase, number, and special character',
      );
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setChangeError('New password and confirmation must match');
      return;
    }

    try {
      setChangeSubmitting(true);
      setChangeError(null);

      const response = await authService.changePassword(
        trimmedCurrent,
        trimmedNew,
        trimmedConfirm
      );

      setBanner({
        text: response.message || 'Password changed successfully',
        tone: response.success ? 'success' : 'error',
      });

      if (response.success) {
        closeChangePasswordModal();
      }
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Unable to change password';
      setChangeError(message);
    } finally {
      setChangeSubmitting(false);
    }
  };

  const headerSubtitle = useMemo(() => {
    if (!user?.email) return '@capsule-user';
    const prefix = user.email.split('@')[0];
    return `@${prefix}`;
  }, [user?.email]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.surfaceElevated,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
            }}
          >
            {t('Settings')}
          </Text>
          <Text style={{ color: colors.text.tertiary, marginTop: 4 }}>
            {headerSubtitle}
          </Text>
        </View>

        {banner ? (
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginTop: spacing.lg,
              padding: spacing.md,
              borderRadius: borderRadius.lg,
              backgroundColor:
                banner.tone === 'success'
                  ? colors.semantic.successLight
                  : colors.semantic.errorLight,
              borderWidth: 1,
              borderColor:
                banner.tone === 'success'
                  ? colors.semantic.success
                  : colors.semantic.error,
              gap: spacing.sm,
            }}
          >
            <Text
              style={{
                color:
                  banner.tone === 'success'
                    ? colors.semantic.successDark
                    : colors.semantic.errorDark,
                fontWeight: typography.weight.semibold,
                fontSize: typography.size.sm,
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
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Section title="Account" />
        <Row
          icon={User}
          title="Edit Profile"
          subtitle="Update your profile information"
        />
        <Row
          icon={KeyRound}
          title="Change Password"
          subtitle="Update your password securely"
          onPress={() => {
            setBanner(null);
            setChangePasswordVisible(true);
          }}
        />
        <Row
          icon={MailCheck}
          title="Resend Verification Email"
          subtitle={`Send to ${user.email ?? 'your email'}`}
          end={
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
              }}
            >
              {isResendingVerification ? 'Sending…' : 'Send'}
            </Text>
          }
        />
        <Row
          icon={Lock}
          title="Privacy and Safety"
          subtitle="Control who can see your content"
        />
        <Row
          icon={Bell}
          title="Notifications"
          subtitle="Manage your notification preferences"
        />
        <Row
          icon={Shield}
          title="Security"
          subtitle="Two-factor authentication and more"
          end={
            <Text style={{ color: colors.text.secondary }}>
              Setup recommended
            </Text>
          }
        />

        <Section title="Quick Settings" />
        <Row
          icon={Lock}
          title="Private Account"
          subtitle="Only followers can see your posts"
          end={<Switch value={isPrivate} onValueChange={setIsPrivate} />}
        />
        <Row
          icon={Bell}
          title="Push Notifications"
          subtitle="Get notified about activity"
          end={<Switch value={pushEnabled} onValueChange={setPushEnabled} />}
        />
        <Row
          icon={Palette}
          title="Theme"
          subtitle={isDark ? 'Dark' : 'Light'}
          end={<Switch value={isDark} onValueChange={setDark} />}
        />

        <Section title="App Preferences" />
        <Row
          icon={Globe}
          title={t('Language')}
          subtitle={lang === 'en' ? t('English') : t('French')}
          end={
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => setLang('en')}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.md,
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
                  }}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLang('fr')}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.md,
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
                  }}
                >
                  FR
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
        <Row
          icon={HardDrive}
          title="Data and Storage"
          subtitle="Manage downloads and storage"
        />
        <Row
          icon={Accessibility}
          title="Accessibility"
          subtitle="Features to improve your experience"
        />

        <Section title="Support & About" />
        <Row
          icon={HelpCircle}
          title="Help Center"
          subtitle="Get support and find answers"
        />
        <Row
          icon={Info}
          title="About"
          subtitle="App version and legal information"
        />
        <Row
          icon={FlagTriangleRight}
          title="Report a Problem"
          subtitle="Let us know about any issues"
        />

        <Section title="Account Management" />
        <Row
          icon={LogOut}
          title="Log Out"
          subtitle="Sign out of your account"
          onPress={onLogout}
          danger
        />

        <Section title="Danger Zone" />
        <Row
          icon={Download}
          title="Download Your Data"
          subtitle="Request a copy of your information"
        />
        <Row
          icon={XCircle}
          title="Deactivate Account"
          subtitle="Temporarily disable your account"
        />
        <Row
          icon={Trash2}
          title="Delete Account"
          subtitle="Permanently delete your account and data"
          danger
        />

        <View
          style={{
            alignItems: 'center',
            paddingVertical: spacing['3xl'],
            gap: spacing.xs,
          }}
        >
          <Text style={{ color: colors.text.tertiary }}>Capsule v1.0.0</Text>
          <Text style={{ color: colors.text.tertiary }}>
            Terms Privacy Cookies
          </Text>
          <Text style={{ color: colors.text.tertiary }}>
            © {new Date().getFullYear()} Capsule. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={changePasswordVisible}
        animationType="fade"
        transparent
        onRequestClose={closeChangePasswordModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            padding: spacing['2xl'],
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View
              style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: borderRadius['2xl'],
                padding: spacing['2xl'],
                gap: spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  color: colors.text.primary,
                }}
              >
                Change password
              </Text>
              <KeyboardOptimizedInput
                label="Current password"
                value={currentPassword}
                onChangeText={text => {
                  setCurrentPassword(text);
                  setChangeError(null);
                }}
                inputType="password"
                enableNativeAutocomplete
              />
              <KeyboardOptimizedInput
                label="New password"
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  setChangeError(null);
                }}
                inputType="password"
                enableNativeAutocomplete
              />
              <KeyboardOptimizedInput
                label="Confirm new password"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  setChangeError(null);
                }}
                inputType="password"
                enableNativeAutocomplete
              />
              {changeError ? (
                <Text
                  style={{
                    color: colors.semantic.error,
                    fontSize: typography.size.sm,
                  }}
                >
                  {changeError}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: spacing.md,
                }}
              >
                <Button
                  variant="ghost"
                  onPress={closeChangePasswordModal}
                  disabled={changeSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleChangePassword}
                  loading={changeSubmitting}
                  disabled={changeSubmitting}
                >
                  Update Password
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
