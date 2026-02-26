import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventMediaResponse } from '../../../../core/events/types/event';

const getFileIcon = (url?: string | null) => {
  if (!url) return '📎';
  if (url.match(/\.(pdf)$/i)) return '📄';
  if (url.match(/\.(doc|docx)$/i)) return '📝';
  if (url.match(/\.(xls|xlsx)$/i)) return '📊';
  if (url.match(/\.(zip|rar)$/i)) return '📦';
  return '📎';
};

type Props = {
  asset: EventMediaResponse;
  onPress: () => void;
  onDelete?: () => void;
};

export function AssetItem({ asset, onPress, onDelete }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => setShowActions(true)}
      activeOpacity={0.7}
      className="mb-md"
    >
      <View className="rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-md flex-row items-center">
        <View className="w-12 h-12 rounded-lg bg-light-card dark:bg-dark-surface-elevated items-center justify-center mr-md">
          <Text className="text-2xl">{getFileIcon(asset.mediaUrl)}</Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs"
            numberOfLines={1}
          >
            {asset.mediaName || asset.mediaUrl?.split('/').pop() || t('Untitled')}
          </Text>
          {asset.description && (
            <Text
              className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary"
              numberOfLines={1}
            >
              {asset.description}
            </Text>
          )}
        </View>
        {onDelete && (
          <TouchableOpacity onPress={() => setShowActions(true)} className="p-sm">
            <MoreVertical size={18} color={colors.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {showActions && onDelete && (
        <View className="absolute inset-0 bg-light-overlay dark:bg-dark-overlay items-center justify-center z-10">
          <View className="bg-light-background dark:bg-dark-background rounded-xl p-lg min-w-[200px]">
            <TouchableOpacity
              onPress={() => {
                setShowActions(false);
                onDelete();
              }}
              className="py-md"
            >
              <Text className="text-sm font-medium text-semantic-error text-center">
                {t('Delete')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowActions(false)}
              className="py-md border-t border-light-border dark:border-dark-border"
            >
              <Text className="text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                {t('Cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
