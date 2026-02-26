import React from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { useCreateEvent } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';

export function EventBasicsStep() {
  const { form, actions, validation } = useCreateEvent();
  const { colors } = useTheme();
  const placeholderColor = colors.text.tertiary;

  const titleError = validation.getFieldError('title');
  const descriptionError = validation.getFieldError('description');

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="px-lg pt-xl pb-[120px]">
        <View className="mb-xl">
          <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary mb-xs">
            Event Basics
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
            Let's start with the essentials
          </Text>
        </View>

        <View className="gap-lg">
          <View>
            <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-sm">
              Event Name
            </Text>
            <TextInput
              placeholder="Give your event a name..."
              placeholderTextColor={placeholderColor}
              value={form.title}
              onChangeText={(text) => {
                actions.setTitle(text);
                validation.validateField('title', text);
              }}
              onBlur={() => validation.setFieldTouched('title')}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-md py-md text-base text-txt-primary dark:text-txt-dark-primary min-h-[48px]"
            />
            {titleError ? (
              <Text className="text-semantic-error text-xs mt-xs">
                {titleError}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-sm">
              Description
            </Text>
            <TextInput
              placeholder="Describe your event..."
              placeholderTextColor={placeholderColor}
              multiline
              numberOfLines={6}
              value={form.description}
              onChangeText={(text) => {
                actions.setDescription(text);
                validation.validateField('description', text);
              }}
              onBlur={() => validation.setFieldTouched('description')}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-md py-md text-base text-txt-primary dark:text-txt-dark-primary min-h-[120px]"
              textAlignVertical="top"
            />
            {descriptionError ? (
              <Text className="text-semantic-error text-xs mt-xs">
                {descriptionError}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
