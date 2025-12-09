import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2D2D2D' }, 'icon');

  const handleReset = () => {
    if (!email) {
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
          onPress: () => router.push('/(public)/ResetPassword'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Forgot Password?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Don't worry! Enter your email address and we'll send you a link to reset your password.
        </ThemedText>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Enter your email"
              placeholderTextColor={useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </ThemedView>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleReset}>
            <ThemedText style={styles.buttonText}>Send Reset Link</ThemedText>
          </Pressable>

          <ThemedView style={styles.backContainer}>
            <Link href="/(public)/Login">
              <ThemedText type="link">Back to Sign In</ThemedText>
            </Link>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
  },
});

