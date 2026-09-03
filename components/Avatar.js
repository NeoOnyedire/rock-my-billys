"use client";

export default function Avatar({ username, size = 44 }) {
  const src = `/avatars/${username}.png`;
  const initials = (username || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      <div
        className="avatar flex items-center justify-center overflow-hidden w-full h-full shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
      >
        <img
          src={src}
          width={size}
          height={size}
          alt={username}
          className="avatar w-full h-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <div
          style={{ display: "none", fontSize: size * 0.34 }}
          className="w-full h-full items-center justify-center font-bold text-banana bg-gradient-to-br from-jungle-700 to-jungle-900 rounded-full absolute inset-0"
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
