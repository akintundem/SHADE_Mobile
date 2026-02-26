import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Check, ChevronDown, Search, User, UserPlus, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { collaborationService } from '../../../../core/collaboration/services/collaboration';
import {
  EventCollaboratorRequest,
  EventPermission,
  EventUserType,
} from '../../../../core/collaboration/types/collaboration';
import { authService } from '../../../../core/auth/services/authService';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { getDisplayNameFromUser, getHandleFromUser } from '../../../../features/profile/utils/profile';

type Props = {
  visible: boolean;
  eventId: string;
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

type SearchResult = {
  id: string;
  name: string;
  username: string;
};

export function AddCollaboratorModal({ visible, eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const text = colors.text;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<EventUserType>(EventUserType.COLLABORATOR);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<EventPermission[]>([
    EventPermission.VIEW_EVENT,
    EventPermission.MANAGE_CONTENT,
  ]);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSelectedUser(null);
    setSelectedRole(EventUserType.COLLABORATOR);
    setShowRolePicker(false);
    setIsSubmitting(false);
    setSearchResults([]);
    setSelectedPermissions([EventPermission.VIEW_EVENT, EventPermission.MANAGE_CONTENT]);
    setError(null);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        let response;
        try {
          const secureResponse = await authService.searchSecureUsers(debouncedSearchQuery, { page: 0, size: 5 });
          response = {
            content: secureResponse.content?.map(user => ({
              id: user.id,
              name: user.name,
              username: user.username,
              profilePictureUrl: user.profilePictureUrl,
            })) || [],
          };
        } catch (secureErr: unknown) {
          const status = ErrorHandler.getHttpStatus(secureErr);
          if (status === 403 || status === 401) {
            const directoryResponse = await authService.searchDirectory(debouncedSearchQuery, { page: 0, size: 5 });
            response = {
              content: directoryResponse.content || [],
            };
          } else {
            throw secureErr;
          }
        }

        const results: SearchResult[] = (response.content || []).map(user => ({
          id: user.id,
          name: user.name,
          username: user.username,
        }));
        setSearchResults(results);
      } catch (err) {
        ErrorHandler.handle(err, 'searchUsers');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery]);

  const roleOptions = useMemo(
    () => ROLE_OPTIONS.map(role => ({ value: role, label: formatEnumLabel(role) })),
    []
  );

  const permissionOptions = useMemo(() => Object.values(EventPermission), []);

  const handleUserSelect = useCallback((user: SearchResult) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
    setSearchResults([]);
  }, []);

  const togglePermission = useCallback((permission: EventPermission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    );
  }, []);

  const handleSearchChange = useCallback((textValue: string) => {
    setSearchQuery(textValue);
    setSelectedUser(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleAdd = useCallback(async () => {
    if (!eventId || !selectedUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedPermissions.length) {
        setError(t('SelectAtLeastOnePermission'));
        setIsSubmitting(false);
        return;
      }

      const request: EventCollaboratorRequest = {
        userId: selectedUser.id,
        role: selectedRole,
        permissions: selectedPermissions,
      };

      await collaborationService.addCollaborator(eventId, request);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToAddCollaborator'));
      ErrorHandler.handle(err, 'addCollaborator');
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, selectedUser, selectedRole, selectedPermissions, t, resetForm, onSuccess, onClose]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);
  const inputBorderClass = selectedUser
    ? 'border-brand-primary'
    : 'border-light-border-muted dark:border-dark-border-muted';

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
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('AddCollaborator')}
              </Text>
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
                  {t('SearchUser')} *
                </Text>
                <View
                  className={`flex-row items-center rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft ${inputBorderClass}`}
                >
                  <Search size={16} color={text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder={t('SearchByNameOrUsername')}
                    placeholderTextColor={text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {selectedUser && (
                    <View className="rounded-full px-sm py-[2px] bg-light-surface-soft dark:bg-dark-surface-strong">
                      <User size={12} color={text.secondary} strokeWidth={2.5} />
                    </View>
                  )}
                </View>

                {debouncedSearchQuery.length >= 2 && searchResults.length > 0 && !selectedUser && !isSearching && (
                  <View className="mt-xs rounded-lg border border-light-border dark:border-dark-border overflow-hidden bg-light-surface-elevated dark:bg-dark-surface-elevated">
                    {searchResults.map((user, index) => (
                      <TouchableOpacity
                        key={user.id}
                        onPress={() => handleUserSelect(user)}
                        activeOpacity={0.7}
                        className={`flex-row items-center px-md py-md ${
                          index === searchResults.length - 1 ? '' : 'border-b-[0.5px] border-light-border dark:border-dark-border'
                        }`}
                      >
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-sm">
                          <User size={16} color={text.tertiary} strokeWidth={2} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                            {getDisplayNameFromUser(user, 'User')}
                          </Text>
                          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                            @{getHandleFromUser(user)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {isSearching && debouncedSearchQuery.length >= 2 && (
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                    {t('Searching')}...
                  </Text>
                )}

                {searchQuery.length > 0 && !selectedUser && !isSearching && searchResults.length === 0 && debouncedSearchQuery.length >= 2 && (
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                    {t('NoUsersFound')}
                  </Text>
                )}
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
                  onPress={handleAdd}
                  disabled={isSubmitting || !selectedUser}
                  leftIcon={<UserPlus size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Adding') : t('AddCollaborator')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
