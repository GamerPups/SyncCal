import type { Car, CreateCarInput, DiagnosticCodeInfo, Message } from '@/types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  getCars: () => request<Car[]>('/cars'),
  getCar: (id: string) => request<Car>(`/cars/${id}`),
  createCar: (data: CreateCarInput) =>
    request<Car>('/cars', { method: 'POST', body: JSON.stringify(data) }),
  updateCar: (id: string, data: Partial<CreateCarInput>) =>
    request<Car>(`/cars/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCar: (id: string) => request<void>(`/cars/${id}`, { method: 'DELETE' }),

  addDiagnostic: (carId: string, diag: DiagnosticCodeInfo) =>
    request<Car>(`/cars/${carId}/diagnostics`, {
      method: 'POST',
      body: JSON.stringify(diag),
    }),
  removeDiagnostic: (carId: string, diagId: string) =>
    request<Car>(`/cars/${carId}/diagnostics/${diagId}`, { method: 'DELETE' }),

  uploadPhoto: async (carId: string, file: File, caption = '') => {
    const form = new FormData()
    form.append('photo', file)
    form.append('caption', caption)
    const res = await fetch(`${BASE}/cars/${carId}/photos`, { method: 'POST', body: form })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message ?? 'Upload failed')
    }
    return res.json() as Promise<Car>
  },
  deletePhoto: (carId: string, photoId: string) =>
    request<Car>(`/cars/${carId}/photos/${photoId}`, { method: 'DELETE' }),

  getMessages: (carId: string) => request<Message[]>(`/cars/${carId}/messages`),
  sendMessage: (carId: string, sender: string, text: string) =>
    request<Message>(`/cars/${carId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ sender, text }),
    }),
}
