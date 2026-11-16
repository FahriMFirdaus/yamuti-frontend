"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Sparkles,
  School,
  GraduationCap,
  HeartPulse,
  BookOpen,
  FileText,
  Calendar,
  Award,
  Download,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PotaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pota: any;
}

export function PotaReportModal({ isOpen, onClose, pota }: PotaReportModalProps) {
  const [activeTab, setActiveTab] = useState<"akademik" | "tahfidz" | "kesehatan" | "umum">("akademik");

  if (!pota || !pota.anak_asuh) return null;

  const anak = pota.anak_asuh;
  const records: any[] = anak.records || [];

  const akademikRecords = records.filter((r) => r.tipe === "akademik");
  const kesehatanRecords = records.filter((r) => r.tipe === "kesehatan");
  const prestasiRecords = records.filter((r) => r.tipe === "prestasi");
  const umumRecords = records.filter((r) => r.tipe === "umum" || r.tipe === "kegiatan");

  const hitungUsia = (tgl: string) => {
    if (!tgl) return null;
    const diff = Date.now() - new Date(tgl).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const usia = hitungUsia(anak.tanggal_lahir);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
        {/* Header Ananda */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-2xl bg-white/10 ring-2 ring-white/30 flex items-center justify-center shrink-0 overflow-hidden text-2xl font-bold">
              {anak.foto_identitas ? (
                <Image src={anak.foto_identitas} alt={anak.nama} fill className="object-cover" />
              ) : (
                <span>{anak.nama?.charAt(0) || "A"}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950">
                  {anak.status_keluarga || "Yatim"}
                </span>
                <span className="text-xs text-emerald-100 font-medium">
                  {anak.jenis_kelamin} {usia ? `• ${usia} Tahun` : ""}
                </span>
              </div>
              <h2 className="text-xl font-bold truncate mt-1">{anak.nama}</h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <School className="w-3.5 h-3.5 text-emerald-200" />
                <span>{anak.tingkat_pendidikan || "Sekolah"} • {anak.nama_sekolah || "Asrama YAMUTI"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 pt-3 overflow-x-auto scrollbar-none gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("akademik")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-[2px]",
              activeTab === "akademik"
                ? "border-emerald-600 text-emerald-700 bg-white dark:bg-zinc-900 dark:text-emerald-400"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            )}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Rapor Sekolah ({akademikRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tahfidz")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-[2px]",
              activeTab === "tahfidz"
                ? "border-emerald-600 text-emerald-700 bg-white dark:bg-zinc-900 dark:text-emerald-400"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            )}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Tahfidz & Prestasi ({prestasiRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("kesehatan")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-[2px]",
              activeTab === "kesehatan"
                ? "border-emerald-600 text-emerald-700 bg-white dark:bg-zinc-900 dark:text-emerald-400"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            )}
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Kesehatan ({kesehatanRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("umum")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-[2px]",
              activeTab === "umum"
                ? "border-emerald-600 text-emerald-700 bg-white dark:bg-zinc-900 dark:text-emerald-400"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            )}
          >
            <Activity className="w-4 h-4" />
            <span>Aktivitas Asrama</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-4">
          {/* TAB 1: AKADEMIK & RAPOR */}
          {activeTab === "akademik" && (
            <div className="space-y-4">
              {akademikRecords.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <GraduationCap className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Belum Ada Catatan Rapor Akademik</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Pengurus asrama akan mengunggah lembar rapor ananda pada akhir semester.</p>
                </div>
              ) : (
                akademikRecords.map((r, idx) => (
                  <div key={r.id || idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded">
                            {r.semester || "Semester Ganjil"}
                          </span>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.tanggal_kejadian || r.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1">{r.judul}</h4>
                      </div>
                      {r.nilai_rata_rata && (
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block">Nilai Rata-Rata</span>
                          <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                            {r.nilai_rata_rata}
                          </span>
                        </div>
                      )}
                    </div>

                    {r.deskripsi && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed">
                        {r.deskripsi}
                      </p>
                    )}

                    {r.lampiran_urls && r.lampiran_urls.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        {r.lampiran_urls.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Salinan Rapor Resmi (PDF / Foto)
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: TAHFIDZ & PRESTASI */}
          {activeTab === "tahfidz" && (
            <div className="space-y-4">
              {/* Ringkasan Capaian Tahfidz Asrama */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" /> Program Tahfidz Al-Qur'an Asrama
                  </span>
                  <Badge className="bg-amber-500 text-white font-bold text-[10px]">Aktif Tasmi'</Badge>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Ananda rutin mengikuti halaqah tahfidz ba'da Shubuh dan Maghrib setiap hari di asrama YAMUTI.
                </p>
              </div>

              {prestasiRecords.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  <Award className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">Belum Ada Rekam Ujian / Prestasi Khusus</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Catatan tasmi' sekali duduk atau piagam lomba ananda akan ditampilkan di sini.</p>
                </div>
              ) : (
                prestasiRecords.map((r, idx) => (
                  <div key={r.id || idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded">
                        Prestasi / Hafalan
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(r.tanggal_kejadian || r.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.judul}</h4>
                    {r.deskripsi && <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.deskripsi}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: KESEHATAN & TUMBUH KEMBANG */}
          {activeTab === "kesehatan" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-500 block">Tinggi Badan</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {anak.tinggi_badan ? `${anak.tinggi_badan} cm` : "-"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-500 block">Berat Badan</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {anak.berat_badan ? `${anak.berat_badan} kg` : "-"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-500 block">Status Gizi</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
                    Baik / Normal
                  </span>
                </div>
              </div>

              {anak.riwayat_penyakit && (
                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block mb-0.5">Catatan Medis Khusus:</span>
                  <p className="text-rose-700 dark:text-rose-400">{anak.riwayat_penyakit}</p>
                </div>
              )}

              {kesehatanRecords.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Riwayat Pemeriksaan Kesehatan Berkala</h5>
                  {kesehatanRecords.map((r, idx) => (
                    <div key={r.id || idx} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-1">
                      <div className="flex justify-between items-center text-zinc-500">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{r.judul}</span>
                        <span>{new Date(r.tanggal_kejadian || r.created_at).toLocaleDateString("id-ID")}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400">{r.deskripsi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AKTIVITAS ASRAMA */}
          {activeTab === "umum" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed space-y-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Pembinaan Karakter & Kemandirian Santri
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Selain pendidikan formal sekolah dan hafalan Qur'an, ananda juga dibimbing dalam kebiasaan shalat berjamaah tepat waktu, puasa sunnah, kebersihan asrama, serta pelatihan keterampilan kepemimpinan.
                </p>
              </div>

              {umumRecords.map((r, idx) => (
                <div key={r.id || idx} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-1">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{r.judul}</span>
                    <span>{new Date(r.tanggal_kejadian || r.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">{r.deskripsi}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end shrink-0">
          <Button onClick={onClose} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-6">
            Tutup Laporan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
