import React from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import { getImageUrl } from '../../../config/appConfig';

const HORIZONTAL_PADDING = 20;

export function PhotoGrid({ urls }: { urls: string[] }) {
  const { width } = useWindowDimensions();
  const availableWidth = width - HORIZONTAL_PADDING * 2;
  const gap = 4;
  const resolved = urls.map(u => getImageUrl(u) ?? u);
  const n = resolved.length;

  if (n === 1) {
    return (
      <View className="mt-md rounded-xl overflow-hidden">
        <Image source={{ uri: resolved[0] }} className="h-[360px] w-full" resizeMode="cover" />
      </View>
    );
  }

  if (n === 2) {
    const imageWidth = (availableWidth - gap) / 2;
    return (
      <View className="mt-md flex-row" style={{ gap }}>
        {resolved.map((u, i) => (
          <View key={i} className="rounded-xl overflow-hidden" style={{ width: imageWidth }}>
            <Image source={{ uri: u }} className="h-[200px] w-full" resizeMode="cover" />
          </View>
        ))}
      </View>
    );
  }

  if (n === 3) {
    const imageWidth = (availableWidth - gap) / 2;
    return (
      <View className="mt-md flex-row" style={{ gap }}>
        <View className="rounded-xl overflow-hidden" style={{ width: imageWidth }}>
          <Image source={{ uri: resolved[0] }} className="h-[200px] w-full" resizeMode="cover" />
        </View>
        <View style={{ width: imageWidth, gap }}>
          {resolved.slice(1).map((u, i) => (
            <View key={i} className="rounded-xl overflow-hidden">
              <Image source={{ uri: u }} className="h-[96px] w-full" resizeMode="cover" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // 4+
  return (
    <View className="mt-md flex-row" style={{ gap }}>
      <View style={{ width: (availableWidth - gap) / 2, gap }}>
        {[resolved[0], resolved[2]].map((u, i) => (
          <View key={i} className="rounded-xl overflow-hidden">
            <Image source={{ uri: u }} className="h-[96px] w-full" resizeMode="cover" />
          </View>
        ))}
      </View>
      <View style={{ width: (availableWidth - gap) / 2, gap }}>
        {[resolved[1], resolved[3]].map((u, i) => (
          <View key={i} className="rounded-xl overflow-hidden">
            <Image source={{ uri: u }} className="h-[96px] w-full" resizeMode="cover" />
          </View>
        ))}
      </View>
    </View>
  );
}
