import React from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';

type Props = { children: React.ReactNode };

export default function ThemeProvider({ children }: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </View>
  );
}

