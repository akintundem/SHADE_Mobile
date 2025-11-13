import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

export type SegmentType = 'live' | 'all' | 'past';

type Tab = {
  key: SegmentType;
  label: string;
};

const TABS: Tab[] = [
  { key: 'live', label: 'Live' },
  { key: 'all', label: 'All' },
  { key: 'past', label: 'Past' },
];

type Props = {
  activeSegment: SegmentType;
  onSegmentChange: (segment: SegmentType) => void;
};

export const EventSegmentedControl = ({ activeSegment, onSegmentChange }: Props) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSegmentChange(tab.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.md,
            }}
          >
            <Text
              style={{
                color:
                  activeSegment === tab.key
                    ? colors.text.primary
                    : colors.text.tertiary,
                fontWeight:
                  activeSegment === tab.key
                    ? typography.weight.semibold
                    : typography.weight.medium,
                fontSize: typography.size.base,
              }}
            >
              {tab.label}
            </Text>
            <View
              style={{
                marginTop: spacing.xs,
                height: 4,
                width: 28,
                borderRadius: 2,
                backgroundColor:
                  activeSegment === tab.key ? colors.text.primary : 'transparent',
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

