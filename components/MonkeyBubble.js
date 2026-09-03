export default function MonkeyBubble({ text, mood = "neutral" }) {
  const styles = {
    mean: { border: "border-blood/40", glow: "shadow-[0_0_24px_-6px_rgba(194,44,34,0.4)]", tag: "text-blood-light" },
    hype: { border: "border-banana/50", glow: "shadow-banana-glow", tag: "text-banana" },
    neutral: { border: "border-white/15", glow: "", tag: "text-banana" },
  };
  const s = styles[mood] || styles.neutral;

  return (
    <div className={`card ${s.border} ${s.glow} p-4 sm:p-5 flex gap-3.5 items-start animate-popIn`}>
      <div className="text-4xl leading-none select-none animate-floaty shrink-0">🐒</div>
      <div className="min-w-0">
        <div className={`text-[11px] uppercase tracking-widest font-bold mb-1 ${s.tag}`}>The Monkey says</div>
        <p className="text-sm text-white/90 italic leading-relaxed">&ldquo;{text}&rdquo;</p>
      </div>
    </div>
  );
}
