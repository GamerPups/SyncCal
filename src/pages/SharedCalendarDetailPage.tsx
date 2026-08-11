import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, LogOut, Trash2, KeyRound } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { InviteCodePrivacyWarning } from '@/components/shared/InviteCodePrivacyWarning'
import { MemberRoleBadge } from '@/components/shared/MemberRoleBadge'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { useAuth } from '@/hooks/use-auth'
import { getRoleDescription } from '@/lib/permissions'
import type { MemberRole } from '@/types'

export function SharedCalendarDetailPage() {
  const { calendarId } = useParams<{ calendarId: string }>()
  const {
    getCalendar,
    getUserRole,
    canManageMembers,
    removeMember,
    updateMemberRole,
    leaveCalendar,
  } = useSharedCalendars()
  const { user } = useAuth()

  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const calendar = calendarId ? getCalendar(calendarId) : undefined
  const userRole = calendarId ? getUserRole(calendarId) : null
  const isOwner = calendarId ? canManageMembers(calendarId) : false

  if (!calendarId || !calendar) {
    return <Navigate to="/shared" replace />
  }

  const copyInviteCode = async () => {
    await navigator.clipboard.writeText(calendar.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemove = (memberId: string) => {
    const error = removeMember(calendar.id, memberId)
    setActionError(error)
  }

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    const error = updateMemberRole(calendar.id, memberId, role)
    setActionError(error)
  }

  const handleLeave = () => {
    const error = leaveCalendar(calendar.id)
    if (error) {
      setActionError(error)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title={calendar.name} />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/shared"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Shared Calendars
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{calendar.name}</h1>
              {userRole && <MemberRoleBadge role={userRole} />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {calendar.members.length} member{calendar.members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {userRole && userRole !== 'owner' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {isOwner && (
            <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Private invite code</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code only with people you trust. They must enter it manually to join — there are no direct invitations.
              </p>
              <InviteCodePrivacyWarning variant="share" className="mt-3" />
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm tracking-wider">
                  {calendar.inviteCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyInviteCode}
                  aria-label="Copy invite code"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </section>
          )}

          {!isOwner && (
            <section className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Only the calendar owner can view and share the invite code. Ask them for the code if someone else needs to join.
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Members
            </h2>
            <div className="space-y-2">
              {calendar.members.map((member) => {
                const isCurrentUser = user ? member.id === user.id : false
                const isMemberOwner = member.role === 'owner'

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-soft"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className="text-sm text-white"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {member.name}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getRoleDescription(member.role)}
                      </p>
                    </div>

                    {isOwner && !isMemberOwner ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value as MemberRole)
                          }
                          className="h-8 w-28 text-xs"
                          aria-label={`Change role for ${member.name}`}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(member.id)}
                          aria-label={`Remove ${member.name}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <MemberRoleBadge role={member.role} />
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-muted/30 p-4">
            <h2 className="text-sm font-semibold text-foreground">Permission levels</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {(['owner', 'editor', 'viewer'] as MemberRole[]).map((role) => (
                <div key={role} className="flex gap-3">
                  <MemberRoleBadge role={role} className="shrink-0" />
                  <dd className="text-muted-foreground">{getRoleDescription(role)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}

          {userRole === 'owner' && (
            <p className="text-xs text-muted-foreground">
              As owner, you can change member permissions and remove members. Share the invite code only with people you trust.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
