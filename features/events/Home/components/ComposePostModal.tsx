import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Camera,
  Image as ImageIcon,
  Video as VideoIcon,
  Send,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { ThreadPost } from './EventThreadModal';

type Props = {
  eventId: string;
  eventName: string;
  onClose: () => void;
  onPost: (post: ThreadPost) => void;
};

export const ComposePostModal = ({ eventId, eventName, onClose, onPost }: Props) => {
  const { spacing, typography, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 4 - photos.length,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel || response.errorMessage) {
          return;
        }
        if (response.assets) {
          const newPhotos = response.assets
            .map(asset => asset.uri)
            .filter((uri): uri is string => uri !== undefined);
          setPhotos(prev => [...prev, ...newPhotos].slice(0, 4));
        }
      },
    );
  };

  const pickVideo = async () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel || response.errorMessage) {
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          setVideo(response.assets[0].uri);
          setPhotos([]); // Remove photos if video is selected
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
    if (!text.trim() && photos.length === 0 && !video) {
      Alert.alert('Empty post', 'Please add some text, photos, or video to your post.');
      return;
    }

    setIsPosting(true);

    // Simulate API call
    setTimeout(() => {
      const newPost: ThreadPost = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          handle: 'you',
          avatar: 'https://i.pravatar.cc/150?img=5',
          verified: false,
        },
        timestamp: 'now',
        text: text.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
        video: video || undefined,
        comments: 0,
        reposts: 0,
        likes: 0,
      };

      onPost(newPost);
      setIsPosting(false);
      setText('');
      setPhotos([]);
      setVideo(null);
    }, 500);
  };

  const canPost = text.trim().length > 0 || photos.length > 0 || video !== null;

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={24} color="#000000" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                color: '#000000',
                fontWeight: typography.weight.bold,
                fontSize: typography.size.base,
              }}
            >
              Create Post
            </Text>
            <Text
              style={{
                color: '#6B7280',
                fontSize: typography.size.xs,
                marginTop: 2,
              }}
            >
              {eventName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!canPost || isPosting}
            activeOpacity={0.7}
            style={{
              backgroundColor: canPost ? '#000000' : '#E5E7EB',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
            }}
          >
            <Send
              size={20}
              color={canPost ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: spacing.xl,
            paddingBottom: spacing.xl + insets.bottom,
          }}
        >
          {/* Text Input */}
          <TextInput
            placeholder="What's happening at this event?"
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline
            style={{
              color: '#000000',
              fontSize: typography.size.base,
              lineHeight: 24,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
          />

          {/* Media Preview */}
          {photos.length > 0 && (
            <View
              style={{
                marginTop: spacing.lg,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.sm,
              }}
            >
              {photos.map((uri, index) => (
                <View
                  key={index}
                  style={{
                    width: '48%',
                    height: 150,
                    borderRadius: borderRadius.lg,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      top: spacing.xs,
                      right: spacing.xs,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#000000',
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
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: video }}
                style={{ width: '100%', height: 200 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={removeVideo}
                style={{
                  position: 'absolute',
                  top: spacing.xs,
                  right: spacing.xs,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#000000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Media Actions */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              marginTop: spacing.xl,
              paddingTop: spacing.xl,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}
          >
            <TouchableOpacity
              onPress={pickImage}
              disabled={photos.length >= 4 || video !== null}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: photos.length >= 4 || video ? '#F9FAFB' : '#FFFFFF',
              }}
            >
              <ImageIcon
                size={20}
                color={photos.length >= 4 || video ? '#9CA3AF' : '#000000'}
              />
              <Text
                style={{
                  color: photos.length >= 4 || video ? '#9CA3AF' : '#000000',
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium,
                }}
              >
                Photos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickVideo}
              disabled={video !== null || photos.length > 0}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: video || photos.length > 0 ? '#F9FAFB' : '#FFFFFF',
              }}
            >
              <VideoIcon
                size={20}
                color={video || photos.length > 0 ? '#9CA3AF' : '#000000'}
              />
              <Text
                style={{
                  color: video || photos.length > 0 ? '#9CA3AF' : '#000000',
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium,
                }}
              >
                Video
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

