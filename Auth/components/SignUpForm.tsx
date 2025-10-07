import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { styles } from '../styles';
import { User } from '../../types';

type Props = {
  onSignedUp?: (payload: { email: string; token?: string }) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const isDark = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canCreate = useMemo(() => !!email && !!password && password === confirm, [email, password, confirm]);

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
          returnKeyType="next"
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

      <View
        style={[
          styles.inputWrap,
          isDark ? styles.inputWrapDark : styles.inputWrapLight,
        ]}
      >
        <Lock size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm password"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
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
            <EyeOff size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          ) : (
            <Eye size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          )}
        </Pressable>
      </View>

      <TouchableOpacity
        activeOpacity={canCreate ? 0.8 : 1}
        style={[styles.primaryInvertedBtn, !canCreate && styles.signInBtnDisabled]}
        disabled={!canCreate}
        onPress={() => onSignedUp?.({ email, token: 'fake-token' })}
      >
        <Text style={styles.primaryInvertedText}>Create account</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 15 }}>Already have an account? </Text>
        <Text
          onPress={onSwitchToSignIn}
          style={{ color: '#1DB954', fontSize: 15, fontWeight: '600' }}
        >
          Sign in
        </Text>
      </View>
    </View>
  );
};
