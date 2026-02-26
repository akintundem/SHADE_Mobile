import React from 'react';
import { Text, View } from 'react-native';
import { Calendar, Tag, Users } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  upcomingCount: number;
  activeCount: number;
  totalAttendees: number;
};

export function HostingSummaryChips({ upcomingCount, activeCount, totalAttendees }: Props) {
  const { colors } = useTheme();

  if (upcomingCount === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-sm mb-lg">
      <View className="flex-row items-center gap-xs px-md py-xs rounded-full bg-light-surface dark:bg-dark-surface">
        <Calendar size={12} color={colors.text.secondary} strokeWidth={2} />
        <Text className="text-xs font-semibold text-txt-secondary dark:text-txt-dark-secondary">
          {upcomingCount} upcoming
        </Text>
      </View>
      {activeCount > 0 && (
        <View className="flex-row items-center gap-xs px-md py-xs rounded-full bg-semantic-success/10">
          <Tag size={12} color={colors.semantic.success} strokeWidth={2} />
          <Text className="text-xs font-semibold text-semantic-success">{activeCount} active</Text>
        </View>
      )}
      {totalAttendees > 0 && (
        <View className="flex-row items-center gap-xs px-md py-xs rounded-full bg-light-surface dark:bg-dark-surface">
          <Users size={12} color={colors.text.secondary} strokeWidth={2} />
          <Text className="text-xs font-semibold text-txt-secondary dark:text-txt-dark-secondary">
            {totalAttendees} attendees
          </Text>
        </View>
      )}
    </View>
  );
}
