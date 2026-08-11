import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type InviteCodePrivacyWarningProps = {
  className?: string
  variant?: 'share' | 'join'
}

export function InviteCodePrivacyWarning({ className, variant = 'share' }: InviteCodePrivacyWarningProps) {
  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5',
        className,
      )}
      role="note"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-destructive">
          NEVER SHARE THIS CODE WITH ANYONE YOU DO NOT TRUST!
        </p>
        <p className="text-muted-foreground">
          {variant === 'share'
            ? 'Anyone with this code can join and see shared events on this calendar. Only give it to people you fully trust.'
            : 'Only enter codes from people you know and trust. Joining grants access to their shared calendar events.'}
        </p>
      </div>
    </div>
  )
}
