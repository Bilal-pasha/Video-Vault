import { useCallback, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/providers/AuthProvider';
import { useLinks } from '@/services/links/links.services';
import type { LinkSource, LinkCategory } from '@/services/links/links.types';

import {
  getColumns,
  HORZ_PADDING,
  CARD_GAP,
} from '@/components/dashboard/constants';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSearch } from '@/components/dashboard/DashboardSearch';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { VideoBox } from '@/components/dashboard/VideoBox';
import { EmptyState } from '@/components/dashboard/EmptyState';
import React from 'react';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<'' | LinkSource>('');
  const [category, setCategory] = useState<'' | LinkCategory>('');

  const columns = getColumns(width);
  const cardWidth =
    (width - HORZ_PADDING * 2 - CARD_GAP * (columns - 1)) / columns;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#E5E5E5', dark: '#2D2D2D' },
    'icon',
  );
  const inputBg = useThemeColor(
    { light: '#F5F5F5', dark: '#1C1C1E' },
    'background',
  );
  const iconColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const placeholderBg = useThemeColor(
    { light: '#E8E8ED', dark: '#2C2C2E' },
    'background',
  );

  const { data: links = [], isLoading } = useLinks({
    search: search.trim() || undefined,
    source: source || undefined,
    category: category || undefined,
  });

  const handleOpenLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const hasFilters = Boolean(search.trim() || source || category);

  return (
    <ThemedView
      style={[styles.container, { backgroundColor, paddingTop: insets.top || 40 }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <DashboardHeader
          userEmail={user?.email}
          iconColor={iconColor}
          inputBg={inputBg}
          onNotificationPress={() => { }}
          onSignOut={signOut}
        />

        <DashboardSearch
          value={search}
          onChangeText={setSearch}
          placeholder="Search videos..."
          textColor={textColor}
          iconColor={iconColor}
          inputBg={inputBg}
        />

        <DashboardFilters
          source={source}
          category={category}
          onSourceChange={setSource}
          onCategoryChange={setCategory}
          iconColor={iconColor}
        />

        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Saved videos
          </ThemedText>
          <ThemedText style={[styles.sectionCount, { color: iconColor }]}>
            {links.length} {links.length === 1 ? 'video' : 'videos'}
          </ThemedText>
        </Animated.View>

        {isLoading ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.loading}>
            <ActivityIndicator size="large" color="#2563EB" />
          </Animated.View>
        ) : links.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            borderColor={borderColor}
            iconColor={iconColor}
          />
        ) : (
          <View
            style={[
              styles.grid,
              { gap: CARD_GAP, paddingHorizontal: HORZ_PADDING },
            ]}>
            {links.map((item, index) => (
              <VideoBox
                key={item.id}
                item={item}
                index={index}
                cardWidth={cardWidth}
                placeholderBg={placeholderBg}
                iconColor={iconColor}
                onPress={() => handleOpenLink(item.url)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: HORZ_PADDING,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  sectionCount: { fontSize: 14 },
  loading: { paddingVertical: 48, alignItems: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 24,
  },
});
