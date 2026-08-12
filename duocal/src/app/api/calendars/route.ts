import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueJoinCode } from "@/lib/join-code";
import { autoAssignColor } from "@/lib/colors";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: {
        include: { user: { select: { name: true, email: true, image: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(workspaces);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const joinCode = await generateUniqueJoinCode(async (code) => {
    const existing = await prisma.workspace.findUnique({ where: { joinCode: code } });
    return !!existing;
  });

  const color = autoAssignColor([]);

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      joinCode,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          color,
          role: "owner",
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { name: true, email: true, image: true } } },
      },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
