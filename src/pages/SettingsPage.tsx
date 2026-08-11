import { Monitor, Moon, Sun, Lock, Users, Eye, EyeOff, Download, Smartphone, Check } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/hooks/use-theme'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useAuth } from '@/hooks/use-auth'
import { useOnlineStatus, usePwaInstall } from '@/hooks/use-pwa'
import { COLOR_THEMES } from '@/config/color-themes'
import type { ThemeMode } from '@/types'
import { cn } from '@/lib/utils'
import { REMINDER_OPTIONS } from '@/config/event-options'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="rounded-lg border border-border bg-card p-4 shadow-soft">{children}</div>
    </section>
  )
}

export function SettingsPage() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme()
  const { preferences, setPreference } = useUserPreferences()
  const { user, logout } = useAuth()
  const { canInstall, isInstalled, promptInstall } = usePwaInstall()
  const isOnline = useOnlineStatus()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Settings" />
      <div className="border-b border-border px-6 py-4 hidden lg:block">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <SettingsSection title="Appearance">
            <p className="mb-3 text-sm text-muted-foreground">Choose how SyncCal looks on your device.</p>
            <div className="flex flex-wrap gap-2">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(value)}
                  className={cn('gap-2 rounded-full', theme === value && 'shadow-soft')}
                  aria-pressed={theme === value}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>

            <Separator className="my-4" />

            <p className="mb-3 text-sm font-medium text-foreground">Color style</p>
            <p className="mb-3 text-sm text-muted-foreground">
              Pick an accent color for buttons, highlights, and navigation.
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {COLOR_THEMES.map(({ id, label, swatch }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setColorTheme(id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors',
                    'hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    colorTheme === id ? 'border-primary bg-accent/20 ring-1 ring-primary' : 'border-border',
                  )}
                  aria-pressed={colorTheme === id}
                  aria-label={`${label} color theme`}
                >
                  <span
                    className="h-7 w-7 rounded-full shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: swatch }}
                  />
                  <span className="text-[10px] font-medium leading-tight text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="App">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">Install SyncCal</p>
                  {isInstalled ? (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      Installed on this device
                    </p>
                  ) : canInstall ? (
                    <>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Install for quick access from your home screen or app launcher.
                      </p>
                      <Button size="sm" className="mt-2 gap-2" onClick={() => promptInstall()}>
                        <Download className="h-4 w-4" />
                        Install App
                      </Button>
                    </>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      On iPhone or iPad, tap Share in Safari, then &ldquo;Add to Home Screen&rdquo;.
                      On desktop, use your browser&apos;s install option after running a production build.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
                <p className="font-medium text-foreground">Offline support</p>
                <p className="mt-0.5 text-muted-foreground">
                  {isOnline
                    ? 'You are online. The app is cached for offline use.'
                    : 'You are offline. Cached calendar and list data is still available.'}
                </p>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Account">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user.avatarInitials}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Signed in with Google. Sign out to switch accounts.
                </p>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not signed in.</p>
            )}
          </SettingsSection>

          <Separator />

          <SettingsSection title="Calendar">
            <p className="text-sm text-muted-foreground">
              Default calendar, time format, and timezone preferences coming in a future update.
            </p>
          </SettingsSection>

          <SettingsSection title="Notifications">
            <p className="mb-3 text-sm text-muted-foreground">
              Reminder preferences for new events. Push notifications will be added in a future update.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="default-reminder">Default reminder</Label>
              <Select
                id="default-reminder"
                value={preferences.defaultReminder}
                onChange={(e) => setPreference('defaultReminder', e.target.value)}
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection title="Privacy">
            <p className="mb-4 text-sm text-muted-foreground">
              Control defaults for new personal events and how your availability appears to household members.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Default event visibility</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={preferences.defaultEventVisibility === 'private' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setPreference('defaultEventVisibility', 'private')}
                    aria-pressed={preferences.defaultEventVisibility === 'private'}
                  >
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Personal
                  </Button>
                  <Button
                    type="button"
                    variant={preferences.defaultEventVisibility === 'shared' ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setPreference('defaultEventVisibility', 'shared')}
                    aria-pressed={preferences.defaultEventVisibility === 'shared'}
                  >
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Shared
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Default availability sharing</Label>
                <p className="text-xs text-muted-foreground">
                  When a personal event is private, household members can see a BUSY block (with time) instead of details.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={preferences.defaultShareAvailability ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setPreference('defaultShareAvailability', true)}
                    aria-pressed={preferences.defaultShareAvailability}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Share availability
                  </Button>
                  <Button
                    type="button"
                    variant={!preferences.defaultShareAvailability ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setPreference('defaultShareAvailability', false)}
                    aria-pressed={!preferences.defaultShareAvailability}
                  >
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                    Hide completely
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Household">
            <p className="text-sm text-muted-foreground">
              Manage shared calendars from the Shared Calendars page. New members must join with a private invite code.
            </p>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}
