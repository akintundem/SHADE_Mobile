import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';

export type SegmentType = 'forYou' | 'following';

type Tab = {
  key: SegmentType;
  label: string;
};

type Props = {
  activeSegment: SegmentType;
  onSegmentChange: (segment: SegmentType) => void;
};

export const EventSegmentedControl = ({ activeSegment, onSegmentChange }: Props) => {
  const { t } = useI18n();
  const tabs = useMemo<Tab[]>(
    () => [
      { key: 'forYou', label: t('ForYou') },
      { key: 'following', label: t('Following') },
    ],
    [t]
  );

  return (
    <View className="px-xl mt-md">
      <View className="flex-row justify-between">
        {tabs.map(tab => {
          const isActive = activeSegment === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSegmentChange(tab.key)}
              activeOpacity={0.7}
              className="flex-1 items-center py-md"
            >
              <Text
                className={
                  isActive
                    ? 'text-base font-semibold text-txt-primary dark:text-txt-dark-primary'
                    : 'text-base font-medium text-txt-tertiary dark:text-txt-dark-tertiary'
                }
              >
                {tab.label}
              </Text>
              <View
                className={
                  isActive ? 'mt-xs h-1 w-7 rounded-full bg-neutral-black dark:bg-neutral-white' : 'mt-xs h-1 w-7 rounded-full bg-transparent'
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
