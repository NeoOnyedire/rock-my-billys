"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-banana/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center mb-8">
        <div className="text-7xl mb-3 drop-shadow-lg">🐒</div>
        <h1 className="font-display text-4xl sm:text-5xl text-banana tracking-wide">
          Rock My Billys
        </h1>
        <p className="text-white/50 mt-2 text-sm max-w-xs mx-auto">
          The league. The rankings. The Monkey is watching.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card p-6 sm:p-8 w-full max-w-sm space-y-5 relative z-10"
      >
        <div>
          <label className="text-[11px] uppercase tracking-widest text-white/50 font-semibold">
            Username
          </label>
          <input
            className="w-full mt-1.5 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-white/25"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="e.g. neo"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-white/50 font-semibold">
            Password
          </label>
          <input
            type="password"
            className="w-full mt-1.5 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-white/25"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="your monkey breed + number"
            required
          />
        </div>

        {error && (
          <div className="bg-blood/15 border border-blood/40 text-blood text-sm font-medium px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-jungle-950/30 border-t-jungle-950 rounded-full animate-spin" />
              Checking...
            </span>
          ) : (
            "Enter the Jungle"
          )}
        </button>
      </form>

      <p className="text-white/30 text-xs mt-8 relative z-10">
        Accounts are handed out by the admin. No sign-ups.
      </p>
    </div>
  );
}
