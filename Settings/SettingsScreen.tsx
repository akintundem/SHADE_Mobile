import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  Moon,
  Sun,
  Mail,
  MailCheck,
  LogOut,
  User,
  Accessibility,
  Bell,
  Download,
  FlagTriangleRight,
  Globe,
  HardDrive,
  HelpCircle,
  Info,
  KeyRound,
  Palette,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import { authService } from '../services/authService';
import { User as UserType } from '../types';
import ChangePasswordScreen from './ChangePasswordScreen';
import EmailVerificationScreen from '../Auth/screens/EmailVerificationScreen';

type Props = {
  onClose: () => void;
  user?: UserType;
  onLogout?: () => void;
};

type BannerState = {
  text: string;
  tone: 'success' | 'error';
};

export default function SettingsScreen({ onClose, user, onLogout }: Props) {
  const { isDark, setDark, colors, typography, spacing, borderRadius } =
    useTheme();
  const { lang, setLang, t } = useI18n();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Settings states
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // For now, assume email is verified - this can be enhanced later with actual verification status
  const isEmailVerified = true;

  const headerSubtitle = useMemo(() => {
    if (!user?.email) return '@capsule-user';
    const prefix = user.email.split('@')[0];
    return `@${prefix}`;
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Temporarily skip API call and just clear local storage
      const { clearToken, clearUser } = await import('../storage/authStorage');
      await Promise.all([clearToken(), clearUser()]);
      console.log('✅ Cleared token and user from storage');
      onLogout?.();
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      setBanner({
        text: 'Email address is required to resend verification',
        tone: 'error',
      });
      return;
    }

    try {
      setIsResendingVerification(true);
      const response = await authService.resendEmailVerification(user.email);
      setBanner({
        text:
          response.message || 'Verification email sent if the account exists',
        tone: response.success ? 'success' : 'error',
      });
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Unable to send verification email';
      setBanner({ text: message, tone: 'error' });
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Helper components
  const Section = ({ title }: { title: string }) => (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
      }}
    >
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.size.xs,
          fontWeight: typography.weight.semibold,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
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
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      activeOpacity={onPress ? 0.65 : 1}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: danger
            ? colors.semantic.error + '20'
            : colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.md,
        }}
      >
        <Icon
          size={16}
          color={danger ? colors.semantic.error : colors.text.secondary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: danger ? colors.semantic.error : colors.text.primary,
            fontWeight: typography.weight.medium,
            fontSize: typography.size.base,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: colors.text.tertiary,
              marginTop: 2,
              fontSize: typography.size.sm,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {end ?? (
        <ChevronRight size={20} color={colors.text.tertiary} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top']}
      >
        <ScrollView style={{ flex: 1 }}>
          {/* Enhanced Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: spacing.xs,
                borderRadius: borderRadius.full,
                backgroundColor: colors.surface,
              }}
            >
              <ArrowLeft color={colors.text.primary} size={20} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.xl,
                fontWeight: typography.weight.bold,
              }}
            >
              Settings
            </Text>
            <View style={{ width: 32 }} />
          </View>

          {/* User Info Section */}
          {user && (
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
                backgroundColor: colors.surface,
                marginHorizontal: spacing.lg,
                marginTop: spacing.lg,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.brand.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.semibold,
                    }}
                  >
                    {user.name || 'User'}
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.sm,
                      marginTop: 2,
                    }}
                  >
                    {user.email}
                  </Text>
                </View>
                {isEmailVerified && (
                  <MailCheck size={16} color={colors.semantic.success} />
                )}
              </View>
            </View>
          )}

          {/* Banner for notifications */}
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

          {/* Account Section - Logout moved to top */}
          <Section title="Account" />
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: spacing.lg,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
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
                setShowChangePassword(true);
              }}
            />
            <Row
              icon={MailCheck}
              title="Resend Verification Email"
              subtitle={`Send to ${user?.email ?? 'your email'}`}
              onPress={
                isResendingVerification ? undefined : handleResendVerification
              }
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
            <TouchableOpacity
              onPress={handleLogout}
              disabled={loggingOut}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.lg,
                gap: spacing.md,
                opacity: loggingOut ? 0.5 : 1,
                backgroundColor: loggingOut ? colors.surface : 'transparent',
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.semantic.error + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={16} color={colors.semantic.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.semantic.error,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  {loggingOut ? 'Logging out...' : 'Log Out'}
                </Text>
                <Text
                  style={{
                    color: colors.text.tertiary,
                    fontSize: typography.size.xs,
                    marginTop: 2,
                  }}
                >
                  Sign out of your account
                </Text>
              </View>
              {!loggingOut && (
                <ChevronRight size={20} color={colors.text.tertiary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Settings Section */}
          <Section title="Quick Settings" />
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: spacing.lg,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
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
              end={
                <Switch value={pushEnabled} onValueChange={setPushEnabled} />
              }
            />
            <Row
              icon={Palette}
              title="Theme"
              subtitle={isDark ? 'Dark' : 'Light'}
              end={<Switch value={isDark} onValueChange={setDark} />}
            />
          </View>

          {/* App Preferences Section */}
          <Section title="App Preferences" />
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: spacing.lg,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
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
                          lang === 'en'
                            ? colors.text.inverse
                            : colors.text.primary,
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
                          lang === 'fr'
                            ? colors.text.inverse
                            : colors.text.primary,
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
          </View>

          {/* Support & About Section */}
          <Section title="Support & About" />
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: spacing.lg,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
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
          </View>

          {/* Danger Zone Section */}
          <Section title="Danger Zone" />
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: spacing.lg,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
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
          </View>

          {/* Footer */}
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
      </SafeAreaView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <ChangePasswordScreen
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => setShowChangePassword(false)}
        />
      </Modal>

      {/* Email Verification Modal */}
      <Modal
        visible={showEmailVerification}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEmailVerification(false)}
      >
        <EmailVerificationScreen
          initialEmail={user?.email}
          onSuccess={() => {
            setShowEmailVerification(false);
            // Email verification status will be updated on next app restart or API call
          }}
          onCancel={() => setShowEmailVerification(false)}
        />
      </Modal>
    </>
  );
}
