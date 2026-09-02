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
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-6xl mb-2">🐒</div>
      <h1 className="font-display text-4xl text-banana mb-1">Rock My Billys</h1>
      <p className="text-white/50 mb-8 text-sm">The Monkey is watching. Log in, chimp.</p>

      <form onSubmit={handleSubmit} className="card p-6 w-full max-w-sm space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-white/60">Username</label>
          <input
            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-banana"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="e.g. neo"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-white/60">Password</label>
          <input
            type="password"
            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-banana"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="your monkey breed"
            required
          />
        </div>

        {error && <p className="text-blood text-sm font-medium">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Checking..." : "Enter the Jungle"}
        </button>
      </form>
    </div>
  );
}
