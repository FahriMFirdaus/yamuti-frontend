"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Inbox,
} from "lucide-react";

export interface NeracaItem {
  id: string;
  kode_akun: string;
  nama_akun: string;
  saldo: number;
}

export interface NeracaSection {
  items: NeracaItem[];
  total: number;
}

export interface NeracaResponse {
  as_of_date?: string;
  aset?: NeracaSection;
  kewajiban?: NeracaSection;
  aset_neto?: NeracaSection;
  total_kewajiban_dan_aset_neto?: number;
  is_balanced?: boolean;
}

export interface AktivitasItem {
  kode_akun?: string;
  nama_akun: string;
  nominal?: number;
  total?: number;
}

export interface AktivitasSection {
  items: AktivitasItem[];
  total: number;
}

export interface LaporanAktivitasResponse {
  start_date?: string;
  end_date?: string;
  penerimaan?: AktivitasSection;
  beban?: AktivitasSection;
  surplus_defisit?: number;
}

export interface VisualisasiAkuntansiProps {
  neracaData: NeracaResponse | null;
  aktivitasData: LaporanAktivitasResponse | null;
  jurnalList?: any[];
  isLoading?: boolean;
}

function formatRupiahShort(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}Rb`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

const CHART_PALETTE = [
  "#059669", // emerald-600 (primary)
  "#0d9488", // teal-600
  "#0284c7", // sky-600
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#64748b", // slate-500
];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "rgba(24, 24, 27, 0.95)",
  border: "1px solid rgba(63, 63, 70, 0.5)",
  borderRadius: "0.75rem",
  color: "#ffffff",
  fontSize: "12px",
  padding: "10px 14px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
};

export function VisualisasiAkuntansi({
  neracaData,
  aktivitasData,
  jurnalList = [],
  isLoading = false,
}: VisualisasiAkuntansiProps) {
  // 1. Data Sumber Penerimaan Donasi
  const penerimaanChartData = useMemo(() => {
    if (!aktivitasData?.penerimaan?.items || aktivitasData.penerimaan.items.length === 0) {
      return [];
    }
    return aktivitasData.penerimaan.items
      .map((it) => ({
        name: it.nama_akun.replace("Penerimaan ", "").replace("Donasi ", ""),
        fullName: it.nama_akun,
        total: Number(it.nominal ?? it.total) || 0,
      }))
      .filter((it) => it.total > 0);
  }, [aktivitasData]);

  // 2. Data Proporsi Penyaluran Beban / Program
  const bebanChartData = useMemo(() => {
    if (!aktivitasData?.beban?.items || aktivitasData.beban.items.length === 0) {
      return [];
    }
    return aktivitasData.beban.items
      .map((it) => ({
        name: it.nama_akun.replace("Beban ", "").replace("Penyaluran ", ""),
        fullName: it.nama_akun,
        value: Number(it.nominal ?? it.total) || 0,
      }))
      .filter((it) => it.value > 0);
  }, [aktivitasData]);

  // 3. Tren Arus Kas Bulanan Riil dari Riwayat Transaksi Jurnal
  const trenBulananData = useMemo(() => {
    if (!jurnalList || jurnalList.length === 0) {
      return [];
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthMap: Record<
      string,
      { bulan: string; sortKey: string; Penerimaan: number; Penyaluran: number; Surplus: number }
    > = {};

    for (const entry of jurnalList) {
      if (!entry.tanggal_transaksi) continue;
      const d = new Date(entry.tanggal_transaksi);
      if (isNaN(d.getTime())) continue;

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          bulan: label,
          sortKey: monthKey,
          Penerimaan: 0,
          Penyaluran: 0,
          Surplus: 0,
        };
      }

      if (Array.isArray(entry.items)) {
        for (const it of entry.items) {
          const code = it.account?.kode_akun || "";
          if (code.startsWith("4")) {
            monthMap[monthKey].Penerimaan += Number(it.kredit || it.debit) || 0;
          } else if (code.startsWith("5")) {
            monthMap[monthKey].Penyaluran += Number(it.debit || it.kredit) || 0;
          }
        }
      }
    }

    const sorted = Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    return sorted.map((item) => ({
      ...item,
      Surplus: item.Penerimaan - item.Penyaluran,
    }));
  }, [jurnalList]);

  // 4. Metrik Ringkasan & Rasio Penyaluran
  const { totalPenerimaan, totalBeban, programSocial, operasionalAmil, ratioPenyaluran } = useMemo(() => {
    const pTotal = Number(aktivitasData?.penerimaan?.total) || 0;
    const bTotal = Number(aktivitasData?.beban?.total) || 0;

    let operasional = 0;
    let social = 0;

    if (aktivitasData?.beban?.items?.length) {
      aktivitasData.beban.items.forEach((it) => {
        const val = Number(it.nominal ?? it.total) || 0;
        const name = (it.nama_akun || "").toLowerCase();
        const code = it.kode_akun || "";
        if (name.includes("operasional") || code.startsWith("5-2")) {
          operasional += val;
        } else {
          social += val;
        }
      });
    }

    const calcBeban = social + operasional || bTotal;
    const ratio = calcBeban > 0 ? Math.round((social / calcBeban) * 100) : 0;

    return {
      totalPenerimaan: pTotal,
      totalBeban: bTotal,
      programSocial: social,
      operasionalAmil: operasional,
      ratioPenyaluran: ratio,
    };
  }, [aktivitasData]);

  const surplusDefisit = totalPenerimaan - totalBeban;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Cards: Rasio Kepatuhan & Snapshot Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rasio Penyaluran Sosial */}
        <Card className="rounded-2xl border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Rasio Efektivitas Program
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
              {ratioPenyaluran}%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Penyaluran Program
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Proporsi alokasi program penyaluran sosial terhadap total beban yayasan.
          </p>
        </Card>

        {/* Total Penerimaan */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-5 shadow-xs bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Total Penerimaan
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
              {formatRupiahShort(totalPenerimaan)}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Akumulasi penerimaan donasi dan dana Ziswaf pada periode berjalan.
          </p>
        </Card>

        {/* Total Beban & Penyaluran */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-5 shadow-xs bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Total Penyaluran
            </span>
            <HeartHandshake className="w-5 h-5 text-teal-600" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
              {formatRupiahShort(totalBeban)}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            {formatRupiahShort(programSocial)} Program &bull; {formatRupiahShort(operasionalAmil)} Amil.
          </p>
        </Card>

        {/* Surplus / Defisit Neto */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-5 shadow-xs bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Surplus / Defisit Neto
            </span>
            <Activity className="w-5 h-5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <span
              className={cn(
                "text-2xl font-bold font-mono tabular-nums",
                surplusDefisit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
              )}
            >
              {formatRupiahShort(surplusDefisit)}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Kenaikan (penurunan) Aset Neto Tanpa Pembatasan (ISAK 35).
          </p>
        </Card>
      </div>

      {/* Row 1: Line Chart (Tren) & Doughnut Chart (Beban Penyaluran) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 sm:p-6">
          <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span>Tren Arus Kas (Penerimaan vs Penyaluran)</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Visualisasi dinamika kas masuk dan realisasi penyaluran bulanan
            </CardDescription>
          </div>

          <div className="h-[300px] w-full pt-2">
            {trenBulananData.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trenBulananData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#71717a" }} stroke="#71717a" />
                  <YAxis
                    tickFormatter={formatRupiahShort}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    stroke="#71717a"
                  />
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(value: unknown) => [`Rp ${Number(value).toLocaleString("id-ID")}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="Penerimaan"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#059669" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Penyaluran"
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#e11d48" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Surplus"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0284c7" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-zinc-600 dark:text-zinc-400">
                <Activity className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-2" aria-hidden="true" />
                <p className="text-xs font-semibold">Data riwayat transaksi belum mencukupi untuk grafik tren bulanan.</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Grafik tren akan terakumulasi otomatis saat jurnal tercatat dalam rentang bulan berkala.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-5 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 sm:p-6">
          <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-teal-600" aria-hidden="true" />
              <span>Proporsi Alokasi Beban & Program</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Distribusi pemanfaatan dana donatur per program yayasan
            </CardDescription>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center">
            {bebanChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bebanChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {bebanChartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(value: unknown) => [
                      `Rp ${Number(value).toLocaleString("id-ID")}`,
                      "Alokasi",
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: "11px", lineHeight: "1.4" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-zinc-600 dark:text-zinc-400">
                <Inbox className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-2" aria-hidden="true" />
                <p className="text-xs font-semibold">Belum ada rincian alokasi beban pada periode ini.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Bar Chart (Sumber Penerimaan Donasi) & Card Keseimbangan Neraca ISAK 35 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 sm:p-6">
          <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span>Komposisi Sumber Penerimaan Donasi</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Perbandingan nominal yang diterima berdasarkan kategori akad donasi
            </CardDescription>
          </div>

          <div className="h-[280px] w-full pt-2">
            {penerimaanChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={penerimaanChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#71717a" />
                  <YAxis
                    tickFormatter={formatRupiahShort}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    stroke="#71717a"
                  />
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(value: unknown) => [
                      `Rp ${Number(value).toLocaleString("id-ID")}`,
                      "Penerimaan",
                    ]}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-zinc-600 dark:text-zinc-400">
                <Inbox className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-2" aria-hidden="true" />
                <p className="text-xs font-semibold">Belum ada rincian sumber donasi pada periode ini.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Ringkasan Keseimbangan Neraca ISAK 35 */}
        <Card className="lg:col-span-5 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  <span>Keseimbangan Posisi Keuangan</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Struktur Aset vs Liabilitas & Aset Neto Yayasan (ISAK 35)
                </CardDescription>
              </div>
              <Badge
                className={cn(
                  "font-semibold text-xs border",
                  neracaData?.is_balanced !== false
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                )}
              >
                {neracaData?.is_balanced !== false ? "Seimbang" : "Perlu Penyesuaian"}
              </Badge>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  Total Aset (Kas & Bank)
                </span>
                <span className="text-sm sm:text-base font-semibold font-mono tabular-nums text-zinc-900 dark:text-white">
                  {formatRupiahShort(neracaData?.aset?.total || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  Total Liabilitas (Kewajiban)
                </span>
                <span className="text-sm sm:text-base font-semibold font-mono tabular-nums text-zinc-900 dark:text-white">
                  {formatRupiahShort(neracaData?.kewajiban?.total || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
                  Total Aset Neto
                </span>
                <span className="text-sm sm:text-base font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
                  {formatRupiahShort(neracaData?.aset_neto?.total || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Standar Pelaporan: ISAK 35 IAI</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Terverifikasi Jurnal Otomatis
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
