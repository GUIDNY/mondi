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

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem",
          color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "0.3rem",
        }}>
          VIP Leaderboard
        </h1>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.85rem" }}>
          {rows.length} משתתפים · מתעדכן אחרי כל משחק
        </p>
      </div>

      {/* Scoring legend */}
      <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--on-surface-variant)" }}>
          <span style={{ background: "var(--primary)", color: "var(--on-primary-container)", fontWeight: 800, borderRadius: 6, padding: "2px 9px", fontFamily: "Montserrat,sans-serif" }}>4</span>
          תוצאה מדויקת
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--on-surface-variant)" }}>
          <span style={{ background: "rgba(96,165,250,0.8)", color: "#0a1832", fontWeight: 800, borderRadius: 6, padding: "2px 9px", fontFamily: "Montserrat,sans-serif" }}>1</span>
          כיוון נכון
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem", borderRadius: 20, color: "var(--on-surface-variant)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏟️</div>
          <p>אין משתתפים עדיין. היה הראשון להירשם!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {rows.length >= 1 && (
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {rows.slice(0, 3).map((row, i) => {
                const isMe = session?.userId === row.id;
                const podiumColor = ["#fbbf24", "#94a3b8", "#cd7c2f"][i];
                return (
                  <div key={row.id} className="glass-card" style={{
                    flex: i === 0 ? "2 1 200px" : "1 1 140px",
                    borderRadius: 20, padding: "1.25rem", textAlign: "center",
                    border: i === 0
                      ? "1px solid rgba(251,191,36,0.25)"
                      : isMe ? "1px solid rgba(96,165,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
                    background: i === 0
                      ? "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(14,21,16,0.7) 100%)"
                      : "rgba(14,21,16,0.7)",
                  }}>
                    <div style={{ fontSize: i === 0 ? "2.2rem" : "1.8rem", marginBottom: "0.4rem" }}>{medals[i]}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isMe ? "#60a5fa" : "var(--on-surface)", marginBottom: "0.25rem" }}>
                      {row.username}
                    </div>
                    <div style={{
                      fontFamily: "Montserrat,sans-serif", fontWeight: 800,
                      fontSize: i === 0 ? "2rem" : "1.5rem", color: podiumColor,
                    }}>
                      {row.total_points}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--on-surface-variant)", marginBottom: "0.75rem" }}>נקודות</div>
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.88rem" }}>{row.exact_count}</div>
                        <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)" }}>בול</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#60a5fa", fontSize: "0.88rem" }}>{row.direction_count}</div>
                        <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)" }}>כיוון</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {rows.map((row, i) => {
              const isMe = session?.userId === row.id;
              return (
                <div key={row.id} className="glass-card" style={{
                  borderRadius: 14, padding: "0.85rem 1.1rem",
                  display: "flex", alignItems: "center", gap: "0.9rem",
                  border: isMe ? "1px solid rgba(96,165,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  background: isMe ? "rgba(96,165,250,0.06)" : "rgba(14,21,16,0.7)",
                }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", minWidth: "2rem", textAlign: "center" }}>
                    {i < 3 ? medals[i] : <span style={{ color: "var(--on-surface-variant)", fontSize: "0.85rem", fontFamily: "Montserrat,sans-serif" }}>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: isMe ? "#60a5fa" : "var(--on-surface)" }}>
                      {row.username} {isMe && <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>(אתה)</span>}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)" }}>{row.predictions_count} ניחושים</div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9rem" }}>{row.exact_count}</div>
                      <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)" }}>בול</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#60a5fa", fontSize: "0.9rem" }}>{row.direction_count}</div>
                      <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)" }}>כיוון</div>
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, padding: "0.4rem 0.85rem", textAlign: "center", minWidth: 56,
                    }}>
                      <div style={{
                        fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.15rem",
                        color: i < 3 ? "#fbbf24" : "var(--on-surface)",
                      }}>
                        {row.total_points}
                      </div>
                      <div style={{ fontSize: "0.58rem", color: "var(--on-surface-variant)" }}>נק׳</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
