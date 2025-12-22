import React, { useState, useRef, useEffect } from 'react';
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
import {
  X,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { ThreadPost } from './EventThreadModal';
import { useI18n } from '../../../../common/i18n/I18nProvider';

type Props = {
  eventId: string;
  eventName: string;
  onClose: () => void;
  onPost: (post: ThreadPost) => void;
};

type SelectedPhoto = {
  uri: string;
  fileName?: string;
  fileSize?: number;
};

type SelectedVideo = {
  uri: string;
  fileName?: string;
  fileSize?: number;
};

const CHARACTER_LIMIT = 280;
const AVATAR_PLACEHOLDER = 'https://i.pravatar.cc/150?img=5';

const formatFileSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const ComposePostModal = ({ eventId, eventName, onClose, onPost }: Props) => {
  const { spacing, typography, borderRadius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [video, setVideo] = useState<SelectedVideo | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
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
    };
  };

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 4 - photos.length,
        quality: 0.85,
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
      },
    );
  };

  const pickVideo = async () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        quality: 0.85,
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
      },
    );
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handlePost = async () => {
    if (text.trim().length === 0 && photos.length === 0 && !video) {
      setValidationError('Start with words, a photo set, or a clip before you post.');
      textInputRef.current?.focus();
      return;
    }

    setIsPosting(true);

    setTimeout(() => {
      const newPost: ThreadPost = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          handle: 'you',
          avatar: AVATAR_PLACEHOLDER,
          verified: false,
        },
        timestamp: 'now',
        text: text.trim() || undefined,
        photos: photos.length > 0 ? photos.map(photo => photo.uri) : undefined,
        video: video?.uri || undefined,
        comments: 0,
        reposts: 0,
        likes: 0,
      };

      onPost(newPost);
      setIsPosting(false);
      setText('');
      setPhotos([]);
      setVideo(null);
      setValidationError(null);
    }, 400);
  };

  const charCount = text.length;
  const charCountColor = charCount > CHARACTER_LIMIT - 20 ? '#F97316' : '#6B7280';
  const canPost = (text.trim().length > 0 || photos.length > 0 || video !== null) && !isPosting;

  return (
    <Modal visible animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: insets.top }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close composer"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} color="#111827" />
          </TouchableOpacity>

          <Text
            style={{
              color: '#111827',
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.base,
            }}
            numberOfLines={1}
          >
            New post
          </Text>

          <TouchableOpacity
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.8}
            style={{
              minWidth: 64,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.full,
              backgroundColor: canPost ? '#000000' : '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Post"
            accessibilityState={{ disabled: !canPost }}
          >
            <Text
              style={{
                color: canPost ? '#FFFFFF' : '#9CA3AF',
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
              }}
            >
              {isPosting ? 'Posting…' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Body */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['3xl'],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: spacing.md,
              paddingTop: spacing.lg,
            }}
          >
            <Image
              source={{ uri: AVATAR_PLACEHOLDER }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />

            <View style={{ flex: 1 }}>
              <TextInput
                ref={textInputRef}
                placeholder={t('WhatsHappeningAtEvent', { eventName })}
                placeholderTextColor="#9CA3AF"
                value={text}
                onChangeText={value => {
                  setText(value);
                }}
                multiline
                maxLength={CHARACTER_LIMIT}
                style={{
                  color: '#111827',
                  fontSize: typography.size.base,
                  lineHeight: 24,
                  minHeight: 120,
                  textAlignVertical: 'top',
                  padding: 0,
                }}
                accessibilityLabel={t('PostText')}
              />

              {validationError && (
                <Text
                  style={{
                    color: '#EF4444',
                    fontSize: typography.size.xs,
                    marginTop: spacing.xs,
                  }}
                >
                  {validationError}
                </Text>
              )}
            </View>
          </View>

          {photos.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.sm,
                marginTop: spacing.lg,
              }}
            >
              {photos.map((photo, index) => (
                <View
                  key={photo.uri}
                  style={{
                    width: '48%',
                    height: 160,
                    borderRadius: borderRadius.lg,
                    overflow: 'hidden',
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {(photo.fileName || photo.fileSize) && (
                    <View
                      style={{
                        position: 'absolute',
                        left: spacing.xs,
                        bottom: spacing.xs,
                        paddingHorizontal: spacing.xs,
                        paddingVertical: 2,
                        borderRadius: borderRadius.full,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: typography.size.xs,
                        }}
                        numberOfLines={1}
                      >
                        {photo.fileName || formatFileSize(photo.fileSize)}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      top: spacing.xs,
                      right: spacing.xs,
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: 'rgba(17,24,39,0.8)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {video && (
            <View
              style={{
                marginTop: spacing.lg,
                borderRadius: borderRadius.lg,
                overflow: 'hidden',
                backgroundColor: '#F3F4F6',
              }}
            >
              <Image
                source={{ uri: video.uri }}
                style={{ width: '100%', height: 200 }}
                resizeMode="cover"
              />

              {(video.fileName || video.fileSize) && (
                <View
                  style={{
                    position: 'absolute',
                    left: spacing.xs,
                    bottom: spacing.xs,
                    paddingHorizontal: spacing.xs,
                    paddingVertical: 2,
                    borderRadius: borderRadius.full,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: typography.size.xs,
                    }}
                    numberOfLines={1}
                  >
                    {video.fileName || formatFileSize(video.fileSize)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={removeVideo}
                style={{
                  position: 'absolute',
                  top: spacing.xs,
                  right: spacing.xs,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: 'rgba(17,24,39,0.8)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={photos.length >= 4}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Add photos"
              accessibilityState={{ disabled: photos.length >= 4 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: photos.length >= 4 ? '#F3F4F6' : 'transparent',
              }}
            >
              <ImageIcon size={22} color={photos.length >= 4 ? '#9CA3AF' : '#0F172A'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickVideo}
              disabled={video !== null}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Add video"
              accessibilityState={{ disabled: video !== null }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: video ? '#F3F4F6' : 'transparent',
              }}
            >
              <VideoIcon size={22} color={video ? '#9CA3AF' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: charCountColor,
              fontSize: typography.size.xs,
              fontWeight: typography.weight.medium,
            }}
          >
            {charCount}/{CHARACTER_LIMIT}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

