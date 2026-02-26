import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Copy, Check } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import type { CloneEventRequest } from '../../../../core/events/types/event';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type CloneOption = {
  key: keyof Pick<CloneEventRequest, 'includeTicketTypes' | 'includeCollaborators' | 'includeTasks' | 'includeBudget'>;
  label: string;
  description: string;
};

type Props = {
  visible: boolean;
  eventName: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (options: CloneEventRequest) => Promise<void>;
};

export function CloneEventModal({
  visible,
  eventName,
  isLoading = false,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const [newName, setNewName] = useState('');
  const [options, setOptions] = useState<CloneEventRequest>({
    includeTicketTypes: true,
    includeCollaborators: false,
    includeTasks: true,
    includeBudget: true,
  });
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isLoading || localLoading;

  const cloneOptions: CloneOption[] = [
    {
      key: 'includeTicketTypes',
      label: t('IncludeTicketTypes'),
      description: t('IncludeTicketTypesDesc'),
    },
    {
      key: 'includeCollaborators',
      label: t('IncludeCollaborators'),
      description: t('IncludeCollaboratorsDesc'),
    },
    {
      key: 'includeTasks',
      label: t('IncludeTasks'),
      description: t('IncludeTasksDesc'),
    },
    {
      key: 'includeBudget',
      label: t('IncludeBudget'),
      description: t('IncludeBudgetDesc'),
    },
  ];

  const toggleOption = useCallback((key: CloneOption['key']) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    setLocalLoading(true);
    try {
      const cloneRequest: CloneEventRequest = {
        ...options,
        newName: newName.trim() || undefined,
      };
      await onConfirm(cloneRequest);
      setNewName('');
      setOptions({
        includeTicketTypes: true,
        includeCollaborators: false,
        includeTasks: true,
        includeBudget: true,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLocalLoading(false);
    }
  }, [loading, newName, onClose, onConfirm, options]);

  const handleClose = useCallback(() => {
    if (loading) return;
    setNewName('');
    onClose();
  }, [loading, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-xl py-md">
            <View className="w-8" />
            <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
              {t('CloneEvent')}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
            >
              <X size={18} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <View className="p-xl">
            {/* Info */}
            <View className="flex-row items-start gap-md rounded-lg bg-light-surface dark:bg-dark-surface-elevated p-lg mb-2xl">
              <Copy size={20} color={colors.text.secondary} strokeWidth={2} />
              <View className="flex-1">
                <Text
                  className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs"
                >
                  {t('CloneEventInfo')}
                </Text>
                <Text
                  className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-[18px]"
                >
                  {t('CloneEventInfoDesc', { eventName })}
                </Text>
              </View>
            </View>

            {/* New Name Input */}
            <Text
              className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm"
            >
              {t('NewEventName')} <Text className="text-txt-tertiary dark:text-txt-dark-tertiary">({t('Optional')})</Text>
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={t('CloneEventNamePlaceholder', { eventName })}
              placeholderTextColor={colors.text.secondary}
              editable={!loading}
              className="rounded-lg bg-light-surface dark:bg-dark-surface-elevated px-[14px] py-[14px] text-base text-txt-primary dark:text-txt-dark-primary mb-2xl"
            />

            {/* Clone Options */}
            <Text
              className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-md"
            >
              {t('CloneOptions')}
            </Text>

            {cloneOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                onPress={() => toggleOption(option.key)}
                disabled={loading}
                activeOpacity={0.7}
                className="flex-row items-center rounded-lg bg-light-surface dark:bg-dark-surface-elevated px-[14px] py-[14px] mb-sm"
              >
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]"
                  >
                    {option.label}
                  </Text>
                  <Text
                    className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary"
                  >
                    {option.description}
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-sm items-center justify-center ${
                    options[option.key]
                      ? 'bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success/40'
                      : 'bg-transparent border-[1.5px] border-light-border dark:border-dark-border'
                  }`}
                >
                  {options[option.key] && (
                    <Check size={14} color={colors.semantic.success} strokeWidth={3} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="flex-row gap-md border-t border-light-border-muted p-xl pb-4xl dark:border-dark-border-strong">
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg bg-light-surface dark:bg-dark-surface-elevated py-[14px]"
            >
              <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('Cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg bg-brand-primary py-[14px] dark:bg-neutral-white"
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text className="text-base font-semibold text-txt-inverse dark:text-txt-dark-inverse">
                  {t('CloneEvent')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
