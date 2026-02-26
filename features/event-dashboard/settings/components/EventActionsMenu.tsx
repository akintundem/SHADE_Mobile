import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Archive, RotateCcw, Copy, Image, MoreHorizontal } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type ActionItem = {
  id: string;
  icon: typeof Archive;
  label: string;
  description: string;
  destructive?: boolean;
  hidden?: boolean;
};

type Props = {
  isArchived: boolean;
  hasCoverImage: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onClone: () => void;
  onRemoveCover: () => void;
  disabled?: boolean;
};

export function EventActionsMenu({
  isArchived,
  hasCoverImage,
  onArchive,
  onRestore,
  onClone,
  onRemoveCover,
  disabled = false,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const actions: ActionItem[] = [
    {
      id: 'clone',
      icon: Copy,
      label: t('CloneEvent'),
      description: t('CloneEventDesc'),
    },
    {
      id: 'removeCover',
      icon: Image,
      label: t('RemoveCoverImage'),
      description: t('RemoveCoverImageDesc'),
      hidden: !hasCoverImage,
    },
    {
      id: 'archive',
      icon: Archive,
      label: t('ArchiveEvent'),
      description: t('ArchiveEventDesc'),
      destructive: true,
      hidden: isArchived,
    },
    {
      id: 'restore',
      icon: RotateCcw,
      label: t('RestoreEvent'),
      description: t('RestoreEventDesc'),
      hidden: !isArchived,
    },
  ];

  const visibleActions = actions.filter(a => !a.hidden);

  const handlePress = (actionId: string) => {
    if (disabled) return;
    switch (actionId) {
      case 'archive':
        onArchive();
        break;
      case 'restore':
        onRestore();
        break;
      case 'clone':
        onClone();
        break;
      case 'removeCover':
        onRemoveCover();
        break;
    }
  };

  return (
    <View className="rounded-lg border border-light-border-muted bg-light-background overflow-hidden dark:border-dark-border-strong dark:bg-dark-card">
      <View className="flex-row items-center gap-sm px-lg py-md">
        <MoreHorizontal size={18} color={colors.text.secondary} strokeWidth={2} />
        <Text
          className="text-sm font-semibold uppercase tracking-[0.5px] text-txt-tertiary dark:text-txt-dark-tertiary"
        >
          {t('EventActions')}
        </Text>
      </View>

      {visibleActions.map((action, index) => {
        const Icon = action.icon;
        const iconColor = action.destructive ? colors.semantic.error : colors.text.secondary;

        return (
          <TouchableOpacity
            key={action.id}
            onPress={() => handlePress(action.id)}
            disabled={disabled}
            activeOpacity={0.7}
            className={`flex-row items-center gap-md px-lg py-[14px] ${disabled ? 'opacity-50' : ''}`}
          >
            <View
              className={`w-9 h-9 rounded-md items-center justify-center ${
                action.destructive ? 'bg-semantic-error-light dark:bg-semantic-error/20' : 'bg-light-surface-soft dark:bg-dark-surface-strong'
              }`}
            >
              <Icon size={18} color={iconColor} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-medium mb-[2px] ${
                  action.destructive ? 'text-semantic-error' : 'text-txt-primary dark:text-txt-dark-primary'
                }`}
              >
                {action.label}
              </Text>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {action.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
