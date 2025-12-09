import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, Sparkles } from 'lucide-react-native';
import { PublicRoutes } from '@/constants/routes';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <LinearGradient
      colors={['#F9FAFB', '#F3F4F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}>
      <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#3B82F6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconGradient}>
            <Video size={60} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </View>

        {/* App Name with Sparkle */}
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>VideoVault</Text>
          <Sparkles size={20} color="#3B82F6" strokeWidth={2} style={styles.sparkle} />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Save, organize, and discover your favorite videos in one beautiful place.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.navigate(PublicRoutes.LOGIN)}>
            <LinearGradient
              colors={['#60A5FA', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInGradient}>
              <Text style={styles.signInText}>Sign In</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.createAccountButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push(PublicRoutes.REGISTER)}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </Pressable>
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

