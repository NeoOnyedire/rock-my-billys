import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeEloChange, WIN_TYPE_MULTIPLIERS, decorateStandings } from "@/lib/elo";
import { generateMonkeyCommentary, getStreakRecordLine } from "@/lib/monkey";

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const fixtureId = Number(params.id);
  const body = await req.json().catch(() => ({}));

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: { playerA: true, playerB: true },
  });
  if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });

  const isCorrection = fixture.status === "APPROVED";

  // If this result was already approved and the admin is correcting a
  // mistake, first undo the previous elo/win/loss/streak effects so the
  // correction applies cleanly on top of a clean slate.
  if (isCorrection) {
    const prevWinnerIsA = fixture.winnerId === fixture.playerAId;
    const prevWinner = prevWinnerIsA ? fixture.playerA : fixture.playerB;
    const prevLoser = prevWinnerIsA ? fixture.playerB : fixture.playerA;
    const prevWinnerChange = prevWinnerIsA ? fixture.eloChangeA : fixture.eloChangeB;
    const prevLoserChange = prevWinnerIsA ? fixture.eloChangeB : fixture.eloChangeA;

    await prisma.user.update({
      where: { id: prevWinner.id },
      data: {
        elo: { decrement: prevWinnerChange ?? 0 },
        wins: { decrement: 1 },
        ...(fixture.winType === "FORFEIT" ? { forfeitWins: { decrement: 1 } } : {}),
      },
    });
    await prisma.user.update({
      where: { id: prevLoser.id },
      data: {
        elo: { decrement: prevLoserChange ?? 0 },
        losses: { decrement: 1 },
        ...(fixture.winType === "FORFEIT" ? { forfeitLosses: { decrement: 1 } } : {}),
      },
    });

    // Refresh local copies since elo/wins/losses just changed underneath us.
    fixture.playerA = await prisma.user.findUnique({ where: { id: fixture.playerAId } });
    fixture.playerB = await prisma.user.findUnique({ where: { id: fixture.playerBId } });
  }

  // Admin can override the submitted (or previously approved) result.
  const winnerId = Number(body.winnerId ?? fixture.winnerId);
  const winType = body.winType ?? fixture.winType;

  if (!winnerId || !winType || !WIN_TYPE_MULTIPLIERS[winType]) {
    return NextResponse.json({ error: "No valid result to approve yet - submit a winner and win type first" }, { status: 400 });
  }
  if (winnerId !== fixture.playerAId && winnerId !== fixture.playerBId) {
    return NextResponse.json({ error: "Winner must be one of the two players in this fixture" }, { status: 400 });
  }

  const winnerIsA = winnerId === fixture.playerAId;
  const winner = winnerIsA ? fixture.playerA : fixture.playerB;
  const loser = winnerIsA ? fixture.playerB : fixture.playerA;

  const { winnerNewElo, loserNewElo, winnerChange, loserChange, winnerWinProbability } = computeEloChange(
    winner.elo,
    loser.elo,
    winType
  );

  const winnerNewStreak = winner.streak >= 0 ? winner.streak + 1 : 1;
  const loserNewStreak = loser.streak <= 0 ? loser.streak - 1 : -1;

  // Figure out if this win breaks the winner's personal best streak, or
  // the all-time league record, so the Monkey can make a big deal of it.
  const leagueMaxBestStreak = await prisma.user.aggregate({
    where: { isActive: true },
    _max: { bestStreak: true },
  });
  const isPersonalRecord = winnerNewStreak > winner.bestStreak;
  const isLeagueRecord = winnerNewStreak > (leagueMaxBestStreak._max.bestStreak ?? 0);

  const { winnerMessage: baseWinnerMessage, loserMessage } = generateMonkeyCommentary({
    winnerName: winner.displayName,
    loserName: loser.displayName,
    winProbability: winnerWinProbability,
    winType,
    winnerStreakAfter: winnerNewStreak,
    loserStreakAfter: Math.abs(loserNewStreak),
  });

  const recordLine = getStreakRecordLine({
    streak: winnerNewStreak,
    isLeagueRecord,
    isPersonalRecord,
    playerName: winner.displayName,
  });
  const winnerMessage = recordLine ? `${baseWinnerMessage}${recordLine}` : baseWinnerMessage;

  const [updatedFixture] = await prisma.$transaction([
    prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        winnerId,
        winType,
        status: "APPROVED",
        approvedAt: new Date(),
        eloAId: fixture.playerA.elo,
        eloBId: fixture.playerB.elo,
        eloChangeA: winnerIsA ? winnerChange : loserChange,
        eloChangeB: winnerIsA ? loserChange : winnerChange,
        monkeyMessageWinner: winnerMessage,
        monkeyMessageLoser: loserMessage,
      },
    }),
    prisma.user.update({
      where: { id: winner.id },
      data: {
        elo: winnerNewElo,
        wins: { increment: 1 },
        streak: winnerNewStreak,
        bestStreak: Math.max(winner.bestStreak, winnerNewStreak),
        ...(winType === "FORFEIT" ? { forfeitWins: { increment: 1 } } : {}),
      },
    }),
    prisma.user.update({
      where: { id: loser.id },
      data: {
        elo: loserNewElo,
        losses: { increment: 1 },
        streak: loserNewStreak,
        ...(winType === "FORFEIT" ? { forfeitLosses: { increment: 1 } } : {}),
      },
    }),
  ]);

  // Snapshot rank history for both players against the fresh standings.
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { elo: "desc" },
    select: { id: true, elo: true },
  });
  const decorated = decorateStandings(allUsers);
  const posMap = new Map(decorated.map((d) => [d.id, d]));

  await prisma.rankHistory.createMany({
    data: [winner.id, loser.id].map((id) => {
      const d = posMap.get(id);
      return { userId: id, elo: d.elo, position: d.position, tier: d.title };
    }),
  });

  // Store the post-match position directly on the fixture too, so the
  // activity feed can render "-> now #2" without re-joining RankHistory.
  const winnerPos = posMap.get(winner.id);
  const loserPos = posMap.get(loser.id);
  const finalFixture = await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      winnerPositionAfter: winnerPos ? winnerPos.position : null,
      loserPositionAfter: loserPos ? loserPos.position : null,
    },
  });

  return NextResponse.json({ fixture: finalFixture });
}
