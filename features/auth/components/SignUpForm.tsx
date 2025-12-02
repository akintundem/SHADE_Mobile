import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { useTheme } from '../../../common/theme/ThemeProvider';
import KeyboardOptimizedInput from '../../../common/components/ui/KeyboardOptimizedInput';
import Button from '../../../common/components/ui/Button';
import { useI18n } from '../../../common/i18n/I18nProvider';
import NotificationModal, { NotificationInfo } from '../../../common/components/common/NotificationModal';

type Props = {
  onSignedUp?: (payload: {
    email: string;
    requiresProfile: boolean;
    user: import('../services/authService').UserDTO;
  }) => void;
  onSwitchToSignIn?: () => void;
};

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirement checkers
const passwordChecks = {
  length: (pwd: string) => pwd.length >= 8 && pwd.length <= 128,
  hasLowercase: (pwd: string) => /[a-z]/.test(pwd),
  hasUppercase: (pwd: string) => /[A-Z]/.test(pwd),
  hasDigit: (pwd: string) => /\d/.test(pwd),
  hasSpecialChar: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  // Email validation
  const isValidEmail = useMemo(() => {
    const trimmedEmail = email.trim();
    return trimmedEmail.length > 0 && emailRegex.test(trimmedEmail);
  }, [email]);

  // Password validation - check individual requirements
  const passwordRequirements = useMemo(() => {
    return {
      length: passwordChecks.length(password),
      hasLowercase: passwordChecks.hasLowercase(password),
      hasUppercase: passwordChecks.hasUppercase(password),
      hasDigit: passwordChecks.hasDigit(password),
      hasSpecialChar: passwordChecks.hasSpecialChar(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(Boolean);
  }, [passwordRequirements]);

  const passwordsMatch = useMemo(() => {
    if (password.length === 0 || confirm.length === 0) {
      return true; // Don't show error until both fields have content
    }
    return password === confirm;
  }, [password, confirm]);

  // Button should be disabled if email OR password is invalid
  // For password match: only require match if confirm field has content
  const canCreate = useMemo(
    () => {
      const trimmedEmail = email.trim();
      const confirmHasContent = confirm.length > 0;
      const passwordsMatchWhenNeeded = !confirmHasContent || passwordsMatch;
      
      return (
        isValidEmail &&
        isPasswordValid &&
        passwordsMatchWhenNeeded &&
        acceptTerms
      );
    },
    [isValidEmail, isPasswordValid, passwordsMatch, acceptTerms, confirm],
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <View>
        <KeyboardOptimizedInput
          label="Email address"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setError(null);
          }}
          placeholder="you@example.com"
          inputType="email"
          enableNativeAutocomplete={true}
          containerStyle={{ marginBottom: 0 }}
        />
        {email.length > 0 && !isValidEmail && (
          <Text style={{
            fontSize: typography.size.xs,
            color: colors.semantic.error,
            marginTop: spacing.xs,
          }}>
            Please enter a valid email address
          </Text>
        )}
      </View>

      <View>
        <KeyboardOptimizedInput
          label="Password"
          value={password}
          onChangeText={text => {
            setPassword(text);
            setError(null);
          }}
          placeholder="Enter your password"
          inputType="password"
          enableNativeAutocomplete={true}
          containerStyle={{ marginBottom: 0 }}
        />
        {password.length > 0 && (
          <View style={{ marginTop: spacing.xs, gap: spacing.xs }}>
            <Text style={{
              fontSize: typography.size.xs,
              color: colors.text.secondary,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.xs,
            }}>
              Password requirements:
            </Text>
            <RequirementItem
              met={passwordRequirements.length}
              text={`8-128 characters (${password.length})`}
              colors={colors}
              typography={typography}
            />
            <RequirementItem
              met={passwordRequirements.hasLowercase}
              text="At least one lowercase letter"
              colors={colors}
              typography={typography}
            />
            <RequirementItem
              met={passwordRequirements.hasUppercase}
              text="At least one uppercase letter"
              colors={colors}
              typography={typography}
            />
            <RequirementItem
              met={passwordRequirements.hasDigit}
              text="At least one number"
              colors={colors}
              typography={typography}
            />
            <RequirementItem
              met={passwordRequirements.hasSpecialChar}
              text="At least one special character (!@#$%^&*...)"
              colors={colors}
              typography={typography}
            />
          </View>
        )}
      </View>

      <View>
        <KeyboardOptimizedInput
          label="Confirm password"
          value={confirm}
          onChangeText={text => {
            setConfirm(text);
            setError(null);
          }}
          placeholder="Confirm your password"
          inputType="password"
          enableNativeAutocomplete={true}
          containerStyle={{ marginBottom: 0 }}
        />
        {confirm.length > 0 && !passwordsMatch && (
          <Text style={{
            fontSize: typography.size.xs,
            color: colors.semantic.error,
            marginTop: spacing.xs,
          }}>
            Passwords do not match
          </Text>
        )}
        {confirm.length > 0 && passwordsMatch && (
          <Text style={{
            fontSize: typography.size.xs,
            color: colors.semantic.success,
            marginTop: spacing.xs,
          }}>
            ✓ Passwords match
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setAcceptTerms(!acceptTerms)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          marginTop: spacing.xs,
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: borderRadius.sm,
            borderWidth: 2,
            borderColor: acceptTerms ? brand.primary : colors.border,
            backgroundColor: acceptTerms ? brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {acceptTerms && (
            <Text
              style={{
                color: colors.text.inverse,
                fontSize: 12,
                fontWeight: typography.weight.bold,
              }}
            >
              ✓
            </Text>
          )}
        </View>
        <Text
          style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            lineHeight: 20,
          }}
        >
          I agree to the{' '}
          <Text
            style={{
              color: brand.primary,
              fontWeight: typography.weight.medium,
            }}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={{
              color: brand.primary,
              fontWeight: typography.weight.medium,
            }}
          >
            Privacy Policy
          </Text>
        </Text>
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            color: colors.semantic.error,
            fontSize: typography.size.sm,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}

      <Button
        onPress={async () => {
          if (!canCreate) {
            console.warn('⚠️ Cannot create account: validation failed', {
              hasEmail: !!email,
              hasPassword: !!password,
              passwordsMatch: password === confirm,
              passwordLength: password.length,
              passwordValid: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password),
              acceptTerms,
            });
            return;
          }

          try {
            setSubmitting(true);
            setError(null);
            setNotification(null);
            
            console.log('📝 Attempting registration...', { email: email.trim() });
            
            const registerRequest: RegisterRequest = {
              email: email.trim(),
              password,
              confirmPassword: confirm,
            };
            
            const registerResponse = await authService.registerNew(registerRequest);
            
            console.log('✅ Registration response received:', registerResponse);
            
            // Registration successful - trigger success callback
            onSignedUp?.({
              email: email.trim(),
              requiresProfile: true,
              user: {
                userId: email.trim(),
                email: email.trim(),
                username: '',
                profileComplete: false,
              },
            });
          } catch (e: any) {
            console.error('❌ Registration error:', e);
            
            // Handle specific error codes from API
            let errorMessage = e?.message || 'Registration failed';
            let errorTitle = 'Registration Failed';
            let errorCode: string | undefined;
            
            // Check for network errors
            if (errorMessage.includes('Unable to reach') || errorMessage.includes('network')) {
              errorMessage = 'Unable to connect to the server. Please check your internet connection.';
              errorTitle = 'Connection Error';
              errorCode = 'NETWORK_ERROR';
            } else if (errorMessage.includes('already registered') || errorMessage.includes('EMAIL_ALREADY_REGISTERED')) {
              errorMessage = 'This email is already registered. Try logging in instead.';
              errorTitle = 'Email Already Registered';
              errorCode = 'EMAIL_ALREADY_REGISTERED';
            } else if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
              errorMessage = 'Too many registration attempts. Please wait a few minutes and try again.';
              errorTitle = 'Too Many Attempts';
              errorCode = 'RATE_LIMIT_EXCEEDED';
            } else if (errorMessage.includes('validation') || errorMessage.includes('VALIDATION_ERROR')) {
              errorTitle = 'Validation Error';
              errorCode = 'VALIDATION_ERROR';
            }
            
            setNotification({
              type: 'error',
              title: errorTitle,
              message: errorMessage,
              code: errorCode,
              retryable: errorCode !== 'EMAIL_ALREADY_REGISTERED',
            });
            setError(errorMessage);
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!canCreate || submitting}
        loading={submitting}
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing.md }}
      >
        Create account
      </Button>

      <NotificationModal
        visible={!!notification}
        notification={notification}
        onClose={() => setNotification(null)}
        onRetry={() => {
          setNotification(null);
          // Retry logic can be added here if needed
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.md,
          gap: spacing.xs,
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
          }}
        >
          Already have an account?
        </Text>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <Text
            style={{
              color: brand.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component for displaying password requirement items
const RequirementItem = ({ 
  met, 
  text, 
  colors, 
  typography 
}: { 
  met: boolean; 
  text: string; 
  colors: any; 
  typography: any;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{
        fontSize: typography.size.xs,
        color: met ? colors.semantic.success : colors.text.secondary,
      }}>
        {met ? '✓' : '○'}
      </Text>
      <Text style={{
        fontSize: typography.size.xs,
        color: met ? colors.semantic.success : colors.text.secondary,
      }}>
        {text}
      </Text>
    </View>
  );
};
