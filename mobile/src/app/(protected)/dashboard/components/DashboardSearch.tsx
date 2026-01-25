import { StyleSheet, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { HORZ_PADDING } from '../constants';

export function DashboardSearch({
  value,
  onChangeText,
  placeholder,
  textColor,
  iconColor,
  inputBg,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  textColor: string;
  iconColor: string;
  inputBg: string;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(80).duration(400)}
      style={[styles.wrap, { backgroundColor: inputBg }]}>
      <Search size={18} color={iconColor} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: HORZ_PADDING,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
});
