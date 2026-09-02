import Link from "next/link";
import { prisma } from "@/lib/db";
import { decorateStandings } from "@/lib/elo";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { not: "ADMIN" } },
    orderBy: { elo: "desc" },
    select: {
      id: true, username: true, displayName: true, elo: true,
      wins: true, losses: true, streak: true, isGuest: true,
    },
  });

  const standings = decorateStandings(users);
  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl text-banana">League Standings</h1>
        <p className="text-white/50 text-sm mt-1">Every monkey, ranked. No mercy. Admin stays in the trees.</p>
      </div>

      {/* Podium for top 3 */}
      {top3.length >= 1 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
          {/* 2nd */}
          <div className="order-1">
            {top3[1] ? (
              <PodiumCard player={top3[1]} place={2} />
            ) : (
              <div className="h-24" />
            )}
          </div>
          {/* 1st */}
          <div className="order-0 sm:order-none -mt-4">
            {top3[0] && <PodiumCard player={top3[0]} place={1} />}
          </div>
          {/* 3rd */}
          <div className="order-2">
            {top3[2] ? (
              <PodiumCard player={top3[2]} place={3} />
            ) : (
              <div className="h-20" />
            )}
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-black/40 text-white/50 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3.5 font-semibold">#</th>
                <th className="text-left px-4 py-3.5 font-semibold">Player</th>
                <th className="text-left px-4 py-3.5 font-semibold">Rank</th>
                <th className="text-right px-4 py-3.5 font-semibold">Elo</th>
                <th className="text-right px-4 py-3.5 font-semibold">W-L</th>
                <th className="text-right px-4 py-3.5 font-semibold">Win %</th>
                <th className="text-right px-4 py-3.5 font-semibold">Streak</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => {
                const total = s.wins + s.losses;
                const winRate = total > 0 ? Math.round((s.wins / total) * 100) : "—";
                const isTop = idx < 3;
                return (
                  <tr
                    key={s.id}
                    className={`border-t border-white/5 hover:bg-white/[0.04] ${
                      isTop ? "bg-banana/[0.03]" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <span className={`font-display text-lg ${
                        s.position === 1 ? "text-banana" :
                        s.position === 2 ? "text-white/80" :
                        s.position === 3 ? "text-amber-700" : "text-white/50"
                      }`}>
                        {s.position}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/profile/${s.username}`} className="flex items-center gap-2.5 group">
                        <Avatar username={s.username} size={34} />
                        <span className="font-medium group-hover:text-banana transition-colors">
                          {s.displayName}
                          {s.isGuest && <span className="text-white/30 text-xs ml-1.5 font-normal">(guest)</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5"><TierBadge title={s.title} /></td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-white/90">{s.elo}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums">{s.wins}-{s.losses}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-white/70">
                      {winRate}{winRate !== "—" && "%"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {s.streak === 0 ? (
                        <span className="text-white/30">—</span>
                      ) : (
                        <span className={`font-semibold ${s.streak > 0 ? "text-emerald-400" : "text-blood"}`}>
                          {s.streak > 0 ? `W${s.streak}` : `L${Math.abs(s.streak)}`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {standings.length === 0 && (
          <p className="text-center text-white/40 py-12 text-sm">No active players yet.</p>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ player, place }) {
  const heights = { 1: "h-36 sm:h-40", 2: "h-28 sm:h-32", 3: "h-24 sm:h-28" };
  const borders = {
    1: "border-banana/50 shadow-lg shadow-banana/10",
    2: "border-white/20",
    3: "border-amber-800/40",
  };
  const medals = { 1: "👑", 2: "🥈", 3: "🥉" };
  const bg = {
    1: "from-banana/15 to-transparent",
    2: "from-white/8 to-transparent",
    3: "from-amber-900/20 to-transparent",
  };

  return (
    <Link
      href={`/profile/${player.username}`}
      className={`card ${heights[place]} flex flex-col items-center justify-end p-3 sm:p-4 bg-gradient-to-t ${bg[place]} ${borders[place]} hover:scale-[1.02] transition-transform`}
    >
      <div className="text-xl mb-1">{medals[place]}</div>
      <Avatar username={player.username} size={place === 1 ? 48 : 40} />
      <div className="mt-2 text-center">
        <div className={`font-display text-sm sm:text-base truncate max-w-[100px] sm:max-w-[120px] ${place === 1 ? "text-banana" : ""}`}>
          {player.displayName}
        </div>
        <div className="text-[10px] sm:text-xs text-white/50 mt-0.5 font-mono">{player.elo} elo</div>
        <div className="mt-1.5">
          <TierBadge title={player.title} />
        </div>
      </div>
    </Link>
  );
}
