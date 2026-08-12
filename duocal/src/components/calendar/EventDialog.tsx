"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import type { CalendarEventDTO } from "@/types";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  event?: CalendarEventDTO | null;
  workspaceId?: string | null;
  defaultStart?: Date;
  defaultEnd?: Date;
}

function toLocalDatetimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventDialog({
  open,
  onClose,
  onSaved,
  event,
  workspaceId,
  defaultStart,
  defaultEnd,
}: EventDialogProps) {
  const { toast } = useToast();
  const isEdit = !!event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [syncToGoogle, setSyncToGoogle] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setStart(toLocalDatetimeValue(new Date(event.start)));
      setEnd(toLocalDatetimeValue(new Date(event.end)));
      setLocation(event.location ?? "");
      setSyncToGoogle(false);
    } else {
      const s = defaultStart ?? new Date();
      const e = defaultEnd ?? new Date(s.getTime() + 60 * 60 * 1000);
      setTitle("");
      setDescription("");
      setStart(toLocalDatetimeValue(s));
      setEnd(toLocalDatetimeValue(e));
      setLocation("");
      setSyncToGoogle(true);
    }
  }, [open, event, defaultStart, defaultEnd]);

  const handleSave = async () => {
    if (!title.trim() || !start || !end) return;
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        location: location.trim() || undefined,
        workspaceId: workspaceId ?? undefined,
        syncToGoogle,
      };

      const url = isEdit ? `/api/events/${event!.id}` : "/api/events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Failed to save event", "error");
        return;
      }

      toast(isEdit ? "Event updated" : "Event created");
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm("Delete this event?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Failed to delete event", "error");
        return;
      }
      toast("Event deleted");
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "New Event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Last updated ${format(new Date(event!.start), "MMM d, yyyy")}`
              : "Create a calendar event" + (workspaceId ? " in this workspace" : "")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Team standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Office, Room 3, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {!isEdit && (
            <label className="flex items-center gap-3">
              <Checkbox
                checked={syncToGoogle}
                onCheckedChange={(v) => setSyncToGoogle(!!v)}
              />
              <span className="text-sm text-slate-400">Sync to Google Calendar</span>
            </label>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {isEdit && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
