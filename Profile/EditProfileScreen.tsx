import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { User } from '../types';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  user: User;
  onBack?: () => void;
  onSave?: (data: { name: string; username: string; bio?: string; website?: string; location?: string }) => void;
};

export default function EditProfileScreen({ user, onBack, onSave }: Props) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'basic' | 'professional' | 'privacy'>('basic');
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState((user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-'));
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Edit Profile</Text>
          <TouchableOpacity
            onPress={() => onSave?.({ name, username, bio, website, location })}
            style={{ backgroundColor: colors.textPrimary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
          {[
            { key: 'basic', label: 'Basic' },
            { key: 'professional', label: 'Professional' },
            { key: 'privacy', label: 'Privacy' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key as any)}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: tab === (t.key as any) ? colors.textPrimary : colors.card }}
            >
              <Text style={{ color: tab === (t.key as any) ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {tab === 'basic' ? (
            <View style={{ paddingHorizontal: 16, gap: 12 }}>
              <LabeledInput label="Full Name" value={name} onChangeText={setName} />
              <LabeledInput label="Username" value={username} onChangeText={setUsername} prefix="#" />
              <LabeledTextArea label="Bio" value={bio} onChangeText={setBio} maxLength={150} />
              <LabeledInput label="Website" value={website} onChangeText={setWebsite} placeholder="yourwebsite.com" />
              <LabeledInput label="Location" value={location} onChangeText={setLocation} placeholder="City, Country" />
            </View>
          ) : null}

          {tab === 'professional' ? (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: colors.textSecondary }}>Professional settings coming soon.</Text>
            </View>
          ) : null}

          {tab === 'privacy' ? (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: colors.textSecondary }}>Privacy controls will live here.</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LabeledInput({ label, prefix, ...rest }: any) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44, backgroundColor: colors.surface }}>
        {prefix ? <Text style={{ color: colors.textSecondary, marginRight: 6 }}>{prefix}</Text> : null}
        <TextInput {...rest} style={{ flex: 1, color: colors.textPrimary }} placeholderTextColor={colors.textSecondary} />
      </View>
    </View>
  );
}

function LabeledTextArea({ label, maxLength = 150, value, onChangeText }: any) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.textSecondary }}>{label}</Text>
        <Text style={{ color: colors.textSecondary }}>{(value?.length || 0)}/{maxLength}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={4}
          maxLength={maxLength}
          style={{ color: colors.textPrimary, minHeight: 80 }}
          placeholder="Tell people about yourself..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );
}

