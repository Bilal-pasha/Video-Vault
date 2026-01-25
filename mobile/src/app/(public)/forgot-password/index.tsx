import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
} from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PublicRoutes } from '@/constants/routes';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const borderColor = useThemeColor(
    { light: '#E5E5E5', dark: '#2D2D2D' },
    'icon'
  );
  const inputBg = useThemeColor(
    { light: '#F5F5F5', dark: '#1C1C1E' },
    'background'
  );
  const linkColor = useThemeColor({}, 'tint');

  // Animation values
  const backOpacity = useSharedValue(0);
  const backTranslateX = useSharedValue(-20);
  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(24);
  const subtitleOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(24);
  const inputOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(24);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.96);
  const backLinkOpacity = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    backOpacity.value = withTiming(1, { duration: 400 });
    backTranslateX.value = withSpring(0, { damping: 15, stiffness: 150 });

    titleTranslateY.value = withDelay(
      80,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    titleOpacity.value = withDelay(80, withTiming(1, { duration: 500 }));

    subtitleTranslateY.value = withDelay(
      160,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    subtitleOpacity.value = withDelay(160, withTiming(1, { duration: 500 }));

    inputTranslateY.value = withDelay(
      240,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    inputOpacity.value = withDelay(240, withTiming(1, { duration: 500 }));

    buttonTranslateY.value = withDelay(
      320,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    buttonOpacity.value = withDelay(320, withTiming(1, { duration: 500 }));
    buttonScale.value = withDelay(
      320,
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    backLinkOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const backAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backOpacity.value,
    transform: [{ translateX: backTranslateX.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      { translateY: buttonTranslateY.value },
      { scale: buttonScale.value * pressScale.value },
    ],
  }));

  const backLinkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backLinkOpacity.value,
  }));

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    // TODO: Implement actual password reset logic
    Alert.alert(
      'Reset Link Sent',
      'We have sent a password reset link to your email address.',
      [
        {
          text: 'OK',
          onPress: () => router.push(PublicRoutes.RESET_PASSWORD),
        },
      ]
    );
  };

  const handlePressIn = () => {
    pressScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          {/* Title */}
          <AnimatedThemedView style={[styles.header, titleAnimatedStyle]}>
            <ThemedText type="title" style={styles.title}>
              Forgot Password?
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: iconColor }]}>
              Enter your email and we'll send you a link to reset your
              password.
            </ThemedText>
          </AnimatedThemedView>

          {/* Form */}
          <ThemedView style={styles.form}>
            <AnimatedThemedView
              style={[styles.inputWrapper, inputAnimatedStyle]}>
              <View
                style={[
                  styles.inputRow,
                  {
                    borderColor,
                    backgroundColor: inputBg,
                  },
                ]}>
                <Mail size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your email"
                  placeholderTextColor={iconColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </AnimatedThemedView>

            <AnimatedPressable
              style={[styles.buttonWrap, buttonAnimatedStyle]}
              onPressIn={handlePressIn}
              onPress={handleReset}>
              <LinearGradient
                colors={['#60A5FA', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Send Reset Link</Text>
              </LinearGradient>
            </AnimatedPressable>

            <Animated.View style={[styles.backLinkWrap, backLinkAnimatedStyle]}>
              <Link href={PublicRoutes.LOGIN}>
                <ThemedText style={[styles.backLinkText, { color: linkColor }]}>
                  Back to Sign In
                </ThemedText>
              </Link>
            </Animated.View>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  buttonWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLinkWrap: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
