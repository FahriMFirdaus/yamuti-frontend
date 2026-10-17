"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  CalendarClock, 
  HeartHandshake, 
  AlertTriangle, 
  Wallet, 
  CheckCheck,
  ChevronRight,
  ExternalLink,
  X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "next-auth/react";

type NotificationItem = {
  id: string;
  type: "DONASI" | "KUNJUNGAN" | "INVENTARIS" | "POTA";
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real notifications from backend (kunjungan pending, inventaris menipis/kadaluarsa, donasi terbaru)
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const headers = {
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const notifs: NotificationItem[] = [];

      // 1. Cek Kunjungan Pending
      try {
        const resKunjungan = await fetch(`${apiUrl}/kunjungan?per_page=10`, { headers, cache: "no-store" });
        if (resKunjungan.ok) {
          const dataKunjungan = await resKunjungan.json();
          const pendingList = (dataKunjungan.data?.data || []).filter((k: any) => k.status === "PENDING");
          pendingList.slice(0, 3).forEach((k: any) => {
              notifs.push({
                id: `kunjungan-${k.id}`,
                type: "KUNJUNGAN",
                title: "Jadwal Kunjungan Baru",
                description: `${k.nama_tamu} mengajukan jadwal (${k.jumlah_pengunjung} orang)`,
                time: k.slot_waktu ? new Date(k.slot_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru saja",
                href: "/admin/kunjungan",
                unread: true,
              });
            });
          }
        } catch (e) {
          console.error("Gagal load notif kunjungan", e);
        }

        // 2. Cek Donasi Terbaru (Settlement / Masuk)
        try {
          const resDonasi = await fetch(`${apiUrl}/donasi?per_page=5`, { headers });
          if (resDonasi.ok) {
            const dataDonasi = await resDonasi.json();
            const donasiList = dataDonasi.data?.data || [];
            donasiList.slice(0, 3).forEach((d: any) => {
              const amount = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
              }).format(d.gross_amount || 0);

              notifs.push({
                id: `donasi-${d.id}`,
                type: "DONASI",
                title: "Donasi Masuk Berhasil",
                description: `${d.nama_donatur || "Hamba Allah"} - ${amount}`,
                time: d.created_at ? new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru saja",
                href: "/admin/donasi",
                unread: d.status === "settlement" || d.status === "PAID",
              });
            });
          }
        } catch (e) {
          console.error("Gagal load notif donasi", e);
        }

        // 3. Cek Inventaris (Sembako Mendekati Kadaluarsa / Menipis)
        try {
          const resInventaris = await fetch(`${apiUrl}/inventaris?per_page=20`, { headers });
          if (resInventaris.ok) {
            const dataInv = await resInventaris.json();
            const invList = dataInv.data?.data || [];
            const now = new Date();
            const thirtyDaysAhead = new Date();
            thirtyDaysAhead.setDate(now.getDate() + 30);

            invList.forEach((inv: any) => {
              if (inv.tanggal_kadaluarsa) {
                const expDate = new Date(inv.tanggal_kadaluarsa);
                if (expDate <= thirtyDaysAhead) {
                  notifs.push({
                    id: `inv-${inv.id}`,
                    type: "INVENTARIS",
                    title: expDate < now ? "Stok Kadaluarsa!" : "Mendekati Kadaluarsa",
                    description: `${inv.nama_barang} (${inv.lokasi_penyimpanan || "Gudang"})`,
                    time: expDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
                    href: "/admin/inventaris",
                    unread: true,
                  });
                }
              }
            });
          }
        } catch (e) {
          console.error("Gagal load notif inventaris", e);
        }

        // Fallback default jika database masih sepi
        if (notifs.length === 0) {
          notifs.push(
            {
              id: "welcome-1",
              type: "KUNJUNGAN",
              title: "Sistem Notifikasi Aktif",
              description: "Pantau pengajuan donasi, tamu panti, dan stok sembako secara real-time.",
              time: "Hari ini",
              href: "/admin/dashboard",
              unread: true
            },
            {
              id: "pota-sample",
              type: "POTA",
              title: "Program Orang Tua Asuh",
              description: "Cek kabar rutin anak asuh & komitmen donatur tetap.",
              time: "Bulan ini",
              href: "/admin/orang-tua-asuh",
              unread: false
            }
          );
        }

        const readIds: string[] = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("yamuti_read_notifs") || "[]") : [];
        // Hanya tampilkan notifikasi yang BELUM dibaca/diklik
        const unreadOnlyNotifs = notifs.filter(n => n.unread && !readIds.includes(n.id));

        setNotifications(unreadOnlyNotifs);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  const getReadIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("yamuti_read_notifs") || "[]");
    } catch {
      return [];
    }
  };

  // Saat diklik: Langsung simpan ke readIds dan HAPUS dari daftar tampilan
  const markAsReadAndDismiss = (id: string) => {
    try {
      const readIds = getReadIds();
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem("yamuti_read_notifs", JSON.stringify(readIds));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const dismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    markAsReadAndDismiss(id);
  };

  // Bersihkan semua notifikasi sekaligus
  const markAllAsRead = () => {
    try {
      const allIds = notifications.map(n => n.id);
      const readIds = Array.from(new Set([...getReadIds(), ...allIds]));
      localStorage.setItem("yamuti_read_notifs", JSON.stringify(readIds));
      setNotifications([]);
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.length;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "DONASI":
        return <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "KUNJUNGAN":
        return <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "INVENTARIS":
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "POTA":
        return <HeartHandshake className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full"
        title="Pusat Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Notifikasi</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold px-1.5 py-0">
                  {unreadCount} Baru
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai dibaca
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {loading ? (
              <div className="p-6 text-center text-xs text-zinc-500">Memeriksa aktivitas terbaru...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Belum Ada Notifikasi Baru</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                  Pemberitahuan donasi masuk, permohonan kunjungan tamu, dan status sembako akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80 ${
                    item.unread ? "bg-red-50/25 dark:bg-red-950/15" : ""
                  }`}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      markAsReadAndDismiss(item.id);
                      setIsOpen(false);
                    }}
                    className="flex items-start gap-3 flex-1 min-w-0"
                  >
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${item.unread ? "font-bold text-zinc-900 dark:text-zinc-100" : "font-medium text-zinc-700 dark:text-zinc-300"}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-zinc-400 shrink-0 font-medium">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400 group-hover:text-red-600 transition-colors">
                        <span>Buka halaman {item.type.toLowerCase()}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>

                  {/* Indicator / Dismiss Button */}
                  <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-red-600 group-hover:hidden" />
                    )}
                    <button
                      onClick={(e) => dismissNotification(e, item.id)}
                      title="Hapus notifikasi ini"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
            >
              Lihat Seluruh Aktivitas Yayasan <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
