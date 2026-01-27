# Google Sign-In Setup Guide

This guide will help you properly configure Google Sign-In for your React Native Expo application.

## Prerequisites

1. A Google Cloud Console project
2. OAuth 2.0 credentials configured

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 1.2 For iOS

1. Create an **iOS OAuth client ID**
2. Set the **Bundle ID** to: `com.video-mobile-application.app` (must match `ios.bundleIdentifier` in `app.json`)
3. Copy the **Client ID** - this is your `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### 1.3 For Android

1. Create an **Android OAuth client ID**
2. Set the **Package name** to: `com.bilal_pasha.videomobileapplication` (must match `android.package` in `app.json`)
3. Add your **SHA-1 certificate fingerprint**:

#### Get SHA-1 for Development:

```bash
# For Expo development
cd mobile
npx expo prebuild
cd android

# Get debug keystore SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Get SHA-1 for Production:

```bash
# For production keystore
keytool -list -v -keystore /path/to/your/production.keystore -alias your-key-alias
```

4. Copy both **SHA-1** and **SHA-256** fingerprints to Google Cloud Console
5. The **Client ID** is automatically used via the Web Client ID

### 1.4 Web Client ID

1. Create a **Web application** OAuth client ID (if not already created)
2. This is your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
3. This is **required** for both iOS and Android

## Step 2: Update Environment Variables

Update your `mobile/.env` file:

```env
# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

## Step 3: Update app.json

The `iosUrlScheme` should be the reversed Web Client ID:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_WEB_CLIENT_ID"
        }
      ]
    ]
  }
}
```

## Step 4: Rebuild the App

After making configuration changes:

```bash
# Clear cache and rebuild
cd mobile
rm -rf node_modules .expo android ios
npm install
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

## Common Errors and Solutions

### DEVELOPER_ERROR

**Cause:** Configuration mismatch between your app and Google Cloud Console

**Solutions:**
1. Verify your Web Client ID is correct in `.env`
2. For Android: Ensure SHA-1/SHA-256 certificates are added to Google Cloud Console
3. For iOS: Ensure iOS Client ID is correct and Bundle ID matches
4. Rebuild the app after any configuration changes
5. Make sure the package name/bundle identifier in `app.json` matches Google Cloud Console

### SIGN_IN_CANCELLED

**Cause:** User cancelled the sign-in flow

**Solution:** This is normal user behavior, handle gracefully in UI

### PLAY_SERVICES_NOT_AVAILABLE

**Cause:** Google Play Services not available on Android device

**Solution:** 
- Test on a device with Google Play Services
- Or use an emulator with Google Play Services installed

### Failed to get Google ID token

**Cause:** The sign-in succeeded but didn't return an ID token

**Solutions:**
1. Ensure `offlineAccess: true` is set in configuration
2. Verify scopes include 'profile' and 'email'
3. Check that Web Client ID is correctly configured

## Verification Checklist

- [ ] Web Client ID is set in `.env`
- [ ] iOS Client ID is set in `.env` (for iOS)
- [ ] `iosUrlScheme` in `app.json` matches reversed Web Client ID
- [ ] Bundle ID in `app.json` matches Google Cloud Console iOS client
- [ ] Package name in `app.json` matches Google Cloud Console Android client
- [ ] SHA-1 and SHA-256 certificates added to Google Cloud Console (Android)
- [ ] App has been rebuilt after configuration changes
- [ ] OAuth consent screen is configured in Google Cloud Console
- [ ] Test users are added (if app is in testing mode)

## Testing

1. **Development Build:**
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

2. **Production Build:**
   - For production, you'll need to generate a production keystore
   - Add the production SHA-1/SHA-256 to Google Cloud Console
   - Build using EAS Build or your CI/CD pipeline

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android/start)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Expo Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)

## Support

If you continue to experience issues:
1. Check the console logs for detailed error messages
2. Verify all credentials in Google Cloud Console
3. Ensure the app has been completely rebuilt
4. Try clearing the app data and cache on the device
