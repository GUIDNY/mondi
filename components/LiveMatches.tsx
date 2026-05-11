"use client";

import { useEffect, useState } from "react";

interface Match {
  id: number;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  match_date: string | null;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  group_name: string | null;
}

function parseKickoff(match: Match): Date | null {
  if (match.venue?.includes("||")) return new Date(match.venue.split("||")[1]);
  if (match.match_date) return new Date(match.match_date + "T21:00:00Z");
  return null;
}

function getCompName(venue: string | null): string {
  if (!venue) return "";
  return venue.includes("||") ? venue.split("||")[0] : venue;
}

function getLiveStatus(match: Match, now: number): "pre" | "live" | "post" | null {
  const kickoff = parseKickoff(match);
  if (!kickoff) return null;
  const ko = kickoff.getTime();
  const PRE = 15 * 60 * 1000;
  const POST_WINDOW = 15 * 60 * 1000;
  const MAX_MATCH = 130 * 60 * 1000; // 2h10 max (90 + extra time + stoppage)

  if (now < ko - PRE) return null; // too early
  if (now >= ko - PRE && now < ko) return "pre";
  if (match.home_score !== null && now > ko + MAX_MATCH + POST_WINDOW) return null; // long gone
  if (match.home_score !== null && now >= ko + MAX_MATCH) return "post"; // likely finished
  if (now >= ko && match.home_score === null) return "live"; // in progress (no score yet / updating)
  if (now >= ko && match.home_score !== null) {
    // Has score — could be live or finished. Show until 15 min after MAX_MATCH
    if (now <= ko + MAX_MATCH + POST_WINDOW) return "live";
  }
  return null;
}

function minsUntil(kickoff: Date, now: number) {
  return Math.ceil((kickoff.getTime() - now) / 60000);
}

function minsElapsed(kickoff: Date, now: number) {
  return Math.floor((now - kickoff.getTime()) / 60000);
}

export default function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const load = () => fetch("/api/matches").then(r => r.json()).then(setMatches).catch(() => {});
    load();
    const dataTimer = setInterval(load, 60_000);
    const clockTimer = setInterval(() => setNow(Date.now()), 30_000);
    return () => { clearInterval(dataTimer); clearInterval(clockTimer); };
  }, []);

  const liveMatches = matches.filter(m => getLiveStatus(m, now) !== null);
  if (!liveMatches.length) return null;

  return (
    <section style={{ marginBottom: "2rem" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.85rem" }}>
        {/* Pulsing live dot */}
        <span style={{ position: "relative", display: "inline-flex" }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#ef4444", display: "inline-block",
            boxShadow: "0 0 8px #ef4444",
            animation: "livePulse 1.4s ease-in-out infinite",
          }} />
        </span>
        <span style={{
          fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "0.72rem",
          color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.14em",
        }}>LIVE NOW</span>
        <span style={{ color: "rgba(188,202,189,0.35)", fontSize: "0.72rem" }}>·</span>
        <span style={{ color: "rgba(188,202,189,0.5)", fontSize: "0.72rem", fontFamily: "Rubik,sans-serif" }}>
          {liveMatches.length} {liveMatches.length === 1 ? "משחק" : "משחקים"}
        </span>
      </div>

      {/* Cards — horizontal scroll on mobile */}
      <div style={{
        display: "flex", gap: "0.75rem", overflowX: "auto",
        paddingBottom: "0.5rem",
        scrollbarWidth: "none",
      }}>
        {liveMatches.map(m => {
          const kickoff = parseKickoff(m)!;
          const status = getLiveStatus(m, now)!;
          const comp = getCompName(m.venue);
          const mins = status === "pre" ? minsUntil(kickoff, now) : minsElapsed(kickoff, now);
          const hasScore = m.home_score !== null;

          return (
            <div key={m.id} style={{
              flexShrink: 0, minWidth: 220, maxWidth: 260,
              borderRadius: 18, padding: "1rem 1.1rem",
              background: status === "pre"
                ? "linear-gradient(145deg, rgba(14,24,16,0.95), rgba(20,35,22,0.95))"
                : "linear-gradient(145deg, rgba(20,10,10,0.97), rgba(30,14,14,0.95))",
              border: status === "pre"
                ? "1px solid rgba(92,222,151,0.2)"
                : "1px solid rgba(239,68,68,0.35)",
              boxShadow: status === "pre"
                ? "0 0 20px rgba(92,222,151,0.06)"
                : "0 0 24px rgba(239,68,68,0.12)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow top bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: status === "pre"
                  ? "linear-gradient(90deg, transparent, rgba(92,222,151,0.6), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(239,68,68,0.7), transparent)",
              }} />

              {/* Status badge */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: "0.75rem",
              }}>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", fontFamily: "Rubik,sans-serif",
                  color: status === "pre" ? "#5cde97"
                       : status === "post" ? "rgba(188,202,189,0.5)"
                       : "#ef4444",
                }}>
                  {status === "pre" ? `בעוד ${mins} דק׳`
                 : status === "post" ? "הסתיים"
                 : mins < 46 ? `${mins}′` : mins < 91 ? `${mins}′` : "תוספת"}
                </span>
                <span style={{
                  fontSize: "0.58rem", color: "rgba(188,202,189,0.4)",
                  fontFamily: "Rubik,sans-serif",
                }}>
                  {comp || (m.group_name ?? m.stage)}
                </span>
              </div>

              {/* Teams + score */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {/* Home */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <span style={{ fontSize: "1.3rem" }}>{m.home_flag}</span>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600, color: "var(--on-surface)",
                    textAlign: "right", lineHeight: 1.2, maxWidth: 70,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{m.home_team.replace(/ FC$| AFC$/, "")}</span>
                </div>

                {/* Score / VS */}
                <div style={{ textAlign: "center", minWidth: 56 }}>
                  {hasScore ? (
                    <div style={{
                      fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: "1.5rem",
                      color: "#fff", letterSpacing: "-0.02em",
                      textShadow: status === "live" ? "0 0 16px rgba(239,68,68,0.5)" : "none",
                    }}>
                      {m.home_score}<span style={{ color: "rgba(255,255,255,0.3)", margin: "0 2px" }}>:</span>{m.away_score}
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.75rem",
                      color: "rgba(188,202,189,0.4)", letterSpacing: "0.1em",
                    }}>VS</div>
                  )}
                </div>

                {/* Away */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                  <span style={{ fontSize: "1.3rem" }}>{m.away_flag}</span>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600, color: "var(--on-surface)",
                    textAlign: "left", lineHeight: 1.2, maxWidth: 70,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{m.away_team.replace(/ FC$| AFC$/, "")}</span>
                </div>
              </div>

              {/* Live pulse indicator */}
              {status === "live" && (
                <div style={{
                  marginTop: "0.65rem", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "0.4rem",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#ef4444",
                    display: "inline-block", boxShadow: "0 0 6px #ef4444",
                    animation: "livePulse 1.4s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: "0.6rem", color: "#ef4444", fontWeight: 700, letterSpacing: "0.1em" }}>
                    LIVE
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </section>
  );
}
