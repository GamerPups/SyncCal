import type { SharedList, ListItem } from '@/types'
import { CURRENT_USER } from '@/data/mock-events'

export const INITIAL_SHARED_LISTS: SharedList[] = [
  {
    id: 'list-groceries',
    name: 'Groceries',
    category: 'groceries',
    sharedCalendarId: 'cal-family',
    createdBy: CURRENT_USER.id,
    createdAt: '2026-08-01',
    sortOrder: 0,
  },
  {
    id: 'list-chores',
    name: 'Chores',
    category: 'chores',
    sharedCalendarId: 'cal-family',
    createdBy: 'user-mom',
    createdAt: '2026-08-01',
    sortOrder: 1,
  },
  {
    id: 'list-packing',
    name: 'Packing',
    category: 'packing',
    sharedCalendarId: 'cal-family',
    createdBy: CURRENT_USER.id,
    createdAt: '2026-08-05',
    sortOrder: 2,
  },
]

export const INITIAL_LIST_ITEMS: ListItem[] = [
  // Groceries
  {
    id: 'item-1',
    listId: 'list-groceries',
    title: 'Milk',
    completed: false,
    assigneeId: 'user-ashton',
    dueDate: '2026-08-12',
    notes: '2% or whole',
    createdBy: 'user-mom',
    createdAt: '2026-08-10',
    completedAt: null,
    completedBy: null,
    sortOrder: 0,
  },
  {
    id: 'item-2',
    listId: 'list-groceries',
    title: 'Eggs',
    completed: true,
    assigneeId: null,
    dueDate: null,
    notes: '',
    createdBy: 'user-mom',
    createdAt: '2026-08-10',
    completedAt: '2026-08-11',
    completedBy: 'user-ashton',
    sortOrder: 1,
  },
  {
    id: 'item-3',
    listId: 'list-groceries',
    title: 'Bread',
    completed: false,
    assigneeId: 'user-dad',
    dueDate: '2026-08-12',
    notes: '',
    createdBy: CURRENT_USER.id,
    createdAt: '2026-08-11',
    completedAt: null,
    completedBy: null,
    sortOrder: 2,
  },
  {
    id: 'item-4',
    listId: 'list-groceries',
    title: 'Bananas',
    completed: false,
    assigneeId: null,
    dueDate: null,
    notes: '',
    createdBy: 'user-mom',
    createdAt: '2026-08-11',
    completedAt: null,
    completedBy: null,
    sortOrder: 3,
  },
  // Chores
  {
    id: 'item-5',
    listId: 'list-chores',
    title: 'Vacuum living room',
    completed: false,
    assigneeId: 'user-ashton',
    dueDate: '2026-08-11',
    notes: '',
    createdBy: 'user-mom',
    createdAt: '2026-08-09',
    completedAt: null,
    completedBy: null,
    sortOrder: 0,
  },
  {
    id: 'item-6',
    listId: 'list-chores',
    title: 'Load dishwasher',
    completed: true,
    assigneeId: 'user-dad',
    dueDate: '2026-08-11',
    notes: '',
    createdBy: 'user-mom',
    createdAt: '2026-08-09',
    completedAt: '2026-08-11',
    completedBy: 'user-dad',
    sortOrder: 1,
  },
  {
    id: 'item-7',
    listId: 'list-chores',
    title: 'Laundry — towels',
    completed: false,
    assigneeId: 'user-mom',
    dueDate: '2026-08-12',
    notes: 'Wash, dry, fold',
    createdBy: 'user-mom',
    createdAt: '2026-08-10',
    completedAt: null,
    completedBy: null,
    sortOrder: 2,
  },
  // Packing
  {
    id: 'item-8',
    listId: 'list-packing',
    title: 'Sunscreen',
    completed: false,
    assigneeId: 'user-ashton',
    dueDate: '2026-08-14',
    notes: 'SPF 50',
    createdBy: CURRENT_USER.id,
    createdAt: '2026-08-05',
    completedAt: null,
    completedBy: null,
    sortOrder: 0,
  },
  {
    id: 'item-9',
    listId: 'list-packing',
    title: 'Passports',
    completed: false,
    assigneeId: 'user-dad',
    dueDate: '2026-08-13',
    notes: 'Check expiration dates',
    createdBy: CURRENT_USER.id,
    createdAt: '2026-08-05',
    completedAt: null,
    completedBy: null,
    sortOrder: 1,
  },
  {
    id: 'item-10',
    listId: 'list-packing',
    title: 'Phone chargers',
    completed: true,
    assigneeId: null,
    dueDate: null,
    notes: '',
    createdBy: 'user-mom',
    createdAt: '2026-08-06',
    completedAt: '2026-08-10',
    completedBy: 'user-mom',
    sortOrder: 2,
  },
]

export function getListById(lists: SharedList[], id: string): SharedList | undefined {
  return lists.find((l) => l.id === id)
}

export function getItemsForList(items: ListItem[], listId: string): ListItem[] {
  return items
    .filter((i) => i.listId === listId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getListProgress(items: ListItem[], listId: string): { completed: number; total: number } {
  const listItems = items.filter((i) => i.listId === listId)
  return {
    completed: listItems.filter((i) => i.completed).length,
    total: listItems.length,
  }
}
