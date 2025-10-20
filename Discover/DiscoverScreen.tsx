import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
type ManageItem = { id: string; title: string; date: string; location: string; imageUrl: string; description?: string };
import { ManageEventCard } from './components/ManageEventCard';
import { TopBar } from './components/TopBar';
import { TabBar } from '../Home/components/TabBar';
import { User } from '../types';
 
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';

type Props = {
  user: User;
  trending?: ManageItem[];
  recent?: ManageItem[];
  onTabChange?: (tab: 'home' | 'discover' | 'profile') => void;
  onCreateEvent?: () => void;
};

export default function DiscoverScreen({ user, trending = [], recent = [], onTabChange, onCreateEvent }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TopBar onCreate={onCreateEvent} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Manage events only */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.lg }}>
          {/* Empty state */}
          {trending.length === 0 && (
            <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['2xl'] }}>
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>{t('NoEventsYet')}</Text>
              <Text style={{ color: colors.text.secondary }}>{t('StartByCreatingEvent')}</Text>
              <View style={{ height: spacing.lg }} />
              <TouchableOpacity onPress={onCreateEvent} activeOpacity={0.9} style={{ backgroundColor: colors.primary }}>
                <View style={{ backgroundColor: colors.primary }}>
                  <View style={{ backgroundColor: colors.primary }} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {(trending).slice(0, 3).map((item, idx) => (
            <ManageEventCard
              key={item.id}
              title={item.title}
              date={item.date}
              location={item.location}
              imageUrl={item.imageUrl}
              progress={25 + idx * 15}
              collaborators={idx * 3}
              onOpen={() => {}}
              onInvite={() => {}}
            />
          ))}

          <Text style={{ color: colors.text.secondary, fontWeight: typography.weight.semibold, marginTop: spacing.md }}>{t('Drafts')}</Text>
          {(recent).slice(0, 2).map(item => (
            <ManageEventCard
              key={item.id}
              title={`Draft: ${item.title}`}
              date={item.date}
              location={item.location}
              imageUrl={item.imageUrl}
              progress={10}
              collaborators={0}
              onOpen={() => {}}
              onInvite={() => {}}
            />
          ))}
        </View>
      </ScrollView>

      <TabBar active="discover" onChange={onTabChange} />
    </SafeAreaView>
  );
}
