import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAgent } from '../Agent/AgentProvider';

export const AgentSuggestionChips = ({ onSelect }: { onSelect: (suggestionText: string) => void }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { suggestions } = useAgent();
  if (!suggestions?.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
      {suggestions.slice(0, 4).map((s, idx) => (
        <TouchableOpacity key={idx} onPress={() => onSelect(s.text)} activeOpacity={0.85}>
          <View style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full }}>
            <Text style={{ color: s.type === 'risk' ? '#ef4444' : colors.text.primary, fontWeight: typography.weight.medium }} numberOfLines={1}>
              {s.text}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};


