"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    emoji: "⚽",
    title: "נחש תוצאות",
    desc: "נחש את תוצאות משחקי הכדורגל לפני שהם מתחילים",
  },
  {
    emoji: "🏆",
    title: "צבור נקודות",
    desc: "4 נקודות לתוצאה מדויקת, 1 נקודה לכיוון נכון — כל משחק חשוב",
  },
  {
    emoji: "👥",
    title: "נצח את החברים",
    desc: "הצטרף לקבוצות פרטיות והתחרה עם חברים בטבלת הדירוג",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("onboarding_done")) {
      router.replace("/");
    }
  }, [router]);

  function finish(path: string) {
    localStorage.setItem("onboarding_done", "1");
    router.replace(path);
  }

  const s = slides[slide];

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #061209 0%, #0e2416 50%, #061209 100%)",
      padding: "0", overflow: "hidden", position: "relative",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(92,222,151,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Skip */}
      {slide < slides.length - 1 && (
        <button onClick={() => setSlide(slides.length - 1)} style={{
          position: "absolute", top: 20, left: 20, background: "transparent",
          border: "none", color: "rgba(188,202,189,0.5)", fontSize: "0.85rem",
          cursor: "pointer", fontFamily: "Rubik,sans-serif", zIndex: 10,
        }}>
          דלג
        </button>
      )}

      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "3.5rem" }}>
        <img src="/mondi-logo-new.png" alt="MatchMate" style={{
          width: 80, height: 80, borderRadius: 20,
          boxShadow: "0 0 30px rgba(92,222,151,0.25)",
        }} />
      </div>

      {/* App name */}
      <div style={{
        textAlign: "center", marginTop: "0.75rem",
        fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: "1.6rem",
        background: "linear-gradient(135deg, #fff 0%, #5cde97 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        MatchMate
      </div>

      {/* Slide content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2rem 2.5rem", textAlign: "center",
      }}>
        <div style={{ fontSize: "5rem", marginBottom: "1.5rem", lineHeight: 1 }}>
          {s.emoji}
        </div>
        <h2 style={{
          fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1.6rem",
          color: "#fff", marginBottom: "0.75rem",
        }}>
          {s.title}
        </h2>
        <p style={{
          fontFamily: "Rubik,sans-serif", color: "rgba(188,202,189,0.75)",
          fontSize: "1rem", lineHeight: 1.7, maxWidth: 300,
        }}>
          {s.desc}
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setSlide(i)} style={{
            width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
            background: i === slide ? "var(--primary)" : "rgba(92,222,151,0.25)",
            cursor: "pointer", transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ padding: "0 1.5rem 3rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {slide < slides.length - 1 ? (
          <button onClick={() => setSlide(slide + 1)} style={{
            background: "var(--primary)", color: "#051a0b",
            fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1rem",
            border: "none", borderRadius: 14, padding: "0.95rem",
            cursor: "pointer", boxShadow: "0 0 24px rgba(92,222,151,0.35)",
          }}>
            הבא ←
          </button>
        ) : (
          <>
            <button onClick={() => finish("/login?tab=register")} style={{
              background: "var(--primary)", color: "#051a0b",
              fontFamily: "Rubik,sans-serif", fontWeight: 800, fontSize: "1rem",
              border: "none", borderRadius: 14, padding: "0.95rem",
              cursor: "pointer", boxShadow: "0 0 24px rgba(92,222,151,0.35)",
            }}>
              🚀 הרשמה — בוא נתחיל!
            </button>
            <button onClick={() => finish("/")} style={{
              background: "transparent",
              border: "1px solid rgba(92,222,151,0.25)",
              color: "rgba(188,202,189,0.7)",
              fontFamily: "Rubik,sans-serif", fontWeight: 600, fontSize: "0.9rem",
              borderRadius: 14, padding: "0.9rem",
              cursor: "pointer",
            }}>
              המשך כאורח
            </button>
          </>
        )}
      </div>
    </div>
  );
}
