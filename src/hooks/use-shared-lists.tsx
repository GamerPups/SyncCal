import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getListById,
  getItemsForList,
  getListProgress,
} from '@/lib/entities'
import { useAuth } from '@/hooks/use-auth'
import { useBackend } from '@/hooks/use-backend'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import type { ListCategory, ListItem, ListItemFormData, SharedList } from '@/types'
import {
  canAddListItems,
  canClearCompleted,
  canDeleteListItem,
  canEditListItem,
  canManageLists,
  canToggleListItem,
  canViewList,
} from '@/lib/list-permissions'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function createEmptyItemForm(): ListItemFormData {
  return {
    title: '',
    assigneeId: '',
    dueDate: '',
    notes: '',
  }
}

type SharedListsContextValue = {
  lists: SharedList[]
  items: ListItem[]
  getAccessibleLists: () => SharedList[]
  getList: (id: string) => SharedList | undefined
  getListItems: (listId: string) => ListItem[]
  getProgress: (listId: string) => { completed: number; total: number }
  canView: (calendarId: string) => boolean
  canManage: (calendarId: string) => boolean
  canAddItems: (calendarId: string) => boolean
  canToggle: (calendarId: string) => boolean
  canDeleteItem: (item: ListItem) => boolean
  canClearDone: (calendarId: string) => boolean
  createList: (name: string, category: ListCategory, calendarId: string) => SharedList | null
  deleteList: (listId: string) => string | null
  addItem: (listId: string, form: ListItemFormData) => string | null
  updateItem: (itemId: string, form: ListItemFormData) => string | null
  toggleItem: (itemId: string) => string | null
  deleteItem: (itemId: string) => string | null
  clearCompleted: (listId: string) => void
  isItemFormOpen: boolean
  editingItem: ListItem | null
  itemFormData: ListItemFormData
  itemFormError: string | null
  openCreateItemForm: () => void
  openEditItemForm: (item: ListItem) => void
  closeItemForm: () => void
  setItemFormField: <K extends keyof ListItemFormData>(key: K, value: ListItemFormData[K]) => void
  submitItemForm: (listId: string) => boolean
}

const SharedListsContext = createContext<SharedListsContextValue | null>(null)

export function SharedListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { state, patch } = useBackend()
  const { sharedCalendars } = useSharedCalendars()
  const [lists, setLists] = useState<SharedList[]>([])
  const [items, setItems] = useState<ListItem[]>([])
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ListItem | null>(null)
  const [itemFormData, setItemFormData] = useState<ListItemFormData>(createEmptyItemForm)
  const [itemFormError, setItemFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!state) return
    setLists(state.lists.map((l) => ({ ...l })))
    setItems(state.listItems.map((i) => ({ ...i })))
  }, [state])

  const updateLists = useCallback(
    (updater: (prev: SharedList[]) => SharedList[]) => {
      setLists((prev) => {
        const next = updater(prev)
        void patch({ lists: next })
        return next
      })
    },
    [patch],
  )

  const updateItems = useCallback(
    (updater: (prev: ListItem[]) => ListItem[]) => {
      updateItems((prev) => {
        const next = updater(prev)
        void patch({ listItems: next })
        return next
      })
    },
    [patch],
  )

  if (!user) return null

  const getAccessibleLists = useCallback(
    () =>
      lists
        .filter((l) => canViewList(user.id, l.sharedCalendarId, sharedCalendars))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [lists, sharedCalendars],
  )

  const getList = useCallback((id: string) => getListById(lists, id), [lists])

  const getListItems = useCallback(
    (listId: string) => getItemsForList(items, listId),
    [items],
  )

  const getProgress = useCallback(
    (listId: string) => getListProgress(items, listId),
    [items],
  )

  const canView = useCallback(
    (calendarId: string) => canViewList(user.id, calendarId, sharedCalendars),
    [sharedCalendars],
  )

  const canManage = useCallback(
    (calendarId: string) => canManageLists(user.id, calendarId, sharedCalendars),
    [sharedCalendars],
  )

  const canAddItems = useCallback(
    (calendarId: string) => canAddListItems(user.id, calendarId, sharedCalendars),
    [sharedCalendars],
  )

  const canToggle = useCallback(
    (calendarId: string) => canToggleListItem(user.id, calendarId, sharedCalendars),
    [sharedCalendars],
  )

  const canDeleteItemFn = useCallback(
    (item: ListItem) => {
      const list = getListById(lists, item.listId)
      if (!list) return false
      return canDeleteListItem(user.id, list.sharedCalendarId, sharedCalendars)
    },
    [lists, sharedCalendars],
  )

  const canClearDone = useCallback(
    (calendarId: string) => canClearCompleted(user.id, calendarId, sharedCalendars),
    [sharedCalendars],
  )

  const createList = useCallback(
    (name: string, category: ListCategory, calendarId: string): SharedList | null => {
      if (!canManageLists(user.id, calendarId, sharedCalendars)) return null
      const trimmed = name.trim()
      if (!trimmed) return null

      const list: SharedList = {
        id: generateId('list'),
        name: trimmed,
        category,
        sharedCalendarId: calendarId,
        createdBy: user.id,
        createdAt: new Date().toISOString().slice(0, 10),
        sortOrder: lists.filter((l) => l.sharedCalendarId === calendarId).length,
      }
      updateLists((prev) => [...prev, list])
      return list
    },
    [lists, sharedCalendars],
  )

  const deleteList = useCallback(
    (listId: string): string | null => {
      const list = getListById(lists, listId)
      if (!list) return 'List not found.'
      if (!canManageLists(user.id, list.sharedCalendarId, sharedCalendars)) {
        return 'You do not have permission to delete this list.'
      }
      updateLists((prev) => prev.filter((l) => l.id !== listId))
      updateItems((prev) => prev.filter((i) => i.listId !== listId))
      return null
    },
    [lists, sharedCalendars],
  )

  const addItem = useCallback(
    (listId: string, form: ListItemFormData): string | null => {
      const list = getListById(lists, listId)
      if (!list) return 'List not found.'
      if (!canAddListItems(user.id, list.sharedCalendarId, sharedCalendars)) {
        return 'You do not have permission to add items.'
      }
      const title = form.title.trim()
      if (!title) return 'Item title is required.'

      const listItems = getItemsForList(items, listId)
      const item: ListItem = {
        id: generateId('item'),
        listId,
        title,
        completed: false,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
        notes: form.notes.trim(),
        createdBy: user.id,
        createdAt: new Date().toISOString().slice(0, 10),
        completedAt: null,
        completedBy: null,
        sortOrder: listItems.length,
      }
      updateItems((prev) => [...prev, item])
      return null
    },
    [lists, items, sharedCalendars],
  )

  const updateItem = useCallback(
    (itemId: string, form: ListItemFormData): string | null => {
      const item = items.find((i) => i.id === itemId)
      if (!item) return 'Item not found.'
      const list = getListById(lists, item.listId)
      if (!list) return 'List not found.'
      if (!canEditListItem(user.id, list.sharedCalendarId, sharedCalendars)) {
        return 'You do not have permission to edit this item.'
      }
      const title = form.title.trim()
      if (!title) return 'Item title is required.'

      updateItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                title,
                assigneeId: form.assigneeId || null,
                dueDate: form.dueDate || null,
                notes: form.notes.trim(),
              }
            : i,
        ),
      )
      return null
    },
    [items, lists, sharedCalendars],
  )

  const toggleItem = useCallback(
    (itemId: string): string | null => {
      const item = items.find((i) => i.id === itemId)
      if (!item) return 'Item not found.'
      const list = getListById(lists, item.listId)
      if (!list) return 'List not found.'
      if (!canToggleListItem(user.id, list.sharedCalendarId, sharedCalendars)) {
        return 'You do not have permission to update this item.'
      }

      const today = new Date().toISOString().slice(0, 10)
      updateItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                completed: !i.completed,
                completedAt: !i.completed ? today : null,
                completedBy: !i.completed ? user.id : null,
              }
            : i,
        ),
      )
      return null
    },
    [items, lists, sharedCalendars],
  )

  const deleteItem = useCallback(
    (itemId: string): string | null => {
      const item = items.find((i) => i.id === itemId)
      if (!item) return 'Item not found.'
      const list = getListById(lists, item.listId)
      if (!list) return 'List not found.'
      if (!canDeleteListItem(user.id, list.sharedCalendarId, sharedCalendars)) {
        return 'You do not have permission to delete this item.'
      }
      updateItems((prev) => prev.filter((i) => i.id !== itemId))
      return null
    },
    [items, lists, sharedCalendars],
  )

  const clearCompleted = useCallback(
    (listId: string) => {
      const list = getListById(lists, listId)
      if (!list) return
      if (!canClearCompleted(user.id, list.sharedCalendarId, sharedCalendars)) return
      updateItems((prev) => prev.filter((i) => i.listId !== listId || !i.completed))
    },
    [lists, sharedCalendars],
  )

  const openCreateItemForm = useCallback(() => {
    setEditingItem(null)
    setItemFormData(createEmptyItemForm())
    setItemFormError(null)
    setIsItemFormOpen(true)
  }, [])

  const openEditItemForm = useCallback((item: ListItem) => {
    setEditingItem(item)
    setItemFormData({
      title: item.title,
      assigneeId: item.assigneeId ?? '',
      dueDate: item.dueDate ?? '',
      notes: item.notes,
    })
    setItemFormError(null)
    setIsItemFormOpen(true)
  }, [])

  const closeItemForm = useCallback(() => {
    setIsItemFormOpen(false)
    setEditingItem(null)
    setItemFormError(null)
  }, [])

  const setItemFormField = useCallback(
    <K extends keyof ListItemFormData>(key: K, value: ListItemFormData[K]) => {
      setItemFormData((prev) => ({ ...prev, [key]: value }))
      setItemFormError(null)
    },
    [],
  )

  const submitItemForm = useCallback(
    (listId: string): boolean => {
      const error = editingItem
        ? updateItem(editingItem.id, itemFormData)
        : addItem(listId, itemFormData)
      if (error) {
        setItemFormError(error)
        return false
      }
      closeItemForm()
      return true
    },
    [editingItem, itemFormData, updateItem, addItem, closeItemForm],
  )

  const value = useMemo(
    () => ({
      lists,
      items,
      getAccessibleLists,
      getList,
      getListItems,
      getProgress,
      canView,
      canManage,
      canAddItems,
      canToggle,
      canDeleteItem: canDeleteItemFn,
      canClearDone,
      createList,
      deleteList,
      addItem,
      updateItem,
      toggleItem,
      deleteItem,
      clearCompleted,
      isItemFormOpen,
      editingItem,
      itemFormData,
      itemFormError,
      openCreateItemForm,
      openEditItemForm,
      closeItemForm,
      setItemFormField,
      submitItemForm,
    }),
    [
      lists,
      items,
      getAccessibleLists,
      getList,
      getListItems,
      getProgress,
      canView,
      canManage,
      canAddItems,
      canToggle,
      canDeleteItemFn,
      canClearDone,
      createList,
      deleteList,
      addItem,
      updateItem,
      toggleItem,
      deleteItem,
      clearCompleted,
      isItemFormOpen,
      editingItem,
      itemFormData,
      itemFormError,
      openCreateItemForm,
      openEditItemForm,
      closeItemForm,
      setItemFormField,
      submitItemForm,
    ],
  )

  return <SharedListsContext.Provider value={value}>{children}</SharedListsContext.Provider>
}

export function useSharedLists() {
  const context = useContext(SharedListsContext)
  if (!context) throw new Error('useSharedLists must be used within SharedListsProvider')
  return context
}
