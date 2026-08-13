import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Car } from '@/types'
import { formatDate } from '@/lib/utils'

interface PhotoUploadProps {
  car: Car
  onUpload: (file: File, caption: string) => Promise<void>
  onDelete: (photoId: string) => Promise<void>
}

export function PhotoUpload({ car, onUpload, onDelete }: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          await onUpload(file, caption)
        }
      }
      setCaption('')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="size-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Drop photos here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Damage photos, dashboard codes, receipts — up to 10 MB each</p>
        <div className="mt-4 flex gap-2 max-w-sm mx-auto">
          <Input
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="text-sm"
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Browse'}
          </Button>
        </div>
      </div>

      {car.photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {car.photos.map((photo) => (
            <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-border bg-card">
              <img
                src={photo.url}
                alt={photo.caption || photo.originalName}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(photo.id)}
              >
                <X className="size-3" />
              </Button>
              <div className="p-2">
                {photo.caption && <p className="text-xs font-medium truncate">{photo.caption}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(photo.uploadedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}
    </div>
  )
}
