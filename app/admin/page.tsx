"use client";

import { useEffect, useState } from "react";
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
  home_score: number | null;
  away_score: number | null;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

const scoreInputStyle: React.CSSProperties = {
  width: 46, textAlign: "center", padding: "6px 4px",
  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text)", fontSize: "1.05rem", fontWeight: 700,
  fontFamily: "inherit", outline: "none",
};

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { home: string; away: string }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [filterStage, setFilterStage] = useState<string>("all");
  const [status, setStatus] = useState("");

  async function load() {
    const res = await fetch("/api/admin/results");
    if (!res.ok) { setStatus("אין הרשאות מנהל"); return; }
    const data: Match[] = await res.json();
    setMatches(data);
    const draftMap: Record<number, { home: string; away: string }> = {};
    for (const m of data) {
      if (m.home_score !== null) {
        draftMap[m.id] = { home: String(m.home_score), away: String(m.away_score) };
      }
    }
    setDrafts(draftMap);
  }

  useEffect(() => { load(); }, []);

  async function saveResult(matchId: number) {
    const d = drafts[matchId];
    if (!d || d.home === "" || d.away === "") return;
    setSaving((s) => ({ ...s, [matchId]: true }));
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore: Number(d.home), awayScore: Number(d.away) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved((s) => ({ ...s, [matchId]: true }));
        setStatus(`עודכן! ${data.updatedPredictions} ניחושים חושבו מחדש`);
        setTimeout(() => setSaved((s) => ({ ...s, [matchId]: false })), 2500);
        load();
      } else {
        setStatus("שגיאה: " + data.error);
      }
    } finally {
      setSaving((s) => ({ ...s, [matchId]: false }));
    }
  }

  const displayMatches = matches.filter((m) => filterStage === "all" || m.stage === filterStage);

  const byStage: Record<string, Match[]> = {};
  for (const m of displayMatches) {
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }

  const completedCount = matches.filter((m) => m.home_score !== null).length;

  const filterBtnStyle = (active: boolean, danger = false): React.CSSProperties => ({
    padding: "5px 13px", borderRadius: 20, border: "1px solid",
    borderColor: active ? (danger ? "rgba(248,113,113,0.5)" : "var(--green-border)") : "var(--border)",
    background: active ? (danger ? "rgba(248,113,113,0.12)" : "var(--green-dim)") : "transparent",
    color: active ? (danger ? "var(--red)" : "var(--green)") : "var(--muted)",
    cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit",
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "var(--text)", marginBottom: "0.25rem" }}>
          ניהול תוצאות
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          {completedCount} / {matches.length} משחקים הוזנו · רק מנהל יכול לראות דף זה
        </p>
      </div>

      {/* Progress */}
      {matches.length > 0 && (
        <div style={{ background: "var(--surface)", borderRadius: 8, height: 6, marginBottom: "1.5rem", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 8,
            background: "linear-gradient(90deg, #f87171, #ef4444)",
            width: `${Math.round((completedCount / matches.length) * 100)}%`,
          }} />
        </div>
      )}

      {/* Status banner */}
      {status && (
        <div style={{
          background: status.startsWith("שגיאה") ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
          border: `1px solid ${status.startsWith("שגיאה") ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`,
          borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1rem",
          color: status.startsWith("שגיאה") ? "var(--red)" : "var(--green)", fontSize: "0.88rem",
        }}>
          {status}
        </div>
      )}

      {/* Stage filter */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button style={filterBtnStyle(filterStage === "all", true)} onClick={() => setFilterStage("all")}>הכל</button>
        {STAGE_ORDER.map((s) => (
          <button key={s} style={filterBtnStyle(filterStage === s, true)} onClick={() => setFilterStage(s)}>
            {STAGE_LABELS[s as keyof typeof STAGE_LABELS]}
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
              {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {stageMatches.map((m) => {
                const draft = drafts[m.id] || { home: "", away: "" };
                const isSaving = saving[m.id];
                const justSaved = saved[m.id];
                const hasResult = m.home_score !== null;

                return (
                  <div key={m.id} style={{
                    background: "var(--surface)",
                    border: `1px solid ${hasResult ? "rgba(74,222,128,0.2)" : "var(--border)"}`,
                    borderRadius: 12, padding: "0.75rem 1rem",
                    display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
                  }}>
                    {/* Date */}
                    <div style={{ color: "var(--muted)", fontSize: "0.72rem", minWidth: 46 }}>
                      {formatDate(m.match_date)}
                    </div>

                    {/* Home team */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>{m.home_flag}</span>
                      <span style={{ fontSize: "0.87rem", fontWeight: 600 }}>{m.home_team}</span>
                    </div>

                    {/* Score inputs */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                        onClick={() => saveResult(m.id)}
                        disabled={isSaving || draft.home === "" || draft.away === ""}
                        style={{
                          background: justSaved ? "#16a34a" : hasResult ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)",
                          color: justSaved ? "#fff" : hasResult ? "var(--green)" : "var(--red)",
                          border: `1px solid ${hasResult ? "var(--green-border)" : "rgba(248,113,113,0.3)"}`,
                          borderRadius: 8, padding: "6px 13px", fontWeight: 700, cursor: "pointer",
                          fontSize: "0.82rem", fontFamily: "inherit",
                          opacity: draft.home === "" || draft.away === "" ? 0.35 : 1,
                        }}
                      >
                        {justSaved ? "✓" : isSaving ? "..." : hasResult ? "עדכן" : "שמור"}
                      </button>
                    </div>

                    {/* Away team */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.87rem", fontWeight: 600 }}>{m.away_team}</span>
                      <span style={{ fontSize: "1.1rem" }}>{m.away_flag}</span>
                    </div>

                    {/* Result badge */}
                    {hasResult && (
                      <div style={{
                        background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
                        borderRadius: 6, padding: "2px 10px", color: "var(--green)", fontSize: "0.85rem", fontWeight: 700,
                      }}>
                        {m.home_score}:{m.away_score}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
