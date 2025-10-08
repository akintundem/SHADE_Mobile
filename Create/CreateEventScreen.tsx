import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { X, Globe, Users, CalendarDays, Clock, MapPin, Plus } from 'lucide-react-native';
import { eventService } from '../services/eventService';

type Props = { onClose: () => void; onCreate?: () => void };

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>(['Music', 'Amapiano', 'Fashion', 'Food', 'Culture', 'Dance']);
  const [tagText, setTagText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => title.trim().length > 0 && startDate.trim().length > 0, [title, startDate]);

  function toIso(date: string, time?: string) {
    const d = date?.trim();
    const t = (time || '').trim();
    if (!d) return '';
    // naive compose; if time missing, use 00:00:00
    // strip spaces/AM PM if user typed them; rely on backend to parse strict seconds
    const timePart = t ? t.replace(/\s*(AM|PM)$/i, '') + (t.includes(':') && t.split(':').length === 2 ? ':00' : '') : '00:00:00';
    return `${d}T${timePart}`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0B' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#1F2937' }}>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={{ color: '#E5E7EB', fontWeight: '700' }}>Create Event</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Section title="Details">
          <Input placeholder="Event title" dark highlighted value={title} onChangeText={setTitle} />
          <View style={{ height: 8 }} />
          <View style={{ borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={{ color: '#E5E7EB', minHeight: 68 }}
            />
          </View>
        </Section>
        {/* Date & Time laid out in two columns like the mock */}
        <Section title="Date & Time">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<CalendarDays size={16} color="#E5E7EB" />} label="Start Date" />
              <Input placeholder="yyyy-mm-dd" dark value={startDate} onChangeText={setStartDate} />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<Clock size={16} color="#E5E7EB" />} label="Start Time" />
              <Input placeholder="--:-- --" dark highlighted value={startTime} onChangeText={setStartTime} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<CalendarDays size={16} color="#E5E7EB" />} label="End Date (Optional)" />
              <Input placeholder="yyyy-mm-dd" dark value={endDate} onChangeText={setEndDate} />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<Clock size={16} color="#E5E7EB" />} label="End Time (Optional)" />
              <Input placeholder="--:-- --" dark value={endTime} onChangeText={setEndTime} />
            </View>
          </View>
        </Section>

        {/* Location block boxed as in mock */}
        <Section title="Location">
          <View style={{ borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12 }}>
            <Input placeholder="Enter location name" dark value={location} onChangeText={setLocation} />
            <Input placeholder="Full address (optional)" dark style={{ marginTop: 8 }} />
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <MapPin size={16} color="#E5E7EB" />
              <Text style={{ color: '#E5E7EB' }}>Detect current location</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Visibility */}
        <Section title="Visibility">
          <Row label="Public" icon={<Globe size={16} color="#E5E7EB" />}>
            <Switch value={isPublic} onValueChange={setPublic} />
          </Row>
          <Text style={{ color: '#9CA3AF', marginTop: 6 }}>{isPublic ? 'Visible to everyone' : 'Visible to invited only'}</Text>
        </Section>

        {/* Access Type */}
        <Section title="Access Type">
          <RadioRow label="Free" active={free} onPress={() => setFree(true)} />
          <RadioRow label="Paid" active={!free} onPress={() => setFree(false)} />
        </Section>

        {/* Collaborators */}
        <Section title="Add collaborators">
          {[{ name: 'Alex Martinez', handle: '@alex_m' }, { name: 'Sarah Johnson', handle: '@sarah_j' }, { name: 'Mike Rodriguez', handle: '@mike_r' }].map(u => (
            <View key={u.handle} style={{ borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, marginTop: 8 }}>
              <Text style={{ color: '#F3F4F6', fontWeight: '600' }}>{u.name}</Text>
              <Text style={{ color: '#9CA3AF', marginTop: 2 }}>{u.handle}</Text>
            </View>
          ))}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <Plus size={16} color="#E5E7EB" />
            <Text style={{ color: '#E5E7EB' }}>Add more collaborators</Text>
          </TouchableOpacity>
        </Section>

        {/* Tags */}
        <Section title="Tags">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Input placeholder="Add a tag..." dark style={{ flex: 1 }} value={tagText} onChangeText={setTagText} />
            <TouchableOpacity
              onPress={() => {
                const t = tagText.trim();
                if (!t) return;
                if (tags.includes(t)) return;
                setTags([...tags, t]);
                setTagText('');
              }}
              style={{ backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {tags.map(t => (
              <View key={t} style={{ borderWidth: 1, borderColor: '#1F2937', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: '#E5E7EB' }}>+{t}</Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#0B0B0B' }}>
        {error ? (
          <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 6 }}>{error}</Text>
        ) : null}
        <TouchableOpacity
          disabled={!canCreate || saving}
          onPress={async () => {
            if (!canCreate || saving) return;
            setSaving(true);
            setError(null);
            try {
              const payload = {
                title: title.trim(),
                description: description || undefined,
                startDate: toIso(startDate, startTime) || `${startDate}T00:00:00`,
                endDate: toIso(endDate, endTime) || `${startDate}T00:00:00`,
                location: location || undefined,
                isPrivate: !isPublic,
                tags: tags,
              } as const;
              await eventService.createEvent(payload);
              onCreate?.();
              onClose();
            } catch (e: any) {
              setError(e?.message || 'Failed to create event');
            } finally {
              setSaving(false);
            }
          }}
          style={{ height: 48, borderRadius: 999, backgroundColor: canCreate && !saving ? '#E5E7EB' : '#9CA3AF', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#111827', fontWeight: '700' }}>{saving ? 'Creating…' : 'Create Event'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <Text style={{ color: '#E5E7EB', fontWeight: '700', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, icon, children }: any) {
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

function Input({ placeholder, dark, style, highlighted = false, value, onChangeText }: any) {
  return (
    <View
      style={[
        {
          borderWidth: highlighted ? 2 : 1,
          borderColor: highlighted ? '#E5E7EB' : dark ? '#1F2937' : '#E5E7EB',
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 42,
          justifyContent: 'center',
          backgroundColor: dark ? '#0B0B0B' : '#FFFFFF',
        },
        style,
      ]}
    >
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={dark ? '#9CA3AF' : '#6B7280'} style={{ color: dark ? '#E5E7EB' : '#111827' }} />
    </View>
  );
}

function FieldLabel({ icon, label }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      {icon}
      <Text style={{ color: '#E5E7EB' }}>{label}</Text>
    </View>
  );
}

function RadioRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View style={{ height: 16, width: 16, borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
        {active ? <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: '#E5E7EB' }} /> : null}
      </View>
      <Text style={{ color: '#E5E7EB' }}>{label}</Text>
    </TouchableOpacity>
  );
}
