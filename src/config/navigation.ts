import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Users,
  ListTodo,
  Mail,
  Settings,
  Search,
  type LucideIcon,
} from 'lucide-react'

export type NavItemConfig = {
  label: string
  path: string
  icon: LucideIcon
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { label: 'Calendar', path: '/', icon: Calendar },
  { label: 'Today', path: '/today', icon: CalendarDays },
  { label: 'Upcoming', path: '/upcoming', icon: CalendarRange },
  { label: 'Search', path: '/search', icon: Search },
  { label: 'Shared Calendars', path: '/shared', icon: Users },
  { label: 'Lists', path: '/lists', icon: ListTodo },
  { label: 'Invitations', path: '/invitations', icon: Mail },
]

export const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
]

export const MOBILE_NAV_ITEMS: NavItemConfig[] = [
  { label: 'Calendar', path: '/', icon: Calendar },
  { label: 'Today', path: '/today', icon: CalendarDays },
  { label: 'Upcoming', path: '/upcoming', icon: CalendarRange },
  { label: 'Lists', path: '/lists', icon: ListTodo },
  { label: 'More', path: '/menu', icon: Settings },
]
