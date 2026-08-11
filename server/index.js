/**
 * Optional local Express API for SyncCal development.
 * Run: npm run dev:server
 * Then set VITE_API_BASE_URL=http://localhost:3001 in .env
 */
import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT ?? 3001
const STORE_FILE = join(__dirname, 'data-store.json')

const DEMO_USERS = [
  { id: 'user-ashton', name: 'Ashton', email: 'ashton@example.com', avatarInitials: 'AS', password: 'demo123' },
  { id: 'user-mom', name: 'Mom', email: 'mom@example.com', avatarInitials: 'MO', password: 'demo123' },
  { id: 'user-dad', name: 'Dad', email: 'dad@example.com', avatarInitials: 'DA', password: 'demo123' },
]

function loadStore() {
  if (!existsSync(STORE_FILE)) {
    const defaultStore = {
      events: [],
      householdPrivateEvents: [],
      sharedCalendars: [],
      invitations: [],
      lists: [],
      listItems: [],
    }
    writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2))
    return defaultStore
  }
  return JSON.parse(readFileSync(STORE_FILE, 'utf-8'))
}

function saveStore(state) {
  writeFileSync(STORE_FILE, JSON.stringify(state, null, 2))
}

let store = loadStore()
const sessions = new Map()

function parseToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  return sessions.get(token) ?? null
}

function requireAuth(req, res, next) {
  const userId = parseToken(req.headers.authorization)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })
  req.userId = userId
  next()
}

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
  sessions.set(token, user.id)
  const { password: _, ...publicUser } = user
  res.json({ token, user: publicUser })
})

app.post('/api/auth/logout', (_req, res) => {
  res.status(204).end()
})

app.get('/api/auth/me', (req, res) => {
  const userId = parseToken(req.headers.authorization)
  if (!userId) return res.json(null)
  const user = DEMO_USERS.find((u) => u.id === userId)
  if (!user) return res.json(null)
  const { password: _, ...publicUser } = user
  res.json({ token: req.headers.authorization?.slice(7), user: publicUser })
})

app.get('/api/data', requireAuth, (_req, res) => {
  store = loadStore()
  res.json(store)
})

app.put('/api/data', requireAuth, (req, res) => {
  store = req.body
  saveStore(store)
  res.json(store)
})

app.patch('/api/data', requireAuth, (req, res) => {
  store = { ...loadStore(), ...req.body }
  saveStore(store)
  res.json(store)
})

app.listen(PORT, () => {
  console.log(`SyncCal API running at http://localhost:${PORT}`)
})
