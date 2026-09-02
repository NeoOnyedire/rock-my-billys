"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSettings({ currentDisplayName }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, newPassword: newPassword || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Something went wrong");
      return;
    }
    setMsg("Saved.");
    setNewPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card p-4 space-y-3">
      <h2 className="font-display text-xl text-banana">Settings</h2>
      <div>
        <label className="text-xs uppercase tracking-wide text-white/50">Display name</label>
        <input
          className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-white/50">New password (optional)</label>
        <input
          type="password"
          className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="leave blank to keep current"
        />
      </div>
      <p className="text-xs text-white/40">
        Profile picture: ask the admin to drop <code>{typeof window !== "undefined" ? "" : ""}your-username.png</code> in
        the avatars folder - it'll show automatically.
      </p>
      {msg && <p className="text-xs text-banana">{msg}</p>}
      <button disabled={busy} className="btn-primary text-sm">{busy ? "Saving..." : "Save changes"}</button>
    </form>
  );
}
