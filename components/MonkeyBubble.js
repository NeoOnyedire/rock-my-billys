import AssetIcon from "./AssetIcon";

export default function MonkeyBubble({ text, mood = "neutral" }) {
  const styles = {
    mean: { border: "border-blood/40", glow: "shadow-[0_0_24px_-6px_rgba(194,44,34,0.4)]", tag: "text-blood-light" },
    hype: { border: "border-banana/50", glow: "shadow-banana-glow", tag: "text-banana" },
    neutral: { border: "border-white/15", glow: "", tag: "text-banana" },
  };
  const s = styles[mood] || styles.neutral;
  const mascot = mood === "hype" ? "emotes/winner.png" : mood === "mean" ? "emotes/loser.png" : "mascot/playing.png";

  return (
    <div className={`card ${s.border} ${s.glow} p-4 sm:p-5 flex gap-3.5 items-start animate-popIn`}>
      <AssetIcon src={mascot} alt="The Monkey" size={64} className="shrink-0 rounded-xl animate-floaty" />
      <div className="min-w-0">
        <div className={`text-[11px] uppercase tracking-widest font-bold mb-1 ${s.tag}`}>The Monkey says</div>
        <p className="text-sm text-white/90 italic leading-relaxed">&ldquo;{text}&rdquo;</p>
      </div>
    </div>
  );
}
