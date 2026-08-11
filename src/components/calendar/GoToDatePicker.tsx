import { Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCalendar } from '@/hooks/use-calendar'
import { parseDateKey } from '@/lib/utils'

type GoToDatePickerProps = {
  className?: string
}

export function GoToDatePicker({ className }: GoToDatePickerProps) {
  const { selectedDate, setSelectedDate } = useCalendar()

  const dateValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

  const handleChange = (value: string) => {
    if (!value) return
    setSelectedDate(parseDateKey(value))
  }

  return (
    <div className={className}>
      <Label htmlFor="go-to-date" className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
        Go to date
      </Label>
      <Input
        id="go-to-date"
        type="date"
        value={dateValue}
        onChange={(e) => handleChange(e.target.value)}
        className="h-8 text-sm"
        aria-label="Go to date"
      />
    </div>
  )
}
