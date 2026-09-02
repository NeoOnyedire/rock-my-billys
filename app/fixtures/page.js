"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

const WIN_TYPES = [
  { value: "NORMAL", label: "Standard win" },
  { value: "SUNK_8_BALL", label: "Sunk the 8-ball (dominant)" },
  { value: "WHITEWASH", label: "Whitewash (total domination)" },
  { value: "FORFEIT", label: "Forfeit" },
];

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFixtureId, setOpenFixtureId] = useState(null);
  const [winnerId, setWinnerId] = useState(null);
  const [winType, setWinType] = useState("NORMAL");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const [fRes, meRes] = await Promise.all([
      fetch("/api/fixtures?mine=1"),
      fetch("/api/auth/me"),
    ]);
    const fData = await fRes.json();
    const meData = await meRes.json();
    setFixtures(fData.fixtures || []);
    setMe(meData.user);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openSubmit(fixture) {
    setOpenFixtureId(fixture.id);
    setWinnerId(fixture.winnerId || null);
    setWinType(fixture.winType || "NORMAL");
  }

  async function submitResult(fixtureId) {
    if (!winnerId) return alert("Pick who won first.");
    setBusy(true);
    const res = await fetch(`/api/fixtures/${fixtureId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, winType }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return alert(data.error);
    setOpenFixtureId(null);
    load();
  }

  if (loading) return <p className="text-white/50">Loading fixtures...</p>;

  const grouped = fixtures.reduce((acc, f) => {
    const key = f.matchday.name;
    acc[key] = acc[key] || [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-banana">My Fixtures</h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-white/50">No fixtures yet. Wait for the admin to set a matchday.</p>
      )}

      {Object.entries(grouped).map(([matchdayName, list]) => (
        <div key={matchdayName} className="card p-4">
          <h2 className="font-display text-xl text-banana mb-3">{matchdayName}</h2>
          <div className="space-y-3">
            {list.map((f) => {
              const opponent = f.playerA.id === me.id ? f.playerB : f.playerA;
              const iAmA = f.playerA.id === me.id;
              const result =
                f.status === "APPROVED"
                  ? f.winnerId === me.id
                    ? { label: "WIN", color: "text-emerald-400", msg: f.monkeyMessageWinner }
                    : { label: "LOSS", color: "text-blood", msg: f.monkeyMessageLoser }
                  : null;

              return (
                <div key={f.id} className="bg-black/20 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar username={opponent.username} size={32} />
                      <div>
                        <div className="text-sm font-medium">vs {opponent.displayName}</div>
                        <div className="text-xs text-white/40">
                          {opponent.elo} elo {f.status !== "PENDING" && f.winType && `· ${f.winType.replace("_", " ")}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {result && (
                        <span className={`font-display text-lg ${result.color}`}>{result.label}</span>
                      )}
                      {f.status === "PENDING" && (
                        <button onClick={() => openSubmit(f)} className="btn-primary text-xs px-3 py-1.5">
                          Submit result
                        </button>
                      )}
                      {f.status === "SUBMITTED" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-600/30 text-yellow-300">
                          Awaiting admin approval
                        </span>
                      )}
                      {f.status === "APPROVED" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">Certified</span>
                      )}
                    </div>
                  </div>

                  {result?.msg && (
                    <p className="text-xs italic text-white/60 mt-2 border-t border-white/10 pt-2">🐒 "{result.msg}"</p>
                  )}

                  {openFixtureId === f.id && (
                    <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWinnerId(me.id)}
                          className={`flex-1 py-2 rounded-lg text-sm ${winnerId === me.id ? "bg-banana text-jungle-950 font-bold" : "bg-white/5"}`}
                        >
                          I won
                        </button>
                        <button
                          onClick={() => setWinnerId(opponent.id)}
                          className={`flex-1 py-2 rounded-lg text-sm ${winnerId === opponent.id ? "bg-banana text-jungle-950 font-bold" : "bg-white/5"}`}
                        >
                          {opponent.displayName} won
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
                      <div className="flex gap-2">
                        <button disabled={busy} onClick={() => submitResult(f.id)} className="btn-primary flex-1 text-sm">
                          Confirm
                        </button>
                        <button onClick={() => setOpenFixtureId(null)} className="btn-ghost flex-1 text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
