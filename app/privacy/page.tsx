export default function PrivacyPage() {
  const updated = "25 במאי 2026";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "Rubik,sans-serif", lineHeight: 1.8 }}>
      <h1 style={{
        fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem",
        color: "#fff", marginBottom: "0.25rem",
      }}>
        מדיניות פרטיות
      </h1>
      <p style={{ color: "var(--on-surface-variant)", fontSize: "0.8rem", marginBottom: "2rem" }}>
        עודכן לאחרונה: {updated}
      </p>

      {[
        {
          title: "1. מה אנחנו אוספים",
          body: `כאשר אתה נרשם ל-Mondi אנו שומרים: שם משתמש, כתובת אימייל, וסיסמה מוצפנת. כמו כן אנו שומרים את הניחושים שאתה מזין לתוצאות משחקי המונדיאל.`,
        },
        {
          title: "2. למה אנחנו משתמשים במידע",
          body: `המידע משמש אך ורק להפעלת שירות הניחושים — כדי להציג את הניחושים שלך, לחשב נקודות, ולהציג טבלת דירוג. אנחנו לא מוכרים, משכירים, או משתפים את המידע שלך עם צדדים שלישיים.`,
        },
        {
          title: "3. אחסון מידע",
          body: `המידע מאוחסן בשרתי Supabase (supabase.com) שממוקמים באיחוד האירופי. הסיסמאות מוצפנות ולעולם לא נשמרות בטקסט גלוי.`,
        },
        {
          title: "4. עוגיות (Cookies)",
          body: `אנו משתמשים בעוגיית JWT אחת בלבד — לצורך שמירת ההתחברות שלך. אין מעקב, אין Google Analytics, אין פרסום.`,
        },
        {
          title: "5. זכויותיך",
          body: `יש לך זכות לבקש מחיקה מלאה של החשבון ונתוניך בכל עת. שלח בקשה לאימייל: bd12123@gmail.com ונמחק את כל המידע שלך תוך 7 ימי עסקים.`,
        },
        {
          title: "6. שינויים במדיניות",
          body: `אם נשנה מדיניות זו, נעדכן את התאריך בראש הדף. שימוש מתמשך באפליקציה לאחר עדכון מהווה הסכמה לשינויים.`,
        },
        {
          title: "7. יצירת קשר",
          body: `לשאלות בנושא פרטיות: bd12123@gmail.com`,
        },
      ].map((s) => (
        <div key={s.title} style={{ marginBottom: "1.75rem" }}>
          <h2 style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: "1rem",
            color: "var(--primary)", marginBottom: "0.4rem",
          }}>
            {s.title}
          </h2>
          <p style={{ color: "rgba(188,202,189,0.85)", fontSize: "0.9rem", margin: 0 }}>
            {s.body}
          </p>
        </div>
      ))}
    </div>
  );
}
