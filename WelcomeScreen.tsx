import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaWrapper } from './common/components/SafeAreaWrapper';
import { useTheme } from './common/theme/ThemeProvider';

type Props = {
  user: any;
};

export default function WelcomeScreen({ user }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 32,
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          letterSpacing: -1,
        }}>
          welcome
        </Text>
      </View>
    </SafeAreaWrapper>
  );
}

