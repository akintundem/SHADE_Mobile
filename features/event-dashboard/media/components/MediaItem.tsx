import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Image as ImageIcon, MoreVertical, Video } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventMediaResponse } from '../../../../core/events/types/event';
import { getImageUrl } from '../../../../config/appConfig';

type Props = {
  media: EventMediaResponse;
  onPress: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
};

export function MediaItem({ media, onPress, onDelete, onUpdate }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const isImage =
    media.mediaType?.toLowerCase().includes('image') ||
    media.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo =
    media.mediaType?.toLowerCase().includes('video') ||
    media.mediaUrl?.match(/\.(mp4|mov|avi)$/i);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => setShowActions(true)}
      activeOpacity={0.7}
      className="mb-md"
    >
      <View className="rounded-lg border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface overflow-hidden">
        <View className="relative aspect-video bg-light-surface-soft dark:bg-dark-surface-soft">
          {isImage && media.mediaUrl ? (
            <Image
              source={{ uri: getImageUrl(media.mediaUrl) ?? media.mediaUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : isVideo ? (
            <View className="w-full h-full items-center justify-center">
              <Video size={40} color={colors.text.tertiary} strokeWidth={2} />
            </View>
          ) : (
            <View className="w-full h-full items-center justify-center">
              <ImageIcon size={40} color={colors.text.tertiary} strokeWidth={2} />
            </View>
          )}
          <TouchableOpacity
            onPress={() => setShowActions(true)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-light-overlay dark:bg-dark-overlay items-center justify-center"
          >
            <MoreVertical size={16} color={colors.text.inverse} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View className="p-md">
          <Text
            className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs"
            numberOfLines={1}
          >
            {media.mediaName || media.mediaUrl?.split('/').pop() || t('Untitled')}
          </Text>
          {media.description && (
            <Text
              className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-xs"
              numberOfLines={2}
            >
              {media.description}
            </Text>
          )}
          {media.category && (
            <View className="self-start px-sm py-[2px] rounded-full bg-light-surface-soft dark:bg-dark-surface-strong mt-xs">
              <Text className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary">
                {media.category}
              </Text>
            </View>
          )}
        </View>
      </View>

      {showActions && (
        <View className="absolute inset-0 bg-light-overlay dark:bg-dark-overlay items-center justify-center z-10">
          <View className="bg-light-background dark:bg-dark-background rounded-xl p-lg min-w-[200px]">
            {onUpdate && (
              <TouchableOpacity
                onPress={() => {
                  setShowActions(false);
                  onUpdate();
                }}
                className="py-md border-b border-light-border-muted dark:border-dark-border-strong"
              >
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary text-center">
                  {t('Edit')}
                </Text>
              </TouchableOpacity>
            )}
            {onDelete && (
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
            )}
            <TouchableOpacity
              onPress={() => setShowActions(false)}
              className="py-md border-t border-light-border-muted dark:border-dark-border-strong"
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
