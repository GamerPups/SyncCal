import express from 'express'
import cors from 'cors'
import { OAuth2Client } from 'google-auth-library'
import {
  createSession,
  deleteSession,
  findUserById,
  findUserByPersonalInviteCode,
  getUserIdForToken,
  loadUserStore,
  saveUserStore,
  toPublicUser,
  upsertGoogleUser,
  ensurePersonalInviteCode,
  requestCalendarConnection,
  acceptCalendarConnection,
  declineCalendarConnection,
  disconnectCalendarConnection,
  syncAvailabilityForUser,
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
      console.error('[auth] Google OAuth not configured:', err.message)
      res.redirect(`${APP_URL}/login?error=oauth_not_configured`)
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
    } catch (err) {
      console.error('[auth] Google OAuth callback failed:', err)
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
    const user = findUserById(req.userId)
    if (user) ensurePersonalInviteCode(req.userId, user.name)
    res.json(loadUserStore(req.userId))
  })

  app.put('/api/data', requireAuth, (req, res) => {
    saveUserStore(req.userId, req.body)
    syncAvailabilityForUser(req.userId)
    res.json(loadUserStore(req.userId))
  })

  app.patch('/api/data', requireAuth, (req, res) => {
    const next = { ...loadUserStore(req.userId), ...req.body }
    saveUserStore(req.userId, next)
    if (req.body.events) syncAvailabilityForUser(req.userId)
    res.json(loadUserStore(req.userId))
  })

  app.get('/api/calendars/by-invite/:code', requireAuth, (req, res) => {
    const match = findUserByPersonalInviteCode(req.params.code)
    if (!match) {
      return res.status(404).json({ message: 'Invalid invite code.' })
    }
    res.json({
      user: match.user,
      personalInviteCode: match.store.personalInviteCode,
    })
  })

  app.post('/api/calendar-connections/request', requireAuth, (req, res) => {
    const code = req.body?.code
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Invite code is required.' })
    }
    const result = requestCalendarConnection(req.userId, code)
    if (result.error) {
      return res.status(400).json({ message: result.error })
    }
    res.json(result)
  })

  app.post('/api/calendar-connections/:connectionId/accept', requireAuth, (req, res) => {
    const result = acceptCalendarConnection(req.userId, req.params.connectionId)
    if (result.error) {
      return res.status(400).json({ message: result.error })
    }
    res.json(result)
  })

  app.post('/api/calendar-connections/:connectionId/decline', requireAuth, (req, res) => {
    const result = declineCalendarConnection(req.userId, req.params.connectionId)
    if (result.error) {
      return res.status(400).json({ message: result.error })
    }
    res.json(result)
  })

  app.post('/api/calendar-connections/:connectionId/disconnect', requireAuth, (req, res) => {
    const result = disconnectCalendarConnection(req.userId, req.params.connectionId)
    if (result.error) {
      return res.status(400).json({ message: result.error })
    }
    res.json(result)
  })

  return app
}
