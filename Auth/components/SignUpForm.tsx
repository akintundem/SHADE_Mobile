import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuthStyles } from '../styles';
import { authService } from '../../services/authService';

type Props = {
  onSignedUp?: (payload: { email: string; requiresProfile: boolean; user: import('../../services/authService').UserDTO }) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const styles = useAuthStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => !!email && !!password && password === confirm, [email, password, confirm]);

  return (
    <View style={styles.formWrap}>
      <View style={styles.inputWrap}>
        <Mail size={18} color={styles.signupMuted.color as any} style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={styles.signupMuted.color as any}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputWrap}>
        <Lock size={18} color={styles.signupMuted.color as any} style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={styles.signupMuted.color as any}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowPassword(v => !v)}
          hitSlop={10}
          style={styles.trailingIconWrap}
        >
          {showPassword ? (
            <EyeOff size={18} color={styles.signupMuted.color as any} />
          ) : (
            <Eye size={18} color={styles.signupMuted.color as any} />
          )}
        </Pressable>
      </View>

      <View style={styles.inputWrap}>
        <Lock size={18} color={styles.signupMuted.color as any} style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm password"
          placeholderTextColor={styles.signupMuted.color as any}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowConfirm(v => !v)}
          hitSlop={10}
          style={styles.trailingIconWrap}
        >
          {showConfirm ? (
            <EyeOff size={18} color={styles.signupMuted.color as any} />
          ) : (
            <Eye size={18} color={styles.signupMuted.color as any} />
          )}
        </Pressable>
      </View>

      {error ? (
        <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 6 }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={canCreate && !submitting ? 0.8 : 1}
        style={[styles.primaryInvertedBtn, (!canCreate || submitting) && styles.signInBtnDisabled]}
        disabled={!canCreate || submitting}
        onPress={async () => {
          try {
            setSubmitting(true);
            setError(null);
            const res = await authService.register(email, password);
            const { setUser } = await import('../../storage/authStorage');
            await setUser(res.user);
            onSignedUp?.({ email, requiresProfile: !!res.requiresProfile, user: res.user });
          } catch (e: any) {
            setError(e?.message || 'Failed to create account');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <Text style={styles.primaryInvertedText}>Create account</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Text style={styles.signupMuted}>Already have an account? </Text>
        <Text
          onPress={onSwitchToSignIn}
          style={styles.signupLink}
        >
          Sign in
        </Text>
      </View>
    </View>
  );
};
