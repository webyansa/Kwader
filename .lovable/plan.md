

## خطة بناء نظام التواصل المزدوج (Chat + Contact Form)

### ملخص
تحويل نظام المراسلات الحالي إلى نظامين منفصلين: (A) محادثات لحظية للمستخدمين المسجلين، (B) نموذج تواصل للزوار مع صندوق وارد في لوحة تحكم الكادر.

---

### 1. قاعدة البيانات (Migration)

**جدول جديد: `contact_messages`**
- `id`, `talent_user_id`, `sender_type` (visitor/logged_in), `sender_user_id` (nullable), `sender_name`, `sender_email`, `sender_phone`, `subject`, `message_type` (توظيف/استشارة/خدمة/تعاون/أخرى), `message`, `status` (new/read/replied/archived), `created_at`
- RLS: الكادر المستلم يقرأ/يحدّث رسائله، الجميع يمكنهم الإدراج (insert)، الأدمن يرى الكل

**تعديل الجداول الحالية:**
- إعادة تسمية `messages_threads` → تبقى كما هي (ستُستخدم كـ chat_threads)
- إعادة تسمية `messages` → تبقى كما هي (ستُستخدم كـ chat_messages)
- لا حاجة لتغيير هيكلي، فقط إضافة الجدول الجديد

**إضافة Realtime:**
- `ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;`

---

### 2. صفحة الكادر العامة (`PublicProfile.tsx`)

تعديل أزرار التواصل في الـ sidebar:
- **"مراسلة عبر كوادر"** → يظهر فقط إذا المستخدم مسجل دخول (يفتح chat thread)
- **"تواصل معي"** → متاح للجميع، يفتح Modal نموذج التواصل
- إذا الزائر غير مسجل وضغط "مراسلة عبر كوادر" → Modal يطلب تسجيل الدخول

---

### 3. نموذج التواصل (Contact Form Modal)

مكون جديد: `src/components/talents/ContactFormModal.tsx`
- حقول: الاسم، البريد، الجوال (اختياري مع تنسيق سعودي)، نوع الرسالة (dropdown)، عنوان مختصر، نص الرسالة
- تحويل `05` → `+966` تلقائياً
- Validation بـ zod
- حفظ في `contact_messages` مع `status=new`
- Toast نجاح بعد الإرسال
- Hint: "المراسلات المباشرة تتطلب تسجيل دخول"

---

### 4. لوحة تحكم الكادر: إدارة الرسائل

**صفحة جديدة: `src/pages/talents/TalentsMessages.tsx`**
- **Tab 1: "المحادثات"** — نقل واجهة الشات من `/messages` إلى هنا (قائمة threads + نافذة محادثة)
- **Tab 2: "رسائل الموقع"** — عرض `contact_messages` مع فلاتر (جديد/مقروء/مردود/مؤرشف)
  - كل رسالة: Card يعرض الاسم، النوع، البريد، التاريخ
  - أزرار: عرض، تعليم كمقروء، أرشفة، رد بالبريد (mailto)
  - إذا sender_user_id موجود → زر "فتح محادثة"

**صفحة تفاصيل رسالة: `src/pages/talents/TalentsContactMessageDetail.tsx`**
- عرض الرسالة كاملة مع كل الأزرار

**إضافة في TalentsSidebar:** رابط "الرسائل" مع أيقونة `MessageSquare` + badge عدد الجديد

---

### 5. تحديث الـ Routing (`App.tsx`)

```
/talents/messages          → TalentsMessages (Tab: محادثات + رسائل الموقع)
/talents/messages/contact/:id → TalentsContactMessageDetail
```

الإبقاء على `/messages` كصفحة عامة للشات (أو redirect إلى `/talents/messages`)

---

### 6. تحديث Navbar

- أيقونة الرسائل الحالية تعرض مجموع: unread chat + new contact messages
- عند الضغط → `/talents/messages`

---

### 7. Hooks جديدة

- `useContactMessages()` — جلب رسائل الموقع للكادر الحالي
- `useNewContactCount()` — عدد الرسائل الجديدة
- `useSendContactMessage()` — إرسال رسالة من النموذج (بدون auth مطلوب)
- `useUpdateContactStatus()` — تحديث حالة الرسالة

---

### الملفات المتأثرة

| ملف | تغيير |
|---|---|
| Migration SQL | إنشاء `contact_messages` + RLS |
| `src/hooks/useContactMessages.ts` | جديد |
| `src/components/talents/ContactFormModal.tsx` | جديد |
| `src/pages/talents/TalentsMessages.tsx` | جديد |
| `src/pages/talents/TalentsContactMessageDetail.tsx` | جديد |
| `src/pages/PublicProfile.tsx` | تعديل أزرار التواصل |
| `src/components/talents/TalentsSidebar.tsx` | إضافة رابط الرسائل |
| `src/App.tsx` | إضافة routes |
| `src/components/layout/Navbar.tsx` | تحديث badge العداد |

