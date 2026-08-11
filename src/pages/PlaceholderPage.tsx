import { CalendarDays } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'

type PlaceholderPageProps = {
  title: string
  description: string
  icon?: React.ElementType
}

export function PlaceholderPage({ title, description, icon: Icon = CalendarDays }: PlaceholderPageProps) {
  return (
    <div className="flex h-full flex-col">
      <MobileHeader title={title} />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
          <Icon className="h-7 w-7 text-accent-foreground" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  )
}
