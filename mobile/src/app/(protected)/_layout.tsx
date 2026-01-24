import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';
import { PublicRoutes } from '@/constants/routes';

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(PublicRoutes.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
