import { useEffect, useRef } from 'react';
import { Animated, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import BrandLogo from './brand/BrandLogo';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const ICON_SIZE = 80;
  const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);

  // Animated values for fade-in and scale
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo fade-in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ],
        }}
      >
        <BrandLogo
          size={ICON_SIZE}
          borderRadius={ICON_RADIUS}
          style={{ marginBottom: spacing['3xl'] }}
        />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={{
          color: colors.text.primary,
          fontSize: typography.size['3xl'],
          fontWeight: typography.weight.bold,
          letterSpacing: -0.5,
          marginBottom: spacing.lg,
          textAlign: 'center',
        }}>
          {t('Shade')}
        </Text>

        <Text style={{
          color: colors.text.tertiary,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.medium,
          letterSpacing: 2,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}>
          {message || t('WelcomeShade')}
        </Text>

        <ActivityIndicator size="small" color={colors.text.tertiary} />
      </Animated.View>
    </View>
  );
}
