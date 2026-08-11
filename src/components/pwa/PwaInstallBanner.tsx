import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePwaInstall } from '@/hooks/use-pwa'

export function PwaInstallBanner() {
  const { showInstallBanner, promptInstall, dismissInstallBanner } = usePwaInstall()

  if (!showInstallBanner) return null

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-50 px-4 pb-2 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm lg:px-0"
      role="region"
      aria-label="Install SyncCal"
    >
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Install SyncCal</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add to your home screen for quick access and offline use.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => promptInstall()}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissInstallBanner}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissInstallBanner}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
