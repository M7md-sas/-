# مالي — دليل المشروع للـ Claude

## نظرة عامة
تطبيق PWA لتتبع المصروفات الشخصية. مبني بـ HTML/CSS/JS خالص بدون frameworks.
- الملف الرئيسي: `index.html`
- الـ Service Worker: `sw.js`
- الـ manifest: `manifest.json`
- الأيقونات: `icon-192.png`, `icon-512.png`

---

## بناء الـ APK

### الطريقة
Capacitor يلف الـ PWA في APK أندرويد. البناء يتم عبر GitHub Actions تلقائياً.

### Workflow
`.github/workflows/build-apk.yml` — يُشغَّل عند كل push على `main`.

يبني نوعين:
- **Debug APK** — دائماً (للتجربة الشخصية)
- **Release APK** — فقط إذا كانت GitHub Secrets موجودة (للبلاي ستور)

### GitHub Secrets المطلوبة للـ Release
| Secret | القيمة |
|--------|--------|
| `KEYSTORE_BASE64` | ملف الـ keystore مشفر بـ base64 (موجود في آخر رسالة من Claude) |
| `KEYSTORE_PASSWORD` | `malii2024store` |
| `KEY_ALIAS` | `malii` |
| `KEY_PASSWORD` | `malii2024store` |

مكان إضافة الـ Secrets: GitHub ← Settings ← Secrets and variables ← Actions

### تنزيل الـ APK
GitHub ← Actions ← آخر run ناجح ← Artifacts ← نزّل الملف المطلوب

---

## نشر على Google Play Store

### المتطلبات
- حساب Google Play Developer (رسوم $25 مرة واحدة على `play.google.com/console`)
- Release APK موقّع (يُبنى تلقائياً بعد إضافة الـ Secrets أعلاه)

### الخطوات
1. أضف الـ Secrets في GitHub (جدول أعلاه)
2. اعمل push → سيُبنى `app-release.apk` تلقائياً
3. في Play Console: Create app → Production → New release → ارفع الـ APK
4. أضف وصف + لقطات شاشة → Submit for review
5. انتظر مراجعة Google (1-3 أيام)

---

## معلومات الـ Keystore
- **Algorithm:** RSA 2048-bit
- **Validity:** 10,000 يوم
- **Alias:** `malii`
- **App ID:** `com.malii.app`
- **تاريخ الإنشاء:** 2026-07-07

> تحذير: لا تغيّر الـ keystore أو كلمة المرور بعد نشر التطبيق — لو ضاعت ما تقدر تحدّث التطبيق على البلاي ستور أبداً.

---

## أمان الريبو
الريبو **عام (Public)** — أي أحد يقدر يشوف الكود لكن لا يقدر يعدّل.
لتحويله لخاص: GitHub ← Settings ← Danger Zone ← Change visibility → Private
