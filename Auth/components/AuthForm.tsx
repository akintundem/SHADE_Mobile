import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { styles } from '../styles';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSignIn = useMemo(() => !!email && !!password, [email, password]);

  return (
    <View style={styles.formWrap}>
      <View style={styles.inputWrap}>
        <Mail size={18} color="#6B7280" style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6B7280"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputWrap}>
        <Lock size={18} color="#6B7280" style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#6B7280"
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
            <EyeOff size={18} color="#6B7280" />
          ) : (
            <Eye size={18} color="#6B7280" />
          )}
        </Pressable>
      </View>

      <TouchableOpacity
        activeOpacity={canSignIn ? 0.8 : 1}
        style={[styles.signInBtn, !canSignIn && styles.signInBtnDisabled]}
        disabled={!canSignIn}
      >
        <Text style={styles.signInText}>Sign in</Text>
      </TouchableOpacity>

      <View style={styles.signupRow}>
        <Text style={styles.signupMuted}>Don't have an account? </Text>
        <Text style={styles.signupLink}>Sign up</Text>
      </View>
    </View>
  );
};

