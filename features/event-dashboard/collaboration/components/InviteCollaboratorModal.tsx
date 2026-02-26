import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
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
import { EventUserType, CreateCollaboratorInviteRequest, EventPermission } from '../../../../core/collaboration/types/collaboration';
import { authService } from '../../../../core/auth/services/authService';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import Button from '../../../../common/components/ui/Button';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';
import { getDisplayNameFromUser, getHandleFromUser } from '../../../../features/profile/utils/profile';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function InviteCollaboratorModal({ visible, eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const text = colors.text;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<EventUserType>(EventUserType.COLLABORATOR);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<EventPermission[]>([
    EventPermission.VIEW_EVENT,
    EventPermission.MANAGE_CONTENT,
  ]);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSelectedUser(null);
    setMessage('');
    setSelectedRole(EventUserType.COLLABORATOR);
    setShowRolePicker(false);
    setIsSubmitting(false);
    setSearchResults([]);
    setSelectedPermissions([EventPermission.VIEW_EVENT, EventPermission.MANAGE_CONTENT]);
    setSendEmail(true);
    setSendPush(true);
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
        // Try searchSecureUsers first (for admin/collaboration context)
        // Fall back to searchDirectory if permission denied
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
          // If secure search fails (e.g., permission denied), fall back to directory search
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

  const isValidInput = useMemo(() => {
    if (selectedUser) return true;
    if (EMAIL_REGEX.test(searchQuery.trim())) return true;
    return false;
  }, [selectedUser, searchQuery]);

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

  const handleSend = useCallback(async () => {
    if (!eventId || !isValidInput) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedPermissions.length) {
        setError(t('SelectAtLeastOnePermission'));
        setIsSubmitting(false);
        return;
      }
      if (!selectedUser && !sendEmail) {
        setError(t('EmailInviteRequiresEmail'));
        setIsSubmitting(false);
        return;
      }

      const request: CreateCollaboratorInviteRequest = {
        inviteeUserId: selectedUser?.id || null,
        inviteeEmail: selectedUser ? null : EMAIL_REGEX.test(searchQuery.trim()) ? searchQuery.trim() : null,
        role: selectedRole,
        message: message.trim() || null,
        sendEmail: sendEmail,
        sendPush: sendPush && !!selectedUser,
        permissions: selectedPermissions,
      };

      await collaborationService.createInvite(eventId, request);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToSendInvite'));
      ErrorHandler.handle(err, 'createCollaboratorInvite');
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, isValidInput, selectedUser, searchQuery, selectedRole, selectedPermissions, message, sendEmail, sendPush, t, resetForm, onSuccess, onClose]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);
  const inputBorderClass = isValidInput
    ? 'border-brand-primary'
    : 'border-light-border dark:border-dark-border';
  const switchTrackColor = useSwitchTrackColors();

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
                {t('InviteCollaborator')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-card dark:bg-dark-surface-elevated"
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
                  {t('EmailOrUsername')} *
                </Text>
                <View
                  className={`flex-row items-center rounded-lg px-md border bg-light-surface dark:bg-dark-surface ${inputBorderClass}`}
                >
                  <Search size={16} color={text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder={t('SearchByEmailOrUsername')}
                    placeholderTextColor={text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {selectedUser && (
                    <View className="rounded-full px-sm py-[2px] bg-light-card dark:bg-dark-surface-elevated">
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

                {searchQuery.length > 0 && !isValidInput && !selectedUser && !isSearching && searchResults.length === 0 && (
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                    {t('EnterValidEmailOrSelectUser')}
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
                  className="flex-row items-center justify-between rounded-lg px-md py-md border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
                >
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {formatEnumLabel(selectedRole)}
                  </Text>
                  <ChevronDown size={18} color={text.tertiary} strokeWidth={2} />
                </TouchableOpacity>

                {showRolePicker && (
                  <View
                    className="mt-xs rounded-lg border border-light-border dark:border-dark-border overflow-hidden bg-light-surface-elevated dark:bg-dark-surface-elevated"
                  >
                    {roleOptions.map((option, index) => {
                      const isSelected = option.value === selectedRole;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => {
                            setSelectedRole(option.value);
                            setShowRolePicker(false);
                          }}
                          className={`px-md py-md ${isSelected ? (isDark ? 'bg-dark-card' : 'bg-light-card') : ''} ${
                            index === roleOptions.length - 1
                              ? ''
                              : 'border-b-[0.5px] border-light-border dark:border-dark-border'
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

                <View className="rounded-lg border p-sm bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
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
                                ? 'bg-dark-surface-elevated border-dark-border'
                                : 'bg-brand-primary border-brand-primary'
                              : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
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
                                  ? 'bg-light-background border-light-background dark:bg-dark-background dark:border-dark-background'
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

              <View className="mb-xl">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Message')}
                </Text>
                <View className="rounded-lg px-md border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
                  <TextInput
                    placeholder={t('AddPersonalMessage')}
                    placeholderTextColor={text.tertiary}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    className="text-sm text-txt-primary dark:text-txt-dark-primary min-h-[80px] py-md"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>
              </View>

              <View className="mb-xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                  {t('NotificationOptions')}
                </Text>

                <View className="flex-row items-center justify-between py-md border-b-[0.5px] border-light-border dark:border-dark-border">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                      {t('SendEmailInvitation')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('SendEmailInviteDescription')}
                    </Text>
                  </View>
                  <Switch
                    value={sendEmail}
                    onValueChange={setSendEmail}
                    trackColor={{
                      false: switchTrackColor.false,
                      true: switchTrackColor.true,
                    }}
                    thumbColor={colors.background}
                  />
                </View>

                <View className={`flex-row items-center justify-between py-md ${selectedUser ? '' : 'opacity-50'}`}>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                      {t('SendPushNotification')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {selectedUser ? t('SendPushInviteDescription') : t('OnlyForRegisteredUsers')}
                    </Text>
                  </View>
                  <Switch
                    value={sendPush}
                    onValueChange={setSendPush}
                    disabled={!selectedUser}
                    trackColor={{
                      false: switchTrackColor.false,
                      true: switchTrackColor.true,
                    }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>

              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSend}
                  disabled={isSubmitting || !isValidInput}
                  leftIcon={<UserPlus size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Sending') : t('SendInvite')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
