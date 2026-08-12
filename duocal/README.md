# DuoCal

Privacy-first shared calendar application built with Next.js App Router, featuring Google Calendar sync, AI-powered scheduling, and a futuristic dark UI.

## Quick Start

```bash
cd duocal
npm install
cp .env.example .env
# Fill in all environment variables

npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → sign in with Google → complete onboarding.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS — `#090D16`, `#0F172A`, `#2563EB`, `#3B82F6` |
| Animations | Framer Motion |
| Auth | NextAuth.js + Google (Calendar API scopes) |
| Database | PostgreSQL + Prisma |
| Calendar | FullCalendar (month / week / day) |
| Email | Resend (`@resend/node`) |
| AI | OpenAI GPT-4o-mini (regex fallback) |

## Features

### Authentication & Onboarding
- Google OAuth with Calendar API token storage
- Onboarding modal with toggles for event invites, security alerts, and product updates
- Auto-created user preferences on first sign-in

### Shared Workspaces
- 8-character privacy-first join codes (`XXXX-XXXX`)
- Email invites via Resend with branded HTML template
- Color reservation system — claim a palette color or auto-assign
- Workspace calendar view showing all members' events in their assigned colors

### Calendar
- FullCalendar grid with week/day/month views
- Click-drag to create events, click events to edit/delete
- Google Calendar one-click import
- Map pin on events with locations → Google Maps preview modal
- Optional Google Calendar sync on manual event creation

### AI Assistant
- Floating side drawer for natural language scheduling
- Conflict detection against Google Calendar
- Creates events in local DB + Google Calendar simultaneously
- Workspace-aware when a workspace is selected

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=          # openssl rand -base64 32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=     # Enable Calendar API in Google Cloud Console
RESEND_API_KEY=
RESEND_FROM_EMAIL=DuoCal <invites@yourdomain.com>
OPENAI_API_KEY=           # Optional — fallback parser works without it
```

### Google Cloud Setup
1. Create OAuth 2.0 credentials (Web application)
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Enable **Google Calendar API**
4. Add scopes are requested automatically by NextAuth

## Project Structure

```
duocal/
├── prisma/schema.prisma
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Auth-gated: calendar, workspaces, settings
│   │   ├── api/                 # REST endpoints
│   │   └── login/
│   ├── components/
│   │   ├── auth/                # OnboardingModal
│   │   ├── calendar/            # Grid, EventDialog, MapsPreview, WorkspaceSwitcher
│   │   ├── chat/                # AIAssistantDrawer
│   │   ├── layout/              # AppShell, Sidebar
│   │   ├── ui/                  # Button, Dialog, Toast, etc.
│   │   └── workspace/           # ColorPicker, JoinCodeDisplay
│   ├── contexts/                # WorkspaceContext
│   ├── lib/                     # Auth, Prisma, Google, Resend, AI, colors
│   └── middleware.ts            # Route protection
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth |
| GET/POST | `/api/calendars` | List / create workspaces |
| POST | `/api/calendars/invite` | Email invite with join code |
| POST | `/api/calendars/join` | Join workspace + claim color |
| GET | `/api/calendars/join/preview?code=` | Preview claimed colors |
| GET/POST | `/api/events` | List / create events |
| PATCH/DELETE | `/api/events/[id]` | Update / delete event |
| POST | `/api/sync/google` | Import Google Calendar events |
| POST | `/api/ai/schedule` | AI natural language scheduling |
| GET/PUT | `/api/preferences` | Notification preferences |

## User Flow

1. **Sign in** → Google OAuth → onboarding preferences
2. **Create workspace** → get private join code → invite via email
3. **Join workspace** → enter code → pick color (or auto-assign)
4. **Calendar** → switch Personal / Workspace view → create events by click-drag
5. **AI Assistant** → "Schedule standup tomorrow 9 AM in Room 3" → conflict check → create

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:studio    # Prisma Studio GUI
```
