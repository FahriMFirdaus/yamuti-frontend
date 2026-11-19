"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  AlertCircle,
  Printer,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { ModalLaporanKas } from "@/components/admin/ModalLaporanKas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type TransaksiKas = {
  id: string | number;
  deskripsi: string;
  nominal: number;
  tipe_transaksi: "Debit" | "Kredit" | string;
  jenis_kas: string;
  donasi_id?: string | number | null;
  created_at: string;
};

export default function BukuKasPage() {
  const [transaksiKas, setTransaksiKas] = useState<TransaksiKas[]>([]);
  const [entitasKas, setEntitasKas] = useState<string[]>([]);
  const [saldos, setSaldos] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("Semua Kas");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSaldos, setIsLoadingSaldos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKas, setSelectedKas] = useState<TransaksiKas | null>(null);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getAuthToken = async () => {
    const session = await getSession();
    return (
      session?.accessToken ||
      (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined)
    );
  };

  const fetchKasLaporan = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/transaksi-keuangan?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil data laporan kas");
      const result = await res.json();
      setTransaksiKas(result.data?.data || result.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat memuat transaksi kas.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettingsAndSaldos = useCallback(async () => {
    setIsLoadingSaldos(true);
    try {
      const token = await getAuthToken();

      const resSettings = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const resultSettings = await resSettings.json();
      const splitSetting = resultSettings.data?.find((s: { key: string }) => s.key === "donasi_split_rule");
      let kasList: string[] = [
        "Yayasan Tasikmalaya",
        "Admin Sistem",
        "IT Support",
        "Operasional Website",
      ];

      if (splitSetting && splitSetting.value) {
        const parsed =
          typeof splitSetting.value === "string"
            ? JSON.parse(splitSetting.value)
            : splitSetting.value;
        if (Array.isArray(parsed) && parsed.length > 0) {
          kasList = parsed.map((r: { nama_kas: string }) => r.nama_kas);
        }
      }
      setEntitasKas(kasList);

      const saldosObj: Record<string, number> = {};
      await Promise.all(
        kasList.map(async (kasName) => {
          try {
            const resSaldo = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kas/saldo?jenis_kas=${encodeURIComponent(
                kasName
              )}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (resSaldo.ok) {
              const dataSaldo = await resSaldo.json();
              saldosObj[kasName] = dataSaldo.data?.saldo || 0;
            }
          } catch {
            saldosObj[kasName] = 0;
          }
        })
      );
      setSaldos(saldosObj);
    } catch (err) {
      console.error("Gagal mengambil pengaturan kas", err);
    } finally {
      setIsLoadingSaldos(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/transaksi-keuangan?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!ignore && res.ok) {
          const result = await res.json();
          setTransaksiKas(result.data?.data || result.data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal memuat kas.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }

      // Load settings and saldos in background
      try {
        const token = await getAuthToken();
        const resSettings = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/settings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const resultSettings = await resSettings.json();
        const splitSetting = resultSettings.data?.find((s: { key: string }) => s.key === "donasi_split_rule");
        let kasList: string[] = [
          "Yayasan Tasikmalaya",
          "Admin Sistem",
          "IT Support",
          "Operasional Website",
        ];

        if (splitSetting && splitSetting.value) {
          const parsed =
            typeof splitSetting.value === "string"
              ? JSON.parse(splitSetting.value)
              : splitSetting.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            kasList = parsed.map((r: { nama_kas: string }) => r.nama_kas);
          }
        }
        if (!ignore) setEntitasKas(kasList);

        const saldosObj: Record<string, number> = {};
        await Promise.all(
          kasList.map(async (kasName) => {
            try {
              const resSaldo = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kas/saldo?jenis_kas=${encodeURIComponent(
                  kasName
                )}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (resSaldo.ok) {
                const dataSaldo = await resSaldo.json();
                saldosObj[kasName] = dataSaldo.data?.saldo || 0;
              }
            } catch {
              saldosObj[kasName] = 0;
            }
          })
        );
        if (!ignore) setSaldos(saldosObj);
      } catch (e) {
        console.error("Gagal mengambil pengaturan kas", e);
      } finally {
        if (!ignore) setIsLoadingSaldos(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredData = useMemo(() => {
    return transaksiKas.filter((k) => {
      const matchTab = activeTab === "Semua Kas" || k.jenis_kas === activeTab;
      const matchSearch =
        !searchQuery.trim() ||
        k.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nominal?.toString().includes(searchQuery.trim());
      return matchTab && matchSearch;
    });
  }, [transaksiKas, activeTab, searchQuery]);

  // Aggregate Totals for the active filtered tab
  const totalDebit = useMemo(() => {
    return filteredData
      .filter((k) => k.tipe_transaksi === "Debit")
      .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
  }, [filteredData]);

  const totalKredit = useMemo(() => {
    return filteredData
      .filter((k) => k.tipe_transaksi === "Kredit")
      .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
  }, [filteredData]);

  const handleDeleteClick = (kas: TransaksiKas) => {
    setSelectedKas(kas);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedKas) return;
    setIsDeleting(true);
    setFeedbackMessage(null);
    try {
      const token = await getAuthToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/transaksi-keuangan/${selectedKas.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus transaksi keuangan");

      setFeedbackMessage({
        text: `Transaksi "${selectedKas.deskripsi}" berhasil dihapus.`,
        type: "success",
      });

      fetchKasLaporan(false);
      fetchSettingsAndSaldos();
      setIsDeleteDialogOpen(false);
      setSelectedKas(null);
    } catch (err: unknown) {
      console.error(err);
      setFeedbackMessage({
        text: err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus transaksi.",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshAll = () => {
    fetchKasLaporan(true);
    fetchSettingsAndSaldos();
  };

  return (
    <div className="space-y-6">
      {/* HEADER UTAMA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buku Kas & Transaksi
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sistem Fund Accounting panti asuhan. Pantau saldo setiap kantong kas secara transparan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isLoading || isLoadingSaldos}
            className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 gap-1.5"
            title="Segarkan data dan saldo kas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isLoadingSaldos ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLaporanOpen(true)}
            className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 gap-1.5"
          >
            <Printer className="h-4 w-4 text-blue-600" /> Cetak Laporan (PDF)
          </Button>
          <Link href="/admin/kas/tambah">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5">
              <Plus className="h-4 w-4" /> Tambah Transaksi Manual
            </Button>
          </Link>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg border text-sm flex items-center justify-between ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold ml-4 underline hover:opacity-75"
          >
            Tutup
          </button>
        </div>
      )}

      {/* PANEL 1: RINGKASAN SALDO BUKU KAS PER ENTITAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoadingSaldos ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-[150px] mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          entitasKas.map((kasName) => {
            const isSelected = activeTab === kasName;
            return (
              <button
                key={kasName}
                type="button"
                onClick={() => setActiveTab(isSelected ? "Semua Kas" : kasName)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-1 pr-2">
                    Kas {kasName}
                  </CardTitle>
                  <div className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Wallet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
                  {formatRupiah(saldos[kasName] || 0)}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Bersih / Tersedia
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* PANEL 2: AGREGAT ARUS KAS (DEBIT VS KREDIT TAB AKTIF) */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Total Pemasukan (Debit)
          </div>
          <p className="text-base font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-1">
            {formatRupiah(totalDebit)}
          </p>
        </div>

        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Pengeluaran (Kredit)
          </div>
          <p className="text-base font-bold font-mono text-rose-800 dark:text-rose-300 mt-1">
            {formatRupiah(totalKredit)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* TABS DINAMIS */}
        <div className="flex flex-wrap gap-1.5">
          {["Semua Kas", ...entitasKas].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab === "Semua Kas" ? "Semua Kas" : `Kas ${tab}`}
            </button>
          ))}
        </div>

        {/* TABEL TRANSAKSI */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 p-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Cari transaksi (Deskripsi/Nominal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm placeholder:text-zinc-400"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80">
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead className="font-semibold w-[160px] pl-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      Tanggal
                    </TableHead>
                    <TableHead className="font-semibold pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      Deskripsi Transaksi
                    </TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      Buku Kas
                    </TableHead>
                    <TableHead className="font-semibold text-right pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      Debit (Masuk)
                    </TableHead>
                    <TableHead className="font-semibold text-right pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      Kredit (Keluar)
                    </TableHead>
                    <TableHead className="font-semibold text-center w-[100px] pr-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-zinc-100 dark:border-zinc-800/50">
                        <TableCell className="pl-6">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="pl-4">
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell pl-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right pl-4">
                          <Skeleton className="h-4 w-[100px] ml-auto" />
                        </TableCell>
                        <TableCell className="text-right pl-4">
                          <Skeleton className="h-4 w-[100px] ml-auto" />
                        </TableCell>
                        <TableCell className="pr-6">
                          <Skeleton className="h-8 w-16 mx-auto rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-rose-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="h-6 w-6" />
                          <span>{error}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchKasLaporan(true)}
                            className="mt-2 text-xs"
                          >
                            Coba Lagi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Wallet className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                            Belum ada laporan transaksi
                          </p>
                          <p className="text-xs text-zinc-400">
                            {searchQuery
                              ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian."
                              : "Belum ada riwayat transaksi pada buku kas ini."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((kas) => {
                      const isSistem = !!kas.donasi_id;

                      return (
                        <TableRow
                          key={kas.id}
                          className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                        >
                          <TableCell className="text-xs font-medium text-zinc-600 dark:text-zinc-400 pl-6 align-top py-4">
                            {kas.created_at
                              ? new Date(kas.created_at).toLocaleString("id-ID", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </TableCell>
                          <TableCell className="pl-4 align-top py-4">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                              {kas.deskripsi}
                            </p>
                            {isSistem ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-700 mt-1 bg-emerald-50 px-2 py-0.5 rounded-sm dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                ✓ Auto Split (Sistem)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-blue-700 mt-1 bg-blue-50 px-2 py-0.5 rounded-sm dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                                ◿ Manual
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell pl-4 align-top py-4">
                            <Badge
                              variant="outline"
                              className="text-xs text-zinc-600 dark:text-zinc-300 font-normal bg-zinc-50 dark:bg-zinc-800"
                            >
                              {kas.jenis_kas || "Umum"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700 dark:text-emerald-400 pl-4 align-top py-4">
                            {kas.tipe_transaksi === "Debit" ? (
                              <div className="flex items-center justify-end gap-1.5 font-mono text-sm">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />{" "}
                                {formatRupiah(kas.nominal)}
                              </div>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-700">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-rose-700 dark:text-rose-400 pl-4 align-top py-4">
                            {kas.tipe_transaksi === "Kredit" ? (
                              <div className="flex items-center justify-end gap-1.5 font-mono text-sm">
                                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />{" "}
                                {formatRupiah(kas.nominal)}
                              </div>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-700">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center pr-6 align-top py-4">
                            {isSistem ? (
                              <div className="flex justify-center">
                                <span className="inline-flex items-center justify-center text-[10px] text-zinc-400 font-medium px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 rounded cursor-not-allowed">
                                  🔒 Terkunci
                                </span>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                  onClick={() => handleDeleteClick(kas)}
                                  title="Hapus transaksi manual"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL HAPUS TRANSAKSI */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Hapus Transaksi Kas Manual
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan dan menghapus transaksi manual{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{selectedKas?.deskripsi}</strong> sebesar{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {selectedKas && formatRupiah(selectedKas.nominal)}
              </strong>
              ? Data ini akan dihapus dari buku kas yayasan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Transaksi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL CETAK LAPORAN KAS */}
      <ModalLaporanKas
        isOpen={isLaporanOpen}
        onClose={() => setIsLaporanOpen(false)}
        transaksi={transaksiKas}
        entitasKas={entitasKas}
        saldos={saldos}
        activeTab={activeTab}
      />
    </div>
  );
}
