import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { RegisterRequest } from '../../types';
import { authService } from '../../services/authService';
import { useTheme } from '../../theme/ThemeProvider';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';

type Props = {
  onSignedUp?: (payload: { email: string; requiresProfile: boolean; user: import('../../services/authService').UserDTO }) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => !!email && !!password && password === confirm, [email, password, confirm]);

  return (
    <View style={{ gap: spacing.lg }}>
      <Input
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null);
        }}
        placeholder={t('EmailAddress')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        leftIcon={<Mail size={20} color={colors.text.tertiary} />}
      />

      <Input
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        placeholder={t('Password')}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        leftIcon={<Lock size={20} color={colors.text.tertiary} />}
        rightIcon={
          showPassword ? (
            <EyeOff size={20} color={colors.text.tertiary} />
          ) : (
            <Eye size={20} color={colors.text.tertiary} />
          )
        }
        onRightIconPress={() => setShowPassword(v => !v)}
      />

      <Input
        value={confirm}
        onChangeText={(text) => {
          setConfirm(text);
          setError(null);
        }}
        placeholder={t('ConfirmPassword')}
        secureTextEntry={!showConfirm}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        leftIcon={<Lock size={20} color={colors.text.tertiary} />}
        rightIcon={
          showConfirm ? (
            <EyeOff size={20} color={colors.text.tertiary} />
          ) : (
            <Eye size={20} color={colors.text.tertiary} />
          )
        }
        onRightIconPress={() => setShowConfirm(v => !v)}
        error={password && confirm && password !== confirm ? t('ConfirmPassword') : undefined}
      />

      {error ? (
        <Text style={{ 
          color: colors.semantic.error, 
          textAlign: 'center',
          fontSize: typography.size.sm,
        }}>
          {error}
        </Text>
      ) : null}

      <Button
        onPress={async () => {
          try {
            setSubmitting(true);
            setError(null);
            const registerRequest: RegisterRequest = {
              email,
              name: email.split('@')[0], // Use email prefix as name
              password,
              confirmPassword: confirm,
              acceptTerms: true,
              acceptPrivacy: true,
              marketingOptIn: false,
              deviceId: 'mobile-app',
              clientId: 'capsule-app'
            };
            const authResponse = await authService.registerNew(registerRequest);
            const { setUser } = await import('../../storage/authStorage');
            await setUser(authResponse.user);
            onSignedUp?.({ 
              email, 
              requiresProfile: false, 
              user: {
                userId: authResponse.user.id,
                email: authResponse.user.email,
                username: authResponse.user.name,
                profilePictureUrl: authResponse.user.profileImageUrl,
                profileComplete: true
              }
            });
          } catch (e: any) {
            setError(e?.message || t('CreateAccount'));
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!canCreate || submitting}
        loading={submitting}
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing.sm }}
      >
        {t('CreateAccount')}
      </Button>

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: spacing.md,
        gap: spacing.xs,
      }}>
        <Text style={{ 
          color: colors.text.secondary,
          fontSize: typography.size.base,
        }}>
          {t('AlreadyHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <Text style={{ 
            color: brand.primary,
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
          }}>
            {t('SignIn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
