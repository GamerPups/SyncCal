# SyncCal

Your calendar is yours. Your household calendar is shared.

SyncCal is a personal + shared household calendar built as a single React application for web, PWA, and eventual desktop/mobile packaging.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Radix UI primitives (shadcn-style components)
- React Router

## Getting Started

1. Copy `.env.example` to `.env` and add [Google OAuth credentials](https://console.cloud.google.com/apis/credentials):
   - Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
2. Install and run:

```bash
npm install
npm run dev:server   # API on :3001 (required for sign-in)
npm run dev          # App on :5173 — proxies /api to the server
```

Open [http://localhost:5173](http://localhost:5173) and sign in with Google.

## Authentication

SyncCal uses **Google Sign-In** (OAuth 2.0). The Express API handles the OAuth flow and stores user sessions plus calendar data on the server.

- **Sign in:** Login page → Continue with Google
- **Sessions:** Bearer token in `localStorage`, validated by `/api/auth/me`
- **Data:** Per-user store in `server/data/stores/` (empty calendar on first login)

### Environment variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `APP_URL` | Frontend origin (e.g. `http://localhost:5173`) |
| `API_URL` | API origin for OAuth callback (e.g. `http://localhost:3001`) |
| `VITE_API_BASE_URL` | Optional; leave empty to use same-origin `/api` |

## API

All app data flows through `/api/*`:

```bash
npm run dev:server   # Local API
npm run dev          # Vite proxies /api → :3001
```

On Vercel, `/api` routes to the serverless handler in `api/index.js`.

## PWA / Install

SyncCal is a Progressive Web App. After deploying (or running `npm run build && npm run preview`):

- **Android (Chrome):** open the site → menu → “Install app”, or use the in-app install banner
- **Windows (Chrome/Edge):** click the install icon in the address bar, or Settings → App → Install

Files:

- `public/site.webmanifest` — web app manifest (name, icons, theme, display mode)
- `public/icons/*.png` — 192×192 and 512×512 install icons (required for Android/Windows)
- Service worker — generated at build time by `vite-plugin-pwa` / Workbox (offline shell + asset caching)

Regenerate PNG icons locally: `npm run pwa:icons`

## Project Structure

```
src/
├── components/
│   ├── calendar/     # Calendar-specific components
│   ├── layout/       # App shell, sidebar, mobile nav
│   └── ui/           # Reusable UI primitives
├── config/           # Navigation and app config
├── hooks/            # React hooks (theme, calendar state)
├── lib/              # Utilities
├── pages/            # Route pages
└── types/            # TypeScript types
```

## License

Private — all rights reserved.
