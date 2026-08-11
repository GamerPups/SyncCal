import { cn } from '@/lib/utils'
import { getRoleLabel } from '@/lib/permissions'
import type { MemberRole } from '@/types'

const ROLE_STYLES: Record<MemberRole, string> = {
  owner: 'bg-primary/15 text-primary border-primary/20',
  editor: 'bg-accent text-accent-foreground border-border',
  viewer: 'bg-muted text-muted-foreground border-border',
}

type MemberRoleBadgeProps = {
  role: MemberRole
  className?: string
}

export function MemberRoleBadge({ role, className }: MemberRoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        ROLE_STYLES[role],
        className,
      )}
    >
      {getRoleLabel(role)}
    </span>
  )
}
