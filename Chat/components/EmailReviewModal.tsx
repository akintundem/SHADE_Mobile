import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaWrapper } from '../../components/SafeAreaWrapper';
import { useTheme } from '../../theme/ThemeProvider';
import { Mail, Send } from 'lucide-react-native';

interface EmailReviewModalProps {
  onClose: () => void;
  onSend: () => void;
}

export default function EmailReviewModal({ onClose, onSend }: EmailReviewModalProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

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
          <TouchableOpacity onPress={onClose}>
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
            onPress={onSend}
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
