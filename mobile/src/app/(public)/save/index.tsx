import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/AuthProvider';
import { linksService } from '@/services/links/links.services';
import { pendingLinkStorage } from '@/services/links/pending-link.storage';
import { PrivateRoutes, PublicRoutes } from '@/constants/routes';

export default function SaveLinkScreen() {
  const { url } = useLocalSearchParams<{ url?: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'redirecting'>('idle');
  const handled = useRef(false);

  useEffect(() => {
    if (authLoading || handled.current) return;

    let linkUrl: string | undefined;
    try {
      const raw = typeof url === 'string' ? url : url?.[0];
      linkUrl = raw ? decodeURIComponent(raw).trim() : undefined;
    } catch {
      linkUrl = (typeof url === 'string' ? url : url?.[0])?.trim();
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
    setStatus('saving');
    linksService
      .create({ url: linkUrl })
      .then(() => {
        setStatus('redirecting');
        router.replace(PrivateRoutes.DASHBOARD);
      })
      .catch(() => {
        setStatus('idle');
        router.replace(PublicRoutes.WELCOME);
      });
  }, [url, isAuthenticated, authLoading, router]);

  return (
    <ThemedView style={styles.container}>
      {(authLoading || status !== 'idle') && (
        <>
          <ActivityIndicator size="large" />
          <Text style={styles.text}>
            {authLoading ? 'Checking sign-in…' : status === 'saving' ? 'Saving link…' : 'Taking you to dashboard…'}
          </Text>
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
  text: {
    fontSize: 16,
    opacity: 0.8,
  },
});
