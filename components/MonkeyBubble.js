export default function MonkeyBubble({ text, mood = "neutral" }) {
  const border =
    mood === "mean" ? "border-blood" : mood === "hype" ? "border-banana" : "border-white/20";
  return (
    <div className={`card border-2 ${border} p-4 flex gap-3 items-start`}>
      <div className="text-4xl leading-none select-none">🐒</div>
      <div>
        <div className="text-xs uppercase tracking-widest text-banana font-bold mb-1">The Monkey says</div>
        <p className="text-sm text-white/90 italic">"{text}"</p>
      </div>
    </div>
  );
}
