import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, ListChecks, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Slide = {
  id: string
  title: string
  description: string
  icon: typeof CalendarDays
  preview: React.ReactNode
}

const SLIDES: Slide[] = [
  {
    id: 'calendar',
    title: 'Your calendar, your way',
    description: 'Month, week, day, and agenda views for personal and shared events.',
    icon: CalendarDays,
    preview: <CalendarPreview />,
  },
  {
    id: 'today',
    title: 'Today & upcoming',
    description: 'See what\'s happening now and what\'s ahead at a glance.',
    icon: Clock,
    preview: <TodayPreview />,
  },
  {
    id: 'shared',
    title: 'Household calendars',
    description: 'Share schedules with family — invite members and manage permissions.',
    icon: Users,
    preview: <SharedPreview />,
  },
  {
    id: 'lists',
    title: 'Shared lists',
    description: 'Groceries, chores, and packing lists tied to your household.',
    icon: ListChecks,
    preview: <ListsPreview />,
  },
]

const AUTO_ADVANCE_MS = 4500

export function AppPreviewSlideshow() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [paused])

  const slide = SLIDES[index]
  const Icon = slide.icon

  const go = (direction: -1 | 1) => {
    setIndex((i) => (i + direction + SLIDES.length) % SLIDES.length)
  }

  return (
    <div
      className="flex h-full flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="relative flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-soft"
        aria-live="polite"
        aria-roledescription="carousel"
        aria-label="App preview slideshow"
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-2">
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex h-full min-h-[280px] flex-col p-4 pt-10 sm:min-h-[320px]">
          <div className="mb-3 flex flex-1 items-center justify-center">{slide.preview}</div>
          <div className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{slide.title}</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">{slide.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-label="Slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}: ${s.title}`}
            onClick={() => setIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function CalendarPreview() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const cells = Array.from({ length: 35 }, (_, i) => i + 1)

  return (
    <div className="w-full max-w-[280px] rounded-lg border border-border bg-background p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-foreground">
        <span>August 2026</span>
        <span className="text-muted-foreground">Month</span>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
        {days.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((n) => (
          <div
            key={n}
            className={cn(
              'flex h-7 flex-col items-center justify-start rounded px-0.5 pt-0.5 text-[10px]',
              n === 11 && 'bg-primary/15 font-semibold text-primary',
            )}
          >
            <span>{n <= 31 ? n : ''}</span>
            {n === 11 && (
              <>
                <span className="mt-0.5 h-1 w-full rounded-sm bg-[#4A7C59]" />
                <span className="mt-0.5 h-1 w-full rounded-sm bg-[#C4785A]" />
              </>
            )}
            {n === 14 && <span className="mt-0.5 h-1 w-full rounded-sm bg-[#C4785A]" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function TodayPreview() {
  const items = [
    { time: '9:00 AM', title: 'Team standup', color: '#4A7C59' },
    { time: '12:00 PM', title: 'Lunch meeting', color: '#4A7C59' },
    { time: '6:30 PM', title: 'Family dinner', color: '#C4785A', shared: true },
  ]

  return (
    <div className="w-full max-w-[280px] space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
      {items.map((item) => (
        <div
          key={item.title}
          className="flex items-start gap-2 rounded-lg border border-border bg-background px-2.5 py-2 shadow-soft"
        >
          <span
            className="mt-1 h-8 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function SharedPreview() {
  const members = [
    { initials: 'AS', color: '#4A7C59' },
    { initials: 'MO', color: '#C4785A' },
    { initials: 'DA', color: '#5B8A72' },
  ]

  return (
    <div className="w-full max-w-[280px] rounded-lg border border-border bg-background p-3 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Family Calendar</span>
      </div>
      <div className="mb-3 flex -space-x-2">
        {members.map((m) => (
          <span
            key={m.initials}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold text-white"
            style={{ backgroundColor: m.color }}
          >
            {m.initials}
          </span>
        ))}
      </div>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <p>3 members · Editor access</p>
        <p className="font-mono text-[10px]">Invite: FAMILY-2026</p>
      </div>
    </div>
  )
}

function ListsPreview() {
  const lists = [
    { name: 'Groceries', done: 2, total: 5 },
    { name: 'Chores', done: 1, total: 4 },
    { name: 'Vacation packing', done: 0, total: 6 },
  ]

  return (
    <div className="w-full max-w-[280px] space-y-2">
      {lists.map((list) => (
        <div
          key={list.name}
          className="rounded-lg border border-border bg-background px-3 py-2.5 shadow-soft"
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{list.name}</span>
            <span className="text-xs text-muted-foreground">
              {list.done}/{list.total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(list.done / list.total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
