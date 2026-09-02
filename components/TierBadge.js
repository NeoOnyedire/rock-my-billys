const TIER_COLORS = {
  Caesar: "bg-banana text-jungle-950 shadow-sm shadow-banana/30",
  Boots: "bg-blood text-white shadow-sm shadow-blood/20",
  Master: "bg-purple-500/90 text-white",
  Expert: "bg-blue-500/90 text-white",
  Veteran: "bg-emerald-500/90 text-white",
  Advanced: "bg-teal-500/90 text-white",
  Intermediate: "bg-yellow-600/90 text-white",
  Novice: "bg-gray-500/90 text-white",
};

export default function TierBadge({ title }) {
  const cls = TIER_COLORS[title] || "bg-gray-500/80 text-white";
  const label =
    title === "Caesar" ? "👑 Caesar" :
    title === "Boots" ? "🥾 Boots" :
    title;
  return <span className={`tier-pill ${cls}`}>{label}</span>;
}
