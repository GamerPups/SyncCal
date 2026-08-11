import { useMemo, useState } from 'react'
import { Plus, ListTodo } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { ListCard } from '@/components/lists/ListCard'
import { CreateListDialog } from '@/components/lists/CreateListDialog'
import { useSharedLists } from '@/hooks/use-shared-lists'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { cn } from '@/lib/utils'

type ListFilter = 'all' | string

export function ListsPage() {
  const { getAccessibleLists, canManage } = useSharedLists()
  const { sharedCalendars } = useSharedCalendars()
  const [createOpen, setCreateOpen] = useState(false)
  const [calendarFilter, setCalendarFilter] = useState<ListFilter>('all')

  const accessibleLists = getAccessibleLists()
  const canCreateAny = sharedCalendars.some((cal) => canManage(cal.id))

  const filteredLists = useMemo(() => {
    if (calendarFilter === 'all') return accessibleLists
    return accessibleLists.filter((l) => l.sharedCalendarId === calendarFilter)
  }, [accessibleLists, calendarFilter])

  const calendarsWithLists = useMemo(() => {
    const ids = new Set(accessibleLists.map((l) => l.sharedCalendarId))
    return sharedCalendars.filter((c) => ids.has(c.id))
  }, [accessibleLists, sharedCalendars])

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Lists" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">Lists</h1>
            <p className="text-sm text-muted-foreground">
              Shared household lists — groceries, chores, packing, and more
            </p>
          </div>
          {canCreateAny && (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New List
            </Button>
          )}
        </div>

        {calendarsWithLists.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <FilterChip
              active={calendarFilter === 'all'}
              onClick={() => setCalendarFilter('all')}
              label="All calendars"
            />
            {calendarsWithLists.map((cal) => (
              <FilterChip
                key={cal.id}
                active={calendarFilter === cal.id}
                onClick={() => setCalendarFilter(cal.id)}
                label={cal.name}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {filteredLists.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <ListTodo className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-foreground">No lists yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {canCreateAny
                  ? 'Create a shared list for your household.'
                  : 'Join a shared calendar to see household lists.'}
              </p>
              {canCreateAny && (
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  Create List
                </Button>
              )}
            </div>
          ) : (
            filteredLists.map((list) => <ListCard key={list.id} list={list} />)
          )}
        </div>
      </div>

      <CreateListDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-accent',
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
