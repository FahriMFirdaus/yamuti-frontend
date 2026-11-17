"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  School,
  CalendarDays,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PotaCardProps {
  pota: any;
  onOpenReport: (pota: any) => void;
  onOpenPay: (pota: any) => void;
  compact?: boolean;
}

export function PotaCard({ pota, onOpenReport, onOpenPay, compact }: PotaCardProps) {
  const [hasAamiin, setHasAamiin] = useState(false);
  const anak = pota.anak_asuh || {};

  const hitungUsia = (tgl: string) => {
    if (!tgl) return null;
    const diff = Date.now() - new Date(tgl).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const usia = hitungUsia(anak.tanggal_lahir);
  const nominal = Number(pota.nominal_bulanan || 250000);

  return (
    <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Header Kartu: Foto & Bio */}
        <div className="p-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-start gap-3">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-lg sm:text-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {anak.foto_identitas ? (
              <Image
                src={anak.foto_identitas}
                alt={anak.nama || "Ananda"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span>{anak.nama?.charAt(0) || "A"}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                {pota.status || "Aktif"}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {anak.status_keluarga || "Yatim"}
              </span>
              {usia && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  {usia} thn
                </span>
              )}
            </div>

            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1 truncate">
              {anak.nama || "Ananda Asuh"}
            </h3>

            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
              <School className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">
                {anak.tingkat_pendidikan || "Sekolah"} • {anak.nama_sekolah || "Asrama YAMUTI"}
              </span>
            </p>
          </div>
        </div>

        {/* Ringkasan Komitmen & Jadwal Salur */}
        <div className="p-4 py-3 space-y-2 text-xs bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-[11px]">Komitmen Beasiswa:</span>
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
              Rp {nominal.toLocaleString("id-ID")} <span className="text-[10px] text-zinc-400 font-normal">/bln</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-[11px]">Pengingat Salur:</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 text-[11px]">
              <CalendarDays className="w-3 h-3 text-zinc-400" />
              Tgl {pota.hari_tagihan_per_bulan || "1"} tiap bulan
            </span>
          </div>

          {/* Doa Ter-clamp jika ada */}
          {pota.catatan_doa && (
            <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-[11px]">
              <p className="italic text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                &ldquo;{pota.catatan_doa}&rdquo;
              </p>
              <div className="mt-1.5 pt-1.5 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400">Didoakan bersama santri</span>
                <button
                  type="button"
                  onClick={() => setHasAamiin(!hasAamiin)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer",
                    hasAamiin
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "text-zinc-500 hover:text-emerald-700 hover:bg-zinc-100"
                  )}
                >
                  {hasAamiin ? "Aamiin ✓" : "+ Aamiin-kan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer: Tombol Primer + Rapor & Chat */}
      <div className="p-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <Button
          onClick={() => onOpenPay(pota)}
          className="flex-1 h-8 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Salur Bulan Ini</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenReport(pota)}
          title="Rapor & Prestasi Akademik"
          className="h-8 px-2.5 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
          <span className="hidden sm:inline">Rapor</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          title="Hubungi Pembina Asrama via WhatsApp"
          onClick={() => {
            const text = encodeURIComponent(
              `Assalamu'alaikum Pengurus YAMUTI, saya donatur orang tua asuh dari ananda ${anak.nama || 'binaan'}. Ingin menanyakan kabar & perkembangan ananda.`
            );
            window.open(`https://wa.me/6281221650050?text=${text}`, "_blank");
          }}
          className="h-8 px-2 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
        </Button>
      </div>
    </Card>
  );
}
