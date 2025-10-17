import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAgent } from '../Agent/AgentProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AgentChatSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { messages, ask, context } = useAgent();
  const [input, setInput] = React.useState('');

  if (!visible) return null;
  return (
    <SafeAreaView style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: colors.background }} edges={['top','bottom']}>
      <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>Shade</Text>
        <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>Close</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: m.role === 'user' ? (colors.brand?.primary || '#6b7280') : colors.surface, borderRadius: borderRadius.lg, padding: spacing.md }}>
            <Text style={{ color: m.role === 'user' ? '#FFFFFF' : colors.text.primary }}>{m.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderColor: colors.border }}>
        <TextInput value={input} onChangeText={setInput} placeholder="Ask Shade..." placeholderTextColor={colors.text.tertiary} style={{ flex: 1, height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, color: colors.text.primary }} />
        <TouchableOpacity onPress={() => { if (context && input.trim()) { ask(context, input.trim()); setInput(''); } }} style={{ height: 44, paddingHorizontal: spacing.lg, borderRadius: borderRadius.lg, backgroundColor: colors.brand?.primary || '#6b7280', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>Ask Shade</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


