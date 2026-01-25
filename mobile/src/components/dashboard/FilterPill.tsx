import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterPill<T extends string>({
  item,
  active,
  onPress,
}: {
  item: { key: T; label: string };
  active: boolean;
  onPress: () => void;
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

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  pillActive: {},
  pillText: { fontSize: 14, fontWeight: '500' },
});
