import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeJoinCode } from "@/lib/utils";
import { autoAssignColor, isColorClaimed } from "@/lib/colors";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { joinCode, color } = body;
  const normalized = normalizeJoinCode(joinCode ?? "");

  if (normalized.length !== 8) {
    return NextResponse.json({ error: "Invalid join code format" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { joinCode: normalized },
    include: { members: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
  }

  const existing = workspace.members.find((m) => m.userId === session.user!.id);
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  const claimedColors = workspace.members.map((m) => m.color);
  let assignedColor = color;

  if (assignedColor && isColorClaimed(assignedColor, claimedColors)) {
    return NextResponse.json({ error: "Color already claimed" }, { status: 409 });
  }

  if (!assignedColor) {
    assignedColor = autoAssignColor(claimedColors);
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: session.user.id,
      color: assignedColor,
    },
    include: {
      workspace: {
        include: {
          members: {
            include: { user: { select: { name: true, email: true, image: true } } },
          },
        },
      },
    },
  });

  return NextResponse.json(member, { status: 201 });
}
