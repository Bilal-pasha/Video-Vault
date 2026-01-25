import { View, Pressable, StyleSheet } from 'react-native';
import { User, Bell, LogOut } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HORZ_PADDING } from './constants';

export function DashboardHeader({
  userEmail,
  iconColor,
  inputBg,
  onNotificationPress,
  onSignOut,
}: {
  userEmail: string | undefined;
  iconColor: string;
  inputBg: string;
  onNotificationPress: () => void;
  onSignOut: () => void;
}) {
  return (
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
              {userEmail ?? '—'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.headerRight}>
          <Pressable
            style={styles.iconButton}
            hitSlop={12}
            onPress={onNotificationPress}
          >
            <Bell size={22} color={iconColor} />
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={12} onPress={onSignOut}>
            <LogOut size={22} color={iconColor} />
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORZ_PADDING,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
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
});
