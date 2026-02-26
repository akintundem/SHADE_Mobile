import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, HelpCircle, Send, X, XCircle } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import { AttendeeResponse, AttendeeStatus, BulkRsvpUpdateItem } from '../../../../core/attendee/types/attendee';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  selectedAttendees: AttendeeResponse[];
  onClose: () => void;
  onSuccess: () => void;
};

type StatusOption = {
  status: AttendeeStatus;
  label: string;
  icon: typeof CheckCircle;
  tone: 'success' | 'warning' | 'error';
};

export function BulkRsvpUpdateModal({
  visible,
  eventId,
  selectedAttendees,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [selectedStatus, setSelectedStatus] = useState<AttendeeStatus | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setSelectedStatus(null);
    setNote('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const statusOptions: StatusOption[] = [
    {
      status: AttendeeStatus.CONFIRMED,
      label: t('Confirmed'),
      icon: CheckCircle,
      tone: 'success',
    },
    {
      status: AttendeeStatus.TENTATIVE,
      label: t('Tentative'),
      icon: HelpCircle,
      tone: 'warning',
    },
    {
      status: AttendeeStatus.DECLINED,
      label: t('Declined'),
      icon: XCircle,
      tone: 'error',
    },
  ];

  const handleSubmit = useCallback(async () => {
    if (!selectedStatus) {
      setError(t('SelectRSVPStatus'));
      return;
    }

    if (selectedAttendees.length === 0) {
      setError(t('SelectAtLeastOneAttendee'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updates: BulkRsvpUpdateItem[] = selectedAttendees.map(attendee => ({
        attendeeId: attendee.id,
        status: selectedStatus,
      }));

      await attendeeService.bulkUpdateRsvpStatus(eventId, {
        updates,
        note: note.trim() || null,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToUpdateRSVPStatus'));
      ErrorHandler.handle(err, 'bulkUpdateRsvpStatus');
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, selectedAttendees, selectedStatus, note, t, resetForm, onSuccess, onClose]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('BulkUpdateRSVP')}
                </Text>
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {t('SelectedAttendeesCount', { count: selectedAttendees.length })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-xl" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {error && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">
                    {error}
                  </Text>
                </View>
              )}

              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('RSVPStatus')} *
                </Text>
                <View className="flex-row flex-wrap gap-sm">
                  {statusOptions.map((option) => {
                    const isSelected = selectedStatus === option.status;
                    const Icon = option.icon;
                    const toneClasses = option.tone === 'success'
                      ? {
                          bg: 'bg-semantic-success-light dark:bg-semantic-success/20',
                          border: 'border-semantic-success',
                          text: 'text-semantic-success',
                          color: colors.semantic.success,
                        }
                      : option.tone === 'warning'
                      ? {
                          bg: 'bg-semantic-warning-light dark:bg-semantic-warning/20',
                          border: 'border-semantic-warning',
                          text: 'text-semantic-warning',
                          color: colors.semantic.warning,
                        }
                      : {
                          bg: 'bg-semantic-error-light dark:bg-semantic-error/20',
                          border: 'border-semantic-error',
                          text: 'text-semantic-error',
                          color: colors.semantic.error,
                        };
                    return (
                      <TouchableOpacity
                        key={option.status}
                        onPress={() => setSelectedStatus(option.status)}
                        activeOpacity={0.7}
                        className={`flex-row items-center px-md py-sm rounded-lg border ${
                          isSelected
                            ? `${toneClasses.bg} ${toneClasses.border}`
                            : 'bg-transparent border-light-border-strong dark:border-dark-border-strong'
                        }`}
                      >
                        <Icon size={16} color={isSelected ? toneClasses.color : text.tertiary} strokeWidth={2.5} />
                        <Text
                          className="ml-sm text-sm font-medium"
                          style={{ color: isSelected ? toneClasses.color : text.primary }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="mb-xl">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Note')} ({t('Optional')})
                </Text>
                <View className="rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={t('AddNoteOptional')}
                    placeholderTextColor={text.tertiary}
                    multiline
                    className="text-sm text-txt-primary dark:text-txt-dark-primary min-h-[80px] py-md"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>
              </View>

              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !selectedStatus || selectedAttendees.length === 0}
                  leftIcon={<Send size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Updating') : t('UpdateRSVPStatus')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
