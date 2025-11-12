import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { CalendarClock, MapPin } from 'lucide-react-native';

type Props = {
  title: string;
  host: string;
  date: string;
  location: string;
  imageUrl: string;
  onRequest?: () => void;
};

export const InviteCard = ({ title, host, date, location, imageUrl, onRequest }: Props) => {
  const { colors, spacing, borderRadius, typography, brand, shadows } = useTheme();

  return (
    <View style={{ borderRadius: borderRadius.xl, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, ...shadows.sm }}>
      <Image source={{ uri: imageUrl }} style={{ height: 160, width: '100%' }} resizeMode="cover" />
      <View style={{ padding: spacing.lg }}>
        <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }} numberOfLines={1}>{title}</Text>
        <Text style={{ color: colors.text.secondary, marginTop: 2 }} numberOfLines={1}>Host · {host}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
          <CalendarClock size={16} color={brand.primary} />
          <Text style={{ color: colors.text.primary, fontSize: typography.size.sm }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
          <MapPin size={16} color={brand.primary} />
          <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, flex: 1 }}>{location}</Text>
        </View>

        <TouchableOpacity onPress={onRequest} activeOpacity={0.9} style={{ marginTop: spacing.md, alignSelf: 'flex-start', backgroundColor: brand.primary, borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
          <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>Request Invite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


