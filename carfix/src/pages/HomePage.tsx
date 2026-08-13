import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Car, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CarInfoForm } from '@/components/CarInfoForm'
import { api } from '@/lib/api'
import { formatMileage } from '@/lib/utils'
import type { Car as CarType, CreateCarInput } from '@/types'

export function HomePage() {
  const [cars, setCars] = useState<CarType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadCars = async () => {
    try {
      setCars(await api.getCars())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCars() }, [])

  const handleCreate = async (data: CreateCarInput) => {
    await api.createCar(data)
    setShowForm(false)
    await loadCars()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this car and all its data?')) return
    await api.deleteCar(id)
    await loadCars()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Garage</h1>
          <p className="text-muted-foreground mt-1">Manage your vehicles, diagnose issues, and track repairs</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            Add Car
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 mb-8 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Add New Car</h2>
          <CarInfoForm onSubmit={handleCreate} submitLabel="Add to Garage" />
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading...</p>
      ) : cars.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <Car className="size-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">No cars yet</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Add your first car to see a 3D model and start diagnosing issues
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            Add Your First Car
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cars.map((car) => (
            <div
              key={car.id}
              className="group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:shadow-md transition-shadow"
            >
              <div className="h-3" style={{ backgroundColor: car.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {car.year} {car.make} {car.model}
                    </h3>
                    {car.trim && <p className="text-sm text-muted-foreground">{car.trim}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => handleDelete(car.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                  {car.mileage > 0 && <span>{formatMileage(car.mileage)}</span>}
                  <span className="capitalize">{car.bodyType}</span>
                  {car.diagnostics.length > 0 && (
                    <span className="text-destructive font-medium">
                      {car.diagnostics.length} issue{car.diagnostics.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <Link to={`/car/${car.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
