import Link from "next/link";
import { prisma } from "@/lib/db";
import { decorateStandings } from "@/lib/elo";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { elo: "desc" },
    select: {
      id: true, username: true, displayName: true, elo: true,
      wins: true, losses: true, streak: true, isGuest: true,
    },
  });

  const standings = decorateStandings(users);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-banana">League Standings</h1>
      <p className="text-white/50 text-sm -mt-2">Every monkey, ranked. No mercy.</p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-white/50 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Player</th>
              <th className="text-left px-4 py-3">Rank</th>
              <th className="text-right px-4 py-3">Elo</th>
              <th className="text-right px-4 py-3">W-L</th>
              <th className="text-right px-4 py-3">Win %</th>
              <th className="text-right px-4 py-3">Streak</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const total = s.wins + s.losses;
              const winRate = total > 0 ? Math.round((s.wins / total) * 100) : "—";
              return (
                <tr key={s.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-display text-lg text-white/70">{s.position}</td>
                  <td className="px-4 py-3">
                    <Link href={`/profile/${s.username}`} className="flex items-center gap-2">
                      <Avatar username={s.username} size={32} />
                      <span className="font-medium">
                        {s.displayName}
                        {s.isGuest && <span className="text-white/30 text-xs ml-1">(guest)</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><TierBadge title={s.title} /></td>
                  <td className="px-4 py-3 text-right font-mono">{s.elo}</td>
                  <td className="px-4 py-3 text-right">{s.wins}-{s.losses}</td>
                  <td className="px-4 py-3 text-right">{winRate}{winRate !== "—" && "%"}</td>
                  <td className="px-4 py-3 text-right">
                    {s.streak === 0 ? "—" : (
                      <span className={s.streak > 0 ? "text-emerald-400" : "text-blood"}>
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
    </div>
  );
}
