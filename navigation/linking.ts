import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['shade://', 'https://shade.app'],
  config: {
    screens: {
      AcceptInviteByToken: 'invite/:token',
      EventFeeds: 'event/:eventId/feeds',
      EventAdmin: 'event/:eventId',
      PublicProfile: 'profile/:userId',
      MainTabs: '',
    },
  },
};
