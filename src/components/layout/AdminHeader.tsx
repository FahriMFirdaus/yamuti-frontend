"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, getSession } from "next-auth/react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_SECTIONS } from "@/config/admin-nav";

function AdminHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("admin");

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isMounted && parsed.role) setUserRole(parsed.role);
        }
      } catch {
        // abaikan
      }
    }

    getSession().then((session) => {
      const r = (session?.user as any)?.role;
      if (r && isMounted) setUserRole(r);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isTabGaleri = pathname === "/admin/cms" && searchParams?.get("tab") === "galeri";

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-red-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Menu Admin"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            <span className="md:hidden text-red-600 mr-1.5">YAMUTI</span> Admin
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <NotificationBell />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-zinc-800 dark:hover:bg-red-900/20 text-xs sm:text-sm px-2.5 sm:px-3"
          >
            <LogOut className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Sidebar for Admin */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white dark:bg-zinc-950 shadow-2xl border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
              <Link 
                href="/admin/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-xl font-extrabold text-transparent">
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

            {/* Navigation items list */}
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
                        .filter((item) => !item.superAdminOnly || userRole === "super_admin")
                        .map((item) => {
                        const isActive =
                          item.href === "/admin/cms?tab=galeri"
                            ? isTabGaleri
                            : pathname === item.href ||
                              (item.href !== "/admin/dashboard" &&
                                !item.href.includes("?tab=") &&
                                pathname.startsWith(`${item.href}/`));
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                              isActive
                                ? "bg-red-50 text-red-700 font-semibold dark:bg-red-900/30 dark:text-red-400"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                            )}
                          >
                            <Icon className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive ? "text-red-600 dark:text-red-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                            )} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold dark:bg-red-950/30 dark:hover:bg-red-900/40 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Keluar Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminHeader() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-40 h-16 w-full border-b border-zinc-200 bg-white/80 px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/80" />}>
      <AdminHeaderContent />
    </Suspense>
  );
}
