import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { Venue } from '../types';

type Props = {
  venue: Venue | null;
  locationSearchQuery: string;
  isGettingLocation: boolean;
  onVenueChange: (venue: Venue | null) => void;
  onLocationSearchChange: (query: string) => void;
  onGettingLocationChange: (isGetting: boolean) => void;
};

export function LocationStep(_: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing['3xl'],
      }}
    >
      <View style={{ gap: spacing.sm }}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.size['2xl'],
            fontWeight: typography.weight.bold,
          }}
        >
          Event Location
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
          }}
        >
          Location selection is currently disabled.
        </Text>
      </View>
    </ScrollView>
  );
}
