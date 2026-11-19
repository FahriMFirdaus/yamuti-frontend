"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { ADMIN_NAV_SECTIONS, AdminNavItem } from "@/config/admin-nav";

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<{ name?: string; role?: string } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore parse error
      }
    }
    return null;
  });
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    "CMS Website": true,
  });

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then((session) => {
        if (session?.user && isMounted) {
          setCurrentUser({
            name: session.user.name || undefined,
            role: (session.user as { role?: string })?.role || undefined,
          });
        }
      })
      .catch(() => {
        // Fallback to localUser
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = currentUser?.name || "Admin YAMUTI";
  const displayRole = currentUser?.role || "Pengurus";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("") || "AD";

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

  const renderNavItem = (item: AdminNavItem) => {
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
                ? "bg-emerald-50/70 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
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
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-xl font-bold text-transparent">
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
                  .map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
            <span className="font-semibold text-xs text-emerald-800 dark:text-emerald-300">
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
    <Suspense
      fallback={
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
      }
    >
      <SidebarNav />
    </Suspense>
  );
}
