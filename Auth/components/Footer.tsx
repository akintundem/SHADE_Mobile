import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStyles } from '../styles';

export const Footer = () => {
  const styles = useAuthStyles();
  return (
    <View style={styles.footerWrap}>
      <View style={styles.footerHr} />
      <Text style={styles.footerText}>
        By continuing, you agree to our <Text style={styles.footerLink}>Terms</Text> and{' '}
        <Text style={styles.footerLink}>Privacy Policy</Text>
      </Text>
    </View>
  );
};

