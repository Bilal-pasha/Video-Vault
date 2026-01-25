import {
  View,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Link2, Check } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import type { LinkCategory, LinkSource } from '@/services/links/links.types';

const CATEGORY_OPTIONS: { key: LinkCategory; label: string }[] = [
  { key: 'nature', label: 'Nature' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'food', label: 'Food' },
  { key: 'sports', label: 'Sports' },
  { key: 'music', label: 'Music' },
  { key: 'tech', label: 'Tech' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'other', label: 'Other' },
];

const SOURCE_OPTIONS: { key: LinkSource; label: string; color: string }[] = [
  { key: 'instagram', label: 'Instagram', color: '#E4405F' },
  { key: 'facebook', label: 'Facebook', color: '#1877F2' },
  { key: 'twitter', label: 'Twitter', color: '#1DA1F2' },
  { key: 'tiktok', label: 'TikTok', color: '#000000' },
  { key: 'other', label: 'Other', color: '#6B7280' },
];

function truncateUrl(str: string, max = 56): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}

export function AddLinkSheet({
  visible,
  url,
  category,
  source,
  onCategoryChange,
  onSourceChange,
  onSave,
  onCancel,
  isSaving,
  error,
  backgroundColor,
  textColor,
  iconColor,
  inputBg,
  borderColor,
}: {
  visible: boolean;
  url: string;
  category: LinkCategory | null;
  source: LinkSource | null;
  onCategoryChange: (c: LinkCategory) => void;
  onSourceChange: (s: LinkSource | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  inputBg: string;
  borderColor: string;
}) {
  const { width, height } = useWindowDimensions();
  const isNarrow = width < 360;
  const sheetWidth = Math.min(width - (isNarrow ? 16 : 24), isNarrow ? width - 16 : 440);
  const sheetMaxHeight = height * 0.88;
  const bodyPadding = isNarrow ? 16 : 20;
  const categoryGap = isNarrow ? 8 : 10;
  const categoryColumns = sheetWidth < 280 ? 2 : sheetWidth < 380 ? 3 : sheetWidth < 520 ? 4 : 5;
  const categoryTileWidth =
    (sheetWidth - bodyPadding * 2 - categoryGap * (categoryColumns - 1)) / categoryColumns;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor,
              borderColor,
              width: sheetWidth,
              maxHeight: sheetMaxHeight,
            },
          ]}>
          {/* Header with gradient accent */}
          <View style={[styles.header, isNarrow && styles.headerNarrow]}>
            <View style={styles.headerAccent} />
            <View style={styles.headerRow}>
              <View style={styles.titleRow}>
                <View style={styles.titleIconWrap}>
                  <LinearGradient
                    colors={['#60A5FA', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.titleIcon}>
                    <Link2 size={20} color="#FFF" strokeWidth={2.5} />
                  </LinearGradient>
                </View>
                <ThemedText type="subtitle" style={styles.title}>
                  Add video
                </ThemedText>
              </View>
              <Pressable
                onPress={onCancel}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: inputBg },
                  pressed && styles.pressed,
                ]}>
                <X size={20} color={iconColor} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={[
              styles.bodyContent,
              { paddingHorizontal: bodyPadding, paddingBottom: bodyPadding },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* URL preview */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: iconColor }]}>
                Link
              </ThemedText>
              <View style={[styles.urlCard, { backgroundColor: inputBg }]}>
                <Link2 size={16} color={iconColor} style={styles.urlIcon} />
                <ThemedText
                  style={[styles.urlText, { color: textColor }]}
                  numberOfLines={2}>
                  {url ? truncateUrl(url, 70) : '—'}
                </ThemedText>
              </View>
            </View>

            {/* Category – required, responsive grid */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: iconColor }]}>
                Category <Text style={styles.required}>*</Text>
              </ThemedText>
              <View style={[styles.categoryGrid, { gap: categoryGap }]}>
                {CATEGORY_OPTIONS.map(({ key, label }) => {
                  const active = category === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onCategoryChange(key)}
                      style={({ pressed }) => [
                        styles.categoryTile,
                        {
                          width: categoryTileWidth,
                          borderColor: active ? '#2563EB' : borderColor,
                        },
                        active && styles.categoryTileActive,
                        pressed && styles.pressed,
                      ]}>
                      {active && (
                        <View style={styles.checkWrap}>
                          <Check size={14} color="#fff" strokeWidth={2.5} />
                        </View>
                      )}
                      <ThemedText
                        style={[
                          styles.categoryTileText,
                          active && styles.categoryTileTextActive,
                        ]}
                        numberOfLines={1}>
                        {label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Platform – optional, horizontal row with color bar */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: iconColor }]}>
                Platform <Text style={styles.optional}>(optional)</Text>
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sourceRow}>
                {SOURCE_OPTIONS.map(({ key, label, color: accent }) => {
                  const active = source === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onSourceChange(active ? null : key)}
                      style={({ pressed }) => [
                        styles.sourceTile,
                        {
                          borderColor: active ? '#2563EB' : borderColor,
                          minWidth: isNarrow ? 92 : 110,
                        },
                        active && styles.sourceTileActive,
                        pressed && styles.pressed,
                      ]}>
                      <View
                        style={[styles.sourceBar, { backgroundColor: accent }]}
                      />
                      <ThemedText
                        style={[
                          styles.sourceTileText,
                          active && styles.sourceTileTextActive,
                        ]}
                        numberOfLines={1}>
                        {label}
                      </ThemedText>
                      {active && (
                        <Check size={14} color="#2563EB" style={styles.sourceCheck} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: borderColor, paddingHorizontal: bodyPadding },
            ]}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.footerBtn,
                styles.cancelBtn,
                { backgroundColor: inputBg },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.cancelBtnText, { color: textColor }]}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={!category || isSaving}
              style={({ pressed }) => [
                styles.footerBtn,
                (!category || isSaving) && styles.saveBtnDisabled,
                pressed && category && !isSaving && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={
                  category && !isSaving
                    ? ['#60A5FA', '#3B82F6']
                    : ['#93C5FD', '#93C5FD']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save video</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerNarrow: {
    paddingHorizontal: 16,
  },
  headerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#2563EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIconWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  body: {
    flex: 1,
    minHeight: 0,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  required: { color: '#DC2626' },
  optional: { fontWeight: '400', textTransform: 'none', opacity: 0.8 },
  urlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  urlIcon: { marginRight: 10 },
  urlText: { flex: 1, fontSize: 14, lineHeight: 20 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTile: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryTileActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryTileText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  categoryTileTextActive: {
    color: '#fff',
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  sourceTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 0,
    paddingRight: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 110,
  },
  sourceBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    marginRight: 10,
  },
  sourceTileActive: {
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderColor: '#2563EB',
  },
  sourceTileText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  sourceTileTextActive: {
    color: '#2563EB',
  },
  sourceCheck: { marginLeft: 4 },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {},
  cancelBtnText: {},
  saveBtnDisabled: { opacity: 0.85 },
  saveGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
