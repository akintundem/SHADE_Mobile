import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { CalendarClock, MapPin, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { EventStatus } from '../../types/events';

type Props = {
  eventId: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  progress?: number; // 0 - 100
  collaborators?: number;
  status?: EventStatus;
  capacity?: { current: number; total: number };
  analytics?: { views: number; registrations: number };
  onOpen?: () => void;
  onInvite?: () => void;
  onRefresh?: () => void;
};

export const ManageEventCard = ({
  eventId,
  title,
  date,
  location,
  imageUrl,
  progress = 35,
  collaborators = 0,
  status,
  capacity,
  analytics,
  onOpen,
  onInvite,
  onRefresh
}: Props) => {
  const { colors, spacing, borderRadius, typography, brand, shadows } = useTheme();
  const navigation = useNavigation<any>();

  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View style={{ borderRadius: borderRadius.xl, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, ...shadows.sm, marginBottom: spacing.lg }}>
      <Image source={{ uri: imageUrl }} style={{ height: 140, width: '100%' }} resizeMode="cover" />
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }} numberOfLines={1}>{title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <CalendarClock size={16} color={brand.primary} />
          <Text style={{ color: colors.text.primary, fontSize: typography.size.sm }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <MapPin size={16} color={brand.primary} />
          <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, flex: 1 }}>{location}</Text>
        </View>

        {/* Progress */}
        <View style={{ marginTop: spacing.sm }}>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            <View style={{ width: `${clamped}%`, height: '100%', backgroundColor: brand.primary }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs }}>
            <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>{clamped}% planned</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Users size={14} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>{collaborators}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.navigate('EventManage', { id: eventId, title, date, location, imageUrl })} activeOpacity={0.9} style={{ flex: 1, backgroundColor: brand.primary, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', height: 40 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onInvite} activeOpacity={0.9} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', height: 40 }}>
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>Invite</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
