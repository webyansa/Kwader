

## خطة تطوير الموقع العام لمنصة كوادر

### المشكلة الرئيسية
المسار `/talents` محجوز حالياً كـ protected layout للكوادر. يجب نقل الـ protected layout إلى `/talents/app/*` أو إعادة هيكلة بحيث `/talents` العام يكون صفحة مستقلة والمسارات المحمية تبقى كـ nested routes.

### الحل
- `/talents` = صفحة عامة (كوادر القطاع)
- `/talents/dashboard`, `/talents/profile`, etc. = مسارات محمية داخل TalentsLayout
- يتم التفريق في `App.tsx` بوضع الصفحة العامة كـ route مستقل قبل الـ protected layout

---

### التغييرات

#### 1. إنشاء 8 صفحات عامة جديدة

| الصفحة | المسار | المحتوى |
|--------|--------|---------|
| عن المنصة | `/about` | تعريف، رؤية، أرقام |
| دليل الجمعيات | `/ngos` | قائمة من `organizations` (active) + فلاتر مدينة |
| تفاصيل جمعية | `/ngos/:slug` | بيانات + وظائف مفتوحة |
| كوادر القطاع | `/talents-public` | بطاقات عامة من `job_seeker_profiles` + CTAs |
| بوابة الكيانات | `/portal-landing` | صفحة هبوط + CTAs |
| بوابة الكوادر | `/talents-portal` | صفحة هبوط + CTAs |
| باقات الأسعار | `/pricing` | الباقات من `plans` |
| اتصل بنا | `/contact` | نموذج تواصل |

ملاحظة: `/talents` محجوز للـ protected layout، لذا الصفحة العامة ستكون `/talents-public`.

#### 2. تحديث `Navbar.tsx`
- روابط عامة: الرئيسية `/`، عن المنصة `/about`، دليل الجمعيات `/ngos`، كوادر القطاع `/talents-public`، الأسعار `/pricing`، اتصل بنا `/contact`
- أزرار: بوابة الكيانات `/portal-landing`، بوابة الكوادر `/talents-portal`، تسجيل دخول
- مسجل: أزرار حسب الدور

#### 3. تحديث `Footer.tsx`
- تحديث البراند من "وظائف" إلى "كوادر"
- تحديث الروابط

#### 4. تحديث `App.tsx`
- إضافة 8 مسارات عامة جديدة

#### 5. تحديث محتوى موجود
- `OrgsSection.tsx`: تحديث الروابط إلى `/ngos/`
- `CTASection.tsx`: تحديث النصوص
- `HeroSection.tsx`: تحديث لهوية "كوادر"

#### 6. إضافة RLS policy
- إضافة policy عامة للقراءة على `job_seeker_profiles` (بيانات عامة فقط عبر view أو select محدود)
- إضافة policy عامة لقراءة `organizations` النشطة (موجودة بالفعل)

#### 7. Migration
- إضافة عمود `slug` لجدول `organizations` إذا لم يكن مفعّلاً
- إضافة RLS policy لعرض الملفات العامة للكوادر

---

### الملفات

**جديدة (8):**
`src/pages/About.tsx`, `src/pages/NGOsDirectory.tsx`, `src/pages/NGOProfile.tsx`, `src/pages/TalentsPublic.tsx`, `src/pages/PortalLanding.tsx`, `src/pages/TalentsPortalLanding.tsx`, `src/pages/Pricing.tsx`, `src/pages/Contact.tsx`

**معدّلة (6):**
`src/App.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/home/OrgsSection.tsx`, `src/components/home/CTASection.tsx`, `src/components/home/HeroSection.tsx`

