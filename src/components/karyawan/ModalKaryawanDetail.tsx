"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Briefcase,
  Building,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Karyawan, Payroll } from "@/types/karyawan";

interface ModalKaryawanDetailProps {
  isOpen: boolean;
  onClose: () => void;
  karyawanId: string | null;
  token: string | null;
  apiUrl?: string;
  onOpenSlip?: (payroll: Payroll) => void;
}

export function ModalKaryawanDetail({
  isOpen,
  onClose,
  karyawanId,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  onOpenSlip,
}: ModalKaryawanDetailProps) {
  const [karyawan, setKaryawan] = useState<Karyawan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !karyawanId) {
      setKaryawan(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`${apiUrl}/karyawan/${karyawanId}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Gagal memuat detail karyawan");
        }
        setKaryawan(json.data || json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Terjadi kesalahan saat memuat data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, karyawanId, token, apiUrl]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const getBulanNama = (bulan: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return months[bulan - 1] || String(bulan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/75 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shadow-xs border border-emerald-200 dark:border-emerald-800">
              {karyawan?.nama_lengkap
                ? karyawan.nama_lengkap.substring(0, 2).toUpperCase()
                : "SDM"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {karyawan?.nama_lengkap || "Profil SDM Yayasan"}
                {karyawan?.status_aktif === "Aktif" && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px]">
                    Aktif
                  </Badge>
                )}
                {karyawan?.status_aktif === "Cuti" && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    Cuti
                  </Badge>
                )}
                {karyawan?.status_aktif === "Nonaktif" && (
                  <Badge variant="outline" className="bg-zinc-100 text-zinc-600 border-zinc-300 text-[10px]">
                    Non-Aktif
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                NIP: {karyawan?.nip || "-"} • NIK: {karyawan?.nik || "-"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs">Memuat berkas profil karyawan...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {karyawan && !isLoading && (
            <>
              {/* Row 1: Informasi Pokok & Penugasan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Kolom Kiri: Kepegawaian & Klasifikasi ISAK 35 */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    <Briefcase className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    Penugasan & Klasifikasi Akun
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Tipe SDM / Akun:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {karyawan.tipe_sdm}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-mono">
                        {karyawan.tipe_sdm === "Pengasuh/Ustadz"
                          ? "Beban 5-1007 (Pengasuh & Ustadz)"
                          : "Beban 5-1008 (Staf & Amil)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Jabatan:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {karyawan.jabatan}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Divisi:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.divisi || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Status Kepegawaian:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.status_kepegawaian}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Mulai Bertugas:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.tanggal_bergabung
                          ? new Date(karyawan.tanggal_bergabung).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Jenis Kelamin:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.jenis_kelamin}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Kontak & Alamat */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    Kontak & Identitas Pribadi
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-500 block flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-400" /> No. WhatsApp:
                      </span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.no_hp || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block flex items-center gap-1">
                        <Mail className="w-3 h-3 text-zinc-400" /> Email:
                      </span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 break-all">
                        {karyawan.email || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Tempat, Tgl Lahir:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.tempat_lahir || "-"}{" "}
                        {karyawan.tanggal_lahir ? `, ${karyawan.tanggal_lahir.substring(0, 10)}` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Didaftarkan Oleh:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {karyawan.creator?.name || "Super Admin"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs pt-1">
                    <span className="text-zinc-500 block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" /> Alamat Domisili:
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {karyawan.alamat || "Belum ada catatan alamat domisili."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Finansial & Rekening */}
              <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-200/80 dark:border-emerald-800/50 pb-2 mb-3">
                  <CreditCard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  Rekening Pencairan & Kompensasi Standar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 block">Bank Penampung:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {karyawan.nama_bank || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 block">Nomor Rekening:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {karyawan.nomor_rekening || "-"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      a.n. {karyawan.atas_nama_rekening || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 block">Standar Gaji Pokok:</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm tabular-nums">
                      {formatRupiah(karyawan.gaji_pokok_standar || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 block">Standar Tunjangan Tetap:</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm tabular-nums">
                      {formatRupiah(karyawan.tunjangan_tetap_standar || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Riwayat Payroll 12 Bulan Terakhir */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    Riwayat Payroll 12 Bulan Terakhir
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    Total: {karyawan.payrolls?.length || 0} slip penggajian
                  </span>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-3">Periode</th>
                        <th className="py-2.5 px-3">No. Slip</th>
                        <th className="py-2.5 px-3 text-right">Pendapatan</th>
                        <th className="py-2.5 px-3 text-right">Potongan</th>
                        <th className="py-2.5 px-3 text-right">Gaji Bersih</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {(!karyawan.payrolls || karyawan.payrolls.length === 0) ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-zinc-500">
                            Belum ada riwayat slip gaji tercatat untuk pegawai ini.
                          </td>
                        </tr>
                      ) : (
                        karyawan.payrolls.map((pay) => (
                          <tr key={pay.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="py-2.5 px-3 font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                              {getBulanNama(pay.periode_bulan)} {pay.periode_tahun}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-zinc-500 whitespace-nowrap">
                              {pay.nomor_slip}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                              {formatRupiah(pay.total_pendapatan)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-red-600 dark:text-red-400">
                              {pay.total_potongan > 0 ? `-${formatRupiah(pay.total_potongan)}` : "Rp 0"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                              {formatRupiah(pay.gaji_bersih)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {pay.status === "Dibayar" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                  Dibayar
                                </span>
                              )}
                              {pay.status === "Disetujui" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
                                  Disetujui
                                </span>
                              )}
                              {pay.status === "Draft" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {onOpenSlip && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onOpenSlip(pay)}
                                  className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                >
                                  <Printer className="w-3.5 h-3.5 mr-1" />
                                  Slip Gaji
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end bg-zinc-50/50 dark:bg-zinc-800/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-zinc-700 dark:text-zinc-300 text-xs h-8"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
