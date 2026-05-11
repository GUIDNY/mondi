import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface LeaderboardRow {
  id: number;
  username: string;
  predictions_count: number;
  exact_count: number;
  direction_count: number;
  total_points: number;
}

const medals = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const [session, rows] = await Promise.all([
    getSession(),
    Promise.resolve(
      (() => {
        const db = getDb();
        return db.prepare(`
          SELECT
            u.id,
            u.username,
            COUNT(p.id) as predictions_count,
            COALESCE(SUM(CASE WHEN p.points = 4 THEN 1 ELSE 0 END), 0) as exact_count,
            COALESCE(SUM(CASE WHEN p.points = 1 THEN 1 ELSE 0 END), 0) as direction_count,
            COALESCE(SUM(p.points), 0) as total_points
          FROM users u
          LEFT JOIN predictions p ON p.user_id = u.id
          GROUP BY u.id
          ORDER BY total_points DESC, exact_count DESC, predictions_count DESC
        `).all() as LeaderboardRow[];
      })()
    ),
  ]);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", marginBottom: "0.5rem" }}>
        טבלת דירוג 🏆
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        {rows.length} משתתפים · מתעדכן בזמן אמת
      </p>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#94a3b8" }}>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>4 נק&apos;</span> = תוצאה מדויקת
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#94a3b8" }}>
          <span style={{ color: "#60a5fa", fontWeight: 700 }}>1 נק&apos;</span> = כיוון נכון
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#475569", background: "#1e293b", borderRadius: "12px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏟️</div>
          <p>אין משתתפים עדיין. היה הראשון להירשם!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {rows.map((row, i) => {
            const isMe = session?.userId === row.id;
            return (
              <div key={row.id} style={{
                background: isMe ? "#1e3a5f" : "#1e293b",
                borderRadius: "12px",
                border: `1px solid ${isMe ? "#3b82f6" : i < 3 ? "#f59e0b33" : "#334155"}`,
                padding: "1rem 1.25rem",
                display: "flex", alignItems: "center", gap: "1rem"
              }}>
                {/* Rank */}
                <div style={{ fontWeight: 800, fontSize: "1.2rem", minWidth: "2.5rem", textAlign: "center" }}>
                  {i < 3 ? medals[i] : `${i + 1}.`}
                </div>

                {/* Username */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: isMe ? "#60a5fa" : "#f1f5f9" }}>
                    {row.username} {isMe && <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>(אתה)</span>}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                    {row.predictions_count} ניחושים
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f59e0b" }}>{row.exact_count}</div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>בול</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#60a5fa" }}>{row.direction_count}</div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>כיוון</div>
                  </div>
                  <div style={{
                    background: "#0f172a", borderRadius: "8px", padding: "0.4rem 0.8rem",
                    textAlign: "center", minWidth: "60px"
                  }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: i < 3 ? "#f59e0b" : "#f1f5f9" }}>
                      {row.total_points}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>נקודות</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
