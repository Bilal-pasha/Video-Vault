# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Video Mobile Application.

## Overview

The application now supports Google Sign-In for both login and registration. Users can authenticate using their Google account, which creates or links their account automatically.

## Architecture

### Backend (NestJS)
- **User Entity**: Extended to support OAuth providers with `oauthProvider` and `oauthId` fields
- **Auth Service**: Handles Google authentication, user creation, and account linking
- **Auth Controller**: Provides `/api/auth/google` endpoint for token verification
- **Google Auth Library**: Verifies ID tokens from the client

### Frontend (React Native/Expo)
- **Google Sign-In SDK**: Handles native Google authentication flow
- **Auth Service**: Manages Google Sign-In configuration and token exchange
- **Auth Hooks**: Provides React hooks for Google authentication
- **UI Integration**: Google Sign-In buttons in login and register screens

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Google Identity Services**

#### Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**

#### For Web Application (Backend)
- Application type: **Web application**
- Name: `Video App Backend`
- Authorized redirect URIs: Add your backend callback URL
- Note the **Client ID** and **Client Secret**

#### For Android
- Application type: **Android**
- Name: `Video App Android`
- Package name: `com.bilal_pasha.videomobileapplication`
- SHA-1 certificate fingerprint: Get from your keystore
  ```bash
  # Debug keystore
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # Release keystore
  keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
  ```
- Note the **Client ID**

#### For iOS
- Application type: **iOS**
- Name: `Video App iOS`
- Bundle ID: `com.video-mobile-application.app`
- Note the **Client ID**

### 2. Backend Configuration

Add the following environment variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 3. Mobile Configuration

#### Environment Variables

Create or update `.env` file in the `mobile/` directory:

```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

**Important**: Use the **Web Client ID** for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, not the Android or iOS client ID.

#### Google Services Files

##### For Android
1. Download `google-services.json` from Firebase Console
2. Place it in `mobile/google-services.json`

##### For iOS
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `mobile/GoogleService-Info.plist`

### 4. Database Migration

Run the migration to add OAuth fields to the users table:

```bash
cd server
npm run migration:run
```

This will:
- Make the `password` field nullable (OAuth users don't need passwords)
- Add `oauth_provider` field (e.g., 'google')
- Add `oauth_id` field (Google user ID)
- Create an index for faster OAuth lookups

### 5. Build and Run

#### Backend
```bash
cd server
npm install
npm run start:dev
```

#### Mobile
```bash
cd mobile
npm install

# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## How It Works

### Authentication Flow

1. **User Initiates Google Sign-In**
   - User taps "Continue with Google" button
   - Native Google Sign-In modal appears

2. **Google Authentication**
   - User selects/authorizes their Google account
   - Google returns an ID token to the app

3. **Token Verification**
   - Mobile app sends ID token to backend `/api/auth/google` endpoint
   - Backend verifies token with Google's servers
   - Extracts user information (email, name, picture)

4. **User Creation/Linking**
   - **New User**: Creates account with Google profile data
   - **Existing User (same email)**: Links Google account to existing account
   - **Existing OAuth User**: Updates profile data if changed

5. **Session Creation**
   - Backend generates JWT access and refresh tokens
   - Tokens are stored in AsyncStorage (mobile)
   - User is redirected to dashboard

### Account Linking

The system automatically handles account linking:

- If a user signs up with email/password, they can later sign in with Google using the same email
- The accounts are automatically linked on first Google sign-in
- OAuth provider and ID are stored for future authentications

### Security Features

- **Token Verification**: All ID tokens are verified server-side
- **HTTPS Only**: OAuth only works over secure connections in production
- **Token Expiry**: Access tokens expire after 1 hour, refresh tokens after 7 days
- **Secure Storage**: Tokens stored in AsyncStorage with encryption

## API Endpoints

### POST `/v1/api/auth/google`

Authenticate or register a user with Google OAuth.

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "createdAt": "2024-01-27T10:00:00.000Z",
      "updatedAt": "2024-01-27T10:00:00.000Z"
    }
  }
}
```

**Cookies Set:**
- `access_token`: JWT access token (1 hour expiry)
- `refresh_token`: JWT refresh token (7 days expiry)

## Testing

### Test Google Sign-In

1. **Development Mode**
   - Use test Google accounts
   - Debug keystore SHA-1 must be registered in Google Console

2. **Production Mode**
   - Use production keystore SHA-1
   - Test with real Google accounts

### Common Issues

#### "Sign in was cancelled"
- User cancelled the Google Sign-In flow
- This is expected behavior

#### "Google Play Services not available"
- Android device doesn't have Google Play Services
- Install Google Play Services or use an emulator with Play Services

#### "Invalid Google token"
- Web Client ID is incorrect
- Token expired before verification
- Check environment variables

#### "Developer Error" on Android
- SHA-1 certificate fingerprint not registered
- Package name mismatch
- Re-check Google Console configuration

## Code Structure

### Backend Files
```
server/src/
├── api/
│   ├── auth/
│   │   ├── auth.controller.ts          # Google OAuth endpoint
│   │   ├── auth.service.ts             # Google auth logic
│   │   ├── dto/
│   │   │   └── google-auth.dto.ts      # Google auth DTOs
│   │   └── strategies/
│   │       └── google.strategy.ts      # Passport Google strategy
│   └── user/
│       └── user.entity.ts              # User entity with OAuth fields
└── database/
    └── migrations/
        └── 1738000000000-AddOAuthFieldsToUsers.ts
```

### Mobile Files
```
mobile/src/
├── app/
│   ├── _layout.tsx                     # Google Sign-In initialization
│   └── (public)/
│       ├── login/index.tsx             # Login with Google button
│       └── register/index.tsx          # Register with Google button
├── services/
│   └── auth/
│       ├── google-auth.service.ts      # Google Sign-In service
│       └── google-auth.hooks.ts        # React hooks
└── utils/
    ├── api.endpoints.ts                # API endpoint constants
    └── env.ts                          # Environment variables
```

## Environment Variables Reference

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Mobile (.env)
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

## Production Checklist

- [ ] Google Cloud project configured for production
- [ ] Production OAuth credentials created
- [ ] Production SHA-1 certificate registered (Android)
- [ ] Production bundle ID registered (iOS)
- [ ] Environment variables set in production
- [ ] HTTPS enabled on backend
- [ ] Database migration run
- [ ] Google Services files added to mobile app
- [ ] Test Google Sign-In flow end-to-end

## Support

For issues or questions:
1. Check the [Common Issues](#common-issues) section
2. Review Google Cloud Console configuration
3. Verify environment variables
4. Check backend logs for token verification errors
5. Check mobile logs for sign-in errors

## Additional Resources

- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Google Identity Platform](https://developers.google.com/identity)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [NestJS Passport Integration](https://docs.nestjs.com/security/authentication)
