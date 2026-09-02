const TIER_COLORS = {
  Caesar: "bg-banana text-jungle-950",
  Boots: "bg-blood text-white",
  Master: "bg-purple-500/80 text-white",
  Expert: "bg-blue-500/80 text-white",
  Veteran: "bg-emerald-500/80 text-white",
  Advanced: "bg-teal-500/80 text-white",
  Intermediate: "bg-yellow-600/80 text-white",
  Novice: "bg-gray-500/80 text-white",
};

export default function TierBadge({ title }) {
  const cls = TIER_COLORS[title] || "bg-gray-500/80 text-white";
  return <span className={`tier-pill ${cls}`}>{title === "Caesar" ? "👑 Caesar" : title === "Boots" ? "🥾 Boots" : title}</span>;
}
