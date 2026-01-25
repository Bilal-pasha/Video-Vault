import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

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

import { AddLinkSheet } from './components/AddLinkSheet';

export default function SaveLinkScreen() {
  const params = useLocalSearchParams<{ url?: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
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
      <AddLinkSheet
        visible={showCategoryModal}
        url={pendingUrl ?? ''}
        category={category}
        source={source}
        onCategoryChange={setCategory}
        onSourceChange={setSource}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={status === 'saving'}
        error={saveError}
        backgroundColor={backgroundColor}
        textColor={textColor}
        iconColor={iconColor}
        inputBg={inputBg}
        borderColor={borderColor}
      />

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
});
