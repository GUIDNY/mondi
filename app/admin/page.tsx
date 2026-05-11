"use client";

import { useEffect, useState } from "react";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/matches-data";

interface Match {
  id: number; group_name: string | null; stage: string; match_number: number;
  home_team: string; home_flag: string; away_team: string; away_flag: string;
  match_date: string | null; home_score: number | null; away_score: number | null;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

const scoreInput: React.CSSProperties = {
  width: 46, textAlign: "center", padding: "6px 4px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(61,74,64,0.6)",
  borderRadius: 8, color: "var(--on-surface)", fontSize: "1rem", fontWeight: 700,
  fontFamily: "Montserrat,sans-serif", outline: "none",
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
    const dm: Record<number, { home: string; away: string }> = {};
    for (const m of data) {
      if (m.home_score !== null) dm[m.id] = { home: String(m.home_score), away: String(m.away_score ?? "") };
    }
    setDrafts(dm);
  }

  useEffect(() => { load(); }, []);

  async function saveResult(matchId: number) {
    const d = drafts[matchId];
    if (!d || d.home === "" || d.away === "") return;
    setSaving((s) => ({ ...s, [matchId]: true }));
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore: Number(d.home), awayScore: Number(d.away) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved((s) => ({ ...s, [matchId]: true }));
        setStatus(`✓ עודכן בהצלחה — ${data.updatedPredictions} ניחושים חושבו מחדש`);
        setTimeout(() => setSaved((s) => ({ ...s, [matchId]: false })), 2500);
        load();
      } else setStatus("שגיאה: " + data.error);
    } finally { setSaving((s) => ({ ...s, [matchId]: false })); }
  }

  const displayMatches = matches.filter((m) => filterStage === "all" || m.stage === filterStage);
  const byStage: Record<string, Match[]> = {};
  for (const m of displayMatches) {
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }
  const completedCount = matches.filter((m) => m.home_score !== null).length;

  function chipStyle(active: boolean): React.CSSProperties {
    return {
      padding: "5px 13px", borderRadius: 999, border: "1px solid",
      borderColor: active ? "rgba(248,113,113,0.4)" : "rgba(61,74,64,0.5)",
      background: active ? "rgba(248,113,113,0.1)" : "transparent",
      color: active ? "#f87171" : "var(--on-surface-variant)",
      cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit", transition: "all 0.15s",
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
          Admin Panel
        </h1>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.85rem" }}>
          {completedCount} / {matches.length} תוצאות הוזנו · גישת מנהל בלבד
        </p>
      </div>

      {/* Progress */}
      {matches.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 5, marginBottom: "1.5rem", overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "linear-gradient(90deg, #f87171, #ef4444)",
            width: `${Math.round((completedCount / matches.length) * 100)}%`,
            boxShadow: "0 0 10px rgba(248,113,113,0.4)", transition: "width 0.5s",
          }} />
        </div>
      )}

      {/* Status */}
      {status && (
        <div style={{
          background: status.startsWith("✓") ? "rgba(92,222,151,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${status.startsWith("✓") ? "rgba(92,222,151,0.25)" : "rgba(248,113,113,0.25)"}`,
          borderRadius: 12, padding: "0.7rem 1rem", marginBottom: "1rem",
          color: status.startsWith("✓") ? "var(--primary)" : "#f87171", fontSize: "0.85rem",
        }}>
          {status}
        </div>
      )}

      {/* Stage filter */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button style={chipStyle(filterStage === "all")} onClick={() => setFilterStage("all")}>הכל</button>
        {STAGE_ORDER.map((s) => (
          <button key={s} style={chipStyle(filterStage === s)} onClick={() => setFilterStage(s)}>
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
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.75rem",
              color: "var(--on-surface-variant)", marginBottom: "0.65rem",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {stageMatches.map((m) => {
                const draft = drafts[m.id] || { home: "", away: "" };
                const hasResult = m.home_score !== null;
                return (
                  <div key={m.id} className="glass-card" style={{
                    borderRadius: 14, padding: "0.8rem 1.1rem",
                    display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
                    border: hasResult ? "1px solid rgba(92,222,151,0.18)" : "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ color: "var(--on-surface-variant)", fontSize: "0.7rem", minWidth: 44 }}>
                      {formatDate(m.match_date)}
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>{m.home_flag}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{m.home_team}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <input type="number" min={0} max={30}
                        value={draft.home}
                        onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], home: e.target.value } }))}
                        style={scoreInput}
                      />
                      <span style={{ color: "var(--outline-variant)", fontWeight: 700 }}>:</span>
                      <input type="number" min={0} max={30}
                        value={draft.away}
                        onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], away: e.target.value } }))}
                        style={scoreInput}
                      />
                      <button
                        onClick={() => saveResult(m.id)}
                        disabled={saving[m.id] || draft.home === "" || draft.away === ""}
                        style={{
                          background: saved[m.id] ? "rgba(34,197,94,0.85)"
                            : hasResult ? "rgba(92,222,151,0.15)" : "rgba(248,113,113,0.15)",
                          color: saved[m.id] ? "#fff" : hasResult ? "var(--primary)" : "#f87171",
                          border: `1px solid ${hasResult ? "rgba(92,222,151,0.3)" : "rgba(248,113,113,0.3)"}`,
                          borderRadius: 8, padding: "6px 13px", fontWeight: 700, cursor: "pointer",
                          fontFamily: "Montserrat,sans-serif", fontSize: "0.78rem",
                          opacity: draft.home === "" || draft.away === "" ? 0.3 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {saved[m.id] ? "✓" : saving[m.id] ? "..." : hasResult ? "עדכן" : "שמור"}
                      </button>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{m.away_team}</span>
                      <span style={{ fontSize: "1.1rem" }}>{m.away_flag}</span>
                    </div>
                    {hasResult && (
                      <div style={{
                        background: "rgba(92,222,151,0.1)", border: "1px solid rgba(92,222,151,0.22)",
                        borderRadius: 8, padding: "2px 10px", color: "var(--primary)",
                        fontSize: "0.85rem", fontWeight: 700, fontFamily: "Montserrat,sans-serif",
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
