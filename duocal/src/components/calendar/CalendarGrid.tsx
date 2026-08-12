"use client";

import { useRef, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { motion } from "framer-motion";
import { Download, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { MapsPreviewModal } from "./MapsPreviewModal";
import { EventDialog } from "./EventDialog";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import type { CalendarEventDTO } from "@/types";

interface CalendarGridProps {
  events: CalendarEventDTO[];
  onEventsChange?: () => void;
  workspaceId?: string | null;
}

export function CalendarGrid({ events, onEventsChange, workspaceId }: CalendarGridProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [mapLocation, setMapLocation] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDTO | null>(null);
  const [defaultStart, setDefaultStart] = useState<Date | undefined>();
  const [defaultEnd, setDefaultEnd] = useState<Date | undefined>();

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: e.color ?? "#3B82F6",
    borderColor: e.color ?? "#2563EB",
    extendedProps: {
      location: e.location,
      description: e.description,
      raw: e,
    },
  }));

  const openCreate = (start?: Date, end?: Date) => {
    setSelectedEvent(null);
    setDefaultStart(start);
    setDefaultEnd(end);
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEventDTO) => {
    setSelectedEvent(event);
    setDefaultStart(undefined);
    setDefaultEnd(undefined);
    setDialogOpen(true);
  };

  const handleDateSelect = (info: DateSelectArg) => {
    openCreate(info.start, info.end);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (info: EventClickArg) => {
    const raw = info.event.extendedProps.raw as CalendarEventDTO;
    if (raw) openEdit(raw);
  };

  const handleGoogleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync/google", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        onEventsChange?.();
        toast(`Imported ${data.imported} of ${data.total} events from Google Calendar`);
      } else {
        toast(data.error ?? "Sync failed", "error");
      }
    } finally {
      setSyncing(false);
    }
  };

  const renderEventContent = useCallback(
    (eventInfo: { event: { title: string; extendedProps: { location?: string } } }) => {
      const location = eventInfo.event.extendedProps.location;
      return (
        <div className="flex items-center gap-1 overflow-hidden px-1 py-0.5 text-xs">
          <span className="truncate font-medium">{eventInfo.event.title}</span>
          {location && (
            <MapPin
              className="h-3 w-3 shrink-0 cursor-pointer opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setMapLocation(location);
              }}
            />
          )}
        </div>
      );
    },
    []
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-duocal-border bg-duocal-slate p-4 shadow-card"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WorkspaceSwitcher />
            <Button size="sm" onClick={() => openCreate()} className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoogleSync}
            disabled={syncing}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {syncing ? "Syncing..." : "Import Google Calendar"}
          </Button>
        </div>

        <div className="duocal-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={fcEvents}
            eventContent={renderEventContent}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            nowIndicator
            selectable
            selectMirror
          />
        </div>
      </motion.div>

      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => onEventsChange?.()}
        event={selectedEvent}
        workspaceId={workspaceId}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />

      {mapLocation && (
        <MapsPreviewModal
          open={!!mapLocation}
          onClose={() => setMapLocation(null)}
          location={mapLocation}
        />
      )}
    </>
  );
}
