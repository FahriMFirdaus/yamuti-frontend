"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_SECTIONS } from "@/config/admin-nav";

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Coba baca dari localStorage terlebih dahulu untuk render instan
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isMounted) setCurrentUser(parsed);
        }
      } catch {
        // abaikan error parse localStorage
      }
    }

    // Ambil sesi NextAuth dengan getSession (bekerja tanpa SessionProvider)
    getSession()
      .then((session) => {
        if (session?.user && isMounted) {
          setCurrentUser({
            name: session.user.name || undefined,
            role: (session.user as any)?.role || undefined,
          });
        }
      })
      .catch(() => {
        // Fallback tetap menggunakan localUser
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = currentUser?.name || "Admin YAMUTI";
  const displayRole = currentUser?.role || "Pengurus";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "AD";

  const isTabGaleri = pathname === "/admin/cms" && searchParams?.get("tab") === "galeri";

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-xl font-bold text-transparent">
            YAMUTI Admin
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5 space-y-6">
        <nav className="flex-1 space-y-5">
          {ADMIN_NAV_SECTIONS.map((section, idx) => (
            <div key={section.title || `section-${idx}`} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items
                  .filter((item) => !item.superAdminOnly || displayRole === "super_admin")
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
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-red-50 text-red-700 font-semibold dark:bg-red-900/30 dark:text-red-400"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-red-600 dark:text-red-400"
                            : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="font-semibold text-xs text-red-700 dark:text-red-400">
              {initials}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {displayName}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize truncate">
              {displayRole.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />}>
      <SidebarNav />
    </Suspense>
  );
}
