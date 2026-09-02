export default function MonkeyBubble({ text, mood = "neutral" }) {
  const styles = {
    mean: "border-blood/60 bg-blood/5",
    hype: "border-banana/50 bg-banana/5",
    neutral: "border-white/15",
  };
  const emoji = mood === "mean" ? "🐒💢" : mood === "hype" ? "🐒🔥" : "🐒";

  return (
    <div className={`card border-2 ${styles[mood] || styles.neutral} p-4 flex gap-3.5 items-start`}>
      <div className="text-3xl sm:text-4xl leading-none select-none shrink-0 pt-0.5">{emoji}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-banana font-bold mb-1.5">
          The Monkey says
        </div>
        <p className="text-sm text-white/90 italic leading-relaxed">"{text}"</p>
      </div>
    </div>
  );
}
