

# خطة تنفيذ نموذج نشر الوظائف الاحترافي مع الذكاء الاصطناعي

## ملخص
إعادة بناء نموذج إنشاء الوظيفة كمعالج من 5 أقسام مع حقول احترافية جديدة، ودعم توليد المحتوى بالذكاء الاصطناعي (Lovable AI / Gemini)، وحفظ تلقائي، ومعاينة حية، وربط بسير الموافقات.

---

## التفاصيل التقنية

### 1. تحديث قاعدة البيانات (Migration)

إضافة أعمدة جديدة لجدول `jobs`:
- `department` (text, nullable) — القسم/الإدارة
- `summary` (text, nullable) — ملخص سريع
- `skills` (text[], default '{}') — مهارات
- `vacancies` (integer, default 1) — عدد الشواغر
- `experience_years_min` (integer, nullable)
- `experience_years_max` (integer, nullable)
- `education` (text, nullable) — المؤهل العلمي
- `languages` (jsonb, default '[]') — اللغات
- `salary_display` (text, default 'hidden') — عرض الراتب (hidden/range/visible)
- `benefits` (text[], default '{}') — المزايا
- `screening_questions` (jsonb, default '[]') — أسئلة الفرز

تحديث enum `employment_type` بإضافة: `consultant`, `volunteer`
تحديث enum `experience_level` بإضافة: `leadership`

### 2. Edge Function للذكاء الاصطناعي

إنشاء `supabase/functions/generate-job-content/index.ts`:
- يستقبل: title, department, city, remote_type, employment_type, experience_level, skills, org_short_description
- يرسل إلى Lovable AI Gateway (gemini-3-flash-preview)
- System prompt مخصص للقطاع غير الربحي السعودي
- يُرجع: summary, description, responsibilities, requirements, suggested_skills
- دعم أنماط (مختصر / تفصيلي / مهني راقٍ / رسمي)
- دعم إعادة صياغة قسم محدد (rewrite)
- Non-streaming response عبر `supabase.functions.invoke()`

تحديث `supabase/config.toml` بإضافة الدالة مع `verify_jwt = false`

### 3. إعادة بناء `PortalNewJob.tsx` بالكامل

**5 أقسام Stepper:**
1. **البيانات الأساسية** — المسمى، القسم، المنطقة+المدينة، نمط العمل، نوع الدوام، المستوى، عدد الشواغر، تاريخ الإغلاق
2. **تفاصيل الوظيفة (AI)** — ملخص، وصف (Rich Text area)، مسؤوليات، متطلبات، مهارات (tags)، سنوات الخبرة، مؤهل، لغات. زر AI لتوليد المحتوى + إعادة توليد بأنماط + تحسين صياغة
3. **الراتب والمزايا** — عرض الراتب (select)، نطاق، مزايا (tags)
4. **أسئلة الفرز** — أسئلة نعم/لا، سؤال نصي، خيار رفع ملف
5. **المراجعة والمعاينة** — Preview كامل + تحذير + أزرار حفظ/إرسال

**وظائف إضافية:**
- Auto-save إلى localStorage عند كل تغيير
- حفظ كمسودة (INSERT/UPDATE في jobs مع status=draft)
- إرسال للاعتماد (status=submitted) مع validation
- Live Preview sidebar (lg screens)
- جلب بيانات الجمعية (org_id, short_description) لتغذية AI

### 4. تكامل الذكاء الاصطناعي في الواجهة

- زر "✨ توليد بالذكاء الاصطناعي" في القسم 2
- Modal يعرض حالة التوليد (loading)
- ملء الحقول تلقائياً بالنتائج
- زر "إعادة توليد" مع dropdown لاختيار الأسلوب
- زر "تحسين الصياغة" لكل حقل نصي منفرد

### 5. الملفات المتأثرة

| ملف | عملية |
|---|---|
| Migration SQL | إنشاء |
| `supabase/functions/generate-job-content/index.ts` | إنشاء |
| `supabase/config.toml` | تحديث |
| `src/pages/portal/PortalNewJob.tsx` | إعادة بناء كامل |

