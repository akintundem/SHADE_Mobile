import React, { useState, useRef } from 'react';
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
import { X } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useFeedContext } from '../context';
import type { ThreadPost } from '../types';
import { feedService } from '../../../core/feeds/services/feeds';
import { convertFeedPostToThreadPost } from '../utils';
import { getImageUrl } from '../../../config/appConfig';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import { useTheme } from '../../../common/theme/ThemeProvider';

const CHARACTER_LIMIT = 280;
const AVATAR_PLACEHOLDER = 'https://i.pravatar.cc/150?img=5';

type Props = {
  visible: boolean;
  originalPost: ThreadPost | null;
  onClose: () => void;
  onQuote: (post: ThreadPost) => void;
};

export const QuotePostModal = ({ visible, originalPost, onClose, onQuote }: Props) => {
  const { eventId } = useFeedContext();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, disabledButtonBackground } = useTheme();
  const textColor = colors.text;
  const borderLight = colors.borderLight;
  const surfaceColor = colors.surface;

  const [quoteText, setQuoteText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textInputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    if (visible) {
      setQuoteText('');
      setValidationError(null);
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleQuote = async () => {
    if (!originalPost) return;

    if (quoteText.trim().length === 0) {
      setValidationError(t('QuoteTextRequired'));
      textInputRef.current?.focus();
      return;
    }

    if (quoteText.length > CHARACTER_LIMIT) {
      setValidationError(t('QuoteTextTooLong', { limit: CHARACTER_LIMIT }));
      return;
    }

    setIsPosting(true);
    setValidationError(null);

    try {
      const response = await feedService.quotePost(eventId, originalPost.id, {
        quoteText: quoteText.trim(),
      });
      const quotedPost = convertFeedPostToThreadPost(response);
      onQuote(quotedPost);
      setQuoteText('');
      onClose();
    } catch (error) {
      ErrorHandler.handle(error, 'quotePost');
      setValidationError(t('UnableToQuotePost'));
    } finally {
      setIsPosting(false);
    }
  };

  const charCount = quoteText.length;
  const charCountColor = charCount > CHARACTER_LIMIT - 20 ? colors.semantic.warning : textColor.tertiary;
  const canPost = quoteText.trim().length > 0 && quoteText.length <= CHARACTER_LIMIT && !isPosting;
  const postButtonBg = canPost ? textColor.primary : disabledButtonBackground;
  const postButtonText = canPost ? textColor.inverse : textColor.disabled;

  if (!originalPost) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-light-background dark:bg-dark-background" style={{ paddingTop: insets.top }}>
        <View
          className="flex-row items-center justify-between px-xl pt-lg pb-sm bg-light-background dark:bg-dark-background"
        >
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={24} color={textColor.primary} />
          </TouchableOpacity>
          <Text className="text-base font-semibold" style={{ color: textColor.primary }}>
            {t('QuotePost')}
          </Text>
          <TouchableOpacity
            onPress={handleQuote}
            disabled={!canPost}
            activeOpacity={0.7}
            className="px-md py-xs rounded-full"
            style={{ backgroundColor: postButtonBg }}
          >
            <Text className="text-sm font-semibold" style={{ color: postButtonText }}>
              {t('Quote')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-xl pt-lg">
            <TextInput
              ref={textInputRef}
              value={quoteText}
              onChangeText={text => {
                setQuoteText(text);
                if (validationError) {
                  setValidationError(null);
                }
              }}
              placeholder={t('AddAComment')}
              placeholderTextColor={textColor.tertiary}
              multiline
              maxLength={CHARACTER_LIMIT}
              className="text-base leading-relaxed"
              style={{ color: textColor.primary, minHeight: 120 }}
            />

            {validationError && (
              <View className="mt-sm">
                <Text className="text-sm" style={{ color: COLORS.semantic.error }}>
                  {validationError}
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-end mt-sm">
              <Text className="text-xs" style={{ color: charCountColor }}>
                {charCount}/{CHARACTER_LIMIT}
              </Text>
            </View>

            {/* Original Post Preview */}
            <View className="mt-xl rounded-xl border p-lg" style={{ borderColor: borderLight, backgroundColor: surfaceColor }}>
              <View className="flex-row items-center gap-md mb-sm">
                <Image
                  source={{ uri: getImageUrl(originalPost.user.avatar) || AVATAR_PLACEHOLDER }}
                  style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: borderLight }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-bold" style={{ color: textColor.primary }}>
                    {originalPost.user.name}
                  </Text>
                  <Text className="text-xs mt-[2px]" style={{ color: textColor.tertiary }}>
                    @{originalPost.user.handle} · {originalPost.timestamp}
                  </Text>
                </View>
              </View>

              {originalPost.text ? (
                <Text className="text-sm mb-sm leading-relaxed" style={{ color: textColor.primary }}>
                  {originalPost.text}
                </Text>
              ) : null}

              {originalPost.photos && originalPost.photos.length > 0 ? (
                <View className="mt-sm rounded-lg overflow-hidden">
                  <Image
                    source={{ uri: getImageUrl(originalPost.photos[0]) ?? originalPost.photos[0] }}
                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              {originalPost.video ? (
                <View className="mt-sm rounded-lg overflow-hidden bg-neutral-black">
                  <View style={{ width: '100%', height: 200, borderRadius: 8, backgroundColor: surfaceColor }} />
                  <Text className="text-xs text-center mt-2" style={{ color: textColor.tertiary }}>
                    Video
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
