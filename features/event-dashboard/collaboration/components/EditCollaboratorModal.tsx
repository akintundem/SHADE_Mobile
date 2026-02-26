import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown, Save, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { collaborationService } from '../../../../core/collaboration/services/collaboration';
import {
  EventCollaboratorResponse,
  EventCollaboratorRequest,
  EventPermission,
  EventUserType,
} from '../../../../core/collaboration/types/collaboration';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  collaborator: EventCollaboratorResponse | null;
  onClose: () => void;
  onSuccess: () => void;
};

const ROLE_OPTIONS: EventUserType[] = [
  EventUserType.ORGANIZER,
  EventUserType.COORDINATOR,
  EventUserType.COLLABORATOR,
  EventUserType.STAFF,
  EventUserType.VOLUNTEER,
  EventUserType.SPEAKER,
  EventUserType.SPONSOR,
  EventUserType.MEDIA,
];

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export function EditCollaboratorModal({ visible, eventId, collaborator, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const text = colors.text;

  const [selectedRole, setSelectedRole] = useState<EventUserType>(EventUserType.COLLABORATOR);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<EventPermission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && collaborator) {
      setSelectedRole(collaborator.role);
      setSelectedPermissions(collaborator.permissions || []);
      setShowRolePicker(false);
      setIsSubmitting(false);
      setError(null);
    }
  }, [visible, collaborator]);

  const roleOptions = useMemo(
    () => ROLE_OPTIONS.map(role => ({ value: role, label: formatEnumLabel(role) })),
    []
  );

  const permissionOptions = useMemo(() => Object.values(EventPermission), []);

  const togglePermission = useCallback((permission: EventPermission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    );
  }, []);

  const hasChanges = useMemo(() => {
    if (!collaborator) return false;
    if (selectedRole !== collaborator.role) return true;
    const original = [...(collaborator.permissions || [])].sort();
    const current = [...selectedPermissions].sort();
    if (original.length !== current.length) return true;
    return original.some((p, i) => p !== current[i]);
  }, [collaborator, selectedRole, selectedPermissions]);

  const handleSave = useCallback(async () => {
    if (!eventId || !collaborator || !hasChanges) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedPermissions.length) {
        setError(t('SelectAtLeastOnePermission'));
        setIsSubmitting(false);
        return;
      }

      const request: EventCollaboratorRequest = {
        userId: collaborator.userId,
        role: selectedRole,
        permissions: selectedPermissions,
      };

      await collaborationService.updateCollaborator(eventId, collaborator.collaboratorId, request);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToUpdateCollaborator'));
      ErrorHandler.handle(err, 'updateCollaborator');
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, collaborator, hasChanges, selectedRole, selectedPermissions, t, onSuccess, onClose]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);
  const name = collaborator?.userName || collaborator?.email || t('Collaborator');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('EditCollaborator')}
              </Text>
              <TouchableOpacity
                onPress={onClose}
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
                  {t('Collaborator')}
                </Text>
                <View className="flex-row items-center rounded-lg px-md py-md bg-light-surface-muted dark:bg-dark-surface-soft border border-light-border-muted dark:border-dark-border-muted">
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {name}
                  </Text>
                  {collaborator?.email && collaborator?.userName ? (
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary ml-sm">
                      {collaborator.email}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Role')} *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRolePicker(!showRolePicker)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between rounded-lg px-md py-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {formatEnumLabel(selectedRole)}
                  </Text>
                  <ChevronDown size={18} color={text.tertiary} strokeWidth={2} />
                </TouchableOpacity>

                {showRolePicker && (
                  <View className="mt-xs rounded-lg border border-light-border dark:border-dark-border overflow-hidden bg-light-surface-elevated dark:bg-dark-surface-elevated">
                    {roleOptions.map((option, index) => {
                      const isSelected = option.value === selectedRole;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => {
                            setSelectedRole(option.value);
                            setShowRolePicker(false);
                          }}
                          className={`px-md py-md ${isSelected ? (isDark ? 'bg-neutral-white/5' : 'bg-light-surface-subtle') : ''} ${
                            index === roleOptions.length - 1
                              ? ''
                              : 'border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle'
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              isSelected
                                ? 'text-txt-primary dark:text-txt-dark-primary font-semibold'
                                : 'text-txt-secondary dark:text-txt-dark-secondary font-medium'
                            }`}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View className="mb-xl">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                  {t('Permissions')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-md">
                  {t('PermissionsHint')}
                </Text>

                <View className="rounded-lg border p-sm bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border-muted dark:border-dark-border-subtle">
                  <View className="flex-row flex-wrap gap-sm">
                    {permissionOptions.map(permission => {
                      const isSelected = selectedPermissions.includes(permission);
                      return (
                        <TouchableOpacity
                          key={permission}
                          onPress={() => togglePermission(permission)}
                          activeOpacity={0.85}
                          className={`rounded-md px-md py-sm border w-[48%] min-h-[56px] justify-between ${
                            isSelected
                              ? isDark
                                ? 'bg-neutral-white/10 border-neutral-white'
                                : 'bg-brand-primary border-brand-primary'
                              : 'bg-light-surface dark:bg-dark-surface-subtle border-light-border dark:border-dark-border'
                          }`}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: isSelected ? text.inverse : text.primary }}
                          >
                            {formatEnumLabel(permission)}
                          </Text>
                          <View className="flex-row items-center gap-xs">
                            <View
                              className={`w-4 h-4 rounded-full border items-center justify-center ${
                                isSelected
                                  ? 'bg-neutral-white border-neutral-white dark:bg-neutral-black dark:border-neutral-black'
                                  : 'bg-transparent border-light-border dark:border-dark-border'
                              }`}
                            >
                              {isSelected && (
                                <Check size={12} color={text.primary} strokeWidth={2.5} />
                              )}
                            </View>
                            <Text
                              className="text-xs"
                              style={{ color: isSelected ? text.inverse : text.tertiary }}
                              numberOfLines={1}
                            >
                              {t('TapToSelect')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSave}
                  disabled={isSubmitting || !hasChanges}
                  leftIcon={<Save size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? `${t('Saving')}...` : t('SaveChanges')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
