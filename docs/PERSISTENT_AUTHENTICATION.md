# Persistent Authentication Implementation

## Overview

The mobile app now implements persistent authentication, allowing users to remain signed in across app restarts until they explicitly sign out.

## How It Works

### Token Storage

Tokens are stored in the device's local storage using `@react-native-async-storage/async-storage`:

- **Access Token**: Used for authenticating API requests (Bearer token)
- **Refresh Token**: Used to obtain new access tokens when they expire

Location: `mobile/src/services/auth/token.storage.ts`

### Authentication Flow

1. **Sign In/Register**:
   - User enters credentials
   - API returns tokens in Set-Cookie headers
   - Tokens are extracted and stored in AsyncStorage
   - User is redirected to dashboard

2. **App Restart**:
   - `AuthProvider` automatically checks authentication status on mount
   - Retrieves stored tokens from AsyncStorage
   - Makes API call to `/auth/me` with stored access token
   - If valid, user is authenticated and redirected to dashboard
   - If invalid, user stays on welcome/login screen

3. **Automatic Token Refresh**:
   - Axios interceptor monitors all API responses
   - On 401 error, automatically attempts to refresh tokens
   - If refresh succeeds, retries the original request
   - If refresh fails, clears tokens and redirects to login

4. **Sign Out**:
   - Calls logout API endpoint
   - Clears tokens from AsyncStorage
   - Redirects to login screen

## Key Components

### 1. Token Storage (`mobile/src/services/auth/token.storage.ts`)

Provides methods to:
- `getAccessToken()`: Retrieve access token
- `getRefreshToken()`: Retrieve refresh token
- `setTokens()`: Store both tokens
- `clearTokens()`: Remove all tokens

### 2. Axios Configuration (`mobile/src/services/axiosConfig.ts`)

**Request Interceptor**:
- Automatically attaches Bearer token to all authenticated requests

**Response Interceptor**:
- Handles 401 errors
- Attempts token refresh
- Retries failed requests with new token
- Clears tokens if refresh fails

### 3. Auth Provider (`mobile/src/providers/AuthProvider.tsx`)

- Manages global authentication state
- Checks authentication status on app mount
- Provides authentication methods (signIn, signUp, signOut)
- Handles user profile updates

### 4. Route Guards

**Welcome Screen** (`mobile/src/app/(public)/welcome/index.tsx`):
- Checks if user is authenticated
- Redirects to dashboard if already signed in
- Shows welcome screen if not authenticated

**Login/Register Screens**:
- Redirect authenticated users to dashboard
- Prevent accessing login/register when already signed in

**Protected Layout** (`mobile/src/app/(protected)/_layout.tsx`):
- Blocks access to protected routes if not authenticated
- Redirects to login if user is not signed in

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     User Signs In                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          Tokens Stored in AsyncStorage                       │
│    (access_token, refresh_token)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              App Restart/Reload                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│     AuthProvider Checks Tokens on Mount                      │
│     - Retrieves tokens from AsyncStorage                    │
│     - Calls /auth/me with access token                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐         ┌────────────────┐
│  Valid Token  │         │ Invalid Token  │
└───────┬───────┘         └────────┬───────┘
        │                          │
        ▼                          ▼
┌───────────────┐         ┌────────────────┐
│  Authenticated │         │ Clear Tokens   │
│  → Dashboard   │         │  → Login       │
└───────────────┘         └────────────────┘
```

## API Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  API Request Made                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│     Request Interceptor Adds Bearer Token                    │
│     Authorization: Bearer <access_token>                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Send Request                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐         ┌────────────────┐
│  Success      │         │   401 Error    │
│  (200-299)    │         │                │
└───────┬───────┘         └────────┬───────┘
        │                          │
        ▼                          ▼
┌───────────────┐         ┌────────────────┐
│ Return Data   │         │ Try Refresh    │
└───────────────┘         │ Token          │
                          └────────┬───────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
              ┌──────────────┐         ┌────────────────┐
              │ Refresh OK   │         │ Refresh Failed │
              └──────┬───────┘         └────────┬───────┘
                     │                          │
                     ▼                          ▼
              ┌──────────────┐         ┌────────────────┐
              │ Store New    │         │ Clear Tokens   │
              │ Tokens       │         │ → Login        │
              └──────┬───────┘         └────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Retry        │
              │ Original     │
              │ Request      │
              └──────────────┘
```

## Security Considerations

1. **Token Storage**: Tokens are stored in AsyncStorage, which is encrypted on iOS and uses SharedPreferences on Android
2. **Automatic Refresh**: Expired access tokens are automatically refreshed without user intervention
3. **Secure Transmission**: All API calls use HTTPS
4. **Token Expiration**: Tokens have expiration times enforced by the backend
5. **Logout Cleanup**: Tokens are completely removed from storage on logout

## Testing the Implementation

### Test Case 1: Sign In and Restart App
1. Open the app
2. Sign in with valid credentials
3. Close the app completely (force quit)
4. Reopen the app
5. **Expected**: User should be automatically signed in and see the dashboard

### Test Case 2: Token Expiration
1. Sign in to the app
2. Wait for access token to expire (or manually expire it)
3. Make an API request
4. **Expected**: Token should be automatically refreshed and request should succeed

### Test Case 3: Sign Out
1. Sign in to the app
2. Navigate to dashboard
3. Sign out
4. Close and reopen the app
5. **Expected**: User should see the welcome/login screen

### Test Case 4: Invalid Token
1. Sign in to the app
2. Manually corrupt the stored token
3. Restart the app
4. **Expected**: User should be redirected to login screen

## Troubleshooting

### User is not staying signed in

1. Check if tokens are being stored:
   - Add console logs in `token.storage.ts` to verify `setTokens()` is called
   - Verify tokens are being extracted from cookies in `auth.services.ts`

2. Check if tokens are being retrieved:
   - Add console logs in `AuthProvider.tsx` in `fetchUserStatus()`
   - Verify `getCurrentUser()` is being called with valid token

3. Check network requests:
   - Use React Native Debugger or Flipper to inspect network requests
   - Verify Bearer token is being sent in Authorization header

### Token refresh is failing

1. Check refresh token validity:
   - Verify refresh token is being stored correctly
   - Check if refresh token has expired

2. Check refresh endpoint:
   - Verify `/auth/refresh` endpoint is working
   - Check if Cookie header is being sent correctly

## Files Modified

1. `mobile/src/providers/AuthProvider.tsx`
   - Added console log for debugging authentication failures
   
2. `mobile/src/app/(public)/welcome/index.tsx`
   - Added authentication check to redirect authenticated users
   - Added loading state while checking authentication

3. `mobile/src/app/(public)/login/index.tsx`
   - Added authentication check to redirect authenticated users

4. `mobile/src/app/(public)/register/index.tsx`
   - Added authentication check to redirect authenticated users

## Existing Implementation (Already Working)

The following components were already correctly implemented:

1. **Token Storage** (`mobile/src/services/auth/token.storage.ts`)
   - AsyncStorage integration for persistent token storage

2. **Axios Configuration** (`mobile/src/services/axiosConfig.ts`)
   - Request interceptor for adding Bearer tokens
   - Response interceptor for automatic token refresh
   - 401 error handling

3. **Auth Service** (`mobile/src/services/auth/auth.services.ts`)
   - Token extraction from Set-Cookie headers
   - Token storage after login/register
   - Token cleanup on logout

4. **Protected Routes** (`mobile/src/app/(protected)/_layout.tsx`)
   - Route guard for authenticated routes

## Conclusion

The persistent authentication system is now fully functional. Users will remain signed in across app restarts until they explicitly sign out. The system handles token expiration automatically through refresh tokens, providing a seamless user experience.
