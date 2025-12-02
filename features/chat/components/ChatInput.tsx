import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, PanResponder, Keyboard } from 'react-native';
import { Mic, Send } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { eventTypes } from '../data/chatData';

interface ChatInputProps {
    inputText: string;
    setInputText: (text: string) => void;
    onSendMessage: () => void;
    selectedEventType: string;
    setSelectedEventType: (id: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputText,
    setInputText,
    onSendMessage,
    selectedEventType,
    setSelectedEventType,
}) => {
    const { colors, spacing, typography, borderRadius } = useTheme();

    const inputPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: () => { },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    Keyboard.dismiss();
                }
            },
        })
    ).current;

    return (
        <View style={{
            backgroundColor: colors.background,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        }}>
            {/* Event Type Suggestions */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: spacing.sm }}
                contentContainerStyle={{ paddingRight: spacing.md }}
            >
                {eventTypes.map((type, index) => (
                    <TouchableOpacity
                        key={type.id}
                        onPress={() => setSelectedEventType(type.id)}
                        style={{
                            backgroundColor: selectedEventType === type.id ? colors.surfaceElevated : colors.surface,
                            borderRadius: borderRadius.full,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: index < eventTypes.length - 1 ? spacing.xs : 0,
                        }}
                    >
                        <Text style={{ fontSize: 14, marginRight: spacing.xs / 2 }}>{type.icon}</Text>
                        <Text style={{
                            color: colors.text.primary,
                            fontSize: typography.size.xs,
                            fontWeight: typography.weight.medium,
                        }}>
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

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
                    editable
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
                >
                    <Mic size={18} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onSendMessage}
                    disabled={!inputText.trim()}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: inputText.trim() ? colors.text.primary : colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: spacing.xs,
                        opacity: inputText.trim() ? 1 : 0.4,
                    }}
                    activeOpacity={0.8}
                >
                    <Send size={16} color={colors.surfaceElevated} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
