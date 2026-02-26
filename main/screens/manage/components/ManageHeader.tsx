import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Tab = 'hosting' | 'attending';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function ManageHeader({ activeTab, onTabChange }: Props) {
  return (
    <View className="px-lg pt-xl pb-sm bg-light-background dark:bg-dark-background">
      <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.4px]">
        Activity
      </Text>
      <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
        Your events and upcoming plans
      </Text>
      <View className="flex-row mt-lg gap-xs">
        {(['hosting', 'attending'] as Tab[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
              className={`px-md py-[6px] rounded-full ${isActive ? 'bg-txt-primary dark:bg-txt-dark-primary' : 'bg-light-surface dark:bg-dark-surface'}`}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-txt-inverse dark:text-txt-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
                {tab === 'hosting' ? 'Hosting' : 'Attending'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
