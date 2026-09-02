import Link from "next/link";
import Avatar from "./Avatar";

const WIN_TYPE_LABELS = {
  NORMAL: "standard win",
  SUNK_8_BALL: "sunk the 8-ball",
  WHITEWASH: "whitewash",
  FORFEIT: "forfeit",
};

export default function ActivityFeed({ fixtures }) {
  if (!fixtures || fixtures.length === 0) {
    return <p className="text-white/50 text-sm">No certified results yet. The jungle is quiet... for now.</p>;
  }

  return (
    <div className="space-y-2">
      {fixtures.map((f) => {
        const winner = f.winnerId === f.playerA.id ? f.playerA : f.playerB;
        const loser = f.winnerId === f.playerA.id ? f.playerB : f.playerA;
        const label = WIN_TYPE_LABELS[f.winType] || f.winType?.toLowerCase();

        return (
          <div key={f.id} className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2 text-sm">
            <Avatar username={winner.username} size={30} />
            <div className="flex-1 min-w-0">
              <p className="truncate">
                <Link href={`/profile/${winner.username}`} className="font-semibold text-banana hover:underline">
                  {winner.displayName}
                </Link>{" "}
                beat{" "}
                <Link href={`/profile/${loser.username}`} className="font-medium hover:underline">
                  {loser.displayName}
                </Link>
                {label && <span className="text-white/40"> ({label})</span>}
                {f.winnerPositionAfter && (
                  <span className="text-white/40"> → now #{f.winnerPositionAfter}</span>
                )}
              </p>
              {f.monkeyMessageWinner && (
                <p className="text-xs text-white/40 italic truncate">🐒 {f.monkeyMessageWinner}</p>
              )}
            </div>
            <span className="text-[10px] text-white/30 whitespace-nowrap">
              {new Date(f.approvedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
