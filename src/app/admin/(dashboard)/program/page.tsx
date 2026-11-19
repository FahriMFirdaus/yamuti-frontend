"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Eye,
  AlertCircle,
  Target,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export type Kampanye = {
  id: string | number;
  judul: string;
  deskripsi?: string | null;
  target_donasi: number | string;
  donasi_sum_gross_amount?: number | string;
  tanggal_mulai?: string | null;
  tanggal_berakhir?: string | null;
  status: string;
  thumbnail?: string | null;
  gambar?: string | null;
};

type StatusFilter = "ALL" | "AKTIF" | "SELESAI" | "DRAFT";

export default function KampanyePage() {
  const router = useRouter();
  const [data, setData] = useState<Kampanye[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKampanye, setSelectedKampanye] = useState<{ id: string | number; judul: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getAuthToken = async () => {
    const session = await getSession();
    return (
      session?.accessToken ||
      (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined)
    );
  };

  const fetchKampanye = useCallback(async (page = 1, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Gagal mengambil data program kampanye");
      const result = await res.json();

      if (result.data && result.data.data) {
        setData(result.data.data);
        setCurrentPage(result.data.current_page);
        setTotalPages(result.data.last_page);
      } else {
        setData(result.data || []);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat memuat data kampanye.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = await getAuthToken();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Gagal mengambil data kampanye");
        const result = await res.json();

        if (!ignore) {
          if (result.data && result.data.data) {
            setData(result.data.data);
            setCurrentPage(result.data.current_page);
            setTotalPages(result.data.last_page);
          } else {
            setData(result.data || []);
            setTotalPages(1);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal memuat data kampanye.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const handleDeleteClick = (kampanye: { id: string | number; judul: string }) => {
    setSelectedKampanye(kampanye);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedKampanye) return;
    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const token = await getAuthToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/${selectedKampanye.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus data program kampanye");

      setFeedbackMessage({
        text: `Program "${selectedKampanye.judul}" berhasil dihapus.`,
        type: "success",
      });

      fetchKampanye(currentPage, false);
      setIsDeleteDialogOpen(false);
      setSelectedKampanye(null);
    } catch (err: unknown) {
      console.error(err);
      setFeedbackMessage({
        text: err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus data.",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Helper functions
  const calculateProgress = (terkumpul: number, target: number) => {
    if (!target) return 0;
    const persentase = (terkumpul / target) * 100;
    return Math.min(Math.round(persentase), 100);
  };

  const isSelesaiProgram = useCallback((k: Kampanye) => {
    const terkumpul = parseFloat(String(k.donasi_sum_gross_amount || 0));
    const target = parseFloat(String(k.target_donasi || 0));
    const progress = calculateProgress(terkumpul, target);
    return progress >= 100 || k.status?.toLowerCase() === "selesai";
  }, []);

  const isAktifProgram = useCallback((k: Kampanye) => {
    return !isSelesaiProgram(k) && k.status?.toLowerCase() === "aktif";
  }, [isSelesaiProgram]);

  const isDraftProgram = useCallback((k: Kampanye) => {
    return !isSelesaiProgram(k) && k.status?.toLowerCase() !== "aktif";
  }, [isSelesaiProgram]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((kampanye) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        kampanye.judul.toLowerCase().includes(q) ||
        (kampanye.deskripsi && kampanye.deskripsi.toLowerCase().includes(q));

      let matchStatus = true;
      if (statusFilter === "AKTIF") {
        matchStatus = isAktifProgram(kampanye);
      } else if (statusFilter === "SELESAI") {
        matchStatus = isSelesaiProgram(kampanye);
      } else if (statusFilter === "DRAFT") {
        matchStatus = isDraftProgram(kampanye);
      }

      return matchSearch && matchStatus;
    });
  }, [data, searchQuery, statusFilter, isAktifProgram, isDraftProgram, isSelesaiProgram]);

  // Aggregates for current page
  const totalTerkumpulHalIni = useMemo(() => {
    return data.reduce((acc, curr) => acc + (parseFloat(String(curr.donasi_sum_gross_amount || 0)) || 0), 0);
  }, [data]);

  const countAktif = useMemo(() => data.filter((k) => isAktifProgram(k)).length, [data, isAktifProgram]);
  const countSelesai = useMemo(() => data.filter((k) => isSelesaiProgram(k)).length, [data, isSelesaiProgram]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Manajemen Program Kebaikan
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola kampanye donasi, target anggaran, dan ketercapaian dana yayasan YAMUTI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchKampanye(currentPage)}
            disabled={isLoading}
            className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 gap-1.5"
            title="Segarkan data program"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          <Link href="/admin/program/tambah">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
            >
              <Plus className="h-4 w-4" /> Tambah Program Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "ALL"
              ? "bg-zinc-50 border-zinc-400 ring-1 ring-zinc-400 dark:bg-zinc-800/80 dark:border-zinc-600"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Program (Hal ini)</p>
            <Target className="w-4 h-4 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {data.length} <span className="text-xs font-normal text-zinc-500">Program</span>
          </h3>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "AKTIF" ? "ALL" : "AKTIF")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "AKTIF"
              ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-300 dark:bg-blue-950/40 dark:border-blue-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Program Aktif</p>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2">
            {countAktif} <span className="text-xs font-normal text-zinc-500">Berjalan</span>
          </h3>
        </button>

        <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Total Dana Terkumpul
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatRupiah(totalTerkumpulHalIni)}
          </h3>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Toolbar: Search and Filter Tabs */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Semua ({data.length})
            </button>
            <button
              onClick={() => setStatusFilter("AKTIF")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "AKTIF"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Aktif ({countAktif})
            </button>
            <button
              onClick={() => setStatusFilter("SELESAI")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "SELESAI"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Selesai ({countSelesai})
            </button>
            <button
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "DRAFT"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Draft ({data.length - countAktif - countSelesai})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Cari nama atau deskripsi program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
            />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/60">
                <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                  <TableHead className="w-[50px] text-center font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    No
                  </TableHead>
                  <TableHead className="min-w-[280px] font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Informasi Program
                  </TableHead>
                  <TableHead className="hidden md:table-cell min-w-[200px] font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Target & Terkumpul
                  </TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[150px] font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Periode Waktu
                  </TableHead>
                  <TableHead className="font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold w-[80px] pr-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-zinc-100 dark:border-zinc-800/50">
                      <TableCell>
                        <Skeleton className="h-4 w-4 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-16 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-[120px] mb-2" />
                        <Skeleton className="h-2 w-full max-w-[150px]" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-[100px] mb-2" />
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-md mx-auto" />
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
                          onClick={() => fetchKampanye(currentPage, true)}
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
                        <Target className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                          Tidak ada data program
                        </p>
                        <p className="text-xs text-zinc-400">
                          {searchQuery
                            ? "Tidak ada program yang sesuai dengan kata kunci pencarian."
                            : "Belum ada kampanye program yang terdaftar."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((kampanye, index) => {
                    const terkumpul = parseFloat(String(kampanye.donasi_sum_gross_amount || 0));
                    const target = parseFloat(String(kampanye.target_donasi || 0));
                    const progress = calculateProgress(terkumpul, target);
                    const isSelesai = isSelesaiProgram(kampanye);
                    const isAktif = isAktifProgram(kampanye);

                    return (
                      <TableRow
                        key={kampanye.id}
                        className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <TableCell className="text-center font-medium text-zinc-500 text-xs py-4 align-top pt-5">
                          {(currentPage - 1) * 15 + index + 1}
                        </TableCell>
                        <TableCell className="py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative shrink-0 border border-zinc-200 dark:border-zinc-700">
                              {kampanye.thumbnail || kampanye.gambar ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={kampanye.thumbnail || kampanye.gambar || ""}
                                  alt={kampanye.judul}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                  <Target className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/program/${kampanye.id}`}
                                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 line-clamp-1 text-sm transition-colors"
                              >
                                {kampanye.judul}
                              </Link>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 max-w-sm">
                                {kampanye.deskripsi || "Tidak ada deskripsi"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4 align-top">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-zinc-900 dark:text-zinc-100 font-mono">
                                {formatRupiah(terkumpul)}
                              </span>
                              <span className="text-zinc-500 font-semibold">{progress}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isSelesai ? "bg-emerald-500" : "bg-blue-600"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              Target: {formatRupiah(target)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-4 align-top pt-4">
                          <div className="text-xs">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {kampanye.tanggal_mulai
                                ? new Date(kampanye.tanggal_mulai).toLocaleDateString("id-ID")
                                : "-"}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              s/d{" "}
                              {kampanye.tanggal_berakhir
                                ? new Date(kampanye.tanggal_berakhir).toLocaleDateString("id-ID")
                                : "Tanpa batas"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 align-top pt-4">
                          {isSelesai ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai
                            </Badge>
                          ) : isAktif ? (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-xs gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600" /> Aktif
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-xs gap-1 capitalize">
                              <Clock className="w-3 h-3 text-amber-600" /> {kampanye.status || "Draft"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center pr-6 py-4 align-top pt-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 mx-auto items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/admin/program/${kampanye.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/admin/program/edit/${kampanye.id}`)}
                              >
                                <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                                Edit Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                onClick={() => handleDeleteClick(kampanye)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* MODAL HAPUS PROGRAM */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Hapus Program Donasi
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus program{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{selectedKampanye?.judul}</strong>? Tindakan
              ini tidak dapat dibatalkan dan akan menghapus catatan kampanye dari sistem yayasan.
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
              {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
