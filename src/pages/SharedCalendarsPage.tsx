import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, KeyRound, ChevronRight } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CreateCalendarDialog } from '@/components/shared/CreateCalendarDialog'
import { JoinCalendarDialog } from '@/components/shared/JoinCalendarDialog'
import { MemberRoleBadge } from '@/components/shared/MemberRoleBadge'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { cn } from '@/lib/utils'

export function SharedCalendarsPage() {
  const { sharedCalendars, getUserRole } = useSharedCalendars()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Shared Calendars" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">
              Shared Calendars
            </h1>
            <p className="text-sm text-muted-foreground">
              Household calendars shared with family and friends
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setJoinOpen(true)} className="gap-2">
              <KeyRound className="h-4 w-4" />
              Join with Code
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Calendar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {sharedCalendars.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-foreground">No shared calendars yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create one for your household or join with an invite code.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setJoinOpen(true)}>
                  Join with Code
                </Button>
                <Button onClick={() => setCreateOpen(true)}>Create Calendar</Button>
              </div>
            </div>
          ) : (
            sharedCalendars.map((calendar) => {
              const userRole = getUserRole(calendar.id)

              return (
                <Link
                  key={calendar.id}
                  to={`/shared/${calendar.id}`}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-soft transition-colors',
                    'hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">{calendar.name}</h2>
                      {userRole && <MemberRoleBadge role={userRole} />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {calendar.members.length} member{calendar.members.length !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-2 flex -space-x-2">
                      {calendar.members.slice(0, 5).map((member) => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback
                            className="text-[10px] text-white"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {calendar.members.length > 5 && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium">
                          +{calendar.members.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              )
            })
          )}
        </div>
      </div>

      <CreateCalendarDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinCalendarDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  )
}
