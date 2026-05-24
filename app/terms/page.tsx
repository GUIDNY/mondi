export default function TermsPage() {
  const updated = "25 במאי 2026";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "Rubik,sans-serif", lineHeight: 1.8 }}>
      <h1 style={{
        fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: "1.8rem",
        color: "#fff", marginBottom: "0.25rem",
      }}>
        תנאי שימוש
      </h1>
      <p style={{ color: "var(--on-surface-variant)", fontSize: "0.8rem", marginBottom: "2rem" }}>
        עודכן לאחרונה: {updated}
      </p>

      {[
        {
          title: "1. השירות",
          body: `Mondi היא אפליקציית ניחושים חינמית למונדיאל 2026. המשתמשים מנחשים תוצאות משחקים, צוברים נקודות, ומתחרים אחד עם השני. האפליקציה אינה כרוכה בהימורים בכסף אמיתי בשום צורה.`,
        },
        {
          title: "2. גיל מינימלי",
          body: `השימוש באפליקציה מותר מגיל 13 ומעלה. משתמשים מתחת לגיל 13 אינם רשאים ליצור חשבון.`,
        },
        {
          title: "3. חשבון משתמש",
          body: `אתה אחראי על שמירת פרטי הכניסה שלך. אין לפתוח מספר חשבונות לאותו משתמש. אנו שומרים לעצמנו את הזכות לחסום חשבונות שמפרים את כללי השימוש.`,
        },
        {
          title: "4. ניחושים ונקודות",
          body: `הניחושים ניתנים לשינוי עד 15 דקות לפני תחילת המשחק. מערכת הניקוד: 4 נקודות לתוצאה מדויקת, 1 נקודה לכיוון נכון (ניצחון/הפסד/תיקו). הנקודות הם לצורכי משחק בלבד וללא ערך כספי.`,
        },
        {
          title: "5. תוכן",
          body: `אין לפרסם תוכן פוגעני, גזעני, או מאיים בשום חלק של האפליקציה, לרבות שמות משתמש. שמות פוגעניים יוסרו ללא התראה.`,
        },
        {
          title: "6. הגבלת אחריות",
          body: `Mondi מסופקת "כמו שהיא" ללא אחריות מכל סוג. אנו לא אחראים לשגיאות בתוצאות המשחקים, לניתוקים, או לאובדן נתונים. הנקודות הן וירטואליות ואין להן ערך כספי.`,
        },
        {
          title: "7. שינויים בשירות",
          body: `אנו רשאים לשנות, להשעות, או לסגור את השירות בכל עת. במקרה של סגירה, נעשה מאמץ להודיע מראש.`,
        },
        {
          title: "8. יצירת קשר",
          body: `לכל שאלה: support@mondi.app`,
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
