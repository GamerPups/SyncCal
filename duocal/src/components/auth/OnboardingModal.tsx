"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { OnboardingPreferences } from "@/types";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (prefs: OnboardingPreferences) => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [prefs, setPrefs] = useState<OnboardingPreferences>({
    eventInvites: true,
    securityAlerts: true,
    productUpdates: true,
  });
  const [loading, setLoading] = useState(false);

  const toggle = (key: keyof OnboardingPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prefs, onboardingCompleted: true }),
      });
      onComplete(prefs);
    } finally {
      setLoading(false);
    }
  };

  const preferences = [
    {
      key: "eventInvites" as const,
      label: "Event invites & calendar notifications",
      description: "Get notified when someone invites you to events or shared calendars.",
    },
    {
      key: "securityAlerts" as const,
      label: "Security & password resets",
      description: "Receive alerts about account security and password changes.",
    },
    {
      key: "productUpdates" as const,
      label: "Product updates & DuoCal feature releases",
      description: "Stay in the loop on new features and improvements.",
    },
  ];

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-duocal-glow to-duocal-accent shadow-glow-lg"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <DialogTitle className="text-center text-xl">Welcome to DuoCal</DialogTitle>
          <DialogDescription className="text-center">
            Set your notification preferences. You can change these anytime in Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {preferences.map((pref, i) => (
            <motion.label
              key={pref.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-duocal-border bg-duocal-void p-4 transition-colors hover:border-duocal-accent/50"
            >
              <Checkbox
                checked={prefs[pref.key]}
                onCheckedChange={() => toggle(pref.key)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-slate-200">{pref.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{pref.description}</p>
              </div>
            </motion.label>
          ))}
        </div>

        <Button onClick={handleComplete} disabled={loading} className="w-full" size="lg">
          {loading ? "Saving..." : "Get Started"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
