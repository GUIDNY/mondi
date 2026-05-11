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
  if (pts === 4) return { text: "✓✓ 4", bg: "rgba(74,222,128,0.15)", color: "#4ade80" };
  if (pts === 1) return { text: "✓ 1", bg: "rgba(96,165,250,0.15)", color: "#60a5fa" };
  if (pts === 0) return { text: "✗ 0", bg: "rgba(248,113,113,0.15)", color: "#f87171" };
  return null;
}

const scoreInputStyle: React.CSSProperties = {
  width: 46, textAlign: "center", padding: "6px 4px",
  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text)", fontSize: "1.05rem", fontWeight: 700,
  fontFamily: "inherit", outline: "none",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore: Number(d.home), awayScore: Number(d.away) }),
      });
      if (res.ok) {
        setSaved((s) => ({ ...s, [matchId]: true }));
        setTimeout(() => setSaved((s) => ({ ...s, [matchId]: false })), 2000);
        load();
      }
    } finally {
      setSaving((s) => ({ ...s, [matchId]: false }));
    }
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

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 14px", borderRadius: 20, border: "1px solid",
    borderColor: active ? "var(--green)" : "var(--border)",
    background: active ? "var(--green-dim)" : "transparent",
    color: active ? "var(--green)" : "var(--muted)",
    cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400,
    fontFamily: "inherit",
  });

  const groupBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 20, border: "1px solid",
    borderColor: active ? "rgba(96,165,250,0.5)" : "var(--border)",
    background: active ? "rgba(96,165,250,0.12)" : "transparent",
    color: active ? "#60a5fa" : "var(--muted)",
    cursor: "pointer", fontSize: "0.82rem",
    fontFamily: "inherit",
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "var(--text)", marginBottom: "0.25rem" }}>
          הניחושים שלי
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          ניחשת {totalPredicted} משחקים מתוך {totalAvailable} אפשריים
        </p>
      </div>

      {/* Progress bar */}
      {totalAvailable > 0 && (
        <div style={{ background: "var(--surface)", borderRadius: 8, height: 6, marginBottom: "1.5rem", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 8,
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            width: `${Math.round((totalPredicted / totalAvailable) * 100)}%`,
            transition: "width 0.4s",
          }} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
        <button style={filterBtnStyle(filter === "all")} onClick={() => setFilter("all")}>הכל</button>
        <button style={filterBtnStyle(filter === "pending")} onClick={() => setFilter("pending")}>חסרים</button>
        <button style={filterBtnStyle(filter === "done")} onClick={() => setFilter("done")}>הושלמו</button>
        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 0.25rem" }} />
        <button style={groupBtnStyle(activeGroup === "all")} onClick={() => setActiveGroup("all")}>כל הבתים</button>
        {groups.map((g) => (
          <button key={g} style={groupBtnStyle(activeGroup === g)} onClick={() => setActiveGroup(g)}>
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
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.82rem",
              color: "var(--muted)", marginBottom: "0.65rem",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              {STAGE_LABELS[stage]}
              {stage === "group" && activeGroup !== "all" && ` — בית ${activeGroup}`}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {stageMatches.map((m) => {
                const pred = predictions[m.id];
                const draft = drafts[m.id] || { home: "", away: "" };
                const locked = isLocked(m);
                const isSaving = saving[m.id];
                const justSaved = saved[m.id];
                const badge = pred ? pointsBadge(pred.points) : null;

                return (
                  <div key={m.id} style={{
                    background: "var(--surface)",
                    border: `1px solid ${pred ? "var(--green-border)" : "var(--border)"}`,
                    borderRadius: 12, padding: "0.75rem 1rem",
                    display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
                  }}>
                    {/* Home */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: 110 }}>
                      <span style={{ fontSize: "1.2rem" }}>{m.home_flag}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.87rem" }}>{m.home_team}</span>
                    </div>

                    {/* Score area */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {locked ? (
                        <div style={{ textAlign: "center" }}>
                          {m.home_score !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                              <span style={{ fontWeight: 700, color: "var(--muted)", fontSize: "0.9rem" }}>
                                {pred ? `${pred.home_score}:${pred.away_score}` : "—"}
                              </span>
                              <span style={{ color: "var(--border)" }}>→</span>
                              <span style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.9rem" }}>
                                {m.home_score}:{m.away_score}
                              </span>
                              {badge && (
                                <span style={{
                                  fontWeight: 700, fontSize: "0.8rem", borderRadius: 6,
                                  padding: "2px 8px", background: badge.bg, color: badge.color,
                                }}>
                                  {badge.text}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                              {pred ? `ניחוש: ${pred.home_score}:${pred.away_score} (נעול)` : "נעול"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          <input
                            type="number" min={0} max={30}
                            value={draft.home}
                            onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))}
                            style={scoreInputStyle}
                          />
                          <span style={{ color: "var(--muted)", fontWeight: 700 }}>:</span>
                          <input
                            type="number" min={0} max={30}
                            value={draft.away}
                            onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))}
                            style={scoreInputStyle}
                          />
                          <button
                            onClick={() => save(m.id)}
                            disabled={isSaving || draft.home === "" || draft.away === ""}
                            style={{
                              background: justSaved ? "#16a34a" : "var(--green)",
                              color: "#0d1a10", border: "none", borderRadius: 8,
                              padding: "6px 14px", fontWeight: 700, cursor: "pointer",
                              fontSize: "0.82rem", fontFamily: "inherit",
                              opacity: draft.home === "" || draft.away === "" ? 0.45 : 1,
                            }}
                          >
                            {justSaved ? "✓ נשמר" : isSaving ? "..." : "שמור"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Away */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end", minWidth: 110 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.87rem" }}>{m.away_team}</span>
                      <span style={{ fontSize: "1.2rem" }}>{m.away_flag}</span>
                    </div>

                    {/* Date */}
                    {!locked && (
                      <div style={{ width: "100%", color: "var(--muted)", fontSize: "0.7rem", marginTop: "1px" }}>
                        {formatDate(m.match_date)} · {m.venue}
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
        <div style={{
          textAlign: "center", padding: "3rem", color: "var(--muted)",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
        }}>
          אין משחקים להציג עם הסינון הנוכחי
        </div>
      )}
    </div>
  );
}
