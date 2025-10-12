import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, View, ViewToken } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { TrendingCard, TrendingItem } from './TrendingCard';
import { FeaturedCard, FeaturedItem } from './FeaturedCard';

type Props = {
  items: TrendingItem[];
  autoPlayIntervalMs?: number;
};

export const FeaturedCarousel = ({ items, autoPlayIntervalMs = 5000 }: Props) => {
  const { spacing, colors, borderRadius } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const outerPad = spacing.lg;
  const gap = spacing.md;
  const cardWidth = screenWidth - outerPad * 2;

  const listRef = useRef<FlatList<TrendingItem>>(null);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const viewableRef = useRef<{ viewableItems: ViewToken[]; changed: ViewToken[] } | null>(null);

  const data = useMemo(() => items.map(i => ({ ...i, typeLabel: i.typeLabel || 'Featured' })), [items]);

  function scrollTo(i: number) {
    listRef.current?.scrollToIndex({ index: i, animated: true });
  }

  function startAutoPlay() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % data.length;
        scrollTo(next);
        return next;
      });
    }, autoPlayIntervalMs);
  }

  function stopAutoPlay() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (data.length > 1) startAutoPlay();
    return () => stopAutoPlay();
  }, [data.length]);

  return (
    <View style={{ paddingVertical: spacing.md }}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, marginRight: gap }}>
            <FeaturedCard item={{
              id: item.id,
              title: item.title,
              subtitle: item.description,
              date: item.date,
              location: item.location,
              imageUrl: item.imageUrl,
            }} />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={cardWidth + gap}
        decelerationRate="fast"
        pagingEnabled
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const newIndex = Math.round(x / (cardWidth + gap));
          setIndex(Math.min(Math.max(newIndex, 0), data.length - 1));
        }}
        contentContainerStyle={{ paddingHorizontal: outerPad }}
        getItemLayout={(_, i) => ({ length: cardWidth + gap, offset: (cardWidth + gap) * i, index: i })}
      />

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
        {data.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === index ? colors.text.primary : colors.divider,
            }}
          />
        ))}
      </View>
    </View>
  );
};


