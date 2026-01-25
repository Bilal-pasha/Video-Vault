import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  Image,
  View,
  Platform,
} from 'react-native';
import { Film } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import type { SavedLink } from '@/services/links/links.types';
import {
  SOURCE_COLORS,
  formatCategory,
  truncate,
} from '../constants';

export function VideoBox({
  item,
  index,
  cardWidth,
  placeholderBg,
  iconColor,
  onPress,
}: {
  item: SavedLink;
  index: number;
  cardWidth: number;
  placeholderBg: string;
  iconColor: string;
  onPress: () => void;
}) {
  const title = item.title || truncate(item.url, 45);
  const badgeColor = SOURCE_COLORS[item.source] ?? SOURCE_COLORS.other;
  const [imgError, setImgError] = useState(false);
  const showThumb = Boolean(item.thumbnailUrl) && !imgError;
  const handleImgError = useCallback(() => setImgError(true), []);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .duration(380)
        .springify()
        .damping(14)}>
      <Pressable
        style={({ pressed }) => [
          styles.videoBox,
          { width: cardWidth, opacity: pressed ? 0.92 : 1 },
        ]}
        onPress={onPress}>
        <View style={[styles.thumbWrap, { aspectRatio: 16 / 9 }]}>
          {showThumb ? (
            <Image
              source={{ uri: item.thumbnailUrl! }}
              style={styles.thumbImage}
              resizeMode="cover"
              onError={handleImgError}
            />
          ) : (
            <View
              style={[
                styles.thumbPlaceholder,
                { backgroundColor: placeholderBg },
              ]}>
              <Film size={32} color={iconColor} />
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <ThemedText style={styles.badgeText}>
              {formatCategory(item.source) || 'Link'}
            </ThemedText>
          </View>
          {item.category ? (
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: 'rgba(0,0,0,0.5)' },
              ]}>
              <ThemedText style={styles.categoryChipText}>
                {formatCategory(item.category)}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.videoBoxFooter}>
          <ThemedText style={styles.videoBoxTitle} numberOfLines={2}>
            {title}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  videoBox: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  thumbWrap: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  categoryChip: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryChipText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  videoBoxFooter: { padding: 10 },
  videoBoxTitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
});
