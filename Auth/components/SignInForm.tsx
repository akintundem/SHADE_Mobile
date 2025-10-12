import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { setUser } from '../../storage/authStorage';
import { useTheme } from '../../theme/ThemeProvider';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';

type Props = {
  onLogin?: (user: User) => void;
  onSwitchToSignUp?: () => void;
};

export const SignInForm = ({ onLogin, onSwitchToSignUp }: Props) => {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSignIn = useMemo(() => !!email && !!password, [email, password]);

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
        error={error && error.includes('email') ? error : undefined}
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
        returnKeyType="done"
        leftIcon={<Lock size={20} color={colors.text.tertiary} />}
        rightIcon={
          showPassword ? (
            <EyeOff size={20} color={colors.text.tertiary} />
          ) : (
            <Eye size={20} color={colors.text.tertiary} />
          )
        }
        onRightIconPress={() => setShowPassword(v => !v)}
        error={error && !error.includes('email') ? error : undefined}
      />

      {error && !error.includes('email') && !error.includes('password') ? (
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
            const { user } = await authService.signIn(email, password);
            await setUser(user);
            const mapped: User = { id: user.userId, email: user.email, name: user.username, provider: 'password' };
            onLogin?.(mapped);
          } catch (e: any) {
            setError(e?.message || t('SignIn'));
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!canSignIn || submitting}
        loading={submitting}
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing.sm }}
      >
        {t('SignIn')}
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
          {t('DontHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignUp}>
          <Text style={{ 
            color: brand.primary,
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
          }}>
            {t('SignUp')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
