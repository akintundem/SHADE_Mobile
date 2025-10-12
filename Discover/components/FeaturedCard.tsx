import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import { CalendarClock, MapPin, Star } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type FeaturedItem = {
  id: string;
  title: string;
  subtitle?: string; // one-line subtext
  date: string;
  location: string;
  imageUrl: string;
};

type Props = { item: FeaturedItem };

export const FeaturedCard = ({ item }: Props) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  return (
    <View style={{ borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
      <ImageBackground source={{ uri: item.imageUrl }} style={{ height: 190 }}>
        {/* Global overlay for readability */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />

        {/* Content */}
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'flex-end' }}>
          {/* Featured pill */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: '#FFFFFF', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999 }}>
              <Star size={14} color={colors.text.primary} fill={colors.text.primary} />
              <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>Featured</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={{ marginTop: spacing.md, color: '#FFFFFF', fontSize: typography.size.xl, fontWeight: typography.weight.bold, letterSpacing: -0.2 }} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Subtitle */}
          {item.subtitle ? (
            <Text style={{ marginTop: spacing.xs, color: 'rgba(255,255,255,0.85)', fontSize: typography.size.sm }} numberOfLines={2}>
              {item.subtitle}
            </Text>
          ) : null}

          {/* Meta */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['lg'], marginTop: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <CalendarClock size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs }}>{item.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <MapPin size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs }}>{item.location}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};


