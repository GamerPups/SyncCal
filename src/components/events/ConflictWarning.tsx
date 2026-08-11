import { AlertTriangle } from 'lucide-react'
import type { EventConflict } from '@/lib/conflicts'
import { cn } from '@/lib/utils'

type ConflictWarningProps = {
  conflicts: EventConflict[]
  className?: string
}

export function ConflictWarning({ conflicts, className }: ConflictWarningProps) {
  if (conflicts.length === 0) return null

  const visibleConflicts = conflicts.filter((c) => c.label !== 'Busy')
  const busyCount = conflicts.length - visibleConflicts.length

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-medium text-foreground">
          You already have something scheduled during this time.
        </p>
        {visibleConflicts.length > 0 && (
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {visibleConflicts.map((c) => (
              <li key={c.eventId}>{c.label}</li>
            ))}
          </ul>
        )}
        {busyCount > 0 && (
          <p className="mt-1 text-muted-foreground">
            {busyCount === 1
              ? '1 other time block overlaps (details hidden for privacy).'
              : `${busyCount} other time blocks overlap (details hidden for privacy).`}
          </p>
        )}
      </div>
    </div>
  )
}
