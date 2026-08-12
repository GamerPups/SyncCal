"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { WORKSPACE_COLORS, isColorClaimed } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  claimedColors: string[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
}

export function ColorPicker({ claimedColors, selectedColor, onSelect }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Choose your color for this workspace. Claimed colors are unavailable.
      </p>
      <div className="grid grid-cols-5 gap-3">
        {WORKSPACE_COLORS.map((color, i) => {
          const claimed = isColorClaimed(color.hex, claimedColors);
          const selected = selectedColor === color.hex;

          return (
            <motion.button
              key={color.hex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              disabled={claimed}
              onClick={() => onSelect(color.hex)}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                claimed && "cursor-not-allowed opacity-30",
                selected && "ring-2 ring-white ring-offset-2 ring-offset-duocal-slate scale-110",
                !claimed && !selected && "hover:scale-105"
              )}
              style={{ backgroundColor: color.hex }}
              title={claimed ? `${color.name} (claimed)` : color.name}
            >
              {claimed && (
                <X className="h-5 w-5 text-white drop-shadow-md" strokeWidth={3} />
              )}
              {selected && !claimed && (
                <Check className="h-5 w-5 text-white drop-shadow-md" strokeWidth={3} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
