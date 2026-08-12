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
    personalInviteCode: '',
    calendarConnections: [],
    lists: [],
    listItems: [],
  }
}

function normalizeStore(raw) {
  const base = emptyBackendState()
  return {
    ...base,
    ...raw,
    calendarConnections: raw.calendarConnections ?? [],
    lists: raw.lists ?? [],
    listItems: raw.listItems ?? [],
    events: raw.events ?? [],
    householdPrivateEvents: raw.householdPrivateEvents ?? [],
    personalInviteCode: raw.personalInviteCode ?? '',
  }
}

function generatePersonalInviteCode(name) {
  const slug = String(name).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const suffix = randomBytes(2).toString('hex').toUpperCase()
  return `${slug || 'USER'}-${suffix}`
}

export function ensurePersonalInviteCode(userId, userName) {
  const store = loadUserStore(userId)
  if (store.personalInviteCode) return store.personalInviteCode
  store.personalInviteCode = generatePersonalInviteCode(userName)
  saveUserStore(userId, store)
  return store.personalInviteCode
}

export function findUserByPersonalInviteCode(code) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  for (const userId of listAllStores()) {
    const store = loadUserStore(userId)
    if (store.personalInviteCode?.toUpperCase() === normalized) {
      const user = findUserById(userId)
      if (!user) continue
      return { userId, user, store }
    }
  }
  return null
}

function makeConnectionId(userIdA, userIdB) {
  return `conn-${[userIdA, userIdB].sort().join('-')}`
}

function buildConnectionEntry({ id, otherUser, status, connectedAt }) {
  return {
    id,
    otherUserId: otherUser.id,
    otherUserName: otherUser.name,
    otherUserInitials: otherUser.avatarInitials,
    otherUserColor: otherUser.color,
    status,
    connectedAt,
  }
}

function memberColorForUser(userId) {
  const colors = ['#4A7C59', '#C4785A', '#5B8A72', '#9B7B6A', '#4A6670', '#8B7355', '#6B8F71']
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash + userId.charCodeAt(i)) % colors.length
  return colors[hash]
}

function otherUserFromRecord(user) {
  return {
    id: user.id,
    name: user.name,
    avatarInitials: user.avatarInitials,
    color: memberColorForUser(user.id),
  }
}

export function requestCalendarConnection(requesterUserId, inviteCode) {
  const target = findUserByPersonalInviteCode(inviteCode)
  if (!target) return { error: 'Invalid invite code.' }
  if (target.userId === requesterUserId) return { error: 'You cannot connect to your own calendar.' }

  const requester = findUserById(requesterUserId)
  if (!requester) return { error: 'User not found.' }

  const connId = makeConnectionId(requesterUserId, target.userId)
  const requesterStore = loadUserStore(requesterUserId)
  const targetStore = loadUserStore(target.userId)

  const existingRequester = requesterStore.calendarConnections.find((c) => c.id === connId)
  if (existingRequester?.status === 'connected') {
    return { error: 'You are already connected with this person.' }
  }
  if (existingRequester?.status === 'pending_outgoing') {
    return { error: 'Connection request already sent. Waiting for them to accept.' }
  }

  const targetOther = otherUserFromRecord(target.user)
  const requesterOther = otherUserFromRecord(requester)

  const now = new Date().toISOString()

  requesterStore.calendarConnections = [
    ...requesterStore.calendarConnections.filter((c) => c.id !== connId),
    buildConnectionEntry({
      id: connId,
      otherUser: targetOther,
      status: 'pending_outgoing',
    }),
  ]

  targetStore.calendarConnections = [
    ...targetStore.calendarConnections.filter((c) => c.id !== connId),
    buildConnectionEntry({
      id: connId,
      otherUser: requesterOther,
      status: 'pending_incoming',
    }),
  ]

  saveUserStore(requesterUserId, requesterStore)
  saveUserStore(target.userId, targetStore)

  return {
    connection: requesterStore.calendarConnections.find((c) => c.id === connId),
    otherUserName: target.user.name,
  }
}

export function acceptCalendarConnection(userId, connectionId) {
  const store = loadUserStore(userId)
  const conn = store.calendarConnections.find((c) => c.id === connectionId)
  if (!conn) return { error: 'Connection not found.' }
  if (conn.status !== 'pending_incoming') return { error: 'Nothing to accept for this connection.' }

  const otherUserId = conn.otherUserId
  const otherStore = loadUserStore(otherUserId)
  const otherConn = otherStore.calendarConnections.find((c) => c.id === connectionId)
  if (!otherConn) return { error: 'Connection not found on other user.' }

  const now = new Date().toISOString()
  conn.status = 'connected'
  conn.connectedAt = now
  otherConn.status = 'connected'
  otherConn.connectedAt = now

  saveUserStore(userId, store)
  saveUserStore(otherUserId, otherStore)
  syncAvailabilityBetweenUsers(userId, otherUserId)

  return { connection: conn }
}

export function declineCalendarConnection(userId, connectionId) {
  const store = loadUserStore(userId)
  const conn = store.calendarConnections.find((c) => c.id === connectionId)
  if (!conn) return { error: 'Connection not found.' }

  const otherUserId = conn.otherUserId
  const otherStore = loadUserStore(otherUserId)

  store.calendarConnections = store.calendarConnections.filter((c) => c.id !== connectionId)
  otherStore.calendarConnections = otherStore.calendarConnections.filter((c) => c.id !== connectionId)

  removeAvailabilityFromUser(userId, otherUserId)
  removeAvailabilityFromUser(otherUserId, userId)

  saveUserStore(userId, store)
  saveUserStore(otherUserId, otherStore)
  return { success: true }
}

export function disconnectCalendarConnection(userId, connectionId) {
  return declineCalendarConnection(userId, connectionId)
}

function shareableEvents(store, ownerId) {
  return store.events.filter(
    (e) => e.visibility === 'private' && e.shareAvailability && e.ownerId === ownerId,
  )
}

function removeAvailabilityFromUser(viewerUserId, ownerUserId) {
  const store = loadUserStore(viewerUserId)
  store.householdPrivateEvents = store.householdPrivateEvents.filter((e) => e.ownerId !== ownerUserId)
  saveUserStore(viewerUserId, store)
}

export function syncAvailabilityBetweenUsers(userIdA, userIdB) {
  const storeA = loadUserStore(userIdA)
  const storeB = loadUserStore(userIdB)

  storeB.householdPrivateEvents = [
    ...storeB.householdPrivateEvents.filter((e) => e.ownerId !== userIdA),
    ...shareableEvents(storeA, userIdA).map((e) => ({ ...e })),
  ]

  storeA.householdPrivateEvents = [
    ...storeA.householdPrivateEvents.filter((e) => e.ownerId !== userIdB),
    ...shareableEvents(storeB, userIdB).map((e) => ({ ...e })),
  ]

  saveUserStore(userIdA, storeA)
  saveUserStore(userIdB, storeB)
}

export function syncAvailabilityForUser(userId) {
  const store = loadUserStore(userId)
  const connected = store.calendarConnections.filter((c) => c.status === 'connected')
  for (const conn of connected) {
    syncAvailabilityBetweenUsers(userId, conn.otherUserId)
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
  return normalizeStore(readJson(storePath, emptyBackendState()))
}

export function saveUserStore(userId, state) {
  const cleaned = {
    ...emptyBackendState(),
    events: state.events ?? [],
    householdPrivateEvents: state.householdPrivateEvents ?? [],
    personalInviteCode: state.personalInviteCode ?? '',
    calendarConnections: state.calendarConnections ?? [],
    lists: state.lists ?? [],
    listItems: state.listItems ?? [],
  }
  writeJson(join(STORES_DIR, `${userId}.json`), cleaned)
}

export function listAllStores() {
  ensureDataDir()
  return readdirSync(STORES_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
}
