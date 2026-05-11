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
        setStatus(`✓ תוצאה נשמרה! עודכנו ${data.updatedPredictions} ניחושים`);
        setTimeout(() => setSaved((s) => ({ ...s, [matchId]: false })), 2500);
        load();
      } else {
        setStatus("שגיאה: " + data.error);
      }
    } finally {
      setSaving((s) => ({ ...s, [matchId]: false }));
    }
  }

  const displayMatches = matches.filter((m) => {
    if (filterStage === "all") return true;
    return m.stage === filterStage;
  });

  const byStage: Record<string, Match[]> = {};
  for (const m of displayMatches) {
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }

  const completedCount = matches.filter((m) => m.home_score !== null).length;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ef4444", marginBottom: "0.25rem" }}>
        ניהול תוצאות
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {completedCount} / {matches.length} משחקים הוזנו · רק מנהל יכול לראות דף זה
      </p>

      {status && (
        <div style={{
          background: status.startsWith("✓") ? "#052e16" : "#450a0a",
          border: `1px solid ${status.startsWith("✓") ? "#16a34a" : "#ef4444"}`,
          borderRadius: "8px", padding: "0.6rem 1rem", marginBottom: "1rem",
          color: status.startsWith("✓") ? "#86efac" : "#fca5a5", fontSize: "0.9rem"
        }}>
          {status}
        </div>
      )}

      {/* Stage filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button onClick={() => setFilterStage("all")} style={{
          padding: "5px 14px", borderRadius: "20px", border: "1px solid",
          borderColor: filterStage === "all" ? "#ef4444" : "#334155",
          background: filterStage === "all" ? "#ef4444" : "transparent",
          color: filterStage === "all" ? "#fff" : "#94a3b8",
          cursor: "pointer", fontSize: "0.85rem"
        }}>הכל</button>
        {STAGE_ORDER.map((s) => (
          <button key={s} onClick={() => setFilterStage(s)} style={{
            padding: "5px 14px", borderRadius: "20px", border: "1px solid",
            borderColor: filterStage === s ? "#ef4444" : "#334155",
            background: filterStage === s ? "#ef4444" : "transparent",
            color: filterStage === s ? "#fff" : "#94a3b8",
            cursor: "pointer", fontSize: "0.85rem"
          }}>{STAGE_LABELS[s as keyof typeof STAGE_LABELS]}</button>
        ))}
      </div>

      {STAGE_ORDER.map((stage) => {
        const stageMatches = byStage[stage];
        if (!stageMatches?.length) return null;
        return (
          <div key={stage} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
              {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {stageMatches.map((m) => {
                const draft = drafts[m.id] || { home: "", away: "" };
                const isSaving = saving[m.id];
                const justSaved = saved[m.id];
                const hasResult = m.home_score !== null;

                return (
                  <div key={m.id} style={{
                    background: "#1e293b", borderRadius: "10px",
                    border: `1px solid ${hasResult ? "#16a34a44" : "#334155"}`,
                    padding: "0.75rem 1rem",
                    display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap"
                  }}>
                    {/* Date */}
                    <div style={{ color: "#475569", fontSize: "0.75rem", minWidth: "50px" }}>
                      {formatDate(m.match_date)}
                    </div>

                    {/* Teams */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{m.home_flag}</span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{m.home_team}</span>
                    </div>

                    {/* Score inputs */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                      <span style={{ color: "#475569" }}>:</span>
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
                        onClick={() => saveResult(m.id)}
                        disabled={isSaving || draft.home === "" || draft.away === ""}
                        style={{
                          background: justSaved ? "#16a34a" : hasResult ? "#7c3aed" : "#ef4444",
                          color: "#fff", border: "none", borderRadius: "6px",
                          padding: "6px 14px", fontWeight: 700, cursor: "pointer",
                          fontSize: "0.85rem", opacity: (draft.home === "" || draft.away === "") ? 0.4 : 1
                        }}
                      >
                        {justSaved ? "✓" : isSaving ? "..." : hasResult ? "עדכן" : "שמור"}
                      </button>
                    </div>

                    {/* Away team */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{m.away_team}</span>
                      <span>{m.away_flag}</span>
                    </div>

                    {/* Current result badge */}
                    {hasResult && (
                      <div style={{
                        background: "#052e16", border: "1px solid #16a34a", borderRadius: "6px",
                        padding: "2px 10px", color: "#86efac", fontSize: "0.85rem", fontWeight: 700
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
