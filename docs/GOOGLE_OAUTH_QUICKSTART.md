# Google OAuth Quick Start Guide

This is a quick reference guide to get Google OAuth working. 

**📱 Mobile-Only Setup (No Domain Required)**: See [MOBILE_OAUTH_SETUP.md](./MOBILE_OAUTH_SETUP.md)

**📚 Full Documentation**: See [docs/GOOGLE_OAUTH_SETUP.md](./docs/GOOGLE_OAUTH_SETUP.md)

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- PostgreSQL database running

## Quick Setup (5 Steps)

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials:
   - **Web Application**: Get Client ID and Client Secret
   - **Android**: Get Client ID (use package: `com.bilal_pasha.videomobileapplication`)
   - **iOS**: Get Client ID (use bundle: `com.video-mobile-application.app`)

### 2. Backend Environment Variables

Create `server/.env`:

```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 3. Mobile Environment Variables

Create `mobile/.env`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

**Important**: Use the **Web Client ID** for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

### 4. Run Database Migration

```bash
cd server
npm run migration:run
```

### 5. Start the Application

**Backend:**
```bash
cd server
npm install
npm run start:dev
```

**Mobile:**
```bash
cd mobile
npm install
npx expo start
```

## Android Setup (Additional)

### Get SHA-1 Certificate Fingerprint

```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Add this SHA-1 to your Android OAuth client in Google Cloud Console.

### Download google-services.json

1. Go to Firebase Console
2. Download `google-services.json`
3. Place in `mobile/google-services.json`

## iOS Setup (Additional)

### Download GoogleService-Info.plist

1. Go to Firebase Console
2. Download `GoogleService-Info.plist`
3. Place in `mobile/GoogleService-Info.plist`

## Testing

1. Open the mobile app
2. Navigate to Login or Register screen
3. Tap "Continue with Google"
4. Select your Google account
5. You should be logged in and redirected to the dashboard

## Troubleshooting

### "Developer Error" on Android
- SHA-1 certificate not registered in Google Console
- Package name mismatch

### "Invalid Google token"
- Wrong Web Client ID in environment variables
- Token expired

### "Sign in was cancelled"
- User cancelled the flow (expected behavior)

## What Was Implemented

### Backend
- ✅ User entity extended with OAuth fields (`oauthProvider`, `oauthId`)
- ✅ Database migration for OAuth fields
- ✅ Google OAuth endpoint (`POST /v1/api/auth/google`)
- ✅ Token verification with Google Auth Library
- ✅ Automatic account creation and linking

### Mobile
- ✅ Google Sign-In SDK integration
- ✅ Google authentication service and hooks
- ✅ Google Sign-In buttons in login/register screens
- ✅ Toast notifications for success/error
- ✅ Automatic redirect to dashboard on success

## Features

- **One-Tap Sign-In**: Users can sign in with a single tap
- **Account Linking**: Automatically links Google account to existing email/password accounts
- **Profile Sync**: Syncs name and profile picture from Google
- **Secure**: Server-side token verification
- **Professional UI**: Smooth animations and loading states

## Next Steps

1. Set up production OAuth credentials
2. Configure production environment variables
3. Test on physical devices
4. Add Apple Sign-In (optional)
5. Add additional OAuth providers (optional)

## Support

For detailed setup instructions, troubleshooting, and architecture details, see:
- [Full Documentation](./docs/GOOGLE_OAUTH_SETUP.md)
- [API Documentation](./docs/api-doc.md)

## File Structure

```
├── server/
│   ├── .env.example                    # Backend environment template
│   └── src/
│       ├── api/auth/
│       │   ├── auth.controller.ts      # Google OAuth endpoint
│       │   ├── auth.service.ts         # Authentication logic
│       │   └── dto/google-auth.dto.ts  # Google DTOs
│       └── database/migrations/
│           └── 1738000000000-AddOAuthFieldsToUsers.ts
├── mobile/
│   ├── .env.example                    # Mobile environment template
│   ├── app.json                        # Google Sign-In plugin config
│   └── src/
│       ├── app/_layout.tsx             # Initialize Google Sign-In
│       ├── app/(public)/
│       │   ├── login/index.tsx         # Login with Google
│       │   └── register/index.tsx      # Register with Google
│       └── services/auth/
│           ├── google-auth.service.ts  # Google Sign-In service
│           └── google-auth.hooks.ts    # React hooks
└── docs/
    └── GOOGLE_OAUTH_SETUP.md           # Full documentation
```
