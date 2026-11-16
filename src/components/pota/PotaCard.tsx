"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  School,
  Sparkles,
  CalendarDays,
  CreditCard,
  FileText,
  MessageCircle,
  Heart,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PotaCardProps {
  pota: any;
  onOpenReport: (pota: any) => void;
  onOpenPay: (pota: any) => void;
}

export function PotaCard({ pota, onOpenReport, onOpenPay }: PotaCardProps) {
  const [hasAamiin, setHasAamiin] = useState(false);
  const anak = pota.anak_asuh || {};

  const hitungUsia = (tgl: string) => {
    if (!tgl) return null;
    const diff = Date.now() - new Date(tgl).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const usia = hitungUsia(anak.tanggal_lahir);

  return (
    <Card className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header Kartu: Status Komitmen & Jenjang */}
        <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
          {/* Foto Potret Anak Asuh */}
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-950/40 dark:to-zinc-800 text-emerald-800 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/50 overflow-hidden shadow-inner">
            {anak.foto_identitas ? (
              <Image src={anak.foto_identitas} alt={anak.nama || "Ananda"} fill className="object-cover" />
            ) : (
              <span>{anak.nama?.charAt(0) || "A"}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                {pota.status || "Aktif"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {anak.status_keluarga || "Yatim"}
              </span>
              {usia && (
                <span className="text-[11px] text-zinc-500 font-medium">
                  • {usia} Tahun
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-1 truncate">
              {anak.nama || "Ananda Asuh"}
            </h3>

            <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5 truncate">
              <School className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{anak.tingkat_pendidikan || "Sekolah"} • {anak.nama_sekolah || "Asrama YAMUTI"}</span>
            </p>
          </div>
        </div>

        {/* Info Komitmen Donasi & Tanggal Salur */}
        <div className="p-5 py-4 space-y-2.5 text-xs bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Komitmen Beasiswa:</span>
            <span className="font-extrabold font-mono text-emerald-700 dark:text-emerald-400 text-sm">
              Rp {Number(pota.nominal_bulanan || 250000).toLocaleString("id-ID")} / bulan
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Jadwal Pengingat Salur:</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
              Setiap Tanggal {pota.hari_tagihan_per_bulan || "1"}
            </span>
          </div>

          {/* Doa Khusus & Interaksi Aamiin */}
          {pota.catatan_doa && (
            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Pesan Doa Anda untuk Ananda:
              </span>
              <p className="text-xs italic text-zinc-700 dark:text-zinc-300 leading-relaxed">
                &ldquo;{pota.catatan_doa}&rdquo;
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400">Didoakan bersama santri saat khataman Al-Qur'an</span>
                <button
                  type="button"
                  onClick={() => setHasAamiin(!hasAamiin)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                    hasAamiin
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 scale-105"
                      : "bg-zinc-100 text-zinc-600 hover:bg-amber-50 hover:text-amber-700"
                  )}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{hasAamiin ? "Aamiin Ya Rabbal 'Alamin ✓" : "Aamiin-kan Doa"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3-Tier Action Buttons */}
      <div className="p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
        {/* Tier 1 (Primary): Salur Beasiswa Bulan Ini */}
        <Button
          onClick={() => onOpenPay(pota)}
          className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Salur Beasiswa Bulan Ini</span>
        </Button>

        {/* Tier 2 & Tier 3: Rapor & Hubungi Pembina */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenReport(pota)}
            className="text-xs h-9 border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-1.5 font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rapor & Prestasi</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const text = encodeURIComponent(
                `Assalamu'alaikum Pengurus YAMUTI, saya donatur orang tua asuh dari ananda ${anak.nama || 'binaan'}. Ingin menanyakan kabar & kebutuhan ananda saat ini.`
              );
              window.open(`https://wa.me/6281221650050?text=${text}`, "_blank");
            }}
            className="text-xs h-9 border-zinc-200 dark:border-zinc-800 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-teal-950/30 flex items-center justify-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-300"
          >
            <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Chat Pembina</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
