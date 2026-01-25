import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { PublicRoutes } from '@/constants/routes';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LIGHT_BG_GRADIENT = ['#F9FAFB', '#F3F4F6'] as const;
const DARK_BG_GRADIENT = ['#1C1C1E', '#0D0D0E'] as const;
const LIGHT_SECONDARY_GRADIENT = ['#FFFFFF', '#DBEAFE'] as const;
const DARK_SECONDARY_GRADIENT = ['#2C2C2E', '#1C1C1E'] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor(
    { light: '#E5E7EB', dark: '#3A3A3C' },
    'icon'
  );

  // Animation values
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const sparkleScale = useSharedValue(1);
  const taglineTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const button1TranslateY = useSharedValue(50);
  const button1Opacity = useSharedValue(0);
  const button2TranslateY = useSharedValue(50);
  const button2Opacity = useSharedValue(0);

  useEffect(() => {
    // Icon animation - scale and fade in
    iconScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    iconOpacity.value = withTiming(1, { duration: 600 });

    // Title animation - slide up and fade in
    titleTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Sparkle animation - continuous rotation and pulse
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Tagline animation
    taglineTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Button animations - staggered
    button1TranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    button1Opacity.value = withDelay(600, withTiming(1, { duration: 600 }));

    button2TranslateY.value = withDelay(
      700,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    button2Opacity.value = withDelay(700, withTiming(1, { duration: 600 }));
  }, []);
  // Animated styles
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sparkleRotation.value}deg` },
      { scale: sparkleScale.value },
    ],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineTranslateY.value }],
    opacity: taglineOpacity.value,
  }));

  const button1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: button1TranslateY.value }],
    opacity: button1Opacity.value,
  }));

  const button2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: button2TranslateY.value }],
    opacity: button2Opacity.value,
  }));

  const buttonPressScale = useSharedValue(1);

  const handleButtonPress = (callback: () => void) => {
    buttonPressScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    setTimeout(callback, 150);
  };

  const bgGradient = isDark ? DARK_BG_GRADIENT : LIGHT_BG_GRADIENT;
  const secondaryGradient = isDark
    ? DARK_SECONDARY_GRADIENT
    : LIGHT_SECONDARY_GRADIENT;

  return (
    <LinearGradient
      colors={[...bgGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}>
      <View style={styles.content}>
        {/* App Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            iconAnimatedStyle,
            isDark && styles.iconContainerDark,
          ]}>
          <LinearGradient
            colors={['#60A5FA', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}>
            <Video size={60} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>

        {/* App Name with Sparkle */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={[styles.appName, { color: textColor }]}>VideoVault</Text>
          <Animated.View style={sparkleAnimatedStyle}>
            <Sparkles
              size={20}
              color={tintColor}
              strokeWidth={2}
              style={styles.sparkle}
            />
          </Animated.View>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          style={[styles.tagline, { color: iconColor }, taglineAnimatedStyle]}>
          Save, organize, and discover your favorite videos in one beautiful
          place.
        </Animated.Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={button1AnimatedStyle}>
            <AnimatedPressable
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                handleButtonPress(() => router.navigate(PublicRoutes.LOGIN))
              }>
              <LinearGradient
                colors={['#60A5FA', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}>
                <Text style={styles.signInText}>Sign In</Text>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View style={button2AnimatedStyle}>
            <AnimatedPressable
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                handleButtonPress(() => router.push(PublicRoutes.REGISTER))
              }>
              <LinearGradient
                colors={[...secondaryGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.signInGradient,
                  isDark && { borderWidth: 1, borderColor },
                ]}>
                <Text style={[styles.createAccountText, { color: tintColor }]}>
                  Create Account
                </Text>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainerDark: {
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sparkle: {
    marginTop: 2,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  signInButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  signInGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  createAccountText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

