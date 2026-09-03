import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decorateStandings } from "@/lib/elo";
import { getIdleTaunt } from "@/lib/monkey";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import MonkeyBubble from "@/components/MonkeyBubble";
import ActivityFeed from "@/components/ActivityFeed";
import AssetIcon from "@/components/AssetIcon";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }

  const allUsers = await prisma.user.findMany({
    where: { isActive: true, role: { not: "ADMIN" } },
    orderBy: { elo: "desc" },
    select: { id: true, username: true, displayName: true, elo: true, wins: true, losses: true, streak: true },
  });
  const standings = decorateStandings(allUsers);
  const me = standings.find((s) => s.id === user.id);

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
  if (recentResult) {
    const iWon = recentResult.winnerId === user.id;
    myMonkeyMessage = iWon ? recentResult.monkeyMessageWinner : recentResult.monkeyMessageLoser;
  }

  const totalGames = me ? me.wins + me.losses : 0;
  const winRate = totalGames > 0 ? Math.round((me.wins / totalGames) * 100) : null;

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Hero */}
      <div className="hero-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar username={user.username} size={84} />
        <div className="flex-1">
          <h1 className="font-display text-3xl sm:text-4xl text-banana">{user.displayName}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {me && <TierBadge title={me.title} />}
            {me && (
              <span className="text-white/60 text-sm">
                #{me.position} in the league &middot; <span className="font-mono text-white/80">{me.elo}</span> elo
              </span>
            )}
          </div>
        </div>
        {winRate !== null && (
          <div className="flex flex-col items-center justify-center bg-black/25 rounded-2xl px-6 py-4 border border-white/10">
            <div className="font-display text-3xl text-banana">{winRate}%</div>
            <div className="text-[11px] uppercase tracking-wider text-white/40">Win rate</div>
          </div>
        )}
      </div>

      <MonkeyBubble
        text={myMonkeyMessage}
        mood={recentResult ? (recentResult.winnerId === user.id ? "hype" : "mean") : "neutral"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon="🎯" label="Record" value={me ? `${me.wins}-${me.losses}` : "0-0"} />
        <StatTile icon="📈" label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} />
        <StatTile
          icon={me && me.streak > 0 ? "🔥" : "🧊"}
          label="Streak"
          value={!me || me.streak === 0 ? "—" : me.streak > 0 ? `W${me.streak}` : `L${Math.abs(me.streak)}`}
          accent={me && me.streak > 0 ? "text-emerald-400" : me && me.streak < 0 ? "text-blood-light" : ""}
        />
        <StatTile icon="🏅" label="Rank" value={me ? me.title : "—"} />
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title flex items-center gap-2"><AssetIcon src="billiards/8_ball.png" alt="" size={30} /> Pending fixtures</h2>
          <Link href="/fixtures" className="text-sm text-white/50 hover:text-banana transition-colors">
            View all →
          </Link>
        </div>

        {pendingFixtures.length === 0 && (
          <p className="text-white/40 text-sm py-2">No fixtures waiting on you. Suspiciously peaceful.</p>
        )}

        <div className="space-y-2">
          {pendingFixtures.map((f) => {
            const opponent = f.playerAId === user.id ? f.playerB : f.playerA;
            return (
              <div
                key={f.id}
                className="flex items-center justify-between bg-black/20 rounded-xl px-3.5 py-2.5 border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar username={opponent.username} size={30} />
                  <div className="text-sm">
                    <div className="font-medium">vs {opponent.displayName}</div>
                    <div className="text-white/35 text-xs">{f.matchday.name}</div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    f.status === "SUBMITTED" ? "bg-yellow-500/20 text-yellow-300" : "bg-white/10 text-white/50"
                  }`}
                >
                  {f.status === "SUBMITTED" ? "Awaiting admin" : "Not played"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="section-title flex items-center gap-2 mb-3">📰 League activity</h2>
        <ActivityFeed fixtures={activityFeed} />
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, accent = "" }) {
  return (
    <div className="stat-tile">
      <div className="text-xl mb-1 relative z-10">{icon}</div>
      <div className="text-[11px] uppercase tracking-wide text-white/40 relative z-10">{label}</div>
      <div className={`font-display text-2xl mt-1 relative z-10 ${accent || "text-banana"}`}>{value}</div>
    </div>
  );
}

async function AdminDashboard({ user }) {
  const [activePlayers, pendingApprovals, openMatchdays, totalMatchesPlayed] = await Promise.all([
    prisma.user.count({ where: { isActive: true, role: { not: "ADMIN" } } }),
    prisma.fixture.count({ where: { status: "SUBMITTED" } }),
    prisma.matchday.count({ where: { status: "OPEN" } }),
    prisma.fixture.count({ where: { status: "APPROVED" } }),
  ]);

  const activityFeed = await prisma.fixture.findMany({
    where: { status: "APPROVED" },
    orderBy: { approvedAt: "desc" },
    take: 8,
    include: {
      playerA: { select: { id: true, username: true, displayName: true } },
      playerB: { select: { id: true, username: true, displayName: true } },
    },
  });

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="hero-card p-6 sm:p-8 flex items-center gap-5">
        <div className="text-5xl">🛠️</div>
        <div className="flex-1">
          <h1 className="font-display text-3xl sm:text-4xl text-blood-light">Admin Console</h1>
          <p className="text-white/50 text-sm mt-1">
            You manage the jungle, {user.displayName}. You don't play in it.
          </p>
        </div>
        <Link href="/admin" className="btn-danger hidden sm:inline-flex">
          Open admin panel →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon="🐒" label="Active players" value={activePlayers} />
        <StatTile icon="⏳" label="Awaiting approval" value={pendingApprovals} accent={pendingApprovals > 0 ? "text-yellow-300" : ""} />
        <StatTile icon="📅" label="Open matchdays" value={openMatchdays} />
        <StatTile icon="✅" label="Matches certified" value={totalMatchesPlayed} />
      </div>

      {pendingApprovals > 0 && (
        <div className="card p-4 border-yellow-500/30 flex items-center justify-between">
          <p className="text-sm text-yellow-200">
            🐒 {pendingApprovals} result{pendingApprovals !== 1 ? "s are" : " is"} sitting there waiting on you.
          </p>
          <Link href="/admin" className="btn-primary text-sm">Review now</Link>
        </div>
      )}

      <Link href="/admin" className="btn-danger w-full sm:hidden flex">Open admin panel →</Link>

      <div className="card p-4 sm:p-5">
        <h2 className="section-title flex items-center gap-2 mb-3">📰 League activity</h2>
        <ActivityFeed fixtures={activityFeed} />
      </div>
    </div>
  );
}