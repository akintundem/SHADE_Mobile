import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { useTheme } from '../theme/ThemeProvider';
import { ArrowLeft, Moon, Mic, Send, Star, MapPin, Users, Heart, Mail } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  type?: 'text' | 'venue_card' | 'email_review';
  data?: any;
}

interface VenueCard {
  id: string;
  name: string;
  location: string;
  capacity: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
}

const sampleVenues: VenueCard[] = [
  {
    id: '1',
    name: 'Grand Ballroom Estate',
    location: 'Downtown',
    capacity: '200-300 guests',
    price: '$8,000 - $12,000',
    rating: 4.8,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1519167758481-83f142b8d0c1?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Enchanted Garden Estate',
    location: 'Countryside',
    capacity: '150-250 guests',
    price: '$6,500 - $10,000',
    rating: 4.9,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1519167758481-83f142b8d0c1?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Rustic Barn & Vineyard',
    location: 'Wine Country',
    capacity: '100-200 guests',
    price: '$5,500 - $9,000',
    rating: 4.7,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1519167758481-83f142b8d0c1?w=400&h=300&fit=crop',
  },
];

const eventTypes = [
  { id: 'wedding', label: 'Wedding', icon: '⛪', color: '#8B5CF6' },
  { id: 'birthday', label: 'Birthday', icon: '🎂', color: '#F59E0B' },
  { id: 'corporate', label: 'Corp', icon: '💼', color: '#8B5CF6' },
];

export default function ChatScreen({ onClose }: { onClose: () => void }) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! 👋 I'm Shade, and I'm so excited to help you plan something special! Whether it's a dreamy wedding, an unforgettable birthday bash, or a professional corporate event, I've got you covered from start to finish.\n\nI can help with venues, guest lists, budgets, invitations, and so much more. What kind of celebration are we planning together? 🎉",
      isUser: false,
      timestamp: '12:18 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('wedding');
  const [showEmailReview, setShowEmailReview] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "OMG, congratulations! 💍✨ This is such an exciting time! I found 5 amazing wedding venues that would be perfect for your special day. Take a look and tap on any venue to see more details!",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'venue_card',
        data: sampleVenues,
      };
      setMessages(prev => [...prev, aiResponse]);
      scrollToBottom();
    }, 1000);

    scrollToBottom();
  };

  const handleVenueSelect = (venue: VenueCard) => {
    setShowEmailReview(true);
  };

  const handleSendEmail = () => {
    setShowEmailReview(false);
    // Add success message
    const successMessage: Message = {
      id: Date.now().toString(),
      text: "Perfect! I've sent your inquiry to Luxury Plaza Hotel. They typically respond within 24 hours. I'll keep you updated on their response!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, successMessage]);
    scrollToBottom();
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'venue_card' && message.data) {
      return (
        <View key={message.id} style={{ marginBottom: spacing.lg }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: spacing.sm,
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.sm,
            }}>
              <Text style={{ fontSize: 16 }}>🎉</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: colors.surfaceElevated,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              ...shadows.sm,
            }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.base,
                lineHeight: typography.lineHeight.normal * typography.size.base,
                marginBottom: spacing.md,
              }}>
                {message.text}
              </Text>
              {message.data.map((venue: VenueCard) => (
                <TouchableOpacity
                  key={venue.id}
                  onPress={() => handleVenueSelect(venue)}
                  style={{
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.md,
                    ...shadows.sm,
                  }}
                >
                  <Image
                    source={{ uri: venue.image }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderTopLeftRadius: borderRadius.lg,
                      borderTopRightRadius: borderRadius.lg,
                    }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute',
                    top: spacing.sm,
                    right: spacing.sm,
                    backgroundColor: colors.text.primary,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={{
                      color: colors.surfaceElevated,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.semibold,
                      marginLeft: spacing.xs,
                    }}>
                      {venue.rating}
                    </Text>
                  </View>
                  <View style={{ padding: spacing.lg }}>
                    <Text style={{
                      color: colors.text.primary,
                      fontSize: typography.size.lg,
                      fontWeight: typography.weight.bold,
                      marginBottom: spacing.sm,
                    }}>
                      {venue.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                      <MapPin size={14} color={colors.text.secondary} />
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.sm,
                        marginLeft: spacing.xs,
                      }}>
                        {venue.location}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Users size={14} color={colors.text.secondary} />
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.sm,
                        marginLeft: spacing.xs,
                      }}>
                        {venue.capacity}
                      </Text>
                    </View>
                    <Text style={{
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.semibold,
                    }}>
                      {venue.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Text style={{
            color: colors.text.tertiary,
            fontSize: typography.size.xs,
            marginLeft: 44,
          }}>
            {message.timestamp}
          </Text>
        </View>
      );
    }

    return (
      <View key={message.id} style={{
        marginBottom: spacing.lg,
        flexDirection: message.isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: message.isUser ? colors.brand.primary : colors.brand.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: spacing.sm,
        }}>
          {message.isUser ? (
            <View style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: colors.surfaceElevated,
            }} />
          ) : (
            <Text style={{ fontSize: 16 }}>🎉</Text>
          )}
        </View>
        <View style={{
          maxWidth: screenWidth * 0.7,
          backgroundColor: message.isUser ? colors.brand.primary : colors.surfaceElevated,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          ...(message.isUser ? {} : shadows.sm),
        }}>
          <Text style={{
            color: message.isUser ? colors.surfaceElevated : colors.text.primary,
            fontSize: typography.size.base,
            lineHeight: typography.lineHeight.normal * typography.size.base,
          }}>
            {message.text}
          </Text>
        </View>
        <Text style={{
          color: colors.text.tertiary,
          fontSize: typography.size.xs,
          marginTop: spacing.sm,
          marginHorizontal: spacing.sm,
        }}>
          {message.timestamp}
        </Text>
      </View>
    );
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
    <SafeAreaWrapper edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          <TouchableOpacity onPress={onClose}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xs,
            }}>
              <Text style={{ fontSize: 24 }}>🎉</Text>
            </View>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
              marginBottom: 2,
            }}>
              Shade
            </Text>
            <Text style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
            }}>
              Your AI Event Planner
            </Text>
          </View>

          <TouchableOpacity>
            <Moon size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input Area */}
        <View style={{
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          {/* Event Type Suggestions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: spacing.md }}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedEventType(type.id)}
                style={{
                  backgroundColor: selectedEventType === type.id ? colors.surfaceElevated : colors.surface,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...(selectedEventType === type.id ? shadows.sm : {}),
                }}
              >
                <Text style={{ fontSize: 16, marginRight: spacing.xs }}>{type.icon}</Text>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium,
                }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Tell me about your event..."
              placeholderTextColor={colors.text.tertiary}
              style={{
                flex: 1,
                color: colors.text.primary,
                fontSize: typography.size.base,
                paddingVertical: spacing.sm,
                maxHeight: 100,
              }}
              multiline
            />
            <TouchableOpacity style={{ marginLeft: spacing.sm }}>
              <Mic size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.text.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing.sm,
                opacity: inputText.trim() ? 1 : 0.5,
              }}
            >
              <Send size={16} color={colors.surfaceElevated} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
