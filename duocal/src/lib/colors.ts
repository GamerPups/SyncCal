export const WORKSPACE_COLORS = [
  { hex: "#EF4444", name: "Crimson" },
  { hex: "#F97316", name: "Orange" },
  { hex: "#EAB308", name: "Gold" },
  { hex: "#22C55E", name: "Emerald" },
  { hex: "#14B8A6", name: "Teal" },
  { hex: "#06B6D4", name: "Cyan" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#8B5CF6", name: "Violet" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#F43F5E", name: "Rose" },
] as const;

export type WorkspaceColor = (typeof WORKSPACE_COLORS)[number];

export function getAvailableColors(claimed: string[]): WorkspaceColor[] {
  const claimedSet = new Set(claimed.map((c) => c.toUpperCase()));
  return WORKSPACE_COLORS.filter((c) => !claimedSet.has(c.hex.toUpperCase()));
}

export function autoAssignColor(claimed: string[]): string {
  const available = getAvailableColors(claimed);
  if (available.length > 0) return available[0].hex;
  // Fallback: generate a random high-contrast color
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 55%)`;
}

export function isColorClaimed(color: string, claimed: string[]): boolean {
  return claimed.some((c) => c.toUpperCase() === color.toUpperCase());
}
