import { useState } from 'react'

type Workspace = {
  id: string
  name: string
  joinCode: string
}

type WorkspaceEvent = {
  id: string
  workspaceId: string
  title: string
  date: string
}

function generateId(): string {
  return crypto.randomUUID()
}

function generateJoinCode(name: string): string {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'WS'
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${slug}-${suffix}`
}

export function LocalWorkspaceIsolation() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [events, setEvents] = useState<WorkspaceEvent[]>([])

  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId)
  const activeEvents = events.filter((event) => event.workspaceId === activeWorkspaceId)

  function handleCreateWorkspace() {
    const trimmedName = newWorkspaceName.trim()
    if (!trimmedName) return

    const workspace: Workspace = {
      id: generateId(),
      name: trimmedName,
      joinCode: generateJoinCode(trimmedName),
    }

    setWorkspaces((current) => [...current, workspace])
    setActiveWorkspaceId(workspace.id)
    setNewWorkspaceName('')
  }

  function handleAddEvent() {
    if (!activeWorkspaceId) return

    const trimmedTitle = eventTitle.trim()
    if (!trimmedTitle || !eventDate) return

    const event: WorkspaceEvent = {
      id: generateId(),
      workspaceId: activeWorkspaceId,
      title: trimmedTitle,
      date: eventDate,
    }

    setEvents((current) => [...current, event])
    setEventTitle('')
    setEventDate('')
  }

  return (
    <div>
      <h1>CalendarHero — Local Workspace Isolation</h1>

      <section>
        <h2>Create workspace</h2>
        <div>
          <label htmlFor="workspace-name">Workspace name</label>
          <input
            id="workspace-name"
            type="text"
            value={newWorkspaceName}
            onChange={(event) => setNewWorkspaceName(event.target.value)}
            placeholder="e.g. Home, Work"
          />
          <button type="button" onClick={handleCreateWorkspace}>
            Create workspace
          </button>
        </div>
      </section>

      <section>
        <h2>Switch workspace</h2>
        {workspaces.length === 0 ? (
          <p>No workspaces yet.</p>
        ) : (
          <ul>
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceId(workspace.id)}
                  disabled={workspace.id === activeWorkspaceId}
                >
                  {workspace.name} ({workspace.joinCode})
                  {workspace.id === activeWorkspaceId ? ' — active' : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Add event to active workspace</h2>
        {!activeWorkspace ? (
          <p>Select or create a workspace first.</p>
        ) : (
          <>
            <p>
              Active workspace: <strong>{activeWorkspace.name}</strong> (
              {activeWorkspace.joinCode})
            </p>
            <div>
              <label htmlFor="event-title">Event title</label>
              <input
                id="event-title"
                type="text"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
                placeholder="Event title"
              />
              <label htmlFor="event-date">Date</label>
              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
              <button type="button" onClick={handleAddEvent}>
                Add event
              </button>
            </div>
          </>
        )}
      </section>

      <section>
        <h2>Events in active workspace</h2>
        {!activeWorkspace ? (
          <p>No active workspace.</p>
        ) : activeEvents.length === 0 ? (
          <p>No events in {activeWorkspace.name}.</p>
        ) : (
          <ul>
            {activeEvents.map((event) => (
              <li key={event.id}>
                {event.title} — {event.date}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
