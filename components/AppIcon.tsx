import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface AppIconProps {
  size?: number;
  color?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 28, color }) => {
  const { colors } = useTheme();
  const iconColor = color || colors.textPrimary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Umbrella icon using View components */}
      <View style={[styles.umbrellaTop, { backgroundColor: iconColor }]} />
      <View style={[styles.umbrellaHandle, { backgroundColor: iconColor }]} />
      <View style={[styles.umbrellaTip, { backgroundColor: iconColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  umbrellaTop: {
    width: '85%',
    height: '50%',
    borderRadius: 50,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 1,
  },
  umbrellaHandle: {
    width: 3,
    height: '35%',
    borderRadius: 1.5,
  },
  umbrellaTip: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'inherit',
    marginTop: -2,
  },
});
