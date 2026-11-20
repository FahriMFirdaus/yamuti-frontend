"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import {
  FileText,
  BookOpen,
  Scale,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Printer,
  ChevronRight,
  RefreshCw,
  PieChart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  VisualisasiAkuntansi,
  NeracaResponse,
  LaporanAktivitasResponse,
} from "@/components/akuntansi/VisualisasiAkuntansi";
import {
  ModalJurnalManual,
  ChartOfAccount,
} from "@/components/akuntansi/ModalJurnalManual";

export interface JurnalItem {
  id: string;
  chart_of_account_id: string;
  debit: number;
  kredit: number;
  memo?: string | null;
  account?: {
    id: string;
    kode_akun: string;
    nama_akun: string;
    tipe_akun: string;
  };
}

export interface JurnalEntry {
  id: string;
  nomor_referensi: string;
  tanggal_transaksi: string;
  keterangan: string;
  sumber_transaksi: string;
  creator?: {
    id: string;
    name: string;
  } | null;
  items: JurnalItem[];
}

export interface JurnalMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface LedgerEntry {
  id: string;
  tanggal: string;
  nomor_referensi: string;
  keterangan: string;
  debit: number;
  kredit: number;
  saldo: number;
}

export interface LedgerResponse {
  account?: ChartOfAccount;
  start_date?: string;
  end_date?: string;
  entries: LedgerEntry[];
  ending_balance: number;
}

type TabType = "visualisasi" | "jurnal" | "buku-besar" | "neraca" | "aktivitas";

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function AkuntansiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("visualisasi");
  const [token, setToken] = useState<string | null>(null);

  const [periodePreset, setPeriodePreset] = useState<"semua" | "bulan_ini" | "tahun_ini">("tahun_ini");
  const [startDate, setStartDate] = useState<string>(`${new Date().getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [isModalJurnalOpen, setIsModalJurnalOpen] = useState(false);

  const [jurnalList, setJurnalList] = useState<JurnalEntry[]>([]);
  const [isLoadingJurnal, setIsLoadingJurnal] = useState(false);
  const [jurnalSearch, setJurnalSearch] = useState("");
  const [jurnalPage, setJurnalPage] = useState(1);
  const [jurnalMeta, setJurnalMeta] = useState<JurnalMeta | null>(null);

  const [coaList, setCoaList] = useState<ChartOfAccount[]>([]);
  const [selectedCoaId, setSelectedCoaId] = useState<string>("");
  const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  const [neracaData, setNeracaData] = useState<NeracaResponse | null>(null);
  const [isLoadingNeraca, setIsLoadingNeraca] = useState(false);
  const [aktivitasData, setAktivitasData] = useState<LaporanAktivitasResponse | null>(null);
  const [isLoadingAktivitas, setIsLoadingAktivitas] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["visualisasi", "jurnal", "buku-besar", "neraca", "aktivitas"].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }

    getSession().then((session) => {
      const activeToken =
        session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (activeToken) setToken(activeToken);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/akuntansi/coa`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setCoaList(res.data);
          if (res.data.length > 0 && !selectedCoaId) {
            setSelectedCoaId(res.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Gagal mengambil COA:", err));
  }, [token, apiUrl, selectedCoaId]);

  const fetchJurnal = (page = 1, q = "") => {
    if (!token) return;
    setIsLoadingJurnal(true);
    const params = new URLSearchParams({ page: String(page), per_page: "15" });
    if (q) params.set("q", q);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    fetch(`${apiUrl}/akuntansi/jurnal?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setJurnalList(res.data.data || []);
          setJurnalMeta(res.data);
        }
      })
      .catch((err) => console.error("Gagal mengambil data jurnal:", err))
      .finally(() => setIsLoadingJurnal(false));
  };

  useEffect(() => {
    if (activeTab === "jurnal" && token) {
      fetchJurnal(jurnalPage, jurnalSearch);
    }
  }, [activeTab, token, jurnalPage, startDate, endDate]);

  const fetchLedger = (accountId: string) => {
    if (!token || !accountId) return;
    setIsLoadingLedger(true);
    const params = new URLSearchParams({ account_id: accountId });
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    fetch(`${apiUrl}/akuntansi/buku-besar?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setLedgerData(res.data);
        }
      })
      .catch((err) => console.error("Gagal mengambil mutasi buku besar:", err))
      .finally(() => setIsLoadingLedger(false));
  };

  useEffect(() => {
    if (activeTab === "buku-besar" && token && selectedCoaId) {
      fetchLedger(selectedCoaId);
    }
  }, [activeTab, token, selectedCoaId, startDate, endDate]);

  useEffect(() => {
    if ((activeTab === "visualisasi" || activeTab === "neraca" || activeTab === "aktivitas") && token) {
      setIsLoadingNeraca(true);
      setIsLoadingAktivitas(true);

      const neracaParams = new URLSearchParams();
      if (endDate) neracaParams.set("as_of", endDate);

      const aktivitasParams = new URLSearchParams();
      if (startDate) aktivitasParams.set("start_date", startDate);
      if (endDate) aktivitasParams.set("end_date", endDate);

      fetch(`${apiUrl}/akuntansi/neraca?${neracaParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((res) => res.json())
        .then((res) => res.data && setNeracaData(res.data))
        .catch((err) => console.error("Gagal mengambil data neraca:", err))
        .finally(() => setIsLoadingNeraca(false));

      fetch(`${apiUrl}/akuntansi/laporan-aktivitas?${aktivitasParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((res) => res.json())
        .then((res) => res.data && setAktivitasData(res.data))
        .catch((err) => console.error("Gagal mengambil data aktivitas:", err))
        .finally(() => setIsLoadingAktivitas(false));
    }
  }, [activeTab, token, startDate, endDate, apiUrl]);

  const handleTabChange = (t: TabType) => {
    setActiveTab(t);
    router.push(`/admin/akuntansi?tab=${t}`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePresetChange = (preset: "semua" | "bulan_ini" | "tahun_ini") => {
    setPeriodePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "semua") {
      setStartDate("");
      setEndDate(todayStr);
    } else if (preset === "bulan_ini") {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      setStartDate(`${year}-${month}-01`);
      setEndDate(todayStr);
    } else if (preset === "tahun_ini") {
      setStartDate(`${today.getFullYear()}-01-01`);
      setEndDate(todayStr);
    }
  };

  const exportBukuBesarCSV = () => {
    if (!ledgerData?.entries?.length) return;
    const headers = ["Tanggal", "No. Referensi", "Keterangan", "Debit", "Kredit", "Saldo"];
    const rows = ledgerData.entries.map((e) => [
      `"${e.tanggal}"`,
      `"${e.nomor_referensi}"`,
      `"${(e.keterangan || "").replace(/"/g, '""')}"`,
      e.debit,
      e.kredit,
      e.saldo,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Buku_Besar_${ledgerData.account?.kode_akun || "akun"}_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-semibold text-[11px]">
              Standar Nirlaba ISAK 35
            </Badge>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              • Jurnal Berpasangan Otomatis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Akuntansi & Keuangan Yayasan
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Transparansi pembukuan berpasangan otomatis, buku besar, dan laporan posisi keuangan nirlaba (ISAK 35).
          </p>
        </div>

        {/* Action Header: Filter Periode & Cetak */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handlePresetChange("bulan_ini")}
              className={cn(
                "min-h-[36px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
                periodePreset === "bulan_ini"
                  ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("tahun_ini")}
              className={cn(
                "min-h-[36px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
                periodePreset === "tahun_ini"
                  ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              Tahun {new Date().getFullYear()}
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("semua")}
              className={cn(
                "min-h-[36px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
                periodePreset === "semua"
                  ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              Semua
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border-zinc-200 dark:border-zinc-800 font-semibold gap-1.5 text-xs shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Printer className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Cetak Laporan</span>
          </Button>
        </div>
      </div>

      {/* Navigasi Tab Akuntansi */}
      <div className="sticky top-16 z-30 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-md py-2 border-b border-zinc-200/80 dark:border-zinc-800 print:hidden">
        <div
          role="tablist"
          aria-label="Navigasi Modul Akuntansi"
          className="flex items-center gap-2 overflow-x-auto text-sm no-scrollbar touch-pan-x"
        >
          <button
            role="tab"
            aria-selected={activeTab === "visualisasi"}
            aria-controls="panel-visualisasi"
            id="tab-visualisasi"
            tabIndex={activeTab === "visualisasi" ? 0 : -1}
            onClick={() => handleTabChange("visualisasi")}
            className={cn(
              "min-h-[44px] px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              activeTab === "visualisasi"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            <PieChart className="w-4 h-4" aria-hidden="true" />
            <span>Ringkasan & Visualisasi</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "jurnal"}
            aria-controls="panel-jurnal"
            id="tab-jurnal"
            tabIndex={activeTab === "jurnal" ? 0 : -1}
            onClick={() => handleTabChange("jurnal")}
            className={cn(
              "min-h-[44px] px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              activeTab === "jurnal"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Jurnal Umum
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "buku-besar"}
            aria-controls="panel-buku-besar"
            id="tab-buku-besar"
            tabIndex={activeTab === "buku-besar" ? 0 : -1}
            onClick={() => handleTabChange("buku-besar")}
            className={cn(
              "min-h-[44px] px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              activeTab === "buku-besar"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Buku Besar
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "neraca"}
            aria-controls="panel-neraca"
            id="tab-neraca"
            tabIndex={activeTab === "neraca" ? 0 : -1}
            onClick={() => handleTabChange("neraca")}
            className={cn(
              "min-h-[44px] px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              activeTab === "neraca"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Posisi Keuangan (Neraca)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "aktivitas"}
            aria-controls="panel-aktivitas"
            id="tab-aktivitas"
            tabIndex={activeTab === "aktivitas" ? 0 : -1}
            onClick={() => handleTabChange("aktivitas")}
            className={cn(
              "min-h-[44px] px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              activeTab === "aktivitas"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Laporan Aktivitas
          </button>
        </div>
      </div>

      {/* Panel 0: Ringkasan & Visualisasi */}
      {activeTab === "visualisasi" && (
        <div role="tabpanel" id="panel-visualisasi" aria-labelledby="tab-visualisasi">
          <VisualisasiAkuntansi
            neracaData={neracaData}
            aktivitasData={aktivitasData}
            jurnalList={jurnalList}
          />
        </div>
      )}

      {/* Panel 1: Jurnal Umum */}
      {activeTab === "jurnal" && (
        <div role="tabpanel" id="panel-jurnal" aria-labelledby="tab-jurnal">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">
                    Daftar Jurnal Umum Berpasangan
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Setiap transaksi donasi dan kas keluar otomatis terjurnal Debit & Kredit secara seimbang.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <Button
                    size="sm"
                    onClick={() => setIsModalJurnalOpen(true)}
                    className="min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Catat Jurnal Manual</span>
                  </Button>
                  <input
                    id="search-jurnal"
                    type="text"
                    aria-label="Cari referensi atau keterangan jurnal"
                    placeholder="Cari referensi / keterangan..."
                    value={jurnalSearch}
                    onChange={(e) => setJurnalSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchJurnal(1, jurnalSearch)}
                    className="min-h-[44px] sm:min-h-[36px] px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fetchJurnal(1, jurnalSearch)}
                    className="min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    Cari
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto touch-pan-x">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tanggal / Ref</th>
                      <th className="py-3 px-4">Kode & Nama Akun</th>
                      <th className="py-3 px-4">Keterangan / Memo</th>
                      <th className="py-3 px-4 text-right">Debit</th>
                      <th className="py-3 px-4 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {isLoadingJurnal ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                          Memuat data jurnal umum...
                        </td>
                      </tr>
                    ) : jurnalList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                          Belum ada catatan jurnal umum yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      jurnalList.map((entry) => (
                        <React.Fragment key={entry.id}>
                          <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 font-semibold border-t-2 border-zinc-200 dark:border-zinc-700">
                            <td className="py-2.5 px-4" colSpan={3}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                                  {entry.nomor_referensi}
                                </span>
                                <span className="text-zinc-400" aria-hidden="true">•</span>
                                <span className="text-zinc-700 dark:text-zinc-300">
                                  {new Date(entry.tanggal_transaksi).toLocaleDateString("id-ID")}
                                </span>
                                <span className="text-zinc-400" aria-hidden="true">•</span>
                                <Badge variant="outline" className="text-[10px] font-normal border-zinc-200 dark:border-zinc-700">
                                  {entry.sumber_transaksi}
                                </Badge>
                              </div>
                            </td>
                            <td colSpan={2} className="py-2.5 px-4 text-right text-[11px] text-zinc-600 dark:text-zinc-400">
                              Dicatat oleh: {entry.creator?.name || "Sistem"}
                            </td>
                          </tr>
                          {entry.items?.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                              <td className="py-2 px-4 text-zinc-400 font-mono"></td>
                              <td className="py-2 px-4">
                                <div className={cn("flex items-center gap-1.5", item.kredit > 0 && "pl-6")}>
                                  <span className="font-mono tabular-nums text-zinc-500 dark:text-zinc-400 text-[11px]">
                                    {item.account?.kode_akun}
                                  </span>
                                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {item.account?.nama_akun}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400 italic max-w-xs truncate">
                                {item.memo || entry.keterangan}
                              </td>
                              <td className="py-2 px-4 text-right font-mono tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
                                {item.debit > 0 ? formatRupiah(item.debit) : "-"}
                              </td>
                              <td className="py-2 px-4 text-right font-mono tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
                                {item.kredit > 0 ? formatRupiah(item.kredit) : "-"}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Jurnal Umum Pagination Bar */}
              {jurnalMeta && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
                  <div className="text-zinc-600 dark:text-zinc-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white font-mono tabular-nums">
                      {jurnalMeta.from || (jurnalList.length > 0 ? (jurnalPage - 1) * 15 + 1 : 0)}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white font-mono tabular-nums">
                      {jurnalMeta.to || (jurnalPage - 1) * 15 + jurnalList.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white font-mono tabular-nums">
                      {jurnalMeta.total || jurnalList.length}
                    </span>{" "}
                    catatan jurnal
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={jurnalPage <= 1 || isLoadingJurnal}
                      onClick={() => {
                        const prev = Math.max(1, jurnalPage - 1);
                        setJurnalPage(prev);
                        fetchJurnal(prev, jurnalSearch);
                      }}
                      aria-label="Halaman sebelumnya"
                      className="min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Sebelumnya
                    </Button>
                    <span className="px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                      Halaman {jurnalMeta.current_page || jurnalPage} dari {jurnalMeta.last_page || 1}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={jurnalPage >= (jurnalMeta.last_page || 1) || isLoadingJurnal}
                      onClick={() => {
                        const next = jurnalPage + 1;
                        setJurnalPage(next);
                        fetchJurnal(next, jurnalSearch);
                      }}
                      aria-label="Halaman selanjutnya"
                      className="min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Panel 2: Buku Besar (Ledger) */}
      {activeTab === "buku-besar" && (
        <div role="tabpanel" id="panel-buku-besar" aria-labelledby="tab-buku-besar" className="space-y-4">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-5 bg-white dark:bg-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label
                  htmlFor="select-coa"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5"
                >
                  Pilih Akun Buku Besar:
                </label>
                <select
                  id="select-coa"
                  value={selectedCoaId}
                  onChange={(e) => setSelectedCoaId(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[280px]"
                >
                  {coaList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.kode_akun} - {c.nama_akun} ({c.tipe_akun})
                    </option>
                  ))}
                </select>
              </div>

              {ledgerData && (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={exportBukuBesarCSV}
                    className="min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Ekspor CSV</span>
                  </Button>
                  <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-right">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-semibold">
                      Saldo Akhir Akun:
                    </span>
                    <span className="text-base font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatRupiah(ledgerData.ending_balance || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
            <CardContent className="p-0">
              <div className="overflow-x-auto touch-pan-x">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">No. Ref</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Debit</th>
                      <th className="py-3 px-4 text-right">Kredit</th>
                      <th className="py-3 px-4 text-right">Saldo Berjalan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {isLoadingLedger ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                          Memuat mutasi buku besar...
                        </td>
                      </tr>
                    ) : !ledgerData?.entries || ledgerData.entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                          Belum ada transaksi pada akun ini.
                        </td>
                      </tr>
                    ) : (
                      ledgerData.entries.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 font-medium"
                        >
                          <td className="py-2.5 px-4 text-zinc-700 dark:text-zinc-300">{item.tanggal}</td>
                          <td className="py-2.5 px-4 font-mono tabular-nums text-emerald-600">{item.nomor_referensi}</td>
                          <td className="py-2.5 px-4 text-zinc-800 dark:text-zinc-200 max-w-sm truncate">
                            {item.keterangan}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-zinc-900 dark:text-white">
                            {item.debit > 0 ? formatRupiah(item.debit) : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-zinc-900 dark:text-white">
                            {item.kredit > 0 ? formatRupiah(item.kredit) : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                            {formatRupiah(item.saldo)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Panel 3: Posisi Keuangan (Neraca) */}
      {activeTab === "neraca" && (
        <div role="tabpanel" id="panel-neraca" aria-labelledby="tab-neraca" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sisi Kiri: Aset */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-base font-bold flex items-center justify-between text-zinc-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
                    1. Aset (Kas & Setara Kas)
                  </span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                    {formatRupiah(neracaData?.aset?.total || 0)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto touch-pan-x">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {neracaData?.aset?.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-2.5 px-4 font-mono tabular-nums text-zinc-500 dark:text-zinc-400 w-24">
                            {item.kode_akun}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                            {item.nama_akun}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-white">
                            {formatRupiah(item.saldo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Sisi Kanan: Liabilitas & Aset Neto */}
            <div className="space-y-6">
              {/* Liabilitas */}
              <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-base font-bold flex items-center justify-between text-zinc-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" aria-hidden="true" />
                      2. Liabilitas / Kewajiban (Titipan Amanah)
                    </span>
                    <span className="font-mono tabular-nums text-zinc-900 dark:text-white font-semibold">
                      {formatRupiah(neracaData?.kewajiban?.total || 0)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto touch-pan-x">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {neracaData?.kewajiban?.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                            <td className="py-2.5 px-4 font-mono tabular-nums text-zinc-500 dark:text-zinc-400 w-24">
                              {item.kode_akun}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                              {item.nama_akun}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-white">
                              {formatRupiah(item.saldo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Aset Neto (ISAK 35) */}
              <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-base font-bold flex items-center justify-between text-zinc-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" aria-hidden="true" />
                      3. Aset Neto (Kekayaan Bersih Yayasan)
                    </span>
                    <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                      {formatRupiah(neracaData?.aset_neto?.total || 0)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto touch-pan-x">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {neracaData?.aset_neto?.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                            <td className="py-2.5 px-4 font-mono tabular-nums text-zinc-500 dark:text-zinc-400 w-24">
                              {item.kode_akun}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                              {item.nama_akun}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-white">
                              {formatRupiah(item.saldo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Balance Indicator Banner - Mobile Friendly Stack */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold">Keseimbangan Posisi Keuangan (ISAK 35)</p>
                <p className="text-xs text-zinc-400">Total Aset = Total Liabilitas + Total Aset Neto</p>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
              <div className="text-left sm:text-right">
                <span className="text-xs text-zinc-400 block">Total Aset:</span>
                <span className="text-sm font-bold font-mono tabular-nums text-emerald-400">
                  {formatRupiah(neracaData?.aset?.total || 0)}
                </span>
              </div>
              <span className="text-zinc-500 text-lg font-bold" aria-hidden="true">=</span>
              <div className="text-left sm:text-right">
                <span className="text-xs text-zinc-400 block">Liabilitas + Aset Neto:</span>
                <span className="text-sm font-bold font-mono tabular-nums text-emerald-400">
                  {formatRupiah(neracaData?.total_kewajiban_dan_aset_neto || 0)}
                </span>
              </div>
              <Badge
                className={cn(
                  "font-semibold text-xs border whitespace-nowrap",
                  neracaData?.is_balanced
                    ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-600/20 text-red-300 border-red-500/30"
                )}
              >
                {neracaData?.is_balanced ? "Seimbang (Sesuai Standar)" : "Belum Seimbang"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Panel 4: Laporan Aktivitas */}
      {activeTab === "aktivitas" && (
        <div role="tabpanel" id="panel-aktivitas" aria-labelledby="tab-aktivitas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Penerimaan */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
                    Penerimaan Donasi & Ziswaf
                  </span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                    {formatRupiah(aktivitasData?.penerimaan?.total || 0)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto touch-pan-x">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {aktivitasData?.penerimaan?.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-2.5 px-4 font-mono tabular-nums text-zinc-500 dark:text-zinc-400 w-24">
                            {item.kode_akun}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                            {item.nama_akun}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                            {formatRupiah(Number(item.nominal ?? item.total) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Beban */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" aria-hidden="true" />
                    Penyaluran Program & Beban Operasional
                  </span>
                  <span className="font-mono tabular-nums text-zinc-900 dark:text-white font-semibold">
                    {formatRupiah(aktivitasData?.beban?.total || 0)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto touch-pan-x">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {aktivitasData?.beban?.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-2.5 px-4 font-mono tabular-nums text-zinc-500 dark:text-zinc-400 w-24">
                            {item.kode_akun}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                            {item.nama_akun}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(Number(item.nominal ?? item.total) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Surplus / Defisit Periode Berjalan */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Surplus / (Defisit) Periode Berjalan
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Selisih antara total penerimaan donasi dengan realisasi penyaluran program sosial dan operasional.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span
                className={cn(
                  "text-2xl font-bold font-mono tabular-nums",
                  (aktivitasData?.surplus_defisit || 0) >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatRupiah(aktivitasData?.surplus_defisit || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Form Jurnal Manual */}
      <ModalJurnalManual
        isOpen={isModalJurnalOpen}
        onClose={() => setIsModalJurnalOpen(false)}
        onSuccess={() => {
          fetchJurnal(1, jurnalSearch);
          if (selectedCoaId) fetchLedger(selectedCoaId);
        }}
        coaList={coaList}
        token={token}
        apiUrl={apiUrl}
      />
    </div>
  );
}

export default function AkuntansiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-600 dark:text-zinc-400">
          Memuat modul akuntansi...
        </div>
      }
    >
      <AkuntansiContent />
    </Suspense>
  );
}
