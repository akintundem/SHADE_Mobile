import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { X, Globe, Users, CalendarDays, Clock, MapPin, Plus } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = { onClose: () => void; onCreate?: () => void };

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  const [isPublic, setPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>(['Music', 'Amapiano', 'Fashion', 'Food', 'Culture', 'Dance']);
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Create Event</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Date & Time laid out in two columns like the mock */}
        <Section title="Date & Time" colors={colors}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<CalendarDays size={16} color={colors.textPrimary} />} label="Start Date" colors={colors} />
              <Input placeholder="yyyy-mm-dd" colors={colors} />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<Clock size={16} color={colors.textPrimary} />} label="Start Time" colors={colors} />
              <Input placeholder="--:-- --" colors={colors} highlighted />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<CalendarDays size={16} color={colors.textPrimary} />} label="End Date (Optional)" colors={colors} />
              <Input placeholder="yyyy-mm-dd" colors={colors} />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel icon={<Clock size={16} color={colors.textPrimary} />} label="End Time (Optional)" colors={colors} />
              <Input placeholder="--:-- --" colors={colors} />
            </View>
          </View>
        </Section>

        {/* Location block boxed as in mock */}
        <Section title="Location" colors={colors}>
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
            <Input placeholder="Enter location name" colors={colors} />
            <Input placeholder="Full address (optional)" colors={colors} style={{ marginTop: 8 }} />
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <MapPin size={16} color={colors.textPrimary} />
              <Text style={{ color: colors.textPrimary }}>Detect current location</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Visibility */}
        <Section title="Visibility" colors={colors}>
          <Row label="Public" icon={<Globe size={16} color={colors.textPrimary} />} colors={colors}>
            <Switch value={isPublic} onValueChange={setPublic} />
          </Row>
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{isPublic ? 'Visible to everyone' : 'Visible to invited only'}</Text>
        </Section>

        {/* Access Type */}
        <Section title="Access Type" colors={colors}>
          <RadioRow label="Free" active={free} onPress={() => setFree(true)} colors={colors} />
          <RadioRow label="Paid" active={!free} onPress={() => setFree(false)} colors={colors} />
        </Section>

        {/* Collaborators */}
        <Section title="Add collaborators" colors={colors}>
          {[{ name: 'Alex Martinez', handle: '@alex_m' }, { name: 'Sarah Johnson', handle: '@sarah_j' }, { name: 'Mike Rodriguez', handle: '@mike_r' }].map(u => (
            <View key={u.handle} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginTop: 8 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{u.name}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{u.handle}</Text>
            </View>
          ))}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <Plus size={16} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary }}>Add more collaborators</Text>
          </TouchableOpacity>
        </Section>

        {/* Tags */}
        <Section title="Tags" colors={colors}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Input placeholder="Add a tag..." colors={colors} style={{ flex: 1 }} />
            <TouchableOpacity style={{ backgroundColor: colors.textPrimary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
              <Text style={{ color: colors.surface, fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {tags.map(t => (
              <View key={t} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: colors.textPrimary }}>+{t}</Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.surface }}>
        <TouchableOpacity onPress={onCreate} style={{ height: 48, borderRadius: 999, backgroundColor: colors.textPrimary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.surface, fontWeight: '700' }}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children, colors }: any) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, icon, children, colors }: any) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {icon}
        <Text style={{ color: colors.textPrimary }}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function Input({ placeholder, colors, style, highlighted = false }: any) {
  return (
    <View
      style={[
        {
          borderWidth: highlighted ? 2 : 1,
          borderColor: highlighted ? colors.border : colors.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 42,
          justifyContent: 'center',
          backgroundColor: colors.surface,
        },
        style,
      ]}
    >
      <TextInput placeholder={placeholder} placeholderTextColor={colors.textSecondary} style={{ color: colors.textPrimary }} />
    </View>
  );
}

function FieldLabel({ icon, label, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      {icon}
      <Text style={{ color: colors.textPrimary }}>{label}</Text>
    </View>
  );
}

function RadioRow({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View style={{ height: 16, width: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        {active ? <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: colors.textPrimary }} /> : null}
      </View>
      <Text style={{ color: colors.textPrimary }}>{label}</Text>
    </TouchableOpacity>
  );
}
