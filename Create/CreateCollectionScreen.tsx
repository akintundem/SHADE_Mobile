import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, Globe, ImagePlus, CheckCircle2 } from 'lucide-react-native';

type Props = { onClose: () => void; onCreate?: () => void };

export default function CreateCollectionScreen({ onClose, onCreate }: Props) {
  const [isPublic, setPublic] = useState(true);
  const [type, setType] = useState<'personal' | 'group' | 'themed'>('personal');
  const [mode, setMode] = useState<'events' | 'posts'>('events');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0B' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#1F2937' }}>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={{ color: '#E5E7EB', fontWeight: '700' }}>New Collection</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Section title="Cover Image / Upload banner">
          <View style={{ borderWidth: 1, borderColor: '#1F2937', borderStyle: 'dashed', borderRadius: 12, height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <ImagePlus size={22} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', marginTop: 6 }}>Upload Cover Image</Text>
          </View>
        </Section>

        <Section>
          <Input dark placeholder="Name your collection" valueDefault="" />
          <Input dark placeholder="Tell us what this collection is about..." multiline style={{ marginTop: 8, height: 100, paddingVertical: 8 }} />
        </Section>

        <Section title="Visibility">
          <Row icon={<Globe size={16} color="#E5E7EB" />} label={isPublic ? 'Public' : 'Private'}>
            <TouchableOpacity onPress={() => setPublic(p => !p)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#111827' }}>
              <Text style={{ color: '#E5E7EB' }}>{isPublic ? 'Everyone can see this collection' : 'Only you and invited can see'}</Text>
            </TouchableOpacity>
          </Row>
        </Section>

        <Section title="Collection type">
          <TypeOption label="My Personal Journey" desc="A personal collection of your experiences" active={type === 'personal'} onPress={() => setType('personal')} />
          <TypeOption label="Group Memory Album" desc="Collaborative memories with friends" active={type === 'group'} onPress={() => setType('group')} />
          <TypeOption label="Themed Showcase" desc="Curated content around a theme" active={type === 'themed'} onPress={() => setType('themed')} />
        </Section>

        <Section title="Add Items">
          <Segmented value={mode} onChange={setMode} />
          <View style={{ marginTop: 12, gap: 12 }}>
            {['Day 1: Arrival in Dubai', 'Day 2: Burj Khalifa Visit', 'Day 3: Desert Safari', 'Day 4: Shopping at Dubai Mall', 'Day 5: Beach Day at JBR'].map((t, i) => (
              <View key={t} style={{ borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12 }}>
                <Text style={{ color: '#F3F4F6', fontWeight: '600' }}>{t}</Text>
                <Text style={{ color: '#9CA3AF', marginTop: 2 }}>{i === 0 ? 'Dubai International Airport' : 'Dubai'}</Text>
                <View style={{ alignSelf: 'flex-start', marginTop: 6, borderWidth: 1, borderColor: '#1F2937', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#E5E7EB', fontSize: 12 }}>TRIP</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#0B0B0B' }}>
        <TouchableOpacity onPress={onCreate} style={{ height: 48, borderRadius: 999, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#111827', fontWeight: '700' }}>Create Collection</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {title ? <Text style={{ color: '#E5E7EB', fontWeight: '700', marginBottom: 8 }}>{title}</Text> : null}
      {children}
    </View>
  );
}

function Row({ icon, label, children }: any) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {icon}
        <Text style={{ color: '#E5E7EB' }}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function Input({ placeholder, valueDefault = '', multiline = false, dark = true, style }: any) {
  return (
    <View style={[{ borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, paddingHorizontal: 12, height: multiline ? undefined : 42, justifyContent: 'center', backgroundColor: '#0B0B0B' }, style]}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        defaultValue={valueDefault}
        multiline={multiline}
        style={{ color: '#E5E7EB', paddingVertical: multiline ? 6 : 0 }}
      />
    </View>
  );
}

function TypeOption({ label, desc, active, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ borderWidth: 1, borderColor: active ? '#E5E7EB' : '#1F2937', borderRadius: 12, padding: 12, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#F3F4F6', fontWeight: '600' }}>{label}</Text>
        {active ? <CheckCircle2 size={16} color="#E5E7EB" /> : null}
      </View>
      <Text style={{ color: '#9CA3AF', marginTop: 4 }}>{desc}</Text>
    </TouchableOpacity>
  );
}

function Segmented({ value, onChange }: { value: 'events' | 'posts'; onChange: (v: 'events' | 'posts') => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: '#111827', padding: 4, alignSelf: 'flex-start' }}>
      {[
        { k: 'events', l: 'Add Existing Events' },
        { k: 'posts', l: 'Collect Individual Posts' },
      ].map(t => (
        <TouchableOpacity key={t.k} onPress={() => onChange(t.k as any)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: value === t.k ? '#0B0B0B' : 'transparent' }}>
          <Text style={{ color: '#E5E7EB' }}>{t.l}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

