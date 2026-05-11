import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export default async function LeaderboardPage() {
  const [session, { data: users }, { data: preds }] = await Promise.all([
    getSession(),
    supabase.from("users").select("id, username"),
    supabase.from("predictions").select("user_id, points"),
  ]);

  const rows = (users || [])
    .map((u) => {
      const up = (preds || []).filter((p) => p.user_id === u.id);
      return {
        id: u.id,
        username: u.username,
        predictions_count: up.length,
        exact_count: up.filter((p) => p.points === 4).length,
        direction_count: up.filter((p) => p.points === 1).length,
        total_points: up.reduce((s: number, p: { points: number | null }) => s + (p.points || 0), 0),
      };
    })
    .sort((a, b) => b.total_points - a.total_points || b.exact_count - a.exact_count || b.predictions_count - a.predictions_count);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "var(--text)", marginBottom: "0.25rem" }}>
          טבלת דירוג
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          {rows.length} משתתפים · מתעדכן אחרי כל משחק
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, color: "var(--muted)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏟️</div>
          <p>אין משתתפים עדיין. היה הראשון להירשם!</p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {top3.length > 0 && (
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {top3.map((row, i) => {
                const isMe = session?.userId === row.id;
                const podiumColors = ["#fbbf24", "#94a3b8", "#cd7c2f"];
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={row.id} style={{
                    flex: i === 0 ? "2 1 220px" : "1 1 140px",
                    background: i === 0
                      ? "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, var(--surface) 100%)"
                      : "var(--surface)",
                    border: `1px solid ${isMe ? "rgba(96,165,250,0.4)" : i === 0 ? "rgba(251,191,36,0.3)" : "var(--border)"}`,
                    borderRadius: 16, padding: "1.25rem",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: i === 0 ? "2.2rem" : "1.8rem", marginBottom: "0.5rem" }}>
                      {medals[i]}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem", color: isMe ? "var(--blue)" : "var(--text)" }}>
                      {row.username}
                      {isMe && <span style={{ fontSize: "0.7rem", color: "var(--blue)", display: "block" }}>(אתה)</span>}
                    </div>
                    <div style={{
                      fontSize: i === 0 ? "2rem" : "1.5rem",
                      fontWeight: 800, color: podiumColors[i],
                      fontFamily: "Montserrat,sans-serif",
                    }}>
                      {row.total_points}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>נקודות</div>
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.75rem" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.9rem" }}>{row.exact_count}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>בול</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--blue)", fontSize: "0.9rem" }}>{row.direction_count}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>כיוון</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scoring legend */}
          <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ background: "var(--green)", color: "#0d1a10", fontWeight: 800, borderRadius: 5, padding: "1px 7px", fontSize: "0.78rem" }}>4</span>
              תוצאה מדויקת
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ background: "var(--blue)", color: "#0d1a10", fontWeight: 800, borderRadius: 5, padding: "1px 7px", fontSize: "0.78rem" }}>1</span>
              כיוון נכון
            </div>
          </div>

          {/* Full table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {rows.map((row, i) => {
              const isMe = session?.userId === row.id;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={row.id} style={{
                  background: isMe ? "rgba(96,165,250,0.07)" : "var(--surface)",
                  border: `1px solid ${isMe ? "rgba(96,165,250,0.3)" : "var(--border)"}`,
                  borderRadius: 12, padding: "0.8rem 1.1rem",
                  display: "flex", alignItems: "center", gap: "0.9rem",
                }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", minWidth: "2rem", textAlign: "center" }}>
                    {i < 3 ? medals[i] : <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: isMe ? "var(--blue)" : "var(--text)" }}>
                      {row.username} {isMe && <span style={{ fontSize: "0.72rem" }}>(אתה)</span>}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{row.predictions_count} ניחושים</div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "var(--green)", fontSize: "0.95rem" }}>{row.exact_count}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>בול</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "var(--blue)", fontSize: "0.95rem" }}>{row.direction_count}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>כיוון</div>
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "0.35rem 0.75rem", textAlign: "center", minWidth: 54,
                    }}>
                      <div style={{
                        fontSize: "1.2rem", fontWeight: 800,
                        color: i < 3 ? "var(--yellow)" : "var(--text)",
                        fontFamily: "Montserrat,sans-serif",
                      }}>
                        {row.total_points}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--muted)" }}>נק׳</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {rest.length === 0 && top3.length > 0 && null}
        </>
      )}
    </div>
  );
}
