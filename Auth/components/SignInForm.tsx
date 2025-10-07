import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { styles } from '../styles';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { setUser } from '../../storage/authStorage';

type Props = {
  onLogin?: (user: User) => void;
  onSwitchToSignUp?: () => void;
};

export const SignInForm = ({ onLogin, onSwitchToSignUp }: Props) => {
  const isDark = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSignIn = useMemo(() => !!email && !!password, [email, password]);

  return (
    <View style={styles.formWrap}>
      <View
        style={[
          styles.inputWrap,
          isDark ? styles.inputWrapDark : styles.inputWrapLight,
        ]}
      >
        <Mail size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View
        style={[
          styles.inputWrap,
          isDark ? styles.inputWrapDark : styles.inputWrapLight,
        ]}
      >
        <Lock size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowPassword(v => !v)}
          hitSlop={10}
          style={styles.trailingIconWrap}
        >
          {showPassword ? (
            <EyeOff size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          ) : (
            <Eye size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          )}
        </Pressable>
      </View>

      {error ? (
        <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 6 }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={canSignIn && !submitting ? 0.8 : 1}
        style={[styles.signInBtn, (!canSignIn || submitting) && styles.signInBtnDisabled]}
        disabled={!canSignIn || submitting}
        onPress={async () => {
          try {
            setSubmitting(true);
            setError(null);
            const { user } = await authService.signIn(email, password);
            // Persist a lightweight user cache
            await setUser(user);
            const mapped: User = { id: user.userId, email: user.email, name: user.username, provider: 'password' };
            onLogin?.(mapped);
          } catch (e: any) {
            setError(e?.message || 'Failed to sign in');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signInText}>Sign in</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 15 }}>Don't have an account? </Text>
        <Text
          onPress={onSwitchToSignUp}
          style={{ color: '#1DB954', fontSize: 15, fontWeight: '600' }}
        >
          Sign up
        </Text>
      </View>
    </View>
  );
};
