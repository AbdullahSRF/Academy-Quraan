# الخطوة 4: ربط GitHub مع Firebase App Hosting

> لا يمكن تنفيذ الربط من الطرفية وحدها — تحتاج **متصفحًا** لتسجيل الدخول إلى Firebase وGitHub والموافقة على التطبيق.

## أ) تجهيز الكود على GitHub (مرة واحدة)

إن لم يكن المشروع على GitHub بعد:

1. أنشئ مستودعًا جديدًا على [github.com/new](https://github.com/new) (بدون README إن كان المجلد المحلي فيه كود جاهز).
2. من مجلد المشروع على جهازك (مثلاً `D:\حديثا\Academy`):

```bash
git init
git add .
git commit -m "Initial commit for Firebase App Hosting"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

- تأكد أن **`.env` غير مرفوع** (موجود في `.gitignore`).

## ب) ربط المستودع من Firebase (الخطوة 4 الفعلية)

1. افتح [Firebase Console](https://console.firebase.google.com/) → مشروعك.
2. من القائمة: **Build** → **App Hosting** (أو **Hosting & Serverless** → **App Hosting**).
3. إن لم يكن عندك backend بعد: **Get started** / **Create backend**.
4. في معالج الإعداد، عند خطوة **ربط GitHub**:
   - اضغط **Connect to GitHub** (أو ما يشابه).
   - سيفتح GitHub ويطلب تثبيت تطبيق **Firebase** على حسابك أو منظمتك.
   - اختر **All repositories** أو **Only select repositories** وحدد مستودع **أكاديمية التحفيظ** فقط (أفضل للأمان).
   - وافق على الصلاحيات المطلوبة.
5. ارجع إلى Firebase واختر:
   - **Repository**: المستودع الذي رفعت إليه الكود.
   - **Branch**: عادة `main`.
   - **Root directory**: `/` (جذر المشروع حيث يوجد `package.json`).
6. أكمل إنشاء الـ backend وانتظر أول **rollout**.

## ج) إن لم يظهر المستودع في القائمة

- تأكد أن تطبيق Firebase على GitHub مثبّت على **نفس الحساب** الذي يملك المستودع.
- إن المستودع تحت **منظمة (Organization)**: قد تحتاج مشرف المنظمة يوافق على تثبيت التطبيق.
- جرّب **Refresh** في واجهة Firebase بعد التثبيت.

## د) بعد الربط

- كل **push** إلى الفرع المحدد يطلق نشرًا جديدًا (إن كان **Automatic rollouts** مفعّلاً).
- عيّن متغيرات البيئة من **Backend → Settings → Environment** كما في [`FIREBASE_APP_HOSTING.md`](./FIREBASE_APP_HOSTING.md).

---

**الخلاصة:** الجزء الذي «أعمله لك» من هنا هو **الشرح والملفات**؛ أما **زر ربط GitHub** فهو داخل **Firebase Console** ويتطلب دخولك أنت.
