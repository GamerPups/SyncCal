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

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development Phases

This project is being built in phases. **Phase 10** (current) includes:

- Authentication with login screen and session persistence
- Demo accounts: Ashton, Mom, Dad (`demo123`)
- API abstraction layer (`src/api/`) — swap between mock and HTTP backend
- In-browser mock backend (default) with unified data store in localStorage
- Optional Express API server (`server/`) for local HTTP development
- Data hooks wired to API — events, calendars, lists sync through backend layer
- Protected routes — app requires sign-in
- Settings account section with sign out

Previous phases include PWA, shared lists, calendar views, events, search, recurring events, conflicts, and availability sharing.

## Authentication

**Demo accounts** (password `demo123` for all):

| Email | User |
|-------|------|
| ashton@example.com | Ashton (owner) |
| mom@example.com | Mom (editor) |
| dad@example.com | Dad (editor) |

Sign in to see your personal calendar perspective. Shared household data is stored in a unified backend store — switch accounts to see different views and permissions.

## API modes

**Mock API (default)** — no server required. Data persists in `localStorage` under `synccal-backend-store`.

**Express server (optional)**:

```bash
npm run dev:server   # API at http://localhost:3001
npm run dev          # Vite proxies /api to the server
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL=http://localhost:3001` to use the HTTP client directly.

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
├── data/             # Mock data (replaceable with API later)
├── hooks/            # React hooks (theme, calendar state)
├── lib/              # Utilities
├── pages/            # Route pages
└── types/            # TypeScript types
```

## License

Private — all rights reserved.
