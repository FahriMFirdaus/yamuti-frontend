"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { 
  Users, 
  Wallet, 
  CalendarDays, 
  BookOpen, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  RefreshCw,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryData {
  total_anak_asuh: number;
  total_donasi_bulan_ini: number;
  total_kunjungan_menunggu: number;
  saldo_kas_terkini: number;
  total_program_aktif: number;
  donasi_terbaru: Array<{
    id: string;
    donor_name: string;
    gross_amount: number;
    created_at: string;
    program_name?: string;
  }>;
  chart_harian: Array<{
    tanggal: string;
    hari: string;
    nominal: number;
  }>;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRelativeTime(dateStr: string) {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function getIndonesianDayLabel(item: { tanggal: string; hari: string }) {
  try {
    if (item.tanggal) {
      const d = new Date(item.tanggal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("id-ID", { weekday: "short" });
      }
    }
    const map: Record<string, string> = {
      Mon: "Sen",
      Tue: "Sel",
      Wed: "Rab",
      Thu: "Kam",
      Fri: "Jum",
      Sat: "Sab",
      Sun: "Min",
    };
    return map[item.hari] || item.hari;
  } catch {
    return item.hari;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const session = await getSession();
      const token = session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/dashboard/summary`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil summary dashboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Hitung nilai maksimum chart agar diagram batang proporsional dan tidak terjadi pembagian nol (0 / 0 = NaN)
  const maxChartNominal = Math.max(
    ...(data?.chart_harian?.map((c) => c.nominal) || [0]),
    1
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner - Warm Stone & Emerald Palette */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              <Sparkles className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
              Sistem Informasi Manajemen
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ringkasan Operasional Yayasan
          </h2>
          <p className="text-stone-600 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Pantau pergerakan donasi masuk, pembinaan anak asuh, mutasi saldo kas, dan reservasi kunjungan secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSummary(true)}
            disabled={isLoading || isRefreshing}
            className="h-9 gap-1.5 text-xs font-medium border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Memuat..." : "Perbarui Data"}</span>
          </Button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/admin/donasi" className="group p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl hover:border-emerald-600 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-zinc-400">Pencatatan</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Donasi Baru</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link href="/admin/anak-asuh" className="group p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl hover:border-emerald-600 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-zinc-400">Database</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Anak Asuh</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link href="/admin/kunjungan" className="group p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl hover:border-emerald-600 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-zinc-400">Reservasi</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Jadwal Tamu</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link href="/admin/kas" className="group p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl hover:border-emerald-600 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-zinc-400">Keuangan</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Buku Kas</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      {/* 4 Summary Cards Riil */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Anak Asuh */}
        <Card className="rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-zinc-400">Total Anak Asuh</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 rounded-lg my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {data?.total_anak_asuh || 0} <span className="text-xs sm:text-sm font-medium text-stone-500">Jiwa</span>
              </div>
            )}
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 inline" /> Status aktif di asrama
            </p>
          </CardContent>
        </Card>

        {/* Donasi Bulan Ini */}
        <Card className="rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-zinc-400">Donasi Bulan Ini</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-36 rounded-lg my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {formatRupiah(data?.total_donasi_bulan_ini || 0)}
              </div>
            )}
            <p className="text-xs text-stone-500 mt-1">
              Bulan {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        {/* Kunjungan Menunggu */}
        <Card className="rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-zinc-400">Kunjungan Pending</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg my-1" />
            ) : (
              <div className={`text-2xl sm:text-3xl font-bold ${(data?.total_kunjungan_menunggu || 0) > 0 ? "text-amber-700 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                {data?.total_kunjungan_menunggu || 0}
              </div>
            )}
            <p className="text-xs text-stone-500 mt-1">
              {(data?.total_kunjungan_menunggu || 0) > 0 ? (
                <Link href="/admin/kunjungan" className="text-amber-700 dark:text-amber-400 hover:underline font-semibold">
                  Perlu konfirmasi admin &rarr;
                </Link>
              ) : (
                "Tidak ada antrean pending"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Saldo Kas Terkini */}
        <Card className="rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-zinc-400">Total Saldo Kas</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-36 rounded-lg my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {formatRupiah(data?.saldo_kas_terkini || 0)}
              </div>
            )}
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <Link href="/admin/kas" className="text-emerald-800 dark:text-emerald-400 hover:underline font-semibold">
                Lihat mutasi kas &rarr;
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Recent Donations */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Grafik Pemasukan Donasi 7 Hari Terakhir */}
        <Card className="lg:col-span-4 rounded-2xl border border-stone-200 dark:border-zinc-800 flex flex-col shadow-sm">
          <CardHeader className="border-b border-stone-150 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Tren Pemasukan Donasi
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
                  Grafik donasi masuk berstatus lunas dalam 7 hari terakhir
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-stone-600 border-stone-200 dark:border-zinc-700">
                7 Hari Terakhir
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-end pt-8 pb-6 px-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : !data?.chart_harian || data.chart_harian.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
                Belum ada data transaksi donasi
              </div>
            ) : (
              <div className="flex items-end justify-between gap-3 sm:gap-4 h-64 w-full">
                {data.chart_harian.map((item, idx) => {
                  const nominal = item.nominal || 0;
                  // Handle height percentage secara aman: minimal 4% untuk baseline visual, maksimal 100%
                  const percentage = nominal > 0 
                    ? Math.min(Math.max((nominal / maxChartNominal) * 100, 8), 100) 
                    : 4;
                  const dayLabel = getIndonesianDayLabel(item);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-xs py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-20 font-medium">
                        {formatRupiah(nominal)}
                      </div>

                      {/* Bar Background */}
                      <div className="w-full bg-stone-100 dark:bg-zinc-800/70 rounded-xl h-full flex items-end overflow-hidden p-1 transition-all group-hover:bg-emerald-50/60 dark:group-hover:bg-emerald-950/20">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            nominal > 0 
                              ? "bg-emerald-700 hover:bg-emerald-800" 
                              : "bg-stone-300 dark:bg-zinc-700"
                          }`}
                          style={{ height: `${percentage}%` }}
                        />
                      </div>

                      {/* Day Label */}
                      <span className="text-xs font-medium text-stone-600 dark:text-zinc-400 mt-2.5">
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5 Donasi Terbaru (Riil dari DB) */}
        <Card className="lg:col-span-3 rounded-2xl border border-stone-200 dark:border-zinc-800 flex flex-col shadow-sm">
          <CardHeader className="border-b border-stone-150 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Donasi Terbaru
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
                  Transaksi masuk terakhir yang telah terverifikasi
                </CardDescription>
              </div>
              <Link href="/admin/donasi" className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline font-semibold">
                Semua &rarr;
              </Link>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : !data?.donasi_terbaru || data.donasi_terbaru.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-sm">
                Belum ada transaksi donasi yang tercatat
              </div>
            ) : (
              <div className="space-y-3">
                {data.donasi_terbaru.map((donasi) => {
                  const initial = (donasi.donor_name || "HA").substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={donasi.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors border border-stone-150/60 dark:border-zinc-800/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {donasi.donor_name || "Hamba Allah"}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {formatRelativeTime(donasi.created_at)}
                            {donasi.program_name && (
                              <span className="truncate max-w-[120px]">• {donasi.program_name}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 pl-2">
                        +{formatRupiah(donasi.gross_amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
