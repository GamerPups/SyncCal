"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { CalendarEventDTO } from "@/types";

export function CalendarPageClient() {
  const searchParams = useSearchParams();
  const { workspaceId, setWorkspaceId } = useWorkspace();
  const [events, setEvents] = useState<CalendarEventDTO[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const ws = searchParams.get("workspace");
    if (ws) setWorkspaceId(ws);
  }, [searchParams, setWorkspaceId]);

  const fetchEvents = useCallback(async () => {
    const params = workspaceId ? `?workspaceId=${workspaceId}` : "";
    const res = await fetch(`/api/events${params}`);
    if (res.ok) setEvents(await res.json());
  }, [workspaceId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handler = () => fetchEvents();
    window.addEventListener("duocal:events-changed", handler);
    return () => window.removeEventListener("duocal:events-changed", handler);
  }, [fetchEvents]);

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((prefs) => {
        if (!prefs.onboardingCompleted) setShowOnboarding(true);
      });
  }, []);

  return (
    <>
      <CalendarGrid
        events={events}
        onEventsChange={fetchEvents}
        workspaceId={workspaceId}
      />
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}
