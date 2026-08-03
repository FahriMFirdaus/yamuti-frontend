"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Wallet, 
  CalendarDays, 
  Package, 
  FileText,
  Settings,
  BookOpen,
  Percent
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Anak Asuh", href: "/admin/anak-asuh", icon: Users },
  { name: "Program", href: "/admin/program", icon: Megaphone },
  { name: "Donasi", href: "/admin/donasi", icon: Wallet },
  { name: "Buku Kas", href: "/admin/kas", icon: BookOpen },
  { name: "Kunjungan", href: "/admin/kunjungan", icon: CalendarDays },
  { name: "Inventaris", href: "/admin/inventaris", icon: Package },
  { name: "CMS Website", href: "/admin/cms", icon: FileText },
  { name: "Pengaturan Kas", href: "/admin/pengaturan", icon: Percent },
  { name: "Kelola Admin", href: "/admin/users", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-xl font-bold text-transparent">
            YAMUTI Admin
          </span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-red-600 dark:text-red-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="font-semibold text-red-700 dark:text-red-400">SA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Super Admin</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Owner</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
