import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarClock,
  ClipboardList,
  ImageIcon,
  Layers,
  QrCode,
  Share2,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../shared/services/eventService';
import { Event } from '../../../../shared/types';

type RouteParams = { eventId: string };

type ManageFeature = {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  screen: string;
};

const FEATURES: ManageFeature[] = [
  { key: 'share', title: 'Sharing', description: 'Invitations, links, social posts', icon: Share2, screen: 'EventManageShare' },
  { key: 'qr', title: 'QR Code', description: 'Check-in codes & access', icon: QrCode, screen: 'EventManageQRCode' },
  { key: 'capacity', title: 'Capacity', description: 'Seats, limits, registration window', icon: Users, screen: 'EventManageCapacity' },
  { key: 'visibility', title: 'Visibility & Status', description: 'Public/private & lifecycle actions', icon: ShieldCheck, screen: 'EventManageVisibility' },
  { key: 'analytics', title: 'Analytics', description: 'Performance & engagement metrics', icon: BarChart3, screen: 'EventManageAnalytics' },
  { key: 'notifications', title: 'Notifications', description: 'Broadcasts & attendee updates', icon: Bell, screen: 'EventManageNotifications' },
  { key: 'reminders', title: 'Reminders', description: 'Schedules & follow-ups', icon: CalendarClock, screen: 'EventManageReminders' },
  { key: 'collaborators', title: 'Collaborators', description: 'Team roles & permissions', icon: UserPlus, screen: 'EventManageCollaborators' },
  { key: 'media', title: 'Media & Assets', description: 'Photos, files, cover image', icon: ImageIcon, screen: 'EventManageMedia' },
  { key: 'integrity', title: 'Validation & Health', description: 'Scorecards, diagnostics, issues', icon: ClipboardList, screen: 'EventManageIntegrity' },
  { key: 'lifecycle', title: 'Duplicate & Archive', description: 'Copies, archive, restore', icon: Layers, screen: 'EventManageLifecycle' },
];

const EventAdminScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    let mounted = true;
    eventService
      .getEvent(params.eventId)
      .then(data => {
        if (mounted) {
          setEvent(data);
        }
      })
      .catch(() => {
        /* ignore errors; console stays usable */
      });
    return () => {
      mounted = false;
    };
  }, [params.eventId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: typography.weight.semibold,
                fontSize: typography.size.lg,
                textTransform: 'uppercase',
              }}
            >
              Event Console
            </Text>
            {event ? (
              <Text numberOfLines={1} style={{ color: colors.text.secondary, fontSize: typography.size.xs, marginTop: 2 }}>
                {event.name}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {FEATURES.map(feature => {
          const Icon = feature.icon;
          return (
            <TouchableOpacity
              key={feature.key}
              onPress={() => navigation.navigate(feature.screen, { eventId: params.eventId })}
              activeOpacity={0.85}
              style={{
                borderWidth: 1,
                borderColor: colors.text.primary,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                backgroundColor: colors.background,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: colors.text.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={22} color={colors.text.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.base }}>
                  {feature.title}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, marginTop: 2 }}>
                  {feature.description}
                </Text>
              </View>
              <ArrowLeft size={18} color={colors.text.secondary} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventAdminScreen;

