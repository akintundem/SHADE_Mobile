import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './common/theme/ThemeProvider';
import BrandLogo from './common/components/brand/BrandLogo';

type Props = {
  user: any;
};

export default function WelcomeScreen({ user }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background,
      }}
      edges={['top', 'bottom']}
    >
      <StatusBar 
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.background}
      />
      <View style={{ 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
      }}>
        <View style={{ alignItems: 'center', marginBottom: spacing['6xl'] }}>
          <BrandLogo
            size={80}
            borderRadius={18}
            style={{
              marginBottom: spacing['2xl'],
            }}
          />
          
          <Text style={{
            fontSize: typography.size['5xl'],
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            letterSpacing: -1.5,
            marginBottom: spacing.md,
            textAlign: 'center',
          }}>
            Welcome
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

