import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { ArrowLeft, Wallet, Store, UsersRound, Gift, ClipboardCheck, CalendarCheck, MapPin, CalendarClock } from 'lucide-react-native';

type RouteParams = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
};

type Props = {
  route: { params: RouteParams };
};

export default function EventManageScreen({ route }: Props) {
  const { id, title, date, location, imageUrl } = route.params;
  const { colors, spacing, borderRadius, typography, brand } = useTheme();
  const { t } = useI18n();
  const [tab, setTab] = useState<'budget' | 'vendors' | 'guests' | 'wishlist' | 'tasks' | 'rsvp'>('budget');

  const TabButton = ({ keyTab, label, Icon }: { keyTab: typeof tab; label: string; Icon: any }) => (
    <TouchableOpacity
      onPress={() => setTab(keyTab)}
      activeOpacity={0.9}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: tab === keyTab ? brand.primary : 'transparent' }}
    >
      <Icon size={14} color={tab === keyTab ? '#FFFFFF' : colors.text.secondary} />
      <Text style={{ color: tab === keyTab ? '#FFFFFF' : colors.text.secondary, fontWeight: tab === keyTab ? typography.weight.semibold : typography.weight.medium, fontSize: typography.size.xs }}>{label}</Text>
    </TouchableOpacity>
  );

  const Section = ({ titleText, children }: { titleText: string; children?: React.ReactNode }) => (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>{titleText}</Text>
      <View style={{ marginTop: spacing.md }}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>{t('Manage')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['2xl'] }}>
        {/* Event hero */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <View style={{ borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 160 }} />
          </View>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size['2xl'], marginTop: spacing.md }}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <CalendarClock size={16} color={brand.primary} />
            <Text style={{ color: colors.text.secondary }}>{date}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
            <MapPin size={16} color={brand.primary} />
            <Text style={{ color: colors.text.secondary }}>{location}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            <TabButton keyTab="budget" label={t('Budget')} Icon={Wallet} />
            <TabButton keyTab="vendors" label={t('Vendors')} Icon={Store} />
            <TabButton keyTab="guests" label={t('GuestList')} Icon={UsersRound} />
            <TabButton keyTab="wishlist" label={t('Wishlist')} Icon={Gift} />
            <TabButton keyTab="tasks" label={t('Tasks')} Icon={ClipboardCheck} />
            <TabButton keyTab="rsvp" label={t('RSVP')} Icon={CalendarCheck} />
          </ScrollView>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          {tab === 'budget' && (
            <Section titleText={t('BudgetSubtitle')}>
              <Text style={{ color: colors.text.tertiary }}>{t('BudgetSubtitle')}</Text>
            </Section>
          )}
          {tab === 'vendors' && (
            <Section titleText={t('VendorsSubtitle')}>
              <Text style={{ color: colors.text.tertiary }}>{t('VendorsSubtitle')}</Text>
            </Section>
          )}
          {tab === 'guests' && (
            <Section titleText={t('GuestListSubtitle')}>
              <Text style={{ color: colors.text.tertiary }}>{t('GuestListSubtitle')}</Text>
            </Section>
          )}
          {tab === 'wishlist' && (
            <Section titleText={t('WishlistSubtitle')}>
              <Text style={{ color: colors.text.tertiary }}>{t('WishlistSubtitle')}</Text>
            </Section>
          )}
          {tab === 'tasks' && (
            <Section titleText={t('TasksSubtitle')}>
              <Text style={{ color: colors.text.tertiary }}>{t('TasksSubtitle')}</Text>
            </Section>
          )}
          {tab === 'rsvp' && (
            <Section titleText={t('RSVPSubtitle')}>
              <Text style={{ color: colors.text.tertiary }}>{t('RSVPSubtitle')}</Text>
            </Section>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


