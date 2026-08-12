import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(
    preferences ?? {
      eventInvites: true,
      securityAlerts: true,
      productUpdates: true,
      onboardingCompleted: false,
    }
  );
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { eventInvites, securityAlerts, productUpdates, onboardingCompleted } = body;

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      eventInvites: eventInvites ?? true,
      securityAlerts: securityAlerts ?? true,
      productUpdates: productUpdates ?? true,
      onboardingCompleted: onboardingCompleted ?? false,
    },
    update: {
      ...(eventInvites !== undefined && { eventInvites }),
      ...(securityAlerts !== undefined && { securityAlerts }),
      ...(productUpdates !== undefined && { productUpdates }),
      ...(onboardingCompleted !== undefined && { onboardingCompleted }),
    },
  });

  return NextResponse.json(preferences);
}
