"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "./Avatar";

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Dashboard", icon: "🏠" },
    { href: "/standings", label: "Standings", icon: "🏆" },
    { href: "/fixtures", label: "Fixtures", icon: "🎱" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-banana/10 bg-jungle-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl sm:text-2xl text-banana flex items-center gap-2 shrink-0">
            <span className="inline-block animate-floaty">🐵</span>
            <span className="hidden xs:inline shimmer-text">Rock My Billys</span>
          </Link>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`glass-pill flex items-center gap-1.5 ${
                      pathname === l.href
                        ? "bg-banana text-jungle-950 shadow-banana-glow font-bold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`glass-pill flex items-center gap-1.5 ${
                      pathname === "/admin"
                        ? "bg-blood text-white shadow"
                        : "text-blood-light bg-blood/10 hover:bg-blood/20"
                    }`}
                  >
                    <span>🛠️</span>Admin
                  </Link>
                )}
              </div>

              <Link href={`/profile/${user.username}`} className="hidden sm:flex items-center gap-2 group">
                <Avatar username={user.username} size={34} />
                <span className="text-sm font-medium text-white/85 group-hover:text-banana transition-colors">
                  {user.displayName}
                </span>
              </Link>
              <button
                onClick={logout}
                className="hidden sm:inline text-xs text-white/40 hover:text-blood-light transition-colors"
              >
                Log out
              </button>

              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80"
                aria-label="Menu"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          )}
        </div>

        {user && menuOpen && (
          <div className="sm:hidden pb-4 space-y-1 animate-fadeUp">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  pathname === l.href ? "bg-banana text-jungle-950 font-bold" : "text-white/75 bg-white/5"
                }`}
              >
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  pathname === "/admin" ? "bg-blood text-white" : "text-blood-light bg-blood/10"
                }`}
              >
                🛠️ Admin
              </Link>
            )}
            <Link
              href={`/profile/${user.username}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/75 bg-white/5"
            >
              <Avatar username={user.username} size={22} />
              {user.displayName}
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-blood-light bg-blood/10"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
