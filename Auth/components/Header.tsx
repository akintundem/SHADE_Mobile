import React from 'react';
import { View, Text } from 'react-native';
import { Music } from 'lucide-react-native';
import { styles } from '../styles';

export const Header = () => (
  <View style={styles.headerWrap}>
    <View style={styles.logoCircle}>
      <Music color="#fff" size={28} />
    </View>
    <Text style={styles.title}>SoundVerse</Text>
    <Text style={styles.subtitle}>Music discovery reimagined</Text>
  </View>
);

