import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeJoinCode } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = normalizeJoinCode(searchParams.get("code") ?? "");

  if (code.length !== 8) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { joinCode: code },
    select: { members: { select: { color: true } } },
  });

  if (!workspace) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    claimedColors: workspace.members.map((m) => m.color),
  });
}
