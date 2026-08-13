import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { v4 as uuidv4 } from 'uuid'
import {
  loadStore,
  saveStore,
  getCar,
  getAllCars,
  createCar,
  updateCar,
  deleteCar,
  addPhoto,
  deletePhoto,
  addMessage,
  getMessages,
  addDiagnostic,
  removeDiagnostic,
} from './storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads')
const PORT = process.env.PORT ?? 3002
const APP_URL = (process.env.APP_URL ?? 'http://localhost:5174').replace(/\/$/, '')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image uploads are allowed.'))
  },
})

const app = express()
app.use(cors({ origin: APP_URL }))
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// Cars
app.get('/api/cars', (_req, res) => {
  res.json(getAllCars())
})

app.get('/api/cars/:id', (req, res) => {
  const car = getCar(req.params.id)
  if (!car) return res.status(404).json({ message: 'Car not found.' })
  res.json(car)
})

app.post('/api/cars', (req, res) => {
  const car = createCar(req.body)
  res.status(201).json(car)
})

app.patch('/api/cars/:id', (req, res) => {
  const car = updateCar(req.params.id, req.body)
  if (!car) return res.status(404).json({ message: 'Car not found.' })
  res.json(car)
})

app.delete('/api/cars/:id', (req, res) => {
  const ok = deleteCar(req.params.id)
  if (!ok) return res.status(404).json({ message: 'Car not found.' })
  res.status(204).end()
})

// Diagnostics
app.post('/api/cars/:id/diagnostics', (req, res) => {
  const car = addDiagnostic(req.params.id, req.body)
  if (!car) return res.status(404).json({ message: 'Car not found.' })
  res.json(car)
})

app.delete('/api/cars/:id/diagnostics/:diagId', (req, res) => {
  const car = removeDiagnostic(req.params.id, req.params.diagId)
  if (!car) return res.status(404).json({ message: 'Car not found.' })
  res.json(car)
})

// Photos
app.post('/api/cars/:id/photos', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No photo uploaded.' })
  const car = addPhoto(req.params.id, {
    filename: req.file.filename,
    originalName: req.file.originalname,
    caption: req.body.caption ?? '',
    url: `/uploads/${req.file.filename}`,
  })
  if (!car) return res.status(404).json({ message: 'Car not found.' })
  res.status(201).json(car)
})

app.delete('/api/cars/:id/photos/:photoId', (req, res) => {
  const car = deletePhoto(req.params.id, req.params.photoId)
  if (!car) return res.status(404).json({ message: 'Car not found.' })
  res.json(car)
})

// Messages
app.get('/api/cars/:id/messages', (req, res) => {
  const messages = getMessages(req.params.id)
  if (messages === null) return res.status(404).json({ message: 'Car not found.' })
  res.json(messages)
})

app.post('/api/cars/:id/messages', (req, res) => {
  const { sender, text } = req.body
  if (!text?.trim()) return res.status(400).json({ message: 'Message text is required.' })
  const message = addMessage(req.params.id, {
    sender: sender?.trim() || 'You',
    text: text.trim(),
  })
  if (!message) return res.status(404).json({ message: 'Car not found.' })
  res.status(201).json(message)
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: err.message ?? 'Internal server error.' })
})

loadStore()
app.listen(PORT, () => {
  console.log(`CarFix API running on http://localhost:${PORT}`)
})
