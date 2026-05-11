import { supabase, DbMatch } from "@/lib/supabase";
import { STAGE_LABELS, STAGE_ORDER, Stage } from "@/lib/matches-data";
import Link from "next/link";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "long", weekday: "short" });
}

export default async function Home() {
  const { data: matchesRaw } = await supabase.from("matches").select("*").order("match_number");
  const matches = (matchesRaw || []) as DbMatch[];

  const byStage = STAGE_ORDER.reduce<Record<string, DbMatch[]>>((acc, stage) => {
    acc[stage] = matches.filter((m) => m.stage === stage);
    return acc;
  }, {});

  const byGroup: Record<string, DbMatch[]> = {};
  for (const m of byStage.group || []) {
    const g = m.group_name || "?";
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(m);
  }

  const completedMatches = matches.filter((m) => m.home_score !== null).length;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f59e0b", marginBottom: "0.5rem" }}>
          🏆 מונדיאל 2026
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "1rem" }}>
          ניחשו תוצאות, צברו נקודות, תנצחו את החברים!
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "0.75rem 1.5rem", border: "1px solid #334155" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f59e0b" }}>{matches.length}</div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>משחקים סך הכל</div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "0.75rem 1.5rem", border: "1px solid #334155" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#22c55e" }}>{completedMatches}</div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>משחקים הסתיימו</div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "0.75rem 1.5rem", border: "1px solid #334155" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#60a5fa" }}>48</div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>קבוצות</div>
          </div>
        </div>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/predictions" style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontWeight: 700, borderRadius: "8px", padding: "10px 24px", textDecoration: "none", fontSize: "1rem" }}>
            הכנס ניחושים →
          </Link>
          <Link href="/leaderboard" style={{ border: "1px solid #f59e0b", color: "#f59e0b", borderRadius: "8px", padding: "10px 24px", textDecoration: "none", fontSize: "1rem" }}>
            טבלת דירוג
          </Link>
        </div>
        <div style={{ background: "#1e293b", borderRadius: "10px", padding: "1rem", marginTop: "1.5rem", border: "1px solid #334155", display: "inline-flex", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>4</div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>נקודות לתוצאה מדויקת</div>
          </div>
          <div style={{ color: "#334155", fontSize: "1.5rem" }}>|</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#60a5fa" }}>1</div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>נקודה לכיוון נכון</div>
          </div>
        </div>
      </div>

      {/* Group Stage */}
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginBottom: "1rem" }}>שלב הבתים</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {Object.entries(byGroup).map(([groupName, gMatches]) => (
          <div key={groupName} style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
            <div style={{ background: "#0f172a", padding: "0.6rem 1rem", fontWeight: 700, color: "#f59e0b", fontSize: "0.95rem" }}>
              בית {groupName}
            </div>
            {gMatches.map((m) => (
              <div key={m.id} style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1 }}>
                  <span>{m.home_flag}</span>
                  <span style={{ fontSize: "0.82rem", color: "#e2e8f0" }}>{m.home_team}</span>
                </div>
                <div style={{ textAlign: "center", minWidth: "80px" }}>
                  {m.home_score !== null ? (
                    <span style={{ background: "#0f172a", borderRadius: "6px", padding: "2px 10px", fontWeight: 700, fontSize: "1rem", color: "#f59e0b" }}>
                      {m.home_score} : {m.away_score}
                    </span>
                  ) : (
                    <div>
                      <div style={{ color: "#475569", fontSize: "0.7rem" }}>vs</div>
                      <div style={{ color: "#64748b", fontSize: "0.68rem" }}>{formatDate(m.match_date)}</div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "0.82rem", color: "#e2e8f0" }}>{m.away_team}</span>
                  <span>{m.away_flag}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Knockout Stages */}
      {(["r32", "r16", "qf", "sf", "3rd", "final"] as Stage[]).map((stage) => {
        const stageMatches = byStage[stage];
        if (!stageMatches?.length) return null;
        return (
          <div key={stage} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginBottom: "1rem" }}>{STAGE_LABELS[stage]}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0.75rem" }}>
              {stageMatches.map((m) => (
                <div key={m.id} style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid #334155", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span>{m.home_flag}</span>
                    <span style={{ fontSize: "0.88rem" }}>{m.home_team}</span>
                  </div>
                  <div style={{ textAlign: "center", padding: "0 0.5rem" }}>
                    {m.home_score !== null ? (
                      <span style={{ fontWeight: 700, color: "#f59e0b" }}>{m.home_score}:{m.away_score}</span>
                    ) : (
                      <span style={{ color: "#475569", fontSize: "0.75rem" }}>{formatDate(m.match_date)}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.88rem" }}>{m.away_team}</span>
                    <span>{m.away_flag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
