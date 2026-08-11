import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function UpdateBanner() {
  const [dismissed, setDismissed] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
  })

  if (!needRefresh || dismissed) return null

  return (
    <div
      className="flex items-center justify-between gap-3 border-b border-border bg-primary/10 px-4 py-2.5"
      role="region"
      aria-label="App update available"
    >
      <div className="flex items-center gap-2 text-sm">
        <RefreshCw className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-foreground">A new version of SyncCal is available.</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="sm"
          variant="default"
          onClick={() => updateServiceWorker(true)}
        >
          Reload
        </Button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            setNeedRefresh(false)
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Dismiss update notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
