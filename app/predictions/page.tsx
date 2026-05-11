"use client";

import { useEffect, useState, useCallback } from "react";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/matches-data";

interface Match {
  id: number;
  group_name: string | null;
  stage: string;
  match_number: number;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  match_date: string | null;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
}

interface Prediction {
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "long", weekday: "short" });
}

function isLocked(match: Match) {
  if (match.home_score !== null) return true;
  if (!match.match_date) return false;
  return new Date(match.match_date) <= new Date();
}

function pointsBadge(pts: number | null | undefined) {
  if (pts === 4) return { text: "✓✓ 4 נק׳", bg: "rgba(92,222,151,0.15)", color: "var(--primary)", border: "rgba(92,222,151,0.25)" };
  if (pts === 1) return { text: "✓ 1 נק׳", bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.25)" };
  if (pts === 0) return { text: "✗ 0 נק׳", bg: "rgba(248,113,113,0.1)", color: "#f87171", border: "rgba(248,113,113,0.25)" };
  return null;
}

const scoreInput: React.CSSProperties = {
  width: 46, textAlign: "center", padding: "6px 4px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(61,74,64,0.6)",
  borderRadius: 8, color: "var(--on-surface)", fontSize: "1rem", fontWeight: 700,
  fontFamily: "Montserrat,sans-serif", outline: "none",
};

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [drafts, setDrafts] = useState<Record<number, { home: string; away: string }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const load = useCallback(async () => {
    const [mRes, pRes] = await Promise.all([fetch("/api/matches"), fetch("/api/predictions")]);
    const mData: Match[] = await mRes.json();
    const pData: Prediction[] = await pRes.json();
    setMatches(mData);
    const predMap: Record<number, Prediction> = {};
    const draftMap: Record<number, { home: string; away: string }> = {};
    for (const p of pData) {
      predMap[p.match_id] = p;
      draftMap[p.match_id] = { home: String(p.home_score), away: String(p.away_score) };
    }
    setPredictions(predMap);
    setDrafts(draftMap);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(matchId: number) {
    const d = drafts[matchId];
    if (!d || d.home === "" || d.away === "") return;
    setSaving((s) => ({ ...s, [matchId]: true }));
    try {
      const res = await fetch("/api/predictions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore: Number(d.home), awayScore: Number(d.away) }),
      });
      if (res.ok) {
        setSaved((s) => ({ ...s, [matchId]: true }));
        setTimeout(() => setSaved((s) => ({ ...s, [matchId]: false })), 2000);
        load();
      }
    } finally { setSaving((s) => ({ ...s, [matchId]: false })); }
  }

  const groupMatches = matches.filter((m) => m.stage === "group");
  const groups = [...new Set(groupMatches.map((m) => m.group_name).filter(Boolean))] as string[];

  const displayMatches = matches.filter((m) => {
    if (m.home_team === "TBD") return false;
    if (filter === "pending" && predictions[m.id]) return false;
    if (filter === "done" && !predictions[m.id]) return false;
    if (activeGroup !== "all" && m.stage === "group" && m.group_name !== activeGroup) return false;
    if (activeGroup !== "all" && m.stage !== "group") return false;
    return true;
  });

  const byStage: Record<string, Match[]> = {};
  for (const m of displayMatches) {
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }

  const totalPredicted = Object.keys(predictions).length;
  const totalAvailable =
    matches.filter((m) => m.home_team !== "TBD" && !isLocked(m)).length + Object.keys(predictions).length;

  function chipStyle(active: boolean, variant: "green" | "blue" = "green"): React.CSSProperties {
    const c = variant === "green" ? "rgba(92,222,151" : "rgba(96,165,250";
    return {
      padding: "5px 14px", borderRadius: 999, border: "1px solid",
      borderColor: active ? `${c},0.4)` : "rgba(61,74,64,0.5)",
      background: active ? `${c},0.12)` : "transparent",
      color: active ? (variant === "green" ? "var(--primary)" : "#60a5fa") : "var(--on-surface-variant)",
      cursor: "pointer", fontSize: "0.78rem", fontWeight: active ? 600 : 400,
      fontFamily: "inherit", transition: "all 0.15s",
    };
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem",
          color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "0.3rem",
        }}>
          My Bets
        </h1>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.85rem" }}>
          ניחשת {totalPredicted} מתוך {totalAvailable} משחקים אפשריים
        </p>
      </div>

      {/* Progress */}
      {totalAvailable > 0 && (
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 5, marginBottom: "1.5rem", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 8,
            background: "linear-gradient(90deg, var(--primary), #22c55e)",
            width: `${Math.round((totalPredicted / totalAvailable) * 100)}%`,
            boxShadow: "0 0 10px rgba(92,222,151,0.4)",
            transition: "width 0.5s",
          }} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
        <button style={chipStyle(filter === "all")} onClick={() => setFilter("all")}>הכל</button>
        <button style={chipStyle(filter === "pending")} onClick={() => setFilter("pending")}>חסרים</button>
        <button style={chipStyle(filter === "done")} onClick={() => setFilter("done")}>הושלמו</button>
        <div style={{ width: 1, height: 18, background: "rgba(61,74,64,0.5)", margin: "0 0.15rem" }} />
        <button style={chipStyle(activeGroup === "all", "blue")} onClick={() => setActiveGroup("all")}>כל הבתים</button>
        {groups.map((g) => (
          <button key={g} style={chipStyle(activeGroup === g, "blue")} onClick={() => setActiveGroup(g)}>
            בית {g}
          </button>
        ))}
      </div>

      {/* Match list */}
      {STAGE_ORDER.map((stage) => {
        const stageMatches = byStage[stage];
        if (!stageMatches?.length) return null;
        return (
          <div key={stage} style={{ marginBottom: "2rem" }}>
            <h2 style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.75rem",
              color: "var(--on-surface-variant)", marginBottom: "0.65rem",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              {STAGE_LABELS[stage]}
              {stage === "group" && activeGroup !== "all" && ` — בית ${activeGroup}`}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {stageMatches.map((m) => {
                const pred = predictions[m.id];
                const draft = drafts[m.id] || { home: "", away: "" };
                const locked = isLocked(m);
                const badge = pred ? pointsBadge(pred.points) : null;

                return (
                  <div key={m.id} className="glass-card" style={{
                    borderRadius: 16, padding: "0.85rem 1.1rem",
                    display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
                    border: pred
                      ? "1px solid rgba(92,222,151,0.18)"
                      : "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {/* Home team */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: 110 }}>
                      <span style={{ fontSize: "1.15rem" }}>{m.home_flag}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--on-surface)" }}>{m.home_team}</span>
                    </div>

                    {/* Score area */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {locked ? (
                        <div>
                          {m.home_score !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                              <span style={{ fontWeight: 600, color: "var(--on-surface-variant)", fontSize: "0.85rem", fontFamily: "Montserrat,sans-serif" }}>
                                {pred ? `${pred.home_score}:${pred.away_score}` : "—"}
                              </span>
                              <span style={{ color: "var(--outline-variant)" }}>→</span>
                              <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9rem", fontFamily: "Montserrat,sans-serif" }}>
                                {m.home_score}:{m.away_score}
                              </span>
                              {badge && (
                                <span style={{
                                  fontWeight: 700, fontSize: "0.75rem", borderRadius: 8,
                                  padding: "2px 9px", background: badge.bg, color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                }}>
                                  {badge.text}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "var(--on-surface-variant)", fontSize: "0.78rem" }}>
                              {pred ? `ניחוש: ${pred.home_score}:${pred.away_score} (נעול)` : "נעול"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          <input type="number" min={0} max={30}
                            value={draft.home}
                            onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))}
                            style={scoreInput}
                          />
                          <span style={{ color: "var(--outline-variant)", fontWeight: 700, fontSize: "1.1rem" }}>:</span>
                          <input type="number" min={0} max={30}
                            value={draft.away}
                            onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))}
                            style={scoreInput}
                          />
                          <button
                            onClick={() => save(m.id)}
                            disabled={saving[m.id] || draft.home === "" || draft.away === ""}
                            style={{
                              background: saved[m.id] ? "rgba(34,197,94,0.85)" : "var(--primary)",
                              color: "var(--on-primary-container)", border: "none", borderRadius: 8,
                              padding: "7px 14px", fontWeight: 700, cursor: "pointer",
                              fontFamily: "Montserrat,sans-serif", fontSize: "0.78rem",
                              opacity: draft.home === "" || draft.away === "" ? 0.35 : 1,
                              boxShadow: "0 0 12px rgba(92,222,151,0.2)",
                              transition: "all 0.15s",
                            }}
                          >
                            {saved[m.id] ? "✓ נשמר" : saving[m.id] ? "..." : "שמור"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Away team */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end", minWidth: 110 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--on-surface)" }}>{m.away_team}</span>
                      <span style={{ fontSize: "1.15rem" }}>{m.away_flag}</span>
                    </div>

                    {/* Date row */}
                    {!locked && (
                      <div style={{ width: "100%", color: "var(--on-surface-variant)", fontSize: "0.68rem", marginTop: "2px" }}>
                        {formatDate(m.match_date)}{m.venue ? ` · ${m.venue}` : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Extra stages not in STAGE_ORDER (e.g. SA demo, other leagues) */}
      {Object.keys(byStage)
        .filter((s) => !(STAGE_ORDER as string[]).includes(s))
        .map((stage) => {
          const stageMatches = byStage[stage];
          if (!stageMatches?.length) return null;
          const label = stageMatches[0]?.group_name ?? stage;
          return (
            <div key={stage} style={{ marginBottom: "2rem" }}>
              <h2 style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.75rem",
                color: "var(--on-surface-variant)", marginBottom: "0.65rem",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                {label}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {stageMatches.map((m) => {
                  const pred = predictions[m.id];
                  const draft = drafts[m.id] || { home: "", away: "" };
                  const locked = isLocked(m);
                  const badge = pred ? pointsBadge(pred.points) : null;
                  return (
                    <div key={m.id} className="glass-card" style={{
                      borderRadius: 16, padding: "0.85rem 1.1rem",
                      display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
                      border: pred ? "1px solid rgba(92,222,151,0.18)" : "1px solid rgba(255,255,255,0.07)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: 110 }}>
                        <span style={{ fontSize: "1.15rem" }}>{m.home_flag}</span>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--on-surface)" }}>{m.home_team}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {locked ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {m.home_score !== null ? (
                              <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>
                                {m.home_score} : {m.away_score}
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>נעול</span>
                            )}
                            {badge && (
                              <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 6, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontWeight: 600 }}>
                                {badge.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <input type="number" min={0} max={30} style={scoreInput}
                              value={draft.home} placeholder="0"
                              onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))} />
                            <span style={{ color: "var(--on-surface-variant)", fontWeight: 700 }}>:</span>
                            <input type="number" min={0} max={30} style={scoreInput}
                              value={draft.away} placeholder="0"
                              onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))} />
                            <button onClick={() => save(m.id)} disabled={saving[m.id] || draft.home === "" || draft.away === ""}
                              style={{
                                background: "var(--primary)", color: "var(--on-primary-container)",
                                border: "none", borderRadius: 8, padding: "6px 14px", fontFamily: "Rubik,sans-serif",
                                fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                                opacity: (draft.home === "" || draft.away === "") ? 0.4 : 1,
                              }}>
                              {saved[m.id] ? "✓" : saving[m.id] ? "..." : "שמור"}
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end", minWidth: 110 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--on-surface)" }}>{m.away_team}</span>
                        <span style={{ fontSize: "1.15rem" }}>{m.away_flag}</span>
                      </div>
                      {!locked && (
                        <div style={{ width: "100%", color: "var(--on-surface-variant)", fontSize: "0.68rem", marginTop: "2px" }}>
                          {formatDate(m.match_date)}{m.venue ? ` · ${m.venue}` : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {displayMatches.length === 0 && (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem", borderRadius: 20, color: "var(--on-surface-variant)" }}>
          אין משחקים להציג עם הסינון הנוכחי
        </div>
      )}
    </div>
  );
}
