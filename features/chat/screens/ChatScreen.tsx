import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaWrapper } from '../../../shared/components/SafeAreaWrapper';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { ArrowLeft, Mail, Send } from 'lucide-react-native';
import VenueDetailModal from '../components/VenueDetailModal';
import { VenueCardDTO } from '../../../shared/types';
import { ChatMessage, Message } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { useChat } from '../hooks/useChat';
import { getUser } from '../../../shared/storage/authStorage';

type ChatScreenRouteProp = RouteProp<{ params: { eventId?: string } }, 'params'>;

export default function ChatScreen({ onClose }: { onClose?: () => void }) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const eventId = route.params?.eventId || 'general'; // Default to general if not provided (e.g. from SocialApp)

  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    getUser<{ userId: string }>().then(user => {
      if (user?.userId) {
        setUserId(user.userId);
      }
    });
  }, []);

  const { messages, isLoading, sendMessage, sendVenueInquiry } = useChat({
    eventId,
    userId
  });

  const [inputText, setInputText] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('wedding');
  const [showEmailReview, setShowEmailReview] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueCardDTO | null>(null);
  const [showVenueDetail, setShowVenueDetail] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText(''); // Clear input immediately
    await sendMessage(text);
  };

  const handleVenueSelect = (venue: VenueCardDTO) => {
    setSelectedVenue(venue);
    setShowVenueDetail(true);
  };

  const handleSelectVenue = () => {
    setShowVenueDetail(false);
    // In a real app, this might trigger another API call or state update
    // For now, we can simulate a confirmation message via the hook if we wanted,
    // but the requirement was mainly to clean up the stubs.
    // Let's just add a simple local message or use the hook if we extended it.
    // For this refactor, I'll leave it as a UI action that might trigger the inquiry flow.
    sendMessage(`I'd like to select ${selectedVenue?.name} for my event.`);
  };

  const handleSendInquiry = () => {
    setShowVenueDetail(false);
    setShowEmailReview(true);
  };

  const handleSendEmail = async () => {
    if (selectedVenue) {
      await sendVenueInquiry(selectedVenue);
      setShowEmailReview(false);
    }
  };

  if (showEmailReview) {
    return (
      <SafeAreaWrapper edges={['top']}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Mail size={20} color={colors.brand.secondary} />
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.bold,
                marginLeft: spacing.sm,
              }}>
                Review Email
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowEmailReview(false)}>
              <Text style={{ fontSize: 20, color: colors.text.primary }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Email Content */}
          <ScrollView style={{ flex: 1, padding: spacing.lg }}>
            <View style={{ gap: spacing.lg }}>
              <View>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  marginBottom: spacing.xs,
                }}>
                  To
                </Text>
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                }}>
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                  }}>
                    Luxury Plaza Hotel
                  </Text>
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.sm,
                    marginTop: spacing.xs,
                  }}>
                    events@luxuryplaza.com
                  </Text>
                </View>
              </View>

              <View>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  marginBottom: spacing.xs,
                }}>
                  Subject
                </Text>
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                }}>
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                  }}>
                    Wedding Venue Inquiry - Luxury Plaza Hotel
                  </Text>
                </View>
              </View>

              <View>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  marginBottom: spacing.xs,
                }}>
                  Message
                </Text>
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  minHeight: 200,
                }}>
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    lineHeight: typography.lineHeight.normal * typography.size.base,
                  }}>
                    Dear Luxury Plaza Hotel Team,{'\n\n'}
                    I hope this message finds you well!{'\n\n'}
                    I'm currently planning my upcoming wedding and I came across your beautiful venue, Luxury Plaza Hotel.{'\n\n'}
                    I'm very interested in learning more about availability and would love to schedule a tour to see the space in person.{'\n\n'}
                    Could you please provide information about:{'\n'}
                    • Available dates for [Month Year]{'\n'}
                    • Package options and pricing{'\n'}
                    • Catering options{'\n'}
                    • Any special requirements or restrictions{'\n\n'}
                    Thank you for your time, and I look forward to hearing from you soon!{'\n\n'}
                    Best regards,{'\n'}
                    [Your Name]
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Send Button */}
          <View style={{
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <TouchableOpacity
              onPress={handleSendEmail}
              style={{
                backgroundColor: colors.text.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.md,
              }}
            >
              <Send size={20} color={colors.surfaceElevated} />
              <Text style={{
                color: colors.surfaceElevated,
                fontSize: typography.size.base,
                fontWeight: typography.weight.bold,
                marginLeft: spacing.sm,
              }}>
                Send Email
              </Text>
            </TouchableOpacity>
            <Text style={{
              color: colors.text.tertiary,
              fontSize: typography.size.xs,
              textAlign: 'center',
              marginTop: spacing.sm,
            }}>
              This will be sent on your behalf to the venue
            </Text>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}>
          <TouchableOpacity onPress={() => {
            if (onClose) {
              onClose();
            } else {
              navigation.goBack();
            }
          }}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.sm,
            }}>
              <Text style={{ fontSize: 18 }}>🎉</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.base,
                fontWeight: typography.weight.bold,
              }}>
                Shade
              </Text>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
              }}>
                Your AI Event Planner
              </Text>
            </View>
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onVenueSelect={handleVenueSelect}
            />
          ))}
        </ScrollView>

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          selectedEventType={selectedEventType}
          setSelectedEventType={setSelectedEventType}
        />
      </KeyboardAvoidingView>

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <VenueDetailModal
          visible={showVenueDetail}
          venue={selectedVenue}
          onClose={() => setShowVenueDetail(false)}
          onSelectVenue={handleSelectVenue}
          onSendInquiry={handleSendInquiry}
        />
      )}
    </SafeAreaWrapper>
  );
}
