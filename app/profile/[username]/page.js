
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { decorateStandings } from "@/lib/elo";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import ProfileSettings from "@/components/ProfileSettings";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }) {
  const me = await getCurrentUser();
  const player = await prisma.user.findUnique({ where: { username: params.username } });
  if (!player) notFound();

  const allActive = await prisma.user.findMany({
    where: { isActive: true, role: { not: "ADMIN" } },
    orderBy: { elo: "desc" },
    select: { id: true, elo: true },
  });
  const decorated = decorateStandings(allActive);
  const mine = decorated.find((d) => d.id === player.id);
  const title = mine ? mine.title : "Inactive";
  const position = mine ? mine.position : "—";

  const history = await prisma.fixture.findMany({
    where: {
      status: "APPROVED",
      OR: [{ playerAId: player.id }, { playerBId: player.id }],
    },
    orderBy: { approvedAt: "desc" },
    include: {
      playerA: { select: { id: true, username: true, displayName: true } },
      playerB: { select: { id: true, username: true, displayName: true } },
    },
  });

  // Head-to-head: group every certified match this player has ever played
  // by opponent, regardless of how far back it goes.
  const headToHead = new Map();
  for (const f of history) {
    const opponent = f.playerAId === player.id ? f.playerB : f.playerA;
    const won = f.winnerId === player.id;
    const existing = headToHead.get(opponent.id) || { opponent, wins: 0, losses: 0 };
    if (won) existing.wins += 1;
    else existing.losses += 1;
    headToHead.set(opponent.id, existing);
  }
  const headToHeadList = [...headToHead.values()].sort(
    (a, b) => b.wins + b.losses - (a.wins + a.losses)
  );

  const recentHistory = history.slice(0, 15);

  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : null;
  const isOwnProfile = me.id === player.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar username={player.username} size={72} />
        <div>
          <h1 className="font-display text-3xl text-banana">{player.displayName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <TierBadge title={title} />
            <span className="text-white/50 text-sm">
              {mine ? `#${position} in the league` : "Not currently active"} · {player.elo} elo
            </span>
            {player.isGuest && <span className="text-xs bg-white/10 px-2 py-1 rounded-full">Guest</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Record" value={`${player.wins}-${player.losses}`} />
        <Stat label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} />
        <Stat
          label="Streak"
          value={player.streak === 0 ? "—" : player.streak > 0 ? `W${player.streak}` : `L${Math.abs(player.streak)}`}
        />
        <Stat label="Best streak" value={player.bestStreak || "—"} />
        <Stat label="Forfeits" value={`${player.forfeitWins}W / ${player.forfeitLosses}L`} />
      </div>

      {isOwnProfile && <ProfileSettings currentDisplayName={player.displayName} />}

      <div className="card p-4">
        <h2 className="font-display text-xl text-banana mb-3">Head-to-head</h2>
        {headToHeadList.length === 0 && (
          <p className="text-white/50 text-sm">No certified matches yet - nobody to have a rivalry with.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {headToHeadList.map(({ opponent, wins, losses }) => {
            const record = wins - losses;
            const color = record > 0 ? "text-emerald-400" : record < 0 ? "text-blood" : "text-white/60";
            return (
              <Link
                key={opponent.id}
                href={`/profile/${opponent.username}`}
                className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 text-sm hover:bg-black/30"
              >
                <Avatar username={opponent.username} size={26} />
                <span className="flex-1 truncate">vs {opponent.displayName}</span>
                <span className={`font-display ${color}`}>{wins}-{losses}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-display text-xl text-banana mb-3">Match history</h2>
        {recentHistory.length === 0 && <p className="text-white/50 text-sm">No certified matches yet.</p>}
        <div className="space-y-2">
          {recentHistory.map((f) => {
            const opponent = f.playerAId === player.id ? f.playerB : f.playerA;
            const won = f.winnerId === player.id;
            return (
              <div key={f.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar username={opponent.username} size={26} />
                  <span>vs {opponent.displayName}</span>
                  <span className="text-white/30 text-xs">{f.winType?.replace("_", " ")}</span>
                </div>
                <span className={won ? "text-emerald-400 font-bold" : "text-blood font-bold"}>
                  {won ? "WIN" : "LOSS"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      <div className="font-display text-xl text-banana mt-1">{value}</div>
    </div>
  );
}
