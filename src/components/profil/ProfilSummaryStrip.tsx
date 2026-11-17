"use client";

import { Heart, HeartHandshake, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilSummaryStripProps {
  totalNominalDonasi: number;
  totalFrekuensiDonasi: number;
  totalAnakAsuh: number;
  statusBulanIniLunas: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function ProfilSummaryStrip({
  totalNominalDonasi,
  totalFrekuensiDonasi,
  totalAnakAsuh,
  statusBulanIniLunas,
  onNavigateTab,
}: ProfilSummaryStripProps) {
  const metrics = [
    {
      label: "Total Donasi Tersalur",
      value: `Rp ${totalNominalDonasi.toLocaleString("id-ID")}`,
      subtext: "Akumulasi infaq & sedekah",
      icon: TrendingUp,
      color: "emerald",
      tab: "donasi",
    },
    {
      label: "Frekuensi Kebaikan",
      value: `${totalFrekuensiDonasi} Transaksi`,
      subtext: "Jejak kepedulian Anda",
      icon: Heart,
      color: "rose",
      tab: "donasi",
    },
    {
      label: "Ananda Binaan (POTA)",
      value: `${totalAnakAsuh} Anak Asuh`,
      subtext: totalAnakAsuh > 0 ? "Beasiswa aktif berjalan" : "Mari dampingi santri",
      icon: HeartHandshake,
      color: "amber",
      tab: "anak-asuh",
    },
    {
      label: "Beasiswa Bulan Ini",
      value: totalAnakAsuh === 0 ? "Belum Ada POTA" : statusBulanIniLunas ? "Lunas Tersalurkan" : "Menunggu Salur",
      subtext: totalAnakAsuh === 0 ? "Buka tab Anak Asuh" : statusBulanIniLunas ? "Alhamdulillah lancar" : "Bulan berjalan",
      icon: CheckCircle2,
      color: statusBulanIniLunas || totalAnakAsuh === 0 ? "teal" : "blue",
      tab: "anak-asuh",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigateTab && onNavigateTab(item.tab)}
            className={cn(
              "p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer",
              "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800",
              "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs group"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                {item.label}
              </span>
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                  item.color === "emerald" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
                  item.color === "rose" && "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
                  item.color === "amber" && "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                  item.color === "teal" && "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
                  item.color === "blue" && "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
              {item.value}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
              {item.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
