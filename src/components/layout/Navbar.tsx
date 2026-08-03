"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingCart, LogOut, User, FileText, CalendarClock, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{name: string, email: string, no_hp?: string} | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // Fetch User Profile
        fetch("http://localhost:8000/api/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUser({ name: data.data.name, email: data.data.email });
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });

        // Fetch Cart Count
        fetch("http://localhost:8000/api/keranjang/count", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setCartCount(data.data.count);
          }
        })
        .catch(err => console.error("Gagal mengambil count keranjang:", err));
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/40 dark:bg-zinc-950/60">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_yamuti.webp" alt="Logo YAMUTI" className="h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="inline-block text-red-600 text-xl md:text-2xl font-extrabold tracking-tight leading-none">
                YAMUTI
              </span>
              <span className="inline-block text-zinc-900 dark:text-white text-[10px] md:text-xs font-bold tracking-[0.2em] leading-none mt-1">
                TASIKMALAYA
              </span>
            </div>
          </Link>
          <nav className="hidden gap-6 md:flex lg:gap-8">
            <Link href="/" className="flex items-center text-sm md:text-base font-medium text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400">
              Beranda
            </Link>
            <Link href="/tentang" className="flex items-center text-sm md:text-base font-medium text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400">
              Tentang
            </Link>
            <Link href="/program" className="flex items-center text-sm md:text-base font-medium text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400">
              Program
            </Link>
            <Link href="/kunjungan" className="flex items-center text-sm md:text-base font-medium text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400">
              Kunjungan
            </Link>
            <Link href="/artikel" className="flex items-center text-sm md:text-base font-medium text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400">
              Artikel
            </Link>
            <Link href="/galeri" className="flex items-center text-sm md:text-base font-medium text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400">
              Galeri
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle />
          
          {!user ? (
            <>
              <Link 
                href="/login" 
                className={cn(buttonVariants({ variant: "ghost" }), "hidden md:flex h-11 px-6 rounded-full text-base font-bold text-zinc-700 hover:text-red-600 hover:bg-red-50 dark:text-zinc-300 dark:hover:bg-red-900/20 dark:hover:text-red-400")}
              >
                Masuk
              </Link>
              <Link 
                href="/donasi"
                className={cn(buttonVariants(), "h-11 text-sm md:text-base px-6 md:px-8 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:-translate-y-0.5")}
              >
                Donasi Sekarang
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 md:gap-4">
              {/* Keranjang Donasi */}
              <Link href="/keranjang" className="relative p-2 text-zinc-600 hover:text-red-600 transition-colors bg-zinc-50 dark:bg-zinc-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 pr-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden md:inline-block text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-zinc-200 dark:border-zinc-800">
                  <div className="p-4 flex flex-col">
                    <span className="text-base font-bold text-zinc-900 dark:text-white truncate">{user.name}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profil')} className="p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                    <User className="mr-3 h-5 w-5 text-zinc-500" />
                    <span className="font-medium">Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profil?tab=donasi')} className="p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                    <FileText className="mr-3 h-5 w-5 text-zinc-500" />
                    <span className="font-medium">Riwayat Donasi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profil?tab=kunjungan')} className="p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                    <CalendarClock className="mr-3 h-5 w-5 text-zinc-500" />
                    <span className="font-medium">Status Ajuan Kunjungan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="p-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="font-bold">Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Donasi Button (Selalu Tampil) */}
              <Link 
                href="/donasi"
                className={cn(buttonVariants(), "hidden lg:flex h-11 text-sm md:text-base px-6 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:-translate-y-0.5")}
              >
                Donasi Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
