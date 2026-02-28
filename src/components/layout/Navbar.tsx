import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isPlatformStaff, isOrganization, isJobSeeker } from "@/lib/roles";
import UserMenu from "./UserMenu";

const publicLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الوظائف", href: "/jobs" },
  { label: "دليل الجمعيات", href: "/organizations" },
  { label: "الأسعار", href: "/pricing" },
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
            <span className="font-display text-lg font-bold text-primary-foreground">و</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">وظائف</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
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

        <div className="hidden items-center gap-3 md:flex">
          {!loading && isLoggedIn ? (
            <>
              {staff && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">لوحة التحكم</Link>
                </Button>
              )}
              {org && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/org/dashboard">لوحة الجمعية</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/org/dashboard">انشر وظيفة</Link>
                  </Button>
                </>
              )}
              {seeker && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/job-seeker/dashboard">طلباتي</Link>
                </Button>
              )}
              <UserMenu />
            </>
          ) : !loading ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">انشر وظيفة</Link>
              </Button>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
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
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>لوحة التحكم</Link>
                  </Button>
                )}
                {org && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/org/dashboard" onClick={() => setMobileOpen(false)}>لوحة الجمعية</Link>
                  </Button>
                )}
                {seeker && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/job-seeker/dashboard" onClick={() => setMobileOpen(false)}>طلباتي</Link>
                  </Button>
                )}
                <UserMenu />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>تسجيل الدخول</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>انشر وظيفة</Link>
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
