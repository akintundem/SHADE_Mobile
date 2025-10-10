import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft, Camera, User as UserIcon } from 'lucide-react-native';
import { useAuthStyles } from '../styles';

type Props = {
  email?: string;
  onBack?: () => void;
  onComplete?: (payload: { name: string; username: string }) => void;
};

export const CompleteProfile = ({ email, onBack, onComplete }: Props) => {
  const styles = useAuthStyles();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const canSubmit = useMemo(() => name.trim().length > 0 && username.trim().length > 0, [name, username]);

  return (
    <View style={{ marginTop: 16 }}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ArrowLeft size={18} color={styles.footerLink.color as any} />
        <Text style={styles.footerLink}>Back to credentials</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: 50,
            backgroundColor: '#00000000',
            borderWidth: 1,
            borderColor: styles.hr.backgroundColor as any,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserIcon size={36} color={styles.signupMuted.color as any} />
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
              borderColor: styles.hr.backgroundColor as any,
            }}
          >
            <Camera size={16} color={styles.footerLink.color as any} />
          </View>
        </View>
        <Text style={{ marginTop: 8, color: styles.signupMuted.color as any }}>Add a profile picture</Text>
      </View>

      <View style={styles.inputWrap}>
        <UserIcon size={18} color={styles.signupMuted.color as any} style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={styles.signupMuted.color as any}
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputWrap}>
        <UserIcon size={18} color={styles.signupMuted.color as any} style={styles.leadingIconSvg} />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={styles.signupMuted.color as any}
          autoCapitalize="none"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity
        activeOpacity={canSubmit ? 0.8 : 1}
        style={[styles.primaryInvertedBtn, !canSubmit && styles.signInBtnDisabled, { marginTop: 12 }]}
        disabled={!canSubmit}
        onPress={() => onComplete?.({ name, username })}
      >
        <Text style={styles.primaryInvertedText}>Complete profile</Text>
      </TouchableOpacity>
    </View>
  );
};

