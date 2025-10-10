import React from 'react';
import { ImageBackground, View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  date: string;
  location: string;
  tagLeft?: string; // e.g., upcoming/completed
  tagRight?: string; // e.g., Creator
  imageUrl: string;
};

export const EventMiniCard = ({ title, date, location, tagLeft, tagRight, imageUrl }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
      <ImageBackground source={{ uri: imageUrl }} style={{ height: 160 }}>
        <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.18)' }} />
        {tagLeft ? (
          <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 12 }}>{tagLeft}</Text>
          </View>
        ) : null}
        {tagRight ? (
          <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(17,24,39,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{tagRight}</Text>
          </View>
        ) : null}
      </ImageBackground>
      <View style={{ padding: 12 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{date}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{location}</Text>
      </View>
    </View>
  );
};

