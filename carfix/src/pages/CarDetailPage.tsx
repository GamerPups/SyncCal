import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Settings, Wrench, Camera, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Car3DViewer } from '@/components/Car3DViewer'
import { DiagnosticPanel } from '@/components/DiagnosticPanel'
import { PhotoUpload } from '@/components/PhotoUpload'
import { MessageThread } from '@/components/MessageThread'
import { CarInfoForm } from '@/components/CarInfoForm'
import { api } from '@/lib/api'
import { formatMileage } from '@/lib/utils'
import type { Car, CarPart, CreateCarInput, DiagnosticCodeInfo } from '@/types'

type Tab = 'diagnostics' | 'photos' | 'messages' | 'settings'

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('diagnostics')
  const [highlightedParts, setHighlightedParts] = useState<CarPart[]>([])
  const [messages, setMessages] = useState(car?.messages ?? [])

  const loadCar = useCallback(async () => {
    if (!id) return
    try {
      const data = await api.getCar(id)
      setCar(data)
      setMessages(data.messages)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadCar() }, [loadCar])

  const handleAddDiagnostic = async (info: DiagnosticCodeInfo) => {
    if (!id) return
    const updated = await api.addDiagnostic(id, info)
    setCar(updated)
  }

  const handleRemoveDiagnostic = async (diagId: string) => {
    if (!id) return
    const updated = await api.removeDiagnostic(id, diagId)
    setCar(updated)
  }

  const handleUpload = async (file: File, caption: string) => {
    if (!id) return
    const updated = await api.uploadPhoto(id, file, caption)
    setCar(updated)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!id) return
    const updated = await api.deletePhoto(id, photoId)
    setCar(updated)
  }

  const handleSendMessage = async (sender: string, text: string) => {
    if (!id) return
    const msg = await api.sendMessage(id, sender, text)
    setMessages((prev) => [...prev, msg])
  }

  const handleUpdate = async (data: CreateCarInput) => {
    if (!id) return
    const updated = await api.updateCar(id, data)
    setCar(updated)
    setTab('diagnostics')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading...</div>
  }

  if (!car) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Car not found</p>
        <Link to="/"><Button variant="link" className="mt-2">Back to garage</Button></Link>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Wrench }[] = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Wrench },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">
              {car.year} {car.make} {car.model}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {[car.trim, car.engine, car.mileage > 0 ? formatMileage(car.mileage) : null].filter(Boolean).join(' · ')}
            </p>
          </div>
          {car.diagnostics.length > 0 && (
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
              {car.diagnostics.length} active issue{car.diagnostics.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 3D Viewer */}
          <div className="rounded-xl border border-border bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden shadow-card">
            <Car3DViewer
              color={car.color}
              bodyType={car.bodyType}
              highlightedParts={highlightedParts}
              className="h-[320px] sm:h-[420px] lg:h-[500px] w-full"
            />
            <div className="px-4 py-3 bg-card/90 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Drag to rotate · Affected parts glow <span className="text-red-500 font-medium">red</span> when diagnostic codes are active
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden flex flex-col">
            <div className="flex border-b border-border">
              {tabs.map(({ id: tabId, label, icon: Icon }) => (
                <button
                  key={tabId}
                  onClick={() => setTab(tabId)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
                    tab === tabId
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-[600px]">
              {tab === 'diagnostics' && (
                <DiagnosticPanel
                  car={car}
                  onAddDiagnostic={handleAddDiagnostic}
                  onRemoveDiagnostic={handleRemoveDiagnostic}
                  onHighlightChange={setHighlightedParts}
                />
              )}
              {tab === 'photos' && (
                <PhotoUpload car={car} onUpload={handleUpload} onDelete={handleDeletePhoto} />
              )}
              {tab === 'messages' && (
                <MessageThread messages={messages} onSend={handleSendMessage} />
              )}
              {tab === 'settings' && (
                <div>
                  <h3 className="font-semibold mb-4">Edit Car Details</h3>
                  <CarInfoForm initial={car} onSubmit={handleUpdate} submitLabel="Update Car" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
