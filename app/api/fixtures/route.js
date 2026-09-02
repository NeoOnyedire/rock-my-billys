
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchdayId = searchParams.get("matchdayId");
  const mine = searchParams.get("mine");

  const where = {};
  if (matchdayId) where.matchdayId = Number(matchdayId);

  if (user.role !== "ADMIN" || mine === "1") {
    where.OR = [{ playerAId: user.id }, { playerBId: user.id }];
  }

  const fixtures = await prisma.fixture.findMany({
    where,
    include: {
      playerA: { select: { id: true, username: true, displayName: true, elo: true } },
      playerB: { select: { id: true, username: true, displayName: true, elo: true } },
      winner: { select: { id: true, username: true, displayName: true } },
      matchday: { select: { id: true, name: true, date: true, status: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ fixtures });
}
