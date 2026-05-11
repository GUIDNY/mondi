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

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [drafts, setDrafts] = useState<Record<number, { home: string; away: string }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const load = useCallback(async () => {
    const [mRes, pRes] = await Promise.all([
      fetch("/api/matches"),
      fetch("/api/predictions"),
    ]);
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
  const totalAvailable = matches.filter((m) => m.home_team !== "TBD" && !isLocked(m)).length + Object.keys(predictions).length;

  function pointsColor(pts: number | null | undefined) {
    if (pts === 4) return "#f59e0b";
    if (pts === 1) return "#60a5fa";
    if (pts === 0) return "#ef4444";
    return "#94a3b8";
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f59e0b", marginBottom: "0.5rem" }}>
        הניחושים שלי
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        ניחשת {totalPredicted} משחקים מתוך {totalAvailable} אפשריים
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {(["all", "pending", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: "20px", border: "1px solid",
            borderColor: filter === f ? "#f59e0b" : "#334155",
            background: filter === f ? "#f59e0b" : "transparent",
            color: filter === f ? "#0f172a" : "#94a3b8",
            cursor: "pointer", fontSize: "0.85rem", fontWeight: 600
          }}>
            {f === "all" ? "הכל" : f === "pending" ? "חסרים" : "הושלמו"}
          </button>
        ))}
        <div style={{ width: "1px", background: "#334155" }} />
        <button onClick={() => setActiveGroup("all")} style={{
          padding: "5px 14px", borderRadius: "20px", border: "1px solid",
          borderColor: activeGroup === "all" ? "#60a5fa" : "#334155",
          background: activeGroup === "all" ? "#1d4ed8" : "transparent",
          color: activeGroup === "all" ? "#fff" : "#94a3b8",
          cursor: "pointer", fontSize: "0.85rem"
        }}>כל הבתים</button>
        {groups.map((g) => (
          <button key={g} onClick={() => setActiveGroup(g)} style={{
            padding: "5px 12px", borderRadius: "20px", border: "1px solid",
            borderColor: activeGroup === g ? "#60a5fa" : "#334155",
            background: activeGroup === g ? "#1d4ed8" : "transparent",
            color: activeGroup === g ? "#fff" : "#94a3b8",
            cursor: "pointer", fontSize: "0.85rem"
          }}>בית {g}</button>
        ))}
      </div>

      {/* Match list by stage */}
      {STAGE_ORDER.map((stage) => {
        const stageMatches = byStage[stage];
        if (!stageMatches?.length) return null;
        return (
          <div key={stage} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {STAGE_LABELS[stage]}
              {stage === "group" && activeGroup !== "all" && ` — בית ${activeGroup}`}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {stageMatches.map((m) => {
                const pred = predictions[m.id];
                const draft = drafts[m.id] || { home: "", away: "" };
                const locked = isLocked(m);
                const isSaving = saving[m.id];
                const justSaved = saved[m.id];

                return (
                  <div key={m.id} style={{
                    background: "#1e293b", borderRadius: "12px",
                    border: `1px solid ${pred ? "#1d4ed8" : "#334155"}`,
                    padding: "0.75rem 1rem",
                    display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap"
                  }}>
                    {/* Home team */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: "120px" }}>
                      <span style={{ fontSize: "1.2rem" }}>{m.home_flag}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.home_team}</span>
                    </div>

                    {/* Score input or result */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {locked ? (
                        <div style={{ textAlign: "center" }}>
                          {m.home_score !== null && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontWeight: 700, color: "#94a3b8" }}>
                                {pred ? `${pred.home_score}:${pred.away_score}` : "—"}
                              </span>
                              <span style={{ color: "#475569" }}>→</span>
                              <span style={{ fontWeight: 700, color: "#f59e0b" }}>
                                {m.home_score}:{m.away_score}
                              </span>
                              {pred && (
                                <span style={{
                                  fontWeight: 800, fontSize: "1rem",
                                  color: pointsColor(pred.points),
                                  marginRight: "4px"
                                }}>
                                  {pred.points === 4 ? "✓✓" : pred.points === 1 ? "✓" : "✗"} {pred.points}pt
                                </span>
                              )}
                            </div>
                          )}
                          {m.home_score === null && (
                            <span style={{ color: "#475569", fontSize: "0.8rem" }}>
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
                            style={{
                              width: "48px", textAlign: "center", padding: "6px",
                              background: "#0f172a", border: "1px solid #475569",
                              borderRadius: "6px", color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700
                            }}
                          />
                          <span style={{ color: "#475569", fontWeight: 700 }}>:</span>
                          <input
                            type="number" min={0} max={30}
                            value={draft.away}
                            onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))}
                            style={{
                              width: "48px", textAlign: "center", padding: "6px",
                              background: "#0f172a", border: "1px solid #475569",
                              borderRadius: "6px", color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700
                            }}
                          />
                          <button
                            onClick={() => save(m.id)}
                            disabled={isSaving || draft.home === "" || draft.away === ""}
                            style={{
                              background: justSaved ? "#16a34a" : "#f59e0b",
                              color: "#0f172a", border: "none", borderRadius: "6px",
                              padding: "6px 14px", fontWeight: 700, cursor: "pointer",
                              fontSize: "0.85rem", opacity: (draft.home === "" || draft.away === "") ? 0.5 : 1
                            }}
                          >
                            {justSaved ? "✓ נשמר" : isSaving ? "..." : "שמור"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Away team */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end", minWidth: "120px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.away_team}</span>
                      <span style={{ fontSize: "1.2rem" }}>{m.away_flag}</span>
                    </div>

                    {/* Date */}
                    {!locked && (
                      <div style={{ width: "100%", color: "#64748b", fontSize: "0.72rem", marginTop: "2px" }}>
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
        <div style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>
          אין משחקים להציג עם הסינון הנוכחי
        </div>
      )}
    </div>
  );
}
