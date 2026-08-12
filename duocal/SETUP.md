# DuoCal Setup Guide

Follow these steps once after cloning. Estimated time: ~10 minutes.

## 1. Install & configure

```bash
cd duocal
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Default `file:./dev.db` works for local SQLite |
| `NEXTAUTH_SECRET` | Yes | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` for local dev |
| `GOOGLE_CLIENT_ID` | Yes | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | From Google Cloud Console |
| `RESEND_API_KEY` | No | Email workspace invites |
| `OPENAI_API_KEY` | No | AI assistant (regex fallback without it) |

## 2. Google Cloud OAuth

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. **APIs & Services → Library** → enable **Google Calendar API**
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Copy Client ID and Client Secret into `.env`

## 3. Database & run

```bash
npx prisma db push
npm run dev
```

Open **http://localhost:3000/login** and sign in with Google.

> Keep the terminal running while using the app. Closing it causes `ERR_CONNECTION_REFUSED` on the OAuth callback.

## 4. Production (optional)

For production, switch `DATABASE_URL` to PostgreSQL and update the Prisma provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Add your production URL to Google OAuth redirect URIs and set `NEXTAUTH_URL` accordingly.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ERR_CONNECTION_REFUSED` on OAuth callback | Dev server not running — run `npm run dev` |
| Google sign-in error / invalid_client | Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` |
| Redirect URI mismatch | Add exact callback URL in Google Cloud Console |
| Prisma errors | Run `npx prisma db push` after changing schema |
