import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isPlatformStaff, isOrganization, isJobSeeker } from "@/lib/roles";
import UserMenu from "./UserMenu";

const publicLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "عن المنصة", href: "/about" },
  { label: "دليل الجمعيات", href: "/ngos" },
  { label: "كوادر القطاع", href: "/talents-public" },
  { label: "باقات الأسعار", href: "/pricing" },
  { label: "اتصل بنا", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, roles, loading } = useAuth();

  const isLoggedIn = !!user;
  const staff = isPlatformStaff(roles);
  const org = isOrganization(roles);
  const seeker = isJobSeeker(roles);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">ك</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">كوادر</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-5 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {!loading && isLoggedIn ? (
            <>
              {staff && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">لوحة تحكم المنصة</Link>
                </Button>
              )}
              {org && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/portal/dashboard">لوحة الكيانات</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/portal/jobs/new">نشر وظيفة</Link>
                  </Button>
                </>
              )}
              {seeker && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/talents/dashboard">لوحة الكوادر</Link>
                </Button>
              )}
              <UserMenu />
            </>
          ) : !loading ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/portal-landing">بوابة الكيانات</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/talents-portal">بوابة الكوادر</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">تسجيل دخول</Link>
              </Button>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {isLoggedIn ? (
              <>
                {staff && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>لوحة تحكم المنصة</Link>
                  </Button>
                )}
                {org && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/portal/dashboard" onClick={() => setMobileOpen(false)}>لوحة الكيانات</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/portal/jobs/new" onClick={() => setMobileOpen(false)}>نشر وظيفة</Link>
                    </Button>
                  </>
                )}
                {seeker && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/talents/dashboard" onClick={() => setMobileOpen(false)}>لوحة الكوادر</Link>
                  </Button>
                )}
                <UserMenu />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/portal-landing" onClick={() => setMobileOpen(false)}>بوابة الكيانات</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/talents-portal" onClick={() => setMobileOpen(false)}>بوابة الكوادر</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>تسجيل دخول</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
