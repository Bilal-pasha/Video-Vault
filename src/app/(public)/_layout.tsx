import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="ForgotPassword" />
      <Stack.Screen name="ResetPassword" />
    </Stack>
  );
}

