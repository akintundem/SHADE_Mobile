import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStyles } from '../styles';

export const OrDivider = () => {
  const styles = useAuthStyles();
  return (
    <View style={styles.orWrap}>
      <View style={styles.hr} />
      <Text style={styles.orText}>or</Text>
      <View style={styles.hr} />
    </View>
  );
};

