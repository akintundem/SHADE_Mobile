import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Bell, ChevronRight, ImageIcon, Layers, ShieldCheck, UserPlus, Users } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { eventService } from '../../../../core/events/services';
import { Event } from '../../../../core/events/types';

type RouteParams = { eventId: string };

type ManageFeature = {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  screen: string;
};

const FEATURES: ManageFeature[] = [
  { key: 'capacity', title: 'Capacity', description: 'Seats, limits, registration window', icon: Users, screen: 'EventManageCapacity' },
  { key: 'visibility', title: 'Visibility & Status', description: 'Public/private & lifecycle actions', icon: ShieldCheck, screen: 'EventManageVisibility' },
  { key: 'notifications', title: 'Notifications & Reminders', description: 'Broadcasts, updates & scheduled reminders', icon: Bell, screen: 'EventManageNotifications' },
  { key: 'collaborators', title: 'Collaborators', description: 'Team roles & permissions', icon: UserPlus, screen: 'EventManageCollaborators' },
  { key: 'lifecycle', title: 'Archive', description: 'Archive event', icon: Layers, screen: 'EventManageLifecycle' },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.surface,
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
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.lg,
                letterSpacing: -0.3,
              }}
            >
              Event Console
            </Text>
            {event ? (
              <Text numberOfLines={1} style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginTop: 1, fontFamily: typography.family.medium }}>
                {event.name}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
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
              activeOpacity={0.7}
              style={{
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                backgroundColor: colors.cardElevated,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} color={colors.text.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  color: colors.text.primary, 
                  fontWeight: typography.weight.semibold, 
                  fontSize: typography.size.base,
                  fontFamily: typography.family.semibold
                }}>
                  {feature.title}
                </Text>
                <Text style={{ color: colors.text.tertiary, fontSize: typography.size.sm, marginTop: 1 }}>
                  {feature.description}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventAdminScreen;

