import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Archive } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventName: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
};

export function ArchiveEventModal({
  visible,
  eventName,
  isLoading = false,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const [reason, setReason] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isLoading || localLoading;

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    setLocalLoading(true);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason('');
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLocalLoading(false);
    }
  }, [loading, onClose, onConfirm, reason]);

  const handleClose = useCallback(() => {
    if (loading) return;
    setReason('');
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
              {t('ArchiveEvent')}
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

          <View className="flex-1 p-xl">
            {/* Warning */}
            <View className="flex-row items-start gap-md rounded-lg p-lg mb-2xl bg-semantic-warning-light dark:bg-semantic-warning/20">
              <Archive size={20} color={colors.semantic.warning} strokeWidth={2} />
              <View className="flex-1">
                <Text className="text-sm font-semibold mb-xs text-semantic-warning">
                  {t('ArchiveWarningTitle')}
                </Text>
                <Text className="text-sm leading-[18px] text-semantic-warning">
                  {t('ArchiveWarningMessage', { eventName })}
                </Text>
              </View>
            </View>

            {/* Reason Input */}
            <Text
              className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm"
            >
              {t('ArchiveReason')} <Text className="text-txt-tertiary dark:text-txt-dark-tertiary">({t('Optional')})</Text>
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={t('ArchiveReasonPlaceholder')}
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={3}
              editable={!loading}
              className="rounded-lg bg-light-surface dark:bg-dark-surface-elevated px-[14px] py-[14px] text-base text-txt-primary dark:text-txt-dark-primary min-h-[100px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

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
              className="flex-1 items-center rounded-lg py-[14px] bg-semantic-warning"
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text className="text-base font-semibold text-txt-inverse">
                  {t('Archive')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
