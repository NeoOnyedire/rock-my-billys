const TIER_STYLES = {
  Caesar: "bg-banana-gradient text-jungle-950 shadow-banana-glow",
  Boots: "bg-blood-gradient text-white shadow",
  Master: "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow",
  Expert: "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow",
  Veteran: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow",
  Advanced: "bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow",
  Intermediate: "bg-gradient-to-br from-yellow-500 to-yellow-700 text-white shadow",
  Novice: "bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow",
};

const TIER_ICONS = {
  Caesar: "👑",
  Boots: "🥾",
  Master: "🏆",
  Expert: "⭐",
  Veteran: "🎖️",
  Advanced: "🔷",
  Intermediate: "🔹",
  Novice: "🌱",
};

export default function TierBadge({ title }) {
  const cls = TIER_STYLES[title] || TIER_STYLES.Novice;
  const icon = TIER_ICONS[title] || "";
  return (
    <span className={`tier-pill ${cls}`}>
      <span>{icon}</span>
      {title}
    </span>
  );
}
