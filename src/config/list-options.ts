import type { ListCategory } from '@/types'
import { ShoppingCart, Sparkles, Luggage, ListTodo, type LucideIcon } from 'lucide-react'

export type ListCategoryConfig = {
  value: ListCategory
  label: string
  icon: LucideIcon
  description: string
}

export const LIST_CATEGORY_OPTIONS: ListCategoryConfig[] = [
  {
    value: 'groceries',
    label: 'Groceries',
    icon: ShoppingCart,
    description: 'Shopping and pantry items',
  },
  {
    value: 'chores',
    label: 'Chores',
    icon: Sparkles,
    description: 'Household tasks and to-dos',
  },
  {
    value: 'packing',
    label: 'Packing',
    icon: Luggage,
    description: 'Trip and travel checklists',
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: ListTodo,
    description: 'Any other shared list',
  },
]

export function getListCategoryConfig(category: ListCategory): ListCategoryConfig {
  return LIST_CATEGORY_OPTIONS.find((c) => c.value === category) ?? LIST_CATEGORY_OPTIONS[3]!
}
