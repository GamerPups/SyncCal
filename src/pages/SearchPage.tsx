import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { EventListItem } from '@/components/events/EventListItem'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useEvents } from '@/hooks/use-events'
import { getAllMembersFromCalendars } from '@/data/mock-calendars'
import {
  DEFAULT_SEARCH_FILTERS,
  searchEvents,
  type SearchFilters,
} from '@/lib/event-search'
import { cn } from '@/lib/utils'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { getVisibleEvents, sharedCalendars } = useEvents()

  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...DEFAULT_SEARCH_FILTERS,
    query: searchParams.get('q') ?? '',
  }))

  const allMembers = getAllMembersFromCalendars(sharedCalendars)
  const visibleEvents = getVisibleEvents()

  const results = useMemo(
    () => searchEvents(visibleEvents, filters, sharedCalendars),
    [visibleEvents, filters, sharedCalendars],
  )

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (key === 'query') {
      const q = value as string
      if (q) setSearchParams({ q })
      else setSearchParams({})
    }
  }

  const hasQuery = filters.query.trim().length > 0 || filters.dateFrom || filters.dateTo

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Search" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find events by title, description, or location
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Search input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              placeholder="Search events..."
              className="pl-9"
              autoFocus
              aria-label="Search events"
            />
          </div>

          {/* Filters */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filters
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Calendar type</Label>
                <div className="flex flex-wrap gap-2">
                  <FilterToggle
                    active={filters.personal}
                    onClick={() => updateFilter('personal', !filters.personal)}
                    label="Personal"
                  />
                  <FilterToggle
                    active={filters.shared}
                    onClick={() => updateFilter('shared', !filters.shared)}
                    label="Shared"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="search-person" className="text-xs">
                  Person
                </Label>
                <Select
                  id="search-person"
                  value={filters.memberId}
                  onChange={(e) => updateFilter('memberId', e.target.value)}
                >
                  <option value="all">All members</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="search-from" className="text-xs">
                  From date
                </Label>
                <Input
                  id="search-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="search-to" className="text-xs">
                  To date
                </Label>
                <Input
                  id="search-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {!hasQuery ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-foreground">Search your calendar</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a keyword to find events by title, description, or location.
                Use filters to narrow by calendar type, person, or date.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="font-medium text-foreground">No events found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or adjust your filters.
              </p>
            </div>
          ) : (
            <section>
              <p className="mb-3 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {results.map((event) => (
                  <EventListItem key={event.id} event={event} showDate />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterToggle({
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
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary/30 bg-accent text-accent-foreground'
          : 'border-border bg-muted/50 text-muted-foreground opacity-60',
      )}
    >
      {label}
    </button>
  )
}
