import { Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type AvailabilityToggleProps = {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

export function AvailabilityToggle({ enabled, onChange, disabled }: AvailabilityToggleProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium">Availability sharing</legend>
      <p className="text-xs text-muted-foreground">
        Control whether household members can see when you&apos;re busy during private events.
      </p>
      <div className="space-y-2">
        <AvailabilityOption
          selected={enabled}
          onClick={() => onChange(true)}
          icon={Eye}
          title="Share availability"
          description="Others see BUSY with your time — not the event title or details"
        />
        <AvailabilityOption
          selected={!enabled}
          onClick={() => onChange(false)}
          icon={EyeOff}
          title="Do not share availability"
          description="This event is completely hidden from household members"
        />
      </div>
    </fieldset>
  )
}

function AvailabilityOption({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected ? 'border-primary bg-accent/50' : 'border-border hover:bg-accent/20',
      )}
      aria-pressed={selected}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
