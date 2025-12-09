import { router } from 'expo-router';
import { StyleSheet, ScrollView, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function DashboardScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2D2D2D' }, 'icon');

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.replace('/(public)/Login');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Dashboard
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Welcome to your protected dashboard
        </ThemedText>

        <ThemedView style={[styles.card, { borderColor }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Overview
          </ThemedText>
          <ThemedText style={styles.cardText}>
            This is a protected route that requires authentication.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.card, { borderColor }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Quick Actions
          </ThemedText>
          <ThemedText style={styles.cardText}>
            Add your dashboard content and features here.
          </ThemedText>
        </ThemedView>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  cardText: {
    opacity: 0.8,
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

