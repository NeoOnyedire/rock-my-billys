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

  if (!user && pathname !== "/login") {
    // Layout renders on server; middleware already redirects unauthenticated
    // users, this is just a safety net for the nav bar itself.
  }

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/standings", label: "Standings" },
    { href: "/fixtures", label: "Fixtures" },
  ];

  return (
    <nav className="border-b border-white/10 bg-black/20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-banana flex items-center gap-2">
          🐵 Rock My Billys
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    pathname === l.href ? "bg-banana text-jungle-950" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    pathname === "/admin" ? "bg-blood text-white" : "text-blood bg-blood/10 hover:bg-blood/20"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
            <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
              <Avatar username={user.username} size={32} />
              <span className="hidden sm:inline text-sm">{user.displayName}</span>
            </Link>
            <button onClick={logout} className="text-xs text-white/50 hover:text-white/90">
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
