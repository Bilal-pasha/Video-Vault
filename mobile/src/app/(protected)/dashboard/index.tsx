import { useCallback, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  ActivityIndicator,
  Image,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { User, Bell, LogOut, Search, Film } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/providers/AuthProvider';
import { useLinks } from '@/services/links/links.services';
import type {
  SavedLink,
  LinkSource,
  LinkCategory,
} from '@/services/links/links.types';

const SOURCES: { key: '' | LinkSource; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'other', label: 'Other' },
];

const CATEGORIES: { key: '' | LinkCategory; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'nature', label: 'Nature' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'food', label: 'Food' },
  { key: 'sports', label: 'Sports' },
  { key: 'music', label: 'Music' },
  { key: 'tech', label: 'Tech' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'other', label: 'Other' },
];

const SOURCE_COLORS: Record<LinkSource, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  other: '#6B7280',
};

const getColumns = (width: number) =>
  width < 380 ? 1 : width < 600 ? 2 : 3;
const HORZ_PADDING = 20;
const CARD_GAP = 14;

function truncate(str: string, max = 50): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}

function formatCategory(cat: string | null): string {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedPill<T extends string>({
  item,
  active,
  onPress,
  iconColor,
}: {
  item: { key: T; label: string };
  active: boolean;
  onPress: () => void;
  iconColor: string;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[
        styles.pill,
        active && styles.pillActive,
        active && { backgroundColor: '#2563EB' },
        animatedStyle,
      ]}>
      <ThemedText
        style={[styles.pillText, active && { color: '#fff' }]}
        numberOfLines={1}>
        {item.label}
      </ThemedText>
    </AnimatedPressable>
  );
}

function VideoBox({
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

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
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

  function renderPillRow<T extends string>(
    data: { key: T; label: string }[],
    value: T,
    onChange: (k: T) => void,
  ) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}>
        {data.map(({ key, label }) => (
          <AnimatedPill
            key={key || 'all'}
            item={{ key, label }}
            active={value === key}
            onPress={() => onChange((key || '') as T)}
            iconColor={iconColor}
          />
        ))}
      </ScrollView>
    );
  }

  const hasFilters = Boolean(search.trim() || source || category);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerLeft}>
              <View style={[styles.avatar, { backgroundColor: inputBg }]}>
                <User size={20} color={iconColor} />
              </View>
              <ThemedView style={styles.headerUser}>
                <ThemedText style={styles.headerLabel}>Saved links</ThemedText>
                <ThemedText
                  style={[styles.headerEmail, { color: iconColor }]}
                  numberOfLines={1}>
                  {user?.email ?? '—'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.headerRight}>
              <Pressable style={styles.iconButton} hitSlop={12} onPress={() => { }}>
                <Bell size={22} color={iconColor} />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                hitSlop={12}
                onPress={() => signOut()}>
                <LogOut size={22} color={iconColor} />
              </Pressable>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        {/* Search */}
        <Animated.View
          entering={FadeIn.delay(80).duration(400)}
          style={[styles.searchWrap, { backgroundColor: inputBg }]}>
          <Search size={18} color={iconColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search videos..."
            placeholderTextColor={iconColor}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </Animated.View>

        {/* Platform filter */}
        <Animated.View entering={FadeIn.delay(120).duration(400)}>
          <ThemedText style={[styles.filterLabel, { color: iconColor }]}>
            Platform
          </ThemedText>
          {renderPillRow(SOURCES, source, setSource)}
        </Animated.View>

        {/* Category filter */}
        <Animated.View entering={FadeIn.delay(160).duration(400)}>
          <ThemedText style={[styles.filterLabel, { color: iconColor }]}>
            Category
          </ThemedText>
          {renderPillRow(CATEGORIES, category, setCategory)}
        </Animated.View>

        {/* Section header */}
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
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={[styles.empty, { borderColor }]}>
            <Film size={48} color={iconColor} style={{ marginBottom: 12 }} />
            <ThemedText style={[styles.emptyText, { color: iconColor }]}>
              {hasFilters
                ? 'No videos match your filters.'
                : 'Share a link from Instagram, Facebook, Twitter, or TikTok to save it here.'}
            </ThemedText>
          </Animated.View>
        ) : (
          <View
            style={[
              styles.grid,
              {
                gap: CARD_GAP,
                paddingHorizontal: HORZ_PADDING,
              },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORZ_PADDING,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUser: { flex: 1, minWidth: 0 },
  headerLabel: { fontSize: 15, fontWeight: '600' },
  headerEmail: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { padding: 8 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: HORZ_PADDING,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  filterLabel: {
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
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  pillActive: {},
  pillText: { fontSize: 14, fontWeight: '500' },
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
  empty: {
    marginHorizontal: HORZ_PADDING,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 24,
  },
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
