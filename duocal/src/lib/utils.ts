import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJoinCode(code: string): string {
  const clean = code.replace(/-/g, "").toUpperCase();
  if (clean.length !== 8) return code;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}

export function normalizeJoinCode(input: string): string {
  return input.replace(/-/g, "").toUpperCase();
}
