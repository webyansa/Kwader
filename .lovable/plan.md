

## خطة تنفيذ نظام RBAC وتحسين تجربة ما بعد تسجيل الدخول

### تحليل الوضع الحالي

الأدوار الموجودة في قاعدة البيانات: `super_admin`, `admin`, `moderator`, `finance`, `support`, `org_owner`, `org_hr_manager`, `org_viewer`

المطلوب إضافته: دور `job_seeker` (باحث عن وظيفة) غير موجود حالياً.

**خريطة الربط بين الأدوار المطلوبة والموجودة:**

```text
المطلوب                → الموجود في قاعدة البيانات
─────────────────────────────────────────────────
PLATFORM_ADMIN         → super_admin, admin
PLATFORM_EDITOR        → moderator
JOB_SEEKER             → job_seeker (جديد)
ORGANIZATION_OWNER     → org_owner
ORGANIZATION_STAFF     → org_hr_manager, org_viewer
```

---

### المهام التنفيذية

#### 1. تحديث قاعدة البيانات
- إضافة `job_seeker` إلى enum `app_role`
- إضافة عمود `status` (active/suspended) إلى جدول `profiles` لإدارة حالة الحساب

#### 2. إنشاء ملف أدوات الأدوار `src/lib/roles.ts`
- دوال مركزية: `isAdmin()`, `isEditor()`, `isOrganization()`, `isJobSeeker()`, `hasRole()`, `isSuspended()`
- تحديد مسار التوجيه حسب الدور: `getRedirectPath(roles)`

#### 3. تحديث `useAuth` hook
- إضافة `status` من جدول `profiles` إلى السياق
- توفير `status` للمكونات لفحص حالة التعليق

#### 4. تحديث صفحة تسجيل الدخول (`Login.tsx`)
- فحص حالة الحساب (suspended) وعرض رسالة حظر
- توجيه تلقائي حسب الدور باستخدام `getRedirectPath()`

#### 5. تحديث شريط التنقل (`Navbar.tsx`)
- **مستخدم غير مسجل:** أزرار تسجيل الدخول والتسجيل
- **مدير المنصة/محرر:** زر "لوحة التحكم" + إخفاء "انشر وظيفة"
- **حساب جمعية:** زر "لوحة الجمعية" + "انشر وظيفة"
- **باحث عن وظيفة:** "طلباتي" + "الوظائف المحفوظة"
- **الجميع بعد الدخول:** أفاتار + قائمة منسدلة (لوحتي، الملف الشخصي، تسجيل الخروج)

#### 6. تحديث حماية المسارات (`ProtectedRoute.tsx`)
- دعم فحص التعليق وعرض صفحة 403
- تحديث `App.tsx` بالمسارات المحمية:
  - `/admin/*` → super_admin, admin, moderator
  - `/org/*` → org_owner, org_hr_manager, org_viewer
  - `/job-seeker/*` → job_seeker

#### 7. إنشاء صفحات جديدة
- `/org/dashboard` — لوحة تحكم الجمعية (هيكل أساسي)
- `/job-seeker/dashboard` — لوحة الباحث عن وظيفة (هيكل أساسي)
- صفحة 403 (غير مصرح)

#### 8. تحديث صفحة التسجيل
- إضافة خيار التسجيل كباحث عن وظيفة (بدون بيانات جمعية) مع إسناد دور `job_seeker` تلقائياً

---

### التفاصيل التقنية

**الملفات الجديدة:**
- `src/lib/roles.ts`
- `src/pages/org/OrgDashboard.tsx`
- `src/pages/job-seeker/JobSeekerDashboard.tsx`
- `src/pages/Forbidden.tsx`
- `src/components/layout/UserMenu.tsx` (قائمة المستخدم المنسدلة)

**الملفات المعدّلة:**
- `src/hooks/useAuth.tsx` — إضافة status
- `src/pages/Login.tsx` — توجيه ذكي + فحص التعليق
- `src/components/layout/Navbar.tsx` — عرض عناصر حسب الدور
- `src/components/auth/ProtectedRoute.tsx` — فحص التعليق
- `src/App.tsx` — إضافة المسارات الجديدة
- `src/pages/Register.tsx` — خيار تسجيل باحث عن وظيفة

**Migration SQL:**
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'job_seeker';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
```

