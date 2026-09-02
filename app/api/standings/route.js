
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decorateStandings } from "@/lib/elo";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { not: "ADMIN" } },
    orderBy: { elo: "desc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      elo: true,
      wins: true,
      losses: true,
      streak: true,
      bestStreak: true,
      isGuest: true,
    },
  });

  const withWinRate = users.map((u) => {
    const total = u.wins + u.losses;
    return { ...u, winRate: total > 0 ? Math.round((u.wins / total) * 100) : null, totalGames: total };
  });

  const standings = decorateStandings(withWinRate);

  return NextResponse.json({ standings });
}
