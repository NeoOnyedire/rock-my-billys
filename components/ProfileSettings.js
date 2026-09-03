"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSettings({ currentDisplayName }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
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
      setIsError(true);
      setMsg(data.error || "Something went wrong");
      return;
    }
    setIsError(false);
    setMsg("Saved ✓");
    setNewPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card p-4 sm:p-5 space-y-3.5">
      <h2 className="section-title">⚙️ Settings</h2>
      <div>
        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Display name</label>
        <input
          className="input-field mt-1.5"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">New password</label>
        <input
          type="password"
          className="input-field mt-1.5"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="leave blank to keep current"
        />
      </div>
      <p className="text-xs text-white/35">
        Profile picture: ask the admin to drop <code className="bg-black/30 px-1.5 py-0.5 rounded">your-username.png</code> in
        the avatars folder — it'll show automatically.
      </p>
      {msg && (
        <p className={`text-xs font-medium ${isError ? "text-blood-light" : "text-banana"}`}>{msg}</p>
      )}
      <button disabled={busy} className="btn-primary text-sm">{busy ? "Saving..." : "Save changes"}</button>
    </form>
  );
}
