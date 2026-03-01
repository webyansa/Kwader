

## خطة ترقية صفحة السيرة الذاتية العامة (PublicCV.tsx) إلى قالب Premium

### ملخص التغييرات
إعادة بناء كاملة لملف `src/pages/PublicCV.tsx` ليصبح قالب سيرة ذاتية احترافي بتصميم عصري مع دعم كامل للطباعة والتصدير PDF.

---

### التفاصيل التقنية

#### 1. إعادة هيكلة التخطيط (Layout)
- **الخلفية**: تدرج ناعم `bg-gradient-to-b from-slate-50 via-white to-slate-50`
- **Canvas أبيض**: بطاقة مركزية بعرض `max-w-[900px]` وظل premium وزوايا `rounded-2xl`
- **Grid عمودين**: Desktop `grid-cols-[1fr_320px]` (65%/35%) — Mobile عمود واحد
- **شريط أدوات ثابت**: `sticky top-0` خارج الـ CV يحتوي أزرار التحميل/المشاركة/الطباعة/الرجوع

#### 2. Header داخل الـ CV
- Avatar بحجم `h-28 w-28` مع `ring-4` تدرج AI (`from-indigo-500 via-purple-500 to-cyan-400`)
- الاسم بخط `text-4xl font-black`
- Headline تحته بـ `text-lg text-muted-foreground`
- سطر معلومات (المدينة + LinkedIn + Portfolio) بأيقونات `18px`
- Fallback avatar: حرف أول مع gradient

#### 3. QR Card احترافي (في الشريط الجانبي)
- بطاقة مستقلة بعنوان "ملفي على كوادر"
- QR داخل إطار مع رابط قصير أسفله
- زر "نسخ الرابط" صغير
- QR يشير إلى `/talent/{username}` (الملف العام وليس CV)

#### 4. أقسام السيرة (Sections) بأيقونات موحدة
كل قسم = Block بعنوان + أيقونة Lucide بحجم `18px`:
- `User` → النبذة المهنية
- `Briefcase` → الخبرات (timeline بخط عمودي + نقاط)
- `GraduationCap` → التعليم
- `BadgeCheck` → الشهادات
- `Sparkles` → المهارات (chips صغيرة بحدود خفيفة)
- `FolderGit2` → المشاريع
- `HeartHandshake` → التطوع
- `Globe` → الروابط

#### 5. مهارات محسّنة (Chips)
- حجم أصغر، حدود خفيفة `border border-indigo-200/60`
- خلفية `bg-indigo-50/50`
- Hover يُظهر tooltip إن توفرت بيانات إضافية

#### 6. Print CSS
إضافة styles طباعة في `index.css`:
```css
@media print {
  .print\\:hidden { display: none !important; }
  body { background: white !important; }
  .cv-canvas { box-shadow: none !important; border: none !important; }
  section { break-inside: avoid; }
  @page { size: A4; margin: 15mm; }
}
```

#### 7. تصدير PDF
- استخدام `html2canvas` + `jspdf` الموجودين
- اسم الملف: `kwader-{username}-cv.pdf`
- جودة A4 عالية

#### 8. Footer Branding
- سطر هادئ `text-[10px]` رمادي فاتح
- "تم إنشاء هذه السيرة عبر منصة كوادر · www.kawader.sa"

#### 9. Empty States ذكية
- أقسام فارغة لا تظهر (كما هو حالياً)
- إذا كان المستخدم هو المالك: عرض رسالة "أضف خبرة لتقوية ملفك" + رابط للبوابة (تحسين مستقبلي)

---

### الملفات المتأثرة
| الملف | التغيير |
|---|---|
| `src/pages/PublicCV.tsx` | إعادة بناء كاملة |
| `src/index.css` | إضافة print styles |

