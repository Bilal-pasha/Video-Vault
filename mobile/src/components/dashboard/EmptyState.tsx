import { StyleSheet } from 'react-native';
import { Film } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { HORZ_PADDING } from './constants';

export function EmptyState({
  hasFilters,
  borderColor,
  iconColor,
}: {
  hasFilters: boolean;
  borderColor: string;
  iconColor: string;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(100).duration(400)}
      style={[styles.empty, { borderColor }]}>
      <Film size={48} color={iconColor} style={styles.icon} />
      <ThemedText style={[styles.text, { color: iconColor }]}>
        {hasFilters
          ? 'No videos match your filters.'
          : 'Share a link from Instagram, Facebook, Twitter, or TikTok to save it here.'}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginHorizontal: HORZ_PADDING,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  icon: { marginBottom: 12 },
  text: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
