"use client";

export default function Avatar({ username, size = 44 }) {
  const src = `/avatars/${username}.png`;
  const initials = (username || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className="avatar flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: size, height: size }}
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
        style={{ display: "none", width: size, height: size, fontSize: size * 0.35 }}
        className="avatar items-center justify-center font-bold text-banana absolute"
      >
        {initials}
      </div>
    </div>
  );
}
