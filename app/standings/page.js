import Link from "next/link";
import { prisma } from "@/lib/db";
import { decorateStandings } from "@/lib/elo";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import AssetIcon from "@/components/AssetIcon";

export const dynamic = "force-dynamic";

const PODIUM_ART = { 1: "extras/crown.png", 2: "emotes/record.png", 3: "emotes/winner.png" };

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
  const podium = standings.slice(0, 3);
  const rest = standings.slice(3);

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl shimmer-text">League Standings</h1>
        <p className="text-white/40 text-sm mt-1">Every monkey, ranked. No mercy.</p>
      </div>

      {podium.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {podium.map((s) => (
            <Link
              key={s.id}
              href={`/profile/${s.username}`}
              className={`card card-hover p-5 flex flex-col items-center text-center relative overflow-hidden ${
                s.position === 1 ? "sm:order-2 border-banana/40 shadow-banana-glow" : s.position === 2 ? "sm:order-1" : "sm:order-3"
              }`}
            >
              <AssetIcon src={PODIUM_ART[s.position]} alt={`Place ${s.position}`} size={38} className="absolute top-3 left-3" />
              <Avatar username={s.username} size={s.position === 1 ? 76 : 64} />
              <div className="font-display text-lg mt-3 text-white">{s.displayName}</div>
              <div className="mt-1.5"><TierBadge title={s.title} /></div>
              <div className="text-white/40 text-xs mt-2 font-mono">{s.elo} elo</div>
              <div className="text-white/50 text-xs mt-0.5">{s.wins}-{s.losses}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-white/40 text-[11px] uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Player</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Rank</th>
              <th className="text-right px-4 py-3">Elo</th>
              <th className="text-right px-4 py-3 hidden xs:table-cell">W-L</th>
              <th className="text-right px-4 py-3 hidden sm:table-cell">Win %</th>
              <th className="text-right px-4 py-3">Streak</th>
            </tr>
          </thead>
          <tbody>
            {(rest.length > 0 ? rest : podium.length === 0 ? standings : []).map((s) => (
              <StandingsRow key={s.id} s={s} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StandingsRow({ s }) {
  const total = s.wins + s.losses;
  const winRate = total > 0 ? Math.round((s.wins / total) * 100) : "—";
  const isBoots = s.title === "Boots";

  return (
    <tr className={`border-t border-white/5 hover:bg-white/[0.04] transition-colors ${isBoots ? "bg-blood/5" : ""}`}>
      <td className="px-4 py-3 font-display text-lg text-white/60">{s.position}</td>
      <td className="px-4 py-3">
        <Link href={`/profile/${s.username}`} className="flex items-center gap-2.5 group">
          <Avatar username={s.username} size={32} />
          <span className="font-medium group-hover:text-banana transition-colors">
            {s.displayName}
            {s.isGuest && <span className="text-white/30 text-xs ml-1">(guest)</span>}
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell"><TierBadge title={s.title} /></td>
      <td className="px-4 py-3 text-right font-mono text-white/80">{s.elo}</td>
      <td className="px-4 py-3 text-right hidden xs:table-cell text-white/70">{s.wins}-{s.losses}</td>
      <td className="px-4 py-3 text-right hidden sm:table-cell text-white/70">{winRate}{winRate !== "—" && "%"}</td>
      <td className="px-4 py-3 text-right">
        {s.streak === 0 ? (
          <span className="text-white/30">—</span>
        ) : (
          <span className={`font-semibold ${s.streak > 0 ? "text-emerald-400" : "text-blood-light"}`}>
            {s.streak > 0 ? `W${s.streak}` : `L${Math.abs(s.streak)}`}
          </span>
        )}
      </td>
    </tr>
  );
}
