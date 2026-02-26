

# خطة التنفيذ: المصادقة + صفحة الوظائف + تفاصيل الوظيفة

## 1. نظام المصادقة

### صفحات جديدة:
- **`/login`** — تسجيل دخول بالبريد وكلمة المرور (للجمعيات والإدارة)
- **`/register`** — تسجيل جمعية جديدة (بيانات الجمعية + مسؤول الحساب)
- **`/forgot-password`** — استعادة كلمة المرور
- **`/reset-password`** — تعيين كلمة مرور جديدة

### ملفات مساعدة:
- **`src/hooks/useAuth.tsx`** — AuthContext مع `onAuthStateChange` + `getSession`، يوفر: user, session, role, orgId, signOut, loading
- **`src/components/auth/ProtectedRoute.tsx`** — يحمي المسارات حسب الدور

### منطق التسجيل:
1. `signUp` بالبريد + كلمة المرور + `full_name` في metadata
2. trigger `handle_new_user` ينشئ profile تلقائيًا
3. بعد التسجيل → صفحة "تحقق من بريدك"
4. عند تسجيل جمعية: ينشئ سجل organization بحالة `pending` + يضيف دور `org_owner` في `user_roles`

## 2. صفحة الوظائف `/jobs`

### ملفات:
- **`src/pages/Jobs.tsx`** — الصفحة الرئيسية
- **`src/components/jobs/JobCard.tsx`** — بطاقة وظيفة (شعار، عنوان، مدينة، نوع عمل، badges Urgent/Featured، تاريخ إغلاق)
- **`src/components/jobs/JobFilters.tsx`** — فلاتر جانبية (بحث نصي، مدينة، تصنيف، نوع عمل، عن بُعد، مستوى خبرة، عاجلة/مميزة)
- **`src/hooks/useJobs.ts`** — React Query hook يجلب الوظائف المنشورة مع الفلاتر + join على organizations و categories

### ترتيب النتائج:
- Urgent أولاً → Featured → الأحدث (حسب `published_at`)

## 3. صفحة تفاصيل الوظيفة `/jobs/:id`

### ملفات:
- **`src/pages/JobDetails.tsx`** — صفحة التفاصيل
- **`src/components/jobs/ApplicationForm.tsx`** — نموذج التقديم الداخلي (اسم، بريد، هاتف، CV upload، رسالة تغطية)
- **`src/components/jobs/ReportDialog.tsx`** — حوار الإبلاغ عن وظيفة
- **`src/components/jobs/ShareButtons.tsx`** — أزرار المشاركة (نسخ رابط، واتساب، تويتر)
- **`src/components/jobs/SimilarJobs.tsx`** — وظائف مشابهة (نفس التصنيف أو المدينة)

### نموذج التقديم:
- Zod validation للحقول
- رفع CV إلى storage bucket `cvs` (حد 5MB، PDF/DOC/DOCX فقط)
- Insert في جدول `applications` (RLS يسمح بـ INSERT للجميع)
- رسالة نجاح بعد التقديم

## 4. تحديث التوجيه (Router)

إضافة المسارات في `App.tsx`:
```
/login, /register, /forgot-password, /reset-password
/jobs, /jobs/:id
```

لف التطبيق بـ `AuthProvider`.

## ملاحظات تقنية
- لا تغيير على جداول قاعدة البيانات (البنية الحالية كافية)
- RLS موجود: `applications` يسمح INSERT للجميع، `jobs` يسمح SELECT للمنشورة
- التصميم RTL عربي متجاوب يتبع النمط الحالي (Teal palette + Tajawal font)

