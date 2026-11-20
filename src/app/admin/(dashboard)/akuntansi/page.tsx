"use client";

import { useState, useEffect, Suspense } from "react";
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
import { VisualisasiAkuntansi } from "@/components/akuntansi/VisualisasiAkuntansi";
import { ModalJurnalManual } from "@/components/akuntansi/ModalJurnalManual";

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

  const [activeTab, setActiveTab] = useState<"visualisasi" | "jurnal" | "buku-besar" | "neraca" | "aktivitas">("visualisasi");
  const [token, setToken] = useState<string | null>(null);

  // States Filter Periode Global
  const [periodePreset, setPeriodePreset] = useState<"semua" | "bulan_ini" | "tahun_ini">("tahun_ini");
  const [startDate, setStartDate] = useState<string>(`${new Date().getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Modal Jurnal Manual
  const [isModalJurnalOpen, setIsModalJurnalOpen] = useState(false);

  // States Jurnal Umum
  const [jurnalList, setJurnalList] = useState<any[]>([]);
  const [isLoadingJurnal, setIsLoadingJurnal] = useState(false);
  const [jurnalSearch, setJurnalSearch] = useState("");
  const [jurnalPage, setJurnalPage] = useState(1);
  const [jurnalMeta, setJurnalMeta] = useState<any>(null);

  // States Buku Besar
  const [coaList, setCoaList] = useState<any[]>([]);
  const [selectedCoaId, setSelectedCoaId] = useState<string>("");
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  // States Neraca & Aktivitas
  const [neracaData, setNeracaData] = useState<any>(null);
  const [isLoadingNeraca, setIsLoadingNeraca] = useState(false);
  const [aktivitasData, setAktivitasData] = useState<any>(null);
  const [isLoadingAktivitas, setIsLoadingAktivitas] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["visualisasi", "jurnal", "buku-besar", "neraca", "aktivitas"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }

    getSession().then((session) => {
      const activeToken = session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (activeToken) setToken(activeToken);
    });
  }, [searchParams]);

  // Fetch COA (Bagan Akun)
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
      .catch((err) => console.error(err));
  }, [token]);

  // Fetch Jurnal Umum
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
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingJurnal(false));
  };

  useEffect(() => {
    if (activeTab === "jurnal" && token) {
      fetchJurnal(jurnalPage, jurnalSearch);
    }
  }, [activeTab, token, jurnalPage, startDate, endDate]);

  // Fetch Buku Besar
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
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingLedger(false));
  };

  useEffect(() => {
    if (activeTab === "buku-besar" && token && selectedCoaId) {
      fetchLedger(selectedCoaId);
    }
  }, [activeTab, token, selectedCoaId, startDate, endDate]);

  // Fetch Neraca & Aktivitas (Diambil juga untuk tab visualisasi)
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
        .finally(() => setIsLoadingNeraca(false));

      fetch(`${apiUrl}/akuntansi/laporan-aktivitas?${aktivitasParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((res) => res.json())
        .then((res) => res.data && setAktivitasData(res.data))
        .finally(() => setIsLoadingAktivitas(false));
    }
  }, [activeTab, token, startDate, endDate]);

  const handleTabChange = (t: "visualisasi" | "jurnal" | "buku-besar" | "neraca" | "aktivitas") => {
    setActiveTab(t);
    router.push(`/admin/akuntansi?tab=${t}`);
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

  // Fungsi Ekspor Data CSV
  const exportBukuBesarCSV = () => {
    if (!ledgerData?.entries?.length) return;
    const headers = ["Tanggal", "No. Referensi", "Keterangan", "Debit", "Kredit", "Saldo"];
    const rows = ledgerData.entries.map((e: any) => [
      `"${e.tanggal}"`,
      `"${e.nomor_referensi}"`,
      `"${(e.keterangan || "").replace(/"/g, '""')}"`,
      e.debit,
      e.kredit,
      e.saldo,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Buku_Besar_${ledgerData.account?.kode_akun || "akun"}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-none font-semibold text-[11px]">
              Standar Nirlaba ISAK 35
            </Badge>
            <span className="text-xs text-zinc-500">• Auto-Journal Realtime</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Akuntansi & Keuangan Yayasan
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Transparansi pembukuan berpasangan otomatis (Double-Entry), buku besar, dan neraca audit.
          </p>
        </div>

        {/* Action Header: Filter Periode & Cetak */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => handlePresetChange("bulan_ini")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                periodePreset === "bulan_ini" ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handlePresetChange("tahun_ini")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                periodePreset === "tahun_ini" ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              Tahun {new Date().getFullYear()}
            </button>
            <button
              onClick={() => handlePresetChange("semua")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                periodePreset === "semua" ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              Semua
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9 px-3 rounded-xl border-zinc-200 dark:border-zinc-800 font-semibold gap-1.5 text-xs shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cetak PDF</span>
          </Button>
        </div>
      </div>

      {/* Navigasi Tab Akuntansi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-100 dark:border-zinc-800 text-sm">
        <button
          onClick={() => handleTabChange("visualisasi")}
          className={cn(
            "px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            activeTab === "visualisasi"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <PieChart className="w-4 h-4" />
          1. Grafik & Analisis Visual
        </button>
        <button
          onClick={() => handleTabChange("jurnal")}
          className={cn(
            "px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
            activeTab === "jurnal"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          2. Jurnal Umum
        </button>
        <button
          onClick={() => handleTabChange("buku-besar")}
          className={cn(
            "px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
            activeTab === "buku-besar"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          3. Buku Besar (Ledger)
        </button>
        <button
          onClick={() => handleTabChange("neraca")}
          className={cn(
            "px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
            activeTab === "neraca"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          4. Neraca (Posisi Keuangan)
        </button>
        <button
          onClick={() => handleTabChange("aktivitas")}
          className={cn(
            "px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
            activeTab === "aktivitas"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          5. Laporan Aktivitas (Penerimaan vs Beban)
        </button>
      </div>

      {/* TAB 0: GRAFIK & ANALISIS VISUAL */}
      {activeTab === "visualisasi" && (
        <VisualisasiAkuntansi
          neracaData={neracaData}
          aktivitasData={aktivitasData}
          jurnalList={jurnalList}
        />
      )}

      {/* TAB 1: JURNAL UMUM */}
      {activeTab === "jurnal" && (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold">Daftar Jurnal Umum Berpasangan</CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Setiap transaksi donasi dan kas keluar otomatis terjurnal Debit & Kredit secara seimbang.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsModalJurnalOpen(true)}
                  className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Catat Jurnal Manual</span>
                </Button>
                <input
                  type="text"
                  placeholder="Cari referensi / keterangan..."
                  value={jurnalSearch}
                  onChange={(e) => setJurnalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchJurnal(1, jurnalSearch)}
                  className="h-9 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-56"
                />
                <Button size="sm" onClick={() => fetchJurnal(1, jurnalSearch)} className="h-9 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs">
                  Cari
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
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
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Memuat data jurnal umum...
                      </td>
                    </tr>
                  ) : jurnalList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Belum ada catatan jurnal umum yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    jurnalList.map((entry) => (
                      <>
                        <tr key={entry.id} className="bg-zinc-50/60 dark:bg-zinc-900/30 font-semibold border-t-2 border-zinc-200 dark:border-zinc-700">
                          <td className="py-2.5 px-4" colSpan={3}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-700 dark:text-emerald-400">{entry.nomor_referensi}</span>
                              <span className="text-zinc-400">•</span>
                              <span className="text-zinc-600 dark:text-zinc-300">{new Date(entry.tanggal_transaksi).toLocaleDateString("id-ID")}</span>
                              <span className="text-zinc-400">•</span>
                              <Badge variant="outline" className="text-[10px] font-normal border-zinc-200">
                                {entry.sumber_transaksi}
                              </Badge>
                            </div>
                          </td>
                          <td colSpan={2} className="py-2.5 px-4 text-right text-[11px] text-zinc-400">
                            Dicatat oleh: {entry.creator?.name || "Sistem"}
                          </td>
                        </tr>
                        {entry.items?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                            <td className="py-2 px-4 text-zinc-400 font-mono"></td>
                            <td className="py-2 px-4">
                              <div className={cn("flex items-center gap-1.5", item.kredit > 0 && "pl-6")}>
                                <span className="font-mono text-zinc-500 text-[11px]">{item.account?.kode_akun}</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.account?.nama_akun}</span>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-zinc-500 italic max-w-xs truncate">{item.memo || entry.keterangan}</td>
                            <td className="py-2 px-4 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                              {item.debit > 0 ? formatRupiah(item.debit) : "-"}
                            </td>
                            <td className="py-2 px-4 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                              {item.kredit > 0 ? formatRupiah(item.kredit) : "-"}
                            </td>
                          </tr>
                        ))}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: BUKU BESAR (LEDGER) */}
      {activeTab === "buku-besar" && (
        <div className="space-y-4">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Pilih Akun Buku Besar:
                </label>
                <select
                  value={selectedCoaId}
                  onChange={(e) => setSelectedCoaId(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[280px]"
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
                    variant="outline"
                    size="sm"
                    onClick={exportBukuBesarCSV}
                    className="h-10 px-3 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ekspor CSV</span>
                  </Button>
                  <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-right">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-semibold">Saldo Akhir Akun:</span>
                    <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                      {formatRupiah(ledgerData.ending_balance || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
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
                        <td colSpan={6} className="py-12 text-center text-zinc-400">
                          Memuat mutasi buku besar...
                        </td>
                      </tr>
                    ) : !ledgerData?.entries || ledgerData.entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400">
                          Belum ada transaksi pada akun ini.
                        </td>
                      </tr>
                    ) : (
                      ledgerData.entries.map((item: any) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 font-medium">
                          <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">{item.tanggal}</td>
                          <td className="py-2.5 px-4 font-mono text-emerald-600">{item.nomor_referensi}</td>
                          <td className="py-2.5 px-4 text-zinc-800 dark:text-zinc-200 max-w-sm truncate">{item.keterangan}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-zinc-900 dark:text-white">
                            {item.debit > 0 ? formatRupiah(item.debit) : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-zinc-900 dark:text-white">
                            {item.kredit > 0 ? formatRupiah(item.kredit) : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
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

      {/* TAB 3: NERACA / LAPORAN POSISI KEUANGAN */}
      {activeTab === "neraca" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SISI KIRI: ASET */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-zinc-100 dark:border-zinc-800 p-4">
                <CardTitle className="text-base font-bold flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                  <span>1. ASET (Kas & Bank)</span>
                  <span className="font-mono">{formatRupiah(neracaData?.aset?.total || 0)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {neracaData?.aset?.items?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50">
                        <td className="py-2.5 px-4 font-mono text-zinc-500 w-24">{item.kode_akun}</td>
                        <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">{item.nama_akun}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {formatRupiah(item.saldo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* SISI KANAN: KEWAJIBAN & ASET NETO */}
            <div className="space-y-6">
              {/* Kewajiban */}
              <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 border-b border-zinc-100 dark:border-zinc-800 p-4">
                  <CardTitle className="text-base font-bold flex items-center justify-between text-amber-900 dark:text-amber-200">
                    <span>2. KEWAJIBAN (Titipan Amanah)</span>
                    <span className="font-mono">{formatRupiah(neracaData?.kewajiban?.total || 0)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {neracaData?.kewajiban?.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 px-4 font-mono text-zinc-500 w-24">{item.kode_akun}</td>
                          <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">{item.nama_akun}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                            {formatRupiah(item.saldo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Aset Neto */}
              <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-zinc-100 dark:border-zinc-800 p-4">
                  <CardTitle className="text-base font-bold flex items-center justify-between text-blue-900 dark:text-blue-200">
                    <span>3. ASET NETO (Ekuitas Nirlaba)</span>
                    <span className="font-mono">{formatRupiah(neracaData?.aset_neto?.total || 0)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {neracaData?.aset_neto?.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 px-4 font-mono text-zinc-500 w-24">{item.kode_akun}</td>
                          <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">{item.nama_akun}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                            {formatRupiah(item.saldo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Balance Indicator Banner */}
          <div className="p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-sm font-bold">Keseimbangan Neraca (ISAK 35)</p>
                <p className="text-xs text-zinc-400">Total Aset = Total Kewajiban + Total Aset Neto</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Total Aset:</span>
                <span className="text-sm font-black font-mono text-emerald-400">{formatRupiah(neracaData?.aset?.total || 0)}</span>
              </div>
              <span className="text-zinc-500 text-xl font-bold">=</span>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Kewajiban + Ekuitas:</span>
                <span className="text-sm font-black font-mono text-emerald-400">{formatRupiah(neracaData?.total_kewajiban_dan_aset_neto || 0)}</span>
              </div>
              <Badge className={cn("ml-2 font-bold", neracaData?.is_balanced ? "bg-emerald-600 text-white" : "bg-red-600 text-white")}>
                {neracaData?.is_balanced ? "SEIMBANG (BALANCE) ✓" : "BELUM BALANCE"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAPORAN AKTIVITAS */}
      {activeTab === "aktivitas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Penerimaan */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 border-b border-zinc-100">
                <CardTitle className="text-base font-bold text-emerald-900 dark:text-emerald-300 flex justify-between">
                  <span>PENERIMAAN DONASI (PENDAPATAN)</span>
                  <span className="font-mono">{formatRupiah(aktivitasData?.penerimaan?.total || 0)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {aktivitasData?.penerimaan?.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-2.5 px-4 font-mono text-zinc-400 w-24">{item.kode_akun}</td>
                        <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">{item.nama_akun}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {formatRupiah(item.nominal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Beban */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-red-50/60 dark:bg-red-950/20 p-4 border-b border-zinc-100">
                <CardTitle className="text-base font-bold text-red-900 dark:text-red-300 flex justify-between">
                  <span>PENYALURAN & BEBAN OPERASIONAL</span>
                  <span className="font-mono">{formatRupiah(aktivitasData?.beban?.total || 0)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {aktivitasData?.beban?.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-2.5 px-4 font-mono text-zinc-400 w-24">{item.kode_akun}</td>
                        <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">{item.nama_akun}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-red-600 dark:text-red-400">
                          {formatRupiah(item.nominal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Surplus / Defisit Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">SURPLUS / (DEFISIT) BERJALAN YAYASAN</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Selisih antara total penerimaan donasi dengan realisasi penyaluran dana sosial.</p>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-2xl font-black font-mono",
                (aktivitasData?.surplus_defisit || 0) >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Memuat modul akuntansi...</div>}>
      <AkuntansiContent />
    </Suspense>
  );
}
