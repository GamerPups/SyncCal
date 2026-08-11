import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-pwa'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-sm text-amber-900 dark:text-amber-100"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You&apos;re offline — cached data is still available.</span>
    </div>
  )
}
