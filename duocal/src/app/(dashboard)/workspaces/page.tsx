"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mail, Users, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { JoinCodeDisplay } from "@/components/workspace/JoinCodeDisplay";
import { ColorPicker } from "@/components/workspace/ColorPicker";
import { useToast } from "@/components/ui/toast";
import type { WorkspaceDTO } from "@/types";

export default function WorkspacesPage() {
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceDTO | null>(null);

  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [claimedColors, setClaimedColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const lookupJoinCode = async (code: string) => {
    const normalized = code.replace(/-/g, "");
    if (normalized.length !== 8) {
      setClaimedColors([]);
      return;
    }
    const res = await fetch(`/api/calendars/join/preview?code=${normalized}`);
    if (res.ok) {
      const data = await res.json();
      setClaimedColors(data.claimedColors ?? []);
    }
  };

  const fetchWorkspaces = async () => {
    const res = await fetch("/api/calendars");
    if (res.ok) setWorkspaces(await res.json());
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setNewName("");
        fetchWorkspaces();
        toast("Workspace created");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (skipColor = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendars/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode,
          color: skipColor ? undefined : selectedColor,
        }),
      });
      if (res.ok) {
        setJoinOpen(false);
        setJoinCode("");
        setSelectedColor(null);
        fetchWorkspaces();
        toast("Joined workspace");
      } else {
        const data = await res.json();
        toast(data.error ?? "Failed to join", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedWorkspace || !inviteEmail.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/calendars/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
          email: inviteEmail,
        }),
      });
      if (res.ok) {
        setInviteOpen(false);
        setInviteEmail("");
        toast("Invite sent!");
      } else {
        const data = await res.json();
        toast(data.error ?? "Failed to send invite", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workspaces</h1>
          <p className="text-sm text-slate-400">
            Shared calendar spaces with privacy-first invite codes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinOpen(true)}>
            Join Workspace
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws, i) => (
          <motion.div
            key={ws.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-duocal-border bg-duocal-slate p-5 shadow-card transition-all hover:border-duocal-accent/40 hover:shadow-glow"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{ws.name}</h3>
                {ws.description && (
                  <p className="mt-1 text-xs text-slate-500">{ws.description}</p>
                )}
              </div>
              <Users className="h-4 w-4 text-slate-600" />
            </div>

            <JoinCodeDisplay joinCode={ws.joinCode} />

            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {ws.members?.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="h-7 w-7 rounded-full border-2 border-duocal-slate"
                    style={{ backgroundColor: m.color }}
                    title={m.user?.name ?? m.user?.email}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">
                {ws.members?.length ?? 0} member{(ws.members?.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-2"
                asChild
              >
                <Link href={`/calendar?workspace=${ws.id}`}>
                  <CalendarDays className="h-3.5 w-3.5" />
                  Open Calendar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => {
                  setSelectedWorkspace(ws);
                  setInviteOpen(true);
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                Invite
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <div className="rounded-xl border border-dashed border-duocal-border py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-slate-400">No workspaces yet</p>
          <p className="text-sm text-slate-600">Create one or join with an invite code</p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              A unique 8-character join code will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={loading || !newName.trim()}>
            {loading ? "Creating..." : "Create Workspace"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Join Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Workspace</DialogTitle>
            <DialogDescription>
              Enter the 8-character invite code shared with you.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="XXXX-XXXX"
            value={joinCode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setJoinCode(val);
              lookupJoinCode(val);
            }}
            className="font-mono text-center text-lg tracking-widest"
            maxLength={9}
          />
          <ColorPicker
            claimedColors={claimedColors}
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleJoin(true)}
              disabled={loading || joinCode.replace(/-/g, "").length !== 8}
            >
              Skip & Auto-Assign
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleJoin(false)}
              disabled={loading || joinCode.replace(/-/g, "").length !== 8}
            >
              {loading ? "Joining..." : "Join"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email Invite</DialogTitle>
            <DialogDescription>
              The join code for {selectedWorkspace?.name} will be sent via email.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder="recipient@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button onClick={handleInvite} disabled={loading || !inviteEmail.trim()}>
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
