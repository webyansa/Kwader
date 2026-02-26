import { Link } from "react-router-dom";

const footerLinks = {
  platform: [
    { label: "الرئيسية", href: "/" },
    { label: "الوظائف", href: "/jobs" },
    { label: "دليل الجمعيات", href: "/organizations" },
    { label: "الأسعار", href: "/pricing" },
  ],
  services: [
    { label: "نشر الوظائف", href: "/services" },
    { label: "الوظائف المميزة", href: "/services" },
    { label: "الوظائف العاجلة", href: "/services" },
    { label: "إدارة الطلبات", href: "/services" },
  ],
  legal: [
    { label: "الشروط والأحكام", href: "/terms" },
    { label: "سياسة الخصوصية", href: "/privacy" },
    { label: "اتصل بنا", href: "/contact" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-primary-foreground">و</span>
              </div>
              <span className="font-display text-xl font-bold">وظائف</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              منصة التوظيف المتخصصة للقطاع غير الربحي في السعودية والعالم العربي.
              نربط الجمعيات والمؤسسات بأفضل الكفاءات.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold">المنصة</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold">الخدمات</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold">روابط مهمة</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} منصة وظائف القطاع غير الربحي. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
