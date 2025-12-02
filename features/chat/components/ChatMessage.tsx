import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { VenueCardDTO } from '../../../agent/types/assistant';
import { VenueMessageCard } from './VenueMessageCard';

const { width: screenWidth } = Dimensions.get('window');

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
    type?: 'text' | 'venue_card' | 'email_review';
    data?: any;
    isError?: boolean;
}

interface ChatMessageProps {
    message: Message;
    onVenueSelect: (venue: VenueCardDTO) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onVenueSelect }) => {
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

    if (message.type === 'venue_card' && message.data) {
        return (
            <View style={{ marginBottom: spacing.lg }}>
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
                    </View>
                    <View style={{
                        flex: 1,
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: borderRadius.xl,
                        padding: spacing.lg,
                        ...shadows.sm,
                    }}>
                        {message.text ? (
                            <Text style={{
                                color: colors.text.primary,
                                fontSize: typography.size.base,
                                lineHeight: typography.lineHeight.normal * typography.size.base,
                                marginBottom: spacing.md,
                            }}>
                                {message.text}
                            </Text>
                        ) : null}
                        {message.data.map((venue: VenueCardDTO) => (
                            <VenueMessageCard
                                key={venue.id}
                                venue={venue}
                                onPress={onVenueSelect}
                            />
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
        <View style={{
            marginBottom: spacing.lg,
            flexDirection: message.isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
        }}>
            <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: message.isError ? colors.semantic.error : (message.isUser ? colors.primary : colors.primary),
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
                ) : null}
            </View>
            <View style={{
                maxWidth: screenWidth * 0.7,
                backgroundColor: message.isError ? colors.semantic.error + '20' : (message.isUser ? colors.primary : colors.surfaceElevated),
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                borderWidth: message.isError ? 1 : 0,
                borderColor: message.isError ? colors.semantic.error : 'transparent',
                ...(message.isUser ? {} : shadows.sm),
            }}>
                <Text style={{
                    color: message.isError ? colors.semantic.error : (message.isUser ? colors.surfaceElevated : colors.text.primary),
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
