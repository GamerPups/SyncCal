import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseScheduleRequest } from "@/lib/ai-parser";
import {
  checkScheduleConflicts,
  createGoogleEvent,
} from "@/lib/google-calendar";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { message, workspaceId, forceCreate } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const parsed = await parseScheduleRequest(message);
  const start = new Date(parsed.start);
  const end = new Date(parsed.end);

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
  });

  let conflicts: Array<{ title: string; start: Date; end: Date }> = [];
  if (account?.access_token) {
    const conflictResult = await checkScheduleConflicts(
      account.access_token,
      account.refresh_token,
      start,
      end
    );
    conflicts = conflictResult.conflictingEvents;
  }

  if (conflicts.length > 0 && !forceCreate) {
    return NextResponse.json({
      parsed,
      conflicts: conflicts.map((c) => ({
        title: c.title,
        start: c.start.toISOString(),
        end: c.end.toISOString(),
      })),
      created: false,
    });
  }

  let memberColor: string | null = null;
  if (workspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: session.user.id },
      },
    });
    memberColor = member?.color ?? null;
  }

  const event = await prisma.event.create({
    data: {
      title: parsed.title,
      description: parsed.description ?? null,
      start,
      end,
      location: parsed.location ?? null,
      workspaceId: workspaceId ?? null,
      color: memberColor,
      creatorId: session.user.id,
    },
  });

  let googleEventId: string | undefined;
  if (account?.access_token) {
    googleEventId = await createGoogleEvent(
      account.access_token,
      account.refresh_token,
      {
        title: parsed.title,
        description: parsed.description,
        start,
        end,
        location: parsed.location,
      }
    );

    if (googleEventId) {
      await prisma.event.update({
        where: { id: event.id },
        data: { googleEventId },
      });
    }
  }

  return NextResponse.json({
    parsed,
    conflicts: conflicts.map((c) => ({
      title: c.title,
      start: c.start.toISOString(),
      end: c.end.toISOString(),
    })),
    created: true,
    eventId: event.id,
    googleEventId,
  });
}
