import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Bot, Sparkles } from 'lucide-react-native';
import { useAgent } from '../Agent/AgentProvider';

export const AgentBanner = ({ onOpenChat, onSelect }: { onOpenChat: () => void; onSelect?: (text: string) => void }) => {
  const { colors, borderRadius, spacing, typography, brand, shadows } = useTheme();
  const { suggestions } = useAgent();
  if (!suggestions?.length) return null;
  const primary = suggestions[0];
  const isRisk = primary.type === 'risk';

  // Subtle pulse on the avatar to make it feel alive
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <TouchableOpacity onPress={onOpenChat} activeOpacity={0.9}>
      <View style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: borderRadius['2xl'] || borderRadius.xl,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...shadows.sm,
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${brand.primary}22`, alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color={brand.primary} />
          </View>
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
            {isRisk ? 'Shade spotted a risk' : 'Shade has a suggestion'}
          </Text>
          {/* conversational list inside the banner */}
          <View style={{ marginTop: spacing.xs, gap: 6 }}>
            {suggestions.slice(0, 3).map((s, idx) => (
              <TouchableOpacity key={idx} activeOpacity={0.85} onPress={() => onSelect?.(s.text)}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: 6, backgroundColor: s.type === 'risk' ? '#ef4444' : brand.primary }} />
                  <Text style={{ color: s.type === 'risk' ? colors.text.primary : colors.text.secondary, flex: 1 }} numberOfLines={2}>
                    {s.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ backgroundColor: brand.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={'#FFFFFF'} />
              <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>Open Shade</Text>
            </View>
          </View>
        </View>
        {/* small bubble tail */}
        <View style={{ position: 'absolute', left: 22, bottom: -6, width: 12, height: 12, backgroundColor: colors.card, transform: [{ rotate: '45deg' }], borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.border }} />
      </View>
    </TouchableOpacity>
  );
};


