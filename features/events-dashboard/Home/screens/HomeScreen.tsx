import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaWrapper } from '../../../../common/components/SafeAreaWrapper';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { eventService } from '../../../../core/events/services/event';
import { EventResponse } from '../../../../core/events/types';
import LoadingState from '../../../../common/components/LoadingState';
import { EventsList } from '../components/EventsList';
import { convertEventsToItems } from '../utils/eventUtils';

const { width } = Dimensions.get('window');

type Props = {
  user: any;
  onCreateEvent?: () => void;
  onOpenMenu?: () => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
};
export default function HomeScreen({ user }: Props) {

  const { colors, spacing, typography } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allEvents, setAllEvents] = useState<EventResponse[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const publicEvents = await eventService.listEvents({ size: 20 });
      setAllEvents(publicEvents.content);
    } catch (error) {
      console.error('Failed to load discovery data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const eventItems = convertEventsToItems(allEvents);

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
          backgroundColor: colors.background,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            letterSpacing: -1,
          }}>
            Shade
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['6xl'] }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.primary} />
          }
        >
          <View style={{ marginTop: spacing.md }}>
            <EventsList
              events={eventItems}
              isLoading={loading}
              emptyState={{ 
                title: "No events found", 
                subtitle: "Check back later for more events!" 
              }}
            />
          </View>
        </ScrollView>
      </View>

    </SafeAreaWrapper>
  );
}
