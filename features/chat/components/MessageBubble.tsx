import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  return (
    <View style={{
      marginBottom: spacing.lg,
      flexDirection: message.isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.brand.primary,
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
        )}
      </View>
      <View style={{
        maxWidth: '70%',
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
}
