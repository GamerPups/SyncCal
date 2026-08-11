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
import { useSharedLists } from '@/hooks/use-shared-lists'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { getMembersForCalendar } from '@/data/mock-calendars'

type ListItemFormDialogProps = {
  listId: string
  calendarId: string
}

export function ListItemFormDialog({ listId, calendarId }: ListItemFormDialogProps) {
  const {
    isItemFormOpen,
    editingItem,
    itemFormData,
    itemFormError,
    closeItemForm,
    setItemFormField,
    submitItemForm,
  } = useSharedLists()
  const { sharedCalendars } = useSharedCalendars()
  const members = getMembersForCalendar(sharedCalendars, calendarId)
  const isEditing = editingItem !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitItemForm(listId)
  }

  return (
    <Dialog open={isItemFormOpen} onOpenChange={(open) => !open && closeItemForm()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-title">Title</Label>
            <Input
              id="item-title"
              value={itemFormData.title}
              onChange={(e) => setItemFormField('title', e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-assignee">Assign to</Label>
            <Select
              id="item-assignee"
              value={itemFormData.assigneeId}
              onChange={(e) => setItemFormField('assigneeId', e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-due">Due date (optional)</Label>
            <Input
              id="item-due"
              type="date"
              value={itemFormData.dueDate}
              onChange={(e) => setItemFormField('dueDate', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-notes">Notes (optional)</Label>
            <Textarea
              id="item-notes"
              value={itemFormData.notes}
              onChange={(e) => setItemFormField('notes', e.target.value)}
              placeholder="Extra details"
              rows={2}
            />
          </div>

          {itemFormError && (
            <p className="text-sm text-destructive" role="alert">
              {itemFormError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeItemForm}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Item'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
