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
      {/* decorative blurred blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-banana/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-mango/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-jungle-500/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center animate-fadeUp">
        <div className="text-7xl mb-3 animate-floaty drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">🐒</div>
        <h1 className="font-display text-4xl sm:text-5xl shimmer-text mb-1 text-center">Rock My Billys</h1>
        <p className="text-white/50 mb-8 text-sm tracking-wide text-center">
          The Monkey is watching. Log in, chimp.
        </p>

        <form onSubmit={handleSubmit} className="hero-card p-7 w-full max-w-sm space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Username</label>
            <input
              className="input-field mt-1.5"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="e.g. neo"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Password</label>
            <input
              type="password"
              className="input-field mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="your monkey breed"
              required
            />
          </div>

          {error && (
            <p className="text-blood-light text-sm font-medium bg-blood/10 border border-blood/30 rounded-lg px-3 py-2 animate-popIn">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
            {loading ? "Checking..." : "Enter the Jungle 🍌"}
          </button>
        </form>

        <p className="text-white/25 text-xs mt-6 text-center">Private league · 7 players · no mercy</p>
      </div>
    </div>
  );
}
