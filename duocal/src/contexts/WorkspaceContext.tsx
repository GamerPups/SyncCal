"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WorkspaceContextValue {
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaceId: null,
  setWorkspaceId: () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);

  const setWorkspaceId = useCallback((id: string | null) => {
    setWorkspaceIdState(id);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
