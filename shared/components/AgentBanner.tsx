import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Bot, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { useAgent } from '../../features/agent/Agent/AgentProvider';

export const AgentBanner = ({
  onOpenChat,
  onSelect,
}: {
  onOpenChat: () => void;
  onSelect?: (text: string) => void;
}) => {
  const { colors, borderRadius, spacing, typography, brand, shadows } =
    useTheme();
  const { suggestions } = useAgent();
  if (!suggestions?.length) return null;
  const primary = suggestions[0];
  const isRisk = primary.type === 'risk';

  // Get semantic colors based on type with proper dark mode support
  const getSemanticColors = () => {
    if (isRisk) {
      // Check if we're in dark mode by looking at background color
      const isDark =
        colors.background === '#000000' || colors.background === '#111827';
      return {
        background: isDark
          ? 'rgba(220, 38, 38, 0.15)'
          : 'rgba(220, 38, 38, 0.08)',
        borderColor: colors.semantic?.error || '#DC2626',
        iconBackground: isDark
          ? 'rgba(220, 38, 38, 0.25)'
          : 'rgba(220, 38, 38, 0.15)',
        iconColor: isDark ? '#FCA5A5' : '#DC2626',
        dotColor: isDark ? '#FCA5A5' : '#DC2626',
        Icon: AlertTriangle,
      };
    }
    const isDark =
      colors.background === '#000000' || colors.background === '#111827';
    return {
      background: isDark
        ? 'rgba(245, 158, 11, 0.15)'
        : 'rgba(245, 158, 11, 0.08)',
      borderColor: isDark ? '#FBBF24' : '#F59E0B',
      iconBackground: isDark
        ? 'rgba(245, 158, 11, 0.25)'
        : 'rgba(245, 158, 11, 0.15)',
      iconColor: isDark ? '#FBBF24' : '#F59E0B',
      dotColor: isDark ? '#FBBF24' : '#F59E0B',
      Icon: Lightbulb,
    };
  };

  const semanticColors = getSemanticColors();

  // Subtle pulse on the icon to make it feel alive
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View
      style={{
        backgroundColor: semanticColors.background,
        borderColor: semanticColors.borderColor,
        borderWidth: 1.5,
        borderRadius: borderRadius['2xl'] || borderRadius.xl,
        padding: spacing.lg,
        // ...shadows.md,
      }}
    >
      {/* Icon and suggestions */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.md,
           marginBottom: 20
        }}
      >
        {/* <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: semanticColors.iconBackground,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: semanticColors.borderColor,
          }}>
            <semanticColors.Icon size={22} color={semanticColors.iconColor} strokeWidth={2.5} />
          </View>
        </Animated.View> */}
        <View style={{ flex: 1, marginBottom: 20 }}>
          {/* Suggestions list */}
          <View style={{ gap: 12 }}>
            {suggestions.slice(0, 3).map((s, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                onPress={() => onSelect?.(s.text)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      marginTop: 2,
                      backgroundColor: semanticColors.dotColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {s.type === 'risk' ? (
                      <AlertTriangle
                        size={10}
                        color={colors.background}
                        strokeWidth={3}
                      />
                    ) : (
                      <Lightbulb
                        size={10}
                        color={colors.background}
                        strokeWidth={3}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      color: colors.text.primary,
                      flex: 1,
                      fontSize: typography.size.sm,
                      lineHeight: typography.size.sm * 1.5,
                    }}
                    numberOfLines={2}
                  >
                    {s.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.divider,
          marginVertical: spacing.md,
        }}
      />

      {/* Bottom section with label and button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
          }}
        >
          {isRisk ? 'Shade spotted a risk' : 'Shade has a suggestion'}
        </Text>
        <TouchableOpacity
          onPress={onOpenChat}
          activeOpacity={0.85}
          style={{
            backgroundColor: brand.secondary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 999,
            ...shadows.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color={colors.background} />
            <Text
              style={{
                color: colors.background,
                fontWeight: typography.weight.semibold,
                fontSize: typography.size.sm,
              }}
            >
              Open Shade
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
