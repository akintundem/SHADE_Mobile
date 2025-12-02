import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, RefreshCcw, BarChart3 } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { eventService } from '../../../services/eventService';
import { EventAnalyticsResponse } from '../../../../../common/types';

type RouteParams = { eventId: string };

const ManageAnalyticsScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [analytics, setAnalytics] = useState<EventAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getEventAnalytics(params.eventId);
      setAnalytics(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load analytics at this time.');
    } finally {
      setLoading(false);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
              textTransform: 'uppercase',
            }}
          >
            Event Analytics
          </Text>
        </View>
        <TouchableOpacity onPress={load} disabled={loading} style={{ padding: spacing.xs }}>
          <RefreshCcw size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
      >
        {analytics ? (
          <>
            <AnalyticsCard
              title="Reach"
              items={[
                { label: 'Total views', value: analytics.totalViews },
                { label: 'Unique visitors', value: analytics.uniqueVisitors },
              ]}
            />
            <AnalyticsCard
              title="Conversion"
              items={[
                { label: 'Registration rate', value: `${analytics.registrationRate}%` },
                { label: 'Attendance rate', value: `${analytics.attendanceRate}%` },
              ]}
            />
            <AnalyticsCard
              title="Engagement"
              icon={BarChart3}
              items={[
                { label: 'Average time on page', value: `${analytics.engagementMetrics?.averageTimeOnPage ?? '—'} sec` },
                { label: 'Bounce rate', value: `${analytics.engagementMetrics?.bounceRate ?? '—'}%` },
              ]}
            />
            {analytics.socialMetrics ? (
              <AnalyticsCard
                title="Social"
                items={Object.entries(analytics.socialMetrics).map(([label, value]) => ({
                  label,
                  value: String(value),
                }))}
              />
            ) : null}
            {analytics.geographicDistribution ? (
              <AnalyticsCard
                title="Top Regions"
                items={Object.entries(analytics.geographicDistribution).map(([region, pct]) => ({
                  label: region,
                  value: `${pct}%`,
                }))}
              />
            ) : null}
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>
              Reporting period: {analytics.analyticsPeriod ?? '—'}
            </Text>
          </>
        ) : (
          <Text style={{ color: colors.text.secondary }}>No analytics available yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const AnalyticsCard = ({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: { label: string; value: string | number }[];
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.text.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {Icon ? <Icon size={18} color={colors.text.primary} /> : null}
        <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>{title}</Text>
      </View>
      {items.map(item => (
        <View
          key={item.label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: colors.text.secondary }}>{item.label}</Text>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ManageAnalyticsScreen;

