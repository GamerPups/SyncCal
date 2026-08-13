import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BODY_TYPES, CAR_MAKES, CAR_COLORS } from '@/lib/diagnostics'
import type { BodyType, CreateCarInput } from '@/types'

interface CarInfoFormProps {
  initial?: Partial<CreateCarInput>
  onSubmit: (data: CreateCarInput) => Promise<void>
  submitLabel?: string
}

export function CarInfoForm({ initial, onSubmit, submitLabel = 'Save Car' }: CarInfoFormProps) {
  const [form, setForm] = useState<CreateCarInput>({
    make: initial?.make ?? '',
    model: initial?.model ?? '',
    year: initial?.year ?? new Date().getFullYear(),
    trim: initial?.trim ?? '',
    color: initial?.color ?? '#2563eb',
    bodyType: initial?.bodyType ?? 'sedan',
    vin: initial?.vin ?? '',
    mileage: initial?.mileage ?? 0,
    engine: initial?.engine ?? '',
    transmission: initial?.transmission ?? 'automatic',
    notes: initial?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof CreateCarInput>(key: K, value: CreateCarInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.make.trim() || !form.model.trim()) return
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            list="makes"
            placeholder="Toyota"
            value={form.make}
            onChange={(e) => update('make', e.target.value)}
            required
          />
          <datalist id="makes">
            {CAR_MAKES.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            placeholder="Camry"
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min={1900}
            max={2030}
            value={form.year}
            onChange={(e) => update('year', parseInt(e.target.value) || new Date().getFullYear())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trim">Trim</Label>
          <Input
            id="trim"
            placeholder="SE, XLE, Sport..."
            value={form.trim}
            onChange={(e) => update('trim', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            type="number"
            min={0}
            placeholder="45000"
            value={form.mileage || ''}
            onChange={(e) => update('mileage', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bodyType">Body Type</Label>
          <select
            id="bodyType"
            value={form.bodyType}
            onChange={(e) => update('bodyType', e.target.value as BodyType)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {BODY_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value}>{bt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <select
            id="transmission"
            value={form.transmission}
            onChange={(e) => update('transmission', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
            <option value="cvt">CVT</option>
            <option value="dual-clutch">Dual-Clutch</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Paint Color</Label>
        <div className="flex flex-wrap gap-2">
          {CAR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => update('color', c.value)}
              className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                form.color === c.value ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="engine">Engine</Label>
          <Input
            id="engine"
            placeholder="2.5L 4-Cylinder"
            value={form.engine}
            onChange={(e) => update('engine', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vin">VIN</Label>
          <Input
            id="vin"
            placeholder="17-character VIN"
            maxLength={17}
            value={form.vin}
            onChange={(e) => update('vin', e.target.value.toUpperCase())}
            className="font-mono uppercase"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional details about your car..."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving || !form.make.trim() || !form.model.trim()} className="w-full">
        {saving ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
