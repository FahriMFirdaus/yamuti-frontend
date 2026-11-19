"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MoreHorizontal, CheckCircle2, XCircle, CalendarClock, MessageCircle, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSession } from "next-auth/react";

type Kunjungan = {
  id: string;
  nama_tamu: string;
  no_whatsapp: string;
  jumlah_pengunjung: number;
  maksud?: string;
  tujuan?: string;
  slot_waktu: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | string;
  created_at: string;
};

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";

export default function KunjunganPage() {
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | "COMPLETE" | null>(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const fetchKunjungan = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const session = await getSession();
      const token = session?.accessToken || (typeof window !== "undefined" ? (localStorage.getItem("token") || undefined) : undefined);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kunjungan?per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setKunjunganList(json.data?.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat jadwal kunjungan:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const session = await getSession();
        const token = session?.accessToken || (typeof window !== "undefined" ? (localStorage.getItem("token") || undefined) : undefined);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kunjungan?per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !ignore) {
          const json = await res.json();
          setKunjunganList(json.data?.data || []);
        }
      } catch (e) {
        if (!ignore) console.error("Gagal memuat jadwal kunjungan:", e);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredData = kunjunganList.filter((k) => {
    const normStatus = (k.status || "").toUpperCase();
    const matchStatus = statusFilter === "ALL" || normStatus === statusFilter;
    const matchSearch =
      !searchQuery.trim() ||
      (k.nama_tamu && k.nama_tamu.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (k.no_whatsapp && k.no_whatsapp.includes(searchQuery.trim()));

    return matchStatus && matchSearch;
  });

  const totalMenunggu = kunjunganList.filter((k) => (k.status || "").toUpperCase() === "PENDING").length;
  const totalDisetujui = kunjunganList.filter((k) => (k.status || "").toUpperCase() === "APPROVED").length;
  const totalSelesai = kunjunganList.filter((k) => (k.status || "").toUpperCase() === "COMPLETED").length;
  const totalDitolak = kunjunganList.filter((k) => (k.status || "").toUpperCase() === "REJECTED").length;

  const handleActionClick = (kunjungan: Kunjungan, type: "APPROVE" | "REJECT" | "COMPLETE") => {
    setSelectedKunjungan(kunjungan);
    setModalType(type);
    setSendWhatsApp(true);
  };

  const formatSlotDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })} WIB`;
  };

  const confirmAction = async () => {
    if (!selectedKunjungan || !modalType) return;

    let statusPayload = "";
    if (modalType === "APPROVE") statusPayload = "APPROVED";
    if (modalType === "REJECT") statusPayload = "REJECTED";
    if (modalType === "COMPLETE") statusPayload = "COMPLETED";

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const session = await getSession();
      const token = session?.accessToken || (typeof window !== "undefined" ? (localStorage.getItem("token") || undefined) : undefined);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kunjungan/${selectedKunjungan.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusPayload }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status kunjungan");

      const targetPhone = selectedKunjungan.no_whatsapp?.replace(/^0/, "62").replace(/[^0-9]/g, "");
      const formattedDate = formatSlotDate(selectedKunjungan.slot_waktu);

      if (sendWhatsApp && targetPhone) {
        let waUrl = "";
        if (modalType === "APPROVE") {
          const text = encodeURIComponent(
            `Assalamu'alaikum Wr. Wb. Bpk/Ibu ${selectedKunjungan.nama_tamu},\n\nAlhamdulillah jadwal kunjungan Anda ke Yayasan YAMUTI pada:\n📅 ${formattedDate}\n👥 Jumlah: ${selectedKunjungan.jumlah_pengunjung} Orang\n\nTelah kami *SETUJUI*. Kami dengan senang hati menanti kehadiran Bapak/Ibu di panti asuhan kami.\n\nAlamat: Jl. Raya Tasikmalaya - Ciamis No. 88, Jawa Barat.\n\nTerima kasih, salam hangat dari kami pengurus & adik-adik asuh YAMUTI.`
          );
          waUrl = `https://wa.me/${targetPhone}?text=${text}`;
        } else if (modalType === "REJECT") {
          const text = encodeURIComponent(
            `Assalamu'alaikum Wr. Wb. Bpk/Ibu ${selectedKunjungan.nama_tamu},\n\nMohon maaf, terkait permohonan kunjungan ke Yayasan YAMUTI pada ${formattedDate} saat ini belum dapat kami setujui karena bentrok dengan jadwal kegiatan asrama / kuota penuh.\n\nBapak/Ibu dapat memilih tanggal alternatif lainnya melalui website kami atau berkonsultasi via kontak ini.\n\nTerima kasih atas pengertiannya.`
          );
          waUrl = `https://wa.me/${targetPhone}?text=${text}`;
        }

        if (waUrl) {
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }
      }

      setFeedbackMessage({
        text: `Status kunjungan ${selectedKunjungan.nama_tamu} berhasil diperbarui menjadi ${statusPayload}.`,
        type: "success",
      });
      fetchKunjungan();
    } catch (e) {
      console.error(e);
      setFeedbackMessage({
        text: "Terjadi kesalahan saat memperbarui status kunjungan. Silakan coba kembali.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setModalType(null);
    }
  };

  const renderBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center w-max gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Disetujui
        </Badge>
      );
    }
    if (s === "PENDING") {
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 flex items-center w-max gap-1">
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Menunggu
        </Badge>
      );
    }
    if (s === "COMPLETED") {
      return (
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 flex items-center w-max gap-1">
          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Selesai
        </Badge>
      );
    }
    if (s === "REJECTED") {
      return (
        <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 flex items-center w-max gap-1">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Ditolak
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400 border-zinc-200">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Manajemen Kunjungan Tamu
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Atur dan verifikasi jadwal kedatangan tamu & calon donatur ke panti asuhan YAMUTI.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchKunjungan()}
          disabled={isLoading}
          className="self-start sm:self-auto gap-2 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
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

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "PENDING"
              ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Menunggu Verifikasi</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalMenunggu}</h3>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "APPROVED"
              ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Disetujui (Akan Datang)</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalDisetujui}</h3>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("COMPLETED")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "COMPLETED"
              ? "bg-blue-50/60 border-blue-300 ring-1 ring-blue-300 dark:bg-blue-950/30 dark:border-blue-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Selesai Terlaksana</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalSelesai}</h3>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === "REJECTED"
              ? "bg-rose-50/60 border-rose-300 ring-1 ring-rose-300 dark:bg-rose-950/30 dark:border-rose-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Ditolak / Batal</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalDitolak}</h3>
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Filter and Search Bar */}
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
              Semua ({kunjunganList.length})
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Menunggu ({totalMenunggu})
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Disetujui ({totalDisetujui})
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "COMPLETED"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Selesai ({totalSelesai})
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === "REJECTED"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Ditolak ({totalDitolak})
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Cari nama atau no. WA..."
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
                  <TableHead className="w-[140px] pl-6 py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="min-w-[200px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Nama & Kontak</TableHead>
                  <TableHead className="min-w-[240px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Maksud / Rombongan</TableHead>
                  <TableHead className="min-w-[220px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Waktu Kunjungan</TableHead>
                  <TableHead className="w-[80px] text-center pr-6 py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                        <span className="text-sm">Memuat data jadwal kunjungan...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <CalendarClock className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">Tidak ada jadwal kunjungan</p>
                        <p className="text-xs text-zinc-400">
                          {searchQuery ? "Tidak ada hasil yang sesuai dengan kata kunci pencarian." : "Belum ada permohonan kunjungan pada filter ini."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((kunjungan) => {
                    const statusUpper = (kunjungan.status || "").toUpperCase();
                    const waClean = (kunjungan.no_whatsapp || "").replace(/^0/, "62").replace(/[^0-9]/g, "");

                    return (
                      <TableRow key={kunjungan.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/60">
                        <TableCell className="pl-6 align-top py-4">
                          {renderBadge(kunjungan.status)}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{kunjungan.nama_tamu}</p>
                          {waClean ? (
                            <a
                              href={`https://wa.me/${waClean}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 hover:underline"
                            >
                              <MessageCircle className="w-3 h-3" />
                              {kunjungan.no_whatsapp}
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400 mt-1 block">-</span>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 max-w-sm">
                            {kunjungan.maksud || kunjungan.tujuan || "Kunjungan Silaturahmi"}
                          </p>
                          <span className="text-xs text-zinc-500 font-medium mt-1 inline-block">
                            👥 {kunjungan.jumlah_pengunjung || 1} Orang
                          </span>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {formatSlotDate(kunjungan.slot_waktu)}
                          </p>
                        </TableCell>
                        <TableCell className="text-center pr-6 align-top py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 mx-auto items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              {waClean && (
                                <>
                                  <DropdownMenuItem className="cursor-pointer p-0">
                                    <a
                                      href={`https://wa.me/${waClean}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center w-full h-full px-2 py-1.5 text-emerald-700 dark:text-emerald-400"
                                    >
                                      <MessageCircle className="mr-2 h-4 w-4" /> Hubungi via WhatsApp
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {(statusUpper === "PENDING" || statusUpper === "REJECTED") && (
                                <DropdownMenuItem
                                  onClick={() => handleActionClick(kunjungan, "APPROVE")}
                                  className="text-emerald-700 dark:text-emerald-400 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Setujui Jadwal
                                </DropdownMenuItem>
                              )}

                              {(statusUpper === "PENDING" || statusUpper === "APPROVED") && (
                                <DropdownMenuItem
                                  onClick={() => handleActionClick(kunjungan, "REJECT")}
                                  className="text-rose-600 dark:text-rose-400 cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Tolak Jadwal
                                </DropdownMenuItem>
                              )}

                              {statusUpper === "APPROVED" && (
                                <DropdownMenuItem
                                  onClick={() => handleActionClick(kunjungan, "COMPLETE")}
                                  className="text-blue-600 dark:text-blue-400 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-950/40"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Tandai Telah Datang
                                </DropdownMenuItem>
                              )}

                              {statusUpper === "COMPLETED" && (
                                <div className="px-2 py-1.5 text-xs text-zinc-500 italic text-center">
                                  Kunjungan telah selesai
                                </div>
                              )}
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

      {/* Modal Aksi Dinamis (Non-blocking Dialog) */}
      <AlertDialog open={modalType !== null} onOpenChange={(open) => !open && setModalType(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={
                modalType === "REJECT"
                  ? "text-rose-600"
                  : modalType === "COMPLETE"
                  ? "text-blue-600"
                  : "text-emerald-700 dark:text-emerald-400"
              }
            >
              {modalType === "APPROVE"
                ? "Setujui Jadwal Kunjungan"
                : modalType === "REJECT"
                ? "Tolak / Batalkan Jadwal"
                : "Tandai Kunjungan Selesai"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nama Tamu:</span>
                <strong className="text-zinc-900 dark:text-zinc-100">{selectedKunjungan?.nama_tamu}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Nomor WA:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{selectedKunjungan?.no_whatsapp || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Rencana Waktu:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatSlotDate(selectedKunjungan?.slot_waktu)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Rombongan:</span>
                <span className="text-zinc-800 dark:text-zinc-200">{selectedKunjungan?.jumlah_pengunjung || 1} Orang</span>
              </div>
            </div>

            {modalType === "APPROVE" && (
              <p>
                Status kunjungan akan diubah menjadi <strong className="text-emerald-600">Disetujui</strong>. Jadwal tercatat resmi dalam kalender panti.
              </p>
            )}
            {modalType === "REJECT" && (
              <p>
                Status kunjungan akan diubah menjadi <strong className="text-rose-600">Ditolak</strong>. Harap berikan alternatif jadwal jika tamu berkenan.
              </p>
            )}
            {modalType === "COMPLETE" && (
              <p>
                Kunjungan tamu akan ditandai <strong className="text-blue-600">Selesai</strong> sebagai arsip riwayat kedatangan yang sukses terlaksana.
              </p>
            )}

            {(modalType === "APPROVE" || modalType === "REJECT") && (
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                  Buka tab WhatsApp Web otomatis dengan draf pesan konfirmasi resmi ke nomor tamu.
                </span>
              </label>
            )}
          </div>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmAction();
              }}
              disabled={isSubmitting}
              className={
                modalType === "REJECT"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : modalType === "COMPLETE"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {isSubmitting
                ? "Menyimpan..."
                : modalType === "APPROVE"
                ? "Ya, Setujui"
                : modalType === "REJECT"
                ? "Tolak Kunjungan"
                : "Tandai Selesai"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
