import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="small" color="#111827" />
      {message ? (
        <Text style={{ color: '#6B7280', marginTop: 12 }}>{message}</Text>
      ) : null}
    </View>
  );
}
