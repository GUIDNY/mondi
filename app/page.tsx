import { supabase, DbMatch } from "@/lib/supabase";
import { STAGE_LABELS, STAGE_ORDER, Stage } from "@/lib/matches-data";
import Link from "next/link";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

const S: React.CSSProperties = {};
void S;

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

  const total = matches.length;
  const completed = matches.filter((m) => m.home_score !== null).length;

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e2e20 0%, #0d1a10 100%)",
        border: "1px solid var(--green-border)",
        borderRadius: 20,
        padding: "2rem 1.75rem",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, left: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.6rem" }}>🏆</span>
          <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "var(--text)", margin: 0 }}>
            מונדיאל 2026
          </h1>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          ניחשו תוצאות, צברו נקודות, תנצחו את החברים!
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {[
            { val: total, label: "משחקים סה״כ", color: "var(--text)" },
            { val: completed, label: "הסתיימו", color: "var(--green)" },
            { val: total - completed, label: "קרובים", color: "var(--yellow)" },
            { val: 48, label: "קבוצות", color: "var(--blue)" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "0.75rem 1.25rem", minWidth: 90,
            }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color, fontFamily: "Montserrat,sans-serif" }}>{val}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scoring legend */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
            <span style={{ background: "var(--green)", color: "#0d1a10", fontWeight: 800, borderRadius: 6, padding: "1px 8px", fontSize: "0.85rem" }}>4</span>
            <span style={{ color: "var(--muted)" }}>נקודות לתוצאה מדויקת</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
            <span style={{ background: "var(--blue)", color: "#0d1a10", fontWeight: 800, borderRadius: 6, padding: "1px 8px", fontSize: "0.85rem" }}>1</span>
            <span style={{ color: "var(--muted)" }}>נקודה לכיוון נכון</span>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/predictions" style={{
            background: "var(--green)", color: "#0d1a10", fontWeight: 700,
            borderRadius: 10, padding: "10px 22px", textDecoration: "none", fontSize: "0.9rem",
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
          }}>
            הכנס ניחושים ←
          </Link>
          <Link href="/leaderboard" style={{
            border: "1px solid var(--green-border)", color: "var(--green)",
            borderRadius: 10, padding: "10px 22px", textDecoration: "none", fontSize: "0.9rem",
          }}>
            טבלת דירוג
          </Link>
        </div>
      </div>

      {/* Group Stage */}
      <h2 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--muted)", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        שלב הבתים
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {Object.entries(byGroup).map(([groupName, gMatches]) => (
          <div key={groupName} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{
              background: "linear-gradient(90deg, rgba(74,222,128,0.12) 0%, transparent 100%)",
              padding: "0.55rem 1rem",
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.85rem",
              color: "var(--green)", borderBottom: "1px solid var(--border)",
            }}>
              בית {groupName}
            </div>
            {gMatches.map((m) => (
              <div key={m.id} style={{
                padding: "0.6rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1 }}>
                  <span style={{ fontSize: "1.1rem" }}>{m.home_flag}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text)" }}>{m.home_team}</span>
                </div>
                <div style={{ textAlign: "center", minWidth: "80px" }}>
                  {m.home_score !== null ? (
                    <span style={{
                      background: "rgba(74,222,128,0.15)", borderRadius: 6,
                      padding: "2px 10px", fontWeight: 700, fontSize: "0.95rem", color: "var(--green)",
                    }}>
                      {m.home_score} : {m.away_score}
                    </span>
                  ) : (
                    <div>
                      <div style={{ color: "var(--muted)", fontSize: "0.68rem" }}>vs</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.65rem" }}>{formatDate(m.match_date)}</div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text)" }}>{m.away_team}</span>
                  <span style={{ fontSize: "1.1rem" }}>{m.away_flag}</span>
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
            <h2 style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1.1rem",
              color: "var(--muted)", marginBottom: "0.75rem",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              {STAGE_LABELS[stage]}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.6rem" }}>
              {stageMatches.map((m) => (
                <div key={m.id} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "0.75rem 1rem",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{m.home_flag}</span>
                    <span style={{ fontSize: "0.82rem" }}>{m.home_team}</span>
                  </div>
                  <div style={{ padding: "0 0.5rem", textAlign: "center" }}>
                    {m.home_score !== null ? (
                      <span style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.95rem" }}>
                        {m.home_score}:{m.away_score}
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                        {m.home_team === "TBD" ? "ממתין" : formatDate(m.match_date)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.82rem" }}>{m.away_team}</span>
                    <span style={{ fontSize: "1.1rem" }}>{m.away_flag}</span>
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
