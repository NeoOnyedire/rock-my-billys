"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "./Avatar";

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/standings", label: "Standings" },
    { href: "/fixtures", label: "Fixtures" },
  ];

  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-jungle-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-xl sm:text-2xl text-banana flex items-center gap-2 shrink-0 hover:brightness-110 transition">
          <span className="text-2xl">🐵</span>
          <span className="hidden xs:inline">Rock My Billys</span>
          <span className="xs:hidden">RMB</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1 bg-black/30 rounded-full p-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    pathname === l.href
                      ? "bg-banana text-jungle-950 shadow-md shadow-banana/20"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    pathname === "/admin"
                      ? "bg-blood text-white shadow-md shadow-blood/20"
                      : "text-blood/90 bg-blood/10 hover:bg-blood/20"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Mobile quick links */}
            <div className="flex md:hidden items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`p-2 rounded-full text-xs font-medium ${
                    pathname === l.href ? "bg-banana/20 text-banana" : "text-white/60"
                  }`}
                  title={l.label}
                >
                  {l.label === "Dashboard" ? "🏠" : l.label === "Standings" ? "🏆" : "🎱"}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`p-2 rounded-full text-xs ${pathname === "/admin" ? "bg-blood/30 text-blood" : "text-blood/70"}`}
                  title="Admin"
                >
                  ⚙️
                </Link>
              )}
            </div>

            <div className="w-px h-6 bg-white/10 hidden sm:block" />

            <Link
              href={isAdmin ? "/" : `/profile/${user.username}`}
              className="flex items-center gap-2 rounded-full hover:bg-white/5 pr-2 transition"
            >
              {isAdmin ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banana/40 to-blood/30 border border-banana/50 flex items-center justify-center text-lg">
                  🐒
                </div>
              ) : (
                <Avatar username={user.username} size={32} />
              )}
              <span className="hidden sm:inline text-sm font-medium text-white/90">
                {isAdmin ? "The Monkey" : user.displayName}
              </span>
            </Link>

            <button
              onClick={logout}
              className="text-xs text-white/40 hover:text-white/80 px-2 py-1 rounded transition"
              title="Log out"
            >
              ⎋
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
