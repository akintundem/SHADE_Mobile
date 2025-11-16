import React, { useState, useRef } from 'react';
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
  Type,
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
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: insets.top }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            minHeight: 44 + spacing.lg * 2, // Ensure minimum touchable height
            backgroundColor: '#FFFFFF',
            zIndex: 100,
          }}
        >
          <TouchableOpacity 
            onPress={() => {
              console.log('Close button pressed');
              onClose();
            }}
            activeOpacity={0.6}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={{
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -spacing.md,
              zIndex: 1000,
              backgroundColor: 'transparent',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={22} color="#000000" strokeWidth={2.5} />
            </View>
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
              minWidth: 44,
              minHeight: 44,
              backgroundColor: canPost ? '#000000' : '#E5E7EB',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: -spacing.md,
            }}
          >
            <Send
              size={20}
              color={canPost ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: spacing.xl,
            paddingBottom: spacing.xl,
          }}
        >
          {/* Text Input */}
          <TextInput
            ref={textInputRef}
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
        </ScrollView>

        {/* Media Actions - Fixed Bottom with Safe Area */}
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            backgroundColor: '#FFFFFF',
            borderTopWidth: 2,
            borderTopColor: '#000000',
          }}
        >
            <Text
              style={{
                color: '#000000',
                fontSize: typography.size.sm,
                fontWeight: typography.weight.bold,
                marginBottom: spacing.md,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Share Your Perspective
            </Text>
            
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.md,
              }}
            >
              {/* Photo Card */}
              <TouchableOpacity
                onPress={pickImage}
                disabled={photos.length >= 4 || video !== null}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  minHeight: 120,
                  borderRadius: borderRadius.xl,
                  backgroundColor: photos.length >= 4 || video ? '#F3F4F6' : '#000000',
                  borderWidth: 3,
                  borderColor: photos.length >= 4 || video ? '#E5E7EB' : '#000000',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: spacing.lg,
                  paddingHorizontal: spacing.md,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: photos.length >= 4 || video ? 0 : 0.15,
                  shadowRadius: 8,
                  elevation: photos.length >= 4 || video ? 0 : 4,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: photos.length >= 4 || video ? '#E5E7EB' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <ImageIcon
                    size={28}
                    color={photos.length >= 4 || video ? '#9CA3AF' : '#000000'}
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={{
                    color: photos.length >= 4 || video ? '#9CA3AF' : '#FFFFFF',
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.bold,
                    textAlign: 'center',
                  }}
                >
                  Photo
                </Text>
                {photos.length > 0 && (
                  <View
                    style={{
                      marginTop: spacing.xs,
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: typography.size.xs,
                        fontWeight: typography.weight.bold,
                      }}
                    >
                      {photos.length}/4
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Video Card */}
              <TouchableOpacity
                onPress={pickVideo}
                disabled={video !== null || photos.length > 0}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  minHeight: 120,
                  borderRadius: borderRadius.xl,
                  backgroundColor: video || photos.length > 0 ? '#F3F4F6' : '#000000',
                  borderWidth: 3,
                  borderColor: video || photos.length > 0 ? '#E5E7EB' : '#000000',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: spacing.lg,
                  paddingHorizontal: spacing.md,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: video || photos.length > 0 ? 0 : 0.15,
                  shadowRadius: 8,
                  elevation: video || photos.length > 0 ? 0 : 4,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: video || photos.length > 0 ? '#E5E7EB' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <VideoIcon
                    size={28}
                    color={video || photos.length > 0 ? '#9CA3AF' : '#000000'}
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={{
                    color: video || photos.length > 0 ? '#9CA3AF' : '#FFFFFF',
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.bold,
                    textAlign: 'center',
                  }}
                >
                  Video
                </Text>
                {video && (
                  <View
                    style={{
                      marginTop: spacing.xs,
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: typography.size.xs,
                        fontWeight: typography.weight.bold,
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Text/Tweet Card */}
              <TouchableOpacity
                onPress={() => {
                  textInputRef.current?.focus();
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }, 100);
                }}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  minHeight: 120,
                  borderRadius: borderRadius.xl,
                  backgroundColor: text.trim().length > 0 ? '#000000' : '#F9FAFB',
                  borderWidth: 3,
                  borderColor: text.trim().length > 0 ? '#000000' : '#E5E7EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: spacing.lg,
                  paddingHorizontal: spacing.md,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: text.trim().length > 0 ? 0.15 : 0,
                  shadowRadius: 8,
                  elevation: text.trim().length > 0 ? 4 : 0,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: text.trim().length > 0 ? '#FFFFFF' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Type
                    size={28}
                    color={text.trim().length > 0 ? '#000000' : '#9CA3AF'}
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={{
                    color: text.trim().length > 0 ? '#FFFFFF' : '#9CA3AF',
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.bold,
                    textAlign: 'center',
                  }}
                >
                  Tweet
                </Text>
                {text.trim().length > 0 && (
                  <View
                    style={{
                      marginTop: spacing.xs,
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: typography.size.xs,
                        fontWeight: typography.weight.bold,
                      }}
                    >
                      {text.trim().length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
      </View>
    </Modal>
  );
};

