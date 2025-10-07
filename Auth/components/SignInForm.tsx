import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { styles } from '../styles';
import { User } from '../../types';

type Props = {
  onLogin?: (user: User) => void;
  onSwitchToSignUp?: () => void;
};

export const SignInForm = ({ onLogin, onSwitchToSignUp }: Props) => {
  const isDark = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

      <TouchableOpacity
        activeOpacity={canSignIn ? 0.8 : 1}
        style={[styles.signInBtn, !canSignIn && styles.signInBtnDisabled]}
        disabled={!canSignIn}
        onPress={() =>
          onLogin?.({ id: 'password', email, name: email.split('@')[0] || 'User', provider: 'password' })
        }
      >
        <Text style={styles.signInText}>Sign in</Text>
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

