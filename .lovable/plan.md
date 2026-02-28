

## خطة إعادة تنظيم المنصة: بوابة الكيانات + بوابة الكوادر

### ملخص التغييرات

تحويل المسارات والمسميات من النظام الحالي (`/org/*`, `/job-seeker/*`, "جمعية", "باحث عن وظيفة") إلى النظام الجديد (`/portal/*`, `/talents/*`, "كيانات", "كوادر") مع إضافة صفحات جديدة وتحسين الهيدر.

### التفاصيل التقنية

#### 1. تحديث قاعدة البيانات
- لا تغيير على الأدوار الحالية — `job_seeker` يبقى كما هو تقنياً (يُعرض كـ"كوادر" في الواجهة فقط)
- إضافة أعمدة جديدة لجدول `job_seeker_profiles`: `summary`, `education`, `certifications`, `job_preferences`, `profile_completion_percentage`

#### 2. تحديث `src/lib/roles.ts`
- تحديث `getRedirectPath()` لاستخدام المسارات الجديدة (`/portal/dashboard`, `/talents/dashboard`)
- تحديث المسميات

#### 3. إعادة هيكلة المسارات في `App.tsx`

```text
القديم                    → الجديد
/org/dashboard            → /portal/dashboard
/org/pending              → /portal/pending
/job-seeker/dashboard     → /talents/dashboard
```

إضافة مسارات جديدة:
- `/portal/jobs`, `/portal/jobs/new`, `/portal/applications`, `/portal/team`, `/portal/billing`, `/portal/settings`
- `/talents/profile`, `/talents/applications`, `/talents/settings`

#### 4. إنشاء Portal Layout + Sidebar
- `src/components/portal/PortalLayout.tsx` — layout مع sidebar للكيانات
- `src/components/portal/PortalSidebar.tsx` — sidebar مع روابط (لوحة التحكم، الوظائف، الطلبات، الفريق، الاشتراك، الإعدادات)

#### 5. إنشاء Talents Layout + Sidebar
- `src/components/talents/TalentsLayout.tsx`
- `src/components/talents/TalentsSidebar.tsx` — (لوحة التحكم، الملف المهني، طلباتي، الإعدادات)

#### 6. إنشاء/نقل الصفحات

**بوابة الكيانات (Portal):**
- `src/pages/portal/PortalDashboard.tsx` — نقل من OrgDashboard مع تحديث المسميات
- `src/pages/portal/PortalPending.tsx` — نقل من OrgPending
- `src/pages/portal/PortalJobs.tsx` — قائمة وظائف الكيان (هيكل أساسي)
- `src/pages/portal/PortalNewJob.tsx` — نموذج إضافة وظيفة (هيكل أساسي)
- `src/pages/portal/PortalApplications.tsx` — الطلبات الواردة (هيكل أساسي)
- `src/pages/portal/PortalTeam.tsx` — إدارة الفريق (هيكل أساسي)
- `src/pages/portal/PortalBilling.tsx` — الاشتراك والفواتير (هيكل أساسي)
- `src/pages/portal/PortalSettings.tsx` — إعدادات الكيان (هيكل أساسي)

**بوابة الكوادر (Talents):**
- `src/pages/talents/TalentsDashboard.tsx` — نقل من JobSeekerDashboard
- `src/pages/talents/TalentsProfile.tsx` — الملف المهني الكامل (الحقول الجديدة)
- `src/pages/talents/TalentsApplications.tsx` — طلباتي (هيكل أساسي)
- `src/pages/talents/TalentsSettings.tsx` — الإعدادات (هيكل أساسي)

#### 7. تحديث `Register.tsx`
- تغيير المسميات: "باحث عن وظيفة" → "حساب كوادر"، "جمعية / مؤسسة" → "حساب كيان"
- تحديث التوجيه بعد التسجيل: كوادر → `/talents/profile`، كيان → `/portal/pending` أو `/portal/dashboard`

#### 8. تحديث `Login.tsx`
- تحديث مسارات التوجيه بعد الدخول
- كوادر: فحص اكتمال الملف المهني → `/talents/profile` أو `/talents/dashboard`

#### 9. تحديث `Navbar.tsx`
- **غير مسجل:** "بوابة الكيانات" + "بوابة الكوادر" + "تسجيل دخول"
- **كوادر:** "لوحة الكوادر" + dropdown (الملف المهني، طلباتي، خروج)
- **كيان:** "لوحة الكيانات" + "نشر وظيفة"
- **مدير:** "لوحة تحكم المنصة"

#### 10. تحديث `UserMenu.tsx`
- تحديث مسارات التوجيه والمسميات

#### 11. تحديث `AdminSidebar.tsx`
- تغيير "إدارة الجمعيات" → "إدارة الكيانات"
- المسار يبقى `/admin/organizations`

#### 12. تحديث `ProtectedRoute.tsx`
- لا تغيير تقني — الأدوار نفسها، فقط المسارات تتغير في `App.tsx`

### الملفات المتأثرة

**جديدة (~14 ملف):**
- `src/components/portal/PortalLayout.tsx`, `PortalSidebar.tsx`
- `src/components/talents/TalentsLayout.tsx`, `TalentsSidebar.tsx`
- `src/pages/portal/` (8 ملفات)
- `src/pages/talents/` (4 ملفات)

**معدّلة:**
- `src/App.tsx`, `src/pages/Register.tsx`, `src/pages/Login.tsx`
- `src/components/layout/Navbar.tsx`, `src/components/layout/UserMenu.tsx`
- `src/lib/roles.ts`, `src/components/admin/AdminSidebar.tsx`

**محذوفة:**
- `src/pages/org/OrgDashboard.tsx`, `src/pages/org/OrgPending.tsx`
- `src/pages/job-seeker/JobSeekerDashboard.tsx`

**Migration:**
- إضافة أعمدة `summary`, `education`, `certifications`, `job_preferences`, `profile_completion_percentage` لجدول `job_seeker_profiles`

