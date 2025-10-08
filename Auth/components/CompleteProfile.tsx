import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, useColorScheme } from 'react-native';
import { ArrowLeft, Camera, User as UserIcon } from 'lucide-react-native';
import { styles } from '../styles';

type Props = {
  email?: string;
  onBack?: () => void;
  onComplete?: (payload: { name: string; username: string; dateOfBirth: string; profilePictureUrl?: string }) => void;
};

export const CompleteProfile = ({ email, onBack, onComplete }: Props) => {
  const isDark = useColorScheme() === 'dark';
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const canSubmit = useMemo(() => name.trim().length > 0 && username.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim()), [name, username, dateOfBirth]);

  return (
    <View style={{ marginTop: 16 }}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ArrowLeft size={18} color={isDark ? '#E5E7EB' : '#111827'} />
        <Text style={{ color: isDark ? '#E5E7EB' : '#111827' }}>Back to credentials</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: isDark ? '#F9FAFB' : '#111827' }}>Complete your profile</Text>
        <Text style={{ marginTop: 6, color: '#6B7280' }}>Tell us a bit about yourself</Text>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: 50,
            backgroundColor: isDark ? '#111827' : '#F3F4F6',
            borderWidth: 1,
            borderColor: isDark ? '#2A2E35' : '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserIcon size={36} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              height: 28,
              width: 28,
              borderRadius: 14,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Camera size={16} color="#111827" />
          </View>
        </View>
        <Text style={{ marginTop: 8, color: '#9CA3AF' }}>Add a profile picture</Text>
      </View>

      <View
        style={[styles.inputWrap, isDark ? styles.inputWrapDark : styles.inputWrapLight]}
      >
        <UserIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          returnKeyType="next"
        />
      </View>

      <View
        style={[styles.inputWrap, isDark ? styles.inputWrapDark : styles.inputWrapLight]}
      >
        <UserIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          autoCapitalize="none"
          returnKeyType="done"
        />
      </View>

      <View
        style={[styles.inputWrap, isDark ? styles.inputWrapDark : styles.inputWrapLight]}
      >
        <UserIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="Date of birth (YYYY-MM-DD)"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>

      <View
        style={[styles.inputWrap, isDark ? styles.inputWrapDark : styles.inputWrapLight]}
      >
        <UserIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.leadingIconSvg} />
        <TextInput
          style={[styles.input, isDark ? styles.inputTextDark : styles.inputTextLight]}
          value={profilePictureUrl}
          onChangeText={setProfilePictureUrl}
          placeholder="Profile picture URL (optional)"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          autoCapitalize="none"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity
        activeOpacity={canSubmit ? 0.8 : 1}
        style={[styles.primaryInvertedBtn, !canSubmit && styles.signInBtnDisabled, { marginTop: 12 }]}
        disabled={!canSubmit}
        onPress={() => onComplete?.({ name, username, dateOfBirth, profilePictureUrl: profilePictureUrl || undefined })}
      >
        <Text style={styles.primaryInvertedText}>Complete profile</Text>
      </TouchableOpacity>
    </View>
  );
};
