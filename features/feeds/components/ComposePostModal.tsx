import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useFeedContext } from '../context';
import type { ThreadPost } from '../types';
import { feedService } from '../../../core/feeds/services/feeds';
import { PostType } from '../../../core/feeds/types/feeds';
import { convertFeedPostToThreadPost } from '../utils';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

const CHARACTER_LIMIT = 280;
const AVATAR_PLACEHOLDER = 'https://i.pravatar.cc/150?img=5';

type Props = {
  onClose: () => void;
  onPost: (post: ThreadPost) => void;
};

type SelectedPhoto = {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
};

type SelectedVideo = {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
};

const formatFileSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const ComposePostModal = ({ onClose, onPost }: Props) => {
  const { eventId, eventName } = useFeedContext();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark, disabledButtonBackground } = useTheme();
  const textColor = colors.text;
  const borderLight = colors.borderLight;
  const surfaceColor = colors.surface;
  const bgColor = colors.background;

  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [video, setVideo] = useState<SelectedVideo | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (validationError) {
      if (text.trim().length > 0 || photos.length > 0 || video) {
        setValidationError(null);
      }
    }
  }, [validationError, text, photos, video]);

  const buildSelectedAsset = (asset: Asset): SelectedPhoto | SelectedVideo | null => {
    if (!asset.uri) return null;
    return {
      uri: asset.uri,
      fileName: asset.fileName ?? undefined,
      fileSize: asset.fileSize ?? undefined,
      type: asset.type ?? undefined,
    };
  };

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 4 - photos.length,
        quality: 0.8,
      },
      response => {
        if (response.didCancel || response.errorMessage) {
          return;
        }
        if (response.assets) {
          const newPhotos = response.assets
            .map(buildSelectedAsset)
            .filter((item): item is SelectedPhoto => item !== null)
            .slice(0, 4 - photos.length);

          if (newPhotos.length > 0) {
            setPhotos(prev => [...prev, ...newPhotos].slice(0, 4));
            setVideo(null);
            setValidationError(null);
          }
        }
      }
    );
  };

  const pickVideo = async () => {
    launchImageLibrary(
      {
        mediaType: 'video',
      },
      response => {
        if (response.didCancel || response.errorMessage) {
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          const asset = buildSelectedAsset(response.assets[0]);
          if (asset) {
            setVideo(asset);
            setPhotos([]);
            setValidationError(null);
          }
        }
      }
    );
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const getFileExtension = (value?: string) => {
    if (!value) return undefined;
    const cleaned = value.split('?')[0];
    const parts = cleaned.split('.');
    return parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() : undefined;
  };

  const resolveContentType = (fallback: 'image' | 'video', asset?: SelectedPhoto | SelectedVideo) => {
    if (asset?.type) {
      return asset.type;
    }
    const ext = getFileExtension(asset?.fileName || asset?.uri);
    if (!ext) {
      return fallback === 'image' ? 'image/jpeg' : 'video/mp4';
    }
    if (fallback === 'image') {
      if (ext === 'png') return 'image/png';
      if (ext === 'gif') return 'image/gif';
      return 'image/jpeg';
    }
    return ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
  };

  const resolveFileName = (fallbackPrefix: string, asset?: SelectedPhoto | SelectedVideo) => {
    if (asset?.fileName) return asset.fileName;
    const ext = getFileExtension(asset?.uri) || (fallbackPrefix === 'image' ? 'jpg' : 'mp4');
    return `${fallbackPrefix}-${Date.now()}.${ext}`;
  };

  const uploadMedia = async (
    media: SelectedPhoto | SelectedVideo,
    mediaType: PostType,
    caption?: string
  ): Promise<ThreadPost> => {
    const fileName = resolveFileName(mediaType === PostType.IMAGE ? 'image' : 'video', media);
    const contentType = resolveContentType(mediaType === PostType.IMAGE ? 'image' : 'video', media);

    const createResponse = await feedService.createPost(eventId, {
      type: mediaType,
      content: caption ?? null,
      mediaUpload: {
        fileName,
        contentType,
      },
    });

    const upload = createResponse.mediaUpload;
    if (upload) {
      const response = await fetch(media.uri);
      const blob = await response.blob();

      const uploadUrl = getImageUrl(upload.uploadUrl) ?? upload.uploadUrl;
      const uploadResponse = await fetch(uploadUrl, {
        method: upload.uploadMethod || 'PUT',
        body: blob,
        headers: upload.headers,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload media');
      }

      const completedPost = await feedService.completeMediaUpload(eventId, createResponse.post.id, upload.mediaId, {
        objectKey: upload.objectKey,
        resourceUrl: upload.resourceUrl,
        fileName,
        contentType,
      });

      return convertFeedPostToThreadPost(completedPost);
    }

    return convertFeedPostToThreadPost(createResponse.post);
  };

  const handlePost = async () => {
    if (text.trim().length === 0 && photos.length === 0 && !video) {
      setValidationError(t('StartWithWordsPhotoOrClip'));
      textInputRef.current?.focus();
      return;
    }

    setIsPosting(true);

    try {
      const caption = text.trim() || undefined;
      let createdPost: ThreadPost | null = null;

      if (video) {
        createdPost = await uploadMedia(video, PostType.VIDEO, caption);
      } else if (photos.length > 0) {
        for (let index = 0; index < photos.length; index += 1) {
          const photo = photos[index];
          const nextCaption = index === 0 ? caption : undefined;
          createdPost = await uploadMedia(photo, PostType.IMAGE, nextCaption);
        }
      } else {
        const response = await feedService.createPost(eventId, {
          type: PostType.TEXT,
          content: caption ?? null,
        });
        createdPost = convertFeedPostToThreadPost(response.post);
      }

      if (createdPost) {
        onPost(createdPost);
      }

      setText('');
      setPhotos([]);
      setVideo(null);
      setValidationError(null);
    } catch (error) {
      setValidationError(t('UnableToPost'));
    } finally {
      setIsPosting(false);
    }
  };

  const charCount = text.length;
  const charCountColor = charCount > CHARACTER_LIMIT - 20 ? colors.semantic.warning : textColor.tertiary;
  const canPost = (text.trim().length > 0 || photos.length > 0 || video !== null) && !isPosting;
  const postButtonBg = canPost ? textColor.primary : disabledButtonBackground;
  const postButtonText = canPost ? textColor.inverse : textColor.disabled;

  return (
    <Modal visible animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: bgColor }}>
        <View
          className="flex-row items-center justify-between px-xl pt-lg pb-sm border-b"
          style={{ borderBottomColor: borderLight, backgroundColor: bgColor }}
        >
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('CloseComposer')}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <X size={20} color={textColor.primary} strokeWidth={2.5} />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary" numberOfLines={1}>
            {t('NewPost')}
          </Text>

          <TouchableOpacity
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.8}
            className="min-w-[64px] px-3 py-1 rounded-full items-center justify-center"
            style={{ backgroundColor: postButtonBg }}
            accessibilityRole="button"
            accessibilityLabel={t('Post')}
            accessibilityState={{ disabled: !canPost }}
          >
            <Text className="text-sm font-semibold" style={{ color: postButtonText }}>
              {isPosting ? t('Posting') : t('Post')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-[20px] pb-8">
            <View className="flex-row gap-3 pt-4">
              <Image source={{ uri: AVATAR_PLACEHOLDER }} className="w-11 h-11 rounded-full" />

              <View className="flex-1">
                <TextInput
                  ref={textInputRef}
                  placeholder={t('WhatsHappeningAtEvent', { eventName })}
                  placeholderTextColor={textColor.tertiary}
                  value={text}
                  onChangeText={value => setText(value)}
                  multiline
                  maxLength={CHARACTER_LIMIT}
                  className="text-sm min-h-[120px] leading-[20px] p-0"
                  style={{ textAlignVertical: 'top', color: textColor.primary }}
                  accessibilityLabel={t('PostText')}
                />

                {validationError && (
                  <Text className="text-xs mt-xs text-semantic-error">
                    {validationError}
                  </Text>
                )}
              </View>
            </View>

            {photos.length > 0 && (
              <View className="flex-row flex-wrap mt-lg gap-2">
                {photos.map((photo, index) => (
                  <View
                    key={photo.uri}
                    className="rounded-lg overflow-hidden w-[48%] h-40"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <Image source={{ uri: photo.uri }} className="w-full h-full" resizeMode="cover" />

                    {(photo.fileName || photo.fileSize) && (
                      <View
                        className={`absolute left-xs bottom-xs px-xs py-[2px] rounded-full ${isDark ? 'bg-dark-overlay-stronger' : 'bg-light-overlay-strong'}`}
                      >
                        <Text className="text-xs text-txt-inverse" numberOfLines={1}>
                          {photo.fileName || formatFileSize(photo.fileSize)}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      className={`absolute top-xs right-xs w-7 h-7 rounded-full items-center justify-center ${isDark ? 'bg-dark-overlay-strongest' : 'bg-light-overlay-stronger'}`}
                    >
                      <X size={14} color={textColor.inverse} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {video && (
              <View className="mt-lg rounded-lg overflow-hidden" style={{ backgroundColor: surfaceColor }}>
                <Image source={{ uri: video.uri }} className="w-full h-[200px]" resizeMode="cover" />

                {(video.fileName || video.fileSize) && (
                  <View
                    className={`absolute left-xs bottom-xs px-xs py-[2px] rounded-full ${isDark ? 'bg-dark-overlay-stronger' : 'bg-light-overlay-strong'}`}
                  >
                    <Text className="text-xs text-txt-inverse" numberOfLines={1}>
                      {video.fileName || formatFileSize(video.fileSize)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={removeVideo}
                  className={`absolute top-xs right-xs w-7 h-7 rounded-full items-center justify-center ${isDark ? 'bg-dark-overlay-strongest' : 'bg-light-overlay-stronger'}`}
                >
                  <X size={14} color={textColor.inverse} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <View
          className="flex-row items-center justify-between px-xl pt-sm border-t"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopColor: borderLight,
          }}
        >
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={pickImage}
              disabled={photos.length >= 4}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('AddPhotos')}
              accessibilityState={{ disabled: photos.length >= 4 }}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: photos.length >= 4 ? surfaceColor : 'transparent' }}
            >
              <ImageIcon size={20} color={photos.length >= 4 ? textColor.disabled : textColor.primary} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickVideo}
              disabled={video !== null}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('AddVideo')}
              accessibilityState={{ disabled: video !== null }}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: video ? surfaceColor : 'transparent' }}
            >
              <VideoIcon size={20} color={video ? textColor.disabled : textColor.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text className="text-xs font-medium" style={{ color: charCountColor }}>
            {charCount}/{CHARACTER_LIMIT}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
