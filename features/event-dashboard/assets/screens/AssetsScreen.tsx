import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { ChevronLeft, File, Plus, Upload } from 'lucide-react-native';
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
import { AssetItem } from '../components/AssetItem';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function AssetsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);

  const [assets, setAssets] = useState<EventMediaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssets = useCallback(async (isRefresh = false) => {
    if (!eventId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await eventService.getEventAssets(eventId);
      setAssets(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'getEventAssets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const onRefresh = useCallback(() => {
    fetchAssets(true);
  }, [fetchAssets]);

  const handleUpload = useCallback(() => {
    if (!eventId) return;

    launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 1.0,
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel || response.errorCode || !response.assets?.[0]) return;

        const asset = response.assets[0];
        if (!asset.uri) return;

        setUploading(true);
        try {
          const fileExtension = asset.uri.split('.').pop()?.split('?')[0] || 'file';
          const fileName = asset.fileName || `asset-${Date.now()}.${fileExtension}`;
          const contentType = asset.type || 'application/octet-stream';

          const uploadRequest: EventMediaUploadRequest = {
            fileName,
            contentType,
            isPublic: false,
          };

          const presignedResponse = await eventService.uploadAsset(eventId, uploadRequest);

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

          await eventService.completeAssetUpload(eventId, presignedResponse.mediaId, {
            objectKey: presignedResponse.objectKey,
            resourceUrl: presignedResponse.resourceUrl,
            fileName,
            contentType,
            isPublic: false,
          });

          await fetchAssets(true);
        } catch (err) {
          ErrorHandler.handle(err, 'uploadAsset');
          Alert.alert(t('Error'), t('FailedToUploadAsset'));
        } finally {
          setUploading(false);
        }
      }
    );
  }, [eventId, t, fetchAssets]);

  const handleDelete = useCallback(
    async (asset: EventMediaResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('DeleteAsset'),
        t('DeleteAssetConfirm', { name: asset.mediaName || t('Asset') }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                // Assets use the same delete endpoint as media
                await eventService.deleteMedia(eventId, asset.mediaId);
                await fetchAssets(true);
              } catch (err) {
                ErrorHandler.handle(err, 'deleteAsset');
              }
            },
          },
        ]
      );
    },
    [eventId, t, fetchAssets]
  );

  const handleAssetPress = useCallback(
    (asset: EventMediaResponse) => {
      if (asset.mediaUrl) {
        Linking.openURL(getImageUrl(asset.mediaUrl) ?? asset.mediaUrl);
      }
    },
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['bottom']}>
      <ScreenHeader
        title={t('Assets')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canEditAssets
            ? { icon: Plus, onPress: handleUpload, size: 32 }
            : undefined
        }
      />

      {loading && !refreshing ? (
        <LoadingOverlay visible={true} />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-xl">
          <EmptyState
            icon={<File size={40} color={colors.text.tertiary} />}
            title={t('FailedToLoadAssets')}
            subtitle={error.message}
          />
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={item => item.mediaId}
          renderItem={({ item }) => (
            <AssetItem
              asset={item}
              onPress={() => handleAssetPress(item)}
              onDelete={permissions.canEditAssets ? () => handleDelete(item) : undefined}
            />
          )}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          ListEmptyComponent={
            <View className="py-3xl items-center">
              <File size={48} color={colors.text.tertiary} strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                {t('NoAssetsYet')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center mb-lg">
                {t('UploadAssetsToGetStarted')}
              </Text>
              {permissions.canEditAssets && (
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleUpload}
                  leftIcon={<Upload size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                  disabled={uploading}
                >
                  {uploading ? t('Uploading') : t('UploadAsset')}
                </Button>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
