import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DollarSign, Plus, UserPlus, X, ChevronDown, Users } from 'lucide-react-native';
import Input from '../../../../common/components/ui/Input';
import { Section } from '../Section';
import { Row } from '../Row';
import { useCreateEvent } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventUserType } from '../../../../core/collaboration/types/collaboration';
import type { PendingCollaborator } from '../../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS: { label: string; value: EventUserType }[] = [
  { label: 'Organizer', value: EventUserType.ORGANIZER },
  { label: 'Coordinator', value: EventUserType.COORDINATOR },
  { label: 'Collaborator', value: EventUserType.COLLABORATOR },
  { label: 'Staff', value: EventUserType.STAFF },
  { label: 'Volunteer', value: EventUserType.VOLUNTEER },
  { label: 'Speaker', value: EventUserType.SPEAKER },
  { label: 'Sponsor', value: EventUserType.SPONSOR },
  { label: 'Media', value: EventUserType.MEDIA },
];

function AddCollaboratorSheet({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (collab: PendingCollaborator) => void;
}) {
  const { colors, borderRadius } = useTheme();
  const [input, setInput] = useState('');
  const [role, setRole] = useState<EventUserType>(EventUserType.COLLABORATOR);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const isValid = input.trim().length > 0 && EMAIL_REGEX.test(input.trim());
  const roleLabel = ROLE_OPTIONS.find(r => r.value === role)?.label ?? 'Collaborator';

  const handleAdd = () => {
    if (!isValid) return;
    onAdd({ emailOrUsername: input.trim(), role });
    setInput('');
    setRole(EventUserType.COLLABORATOR);
    setShowRolePicker(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <View
          className="bg-light-background dark:bg-dark-background rounded-t-3xl px-xl pt-md pb-2xl"
          style={{ borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'] }}
        >
          {/* Handle */}
          <View className="items-center mb-lg">
            <View className="w-10 h-1 rounded-full bg-light-border dark:bg-dark-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between mb-xl">
            <Text className="text-lg font-bold text-txt-primary dark:text-txt-dark-primary">
              Add Collaborator
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Email input */}
          <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
            Email Address
          </Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="name@example.com"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary mb-xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          />

          {/* Role picker */}
          <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
            Role
          </Text>
          <TouchableOpacity
            onPress={() => setShowRolePicker(v => !v)}
            className="rounded-xl px-md py-md flex-row items-center justify-between mb-xs"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">{roleLabel}</Text>
            <ChevronDown size={16} color={colors.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>

          {showRolePicker && (
            <View
              className="rounded-xl overflow-hidden mb-md"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight }}
            >
              {ROLE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { setRole(opt.value); setShowRolePicker(false); }}
                  className="px-md py-sm border-b border-light-border dark:border-dark-border"
                  style={{ backgroundColor: role === opt.value ? colors.surfaceElevated : 'transparent' }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: role === opt.value ? colors.text.primary : colors.text.secondary, fontWeight: role === opt.value ? '600' : '400' }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Add button */}
          <TouchableOpacity
            onPress={handleAdd}
            disabled={!isValid}
            activeOpacity={0.8}
            className="w-full h-[52px] rounded-xl items-center justify-center mt-md"
            style={{ backgroundColor: isValid ? colors.text.primary : colors.borderLight }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: isValid ? colors.text.inverse : colors.text.tertiary }}
            >
              Add to Event
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function CollaboratorRow({
  collab,
  onRemove,
}: {
  collab: PendingCollaborator;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const roleLabel = ROLE_OPTIONS.find(r => r.value === collab.role)?.label ?? collab.role;

  return (
    <View className="flex-row items-center py-sm gap-md">
      <View className="w-8 h-8 rounded-full bg-light-surface-soft dark:bg-dark-surface-elevated items-center justify-center flex-shrink-0">
        <Text className="text-xs font-semibold text-txt-secondary dark:text-txt-dark-secondary">
          {collab.emailOrUsername[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary" numberOfLines={1}>
          {collab.emailOrUsername}
        </Text>
        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">{roleLabel}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <X size={16} color={colors.text.tertiary} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

export function TeamContributionsStep() {
  const { form, actions } = useCreateEvent();
  const { colors } = useTheme();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const iconColor = colors.text.secondary;

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="pb-[120px]">
        {/* ── Contributions ── */}
        <Section title="Contributions (optional)">
          <View className="border border-light-border dark:border-dark-border rounded-lg p-md bg-light-surface dark:bg-dark-surface">
            <Row label="Enable contributions" icon={<DollarSign size={16} color={iconColor} />}>
              <Switch
                value={form.enableContrib}
                onValueChange={value => {
                  actions.setEnableContrib(value);
                  if (!value) actions.setContributionAmount('');
                }}
              />
            </Row>
            {form.enableContrib && (
              <View className="mt-md">
                <Input
                  placeholder="Suggested contribution (USD)"
                  keyboardType="decimal-pad"
                  value={form.contributionAmount}
                  onChangeText={actions.setContributionAmount}
                />
              </View>
            )}
            <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-sm">
              Allow guests to contribute financially to your event
            </Text>
          </View>
        </Section>

        {/* ── Collaborators ── */}
        <Section title="Collaborators (optional)">
          <View className="border border-light-border dark:border-dark-border rounded-lg p-md bg-light-surface dark:bg-dark-surface">
            {/* Existing pending collaborators */}
            {form.pendingCollaborators.length > 0 && (
              <View className="mb-sm">
                {form.pendingCollaborators.map((collab, index) => (
                  <CollaboratorRow
                    key={`${collab.emailOrUsername}-${index}`}
                    collab={collab}
                    onRemove={() => actions.removeCollaborator(index)}
                  />
                ))}
                <View className="h-px bg-light-border dark:bg-dark-border mt-xs mb-xs" />
              </View>
            )}

            {/* Add button */}
            <TouchableOpacity
              className="flex-row items-center gap-sm py-sm"
              activeOpacity={0.7}
              onPress={() => setShowAddSheet(true)}
            >
              <View className="w-10 h-10 rounded-full bg-light-card dark:bg-dark-card items-center justify-center">
                <Plus size={20} color={iconColor} />
              </View>
              <Text className="text-txt-secondary dark:text-txt-dark-secondary">
                {form.pendingCollaborators.length > 0 ? 'Add another collaborator' : 'Add collaborators'}
              </Text>
            </TouchableOpacity>

            {form.pendingCollaborators.length > 0 && (
              <View className="flex-row items-center gap-xs mt-sm">
                <Users size={12} color={colors.text.tertiary} strokeWidth={2} />
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                  {form.pendingCollaborators.length} collaborator{form.pendingCollaborators.length !== 1 ? 's' : ''} will be invited when the event is created
                </Text>
              </View>
            )}
          </View>
        </Section>
      </View>

      <AddCollaboratorSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={actions.addCollaborator}
      />
    </ScrollView>
  );
}
