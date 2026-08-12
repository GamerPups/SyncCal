import { prisma } from "./prisma";

export async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) return null;
  return member;
}

export async function getMemberColorMap(workspaceId: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true, color: true },
  });
  return new Map(members.map((m) => [m.userId, m.color]));
}

export function enrichEventsWithColors<T extends { creatorId: string; color: string | null }>(
  events: T[],
  colorMap: Map<string, string>
) {
  return events.map((e) => ({
    ...e,
    color: e.color ?? colorMap.get(e.creatorId) ?? "#3B82F6",
  }));
}
