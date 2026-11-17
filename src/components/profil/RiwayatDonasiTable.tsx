"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DonasiItem {
  id: string | number;
  invoice?: string;
  gross_amount?: number;
  nominal?: number;
  status?: string;
  created_at?: string;
  tanggal?: string;
  program?: string;
  nama_donatur?: string;
  kampanye?: {
    id: string;
    judul: string;
    slug?: string;
  };
}

interface DonasiMeta {
  current_page?: number;
  last_page?: number;
  total?: number;
  from?: number;
  to?: number;
  per_page?: number;
}

interface RiwayatDonasiTableProps {
  data: DonasiItem[];
  meta: DonasiMeta | null;
  currentPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSelectKwitansi: (item: DonasiItem) => void;
  onSelectSertifikat: (item: DonasiItem) => void;
  onSelectDetail: (item: DonasiItem) => void;
  onFilterStatus?: (status: string) => void;
  onSearch?: (query: string) => void;
}

export function RiwayatDonasiTable({
  data,
  meta,
  currentPage,
  isLoading,
  onPageChange,
  onSelectKwitansi,
  onSelectSertifikat,
  onSelectDetail,
  onFilterStatus,
  onSearch,
}: RiwayatDonasiTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    if (onFilterStatus) {
      onFilterStatus(status === "all" ? "" : status);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const isSuccessStatus = (status?: string) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === "success" || s === "settlement" || s === "berhasil" || s === "paid";
  };

  return (
    <div className="space-y-3.5">
      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Semua Status" },
            { id: "paid", label: "Berhasil" },
            { id: "pending", label: "Menunggu" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleStatusChange(item.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border",
                filterStatus === item.id
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700 font-semibold"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="Cari invoice / program..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg"
          />
        </div>
      </div>

      {/* Modern Compact Table with Max Height & Internal Scroll */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="max-h-[460px] overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-800/50 sticky top-0 z-10 backdrop-blur-xs">
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 w-[140px]">
                  Invoice & Tanggal
                </TableHead>
                <TableHead className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Program Donasi
                </TableHead>
                <TableHead className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 w-[140px]">
                  Nominal (Rp)
                </TableHead>
                <TableHead className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 w-[110px]">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 text-right w-[150px]">
                  Dokumen & Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-xs text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span>Memuat riwayat donasi...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-zinc-500">
                    Tidak ada riwayat donasi yang sesuai.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((donasi) => {
                  const isPaid = isSuccessStatus(donasi.status);
                  const nominal = Number(donasi.gross_amount || donasi.nominal || 0);
                  const tanggal = donasi.created_at || donasi.tanggal;
                  const dateFormatted = tanggal
                    ? new Date(tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";

                  return (
                    <TableRow
                      key={donasi.id}
                      className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Invoice & Tanggal */}
                      <TableCell className="py-2.5">
                        <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {donasi.invoice || `INV-${donasi.id}`}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {dateFormatted}
                        </div>
                      </TableCell>

                      {/* Program Donasi */}
                      <TableCell className="py-2.5">
                        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {donasi.kampanye?.judul || donasi.program || "Donasi Infaq YAMUTI"}
                        </div>
                      </TableCell>

                      {/* Nominal */}
                      <TableCell className="py-2.5">
                        <div className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                          Rp {nominal.toLocaleString("id-ID")}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2.5">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Berhasil
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending
                          </span>
                        )}
                      </TableCell>

                      {/* Dokumen & Aksi */}
                      <TableCell className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid && (
                            <>
                              <button
                                type="button"
                                title="Lihat Kwitansi Resmi"
                                onClick={() => onSelectKwitansi(donasi)}
                                className="h-7 px-2 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3 h-3" />
                                <span className="hidden xl:inline">Kwitansi</span>
                              </button>
                              <button
                                type="button"
                                title="E-Sertifikat Donatur"
                                onClick={() => onSelectSertifikat(donasi)}
                                className="h-7 px-2 rounded-md border border-amber-200 dark:border-amber-800 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span className="hidden xl:inline">Sertifikat</span>
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            title="Rincian Lengkap"
                            onClick={() => onSelectDetail(donasi)}
                            className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Pagination Footer */}
        {meta && meta.last_page && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500">
              Halaman {currentPage} dari {meta.last_page} ({meta.total || data.length} donasi)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
              >
                ← Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(meta.last_page || 1, currentPage + 1))}
                disabled={currentPage >= (meta.last_page || 1) || isLoading}
                className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
              >
                Selanjutnya →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
