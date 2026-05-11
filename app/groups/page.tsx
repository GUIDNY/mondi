"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Group {
  id: number;
  name: string;
  code: string;
  creator_id: number;
  creator_username: string;
  scoring_exact: number;
  scoring_direction: number;
  has_champion_pick: boolean;
  has_top_scorer_pick: boolean;
  is_creator: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        background: copied ? "rgba(92,222,151,0.2)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${copied ? "rgba(92,222,151,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: copied ? "var(--primary)" : "var(--on-surface-variant)",
        borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem",
        cursor: "pointer", fontFamily: "Rubik,sans-serif", transition: "all 0.15s",
      }}
    >
      {copied ? "✓ הועתק" : "העתק"}
    </button>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"my" | "create" | "join">("my");
  const [createForm, setCreateForm] = useState({
    name: "",
    scoring_exact: 4,
    scoring_direction: 1,
    has_champion_pick: false,
    has_top_scorer_pick: false,
    champion_bonus_pts: 5,
    top_scorer_bonus_pts: 3,
  });
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/groups").then(r => r.json()).then(d => { setGroups(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function createGroup() {
    if (!createForm.name.trim()) { setStatus("הכנס שם לקבוצה"); return; }
    setSaving(true); setStatus("");
    const res = await fetch("/api/groups", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) router.push(`/groups/${data.code}`);
    else setStatus(data.error || "שגיאה");
  }

  async function joinGroup() {
    if (!joinCode.trim()) { setStatus("הכנס קוד"); return; }
    setSaving(true); setStatus("");
    const res = await fetch("/api/groups/join", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) router.push(`/groups/${data.code}`);
    else setStatus(data.error || "שגיאה");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.7rem 1rem", borderRadius: 10,
    border: "1px solid rgba(61,74,64,0.5)", background: "rgba(255,255,255,0.03)",
    color: "var(--on-surface)", fontSize: "0.9rem", fontFamily: "Rubik,sans-serif", outline: "none",
  };

  const chipTab = (t: "my" | "create" | "join", label: string) => (
    <button onClick={() => { setTab(t); setStatus(""); }} style={{
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
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#fff", marginBottom: "0.3rem" }}>
          הקבוצות שלי
        </h1>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.88rem" }}>
          צור קבוצה פרטית, שלח קוד לחברים, תחרו ביניכם
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {chipTab("my", "הקבוצות שלי")}
        {chipTab("create", "צור קבוצה")}
        {chipTab("join", "הצטרף לקבוצה")}
      </div>

      {/* Error/success */}
      {status && (
        <div style={{
          background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1rem",
          color: "#f87171", fontSize: "0.85rem",
        }}>{status}</div>
      )}

      {/* My Groups */}
      {tab === "my" && (
        <div>
          {loading ? (
            <div style={{ color: "var(--on-surface-variant)", padding: "2rem", textAlign: "center" }}>טוען...</div>
          ) : groups.length === 0 ? (
            <div className="glass-card" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--on-surface-variant)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👥</div>
              <p style={{ marginBottom: "1rem" }}>עדיין לא שייך לקבוצה אף אחת</p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button onClick={() => setTab("create")} style={{
                  background: "var(--primary)", color: "var(--on-primary-container)",
                  fontWeight: 700, border: "none", borderRadius: 10, padding: "10px 22px",
                  cursor: "pointer", fontFamily: "Rubik,sans-serif", fontSize: "0.88rem",
                }}>צור קבוצה</button>
                <button onClick={() => setTab("join")} style={{
                  background: "rgba(255,255,255,0.07)", color: "var(--on-surface)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 22px",
                  cursor: "pointer", fontFamily: "Rubik,sans-serif", fontSize: "0.88rem",
                }}>הצטרף לקבוצה</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {groups.map((g) => (
                <Link key={g.id} href={`/groups/${g.code}`} style={{ textDecoration: "none" }}>
                  <div className="glass-card" style={{
                    borderRadius: 16, padding: "1.1rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "1rem",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "border-color 0.15s, background 0.15s",
                    cursor: "pointer",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "linear-gradient(135deg, rgba(92,222,151,0.25), rgba(92,222,151,0.1))",
                      border: "1px solid rgba(92,222,151,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.3rem", flexShrink: 0,
                    }}>👥</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--on-surface)", marginBottom: "0.2rem" }}>
                        {g.name}
                        {g.is_creator && <span style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 500, marginRight: "0.5rem", border: "1px solid rgba(92,222,151,0.3)", borderRadius: 6, padding: "1px 6px" }}>יוצר</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                        ניקוד: {g.scoring_exact} בול / {g.scoring_direction} כיוון
                        {g.has_champion_pick && " · אלוף"}
                        {g.has_top_scorer_pick && " · מלך שערים"}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.1rem",
                        color: "var(--primary)", letterSpacing: "0.1em",
                        background: "rgba(92,222,151,0.08)", border: "1px solid rgba(92,222,151,0.2)",
                        borderRadius: 8, padding: "4px 12px",
                      }}>{g.code}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--on-surface-variant)", marginTop: "2px" }}>קוד כניסה</div>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: 20 }}>chevron_left</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Group */}
      {tab === "create" && (
        <div className="glass-card" style={{ borderRadius: 20, padding: "1.75rem", maxWidth: 520 }}>
          <h2 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem", color: "#fff" }}>
            יצירת קבוצה חדשה
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                שם הקבוצה
              </label>
              <input style={inputStyle} type="text" placeholder="למשל: חברים מהעבודה"
                value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Scoring */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                כללי ניקוד
              </label>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", marginBottom: "0.3rem" }}>תוצאה מדויקת</div>
                  <input style={{ ...inputStyle, textAlign: "center" }} type="number" min={1} max={20}
                    value={createForm.scoring_exact}
                    onChange={e => setCreateForm(f => ({ ...f, scoring_exact: Number(e.target.value) }))} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--on-surface-variant)", marginBottom: "0.3rem" }}>כיוון נכון</div>
                  <input style={{ ...inputStyle, textAlign: "center" }} type="number" min={0} max={10}
                    value={createForm.scoring_direction}
                    onChange={e => setCreateForm(f => ({ ...f, scoring_direction: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            {/* Bonus picks */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                בונוס נוסף (אופציונלי)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {/* Champion pick */}
                <div className="glass-card" style={{ borderRadius: 12, padding: "0.85rem 1rem", border: createForm.has_champion_pick ? "1px solid rgba(92,222,151,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: createForm.has_champion_pick ? "0.75rem" : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>🏆</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>ניחוש אלוף</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--on-surface-variant)" }}>כל אחד בוחר מי יזכה במונדיאל</div>
                      </div>
                    </div>
                    <button onClick={() => setCreateForm(f => ({ ...f, has_champion_pick: !f.has_champion_pick }))} style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: createForm.has_champion_pick ? "var(--primary)" : "rgba(255,255,255,0.1)",
                      position: "relative", transition: "background 0.2s",
                    }}>
                      <div style={{
                        position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
                        background: "#fff", transition: "left 0.2s",
                        left: createForm.has_champion_pick ? "calc(100% - 21px)" : 3,
                      }} />
                    </button>
                  </div>
                  {createForm.has_champion_pick && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)" }}>נקודות בונוס:</span>
                      <input type="number" min={1} max={50} value={createForm.champion_bonus_pts}
                        onChange={e => setCreateForm(f => ({ ...f, champion_bonus_pts: Number(e.target.value) }))}
                        style={{ ...inputStyle, width: 70, padding: "4px 8px", textAlign: "center" }} />
                    </div>
                  )}
                </div>

                {/* Top scorer pick */}
                <div className="glass-card" style={{ borderRadius: 12, padding: "0.85rem 1rem", border: createForm.has_top_scorer_pick ? "1px solid rgba(92,222,151,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: createForm.has_top_scorer_pick ? "0.75rem" : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>👟</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>ניחוש מלך שערים</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--on-surface-variant)" }}>כל אחד בוחר שחקן</div>
                      </div>
                    </div>
                    <button onClick={() => setCreateForm(f => ({ ...f, has_top_scorer_pick: !f.has_top_scorer_pick }))} style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: createForm.has_top_scorer_pick ? "var(--primary)" : "rgba(255,255,255,0.1)",
                      position: "relative", transition: "background 0.2s",
                    }}>
                      <div style={{
                        position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
                        background: "#fff", transition: "left 0.2s",
                        left: createForm.has_top_scorer_pick ? "calc(100% - 21px)" : 3,
                      }} />
                    </button>
                  </div>
                  {createForm.has_top_scorer_pick && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)" }}>נקודות בונוס:</span>
                      <input type="number" min={1} max={50} value={createForm.top_scorer_bonus_pts}
                        onChange={e => setCreateForm(f => ({ ...f, top_scorer_bonus_pts: Number(e.target.value) }))}
                        style={{ ...inputStyle, width: 70, padding: "4px 8px", textAlign: "center" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={createGroup} disabled={saving} style={{
              background: "var(--primary)", color: "var(--on-primary-container)",
              fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.9rem",
              border: "none", borderRadius: 10, padding: "0.85rem",
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
              boxShadow: "0 0 20px rgba(92,222,151,0.25)", marginTop: "0.25rem",
            }}>
              {saving ? "יוצר..." : "צור קבוצה"}
            </button>
          </div>
        </div>
      )}

      {/* Join Group */}
      {tab === "join" && (
        <div className="glass-card" style={{ borderRadius: 20, padding: "1.75rem", maxWidth: 400 }}>
          <h2 style={{ fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem", color: "#fff" }}>
            הצטרף לקבוצה
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                קוד הקבוצה (6 תווים)
              </label>
              <input style={{ ...inputStyle, textAlign: "center", fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.15em" }}
                type="text" maxLength={6} placeholder="ABC123"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())} />
            </div>
            <button onClick={joinGroup} disabled={saving || joinCode.length < 6} style={{
              background: joinCode.length < 6 ? "rgba(255,255,255,0.1)" : "var(--primary)",
              color: joinCode.length < 6 ? "var(--on-surface-variant)" : "var(--on-primary-container)",
              fontFamily: "Rubik,sans-serif", fontWeight: 700, fontSize: "0.9rem",
              border: "none", borderRadius: 10, padding: "0.85rem",
              cursor: (saving || joinCode.length < 6) ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1, transition: "all 0.15s",
            }}>
              {saving ? "מצטרף..." : "הצטרף"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
