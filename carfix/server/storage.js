import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const STORE_PATH = path.join(DATA_DIR, 'store.json')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

let store = { cars: [] }

export function loadStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  if (fs.existsSync(STORE_PATH)) {
    store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
  } else {
    saveStore()
  }
}

export function saveStore() {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2))
}

export function getAllCars() {
  return store.cars
}

export function getCar(id) {
  return store.cars.find((c) => c.id === id) ?? null
}

export function createCar(data) {
  const now = new Date().toISOString()
  const car = {
    id: uuidv4(),
    make: data.make ?? '',
    model: data.model ?? '',
    year: data.year ?? new Date().getFullYear(),
    trim: data.trim ?? '',
    color: data.color ?? '#2563eb',
    bodyType: data.bodyType ?? 'sedan',
    vin: data.vin ?? '',
    mileage: data.mileage ?? 0,
    engine: data.engine ?? '',
    transmission: data.transmission ?? 'automatic',
    notes: data.notes ?? '',
    diagnostics: [],
    photos: [],
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  store.cars.push(car)
  saveStore()
  return car
}

export function updateCar(id, data) {
  const idx = store.cars.findIndex((c) => c.id === id)
  if (idx === -1) return null
  store.cars[idx] = {
    ...store.cars[idx],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  saveStore()
  return store.cars[idx]
}

export function deleteCar(id) {
  const car = getCar(id)
  if (!car) return false
  for (const photo of car.photos) {
    const filePath = path.join(UPLOADS_DIR, photo.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  store.cars = store.cars.filter((c) => c.id !== id)
  saveStore()
  return true
}

export function addDiagnostic(carId, diag) {
  const car = getCar(carId)
  if (!car) return null
  const entry = {
    id: uuidv4(),
    code: diag.code,
    description: diag.description,
    affectedPart: diag.affectedPart,
    severity: diag.severity,
    fixSteps: diag.fixSteps ?? [],
    partsNeeded: diag.partsNeeded ?? [],
    estimatedCost: diag.estimatedCost ?? '',
    difficulty: diag.difficulty ?? 'moderate',
    addedAt: new Date().toISOString(),
  }
  car.diagnostics.push(entry)
  car.updatedAt = new Date().toISOString()
  saveStore()
  return car
}

export function removeDiagnostic(carId, diagId) {
  const car = getCar(carId)
  if (!car) return null
  car.diagnostics = car.diagnostics.filter((d) => d.id !== diagId)
  car.updatedAt = new Date().toISOString()
  saveStore()
  return car
}

export function addPhoto(carId, photo) {
  const car = getCar(carId)
  if (!car) return null
  const entry = {
    id: uuidv4(),
    ...photo,
    uploadedAt: new Date().toISOString(),
  }
  car.photos.push(entry)
  car.updatedAt = new Date().toISOString()
  saveStore()
  return car
}

export function deletePhoto(carId, photoId) {
  const car = getCar(carId)
  if (!car) return null
  const photo = car.photos.find((p) => p.id === photoId)
  if (photo) {
    const filePath = path.join(UPLOADS_DIR, photo.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  car.photos = car.photos.filter((p) => p.id !== photoId)
  car.updatedAt = new Date().toISOString()
  saveStore()
  return car
}

export function getMessages(carId) {
  const car = getCar(carId)
  if (!car) return null
  return car.messages
}

export function addMessage(carId, { sender, text }) {
  const car = getCar(carId)
  if (!car) return null
  const message = {
    id: uuidv4(),
    sender,
    text,
    createdAt: new Date().toISOString(),
  }
  car.messages.push(message)
  car.updatedAt = new Date().toISOString()
  saveStore()
  return message
}
