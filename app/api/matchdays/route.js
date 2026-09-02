
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const matchdays = await prisma.matchday.findMany({
    orderBy: { date: "desc" },
    include: {
      fixtures: {
        include: {
          playerA: { select: { id: true, username: true, displayName: true } },
          playerB: { select: { id: true, username: true, displayName: true } },
          winner: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
  });
  return NextResponse.json({ matchdays });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { name, playerIds } = await req.json();

  if (!name || !Array.isArray(playerIds) || playerIds.length < 2) {
    return NextResponse.json({ error: "Need a name and at least 2 players" }, { status: 400 });
  }

  const ids = [...new Set(playerIds.map(Number))];

  const matchday = await prisma.matchday.create({
    data: { name, status: "OPEN" },
  });

  // Round robin: every selected player plays every other selected player once.
  const pairs = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pairs.push({ matchdayId: matchday.id, playerAId: ids[i], playerBId: ids[j] });
    }
  }

  await prisma.fixture.createMany({ data: pairs });

  const full = await prisma.matchday.findUnique({
    where: { id: matchday.id },
    include: {
      fixtures: {
        include: {
          playerA: { select: { id: true, username: true, displayName: true } },
          playerB: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
  });

  return NextResponse.json({ matchday: full });
}
