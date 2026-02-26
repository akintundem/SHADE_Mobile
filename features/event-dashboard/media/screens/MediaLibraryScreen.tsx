import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { ChevronLeft, Image as ImageIcon, Plus, Upload } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { eventService } from '../../../../core/events/services/event';
import { EventMediaResponse, EventMediaUploadRequest } from '../../../../core/events/types/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../../config/appConfig';
import { MediaItem } from '../components/MediaItem';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function MediaLibraryScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const text = colors.text;

  const [media, setMedia] = useState<EventMediaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedia = useCallback(async (isRefresh = false) => {
    if (!eventId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await eventService.getEventMedia(eventId);
      setMedia(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'getEventMedia');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const onRefresh = useCallback(() => {
    fetchMedia(true);
  }, [fetchMedia]);

  const handleUpload = useCallback(() => {
    if (!eventId) return;

    launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 0.8,
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel || response.errorCode || !response.assets?.[0]) return;

        const asset = response.assets[0];
        if (!asset.uri) return;

        setUploading(true);
        try {
          const fileExtension = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
          const fileName = asset.fileName || `media-${Date.now()}.${fileExtension}`;
          const contentType = asset.type || (fileExtension === 'png' ? 'image/png' : fileExtension === 'mp4' ? 'video/mp4' : 'image/jpeg');

          const uploadRequest: EventMediaUploadRequest = {
            fileName,
            contentType,
            isPublic: true,
          };

          const presignedResponse = await eventService.uploadMedia(eventId, uploadRequest);

          const fileResponse = await fetch(asset.uri);
          const blob = await fileResponse.blob();

          const uploadUrl = getImageUrl(presignedResponse.uploadUrl) ?? presignedResponse.uploadUrl;
          const uploadResponse = await fetch(uploadUrl, {
            method: presignedResponse.uploadMethod || 'PUT',
            body: blob,
            headers: presignedResponse.headers,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload to storage');
          }

          await eventService.completeMediaUpload(eventId, presignedResponse.mediaId, {
            objectKey: presignedResponse.objectKey,
            resourceUrl: presignedResponse.resourceUrl,
            fileName,
            contentType,
            isPublic: true,
          });

          await fetchMedia(true);
        } catch (err) {
          ErrorHandler.handle(err, 'uploadMedia');
          Alert.alert(t('Error'), t('FailedToUploadMedia'));
        } finally {
          setUploading(false);
        }
      }
    );
  }, [eventId, t, fetchMedia]);

  const handleDelete = useCallback(
    async (mediaItem: EventMediaResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('DeleteMedia'),
        t('DeleteMediaConfirm', { name: mediaItem.mediaName || t('Media') }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await eventService.deleteMedia(eventId, mediaItem.mediaId);
                await fetchMedia(true);
              } catch (err) {
                ErrorHandler.handle(err, 'deleteMedia');
              }
            },
          },
        ]
      );
    },
    [eventId, t, fetchMedia]
  );

  const handleUpdate = useCallback(
    (mediaItem: EventMediaResponse) => {
      const name = mediaItem.mediaName || t('Media');
      Alert.alert(
        t('EditMedia'),
        name,
        [
          mediaItem.mediaUrl
            ? {
                text: 'View',
                onPress: () => Linking.openURL(getImageUrl(mediaItem.mediaUrl) ?? mediaItem.mediaUrl),
              }
            : null,
          { text: t('Delete'), style: 'destructive', onPress: () => handleDelete(mediaItem) },
          { text: t('Cancel'), style: 'cancel' },
        ].filter(Boolean) as any[]
      );
    },
    [t, handleDelete]
  );

  const handleMediaPress = useCallback(
    (mediaItem: EventMediaResponse) => {
      if (mediaItem.mediaUrl) {
        Linking.openURL(getImageUrl(mediaItem.mediaUrl) ?? mediaItem.mediaUrl);
      }
    },
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['bottom']}>
      <ScreenHeader
        title={t('MediaLibrary')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canEditMedia
            ? { icon: Plus, onPress: handleUpload, size: 32 }
            : undefined
        }
      />

      {loading && !refreshing ? (
        <LoadingOverlay visible={true} />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-xl">
          <EmptyState
            icon={<ImageIcon size={40} color={text.tertiary} />}
            title={t('FailedToLoadMedia')}
            subtitle={error.message}
          />
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={item => item.mediaId}
          renderItem={({ item }) => (
            <MediaItem
              media={item}
              onPress={() => handleMediaPress(item)}
              onDelete={permissions.canEditMedia ? () => handleDelete(item) : undefined}
              onUpdate={permissions.canEditMedia ? () => handleUpdate(item) : undefined}
            />
          )}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          ListEmptyComponent={
            <View className="py-3xl items-center">
              <ImageIcon size={48} color={text.tertiary} strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                {t('NoMediaYet')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center mb-lg">
                {t('UploadMediaToGetStarted')}
              </Text>
              {permissions.canEditMedia && (
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleUpload}
                  leftIcon={<Upload size={18} color={text.inverse} strokeWidth={2.2} />}
                  disabled={uploading}
                >
                  {uploading ? t('Uploading') : t('UploadMedia')}
                </Button>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={text.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
