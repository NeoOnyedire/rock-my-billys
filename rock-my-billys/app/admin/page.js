"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

const WIN_TYPES = [
  { value: "NORMAL", label: "Standard win" },
  { value: "SUNK_8_BALL", label: "Sunk the 8-ball" },
  { value: "WHITEWASH", label: "Whitewash" },
  { value: "FORFEIT", label: "Forfeit" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("matchdays");
  const [players, setPlayers] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [pRes, mRes] = await Promise.all([fetch("/api/players"), fetch("/api/matchdays")]);
    setPlayers((await pRes.json()).users || []);
    setMatchdays((await mRes.json()).matchdays || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-blood">Admin Panel</h1>

      <div className="flex gap-2">
        <TabButton active={tab === "matchdays"} onClick={() => setTab("matchdays")}>Matchdays</TabButton>
        <TabButton active={tab === "players"} onClick={() => setTab("players")}>Players</TabButton>
      </div>

      {loading ? (
        <p className="text-white/50">Loading...</p>
      ) : tab === "matchdays" ? (
        <MatchdaysTab players={players} matchdays={matchdays} reload={loadAll} />
      ) : (
        <PlayersTab players={players} reload={loadAll} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium ${active ? "bg-blood text-white" : "bg-white/5 text-white/60"}`}
    >
      {children}
    </button>
  );
}

/* ---------------- Matchdays ---------------- */

function MatchdaysTab({ players, matchdays, reload }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const activePlayers = players.filter((p) => p.isActive);

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function createMatchday() {
    if (!name || selected.length < 2) return alert("Give it a name and pick at least 2 players.");
    setBusy(true);
    const res = await fetch("/api/matchdays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, playerIds: selected }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return alert(data.error);
    setName("");
    setSelected([]);
    reload();
  }

  async function closeMatchday(id, status) {
    await fetch(`/api/matchdays/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    reload();
  }

  async function deleteMatchday(id) {
    if (!confirm("Delete this matchday and all its fixtures?")) return;
    await fetch(`/api/matchdays/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-3">
        <h2 className="font-display text-xl text-banana">Create a matchday</h2>
        <input
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          placeholder="e.g. Matchday 4 - September"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Select players ({selected.length} picked)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activePlayers.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  selected.includes(p.id) ? "bg-banana text-jungle-950 font-semibold" : "bg-white/5"
                }`}
              >
                <input type="checkbox" className="hidden" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                <Avatar username={p.username} size={24} />
                {p.displayName}
              </label>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">
          This generates a round-robin: every selected player will get a fixture against every other selected player.
        </p>
        <button disabled={busy} onClick={createMatchday} className="btn-primary text-sm">
          {busy ? "Creating..." : "Create matchday & generate fixtures"}
        </button>
      </div>

      {matchdays.map((md) => (
        <MatchdayCard key={md.id} matchday={md} reload={reload} onClose={closeMatchday} onDelete={deleteMatchday} />
      ))}
    </div>
  );
}

function MatchdayCard({ matchday, reload, onClose, onDelete }) {
  const pending = matchday.fixtures.filter((f) => f.status !== "APPROVED").length;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-lg text-banana">{matchday.name}</h3>
          <p className="text-xs text-white/40">
            {matchday.fixtures.length} fixtures · {pending} pending · status: {matchday.status}
          </p>
        </div>
        <div className="flex gap-2">
          {matchday.status === "OPEN" ? (
            <button onClick={() => onClose(matchday.id, "COMPLETED")} className="btn-ghost text-xs px-3 py-1.5">
              Mark complete
            </button>
          ) : (
            <button onClick={() => onClose(matchday.id, "OPEN")} className="btn-ghost text-xs px-3 py-1.5">
              Reopen
            </button>
          )}
          <button onClick={() => onDelete(matchday.id)} className="btn-danger text-xs px-3 py-1.5">
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {matchday.fixtures.map((f) => (
          <FixtureRow key={f.id} fixture={f} reload={reload} />
        ))}
      </div>
    </div>
  );
}

function FixtureRow({ fixture, reload }) {
  const [editing, setEditing] = useState(false);
  const [winnerId, setWinnerId] = useState(fixture.winnerId);
  const [winType, setWinType] = useState(fixture.winType || "NORMAL");
  const [busy, setBusy] = useState(false);

  async function approve() {
    if (!winnerId) return alert("Pick a winner first.");
    setBusy(true);
    const res = await fetch(`/api/fixtures/${fixture.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, winType }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return alert(data.error);
    setEditing(false);
    reload();
  }

  const statusColor =
    fixture.status === "APPROVED"
      ? "bg-white/10 text-white/50"
      : fixture.status === "SUBMITTED"
      ? "bg-yellow-600/30 text-yellow-300"
      : "bg-white/5 text-white/40";

  return (
    <div className="bg-black/20 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">{fixture.playerA.displayName}</span>
          <span className="text-white/30 mx-2">vs</span>
          <span className="font-medium">{fixture.playerB.displayName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{fixture.status}</span>
          {fixture.winner && (
            <span className="text-xs text-banana">🏆 {fixture.winner.displayName}</span>
          )}
          <button onClick={() => setEditing((e) => !e)} className="btn-ghost text-xs px-2 py-1">
            {fixture.status === "APPROVED" ? "Correct" : "Approve"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 border-t border-white/10 pt-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setWinnerId(fixture.playerA.id)}
              className={`flex-1 py-1.5 rounded-lg text-sm ${winnerId === fixture.playerA.id ? "bg-banana text-jungle-950 font-bold" : "bg-white/5"}`}
            >
              {fixture.playerA.displayName} won
            </button>
            <button
              onClick={() => setWinnerId(fixture.playerB.id)}
              className={`flex-1 py-1.5 rounded-lg text-sm ${winnerId === fixture.playerB.id ? "bg-banana text-jungle-950 font-bold" : "bg-white/5"}`}
            >
              {fixture.playerB.displayName} won
            </button>
          </div>
          <select
            value={winType}
            onChange={(e) => setWinType(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            {WIN_TYPES.map((wt) => (
              <option key={wt.value} value={wt.value}>{wt.label}</option>
            ))}
          </select>
          <button disabled={busy} onClick={approve} className="btn-primary text-sm w-full">
            {busy ? "Saving..." : "Certify result"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Players ---------------- */

function PlayersTab({ players, reload }) {
  const [name, setName] = useState("");
  const [isGuest, setIsGuest] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  async function createPlayer() {
    if (!name) return;
    setBusy(true);
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, isGuest }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return alert(data.error);
    setLastCreated(data);
    setName("");
    reload();
  }

  async function promote(id) {
    await fetch(`/api/players/${id}/promote`, { method: "POST" });
    reload();
  }

  async function toggle(id) {
    await fetch(`/api/players/${id}/toggle`, { method: "POST" });
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-3">
        <h2 className="font-display text-xl text-banana">Add a guest / new player</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm bg-white/5 px-3 rounded-lg">
            <input type="checkbox" checked={isGuest} onChange={(e) => setIsGuest(e.target.checked)} />
            Guest
          </label>
          <button disabled={busy} onClick={createPlayer} className="btn-primary text-sm">
            {busy ? "..." : "Create"}
          </button>
        </div>

        {lastCreated && (
          <div className="bg-banana/10 border border-banana/30 rounded-lg p-3 text-sm">
            Created <strong>{lastCreated.user.username}</strong> — password:{" "}
            <code className="bg-black/40 px-2 py-0.5 rounded">{lastCreated.plainPassword}</code>
            <br />
            <span className="text-white/50 text-xs">Save this now, it won't be shown again.</span>
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-display text-xl text-banana mb-3">All players</h2>
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Avatar username={p.username} size={30} />
                <div>
                  <div className="font-medium">
                    {p.displayName} {p.role === "ADMIN" && <span className="text-blood text-xs">(admin)</span>}
                    {p.isGuest && <span className="text-white/30 text-xs ml-1">(guest)</span>}
                    {!p.isActive && <span className="text-white/30 text-xs ml-1">(inactive)</span>}
                  </div>
                  <div className="text-xs text-white/40">
                    @{p.username} · {p.elo} elo · {p.wins}-{p.losses}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {p.isGuest && (
                  <button onClick={() => promote(p.id)} className="btn-ghost text-xs px-2 py-1">
                    Promote to full player
                  </button>
                )}
                {p.role !== "ADMIN" && (
                  <button onClick={() => toggle(p.id)} className="btn-ghost text-xs px-2 py-1">
                    {p.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
