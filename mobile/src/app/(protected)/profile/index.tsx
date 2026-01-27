import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Lock, Mail, Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/auth/auth.services';
import {
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileFormData,
  type UpdatePasswordFormData,
} from '@/schemas/profile.schemas';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values
  const backButtonOpacity = useSharedValue(0);
  const backButtonTranslateX = useSharedValue(-20);
  const headerTranslateY = useSharedValue(30);
  const headerOpacity = useSharedValue(0);
  const profileSectionOpacity = useSharedValue(0);
  const profileSectionTranslateY = useSharedValue(30);
  const passwordSectionOpacity = useSharedValue(0);
  const passwordSectionTranslateY = useSharedValue(30);

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

    // Profile section animation
    profileSectionTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    profileSectionOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));

    // Password section animation
    passwordSectionTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
    passwordSectionOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2D2D2D' }, 'icon');
  const inputBorderColor = useThemeColor({ light: '#E5E5E5', dark: '#2D2D2D' }, 'icon');
  const inputBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');
  const iconColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.data?.user) {
        updateUserProfile(response.data.user);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: UpdatePasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('Success', 'Password updated successfully');
      resetPasswordForm();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
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

  const profileSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: profileSectionOpacity.value,
    transform: [{ translateY: profileSectionTranslateY.value }],
  }));

  const passwordSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: passwordSectionOpacity.value,
    transform: [{ translateY: passwordSectionTranslateY.value }],
  }));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor, paddingTop: insets.top || 40 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          {/* Back Button */}
          <AnimatedPressable
            style={[styles.backButton, backButtonAnimatedStyle]}
            onPress={() => router.back()}>
            <ArrowLeft size={20} color={textColor} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </AnimatedPressable>

          {/* Header */}
          <AnimatedThemedView style={[styles.header, headerAnimatedStyle]}>
            <ThemedText type="title" style={styles.title}>
              Profile Settings
            </ThemedText>
            <ThemedText style={styles.subtitle}>Manage your account information</ThemedText>
          </AnimatedThemedView>

          {/* Profile Information Section */}
          <AnimatedThemedView style={[styles.section, profileSectionAnimatedStyle]}>
            <ThemedText style={styles.sectionTitle}>Profile Information</ThemedText>

            {/* Email (Read-only) */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                    opacity: 0.6,
                  },
                ]}>
                <Mail size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={user?.email}
                  editable={false}
                />
              </ThemedView>
              <ThemedText style={[styles.helperText, { color: iconColor }]}>
                Email cannot be changed
              </ThemedText>
            </ThemedView>

            {/* Name */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}>
                <User size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={profileControl}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Enter your name"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  )}
                />
              </ThemedView>
              {profileErrors.name && (
                <ThemedText style={styles.errorText}>{profileErrors.name.message}</ThemedText>
              )}
            </ThemedView>

            {/* Update Profile Button */}
            <Pressable
              style={[
                styles.button,
                { backgroundColor: '#3B82F6' },
                isUpdatingProfile && styles.buttonDisabled,
              ]}
              onPress={handleProfileSubmit(onProfileSubmit)}
              disabled={isUpdatingProfile}>
              <ThemedText style={styles.buttonText}>
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </ThemedText>
            </Pressable>
          </AnimatedThemedView>

          {/* Change Password Section */}
          <AnimatedThemedView style={[styles.section, passwordSectionAnimatedStyle]}>
            <ThemedText style={styles.sectionTitle}>Change Password</ThemedText>

            {/* Current Password */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Current Password</ThemedText>
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}>
                <Lock size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={passwordControl}
                  name="currentPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Enter current password"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showCurrentPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <Pressable
                  onPress={() => setShowCurrentPassword((prev) => !prev)}
                  hitSlop={12}
                  style={styles.eyeButton}>
                  {showCurrentPassword ? (
                    <EyeOff size={20} color={iconColor} />
                  ) : (
                    <Eye size={20} color={iconColor} />
                  )}
                </Pressable>
              </ThemedView>
              {passwordErrors.currentPassword && (
                <ThemedText style={styles.errorText}>
                  {passwordErrors.currentPassword.message}
                </ThemedText>
              )}
            </ThemedView>

            {/* New Password */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>New Password</ThemedText>
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}>
                <Lock size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={passwordControl}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Enter new password"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <Pressable
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  hitSlop={12}
                  style={styles.eyeButton}>
                  {showNewPassword ? (
                    <EyeOff size={20} color={iconColor} />
                  ) : (
                    <Eye size={20} color={iconColor} />
                  )}
                </Pressable>
              </ThemedView>
              {passwordErrors.newPassword && (
                <ThemedText style={styles.errorText}>
                  {passwordErrors.newPassword.message}
                </ThemedText>
              )}
            </ThemedView>

            {/* Confirm Password */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm New Password</ThemedText>
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: inputBorderColor,
                    backgroundColor: inputBackgroundColor,
                  },
                ]}>
                <Lock size={20} color={iconColor} style={styles.inputIcon} />
                <Controller
                  control={passwordControl}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Confirm new password"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={12}
                  style={styles.eyeButton}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={iconColor} />
                  ) : (
                    <Eye size={20} color={iconColor} />
                  )}
                </Pressable>
              </ThemedView>
              {passwordErrors.confirmPassword && (
                <ThemedText style={styles.errorText}>
                  {passwordErrors.confirmPassword.message}
                </ThemedText>
              )}
            </ThemedView>

            {/* Update Password Button */}
            <Pressable
              style={[
                styles.button,
                { backgroundColor: '#3B82F6' },
                isUpdatingPassword && styles.buttonDisabled,
              ]}
              onPress={handlePasswordSubmit(onPasswordSubmit)}
              disabled={isUpdatingPassword}>
              <ThemedText style={styles.buttonText}>
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </ThemedText>
            </Pressable>
          </AnimatedThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
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
  eyeButton: {
    padding: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
