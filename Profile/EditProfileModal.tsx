import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: { name: string; username: string; bio?: string; website?: string; location?: string }) => void;
  user: User;
};

export default function EditProfileModal({ visible, onClose, onSave, user }: Props) {
  const [tab, setTab] = useState<'basic' | 'professional' | 'privacy'>('basic');
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState((user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-'));
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose} transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
              <TouchableOpacity onPress={onClose}><Text style={{ color: '#111827' }}>Close</Text></TouchableOpacity>
              <Text style={{ color: '#111827', fontWeight: '700' }}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => onSave?.({ name, username, bio, website, location })}
                style={{ backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}
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
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: tab === t.key ? '#111827' : '#F3F4F6' }}
                >
                  <Text style={{ color: tab === t.key ? '#FFFFFF' : '#111827', fontWeight: '600' }}>{t.label}</Text>
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
                  <Text style={{ color: '#6B7280' }}>Professional settings coming soon.</Text>
                </View>
              ) : null}

              {tab === 'privacy' ? (
                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={{ color: '#6B7280' }}>Privacy controls will live here.</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function LabeledInput({ label, prefix, ...rest }: any) {
  return (
    <View>
      <Text style={{ color: '#6B7280', marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 44, backgroundColor: '#FFFFFF' }}>
        {prefix ? <Text style={{ color: '#6B7280', marginRight: 6 }}>{prefix}</Text> : null}
        <TextInput {...rest} style={{ flex: 1, color: '#111827' }} placeholderTextColor="#9CA3AF" />
      </View>
    </View>
  );
}

function LabeledTextArea({ label, maxLength = 150, value, onChangeText }: any) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: '#6B7280' }}>{label}</Text>
        <Text style={{ color: '#9CA3AF' }}>{(value?.length || 0)}/{maxLength}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={4}
          maxLength={maxLength}
          style={{ color: '#111827', minHeight: 80 }}
          placeholder="Tell people about yourself..."
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

