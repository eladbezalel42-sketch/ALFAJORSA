# ALFAJORSA Mobile App

אפליקציית הזמנות ראשונית של ALFAJORSA עבור Android, iPhone ו-Web.

## מה כלול

- מיתוג קרם–זהב ומונוגרמת Af.
- שמונה טעמי פיילוט.
- הזמנת יחידים ומארזי 6/12 בהרכבה אישית.
- סל, כמויות וחישוב מחיר משוער.
- יצירת הודעת הזמנה מסודרת ל-WhatsApp.
- TypeScript במצב strict.
- GitHub Action שמייצר APK להתקנה ישירה, ללא Google Play.
- פרופיל EAS מסוג preview ל-APK עתידי.

## הפעלה מקומית

```bash
npm install
npm start
```

בדיקה בדפדפן:

```bash
npm run web
```

## יצירת APK דרך GitHub

1. פתחו Actions.
2. בחרו Build Android APK.
3. לחצו Run workflow.
4. בסיום הורידו את artifact בשם `ALFAJORSA-Android-v0.2.0-debug`.

ה-APK נבנה גם אוטומטית בכל שינוי בקובצי האפליקציה בענף main או agent/**.

## נתונים שדורשים אימות לפני השקה מסחרית

- מחירי המכירה.
- רשימת הטעמים הסופית.
- זמינות ומשלוחים.
- תמונות מוצר אמיתיות.
- מדיניות פרטיות ותנאי שימוש.
