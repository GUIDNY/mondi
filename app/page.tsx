import { supabase, DbMatch } from "@/lib/supabase";
import { STAGE_LABELS, STAGE_ORDER, Stage } from "@/lib/matches-data";
import Link from "next/link";
import LiveMatches from "@/components/LiveMatches";

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
        marginBottom: "2.5rem",
        display: "flex", alignItems: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,50,0.15)",
        minHeight: 300,
      }}>
        {/* Rich dark background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(145deg, #061209 0%, #0e2416 35%, #162e1c 65%, #0a1a0e 100%)",
        }} />
        {/* Gold glow top-right */}
        <div style={{
          position: "absolute", top: -80, left: -60,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,214,50,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Green glow bottom */}
        <div style={{
          position: "absolute", bottom: -60, left: "25%",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(92,222,151,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Gold border top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, #f0b429, #ffe066, #f0b429, transparent)",
        }} />
        {/* Logo watermark */}
        <img src="/mondi-logo.svg" alt="" aria-hidden style={{
          position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
          width: 260, height: 260, opacity: 0.07, pointerEvents: "none",
          filter: "saturate(0) brightness(3)",
        }} />
        {/* RTL fade overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to left, #061209 0%, rgba(6,18,9,0.82) 40%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, padding: "2.25rem 2.5rem", maxWidth: 580, marginRight: "auto" }}>
          {/* Diamond badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.35rem",
            padding: "4px 14px", borderRadius: 999,
            background: "linear-gradient(90deg, rgba(240,180,41,0.2), rgba(255,224,102,0.15))",
            border: "1px solid rgba(240,180,41,0.45)",
            color: "#f0b429", fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "1rem", fontFamily: "Rubik,sans-serif",
          }}>
            ◆ DIAMOND MEMBER
          </span>

          <h1 style={{
            fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "2.4rem",
            color: "#fff", lineHeight: 1.15, marginBottom: "0.6rem",
          }}>
            ברוך הבא,{" "}
            <span style={{
              background: "linear-gradient(90deg, #5cde97, #22c55e)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>אלוף</span>
          </h1>
          <p style={{ color: "rgba(188,202,189,0.7)", fontSize: "0.9rem", marginBottom: "1.75rem", fontWeight: 300, lineHeight: 1.65 }}>
            מונדיאל 2026 מתקרב — נחשו תוצאות, צברו נקודות, נצחו את החברים!
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {[
              { icon: "sports_soccer", label: "משחקים", value: total, color: "#f0b429" },
              { icon: "check_circle", label: "הסתיימו", value: completed, color: "#5cde97" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "0.65rem 1.1rem", borderRadius: 14,
                background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", gap: "0.65rem",
              }}>
                <span className="material-symbols-outlined" style={{ color: s.color, fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(188,202,189,0.6)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/predictions" style={{
              background: "linear-gradient(135deg, #5cde97, #22c55e)",
              color: "#051a0b", fontFamily: "Rubik,sans-serif", fontWeight: 800,
              fontSize: "0.88rem", padding: "11px 24px", borderRadius: 12,
              textDecoration: "none", boxShadow: "0 0 24px rgba(92,222,151,0.4)",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}>
              הכנס ניחושים
            </Link>
            <Link href="/leaderboard" style={{
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.14)", color: "var(--on-surface)",
              fontFamily: "Rubik,sans-serif", fontWeight: 600, fontSize: "0.88rem",
              padding: "11px 22px", borderRadius: 12, textDecoration: "none",
            }}>
              טבלת דירוג
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Matches ── */}
      <LiveMatches />

      {/* ── Scoring legend ── */}
      <div style={{
        display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap",
        padding: "0.85rem 1.25rem", borderRadius: 14,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{ color: "rgba(188,202,189,0.5)", fontSize: "0.75rem", alignSelf: "center" }}>מערכת ניקוד:</span>
        {[
          { pts: 4, label: "תוצאה מדויקת", bg: "linear-gradient(135deg,#5cde97,#22c55e)", color: "#051a0b" },
          { pts: 1, label: "כיוון נכון", bg: "linear-gradient(135deg,#60a5fa,#3b82f6)", color: "#0a1832" },
          { pts: 0, label: "החמצה", bg: "rgba(248,113,113,0.2)", color: "#f87171" },
        ].map(s => (
          <div key={s.pts} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", color: "var(--on-surface-variant)" }}>
            <span style={{
              background: s.bg, color: s.color, fontWeight: 800,
              borderRadius: 6, padding: "2px 10px", fontSize: "0.8rem",
              fontFamily: "Montserrat,sans-serif", minWidth: 24, textAlign: "center",
            }}>{s.pts}</span>
            {s.label}
          </div>
        ))}
      </div>

      {/* ── Group Stage ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span style={{
                width: 4, height: 18, borderRadius: 2,
                background: "linear-gradient(#f0b429, #ffe066)",
                display: "inline-block", flexShrink: 0,
              }} />
              <h2 style={{
                fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1.1rem",
                color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
              }}>
                שלב הבתים
              </h2>
            </div>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "0.82rem" }}>
              12 בתים, 48 קבוצות — הניחושים פתוחים כעת
            </p>
          </div>
          <Link href="/predictions" style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 500, textDecoration: "none" }}>
            נחש עכשיו
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "1rem" }}>
          {Object.entries(byGroup).map(([groupName, gMatches]) => (
            <div key={groupName} className="glass-card" style={{ borderRadius: 20, overflow: "hidden" }}>
              {/* Group header */}
              <div style={{
                padding: "0.65rem 1rem",
                background: "linear-gradient(90deg, rgba(240,180,41,0.12) 0%, rgba(92,222,151,0.04) 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: "linear-gradient(135deg, #f0b429, #ffe066)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 900, color: "#3a2a00",
                  fontFamily: "Montserrat,sans-serif", flexShrink: 0,
                }}>{groupName}</span>
                <span style={{
                  fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.75rem",
                  color: "rgba(188,202,189,0.7)", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>בית {groupName}</span>
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
