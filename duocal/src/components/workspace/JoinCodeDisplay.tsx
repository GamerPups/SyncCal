"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Shield } from "lucide-react";
import { formatJoinCode } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface JoinCodeDisplayProps {
  joinCode: string;
}

export function JoinCodeDisplay({ joinCode }: JoinCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const formatted = formatJoinCode(joinCode);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-duocal-border bg-duocal-void p-4"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        <Shield className="h-3.5 w-3.5" />
        Privacy-first invite code
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-2xl font-bold tracking-widest text-duocal-accent">
          {formatted}
        </span>
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Non-members cannot see this workspace. Share the code only with people you trust.
      </p>
    </motion.div>
  );
}
