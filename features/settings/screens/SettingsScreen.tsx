import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { X, ChevronRight, Lock, Moon, Sun, Mail, MailCheck, LogOut } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../features/auth/services/authService';
import { useCurrentUser } from '../../../common/hooks/useCurrentUser';
import ChangePasswordScreen from './ChangePasswordScreen';
import EmailVerificationScreen from '../../auth/screens/EmailVerificationScreen';

export default function SettingsScreen({ onClose, onLogout }: { onClose: () => void; onLogout?: () => void }) {
  const { isDark, setDark, colors, typography, spacing, borderRadius } = useTheme();
  const { user, loading: userLoading, isEmailVerified, refetch } = useCurrentUser();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Wait for successful logout response from backend
      await authService.logout();
      // Only navigate to login screen after successful logout
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Don't navigate if logout fails
      setLoggingOut(false);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <X color={colors.text.primary} size={24} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.bold,
              }}
            >
              Settings
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Appearance Section */}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                textTransform: 'uppercase',
                marginBottom: spacing.md,
                letterSpacing: 0.5,
              }}
            >
              Appearance
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                {isDark ? (
                  <Moon size={20} color={colors.text.tertiary} />
                ) : (
                  <Sun size={20} color={colors.text.tertiary} />
                )}
                <Text
                  style={{
                    flex: 1,
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  Theme
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => setDark(false)}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.full,
                      backgroundColor: !isDark ? colors.brand.primary : colors.surfaceElevated,
                    }}
                  >
                    <Text
                      style={{
                        color: !isDark ? '#FFFFFF' : colors.text.primary,
                        fontWeight: typography.weight.semibold,
                        fontSize: typography.size.sm,
                      }}
                    >
                      Light
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDark(true)}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.full,
                      backgroundColor: isDark ? colors.brand.primary : colors.surfaceElevated,
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? '#FFFFFF' : colors.text.primary,
                        fontWeight: typography.weight.semibold,
                        fontSize: typography.size.sm,
                      }}
                    >
                      Dark
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                textTransform: 'uppercase',
                marginBottom: spacing.md,
                letterSpacing: 0.5,
              }}
            >
              Security
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {/* Change Password */}
              <TouchableOpacity
                onPress={() => setShowChangePassword(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: spacing.md,
                  gap: spacing.md,
                  borderBottomWidth: !isEmailVerified ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <Lock size={20} color={colors.text.tertiary} />
                <Text
                  style={{
                    flex: 1,
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  Change Password
                </Text>
                <ChevronRight size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              {/* Email Verification - Only show if email is NOT verified */}
              {userLoading ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    gap: spacing.md,
                  }}
                >
                  <ActivityIndicator size="small" color={colors.text.tertiary} />
                  <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                    Loading...
                  </Text>
                </View>
              ) : !isEmailVerified && user ? (
                <TouchableOpacity
                  onPress={() => setShowEmailVerification(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    gap: spacing.md,
                  }}
                >
                  <Mail size={20} color={colors.semantic.warning} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.medium,
                      }}
                    >
                      Verify Email
                    </Text>
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2,
                      }}
                    >
                      Send to {user.email}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              ) : isEmailVerified ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    gap: spacing.md,
                  }}
                >
                  <MailCheck size={20} color={colors.semantic.success} />
                  <Text
                    style={{
                      flex: 1,
                      color: colors.semantic.success,
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.medium,
                    }}
                  >
                    Email Verified
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Account Section */}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing['2xl'] }}>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                textTransform: 'uppercase',
                marginBottom: spacing.md,
                letterSpacing: 0.5,
              }}
            >
              Account
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                onPress={handleLogout}
                disabled={loggingOut}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: spacing.md,
                  gap: spacing.md,
                  opacity: loggingOut ? 0.5 : 1,
                }}
              >
                <LogOut size={20} color={colors.semantic.error} />
                <Text
                  style={{
                    flex: 1,
                    color: colors.semantic.error,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  {loggingOut ? 'Logging out...' : 'Log Out'}
                </Text>
              </TouchableOpacity>
            </View>
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
            refetch(); // Refresh user data to update verified status
          }}
          onCancel={() => setShowEmailVerification(false)}
        />
      </Modal>
    </>
  );
}


