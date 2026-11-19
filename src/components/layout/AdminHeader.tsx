"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, getSession } from "next-auth/react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_SECTIONS, AdminNavItem } from "@/config/admin-nav";

function AdminHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("admin");
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    "CMS Website": true,
  });

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role) setUserRole(parsed.role);
      }
    } catch {
      // ignore
    }

    getSession().then((session) => {
      const r = (session?.user as { role?: string })?.role;
      if (r && isMounted) setUserRole(r);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isTabGaleri = pathname === "/admin/cms" && searchParams?.get("tab") === "galeri";
  const isCmsArtikel = pathname.startsWith("/admin/cms") && !isTabGaleri;

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const isItemActive = (href: string) => {
    if (href === "/admin/cms?tab=galeri") {
      return isTabGaleri;
    }
    if (href === "/admin/cms") {
      return isCmsArtikel;
    }
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderMobileNavItem = (item: AdminNavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive =
      hasChildren && (pathname.startsWith(item.href) || item.children?.some((c) => isItemActive(c.href)));
    const isOpen = openDropdowns[item.name] ?? isParentActive;

    if (hasChildren) {
      return (
        <div key={item.name} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleDropdown(item.name)}
            className={cn(
              "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
              isParentActive
                ? "bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isParentActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )}
              />
              <span>{item.name}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
                isOpen && "rotate-180 text-zinc-600 dark:text-zinc-300"
              )}
            />
          </button>

          {isOpen && (
            <div className="ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1 pt-0.5">
              {item.children?.map((child) => {
                const isChildActive = isItemActive(child.href);
                const ChildIcon = child.icon;

                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                      isChildActive
                        ? "bg-emerald-100/70 text-emerald-800 font-bold dark:bg-emerald-900/50 dark:text-emerald-200"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200"
                    )}
                  >
                    {ChildIcon && (
                      <ChildIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isChildActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                        )}
                      />
                    )}
                    <span>{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const isActive = isItemActive(item.href);

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
          )}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Menu Admin"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            <span className="md:hidden text-emerald-600 mr-1.5">YAMUTI</span> Admin
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <NotificationBell />
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-zinc-800 dark:hover:bg-rose-950/30 text-xs sm:text-sm px-2.5 sm:px-3"
          >
            <LogOut className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white dark:bg-zinc-950 shadow-2xl border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-200">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-xl font-extrabold text-transparent">
                  YAMUTI Admin
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              <nav className="space-y-4">
                {ADMIN_NAV_SECTIONS.map((section, idx) => (
                  <div key={section.title || `admin-sec-${idx}`} className="space-y-1">
                    {section.title && (
                      <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {section.title}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {section.items
                        .filter((item) => !item.superAdminOnly || (mounted && userRole === "super_admin"))
                        .map((item) => renderMobileNavItem(item))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminHeader() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/80" />
      }
    >
      <AdminHeaderContent />
    </Suspense>
  );
}
