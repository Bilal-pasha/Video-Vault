import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Link2, Check } from 'lucide-react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { linksService } from '@/services/links/links.services';
import { pendingLinkStorage } from '@/services/links/pending-link.storage';
import {
  PrivateRoutes,
  PublicRoutes,
} from '@/constants/routes';
import type { LinkCategory, LinkSource } from '@/services/links/links.types';

const CATEGORY_OPTIONS: { key: LinkCategory; label: string }[] = [
  { key: 'nature', label: 'Nature' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'food', label: 'Food' },
  { key: 'sports', label: 'Sports' },
  { key: 'music', label: 'Music' },
  { key: 'tech', label: 'Tech' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'other', label: 'Other' },
];

const SOURCE_OPTIONS: { key: LinkSource; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'other', label: 'Other' },
];

function truncateUrl(str: string, max = 50): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}

export default function SaveLinkScreen() {
  const params = useLocalSearchParams<{ url?: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [status, setStatus] = useState<'idle' | 'saving' | 'redirecting'>('idle');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<LinkCategory | null>(null);
  const [source, setSource] = useState<LinkSource | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const handled = useRef(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const inputBg = useThemeColor(
    { light: '#F5F5F5', dark: '#1C1C1E' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#E5E5E5', dark: '#2D2D2D' },
    'icon',
  );

  useEffect(() => {
    if (authLoading || handled.current) return;

    let linkUrl: string | undefined;
    try {
      const raw = typeof params.url === 'string' ? params.url : params.url?.[0];
      linkUrl = raw ? decodeURIComponent(raw).trim() : undefined;
    } catch {
      linkUrl = (typeof params.url === 'string' ? params.url : params.url?.[0])
        ?.trim();
    }

    if (!linkUrl) {
      handled.current = true;
      router.replace(PublicRoutes.WELCOME);
      return;
    }

    if (!isAuthenticated) {
      handled.current = true;
      pendingLinkStorage.set(linkUrl).then(() => {
        router.replace(PublicRoutes.LOGIN);
      });
      return;
    }

    handled.current = true;
    setPendingUrl(linkUrl);
    setShowCategoryModal(true);
  }, [params.url, isAuthenticated, authLoading, router]);

  const handleSave = () => {
    if (!pendingUrl || !category) {
      setSaveError('Please choose a category.');
      return;
    }
    setSaveError(null);
    setStatus('saving');
    linksService
      .create({
        url: pendingUrl,
        category,
        ...(source && { source }),
      })
      .then(() => {
        setStatus('redirecting');
        setShowCategoryModal(false);
        router.replace(PrivateRoutes.DASHBOARD);
      })
      .catch(() => {
        setStatus('idle');
        setSaveError('Could not save. Try again.');
      });
  };

  const handleCancel = () => {
    setShowCategoryModal(false);
    setPendingUrl(null);
    setCategory(null);
    setSource(null);
    setSaveError(null);
    router.replace(PublicRoutes.WELCOME);
  };

  if (authLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={[styles.statusText, { color: iconColor }]}>
          Checking sign-in…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleCancel}
          />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor,
                borderColor,
                maxWidth: Math.min(width - 32, 420),
              },
            ]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Link2 size={22} color="#2563EB" />
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Add video
                </ThemedText>
              </View>
              <Pressable
                onPress={handleCancel}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: inputBg },
                  pressed && styles.pressed,
                ]}>
                <X size={20} color={iconColor} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <ThemedText style={[styles.fieldLabel, { color: iconColor }]}>
                Link
              </ThemedText>
              <View style={[styles.urlPreview, { backgroundColor: inputBg }]}>
                <ThemedText
                  style={[styles.urlText, { color: textColor }]}
                  numberOfLines={2}>
                  {pendingUrl ? truncateUrl(pendingUrl, 80) : '—'}
                </ThemedText>
              </View>

              <ThemedText style={[styles.fieldLabel, { color: iconColor }]}>
                Category <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={styles.chipRow}>
                {CATEGORY_OPTIONS.map(({ key, label }) => {
                  const active = category === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setCategory(key)}
                      style={[
                        styles.chip,
                        { borderColor: active ? '#2563EB' : borderColor },
                        active && styles.chipActive,
                      ]}>
                      {active && <Check size={14} color="#fff" />}
                      <ThemedText
                        style={[
                          styles.chipText,
                          active && { color: '#fff' },
                        ]}>
                        {label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <ThemedText style={[styles.fieldLabel, { color: iconColor }]}>
                Platform (optional)
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sourceRow}>
                {SOURCE_OPTIONS.map(({ key, label }) => {
                  const active = source === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setSource(active ? null : key)}
                      style={[
                        styles.chip,
                        { borderColor: active ? '#2563EB' : borderColor },
                        active && styles.chipActive,
                      ]}>
                      {active && <Check size={14} color="#fff" />}
                      <ThemedText
                        style={[
                          styles.chipText,
                          active && { color: '#fff' },
                        ]}>
                        {label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {saveError ? (
                <ThemedText style={styles.errorText}>{saveError}</ThemedText>
              ) : null}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
              <Pressable
                onPress={handleCancel}
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
                onPress={handleSave}
                disabled={status === 'saving' || !category}
                style={({ pressed }) => [
                  styles.footerBtn,
                  styles.saveBtn,
                  (!category || status === 'saving') && styles.saveBtnDisabled,
                  pressed && category && styles.pressed,
                ]}>
                {status === 'saving' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.saveBtnText}>Save video</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {!showCategoryModal && status !== 'idle' && (
        <>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={[styles.statusText, { color: iconColor }]}>
            {status === 'saving'
              ? 'Saving link…'
              : 'Taking you to dashboard…'}
          </ThemedText>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  statusText: {
    fontSize: 16,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0,
    maxHeight: '85%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxHeight: 400,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: { color: '#DC2626' },
  urlPreview: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  urlText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {},
  cancelBtnText: {},
  saveBtn: {
    backgroundColor: '#2563EB',
  },
  saveBtnDisabled: {
    backgroundColor: '#93C5FD',
    opacity: 0.9,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
