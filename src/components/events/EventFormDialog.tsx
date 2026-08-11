import { Lock, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useEvents } from '@/hooks/use-events'
import {
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
  TIME_OPTIONS,
} from '@/config/event-options'
import { cn } from '@/lib/utils'
import type { EventVisibility, PersonalCalendar } from '@/types'
import { ConflictWarning } from '@/components/events/ConflictWarning'
import { PastTimeWarning } from '@/components/events/PastTimeWarning'
import { AvailabilityToggle } from '@/components/events/AvailabilityToggle'
import { RecurrenceEditDialog } from '@/components/events/RecurrenceEditDialog'
import { getPastTimeWarnings } from '@/lib/event-time-validation'
import { useMemo } from 'react'

export function EventFormDialog() {
  const {
    isFormOpen,
    editingEvent,
    formData,
    formError,
    formConflicts,
    isRecurrenceDialogOpen,
    recurrenceDialogMode,
    sharedCalendars,
    personalCalendar,
    closeForm,
    setFormField,
    submitForm,
    removeEditingEvent,
    confirmRecurrenceScope,
    closeRecurrenceDialog,
    canDelete,
  } = useEvents()

  const isEditing = editingEvent !== null

  const pastTimeWarnings = useMemo(() => {
    if (isEditing || formData.allDay) {
      return { start: false, end: false }
    }
    return getPastTimeWarnings(formData.date, formData.startTime, formData.endTime)
  }, [isEditing, formData.allDay, formData.date, formData.startTime, formData.endTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitForm()
  }

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={formData.title}
                onChange={(e) => setFormField('title', e.target.value)}
                placeholder="Event title"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormField('date', e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="event-allday"
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormField('allDay', e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <Label htmlFor="event-allday" className="cursor-pointer font-normal">
                All-day event
              </Label>
            </div>

            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="event-start">Start time</Label>
                  <Select
                    id="event-start"
                    value={formData.startTime}
                    onChange={(e) => setFormField('startTime', e.target.value)}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTimeOption(time)}
                      </option>
                    ))}
                  </Select>
                  {!isEditing && pastTimeWarnings.start && (
                    <PastTimeWarning message="This start time has already passed." />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="event-end">End time</Label>
                  <Select
                    id="event-end"
                    value={formData.endTime}
                    onChange={(e) => setFormField('endTime', e.target.value)}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTimeOption(time)}
                      </option>
                    ))}
                  </Select>
                  {!isEditing && pastTimeWarnings.end && (
                    <PastTimeWarning message="This end time has already passed." />
                  )}
                </div>
              </div>
            )}

            {!formData.allDay && formConflicts.length > 0 && (
              <ConflictWarning conflicts={formConflicts} />
            )}

            <div className="space-y-1.5">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={formData.location}
                onChange={(e) => setFormField('location', e.target.value)}
                placeholder="Add location"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={formData.description}
                onChange={(e) => setFormField('description', e.target.value)}
                placeholder="Add description"
                rows={3}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Who can see this?</legend>
              <div className="space-y-2">
                <VisibilityOption
                  value="private"
                  selected={formData.visibility}
                  onChange={(v) => setFormField('visibility', v)}
                  title="Only me"
                  description="This event stays on your personal calendar"
                  icon={Lock}
                />
                <VisibilityOption
                  value="shared"
                  selected={formData.visibility}
                  onChange={(v) => setFormField('visibility', v)}
                  title="Shared calendar"
                  description="Visible to household members on a shared calendar"
                  icon={Users}
                />
              </div>
            </fieldset>

            {formData.visibility === 'shared' && (
              <div className="space-y-1.5">
                <Label htmlFor="event-calendar">Shared calendar</Label>
                <Select
                  id="event-calendar"
                  value={formData.sharedCalendarId}
                  onChange={(e) => setFormField('sharedCalendarId', e.target.value)}
                >
                  {sharedCalendars.map((cal) => (
                    <option key={cal.id} value={cal.id}>
                      {cal.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {formData.visibility === 'private' && (
              <AvailabilityToggle
                enabled={formData.shareAvailability}
                onChange={(enabled) => setFormField('shareAvailability', enabled)}
              />
            )}

            <CalendarAssignmentPreview
              visibility={formData.visibility}
              personalCalendar={personalCalendar}
              sharedCalendarName={
                sharedCalendars.find((c) => c.id === formData.sharedCalendarId)?.name ?? 'Family'
              }
              shareAvailability={formData.shareAvailability}
            />

            <div className="space-y-1.5">
              <Label htmlFor="event-reminder">Reminder</Label>
              <Select
                id="event-reminder"
                value={formData.reminder}
                onChange={(e) => setFormField('reminder', e.target.value as typeof formData.reminder)}
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                Reminders are saved with the event. Push notifications will be added in a future update.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-recurrence">Recurrence</Label>
              <Select
                id="event-recurrence"
                value={formData.recurrence}
                onChange={(e) => setFormField('recurrence', e.target.value as typeof formData.recurrence)}
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
              {isEditing && editingEvent && canDelete(editingEvent) ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={removeEditingEvent}
                  className="sm:mr-auto"
                >
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <RecurrenceEditDialog
        open={isRecurrenceDialogOpen}
        onOpenChange={(open) => !open && closeRecurrenceDialog()}
        onConfirm={confirmRecurrenceScope}
        eventTitle={editingEvent?.title ?? formData.title}
        mode={recurrenceDialogMode}
      />
    </>
  )
}

function CalendarAssignmentPreview({
  visibility,
  personalCalendar,
  sharedCalendarName,
  shareAvailability,
}: {
  visibility: EventVisibility
  personalCalendar: PersonalCalendar
  sharedCalendarName: string
  shareAvailability: boolean
}) {
  const isPersonal = visibility === 'private'

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2.5',
        isPersonal ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30',
      )}
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: isPersonal ? personalCalendar.color : '#C4785A' }}
        aria-hidden="true"
      />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-foreground">
          {isPersonal ? personalCalendar.name : sharedCalendarName}
        </p>
        <p className="text-xs text-muted-foreground">
          {isPersonal
            ? shareAvailability
              ? 'Only you see details — household sees BUSY during this time'
              : 'Only you can see this event'
            : `Visible to all ${sharedCalendarName} members`}
        </p>
      </div>
    </div>
  )
}

function VisibilityOption({
  value,
  selected,
  onChange,
  title,
  description,
  icon: Icon,
}: {
  value: EventVisibility
  selected: EventVisibility
  onChange: (value: EventVisibility) => void
  title: string
  description: string
  icon: React.ElementType
}) {
  const isSelected = selected === value

  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
        isSelected
          ? 'border-primary bg-accent/50'
          : 'border-border hover:bg-accent/20',
      )}
    >
      <input
        type="radio"
        name="visibility"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="mt-0.5 h-4 w-4 border-input text-primary focus:ring-ring"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </label>
  )
}

function formatTimeOption(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}
