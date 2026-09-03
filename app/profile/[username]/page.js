import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { decorateStandings } from "@/lib/elo";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import ProfileSettings from "@/components/ProfileSettings";
import AssetIcon from "@/components/AssetIcon";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const player = await prisma.user.findUnique({ where: { username: params.username } });
  if (!player) notFound();

  const isOwnProfile = me.id === player.id;
  const isAdminAccount = player.role === "ADMIN";

  let title = "—";
  let position = null;

  if (!isAdminAccount) {
    const allActive = await prisma.user.findMany({
      where: { isActive: true, role: { not: "ADMIN" } },
      orderBy: { elo: "desc" },
      select: { id: true, elo: true },
    });
    const decorated = decorateStandings(allActive);
    const mine = decorated.find((d) => d.id === player.id);
    title = mine ? mine.title : "Inactive";
    position = mine ? mine.position : null;
  }

  const history = isAdminAccount
    ? []
    : await prisma.fixture.findMany({
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

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="hero-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar username={player.username} size={84} />
        <div className="flex-1">
          <h1 className="font-display text-3xl sm:text-4xl text-banana">{player.displayName}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {isAdminAccount ? (
              <span className="tier-pill bg-blood-gradient text-white"><AssetIcon src="mascot/Logo.png" alt="" size={22} /> Admin account</span>
            ) : (
              <>
                <TierBadge title={title} />
                <span className="text-white/50 text-sm">
                  {position ? `#${position} in the league` : "Not currently active"} &middot; {player.elo} elo
                </span>
              </>
            )}
            {player.isGuest && <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">Guest</span>}
          </div>
        </div>
      </div>

      {isAdminAccount ? (
        <div className="card p-5 text-white/50 text-sm">
          This is a management account — it doesn't play matches, so it isn't ranked or shown on the leaderboard.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatTile icon="billiards/sticks.png" label="Record" value={`${player.wins}-${player.losses}`} />
          <StatTile icon="emotes/winner.png" label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} />
          <StatTile
            icon={player.streak > 0 ? "emotes/winner.png" : "emotes/losing_streak.png"}
            label="Streak"
            value={player.streak === 0 ? "—" : player.streak > 0 ? `W${player.streak}` : `L${Math.abs(player.streak)}`}
          />
          <StatTile icon="emotes/record.png" label="Best streak" value={player.bestStreak || "—"} />
          <StatTile icon="emotes/red_card.png" label="Forfeits" value={`${player.forfeitWins}W / ${player.forfeitLosses}L`} />
        </div>
      )}

      {isOwnProfile && <ProfileSettings currentDisplayName={player.displayName} />}

      {!isAdminAccount && (
        <>
          <div className="card p-4 sm:p-5">
            <h2 className="section-title mb-3"><AssetIcon src="billiards/sticks.png" alt="" size={30} /> Head-to-head</h2>
            {headToHeadList.length === 0 && (
              <p className="text-white/40 text-sm py-1">No certified matches yet - nobody to have a rivalry with.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {headToHeadList.map(({ opponent, wins, losses }) => {
                const record = wins - losses;
                const color = record > 0 ? "text-emerald-400" : record < 0 ? "text-blood-light" : "text-white/60";
                return (
                  <Link
                    key={opponent.id}
                    href={`/profile/${opponent.username}`}
                    className="flex items-center gap-2.5 bg-black/20 hover:bg-black/30 transition-colors rounded-xl px-3.5 py-2.5 text-sm border border-white/5"
                  >
                    <Avatar username={opponent.username} size={28} />
                    <span className="flex-1 truncate">vs {opponent.displayName}</span>
                    <span className={`font-display ${color}`}>{wins}-{losses}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <h2 className="section-title mb-3"><AssetIcon src="emotes/record.png" alt="" size={30} /> Match history</h2>
            {recentHistory.length === 0 && <p className="text-white/40 text-sm py-1">No certified matches yet.</p>}
            <div className="space-y-2">
              {recentHistory.map((f) => {
                const opponent = f.playerAId === player.id ? f.playerB : f.playerA;
                const won = f.winnerId === player.id;
                return (
                  <div
                    key={f.id}
                    className={`flex items-center justify-between bg-black/20 rounded-xl px-3.5 py-2.5 text-sm border-l-4 ${
                      won ? "border-l-emerald-400" : "border-l-blood"
                    } border-t border-r border-b border-white/5`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar username={opponent.username} size={28} />
                      <span>vs {opponent.displayName}</span>
                      <span className="text-white/30 text-xs">{f.winType?.replace("_", " ").toLowerCase()}</span>
                    </div>
                    <span className={won ? "text-emerald-400 font-bold" : "text-blood-light font-bold"}>
                      {won ? "WIN" : "LOSS"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <div className="stat-tile">
      <AssetIcon src={icon} alt="" size={30} className="mx-auto mb-1 relative z-10" />
      <div className="text-[11px] uppercase tracking-wide text-white/40 relative z-10">{label}</div>
      <div className="font-display text-lg mt-1 text-banana relative z-10">{value}</div>
    </div>
  );
}
