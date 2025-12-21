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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const router = useRouter();

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

  return (
    <LinearGradient
      colors={['#F9FAFB', '#F3F4F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}>
      <View style={styles.content}>
        {/* App Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <LinearGradient
            colors={['#3B82F6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}>
            <Video size={60} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </Animated.View>

        {/* App Name with Sparkle */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.appName}>VideoVault</Text>
          <Animated.View style={sparkleAnimatedStyle}>
            <Sparkles size={20} color="#3B82F6" strokeWidth={2} style={styles.sparkle} />
          </Animated.View>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
          Save, organize, and discover your favorite videos in one beautiful place.
        </Animated.Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={button1AnimatedStyle}>
            <AnimatedPressable
             style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.buttonPressed,
            ]}
              onPress={() => handleButtonPress(() => router.navigate(PublicRoutes.LOGIN))}>
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
                styles.createAccountButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => handleButtonPress(() => router.push(PublicRoutes.REGISTER))}>
              <LinearGradient
                colors={['#FFFFFF', '#DBEAFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}>
                <Text style={styles.createAccountText}>Create Account</Text>
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    color: '#1F2937',
    marginRight: 8,
  },
  sparkle: {
    marginTop: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
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
  createAccountButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

