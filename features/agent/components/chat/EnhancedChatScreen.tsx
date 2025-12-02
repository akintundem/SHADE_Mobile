import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  PanResponder,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../common/components/SafeAreaWrapper';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { ArrowLeft, Mic, Send } from 'lucide-react-native';
import { ChatRequest, AssistantChatResponse, VenueCardDTO, EmailCardDTO, ApprovalCardDTO, TaskCardDTO, BudgetCardDTO, TimelineCardDTO } from '../../types/events';
import { assistantService } from '../../services/assistantService';
import StructuredMessageRenderer from './StructuredMessageRenderer';
import { useErrorHandler } from '../../../../common/hooks/useErrorHandler';
import ErrorModal from '../../../../common/components/common/ErrorModal';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  type?: 'text' | 'structured';
  structuredResponse?: any;
}

interface EnhancedChatScreenProps {
  onClose: () => void;
  eventId?: string;
}

export default function EnhancedChatScreen({ onClose, eventId }: EnhancedChatScreenProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! 👋 I'm Shade, your AI event planning assistant. I can help you with venues, budgets, timelines, approvals, and so much more! What would you like to plan today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const inputPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes when keyboard is open
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState) => {
        // If user swiped down significantly, dismiss keyboard
        if (gestureState.dy > 50) {
          Keyboard.dismiss();
        }
      },
    })
  ).current;

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        message: currentInput,
        eventId,
        context: {
          previousMessages: messages.slice(-5).map(m => ({ text: m.text, isUser: m.isUser }))
        }
      };

      const response = await assistantService.chat(chatRequest);
      
      if (response.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: response.data.structuredResponse ? 'structured' : 'text',
          structuredResponse: response.data.structuredResponse
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      handleError(err, 'Sending message');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleVenueSelect = (venue: VenueCardDTO) => {
    console.log('Venue selected:', venue);
    // Handle venue selection
  };

  const handleEmailAction = (email: EmailCardDTO, action: string) => {
    console.log('Email action:', action, email);
    // Handle email actions
  };

  const handleApprovalAction = (approval: ApprovalCardDTO, action: string) => {
    console.log('Approval action:', action, approval);
    // Handle approval actions
  };

  const handleTaskAction = (task: TaskCardDTO, action: string) => {
    console.log('Task action:', action, task);
    // Handle task actions
  };

  const handleBudgetAction = (budget: BudgetCardDTO, action: string) => {
    console.log('Budget action:', action, budget);
    // Handle budget actions
  };

  const handleTimelineAction = (timeline: TimelineCardDTO, action: string) => {
    console.log('Timeline action:', action, timeline);
    // Handle timeline actions
  };

  const handleChipPress = (chip: any) => {
    console.log('Chip pressed:', chip);
    // Handle chip interactions
  };

  const handleActionButtonPress = (button: any) => {
    console.log('Action button pressed:', button);
    // Handle action button interactions
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'structured' && message.structuredResponse) {
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
              backgroundColor: colors.primary,
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
              <StructuredMessageRenderer
                structuredResponse={message.structuredResponse}
                onVenueSelect={handleVenueSelect}
                onEmailAction={handleEmailAction}
                onApprovalAction={handleApprovalAction}
                onTaskAction={handleTaskAction}
                onBudgetAction={handleBudgetAction}
                onTimelineAction={handleTimelineAction}
                onChipPress={handleChipPress}
                onActionButtonPress={handleActionButtonPress}
              />
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
        alignItems: 'flex-end',
      }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: message.isUser ? colors.primary : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: spacing.sm,
          marginBottom: 2,
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
          backgroundColor: message.isUser ? colors.primary : colors.surfaceElevated,
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
          marginHorizontal: spacing.sm,
          marginBottom: 2,
        }}>
          {message.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaWrapper edges={['top', 'bottom']}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
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
          <TouchableOpacity onPress={onClose}>
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
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: spacing.lg,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.sm,
              }}>
                <Text style={{ fontSize: 16 }}>🎉</Text>
              </View>
              <View style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                ...shadows.sm,
              }}>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.base,
                  fontStyle: 'italic',
                }}>
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area - Clean & Elegant */}
        <View style={{
          backgroundColor: colors.background,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          {/* Input Container */}
          <View 
            {...inputPanResponder.panHandlers}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              minHeight: 48,
            }}
          >
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Tell me about your event..."
              placeholderTextColor={colors.text.tertiary}
              style={{
                flex: 1,
                color: colors.text.primary,
                fontSize: typography.size.base,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.xs,
                minHeight: 44,
                maxHeight: 100,
                textAlignVertical: 'center',
              }}
              multiline
              editable={!isLoading}
              returnKeyType="default"
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={{ 
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing.xs,
              }}
              activeOpacity={0.6}
              disabled={isLoading}
            >
              <Mic size={18} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: (inputText.trim() && !isLoading) ? colors.text.primary : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing.xs,
                opacity: (inputText.trim() && !isLoading) ? 1 : 0.4,
              }}
              activeOpacity={0.8}
            >
              <Send size={16} color={colors.surfaceElevated} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
