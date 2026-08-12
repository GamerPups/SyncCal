import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGoogleEvent } from "@/lib/google-calendar";
import { assertWorkspaceMember } from "@/lib/workspace-auth";

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthorizedEvent(id: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return { error: "Not found", status: 404 as const };

  if (event.creatorId === userId) return { event };

  if (event.workspaceId) {
    const member = await assertWorkspaceMember(event.workspaceId, userId);
    if (member) return { event };
  }

  return { error: "Forbidden", status: 403 as const };
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getAuthorizedEvent(id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const body = await request.json();
  const { title, description, start, end, location, syncToGoogle } = body;

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(start !== undefined && { start: new Date(start) }),
      ...(end !== undefined && { end: new Date(end) }),
      ...(location !== undefined && { location }),
    },
  });

  if (syncToGoogle && !updated.googleEventId) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });
    if (account?.access_token) {
      const googleEventId = await createGoogleEvent(
        account.access_token,
        account.refresh_token,
        {
          title: updated.title,
          description: updated.description ?? undefined,
          start: updated.start,
          end: updated.end,
          location: updated.location ?? undefined,
        }
      );
      if (googleEventId) {
        return NextResponse.json(
          await prisma.event.update({ where: { id }, data: { googleEventId } })
        );
      }
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getAuthorizedEvent(id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.event.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can delete" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
