import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { EVENT_CATEGORIES } from '../../../../core/events/constants';
import { useCreateEvent } from '../../context';

export function CategorizeStep() {
  const { form, actions } = useCreateEvent();

  return (
    <ScrollView>
      <View className="px-lg pt-xl pb-[120px]">
        <View className="mb-xl">
          <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary mb-xs">
            Categorize
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
            Help people find your event
          </Text>
        </View>

        <View className="mb-xl">
          <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-md">
            Event Category
          </Text>
          <View className="flex-row flex-wrap gap-md">
            {EVENT_CATEGORIES.map((category) => {
              const isSelected = form.selectedEventType === category.value;
              return (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => actions.setSelectedEventType(category.value)}
                  activeOpacity={0.7}
                  className={`w-[47%] h-14 rounded-lg border items-center justify-center ${
                    isSelected
                      ? 'bg-neutral-black dark:bg-neutral-white border-neutral-black dark:border-neutral-white'
                      : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      isSelected
                        ? 'text-neutral-white dark:text-neutral-black'
                        : 'text-txt-primary dark:text-txt-dark-primary'
                    }`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
