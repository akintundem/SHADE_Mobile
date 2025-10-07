import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

export const OrDivider = () => (
  <View style={styles.orWrap}>
    <View style={styles.hr} />
    <Text style={styles.orText}>or</Text>
    <View style={styles.hr} />
  </View>
);

