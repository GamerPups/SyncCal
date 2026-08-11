import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.VERCEL
  ? join('/tmp', 'synccal-data')
  : join(__dirname, 'data')

const USERS_FILE = join(DATA_DIR, 'users.json')
const SESSIONS_FILE = join(DATA_DIR, 'sessions.json')
const STORES_DIR = join(DATA_DIR, 'stores')

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(STORES_DIR)) mkdirSync(STORES_DIR, { recursive: true })
}

function readJson(file, fallback) {
  ensureDataDir()
  if (!existsSync(file)) return fallback
  try {
    return JSON.parse(readFileSync(file, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJson(file, data) {
  ensureDataDir()
  writeFileSync(file, JSON.stringify(data, null, 2))
}

export function emptyBackendState() {
  return {
    events: [],
    householdPrivateEvents: [],
    sharedCalendars: [],
    invitations: [],
    lists: [],
    listItems: [],
  }
}

export function loadUsers() {
  return readJson(USERS_FILE, {})
}

export function saveUsers(users) {
  writeJson(USERS_FILE, users)
}

export function upsertGoogleUser(profile) {
  const users = loadUsers()
  const googleSub = profile.sub
  let user = Object.values(users).find((u) => u.googleSub === googleSub)

  if (!user) {
    const id = `user-${randomBytes(8).toString('hex')}`
    user = {
      id,
      googleSub,
      email: profile.email,
      name: profile.name ?? profile.email.split('@')[0],
      avatarInitials: initialsFromName(profile.name ?? profile.email),
      avatarUrl: profile.picture ?? null,
    }
  } else {
    user.email = profile.email
    user.name = profile.name ?? user.name
    user.avatarInitials = initialsFromName(user.name)
    user.avatarUrl = profile.picture ?? user.avatarUrl
  }

  users[user.id] = user
  saveUsers(users)

  const storePath = join(STORES_DIR, `${user.id}.json`)
  if (!existsSync(storePath)) {
    writeJson(storePath, emptyBackendState())
  }

  return toPublicUser(user)
}

function initialsFromName(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarInitials: user.avatarInitials,
    avatarUrl: user.avatarUrl ?? undefined,
  }
}

export function findUserById(userId) {
  const users = loadUsers()
  const user = users[userId]
  return user ? toPublicUser(user) : null
}

export function loadSessions() {
  return readJson(SESSIONS_FILE, {})
}

export function saveSessions(sessions) {
  writeJson(SESSIONS_FILE, sessions)
}

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url')
  const sessions = loadSessions()
  sessions[token] = { userId, createdAt: Date.now() }
  saveSessions(sessions)
  return token
}

export function deleteSession(token) {
  const sessions = loadSessions()
  delete sessions[token]
  saveSessions(sessions)
}

export function getUserIdForToken(token) {
  if (!token) return null
  const sessions = loadSessions()
  return sessions[token]?.userId ?? null
}

export function loadUserStore(userId) {
  ensureDataDir()
  const storePath = join(STORES_DIR, `${userId}.json`)
  if (!existsSync(storePath)) {
    const state = emptyBackendState()
    writeJson(storePath, state)
    return state
  }
  return readJson(storePath, emptyBackendState())
}

export function saveUserStore(userId, state) {
  writeJson(join(STORES_DIR, `${userId}.json`), state)
}

export function listAllStores() {
  ensureDataDir()
  return readdirSync(STORES_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
}

/** Find a shared calendar by id across all user stores. */
export function findCalendarById(calendarId) {
  for (const userId of listAllStores()) {
    const store = loadUserStore(userId)
    const calendar = store.sharedCalendars.find((c) => c.id === calendarId)
    if (calendar) return calendar
  }
  return null
}

/** Find a shared calendar by invite code across all user stores. */
export function findCalendarByInviteCode(code) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  for (const userId of listAllStores()) {
    const store = loadUserStore(userId)
    const calendar = store.sharedCalendars.find(
      (c) => c.inviteCode.toUpperCase() === normalized,
    )
    if (calendar) {
      return { calendar, ownerUserId: userId }
    }
  }
  return null
}
