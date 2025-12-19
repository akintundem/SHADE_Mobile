import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { User } from '../../../core/auth/types/auth';
import KeyboardAwareContainer from '../../../common/components/ui/KeyboardAwareContainer';
import BrandLogo from '../../../common/components/brand/BrandLogo';
import { SignInForm } from '../components';
import { AppleIcon, SpotifyIcon } from '../components/icons';
import ForgotPasswordScreen from './ForgotPasswordScreen';

type Props = {
  onLogin?: (user: User, onboardingRequired: boolean) => void;
  onSwitchToSignUp?: () => void;
};

export default function SignInScreen({ onLogin, onSwitchToSignUp }: Props) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const ICON_SIZE = 56;
  const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);
  const buttonSize = 56;
  const iconSize = 24;

  if (showForgotPassword) {
    return (
      <ForgotPasswordScreen
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing['3xl'],
          paddingBottom: spacing['2xl'],
          minHeight: '100%',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={spacing.lg}
        scrollEnabled={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
          <BrandLogo
            size={ICON_SIZE}
            borderRadius={ICON_RADIUS}
            style={{
              marginBottom: spacing.md,
            }}
          />
          <Text
            style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
              letterSpacing: -0.5,
            }}
          >
            Shade
          </Text>
        </View>

        <SignInForm 
          onLogin={onLogin}
          onSwitchToSignUp={onSwitchToSignUp}
          onForgotPassword={() => setShowForgotPassword(true)}
        />

        {/* Or Divider */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: spacing.xl,
        }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
          <Text style={{
            marginHorizontal: spacing.lg,
            color: colors.text.tertiary,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.regular,
            letterSpacing: 0.2,
            textTransform: 'uppercase',
              }}>
                {t('Or')}
              </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
        </View>

        {/* Auth Buttons */}
        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.xl,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: borderRadius.full,
              backgroundColor: colors.social.apple,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              ...shadows.md,
            }}
          >
            <AppleIcon size={iconSize} color={colors.text.inverse} />
          </View>

          <View 
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: borderRadius.full,
              backgroundColor: colors.social.spotify,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              ...shadows.md,
            }}
          >
            <SpotifyIcon size={iconSize} color={colors.text.inverse} />
          </View>
        </View>

        {/* Footer */}
        <View style={{ 
          marginTop: spacing['2xl'],
          marginBottom: Math.max(insets.bottom, spacing.lg),
          alignItems: 'center',
        }}>
          <Text style={{ 
            color: colors.text.tertiary,
            fontSize: typography.size.xs,
            textAlign: 'center',
            lineHeight: 18,
            paddingHorizontal: spacing.xl,
            fontWeight: typography.weight.regular,
            letterSpacing: 0.1,
          }}>
            {t('ByContinuing')}{' '}
            <Text style={{ 
              color: colors.text.secondary,
              fontWeight: typography.weight.medium,
            }}>
              {t('TermsOfService')}
            </Text>
            {' '}{t('And')}{' '}
            <Text style={{ 
              color: colors.text.secondary,
              fontWeight: typography.weight.medium,
            }}>
              {t('PrivacyPolicy')}
            </Text>
          </Text>
        </View>
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}

