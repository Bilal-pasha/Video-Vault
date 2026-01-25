import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FilterPill } from './FilterPill';
import { HORZ_PADDING, SOURCES, CATEGORIES } from './constants';
import type { LinkSource, LinkCategory } from '@/services/links/links.types';

export function DashboardFilters({
  source,
  category,
  onSourceChange,
  onCategoryChange,
  iconColor,
}: {
  source: '' | LinkSource;
  category: '' | LinkCategory;
  onSourceChange: (s: '' | LinkSource) => void;
  onCategoryChange: (c: '' | LinkCategory) => void;
  iconColor: string;
}) {
  return (
    <>
      <Animated.View entering={FadeIn.delay(120).duration(400)}>
        <ThemedText style={[styles.label, { color: iconColor }]}>
          Platform
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}>
          {SOURCES.map((item) => (
            <FilterPill
              key={item.key || 'all'}
              item={item}
              active={source === item.key}
              onPress={() => onSourceChange(item.key)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(160).duration(400)}>
        <ThemedText style={[styles.label, { color: iconColor }]}>
          Category
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}>
          {CATEGORIES.map((item) => (
            <FilterPill
              key={item.key || 'all'}
              item={item}
              active={category === item.key}
              onPress={() => onCategoryChange(item.key)}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: HORZ_PADDING,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: HORZ_PADDING,
    marginBottom: 20,
  },
});
