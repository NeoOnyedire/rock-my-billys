
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decorateStandings } from "@/lib/elo";
import { getIdleTaunt } from "@/lib/monkey";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import MonkeyBubble from "@/components/MonkeyBubble";
import ActivityFeed from "@/components/ActivityFeed";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const allUsers = await prisma.user.findMany({
    where: { isActive: true, role: { not: "ADMIN" } },
    orderBy: { elo: "desc" },
    select: { id: true, username: true, displayName: true, elo: true, wins: true, losses: true, streak: true },
  });
  const standings = decorateStandings(allUsers);
  const me = standings.find((s) => s.id === user.id);
  const isAdmin = user.role === "ADMIN";

  const pendingFixtures = await prisma.fixture.findMany({
    where: {
      OR: [{ playerAId: user.id }, { playerBId: user.id }],
      status: { in: ["PENDING", "SUBMITTED", "DISPUTED"] },
    },
    include: {
      playerA: { select: { id: true, username: true, displayName: true } },
      playerB: { select: { id: true, username: true, displayName: true } },
      matchday: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  const recentResult = await prisma.fixture.findFirst({
    where: {
      status: "APPROVED",
      OR: [{ playerAId: user.id }, { playerBId: user.id }],
    },
    orderBy: { approvedAt: "desc" },
    include: { playerA: true, playerB: true, winner: true },
  });

  const activityFeed = await prisma.fixture.findMany({
    where: { status: "APPROVED" },
    orderBy: { approvedAt: "desc" },
    take: 8,
    include: {
      playerA: { select: { id: true, username: true, displayName: true } },
      playerB: { select: { id: true, username: true, displayName: true } },
    },
  });

  let myMonkeyMessage = getIdleTaunt();
  if (recentResult && !isAdmin) {
    const iWon = recentResult.winnerId === user.id;
    myMonkeyMessage = iWon ? recentResult.monkeyMessageWinner : recentResult.monkeyMessageLoser;
  }
  if (isAdmin) {
    myMonkeyMessage = "The Monkey watches from the trees. I don't play. I judge.";
  }

  const totalGames = me ? me.wins + me.losses : 0;
  const winRate = totalGames > 0 ? Math.round((me.wins / totalGames) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {isAdmin ? (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-banana/30 to-blood/30 border-2 border-banana/50 flex items-center justify-center text-4xl shadow-lg shadow-banana/10">
            🐒
          </div>
        ) : (
          <Avatar username={user.username} size={64} />
        )}
        <div>
          <h1 className="font-display text-3xl text-banana">{isAdmin ? "The Monkey" : user.displayName}</h1>
          <div className="flex items-center gap-2 mt-1">
            {isAdmin ? (
              <span className="tier-pill bg-banana/20 text-banana border border-banana/40">League Overseer</span>
            ) : (
              <>
                <TierBadge title={me?.title || "—"} />
                <span className="text-white/50 text-sm">#{me?.position} in the league · {me?.elo} elo</span>
              </>
            )}
          </div>
        </div>
      </div>

      <MonkeyBubble text={myMonkeyMessage} mood={isAdmin ? "neutral" : recentResult ? (recentResult.winnerId === user.id ? "hype" : "mean") : "neutral"} />

      {!isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Record" value={`${me.wins}-${me.losses}`} />
          <StatCard label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} />
          <StatCard label="Streak" value={me.streak === 0 ? "—" : me.streak > 0 ? `W${me.streak}` : `L${Math.abs(me.streak)}`} />
          <StatCard label="Rank" value={me.title} />
        </div>
      )}

      {isAdmin && (
        <div className="card p-5 border-banana/20 bg-gradient-to-r from-banana/5 to-transparent">
          <p className="text-sm text-white/70 leading-relaxed">
            You are the neutral overseer of Rock My Billys. You create matchdays, certify results, and keep the jungle honest.
            You do not appear on the standings and do not play fixtures.
          </p>
          <Link href="/admin" className="btn-primary text-sm mt-4 inline-flex">
            Open Admin Panel →
          </Link>
        </div>
      )}

      {!isAdmin && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-banana">Upcoming / Pending fixtures</h2>
            <Link href="/fixtures" className="text-sm text-white/60 hover:text-white">View all →</Link>
          </div>

          {pendingFixtures.length === 0 && (
            <p className="text-white/50 text-sm">No fixtures waiting on you. Suspiciously peaceful.</p>
          )}

          <div className="space-y-2">
            {pendingFixtures.map((f) => {
              const opponent = f.playerAId === user.id ? f.playerB : f.playerA;
              return (
                <div key={f.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 hover:bg-black/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <Avatar username={opponent.username} size={28} />
                    <div className="text-sm">
                      <div>vs {opponent.displayName}</div>
                      <div className="text-white/40 text-xs">{f.matchday.name}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    f.status === "SUBMITTED" ? "bg-yellow-600/30 text-yellow-300" : "bg-white/10 text-white/60"
                  }`}>
                    {f.status === "SUBMITTED" ? "Awaiting admin" : "Not played"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-4">
        <h2 className="font-display text-xl text-banana mb-3">League activity</h2>
        <ActivityFeed fixtures={activityFeed} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      <div className="font-display text-2xl text-banana mt-1">{value}</div>
    </div>
  );
}
