"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface LeaderboardEntry {
  user_id: number;
  username: string;
  exact_count: number;
  direction_count: number;
  match_points: number;
  bonus_points: number;
  total_points: number;
  champion_pick: string | null;
  top_scorer_pick: string | null;
  predictions_count: number;
  is_me: boolean;
}

interface Group {
  id: number;
  name: string;
  code: string;
  creator_id: number;
  scoring_exact: number;
  scoring_direction: number;
  has_champion_pick: boolean;
  has_top_scorer_pick: boolean;
  champion_bonus_pts: number;
  top_scorer_bonus_pts: number;
  champion_result: string | null;
  top_scorer_result: string | null;
}

interface GroupData {
  group: Group;
  leaderboard: LeaderboardEntry[];
  my_membership: { champion_pick: string | null; top_scorer_pick: string | null };
  is_creator: boolean;
}

function CopyButton({ text, label = "העתק" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        background: copied ? "rgba(92,222,151,0.18)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${copied ? "rgba(92,222,151,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: copied ? "var(--primary)" : "var(--on-surface-variant)",
        borderRadius: 8, padding: "4px 12px", fontSize: "0.75rem",
        cursor: "pointer", fontFamily: "Rubik,sans-serif", transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {copied ? "✓ הועתק" : label}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: value ? "var(--primary)" : "rgba(255,255,255,0.1)",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        left: value ? "calc(100% - 21px)" : 3,
      }} />
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 1rem", borderRadius: 10,
  border: "1px solid rgba(61,74,64,0.5)", background: "rgba(255,255,255,0.03)",
  color: "var(--on-surface)", fontSize: "0.9rem", fontFamily: "Rubik,sans-serif", outline: "none",
};

export default function GroupDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"board" | "picks" | "settings">("board");

  // My picks form
  const [picks, setPicks] = useState({ champion_pick: "", top_scorer_pick: "" });
  const [picksSaving, setPicksSaving] = useState(false);
  const [picksStatus, setPicksStatus] = useState("");

  // Settings form (creator)
  const [settings, setSettings] = useState<Partial<Group>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState("");

  function load() {
    fetch(`/api/groups/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.group) {
          setData(d);
          setPicks({
            champion_pick: d.my_membership?.champion_pick ?? "",
            top_scorer_pick: d.my_membership?.top_scorer_pick ?? "",
          });
          setSettings({
            name: d.group.name,
            scoring_exact: d.group.scoring_exact,
            scoring_direction: d.group.scoring_direction,
            has_champion_pick: d.group.has_champion_pick,
            has_top_scorer_pick: d.group.has_top_scorer_pick,
            champion_bonus_pts: d.group.champion_bonus_pts,
            top_scorer_bonus_pts: d.group.top_scorer_bonus_pts,
            champion_result: d.group.champion_result ?? "",
            top_scorer_result: d.group.top_scorer_result ?? "",
          });
        }
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, [code]);

  async function savePicks() {
    setPicksSaving(true); setPicksStatus("");
    const res = await fetch(`/api/groups/${code}/settings`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(picks),
    });
    setPicksSaving(false);
    setPicksStatus(res.ok ? "✓ נשמר" : "שגיאה בשמירה");
    if (res.ok) load();
  }

  async function saveSettings() {
    setSettingsSaving(true); setSettingsStatus("");
    const res = await fetch(`/api/groups/${code}/settings`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSettingsSaving(false);
    setSettingsStatus(res.ok ? "✓ הגדרות עודכנו" : "שגיאה");
    if (res.ok) load();
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "var(--on-surface-variant)", fontFamily: "Rubik,sans-serif" }}>
      טוען קבוצה...
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "var(--on-surface-variant)", fontFamily: "Rubik,sans-serif" }}>
      קבוצה לא נמצאה
    </div>
  );

  const { group, leaderboard, is_creator } = data;
  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : "https://mondi-phi.vercel.app"}/join/${group.code}`;
  const myEntry = leaderboard.find(e => e.is_me);

  const chipTab = (t: typeof tab, label: string, show = true) => show ? (
    <button onClick={() => setTab(t)} style={{
      padding: "8px 20px", borderRadius: 999, border: "1px solid",
      borderColor: tab === t ? "rgba(92,222,151,0.5)" : "rgba(61,74,64,0.4)",
      background: tab === t ? "rgba(92,222,151,0.12)" : "transparent",
      color: tab === t ? "var(--primary)" : "var(--on-surface-variant)",
      cursor: "pointer", fontFamily: "Rubik,sans-serif", fontWeight: tab === t ? 600 : 400,
      fontSize: "0.88rem", transition: "all 0.15s",
    }}>{label}</button>
  ) : null;

  const medalColors = ["#ffd700", "#c0c0c0", "#cd7f32"];

  return (
    <div>
      {/* Group header */}
      <div className="glass-card" style={{ borderRadius: 20, padding: "1.5rem 1.75rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(92,222,151,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                <h1 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#fff", margin: 0 }}>
                  {group.name}
                </h1>
                {is_creator && (
                  <span style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 600, border: "1px solid rgba(92,222,151,0.35)", borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>
                    יוצר
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)" }}>
                ניקוד: {group.scoring_exact} בול / {group.scoring_direction} כיוון
                {group.has_champion_pick && ` · 🏆 אלוף +${group.champion_bonus_pts}נק'`}
                {group.has_top_scorer_pick && ` · 👟 מלך שערים +${group.top_scorer_bonus_pts}נק'`}
              </div>
            </div>

            {/* My rank */}
            {myEntry && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>הדירוג שלי</div>
                <div style={{
                  fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem",
                  color: "var(--primary)", lineHeight: 1,
                }}>
                  {leaderboard.findIndex(e => e.is_me) + 1}
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>/{leaderboard.length}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginTop: 2 }}>
                  {myEntry.total_points} נק׳
                </div>
              </div>
            )}
          </div>

          {/* Invite section */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(61,74,64,0.4)",
              borderRadius: 10, padding: "0.55rem 1rem", flex: 1, minWidth: 200,
            }}>
              <span style={{ fontSize: "0.7rem", color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>קוד:</span>
              <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)", letterSpacing: "0.12em", flex: 1 }}>{group.code}</span>
              <CopyButton text={group.code} />
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(61,74,64,0.4)",
              borderRadius: 10, padding: "0.55rem 1rem", flex: 2, minWidth: 260,
            }}>
              <span style={{ fontSize: "0.7rem", color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>לינק:</span>
              <span style={{ fontFamily: "Rubik,sans-serif", fontSize: "0.78rem", color: "var(--on-surface-variant)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inviteLink}</span>
              <CopyButton text={inviteLink} label="שתף" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {chipTab("board", `🏅 לוח תוצאות (${leaderboard.length})`)}
        {(group.has_champion_pick || group.has_top_scorer_pick)
          ? chipTab("picks", "🎯 הניחושים שלי")
          : null}
        {is_creator ? chipTab("settings", "⚙️ הגדרות") : null}
      </div>

      {/* Leaderboard */}
      {tab === "board" && (
        <div>
          {leaderboard.length === 0 ? (
            <div className="glass-card" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--on-surface-variant)" }}>
              אין עדיין חברים בקבוצה
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {leaderboard.map((entry, idx) => {
                const rankColor = idx < 3 ? medalColors[idx] : "var(--on-surface-variant)";
                return (
                  <div key={entry.user_id} className="glass-card" style={{
                    borderRadius: 14, padding: "1rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "1rem",
                    border: entry.is_me
                      ? "1px solid rgba(92,222,151,0.35)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: entry.is_me
                      ? "rgba(92,222,151,0.07)"
                      : "rgba(14,21,16,0.7)",
                    transition: "border-color 0.15s",
                  }}>
                    {/* Rank */}
                    <div style={{
                      fontFamily: "Montserrat,sans-serif", fontWeight: 800,
                      fontSize: idx < 3 ? "1.3rem" : "0.95rem",
                      color: rankColor, width: 32, textAlign: "center", flexShrink: 0,
                    }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: entry.is_me
                        ? "linear-gradient(135deg, var(--primary), #22c55e)"
                        : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.95rem",
                      color: entry.is_me ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                      border: "1.5px solid rgba(255,255,255,0.1)",
                    }}>
                      {entry.username[0]?.toUpperCase()}
                    </div>

                    {/* Name + stats */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: entry.is_me ? "var(--primary)" : "var(--on-surface)", marginBottom: "0.2rem" }}>
                        {entry.username}
                        {entry.is_me && <span style={{ fontSize: "0.65rem", color: "var(--primary)", marginRight: "0.4rem" }}>אני</span>}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span>🎯 {entry.exact_count} בול</span>
                        <span>↗ {entry.direction_count} כיוון</span>
                        <span>📊 {entry.predictions_count} ניחושים</span>
                        {entry.bonus_points > 0 && <span style={{ color: "#ffdb3c" }}>+{entry.bonus_points} בונוס</span>}
                      </div>
                    </div>

                    {/* Picks */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "flex-end" }}>
                      {group.has_champion_pick && entry.champion_pick && (
                        <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span>🏆</span>
                          <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.champion_pick}</span>
                        </div>
                      )}
                      {group.has_top_scorer_pick && entry.top_scorer_pick && (
                        <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span>👟</span>
                          <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.top_scorer_pick}</span>
                        </div>
                      )}
                    </div>

                    {/* Total points */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        fontFamily: "Montserrat,sans-serif", fontWeight: 800,
                        fontSize: "1.4rem", color: entry.is_me ? "var(--primary)" : "#fff",
                        lineHeight: 1,
                      }}>
                        {entry.total_points}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--on-surface-variant)", marginTop: 2 }}>נק׳</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Picks */}
      {tab === "picks" && (
        <div className="glass-card" style={{ borderRadius: 20, padding: "1.75rem", maxWidth: 480 }}>
          <h2 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1.5rem", color: "#fff" }}>
            הניחושים שלי
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {group.has_champion_pick && (
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  🏆 ניחוש אלוף המונדיאל
                </label>
                <input style={inputStyle} type="text" placeholder="שם הנבחרת"
                  value={picks.champion_pick}
                  onChange={e => setPicks(p => ({ ...p, champion_pick: e.target.value }))} />
                <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)", marginTop: "0.25rem" }}>
                  בונוס {group.champion_bonus_pts} נקודות אם תצדק
                  {group.champion_result && (
                    <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>· תוצאה: {group.champion_result}</span>
                  )}
                </div>
              </div>
            )}
            {group.has_top_scorer_pick && (
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  👟 ניחוש מלך שערים
                </label>
                <input style={inputStyle} type="text" placeholder="שם השחקן"
                  value={picks.top_scorer_pick}
                  onChange={e => setPicks(p => ({ ...p, top_scorer_pick: e.target.value }))} />
                <div style={{ fontSize: "0.68rem", color: "var(--on-surface-variant)", marginTop: "0.25rem" }}>
                  בונוס {group.top_scorer_bonus_pts} נקודות אם תצדק
                  {group.top_scorer_result && (
                    <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>· תוצאה: {group.top_scorer_result}</span>
                  )}
                </div>
              </div>
            )}

            {picksStatus && (
              <div style={{
                background: picksStatus.startsWith("✓") ? "rgba(92,222,151,0.1)" : "rgba(248,113,113,0.1)",
                border: `1px solid ${picksStatus.startsWith("✓") ? "rgba(92,222,151,0.3)" : "rgba(248,113,113,0.3)"}`,
                borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.85rem",
                color: picksStatus.startsWith("✓") ? "var(--primary)" : "#f87171",
              }}>{picksStatus}</div>
            )}

            <button onClick={savePicks} disabled={picksSaving} style={{
              background: "var(--primary)", color: "var(--on-primary-container)",
              fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.9rem",
              border: "none", borderRadius: 10, padding: "0.85rem",
              cursor: picksSaving ? "not-allowed" : "pointer", opacity: picksSaving ? 0.7 : 1,
              boxShadow: "0 0 16px rgba(92,222,151,0.2)",
            }}>
              {picksSaving ? "שומר..." : "שמור ניחושים"}
            </button>
          </div>
        </div>
      )}

      {/* Settings (creator only) */}
      {tab === "settings" && is_creator && (
        <div className="glass-card" style={{ borderRadius: 20, padding: "1.75rem", maxWidth: 520 }}>
          <h2 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1.5rem", color: "#fff" }}>
            הגדרות קבוצה
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>שם הקבוצה</label>
              <input style={inputStyle} type="text" value={settings.name ?? ""}
                onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>כללי ניקוד</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", marginBottom: "0.3rem" }}>תוצאה מדויקת</div>
                  <input style={{ ...inputStyle, textAlign: "center" }} type="number" min={1} max={20}
                    value={settings.scoring_exact ?? 4}
                    onChange={e => setSettings(s => ({ ...s, scoring_exact: Number(e.target.value) }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", marginBottom: "0.3rem" }}>כיוון נכון</div>
                  <input style={{ ...inputStyle, textAlign: "center" }} type="number" min={0} max={10}
                    value={settings.scoring_direction ?? 1}
                    onChange={e => setSettings(s => ({ ...s, scoring_direction: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            {/* Champion toggle + result */}
            <div className="glass-card" style={{ borderRadius: 12, padding: "0.85rem 1rem", border: settings.has_champion_pick ? "1px solid rgba(92,222,151,0.25)" : "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: settings.has_champion_pick ? "0.75rem" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span>🏆</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>ניחוש אלוף</div>
                    {settings.has_champion_pick && <div style={{ fontSize: "0.7rem", color: "var(--on-surface-variant)" }}>בונוס: {settings.champion_bonus_pts} נק׳</div>}
                  </div>
                </div>
                <Toggle value={!!settings.has_champion_pick} onChange={() => setSettings(s => ({ ...s, has_champion_pick: !s.has_champion_pick }))} />
              </div>
              {settings.has_champion_pick && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>נקודות בונוס:</span>
                    <input type="number" min={1} max={50} value={settings.champion_bonus_pts ?? 5}
                      onChange={e => setSettings(s => ({ ...s, champion_bonus_pts: Number(e.target.value) }))}
                      style={{ ...inputStyle, width: 80, padding: "4px 8px", textAlign: "center" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>תוצאה (אם ידועה):</span>
                    <input type="text" placeholder="ארגנטינה" value={settings.champion_result ?? ""}
                      onChange={e => setSettings(s => ({ ...s, champion_result: e.target.value }))}
                      style={{ ...inputStyle, flex: 1, padding: "4px 10px" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Top scorer toggle + result */}
            <div className="glass-card" style={{ borderRadius: 12, padding: "0.85rem 1rem", border: settings.has_top_scorer_pick ? "1px solid rgba(92,222,151,0.25)" : "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: settings.has_top_scorer_pick ? "0.75rem" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span>👟</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>ניחוש מלך שערים</div>
                    {settings.has_top_scorer_pick && <div style={{ fontSize: "0.7rem", color: "var(--on-surface-variant)" }}>בונוס: {settings.top_scorer_bonus_pts} נק׳</div>}
                  </div>
                </div>
                <Toggle value={!!settings.has_top_scorer_pick} onChange={() => setSettings(s => ({ ...s, has_top_scorer_pick: !s.has_top_scorer_pick }))} />
              </div>
              {settings.has_top_scorer_pick && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>נקודות בונוס:</span>
                    <input type="number" min={1} max={50} value={settings.top_scorer_bonus_pts ?? 3}
                      onChange={e => setSettings(s => ({ ...s, top_scorer_bonus_pts: Number(e.target.value) }))}
                      style={{ ...inputStyle, width: 80, padding: "4px 8px", textAlign: "center" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>תוצאה (אם ידועה):</span>
                    <input type="text" placeholder="קיליאן מבאפה" value={settings.top_scorer_result ?? ""}
                      onChange={e => setSettings(s => ({ ...s, top_scorer_result: e.target.value }))}
                      style={{ ...inputStyle, flex: 1, padding: "4px 10px" }} />
                  </div>
                </div>
              )}
            </div>

            {settingsStatus && (
              <div style={{
                background: settingsStatus.startsWith("✓") ? "rgba(92,222,151,0.1)" : "rgba(248,113,113,0.1)",
                border: `1px solid ${settingsStatus.startsWith("✓") ? "rgba(92,222,151,0.3)" : "rgba(248,113,113,0.3)"}`,
                borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.85rem",
                color: settingsStatus.startsWith("✓") ? "var(--primary)" : "#f87171",
              }}>{settingsStatus}</div>
            )}

            <button onClick={saveSettings} disabled={settingsSaving} style={{
              background: "var(--primary)", color: "var(--on-primary-container)",
              fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.9rem",
              border: "none", borderRadius: 10, padding: "0.85rem",
              cursor: settingsSaving ? "not-allowed" : "pointer", opacity: settingsSaving ? 0.7 : 1,
              boxShadow: "0 0 16px rgba(92,222,151,0.2)",
            }}>
              {settingsSaving ? "שומר..." : "עדכן הגדרות"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
