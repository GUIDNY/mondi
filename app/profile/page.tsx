"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Match {
  id: number;
  stage: string;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  match_date: string | null;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  group_name: string | null;
}

interface Prediction {
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
  updated_at: string;
}

interface LeaderboardEntry {
  id: number;
  username: string;
  total_points: number;
  exact_count: number;
  direction_count: number;
  predictions_count: number;
}

interface Me {
  userId: number;
  username: string;
  isAdmin: boolean;
}

function formatMatchDate(m: Match) {
  // Prefer kickoff time from venue ("Competition||ISO_UTC") over date-only match_date
  const kickoff = m.venue?.includes("||")
    ? new Date(m.venue.split("||")[1])
    : m.match_date ? new Date(m.match_date + "T21:00:00Z") : null;
  if (!kickoff) return "";
  const day = kickoff.toLocaleDateString("he-IL", { day: "numeric", month: "short", timeZone: "Asia/Jerusalem" });
  const time = kickoff.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" });
  return `${day} · ${time}`;
}

function pointsBadge(pts: number | null) {
  if (pts === 4) return { label: "בול", bg: "rgba(92,222,151,0.15)", color: "var(--primary)", border: "rgba(92,222,151,0.3)" };
  if (pts === 1) return { label: "כיוון", bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.25)" };
  if (pts === 0) return { label: "החמצה", bg: "rgba(248,113,113,0.1)", color: "#f87171", border: "rgba(248,113,113,0.2)" };
  return null;
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stats" | "history">("stats");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/matches").then(r => r.json()),
      fetch("/api/predictions").then(r => r.json()),
      fetch("/api/leaderboard").then(r => r.json()),
    ]).then(([meData, matchData, predData, lbData]) => {
      setMe(meData?.userId ? meData : null);
      setMatches(Array.isArray(matchData) ? matchData : []);
      setPredictions(Array.isArray(predData) ? predData : []);
      setLeaderboard(Array.isArray(lbData) ? lbData : []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--on-surface-variant)", fontFamily: "Rubik,sans-serif" }}>
      טוען פרופיל...
    </div>
  );

  if (!me) return (
    <div style={{ textAlign: "center", padding: "4rem", fontFamily: "Rubik,sans-serif" }}>
      <p style={{ color: "var(--on-surface-variant)", marginBottom: "1rem" }}>לא מחובר</p>
      <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>כניסה</Link>
    </div>
  );

  const matchMap = Object.fromEntries(matches.map(m => [m.id, m]));
  const myRank = leaderboard.findIndex(e => e.id === me.userId) + 1;
  const myStats = leaderboard.find(e => e.id === me.userId);

  const scoredPreds = predictions.filter(p => p.points !== null);
  const pendingPreds = predictions.filter(p => p.points === null);
  const totalPoints = scoredPreds.reduce((s, p) => s + (p.points ?? 0), 0);
  const exactCount = scoredPreds.filter(p => p.points === 4).length;
  const directionCount = scoredPreds.filter(p => p.points === 1).length;
  const missCount = scoredPreds.filter(p => p.points === 0).length;
  const accuracy = scoredPreds.length > 0 ? Math.round(((exactCount + directionCount) / scoredPreds.length) * 100) : 0;

  const historyPreds = [...predictions]
    .filter(p => matchMap[p.match_id])
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const chipTab = (t: typeof tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      padding: "8px 20px", borderRadius: 999, border: "1px solid",
      borderColor: tab === t ? "rgba(92,222,151,0.5)" : "rgba(61,74,64,0.4)",
      background: tab === t ? "rgba(92,222,151,0.12)" : "transparent",
      color: tab === t ? "var(--primary)" : "var(--on-surface-variant)",
      cursor: "pointer", fontFamily: "Rubik,sans-serif", fontWeight: tab === t ? 600 : 400,
      fontSize: "0.88rem", transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div>
      {/* Profile hero */}
      <div className="glass-card" style={{
        borderRadius: 20, padding: "1.75rem 2rem", marginBottom: "1.5rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 50%, rgba(92,222,151,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--primary), #22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1.6rem",
            color: "var(--on-primary-container)",
            border: "2px solid rgba(92,222,151,0.35)",
            boxShadow: "0 0 24px rgba(92,222,151,0.2)",
          }}>
            {me.username[0]?.toUpperCase()}
          </div>

          {/* Name + badge */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
              <h1 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#fff", margin: 0 }}>
                {me.username}
              </h1>
              {me.isAdmin && (
                <span style={{ fontSize: "0.65rem", color: "#ffdb3c", fontWeight: 600, border: "1px solid rgba(255,219,60,0.4)", borderRadius: 6, padding: "2px 8px" }}>
                  מנהל
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--primary)" }}>military_tech</span>
              <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)" }}>PRO BETTOR · Diamond Tier</span>
            </div>
          </div>

          {/* Rank */}
          {myRank > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.2rem" }}>דירוג כללי</div>
              <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: "2.2rem", color: "var(--primary)", lineHeight: 1 }}>
                #{myRank}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--on-surface-variant)" }}>מתוך {leaderboard.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {chipTab("stats", "📊 סטטיסטיקות")}
        {chipTab("history", `📋 היסטוריה (${predictions.length})`)}
      </div>

      {/* Stats tab */}
      {tab === "stats" && (
        <div>
          {/* Big stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {[
              { label: "סה״כ נקודות", value: totalPoints, color: "var(--primary)", icon: "emoji_events" },
              { label: "ניחושים מדויקים", value: exactCount, color: "#22c55e", icon: "check_circle" },
              { label: "כיוון נכון", value: directionCount, color: "#60a5fa", icon: "trending_up" },
              { label: "החמצות", value: missCount, color: "#f87171", icon: "cancel" },
              { label: "דיוק", value: `${accuracy}%`, color: "#ffdb3c", icon: "analytics" },
              { label: "ממתינים", value: pendingPreds.length, color: "var(--on-surface-variant)", icon: "schedule" },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ borderRadius: 14, padding: "1rem", textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: s.color, marginBottom: "0.4rem", display: "block" }}>{s.icon}</span>
                <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--on-surface-variant)", marginTop: "0.3rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Accuracy bar */}
          {scoredPreds.length > 0 && (
            <div className="glass-card" style={{ borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Montserrat,sans-serif", fontWeight: 700 }}>
                פירוט ניחושים מנוקדים ({scoredPreds.length})
              </div>
              <div style={{ display: "flex", gap: "2px", height: 10, borderRadius: 8, overflow: "hidden", marginBottom: "0.5rem" }}>
                {exactCount > 0 && <div style={{ flex: exactCount, background: "var(--primary)" }} />}
                {directionCount > 0 && <div style={{ flex: directionCount, background: "#60a5fa" }} />}
                {missCount > 0 && <div style={{ flex: missCount, background: "#f87171" }} />}
              </div>
              <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.72rem" }}>
                <span style={{ color: "var(--primary)" }}>■ {exactCount} בול ({Math.round(exactCount/scoredPreds.length*100)}%)</span>
                <span style={{ color: "#60a5fa" }}>■ {directionCount} כיוון ({Math.round(directionCount/scoredPreds.length*100)}%)</span>
                <span style={{ color: "#f87171" }}>■ {missCount} החמצה ({Math.round(missCount/scoredPreds.length*100)}%)</span>
              </div>
            </div>
          )}

          {/* Rank vs others */}
          {leaderboard.length > 1 && (
            <div className="glass-card" style={{ borderRadius: 16, padding: "1.25rem 1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Montserrat,sans-serif", fontWeight: 700 }}>
                ליג החברים
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {leaderboard.slice(0, 5).map((e, i) => {
                  const isMe = e.id === me.userId;
                  return (
                    <div key={e.id} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.6rem 0.75rem", borderRadius: 10,
                      background: isMe ? "rgba(92,222,151,0.1)" : "transparent",
                      border: isMe ? "1px solid rgba(92,222,151,0.25)" : "1px solid transparent",
                    }}>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "0.85rem", width: 20, color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "var(--on-surface-variant)", textAlign: "center" }}>
                        {i + 1}
                      </span>
                      <span style={{ flex: 1, fontWeight: isMe ? 700 : 400, fontSize: "0.88rem", color: isMe ? "var(--primary)" : "var(--on-surface)" }}>
                        {e.username}{isMe && " (אני)"}
                      </span>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, color: isMe ? "var(--primary)" : "#fff" }}>
                        {e.total_points} נק׳
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {historyPreds.length === 0 && (
            <div className="glass-card" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--on-surface-variant)" }}>
              אין עדיין ניחושים
            </div>
          )}
          {historyPreds.map(p => {
            const m = matchMap[p.match_id];
            if (!m) return null;
            const badge = pointsBadge(p.points);
            const hasResult = m.home_score !== null;
            return (
              <div key={p.match_id} className="glass-card" style={{
                borderRadius: 14, padding: "0.9rem 1.1rem",
                display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
                border: badge ? `1px solid ${badge.border}` : "1px solid rgba(255,255,255,0.07)",
                direction: "ltr",
              }}>
                {/* Teams — explicit rtl for Hebrew text flow */}
                <div style={{ flex: 1, minWidth: 160, direction: "rtl" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--on-surface)", marginBottom: "0.2rem" }}>
                    {m.home_flag} {m.home_team} — {m.away_team} {m.away_flag}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)" }}>
                    {m.group_name ?? m.stage} · {formatMatchDate(m)}
                  </div>
                </div>

                {/* My prediction */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)", marginBottom: "0.2rem", direction: "rtl" }}>הניחוש שלי</div>
                  <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff", direction: "ltr" }}>
                    {p.home_score} : {p.away_score}
                  </div>
                </div>

                {/* Actual result */}
                {hasResult && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)", marginBottom: "0.2rem", direction: "rtl" }}>תוצאה</div>
                    <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)", direction: "ltr" }}>
                      {m.home_score} : {m.away_score}
                    </div>
                  </div>
                )}

                {/* Badge */}
                <div style={{ direction: "rtl" }}>
                  {badge ? (
                    <span style={{
                      fontSize: "0.78rem", padding: "4px 12px", borderRadius: 8,
                      background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                      fontWeight: 700, fontFamily: "Rubik,sans-serif",
                    }}>
                      {badge.label} {p.points !== null && p.points > 0 ? `+${p.points}` : ""}
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", padding: "4px 12px", borderRadius: 8, border: "1px solid rgba(61,74,64,0.4)" }}>
                      ממתין לתוצאה
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
