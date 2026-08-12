import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGoogleEvents } from "@/lib/google-calendar";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
  });

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "Google Calendar not connected" },
      { status: 400 }
    );
  }

  try {
    const googleEvents = await fetchGoogleEvents(
      account.access_token,
      account.refresh_token
    );

    let imported = 0;
    for (const gEvent of googleEvents) {
      if (!gEvent.id) continue;

      const existing = await prisma.event.findFirst({
        where: { googleEventId: gEvent.id, creatorId: session.user.id },
      });

      if (existing) continue;

      await prisma.event.create({
        data: {
          title: gEvent.title,
          description: gEvent.description ?? null,
          start: gEvent.start,
          end: gEvent.end,
          location: gEvent.location ?? null,
          googleEventId: gEvent.id,
          creatorId: session.user.id,
        },
      });
      imported++;
    }

    return NextResponse.json({ imported, total: googleEvents.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
