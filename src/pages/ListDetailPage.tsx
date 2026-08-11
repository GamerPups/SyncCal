import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { ListItemRow } from '@/components/lists/ListItemRow'
import { ListItemFormDialog } from '@/components/lists/ListItemFormDialog'
import { useSharedLists } from '@/hooks/use-shared-lists'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { getListCategoryConfig } from '@/config/list-options'
import { cn } from '@/lib/utils'

type ItemFilter = 'active' | 'completed' | 'all'

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const {
    getList,
    getListItems,
    getProgress,
    canView,
    canAddItems,
    canManage,
    canClearDone,
    deleteList,
    clearCompleted,
    openCreateItemForm,
    openEditItemForm,
  } = useSharedLists()
  const { getCalendar } = useSharedCalendars()
  const [filter, setFilter] = useState<ItemFilter>('active')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const list = listId ? getList(listId) : undefined
  const allItems = list ? getListItems(list.id) : []

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'active':
        return allItems.filter((i) => !i.completed)
      case 'completed':
        return allItems.filter((i) => i.completed)
      default:
        return allItems
    }
  }, [allItems, filter])

  if (!list) {
    return <Navigate to="/lists" replace />
  }

  if (!canView(list.sharedCalendarId)) {
    return <Navigate to="/lists" replace />
  }

  const calendar = getCalendar(list.sharedCalendarId)
  const config = getListCategoryConfig(list.category)
  const Icon = config.icon
  const { completed, total } = getProgress(list.id)
  const canAdd = canAddItems(list.sharedCalendarId)
  const canDeleteList = canManage(list.sharedCalendarId)
  const canClear = canClearDone(list.sharedCalendarId)

  const handleDeleteList = () => {
    const error = deleteList(list.id)
    if (error) {
      setDeleteError(error)
    } else {
      navigate('/lists')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title={list.name} />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/lists"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All lists
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
              <p className="text-sm text-muted-foreground">
                {calendar?.name ?? 'Shared calendar'}
                {total > 0 && ` · ${completed} of ${total} done`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canAdd && (
              <Button size="sm" onClick={openCreateItemForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            )}
            {canDeleteList && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleDeleteList}
              >
                <Trash2 className="h-4 w-4" />
                Delete List
              </Button>
            )}
          </div>
        </div>

        {deleteError && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {deleteError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterTab active={filter === 'active'} onClick={() => setFilter('active')} label="Active" count={total - completed} />
          <FilterTab active={filter === 'completed'} onClick={() => setFilter('completed')} label="Completed" count={completed} />
          <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label="All" count={total} />
          {canClear && completed > 0 && filter !== 'active' && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
              onClick={() => clearCompleted(list.id)}
            >
              Clear completed
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-2">
          {filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {filter === 'active' && total > 0
                  ? 'All done — nice work!'
                  : filter === 'completed'
                    ? 'No completed items yet.'
                    : canAdd
                      ? 'Add your first item to get started.'
                      : 'No items in this list yet.'}
              </p>
              {canAdd && filter !== 'completed' && (
                <Button className="mt-3" size="sm" onClick={openCreateItemForm}>
                  Add Item
                </Button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <ListItemRow
                key={item.id}
                item={item}
                calendarId={list.sharedCalendarId}
                onEdit={openEditItemForm}
              />
            ))
          )}
        </div>
      </div>

      <ListItemFormDialog listId={list.id} calendarId={list.sharedCalendarId} />
    </div>
  )
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-accent',
      )}
      aria-pressed={active}
    >
      {label}
      {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
    </button>
  )
}
