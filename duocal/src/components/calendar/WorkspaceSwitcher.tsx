"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, User } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { WorkspaceDTO } from "@/types";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const { data: session } = useSession();
  const { workspaceId, setWorkspaceId } = useWorkspace();
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/calendars")
      .then((r) => r.json())
      .then(setWorkspaces)
      .catch(() => {});
  }, []);

  const active = workspaceId
    ? workspaces.find((w) => w.id === workspaceId)
    : null;

  const getMyColor = (ws: (typeof workspaces)[0]) =>
    ws.members?.find((m) => m.userId === session?.user?.id)?.color ?? "#3B82F6";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-duocal-border bg-duocal-void px-3 py-2 text-sm text-slate-300 transition-colors hover:border-duocal-accent/50"
      >
        {active ? (
          <>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getMyColor(active) }}
            />
            {active.name}
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-slate-500" />
            Personal Calendar
          </>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-duocal-border bg-duocal-slate py-1 shadow-glow-lg">
            <button
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-duocal-muted",
                !workspaceId && "text-duocal-accent"
              )}
              onClick={() => {
                setWorkspaceId(null);
                setOpen(false);
              }}
            >
              <User className="h-4 w-4" />
              Personal Calendar
            </button>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-duocal-muted",
                  workspaceId === ws.id && "text-duocal-accent"
                )}
                onClick={() => {
                  setWorkspaceId(ws.id);
                  setOpen(false);
                }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getMyColor(ws) }}
                />
                {ws.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
