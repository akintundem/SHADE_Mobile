import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { Suggestion } from '../services/agentService';

export const AgentSuggestionChips = ({ 
  onSelect, 
  suggestions = [] 
}: { 
  onSelect: (suggestionText: string) => void;
  suggestions?: Suggestion[];
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  if (!suggestions?.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
      {suggestions.slice(0, 4).map((s, idx) => (
        <TouchableOpacity key={idx} onPress={() => onSelect(s.text)} activeOpacity={0.85}>
          <View style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full }}>
            <Text style={{ color: s.type === 'risk' ? colors.semantic.error : colors.text.primary, fontWeight: typography.weight.medium }} numberOfLines={1}>
              {s.text}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

