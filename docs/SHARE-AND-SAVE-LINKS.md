# Share & Save Links Flow

## Overview

When a user shares a link from Instagram, Facebook, Twitter, or TikTok, this app can appear in the share sheet. The link is stored via a callback URL, the user signs in (if needed), and the link is sent to the backend. Saved links are shown on the **Dashboard**.

## Flow

1. **Share** → User shares a link from a social app and selects this app (Android share target).
2. **Callback URL** → The shared link is passed to the app (e.g. via deep link or share intent).
3. **Auth** → If the user is not signed in, they are sent to **Login**. The pending link is stored and restored after sign-in.
4. **Save** → Once authenticated, the app sends the link to the backend (`POST /v1/api/links`).
5. **Dashboard** → The user is redirected to the Dashboard, which lists all saved links with search and filters.

## Deep Link

- **Scheme:** `video-mobile-application`
- **Save path:** `video-mobile-application://save?url=<encoded_url>`

Example: `video-mobile-application://save?url=https%3A%2F%2Fwww.instagram.com%2Fp%2FABC123%2F`

When the app opens with this URL, it navigates to `/save`, extracts `url`, and runs the save flow (auth check → store or save → redirect).

## Android Share Target

An Android `SEND` intent filter (`text/plain`) is configured so the app appears in the share sheet. Reading the shared URL from the intent usually requires native code (e.g. [expo-share-intent](https://www.npmjs.com/package/expo-share-intent)) or a custom config plugin. The deep link flow above can be used in the meantime (e.g. from a web redirect or share handler that opens the app with `save?url=...`).

## Backend

- **POST** `/v1/api/links` — Save a link (auth required). Body: `{ url, source?, title?, category?, thumbnailUrl? }`. If `title` or `thumbnailUrl` are missing, the server fetches Open Graph metadata (`og:image`, `og:title`) from the URL when possible.
- **GET** `/v1/api/links` — List the current user’s links. Query: `?search=...&source=...&category=...`.

**Categories:** `nature`, `cooking`, `food`, `sports`, `music`, `tech`, `entertainment`, `other`.

## Dashboard

- **Platform filter** — All, Instagram, Facebook, Twitter, TikTok, Other.
- **Category filter** — All, Nature, Cooking, Food, Sports, Music, Tech, Entertainment, Other.
- **Video boxes** — Grid of 16:9 thumbnails. Thumbnail from `thumbnailUrl` or OG fetch; fallback placeholder when missing. Platform badge and optional category chip on each card. Tap to open URL.

## Migrations

Run migrations (including `CreateLinksTable` and `AddCategoryAndThumbnailToLinks`):

```bash
cd server && npm run migration:run
```

Ensure PostgreSQL is running and `POSTGRES_*` / `DB_*` env vars are set (see `server/.env` or `infra`).
