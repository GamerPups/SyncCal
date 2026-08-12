import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGoogleEvent } from "@/lib/google-calendar";
import {
  assertWorkspaceMember,
  enrichEventsWithColors,
  getMemberColorMap,
} from "@/lib/workspace-auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (workspaceId) {
    const member = await assertWorkspaceMember(workspaceId, session.user.id);
    if (!member) {
      return NextResponse.json({ error: "Not a workspace member" }, { status: 403 });
    }

    const colorMap = await getMemberColorMap(workspaceId);
    const events = await prisma.event.findMany({
      where: { workspaceId },
      include: {
        creator: { select: { name: true, email: true } },
      },
      orderBy: { start: "asc" },
    });

    return NextResponse.json(enrichEventsWithColors(events, colorMap));
  }

  const events = await prisma.event.findMany({
    where: { creatorId: session.user.id, workspaceId: null },
    include: {
      creator: { select: { name: true, email: true } },
    },
    orderBy: { start: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, start, end, location, workspaceId, syncToGoogle } = body;

  if (!title || !start || !end) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let color: string | null = null;
  if (workspaceId) {
    const member = await assertWorkspaceMember(workspaceId, session.user.id);
    if (!member) {
      return NextResponse.json({ error: "Not a workspace member" }, { status: 403 });
    }
    color = member.color;
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description ?? null,
      start: new Date(start),
      end: new Date(end),
      location: location ?? null,
      workspaceId: workspaceId ?? null,
      color,
      creatorId: session.user.id,
    },
  });

  let googleEventId: string | undefined;
  if (syncToGoogle) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });
    if (account?.access_token) {
      googleEventId = await createGoogleEvent(
        account.access_token,
        account.refresh_token,
        {
          title,
          description: description ?? undefined,
          start: new Date(start),
          end: new Date(end),
          location: location ?? undefined,
        }
      );
      if (googleEventId) {
        await prisma.event.update({
          where: { id: event.id },
          data: { googleEventId },
        });
      }
    }
  }

  return NextResponse.json({ ...event, googleEventId }, { status: 201 });
}
