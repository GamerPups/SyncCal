import express from 'express'
import cors from 'cors'
import { OAuth2Client } from 'google-auth-library'
import {
  createSession,
  deleteSession,
  findCalendarById,
  findCalendarByInviteCode,
  findUserById,
  getUserIdForToken,
  loadUserStore,
  saveUserStore,
  toPublicUser,
  upsertGoogleUser,
} from './storage.js'

const APP_URL = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/$/, '')
const API_URL = (process.env.API_URL ?? process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.')
  }
  return new OAuth2Client(
    clientId,
    clientSecret,
    `${API_URL}/api/auth/google/callback`,
  )
}

function parseToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

function requireAuth(req, res, next) {
  const token = parseToken(req.headers.authorization)
  const userId = getUserIdForToken(token)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })
  req.authToken = token
  req.userId = userId
  next()
}

export function createApp() {
  const app = express()
  app.use(cors({ origin: APP_URL, credentials: true }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/auth/google', (_req, res) => {
    try {
      const client = getOAuthClient()
      const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'email', 'profile'],
      })
      res.redirect(url)
    } catch (err) {
      res.status(500).json({ message: err.message ?? 'Google OAuth is not configured.' })
    }
  })

  app.get('/api/auth/google/callback', async (req, res) => {
    const code = req.query.code
    if (!code || typeof code !== 'string') {
      return res.redirect(`${APP_URL}/login?error=oauth_cancelled`)
    }

    try {
      const client = getOAuthClient()
      const { tokens } = await client.getToken(code)
      client.setCredentials(tokens)

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      if (!payload?.sub || !payload.email) {
        return res.redirect(`${APP_URL}/login?error=oauth_profile`)
      }

      const user = upsertGoogleUser(payload)
      const token = createSession(user.id)
      res.redirect(`${APP_URL}/auth/callback?token=${encodeURIComponent(token)}`)
    } catch {
      res.redirect(`${APP_URL}/login?error=oauth_failed`)
    }
  })

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    deleteSession(req.authToken)
    res.status(204).end()
  })

  app.get('/api/auth/me', (req, res) => {
    const token = parseToken(req.headers.authorization)
    const userId = getUserIdForToken(token)
    if (!userId) return res.json(null)
    const user = findUserById(userId)
    if (!user) return res.json(null)
    res.json({ token, user })
  })

  app.get('/api/data', requireAuth, (req, res) => {
    res.json(loadUserStore(req.userId))
  })

  app.put('/api/data', requireAuth, (req, res) => {
    saveUserStore(req.userId, req.body)
    res.json(loadUserStore(req.userId))
  })

  app.patch('/api/data', requireAuth, (req, res) => {
    const next = { ...loadUserStore(req.userId), ...req.body }
    saveUserStore(req.userId, next)
    res.json(next)
  })

  app.get('/api/calendars/by-id/:calendarId', requireAuth, (req, res) => {
    const calendar = findCalendarById(req.params.calendarId)
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found.' })
    }
    res.json({ calendar })
  })

  app.get('/api/calendars/by-invite/:code', requireAuth, (req, res) => {
    const match = findCalendarByInviteCode(req.params.code)
    if (!match) {
      return res.status(404).json({ message: 'Invalid invite code.' })
    }
    res.json({ calendar: match.calendar })
  })

  return app
}
