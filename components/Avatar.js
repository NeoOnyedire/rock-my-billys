"use client";

export default function Avatar({ username, size = 44 }) {
  const src = `/avatars/${username}.png`;
  const initials = (username || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className="avatar relative flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        width={size}
        height={size}
        alt={username || "player"}
        className="avatar w-full h-full"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextSibling;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        style={{ display: "none", width: size, height: size, fontSize: Math.max(11, size * 0.34) }}
        className="avatar absolute inset-0 items-center justify-center font-bold text-banana bg-gradient-to-br from-jungle-700 to-jungle-900"
      >
        {initials}
      </div>
    </div>
  );
}
