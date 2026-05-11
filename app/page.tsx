import { supabase, DbMatch } from "@/lib/supabase";
import { STAGE_LABELS, STAGE_ORDER, Stage } from "@/lib/matches-data";
import Link from "next/link";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
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

  const total = matches.length;
  const completed = matches.filter((m) => m.home_score !== null).length;

  return (
    <div>

      {/* ── Welcome Banner ── */}
      <section style={{
        position: "relative", borderRadius: 24, overflow: "hidden",
        marginBottom: "2.5rem", height: 280,
        display: "flex", alignItems: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}>
        {/* Background gradient simulating stadium atmosphere */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #0a1f0d 0%, #133520 40%, #1a4a25 70%, #0e2014 100%)",
        }} />
        {/* Green glow orbs */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(92,222,151,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: "40%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,219,60,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Left fade overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, var(--bg) 0%, rgba(14,21,16,0.65) 50%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, padding: "2rem 2.5rem", maxWidth: 580 }}>
          {/* Badge */}
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: 999,
            background: "var(--secondary-container)", color: "var(--on-secondary)",
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: "0.9rem",
          }}>
            Diamond Member
          </span>
          <h1 style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "2.2rem",
            color: "#fff", lineHeight: 1.15, marginBottom: "0.5rem", letterSpacing: "-0.02em",
          }}>
            ברוך הבא,{" "}
            <span style={{ color: "var(--primary)" }}>אלוף</span>
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", marginBottom: "1.75rem", maxWidth: 420 }}>
            מונדיאל 2026 מתקרב — ניחשו תוצאות, צברו נקודות ותנצחו את החברים!
          </p>

          {/* Stats glass cards */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div className="glass-card" style={{ padding: "0.7rem 1.1rem", borderRadius: 16, display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--secondary-container)", fontSize: 20 }}>payments</span>
              <div>
                <div style={{ fontSize: "0.58rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>משחקים</div>
                <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{total}</div>
              </div>
            </div>
            <div className="glass-card" style={{ padding: "0.7rem 1.1rem", borderRadius: 16, display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>trending_up</span>
              <div>
                <div style={{ fontSize: "0.58rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>הסתיימו</div>
                <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{completed}</div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <Link href="/predictions" style={{
              background: "var(--primary)", color: "var(--on-primary-container)",
              fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "0.82rem",
              padding: "10px 22px", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 0 20px rgba(92,222,151,0.3)", letterSpacing: "0.03em",
            }}>
              הכנס ניחושים ←
            </Link>
            <Link href="/leaderboard" style={{
              background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.12)", color: "var(--on-surface)",
              fontWeight: 600, fontSize: "0.82rem",
              padding: "10px 20px", borderRadius: 10, textDecoration: "none",
            }}>
              טבלת דירוג
            </Link>
          </div>
        </div>
      </section>

      {/* ── Scoring legend ── */}
      <div style={{ display: "flex", gap: "1.25rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", color: "var(--on-surface-variant)" }}>
          <span style={{
            background: "var(--primary)", color: "var(--on-primary-container)",
            fontWeight: 800, borderRadius: 6, padding: "2px 9px", fontSize: "0.82rem",
            fontFamily: "Montserrat,sans-serif",
          }}>4</span>
          נקודות לתוצאה מדויקת
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", color: "var(--on-surface-variant)" }}>
          <span style={{
            background: "rgba(96,165,250,0.85)", color: "#0a1832",
            fontWeight: 800, borderRadius: 6, padding: "2px 9px", fontSize: "0.82rem",
            fontFamily: "Montserrat,sans-serif",
          }}>1</span>
          נקודה לכיוון נכון
        </div>
      </div>

      {/* ── Group Stage ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <h2 style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1.15rem",
              color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              שלב הבתים
            </h2>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "0.82rem" }}>
              12 בתים, 48 קבוצות
            </p>
          </div>
          <Link href="/predictions" style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
            נחש עכשיו ←
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "1rem" }}>
          {Object.entries(byGroup).map(([groupName, gMatches]) => (
            <div key={groupName} className="glass-card" style={{ borderRadius: 20, overflow: "hidden" }}>
              {/* Group header */}
              <div style={{
                padding: "0.6rem 1rem",
                background: "linear-gradient(90deg, rgba(92,222,151,0.1) 0%, transparent 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.8rem",
                color: "var(--primary)", letterSpacing: "0.06em",
              }}>
                בית {groupName}
              </div>

              {gMatches.map((m, idx) => (
                <div key={m.id} style={{
                  padding: "0.6rem 1rem",
                  borderBottom: idx < gMatches.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1 }}>
                    <span style={{ fontSize: "1.05rem" }}>{m.home_flag}</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--on-surface)", fontWeight: 500 }}>{m.home_team}</span>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 76 }}>
                    {m.home_score !== null ? (
                      <span style={{
                        background: "rgba(92,222,151,0.12)", borderRadius: 6,
                        padding: "2px 10px", fontWeight: 700, fontSize: "0.9rem", color: "var(--primary)",
                        fontFamily: "Montserrat,sans-serif",
                      }}>
                        {m.home_score} : {m.away_score}
                      </span>
                    ) : (
                      <div>
                        <div style={{ color: "var(--outline-variant)", fontSize: "0.64rem", fontWeight: 600 }}>vs</div>
                        <div style={{ color: "var(--on-surface-variant)", fontSize: "0.62rem" }}>{formatDate(m.match_date)}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--on-surface)", fontWeight: 500 }}>{m.away_team}</span>
                    <span style={{ fontSize: "1.05rem" }}>{m.away_flag}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Knockout Stages ── */}
      {(["r32", "r16", "qf", "sf", "3rd", "final"] as Stage[]).map((stage) => {
        const stageMatches = byStage[stage];
        if (!stageMatches?.length) return null;
        return (
          <div key={stage} style={{ marginBottom: "2rem" }}>
            <h2 style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1.05rem",
              color: "#fff", marginBottom: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {STAGE_LABELS[stage]}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.6rem" }}>
              {stageMatches.map((m) => (
                <div key={m.id} className="glass-card" style={{
                  borderRadius: 14, padding: "0.8rem 1rem",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{m.home_flag}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--on-surface)" }}>{m.home_team}</span>
                  </div>
                  <div style={{ padding: "0 0.5rem", textAlign: "center" }}>
                    {m.home_score !== null ? (
                      <span style={{ fontWeight: 700, color: "var(--primary)", fontFamily: "Montserrat,sans-serif" }}>
                        {m.home_score}:{m.away_score}
                      </span>
                    ) : (
                      <span style={{ color: "var(--on-surface-variant)", fontSize: "0.7rem" }}>
                        {m.home_team === "TBD" ? "ממתין" : formatDate(m.match_date)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--on-surface)" }}>{m.away_team}</span>
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
