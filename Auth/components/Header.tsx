import React from 'react';
import { View, Text } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useAuthStyles } from '../styles';

export const Header = () => {
  const styles = useAuthStyles();
  return (
    <View style={styles.headerWrap}>
      <View style={styles.logoCircle}>
        <AppIcon size={28} color="#fff" />
      </View>
      <Text style={styles.title}>Shade</Text>
      <Text style={styles.subtitle}>Your personal sanctuary</Text>
    </View>
  );
};

