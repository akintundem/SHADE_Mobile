import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';

type ActionSheetOption = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  destructive?: boolean;
  disabled?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
  onSelect: (optionId: string) => void;
  onCancel: () => void;
};

export function ActionSheet({
  visible,
  title,
  message,
  options,
  cancelLabel = 'Cancel',
  onSelect,
  onCancel,
}: Props) {
  const { colors } = useTheme();

  const getTextColorClasses = (option: ActionSheetOption) => {
    if (option.disabled) {
      return 'text-txt-disabled dark:text-txt-dark-tertiary';
    }
    if (option.destructive) {
      return 'text-semantic-error';
    }
    return 'text-txt-primary dark:text-txt-dark-primary';
  };

  const getIconColor = (option: ActionSheetOption) => {
    if (option.disabled) {
      return colors.text.disabled;
    }
    if (option.destructive) {
      return colors.semantic.error;
    }
    return colors.text.primary;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 justify-end bg-light-overlay-soft dark:bg-dark-overlay-strong">
          <TouchableWithoutFeedback>
            <SafeAreaView edges={['bottom']}>
              <View className="px-sm pb-sm">
                {/* Options Card */}
                <View className="mb-sm rounded-[14px] overflow-hidden bg-light-background dark:bg-dark-surface-elevated">
                  {/* Header */}
                  {(title || message) && (
                    <View className="items-center border-b border-light-border-muted px-lg py-[14px] dark:border-dark-border-strong">
                      {title && (
                        <Text
                          className="text-sm font-semibold text-center text-txt-tertiary dark:text-txt-dark-tertiary"
                        >
                          {title}
                        </Text>
                      )}
                      {message && (
                        <Text
                          className={`text-xs text-center text-txt-tertiary dark:text-txt-dark-tertiary ${title ? 'mt-xs' : ''}`}
                        >
                          {message}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Options */}
                  <ScrollView
                    className="max-h-[300px]"
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {options.map((option, index) => {
                      const Icon = option.icon;

                      return (
                        <TouchableOpacity
                          key={option.id}
                          onPress={() => {
                            if (!option.disabled) {
                              onSelect(option.id);
                            }
                          }}
                          disabled={option.disabled}
                          activeOpacity={0.6}
                          className={`flex-row items-center justify-center gap-sm py-lg ${index > 0 ? 'border-t border-light-border-muted dark:border-dark-border-strong' : ''}`}
                        >
                          {Icon && (
                            <Icon size={20} color={getIconColor(option)} strokeWidth={2} />
                          )}
                          <Text className={`text-lg font-normal ${getTextColorClasses(option)}`}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={onCancel}
                  activeOpacity={0.6}
                  className="rounded-[14px] py-lg items-center bg-light-background dark:bg-dark-surface-elevated"
                >
                  <Text
                    className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary"
                  >
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
