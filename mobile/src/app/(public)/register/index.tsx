import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { ArrowLeft, Mail, Lock, User } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PublicRoutes } from "@/constants/routes";
import { registerSchema, type RegisterFormData } from "@/schemas";
import { images } from "@/constants/images";
import { useAuth } from "@/providers/AuthProvider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

const AppleIcon = images.appleLogo;
const GoogleIcon = images.googleLogo;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, error: authError, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const backButtonOpacity = useSharedValue(0);
  const backButtonTranslateX = useSharedValue(-20);
  const headerTranslateY = useSharedValue(30);
  const headerOpacity = useSharedValue(0);
  const nameInputTranslateY = useSharedValue(30);
  const nameInputOpacity = useSharedValue(0);
  const emailInputTranslateY = useSharedValue(30);
  const emailInputOpacity = useSharedValue(0);
  const passwordInputTranslateY = useSharedValue(30);
  const passwordInputOpacity = useSharedValue(0);
  const signUpButtonScale = useSharedValue(0.9);
  const signUpButtonOpacity = useSharedValue(0);
  const dividerOpacity = useSharedValue(0);
  const dividerScale = useSharedValue(0.8);
  const appleButtonTranslateY = useSharedValue(30);
  const appleButtonOpacity = useSharedValue(0);
  const googleButtonTranslateY = useSharedValue(30);
  const googleButtonOpacity = useSharedValue(0);

  useEffect(() => {
    // Back button animation
    backButtonOpacity.value = withTiming(1, { duration: 400 });
    backButtonTranslateX.value = withSpring(0, { damping: 15, stiffness: 150 });

    // Header animation
    headerTranslateY.value = withDelay(
      100,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));

    // Name input animation
    nameInputTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    nameInputOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));

    // Email input animation
    emailInputTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    emailInputOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    // Password input animation
    passwordInputTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    passwordInputOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500 })
    );

    // Sign up button animation
    signUpButtonScale.value = withDelay(
      500,
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    signUpButtonOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 500 })
    );

    // Divider animation
    dividerOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    dividerScale.value = withDelay(
      600,
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    // Social buttons animation
    appleButtonTranslateY.value = withDelay(
      700,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    appleButtonOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    googleButtonTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    googleButtonOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 500 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor(
    { light: "#E5E5E5", dark: "#2D2D2D" },
    "icon"
  );
  const inputBorderColor = useThemeColor(
    { light: "#E5E5E5", dark: "#2D2D2D" },
    "icon"
  );
  const inputBackgroundColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1C1C1E" },
    "background"
  );
  const iconColor = useThemeColor(
    { light: "#9BA1A6", dark: "#687076" },
    "icon"
  );
  const placeholderColor = useThemeColor(
    { light: "#9BA1A6", dark: "#687076" },
    "icon"
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    setIsSubmitting(true);
    try {
      const result = await signUp(data);
      if (!result.success) {
        Alert.alert("Error", result.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
    Alert.alert("Info", "Apple login coming soon");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    Alert.alert("Info", "Google login coming soon");
  };

  // Animated styles
  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backButtonOpacity.value,
    transform: [{ translateX: backButtonTranslateX.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const nameInputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: nameInputOpacity.value,
    transform: [{ translateY: nameInputTranslateY.value }],
  }));

  const emailInputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: emailInputOpacity.value,
    transform: [{ translateY: emailInputTranslateY.value }],
  }));

  const passwordInputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: passwordInputOpacity.value,
    transform: [{ translateY: passwordInputTranslateY.value }],
  }));

  const signUpButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: signUpButtonOpacity.value,
    transform: [{ scale: signUpButtonScale.value }],
  }));

  const dividerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dividerOpacity.value,
    transform: [{ scale: dividerScale.value }],
  }));

  const googleButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: googleButtonOpacity.value,
    transform: [{ translateY: googleButtonTranslateY.value }],
  }));

  const buttonPressScale = useSharedValue(1);

  const buttonPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPressScale.value }],
  }));

  const handleButtonPress = (callback: () => void) => {
    buttonPressScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    setTimeout(callback, 150);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          {/* Back Button */}
          <AnimatedPressable
            style={[styles.backButton, backButtonAnimatedStyle]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={textColor} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </AnimatedPressable>

          {/* Header */}
          <AnimatedThemedView style={[styles.header, headerAnimatedStyle]}>
            <ThemedText type="title" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Start your journey with us
            </ThemedText>
          </AnimatedThemedView>

          {/* Form */}
          <ThemedView style={styles.form}>
            {/* Full Name Input */}
            <AnimatedThemedView
              style={[styles.inputContainer, nameInputAnimatedStyle]}
            >
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}
              >
                <User size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Full name"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect={false}
                    />
                  )}
                />
              </ThemedView>
              {errors.name && (
                <ThemedText style={styles.errorText}>
                  {errors.name.message}
                </ThemedText>
              )}
            </AnimatedThemedView>

            {/* Email Input */}
            <AnimatedThemedView
              style={[styles.inputContainer, emailInputAnimatedStyle]}
            >
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}
              >
                <Mail size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Email address"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                    />
                  )}
                />
              </ThemedView>
              {errors.email && (
                <ThemedText style={styles.errorText}>
                  {errors.email.message}
                </ThemedText>
              )}
            </AnimatedThemedView>

            {/* Password Input */}
            <AnimatedThemedView
              style={[styles.inputContainer, passwordInputAnimatedStyle]}
            >
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}
              >
                <Lock size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Password"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password-new"
                      autoCorrect={false}
                    />
                  )}
                />
              </ThemedView>
              {errors.password && (
                <ThemedText style={styles.errorText}>
                  {errors.password.message}
                </ThemedText>
              )}
            </AnimatedThemedView>

            {/* Create Account Button */}
            <AnimatedPressable
              style={[
                styles.signUpButton,
                signUpButtonAnimatedStyle,
                buttonPressStyle,
              ]}
              onPress={() => {
                buttonPressScale.value = withSequence(
                  withTiming(0.95, { duration: 100 }),
                  withSpring(1, { damping: 15, stiffness: 150 })
                );
                handleSubmit(onSubmit)();
              }}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={["#60A5FA", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signUpGradient}
              >
                <Text style={styles.signUpButtonText}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </AnimatedPressable>

            {/* Divider */}
            <AnimatedThemedView
              style={[styles.dividerContainer, dividerAnimatedStyle]}
            >
              <ThemedView
                style={[styles.dividerLine, { backgroundColor: borderColor }]}
              />
              <ThemedText style={[styles.dividerText, { color: iconColor }]}>
                or continue with
              </ThemedText>
              <ThemedView
                style={[styles.dividerLine, { backgroundColor: borderColor }]}
              />
            </AnimatedThemedView>

            {/* Social Login Buttons */}
            <ThemedView style={styles.socialButtons}>
              {/* Apple Button */}
              <AnimatedPressable
                style={[
                  styles.googleButton,
                  {
                    borderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                  googleButtonAnimatedStyle,
                  buttonPressStyle,
                ]}
                onPress={() => handleButtonPress(handleAppleLogin)}
              >
                <ThemedView style={styles.socialButtonContent}>
                  <ThemedView style={styles.iconWrapper}>
                    <AppleIcon width={20} height={24} fill="#FFFFFF" />
                  </ThemedView>
                  <Text style={[styles.googleButtonText, { color: textColor }]}>
                    Continue with Apple
                  </Text>
                </ThemedView>
              </AnimatedPressable>

              {/* Google Button */}
              <AnimatedPressable
                style={[
                  styles.googleButton,
                  {
                    borderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                  googleButtonAnimatedStyle,
                  buttonPressStyle,
                ]}
                onPress={() => handleButtonPress(handleGoogleLogin)}
              >
                <ThemedView style={styles.socialButtonContent}>
                  <ThemedView style={styles.iconWrapper}>
                    <GoogleIcon width={20} height={20} />
                  </ThemedView>
                  <Text style={[styles.googleButtonText, { color: textColor }]}>
                    Continue with Google
                  </Text>
                </ThemedView>
              </AnimatedPressable>
            </ThemedView>

            {/* Terms and Privacy Policy */}
            <ThemedView style={styles.termsContainer}>
              <ThemedText style={[styles.termsText, { color: iconColor }]}>
                By creating an account, you agree to our{" "}
                <ThemedText style={styles.linkText}>Terms</ThemedText> &{" "}
                <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
              </ThemedText>
            </ThemedView>

            {/* Sign In Link */}
            <ThemedView style={styles.loginContainer}>
              <ThemedText>Already have an account? </ThemedText>
              <Link href={PublicRoutes.LOGIN}>
                <ThemedText style={styles.linkText}>Sign In</ThemedText>
              </Link>
            </ThemedView>
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
    justifyContent: "center",
  },
  content: {
    padding: 24,
    minHeight: "100%",
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
    padding: 0,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signUpButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 32,
  },
  signUpGradient: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  appleButton: {
    backgroundColor: "#1C1C1E",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  termsContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  linkText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
});
