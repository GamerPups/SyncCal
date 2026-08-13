import { useState } from 'react'
import { KeyRound, Copy, Check, UserPlus, Users, X } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { InviteCodePrivacyWarning } from '@/components/shared/InviteCodePrivacyWarning'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { api } from '@/api'

export function JoinCalendarPage() {
  const {
    personalInviteCode,
    pendingIncoming,
    pendingOutgoing,
    connectedUsers,
    joinByInviteCode,
    acceptConnection,
    declineConnection,
    disconnectConnection,
  } = useSharedCalendars()

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const copyMyCode = async () => {
    if (!personalInviteCode) return
    await navigator.clipboard.writeText(personalInviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setCodeError('Enter an invite code.')
      return
    }

    setChecking(true)
    setCodeError(null)
    setCodeSuccess(null)
    try {
      const result = await api.calendars.findByInviteCode(code.trim().toUpperCase())
      setPreviewName(result.user.name)
      setConfirmed(false)
    } catch {
      setCodeError('No personal calendar found with that code.')
      setPreviewName(null)
    } finally {
      setChecking(false)
    }
  }

  const handleRequest = async () => {
    if (!confirmed) return
    const result = await joinByInviteCode(code)
    if (!result.success) {
      setCodeError(result.error ?? 'Failed to send request.')
      setCodeSuccess(null)
      return
    }
    setCode('')
    setPreviewName(null)
    setConfirmed(false)
    setCodeError(null)
    setCodeSuccess(
      `Request sent to ${result.otherUserName ?? 'them'}. They must accept before your calendars sync.`,
    )
  }

  const handleAccept = async (connectionId: string) => {
    setActionError(null)
    const result = await acceptConnection(connectionId)
    if (!result.success) setActionError(result.error ?? 'Failed to accept.')
  }

  const handleDecline = async (connectionId: string) => {
    setActionError(null)
    const result = await declineConnection(connectionId)
    if (!result.success) setActionError(result.error ?? 'Failed to decline.')
  }

  const handleDisconnect = async (connectionId: string) => {
    setActionError(null)
    const result = await disconnectConnection(connectionId)
    if (!result.success) setActionError(result.error ?? 'Failed to disconnect.')
  }

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Join with invite code" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">Join with invite code</h1>
        <p className="text-sm text-muted-foreground">
          Connect personal calendars — both people must accept before anything syncs
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {personalInviteCode && (
            <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Your personal invite code</h2>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Share this code so someone can request to sync with your personal calendar.
              </p>
              <InviteCodePrivacyWarning variant="share" className="mb-3" />
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm tracking-wider">
                  {personalInviteCode}
                </code>
                <Button variant="outline" size="icon" onClick={copyMyCode} aria-label="Copy invite code">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </section>
          )}

          {pendingIncoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Wants to sync with you
              </h2>
              {pendingIncoming.map((conn) => (
                <div
                  key={conn.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className="text-sm text-white"
                        style={{ backgroundColor: conn.otherUserColor }}
                      >
                        {conn.otherUserInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{conn.otherUserName}</p>
                      <p className="text-xs text-muted-foreground">Requested to sync personal calendars</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(conn.id)} className="gap-1.5">
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(conn.id)} className="gap-1.5">
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Join with invite code</h2>
            </div>

            <InviteCodePrivacyWarning variant="join" className="mb-4" />

            {!previewName ? (
              <form onSubmit={handleLookup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="join-code">Their invite code</Label>
                  <Input
                    id="join-code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      setCodeError(null)
                      setCodeSuccess(null)
                    }}
                    placeholder="ALICE-A3B2"
                    className="font-mono uppercase tracking-wide"
                  />
                </div>
                <Button type="submit" disabled={checking || !code.trim()}>
                  {checking ? 'Checking…' : 'Look Up Code'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Personal calendar found
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{previewName}</p>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span>
                    I trust this person and understand we must both accept before our personal calendars sync.
                  </span>
                </label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setPreviewName(null)}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleRequest} disabled={!confirmed}>
                    Send Request
                  </Button>
                </div>
              </div>
            )}

            {codeError && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p className="mt-3 text-sm text-primary" role="status">
                {codeSuccess}
              </p>
            )}
          </section>

          {(pendingOutgoing.length > 0 || connectedUsers.length > 0) && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your connections
              </h2>
              {pendingOutgoing.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className="text-xs text-white"
                        style={{ backgroundColor: conn.otherUserColor }}
                      >
                        {conn.otherUserInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{conn.otherUserName}</p>
                      <p className="text-xs text-muted-foreground">Waiting for them to accept</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDecline(conn.id)}>
                    Cancel
                  </Button>
                </div>
              ))}
              {connectedUsers.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className="text-xs text-white"
                        style={{ backgroundColor: conn.otherUserColor }}
                      >
                        {conn.otherUserInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{conn.otherUserName}</p>
                      <p className="text-xs text-muted-foreground">
                        <Users className="mr-1 inline h-3 w-3" />
                        Calendars syncing
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDisconnect(conn.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </section>
          )}

          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
