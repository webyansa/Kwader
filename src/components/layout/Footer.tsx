import { Link } from "react-router-dom";

const footerLinks = {
  platform: [
    { label: "الرئيسية", href: "/" },
    { label: "عن المنصة", href: "/about" },
    { label: "الوظائف", href: "/jobs" },
    { label: "دليل الجمعيات", href: "/ngos" },
    { label: "باقات الأسعار", href: "/pricing" },
  ],
  portals: [
    { label: "بوابة الكيانات", href: "/portal-landing" },
    { label: "بوابة الكوادر", href: "/talents-portal" },
    { label: "كوادر القطاع", href: "/talents-public" },
  ],
  legal: [
    { label: "الشروط والأحكام", href: "/terms" },
    { label: "سياسة الخصوصية", href: "/privacy" },
    { label: "اتصل بنا", href: "/contact" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-sm">
                <span className="font-display text-lg font-bold text-primary-foreground">ك</span>
              </div>
              <span className="font-display text-xl font-bold tracking-tight">كوادر</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              منصة التوظيف المتخصصة للقطاع غير الربحي في السعودية والعالم العربي.
              نربط الجمعيات والمؤسسات بأفضل الكفاءات.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold text-foreground">المنصة</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold text-foreground">البوابات</h4>
            <ul className="space-y-2.5">
              {footerLinks.portals.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold text-foreground">روابط مهمة</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} منصة كوادر — توظيف القطاع غير الربحي. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
