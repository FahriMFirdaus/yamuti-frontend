"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  AlertCircle,
  FileText,
  Printer,
  MessageSquare,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { ModalKwitansi } from "@/components/admin/ModalKwitansi";

export type Donasi = {
  id: string | number;
  order_id?: string;
  nama_donatur?: string;
  gross_amount: number;
  program_nama?: string;
  payment_type?: string;
  status: string;
  no_hp?: string;
  created_at: string;
};

type StatusFilter = "ALL" | "PAID" | "PENDING" | "OTHER";

export default function DonasiPage() {
  const [data, setData] = useState<Donasi[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedKwitansi, setSelectedKwitansi] = useState<Donasi | null>(null);

  const fetchDonasi = useCallback(async (page = 1, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/donasi?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Gagal mengambil data donasi");
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
        setError("Terjadi kesalahan saat memuat data donasi.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const session = await getSession();
        let token = session?.accessToken;
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("token") || undefined;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/donasi?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Gagal mengambil data donasi");
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
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Terjadi kesalahan saat memuat data donasi.");
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const isPaid = (status: string) => {
    const s = (status || "").toLowerCase();
    return s === "settlement" || s === "paid" || s === "success" || s === "berhasil";
  };

  const isPending = (status: string) => {
    const s = (status || "").toLowerCase();
    return s === "pending" || s === "menunggu";
  };

  // Filtered Data based on Search and Status Filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.nama_donatur && item.nama_donatur.toLowerCase().includes(q)) ||
        (item.order_id && item.order_id.toLowerCase().includes(q)) ||
        String(item.id).includes(q) ||
        (item.program_nama && item.program_nama.toLowerCase().includes(q));

      let matchStatus = true;
      if (statusFilter === "PAID") {
        matchStatus = isPaid(item.status);
      } else if (statusFilter === "PENDING") {
        matchStatus = isPending(item.status);
      } else if (statusFilter === "OTHER") {
        matchStatus = !isPaid(item.status) && !isPending(item.status);
      }

      return matchSearch && matchStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // Aggregates for current page
  const totalNominalPaid = useMemo(() => {
    return data
      .filter((d) => isPaid(d.status))
      .reduce((acc, curr) => acc + (Number(curr.gross_amount) || 0), 0);
  }, [data]);

  const countPaid = useMemo(() => data.filter((d) => isPaid(d.status)).length, [data]);
  const countPending = useMemo(() => data.filter((d) => isPending(d.status)).length, [data]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (data.length === 0) return;

    const headers = [
      "ID",
      "Order ID",
      "Nama Donatur",
      "Nominal (Rp)",
      "Program",
      "Metode Pembayaran",
      "Status",
      "No WhatsApp",
      "Waktu Transaksi",
    ];

    const rows = data.map((d) => [
      `"${d.id}"`,
      `"${d.order_id || "-"}"`,
      `"${(d.nama_donatur || "Hamba Allah").replace(/"/g, '""')}"`,
      d.gross_amount || 0,
      `"${(d.program_nama || "Donasi Umum").replace(/"/g, '""')}"`,
      `"${d.payment_type || "-"}"`,
      `"${d.status}"`,
      `"${d.no_hp || "-"}"`,
      `"${d.created_at ? new Date(d.created_at).toLocaleString("id-ID") : "-"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `donasi_yamuti_page_${currentPage}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Daftar Donasi Masuk
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau seluruh aliran dana masuk dari donatur publik (Midtrans & Manual).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isLoading || data.length === 0}
            className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 gap-1.5"
            title="Download riwayat donasi halaman ini dalam format CSV"
          >
            <Download className="h-4 w-4" /> Export (.csv)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDonasi(currentPage)}
            disabled={isLoading}
            className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
            title="Muat ulang data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/admin/donasi/tambah">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
            >
              <Plus className="h-4 w-4" /> Tambah Donasi Manual
            </Button>
          </Link>
        </div>
      </div>

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
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Transaksi (Hal ini)</p>
            <FileText className="w-4 h-4 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {data.length} <span className="text-xs font-normal text-zinc-500">Transaksi</span>
          </h3>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "PAID" ? "ALL" : "PAID")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "PAID"
              ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Dana Lunas ({countPaid})
            </p>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatRupiah(totalNominalPaid)}
          </h3>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "PENDING" ? "ALL" : "PENDING")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "PENDING"
              ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300 dark:bg-amber-950/40 dark:border-amber-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Menunggu Bayar
            </p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">
            {countPending} <span className="text-xs font-normal text-zinc-500">Invoice</span>
          </h3>
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Search and Filter Toolbar */}
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
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "PAID"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Lunas ({countPaid})
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Pending ({countPending})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Cari ID invoice atau donatur..."
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
                  <TableHead className="font-semibold w-[160px] pl-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    ID / Invoice
                  </TableHead>
                  <TableHead className="font-semibold pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Donatur & Program
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell w-[180px] pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Nominal
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell w-[180px] pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Metode & Waktu
                  </TableHead>
                  <TableHead className="font-semibold text-left pl-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-center w-[160px] pr-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-zinc-100 dark:border-zinc-800/50">
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="pl-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell pl-4">
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell pl-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                      </TableCell>
                      <TableCell className="text-left pl-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6 text-center">
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
                          onClick={() => fetchDonasi(currentPage)}
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
                        <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                          Tidak ada data donasi
                        </p>
                        <p className="text-xs text-zinc-400">
                          {searchQuery
                            ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian."
                            : "Belum ada riwayat transaksi donasi."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((donasi) => (
                    <TableRow
                      key={donasi.id}
                      className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 pl-6 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">#{donasi.id}</span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">
                            {donasi.order_id || "TRX-MANUAL"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pl-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm shrink-0 border border-emerald-200 dark:border-emerald-800">
                            {(donasi.nama_donatur || "H").charAt(0).toUpperCase()}
                          </div>
                          <div className="pt-0.5">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                              {donasi.nama_donatur || "Hamba Allah"}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-[260px] leading-relaxed">
                              {donasi.program_nama || "Donasi Umum (Tidak terikat program)"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell pl-4 py-4 align-top pt-4">
                        <span className="font-semibold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800 text-sm">
                          {formatRupiah(donasi.gross_amount)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm pl-4 py-4 align-top pt-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 capitalize border border-zinc-200 dark:border-zinc-700">
                            <FileText className="w-3 h-3 text-zinc-500" />
                            {donasi.payment_type?.replace(/_/g, " ").toLowerCase() || "Manual"}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">
                            {donasi.created_at
                              ? new Date(donasi.created_at).toLocaleString("id-ID", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-left pl-4 py-4 align-top pt-4">
                        {isPaid(donasi.status) ? (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Lunas (PAID)
                          </Badge>
                        ) : isPending(donasi.status) ? (
                          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-xs gap-1">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 text-xs capitalize">
                            {donasi.status || "Batal"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center pr-6 py-4 align-top pt-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedKwitansi(donasi)}
                            className="h-8 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
                            title="Buka / Cetak Kwitansi Resmi"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Kwitansi
                          </Button>
                          {donasi.no_hp && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const cleanPhone = donasi.no_hp
                                  ?.replace(/^0/, "62")
                                  .replace(/[^0-9]/g, "");
                                const text = encodeURIComponent(
                                  `Assalamu'alaikum Wr. Wb. Bpk/Ibu ${
                                    donasi.nama_donatur || "Donatur"
                                  },\n\nTerima kasih atas infak & donasi yang disalurkan melalui Yayasan YAMUTI sebesar ${formatRupiah(
                                    donasi.gross_amount
                                  )} untuk ${
                                    donasi.program_nama || "Donasi Umum"
                                  } (ID: ${donasi.order_id || "#" + donasi.id}).\n\nSemoga menjadi amal jariyah yang membawa keberkahan dan dilipatgandakan rezekinya oleh Allah SWT. Aamiin ya Rabbal 'Alamin.\n\nSalam hormat,\nPengurus Yayasan YAMUTI`
                                );
                                window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
                              }}
                              className="h-8 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400"
                              title="Kirim Ucapan Terima Kasih via WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
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

      {/* MODAL KWITANSI RESMI */}
      <ModalKwitansi
        isOpen={!!selectedKwitansi}
        onClose={() => setSelectedKwitansi(null)}
        data={
          selectedKwitansi
            ? {
                id: selectedKwitansi.id,
                order_id: selectedKwitansi.order_id,
                nama_donatur: selectedKwitansi.nama_donatur || "Hamba Allah",
                nominal: selectedKwitansi.gross_amount,
                program_nama: selectedKwitansi.program_nama,
                payment_type: selectedKwitansi.payment_type,
                created_at: selectedKwitansi.created_at,
                status: selectedKwitansi.status,
              }
            : null
        }
      />
    </div>
  );
}
