"use client";

import React, { useState, useEffect, Suspense, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Printer,
  CreditCard,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Scale,
  Sparkles,
  CheckCheck,
  Building,
  UserCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Karyawan,
  Payroll,
  KaryawanSummary,
  PayrollSummary,
  PaginationMeta,
  TipeSDM,
  StatusAktif,
  StatusPayroll,
} from "@/types/karyawan";

import { ModalKaryawanForm } from "@/components/karyawan/ModalKaryawanForm";
import { ModalKaryawanDetail } from "@/components/karyawan/ModalKaryawanDetail";
import { ModalGeneratePayroll } from "@/components/karyawan/ModalGeneratePayroll";
import { ModalBayarPayroll } from "@/components/karyawan/ModalBayarPayroll";
import { ModalSlipGaji } from "@/components/karyawan/ModalSlipGaji";

const MONTHS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);
}

function KaryawanDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "karyawan";
  const [, startTransition] = useTransition();

  const [token, setToken] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Tab 1 (Buku Induk Karyawan) States
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [karyawanSummary, setKaryawanSummary] = useState<KaryawanSummary>({
    total: 0,
    aktif: 0,
    nonaktif: 0,
    cuti: 0,
    pengasuh: 0,
    staf: 0,
    pengasuh_aktif: 0,
    staf_aktif: 0,
  });
  const [karyawanMeta, setKaryawanMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [karyawanSearch, setKaryawanSearch] = useState("");
  const [karyawanFilterTipe, setKaryawanFilterTipe] = useState<string>("all");
  const [karyawanFilterStatus, setKaryawanFilterStatus] = useState<string>("all");
  const [isLoadingKaryawan, setIsLoadingKaryawan] = useState(false);

  // Tab 2 (Payroll Bulanan) States
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
    periode_bulan: now.getMonth() + 1,
    periode_tahun: now.getFullYear(),
    total_slip: 0,
    total_draft: 0,
    total_disetujui: 0,
    total_dibayar: 0,
    nominal_dibayar: 0,
    nominal_draft: 0,
    nominal_disetujui: 0,
    total_pengeluaran_est: 0,
  });
  const [payrollSearch, setPayrollSearch] = useState("");
  const [payrollFilterStatus, setPayrollFilterStatus] = useState<string>("all");
  const [payrollFilterTipe, setPayrollFilterTipe] = useState<string>("all");
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);

  // Modal Control States
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [selectedKaryawanForEdit, setSelectedKaryawanForEdit] = useState<Karyawan | null>(null);

  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedKaryawanIdForDetail, setSelectedKaryawanIdForDetail] = useState<string | null>(null);

  const [isModalGenerateOpen, setIsModalGenerateOpen] = useState(false);

  const [isModalBayarOpen, setIsModalBayarOpen] = useState(false);
  const [selectedPayrollForBayar, setSelectedPayrollForBayar] = useState<Payroll | null>(null);
  const [isBulkBayar, setIsBulkBayar] = useState(false);

  const [isModalSlipOpen, setIsModalSlipOpen] = useState(false);
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] = useState<Payroll | null>(null);

  // Toast / Status Message
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Retrieve auth token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();
        let t = session?.accessToken as string | undefined;
        if (!t && typeof window !== "undefined") {
          t = localStorage.getItem("token") || undefined;
        }
        if (t) setToken(t);
      } catch {
        // Continue unauthenticated if session unavailable
      }
    };
    initAuth();
  }, []);

  // Fetch Karyawan Data & Summary
  const fetchKaryawanList = async (page = 1) => {
    setIsLoadingKaryawan(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (karyawanSearch.trim()) params.set("q", karyawanSearch.trim());
      if (karyawanFilterTipe !== "all") params.set("tipe_sdm", karyawanFilterTipe);
      if (karyawanFilterStatus !== "all") params.set("status_aktif", karyawanFilterStatus);

      const res = await fetch(`${apiUrl}/karyawan?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok) {
        const dataArray = json.data?.data || json.data || [];
        setKaryawans(dataArray);
        if (json.data?.current_page) {
          setKaryawanMeta({
            current_page: json.data.current_page,
            last_page: json.data.last_page,
            per_page: json.data.per_page,
            total: json.data.total,
          });
        }
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsLoadingKaryawan(false);
    }
  };

  const fetchKaryawanSummary = async () => {
    try {
      const res = await fetch(`${apiUrl}/karyawan/summary`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setKaryawanSummary(json.data);
      }
    } catch {
      // Ignored
    }
  };

  // Fetch Payroll Data & Summary
  const fetchPayrollList = async () => {
    setIsLoadingPayroll(true);
    try {
      const params = new URLSearchParams();
      params.set("periode_bulan", String(selectedBulan));
      params.set("periode_tahun", String(selectedTahun));
      params.set("per_page", "all");
      if (payrollSearch.trim()) params.set("q", payrollSearch.trim());
      if (payrollFilterStatus !== "all") params.set("status", payrollFilterStatus);
      if (payrollFilterTipe !== "all") params.set("tipe_sdm", payrollFilterTipe);

      const res = await fetch(`${apiUrl}/payroll?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok) {
        const dataArray = json.data?.data || json.data || [];
        setPayrolls(dataArray);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsLoadingPayroll(false);
    }
  };

  const fetchPayrollSummary = async () => {
    try {
      const params = new URLSearchParams({
        periode_bulan: String(selectedBulan),
        periode_tahun: String(selectedTahun),
      });
      const res = await fetch(`${apiUrl}/payroll/summary?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setPayrollSummary(json.data);
      }
    } catch {
      // Ignored
    }
  };

  // Initial and reactive data fetching
  useEffect(() => {
    if (currentTab === "karyawan") {
      fetchKaryawanList(1);
      fetchKaryawanSummary();
    } else if (currentTab === "payroll") {
      fetchPayrollList();
      fetchPayrollSummary();
    }
  }, [currentTab, selectedBulan, selectedTahun, token]);

  // Tab switching handler
  const handleTabChange = (tab: "karyawan" | "payroll") => {
    startTransition(() => {
      router.push(`/admin/karyawan?tab=${tab}`);
    });
  };

  // Delete Karyawan
  const handleDeleteKaryawan = async (karyawan: Karyawan) => {
    if (!window.confirm(`Yakin ingin menonaktifkan/menghapus ${karyawan.nama_lengkap}?`)) {
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/karyawan/${karyawan.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus karyawan");
      }
      setAlertMessage({ type: "success", text: `Data ${karyawan.nama_lengkap} berhasil dihapus.` });
      fetchKaryawanList(karyawanMeta.current_page);
      fetchKaryawanSummary();
    } catch (err: unknown) {
      setAlertMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus karyawan.",
      });
    }
  };

  // Approve single payroll
  const handleApprovePayroll = async (payroll: Payroll) => {
    try {
      const res = await fetch(`${apiUrl}/payroll/${payroll.id}/approve`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menyetujui slip payroll");
      }
      setAlertMessage({ type: "success", text: `Slip ${payroll.nomor_slip} berhasil disetujui.` });
      fetchPayrollList();
      fetchPayrollSummary();
    } catch (err: unknown) {
      setAlertMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyetujui payroll.",
      });
    }
  };

  // Bulk approve all drafts for current period
  const handleBulkApprove = async () => {
    const draftItems = payrolls.filter((p) => p.status === "Draft");
    if (draftItems.length === 0) {
      setAlertMessage({ type: "error", text: "Tidak ada draf payroll yang menunggu persetujuan." });
      return;
    }
    if (!window.confirm(`Setujui ${draftItems.length} draf payroll periode ini sekaligus?`)) {
      return;
    }

    try {
      for (const item of draftItems) {
        await fetch(`${apiUrl}/payroll/${item.id}/approve`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      }
      setAlertMessage({
        type: "success",
        text: `Berhasil menyetujui ${draftItems.length} draf payroll periode ini.`,
      });
      fetchPayrollList();
      fetchPayrollSummary();
    } catch (err: unknown) {
      setAlertMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kendala saat persetujuan massal.",
      });
    }
  };

  // Delete draft payroll
  const handleDeletePayroll = async (payroll: Payroll) => {
    if (!window.confirm(`Hapus draf slip ${payroll.nomor_slip}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/payroll/${payroll.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus draf payroll");
      }
      setAlertMessage({ type: "success", text: `Draf slip ${payroll.nomor_slip} berhasil dihapus.` });
      fetchPayrollList();
      fetchPayrollSummary();
    } catch (err: unknown) {
      setAlertMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus payroll.",
      });
    }
  };

  // Calculations for Tab 2 Payroll Breakdown
  const totalBebanPengasuh = payrolls
    .filter((p) => p.karyawan?.tipe_sdm === "Pengasuh/Ustadz")
    .reduce((acc, p) => acc + (Number(p.gaji_bersih) || 0), 0);

  const totalBebanStaf = payrolls
    .filter((p) => p.karyawan?.tipe_sdm !== "Pengasuh/Ustadz")
    .reduce((acc, p) => acc + (Number(p.gaji_bersih) || 0), 0);

  const totalGajiBersihPeriode = totalBebanPengasuh + totalBebanStaf;

  return (
    <div className="space-y-6">
      {/* Page Title & Synchronized Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            SDM & Payroll Yayasan
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Buku Induk Karyawan & Pengasuh, Penggajian Bulanan, dan Integrasi Jurnal Akuntansi Standar ISAK 35
          </p>
        </div>

        {/* 2 Synchronized Tab Navigation Buttons */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700/80 shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange("karyawan")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
              currentTab === "karyawan"
                ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Buku Induk SDM
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("payroll")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
              currentTab === "payroll"
                ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payroll Bulanan
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alertMessage && (
        <div
          className={cn(
            "p-3.5 rounded-lg text-xs flex items-center justify-between border animate-in fade-in-0 duration-150",
            alertMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          )}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertMessage(null)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: BUKU INDUK KARYAWAN & PENGASUH */}
      {/* ========================================================= */}
      {currentTab === "karyawan" && (
        <div className="space-y-6 animate-in fade-in-0 duration-150">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Total SDM Terdaftar</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {karyawanSummary.total}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">SDM Aktif Bekerja</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                    {karyawanSummary.aktif}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Pengasuh & Ustadz (5-1007)</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 mt-1">
                    {karyawanSummary.pengasuh}
                  </p>
                  <span className="text-[10px] text-zinc-400">
                    Aktif: {karyawanSummary.pengasuh_aktif} orang
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Staf Kantor & Amil (5-1008)</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-1">
                    {karyawanSummary.staf}
                  </p>
                  <span className="text-[10px] text-zinc-400">
                    Aktif: {karyawanSummary.staf_aktif} orang
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar: Search, Filters & Action Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <Input
                  placeholder="Cari nama, NIP, NIK, jabatan..."
                  value={karyawanSearch}
                  onChange={(e) => setKaryawanSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchKaryawanList(1);
                  }}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                value={karyawanFilterTipe}
                onChange={(e) => {
                  setKaryawanFilterTipe(e.target.value);
                }}
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Semua Tipe SDM</option>
                <option value="Pengasuh/Ustadz">Pengasuh & Ustadz (5-1007)</option>
                <option value="Staf/Amil">Staf Kantor & Amil (5-1008)</option>
              </select>

              <select
                value={karyawanFilterStatus}
                onChange={(e) => {
                  setKaryawanFilterStatus(e.target.value);
                }}
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Semua Status Aktif</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Nonaktif">Non-Aktif</option>
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchKaryawanList(1)}
                className="h-9 text-xs gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => {
                setSelectedKaryawanForEdit(null);
                setIsModalFormOpen(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 h-9 text-xs font-semibold shrink-0"
            >
              <Plus className="w-4 h-4" />
              Tambah SDM Baru
            </Button>
          </div>

          {/* Karyawan Data Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Pegawai & Identitas</th>
                    <th className="py-3 px-4">Tipe SDM & Klasifikasi Akun</th>
                    <th className="py-3 px-4">Jabatan & Divisi</th>
                    <th className="py-3 px-4">Rekening Bank</th>
                    <th className="py-3 px-4 text-right">Gaji Pokok & Tunjangan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {isLoadingKaryawan ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                        <span>Memuat data karyawan yayasan...</span>
                      </td>
                    </tr>
                  ) : karyawans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        Belum ada data SDM yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    karyawans.map((emp, idx) => (
                      <tr key={emp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-zinc-400">
                          {(karyawanMeta.current_page - 1) * karyawanMeta.per_page + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {emp.nama_lengkap.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block text-sm">
                                {emp.nama_lengkap}
                              </strong>
                              <span className="font-mono text-zinc-500 text-[11px] block">
                                NIP: {emp.nip} {emp.nik ? `• NIK: ${emp.nik}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {emp.tipe_sdm === "Pengasuh/Ustadz" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 text-[10px]">
                              Beban 5-1007 (Pengasuh)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 text-[10px]">
                              Beban 5-1008 (Staf/Amil)
                            </Badge>
                          )}
                          <span className="text-[11px] text-zinc-500 block mt-0.5">
                            Status: {emp.status_kepegawaian}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                            {emp.jabatan}
                          </span>
                          <span className="text-zinc-500 text-[11px] block">
                            {emp.divisi || "Divisi Operasional"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                            {emp.nama_bank || "Bank BSI"}
                          </span>
                          <span className="text-zinc-500 block">
                            {emp.nomor_rekening || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                            {formatRupiah(emp.gaji_pokok_standar)}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            + Tun: {formatRupiah(emp.tunjangan_tetap_standar)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {emp.status_aktif === "Aktif" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                              Aktif
                            </span>
                          )}
                          {emp.status_aktif === "Cuti" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                              Cuti
                            </span>
                          )}
                          {emp.status_aktif === "Nonaktif" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              Non-Aktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedKaryawanIdForDetail(emp.id);
                                setIsModalDetailOpen(true);
                              }}
                              title="Lihat Profil & Riwayat"
                              className="h-8 w-8 text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedKaryawanForEdit(emp);
                                setIsModalFormOpen(true);
                              }}
                              title="Edit Karyawan"
                              className="h-8 w-8 text-zinc-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteKaryawan(emp)}
                              title="Hapus / Nonaktifkan"
                              className="h-8 w-8 text-zinc-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {karyawanMeta.last_page > 1 && (
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Halaman {karyawanMeta.current_page} dari {karyawanMeta.last_page} ({karyawanMeta.total} total SDM)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={karyawanMeta.current_page <= 1}
                    onClick={() => fetchKaryawanList(karyawanMeta.current_page - 1)}
                    className="h-7 text-xs px-2"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={karyawanMeta.current_page >= karyawanMeta.last_page}
                    onClick={() => fetchKaryawanList(karyawanMeta.current_page + 1)}
                    className="h-7 text-xs px-2"
                  >
                    Berikutnya <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DAFTAR PAYROLL BULANAN */}
      {/* ========================================================= */}
      {currentTab === "payroll" && (
        <div className="space-y-6 animate-in fade-in-0 duration-150">
          {/* Filter Periode & Ringkasan Realisasi */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Pilih Periode:
              </span>
              <select
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(Number(e.target.value))}
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(Number(e.target.value))}
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchPayrollList();
                  fetchPayrollSummary();
                }}
                className="h-9 text-xs gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>
            </div>

            {/* Action Buttons: Generate & Bulk Pay */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                onClick={() => setIsModalGenerateOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 h-9 text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                Generate Draf Payroll
              </Button>

              {payrollSummary.total_draft > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBulkApprove}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 gap-1.5 h-9 text-xs font-semibold"
                >
                  <CheckCheck className="w-4 h-4" />
                  Setujui Semua ({payrollSummary.total_draft})
                </Button>
              )}

              {payrollSummary.total_disetujui > 0 && (
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedPayrollForBayar(null);
                    setIsBulkBayar(true);
                    setIsModalBayarOpen(true);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 gap-2 h-9 text-xs font-semibold shadow-xs"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Bayar Periode Ini ({payrollSummary.total_disetujui})
                </Button>
              )}
            </div>
          </div>

          {/* KPI Cards Tab 2: Total Pengeluaran Gaji & Alokasi Beban ISAK 35 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Total Gaji Bersih Periode
                </span>
                <p className="text-2xl font-extrabold font-mono tabular-nums text-emerald-900 dark:text-emerald-300 mt-1">
                  {formatRupiah(totalGajiBersihPeriode)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                  <span>Total Slip: {payrolls.length} lembar</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Dibayar: {payrollSummary.total_dibayar}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-400">
                  Beban Pengasuh & Ustadz (5-1007)
                </span>
                <p className="text-2xl font-extrabold font-mono tabular-nums text-blue-900 dark:text-blue-300 mt-1">
                  {formatRupiah(totalBebanPengasuh)}
                </p>
                <div className="text-[11px] text-zinc-500 mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
                  Alokasi Honorarium Asrama & Santri
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Beban Staf & Amil (5-1008)
                </span>
                <p className="text-2xl font-extrabold font-mono tabular-nums text-amber-900 dark:text-amber-300 mt-1">
                  {formatRupiah(totalBebanStaf)}
                </p>
                <div className="text-[11px] text-zinc-500 mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  Alokasi Gaji Operasional & Manajemen Kantor
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <Input
                  placeholder="Cari nomor slip, nama karyawan..."
                  value={payrollSearch}
                  onChange={(e) => setPayrollSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchPayrollList();
                  }}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                value={payrollFilterStatus}
                onChange={(e) => setPayrollFilterStatus(e.target.value)}
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Semua Status</option>
                <option value="Draft">Draft</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Dibayar">Dibayar</option>
              </select>

              <select
                value={payrollFilterTipe}
                onChange={(e) => setPayrollFilterTipe(e.target.value)}
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Semua Tipe SDM</option>
                <option value="Pengasuh/Ustadz">Pengasuh / Ustadz</option>
                <option value="Staf/Amil">Staf / Amil</option>
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchPayrollList}
                className="h-9 text-xs gap-1"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </Button>
            </div>
          </div>

          {/* Payroll List Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-4">No. Slip & Pegawai</th>
                    <th className="py-3 px-3">Tipe SDM</th>
                    <th className="py-3 px-3 text-right">Gaji Pokok</th>
                    <th className="py-3 px-3 text-right">Tunjangan</th>
                    <th className="py-3 px-3 text-right">Potongan</th>
                    <th className="py-3 px-4 text-right">Gaji Bersih (THP)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {isLoadingPayroll ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                        <span>Memuat daftar payroll periode {MONTHS[selectedBulan - 1]?.label} {selectedTahun}...</span>
                      </td>
                    </tr>
                  ) : payrolls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-500">
                        Belum ada data slip payroll untuk periode ini. Klik <strong>Generate Draf Payroll</strong> untuk membuat otomatis.
                      </td>
                    </tr>
                  ) : (
                    payrolls.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-zinc-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block text-sm">
                            {item.karyawan?.nama_lengkap || "Karyawan"}
                          </strong>
                          <span className="font-mono text-zinc-500 text-[11px] block">
                            {item.nomor_slip} • NIP: {item.karyawan?.nip || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {item.karyawan?.tipe_sdm === "Pengasuh/Ustadz" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                              Pengasuh (5-1007)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              Staf (5-1008)
                            </Badge>
                          )}
                          <span className="text-[11px] text-zinc-500 block mt-0.5">
                            {item.karyawan?.jabatan || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                          {formatRupiah(item.gaji_pokok)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                          {formatRupiah(
                            (Number(item.tunjangan_jabatan) || 0) +
                            (Number(item.tunjangan_kehadiran) || 0) +
                            (Number(item.tunjangan_keluarga) || 0) +
                            (Number(item.bonus_tambahan) || 0)
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-red-600 dark:text-red-400">
                          {item.total_potongan > 0 ? `-${formatRupiah(item.total_potongan)}` : "Rp 0"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums text-emerald-700 dark:text-emerald-400">
                          {formatRupiah(item.gaji_bersih)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.status === "Dibayar" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                              Dibayar
                            </span>
                          )}
                          {item.status === "Disetujui" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
                              Disetujui
                            </span>
                          )}
                          {item.status === "Draft" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Tombol Cetak Slip Gaji */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayrollForSlip(item);
                                setIsModalSlipOpen(true);
                              }}
                              className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              title="Cetak Slip Gaji Resmi"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1" />
                              Slip Gaji
                            </Button>

                            {/* Tombol Bayar jika belum dibayar */}
                            {item.status !== "Dibayar" && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayrollForBayar(item);
                                  setIsBulkBayar(false);
                                  setIsModalBayarOpen(true);
                                }}
                                className="h-7 px-2 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                title="Bayar & Catat Jurnal ISAK 35"
                              >
                                <CreditCard className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                Bayar
                              </Button>
                            )}

                            {/* Tombol Hapus jika masih Draft */}
                            {item.status === "Draft" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePayroll(item)}
                                className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                title="Hapus Draf"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DIALOGS */}
      {/* ========================================================= */}

      {/* 1. Modal Karyawan Form (Add/Edit) */}
      <ModalKaryawanForm
        isOpen={isModalFormOpen}
        onClose={() => {
          setIsModalFormOpen(false);
          setSelectedKaryawanForEdit(null);
        }}
        onSuccess={() => {
          setAlertMessage({
            type: "success",
            text: selectedKaryawanForEdit
              ? "Data karyawan berhasil diperbarui."
              : "Karyawan baru berhasil didaftarkan.",
          });
          fetchKaryawanList(karyawanMeta.current_page);
          fetchKaryawanSummary();
        }}
        karyawan={selectedKaryawanForEdit}
        token={token}
        apiUrl={apiUrl}
      />

      {/* 2. Modal Karyawan Detail & 12-Month History */}
      <ModalKaryawanDetail
        isOpen={isModalDetailOpen}
        onClose={() => {
          setIsModalDetailOpen(false);
          setSelectedKaryawanIdForDetail(null);
        }}
        karyawanId={selectedKaryawanIdForDetail}
        token={token}
        apiUrl={apiUrl}
        onOpenSlip={(payrollItem) => {
          setSelectedPayrollForSlip(payrollItem);
          setIsModalSlipOpen(true);
        }}
      />

      {/* 3. Modal Generate Bulk Payroll */}
      <ModalGeneratePayroll
        isOpen={isModalGenerateOpen}
        onClose={() => setIsModalGenerateOpen(false)}
        onSuccess={() => {
          fetchPayrollList();
          fetchPayrollSummary();
        }}
        selectedBulan={selectedBulan}
        selectedTahun={selectedTahun}
        token={token}
        apiUrl={apiUrl}
      />

      {/* 4. Modal Bayar Payroll & ISAK 35 Journal Posting */}
      <ModalBayarPayroll
        isOpen={isModalBayarOpen}
        onClose={() => {
          setIsModalBayarOpen(false);
          setSelectedPayrollForBayar(null);
        }}
        onSuccess={() => {
          setAlertMessage({
            type: "success",
            text: "Pembayaran payroll berhasil diproses dan jurnal ISAK 35 telah tercatat berimbang.",
          });
          fetchPayrollList();
          fetchPayrollSummary();
        }}
        payroll={isBulkBayar ? null : selectedPayrollForBayar}
        bulkPayrolls={isBulkBayar ? payrolls : []}
        token={token}
        apiUrl={apiUrl}
      />

      {/* 5. Modal Official Printable Slip Gaji */}
      <ModalSlipGaji
        isOpen={isModalSlipOpen}
        onClose={() => {
          setIsModalSlipOpen(false);
          setSelectedPayrollForSlip(null);
        }}
        payrollId={selectedPayrollForSlip?.id || null}
        payrollInitial={selectedPayrollForSlip}
        token={token}
        apiUrl={apiUrl}
      />
    </div>
  );
}

export default function KaryawanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
          Memuat modul SDM & Payroll Yayasan...
        </div>
      }
    >
      <KaryawanDashboardContent />
    </Suspense>
  );
}
