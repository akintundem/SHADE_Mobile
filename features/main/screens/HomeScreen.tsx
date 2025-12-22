import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeHeader } from '../../event-dashboard/Home/components/HomeHeader';
import { EventsList } from '../../event-dashboard/Home/components/EventsList';
import { SafeAreaWrapper } from '../../../common/components/SafeAreaWrapper';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { User } from '../../../core/auth/types/auth';
import { EventItem } from '../../event-dashboard/Home/components/EventCard';

type Props = {
  user: User;
  events?: EventItem[];
  onCreateEvent?: () => void;
  onOpenMenu?: () => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function HomeScreen({
  user,
  events = [],
  onCreateEvent,
  onOpenMenu,
  onOpenCamera,
  onOpenGallery,
}: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const handleEventPress = (event: EventItem) => {
    navigation.navigate('EventProfile', {
      eventId: event.id,
      title: event.title,
      imageUrl: event.imageUrl,
      description: event.description,
      status: event.status,
    });
  };

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: colors.background }}>
          <HomeHeader user={user} onOpenMenu={onOpenMenu} onOpenCamera={onOpenCamera} onOpenGallery={onOpenGallery} />
        </View>

        <EventsList
          events={events}
          onCreateEvent={onCreateEvent}
          showCreateAction={true}
          onEventPress={handleEventPress}
        />
      </View>
    </SafeAreaWrapper>
  );
}
