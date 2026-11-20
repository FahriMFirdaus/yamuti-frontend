"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Printer, Download, AlertCircle, Loader2, Building, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlipGajiData, Payroll } from "@/types/karyawan";

// Helper terbilang rupiah
function terbilangRupiah(n: number): string {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  n = Math.floor(Math.abs(n));
  if (n < 12) return bilangan[n];
  if (n < 20) return terbilangRupiah(n - 10) + " Belas";
  if (n < 100) return terbilangRupiah(Math.floor(n / 10)) + " Puluh " + terbilangRupiah(n % 10);
  if (n < 200) return "Seratus " + terbilangRupiah(n - 100);
  if (n < 1000) return terbilangRupiah(Math.floor(n / 100)) + " Ratus " + terbilangRupiah(n % 100);
  if (n < 2000) return "Seribu " + terbilangRupiah(n - 1000);
  if (n < 1000000) return terbilangRupiah(Math.floor(n / 1000)) + " Ribu " + terbilangRupiah(n % 1000);
  if (n < 1000000000) return terbilangRupiah(Math.floor(n / 1000000)) + " Juta " + terbilangRupiah(n % 1000000);
  if (n < 1000000000000) return terbilangRupiah(Math.floor(n / 1000000000)) + " Miliar " + terbilangRupiah(n % 1000000000);
  return "";
}

interface ModalSlipGajiProps {
  isOpen: boolean;
  onClose: () => void;
  payrollId: string | null;
  payrollInitial?: Payroll | null;
  token: string | null;
  apiUrl?: string;
}

export function ModalSlipGaji({
  isOpen,
  onClose,
  payrollId,
  payrollInitial,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
}: ModalSlipGajiProps) {
  const [slipData, setSlipData] = useState<SlipGajiData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || (!payrollId && !payrollInitial)) {
      setSlipData(null);
      return;
    }

    const targetId = payrollId || payrollInitial?.id;
    if (!targetId) return;

    const fetchSlip = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`${apiUrl}/payroll/${targetId}/slip`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Gagal memuat dokumen slip gaji");
        }
        setSlipData(json.data || json);
      } catch (err: unknown) {
        // Fallback to building slip from payrollInitial if API failed
        if (payrollInitial) {
          const emp = payrollInitial.karyawan;
          const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember",
          ];
          setSlipData({
            yayasan: {
              nama: "YAYASAN AMANAH MUTIARA UMMAT INDONESIA (YAMUTI)",
              sk_kemenkumham: "AHU-0012345.AH.01.04.Tahun 2020",
              alamat: "Jl. Letkol Basyir Surya No. 45, Tasikmalaya, Jawa Barat",
              telepon: "0877-0031-2182",
              email: "info@yamuti.or.id",
              website: "https://yamuti.or.id",
            },
            slip: {
              id: payrollInitial.id,
              nomor_slip: payrollInitial.nomor_slip,
              periode_bulan: payrollInitial.periode_bulan,
              periode_tahun: payrollInitial.periode_tahun,
              nama_periode: `${months[payrollInitial.periode_bulan - 1] || payrollInitial.periode_bulan} ${payrollInitial.periode_tahun}`,
              tanggal_pembayaran: payrollInitial.tanggal_pembayaran
                ? new Date(payrollInitial.tanggal_pembayaran).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-",
              metode_pembayaran: payrollInitial.metode_pembayaran,
              status: payrollInitial.status,
              kas_bank: payrollInitial.kas_bank_akun?.nama_akun || "Bank Syariah Indonesia (BSI)",
              nomor_jurnal: payrollInitial.jurnal_umum?.nomor_referensi || null,
            },
            karyawan: {
              id: emp?.id,
              nip: emp?.nip,
              nik: emp?.nik,
              nama_lengkap: emp?.nama_lengkap,
              tipe_sdm: emp?.tipe_sdm,
              jabatan: emp?.jabatan,
              divisi: emp?.divisi,
              status_kepegawaian: emp?.status_kepegawaian,
              nama_bank: emp?.nama_bank,
              nomor_rekening: emp?.nomor_rekening,
              atas_nama_rekening: emp?.atas_nama_rekening,
            },
            pendapatan: {
              gaji_pokok: Number(payrollInitial.gaji_pokok) || 0,
              tunjangan_jabatan: Number(payrollInitial.tunjangan_jabatan) || 0,
              tunjangan_kehadiran: Number(payrollInitial.tunjangan_kehadiran) || 0,
              tunjangan_keluarga: Number(payrollInitial.tunjangan_keluarga) || 0,
              bonus_tambahan: Number(payrollInitial.bonus_tambahan) || 0,
              total_pendapatan: Number(payrollInitial.total_pendapatan) || 0,
            },
            potongan: {
              potongan_bpjs: Number(payrollInitial.potongan_bpjs) || 0,
              potongan_kasbon: Number(payrollInitial.potongan_kasbon) || 0,
              potongan_terlambat: Number(payrollInitial.potongan_terlambat) || 0,
              potongan_lain: Number(payrollInitial.potongan_lain) || 0,
              total_potongan: Number(payrollInitial.total_potongan) || 0,
            },
            gaji_bersih: Number(payrollInitial.gaji_bersih) || 0,
            terbilang: `${terbilangRupiah(Number(payrollInitial.gaji_bersih))} Rupiah`,
            catatan: payrollInitial.catatan,
            approver: {
              nama: payrollInitial.approver?.name || null,
              tanggal: payrollInitial.disetujui_pada || null,
            },
            payer: {
              nama: payrollInitial.payer?.name || null,
              tanggal: payrollInitial.dibayar_pada || null,
            },
          });
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Gagal memuat slip gaji.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlip();
  }, [isOpen, payrollId, payrollInitial, token, apiUrl]);

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

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const terbilangStr = slipData?.terbilang
    ? slipData.terbilang.endsWith("Rupiah")
      ? slipData.terbilang
      : `${slipData.terbilang} Rupiah`
    : `${terbilangRupiah(slipData?.gaji_bersih || 0)} Rupiah`;

  return (
    <>
      {/* Isolated Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #slip-gaji-print-area, #slip-gaji-print-area * {
                visibility: visible !important;
              }
              #slip-gaji-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 10mm 15mm !important;
                background: white !important;
                color: black !important;
                z-index: 999999 !important;
                box-shadow: none !important;
                border: 2px solid #27272a !important;
                border-radius: 0 !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
            }
          `,
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-150">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden my-auto">
          {/* Action Toolbar Header (Hidden on Print) */}
          <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Pratinjau Slip Gaji Resmi Yayasan
              </span>
              {slipData?.slip.status === "Dibayar" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Lunas / Dibayar
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs shadow-xs"
              >
                <Printer className="w-4 h-4" /> Cetak / Simpan PDF
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body / Scrollable Document Sheet */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-100 dark:bg-zinc-950 print:bg-white print:p-0">
            {isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                <span className="text-xs">Menyiapkan lembar cetak slip gaji...</span>
              </div>
            )}

            {errorMessage && !slipData && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {slipData && (
              <div
                id="slip-gaji-print-area"
                className="bg-white text-zinc-900 p-8 rounded-lg shadow-md border border-zinc-300 print:border-2 print:border-black print:shadow-none print:rounded-none max-w-3xl mx-auto"
              >
                {/* 1. Official YAMUTI Kop Surat */}
                <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-4 mb-5">
                  <div className="flex items-center gap-3.5">
                    {/* Emblem YAMUTI */}
                    <div className="w-14 h-14 rounded-full bg-emerald-800 text-white flex items-center justify-center font-extrabold text-xl tracking-tighter shadow-xs border-2 border-emerald-900 shrink-0">
                      YM
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-extrabold text-emerald-900 tracking-wide uppercase leading-tight">
                        {slipData.yayasan.nama || "YAYASAN AMANAH MUTIARA UMMAT INDONESIA (YAMUTI)"}
                      </h1>
                      <p className="text-[11px] text-zinc-600 font-medium">
                        Akta Notaris No. 12/2020 • SK Kemenkumham: {slipData.yayasan.sk_kemenkumham || "AHU-0012345.AH.01.04.Tahun 2020"}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {slipData.yayasan.alamat || "Jl. Letkol Basyir Surya No. 45, Tasikmalaya, Jawa Barat"} • Telp: {slipData.yayasan.telepon || "0877-0031-2182"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase tracking-wider rounded border border-emerald-300">
                      SLIP GAJI RESMI
                    </span>
                    <p className="text-[11px] font-mono font-semibold text-zinc-600 mt-1">
                      {slipData.slip.nomor_slip}
                    </p>
                  </div>
                </div>

                {/* 2. Judul Slip & Periode */}
                <div className="text-center mb-5">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 inline-block pb-1">
                    SLIP GAJI & HONORARIUM PEGAWAI
                  </h2>
                  <p className="text-xs text-zinc-600 font-medium mt-0.5">
                    Periode: <strong className="text-zinc-900">{slipData.slip.nama_periode}</strong>
                  </p>
                </div>

                {/* 3. Grid Informasi Identitas Pegawai */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs bg-zinc-50/70 p-3.5 rounded border border-zinc-200 mb-5">
                  <div className="space-y-1.5">
                    <div className="flex">
                      <span className="w-28 text-zinc-500">Nama Lengkap</span>
                      <span className="w-4 text-zinc-400">:</span>
                      <strong className="text-zinc-900 font-bold">{slipData.karyawan.nama_lengkap}</strong>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-zinc-500">NIP / NIK</span>
                      <span className="w-4 text-zinc-400">:</span>
                      <span className="font-mono text-zinc-800">
                        {slipData.karyawan.nip || "-"} / {slipData.karyawan.nik || "-"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-zinc-500">Jabatan & Divisi</span>
                      <span className="w-4 text-zinc-400">:</span>
                      <span className="text-zinc-800 font-medium">
                        {slipData.karyawan.jabatan} ({slipData.karyawan.divisi || "Umum"})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex">
                      <span className="w-28 text-zinc-500">Tipe SDM</span>
                      <span className="w-4 text-zinc-400">:</span>
                      <span className="font-semibold text-zinc-800">
                        {slipData.karyawan.tipe_sdm}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-zinc-500">Pencairan Via</span>
                      <span className="w-4 text-zinc-400">:</span>
                      <span className="font-medium text-zinc-800">
                        {slipData.karyawan.nama_bank || "Bank BSI"} ({slipData.slip.metode_pembayaran})
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-zinc-500">No. Rekening</span>
                      <span className="w-4 text-zinc-400">:</span>
                      <span className="font-mono font-medium text-zinc-800">
                        {slipData.karyawan.nomor_rekening || "-"} a.n. {slipData.karyawan.atas_nama_rekening || slipData.karyawan.nama_lengkap}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Tabel Komparatif Penghasilan vs Potongan */}
                <div className="border border-zinc-300 rounded overflow-hidden mb-4">
                  <div className="grid grid-cols-2 bg-zinc-100 text-zinc-800 font-bold text-xs uppercase tracking-wider border-b border-zinc-300">
                    <div className="py-2 px-3 border-r border-zinc-300">A. Penghasilan / Penerimaan</div>
                    <div className="py-2 px-3">B. Potongan</div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-zinc-300 text-xs font-mono">
                    {/* Kolom Penerimaan */}
                    <div className="divide-y divide-zinc-200">
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Gaji Pokok</span>
                        <span className="font-bold tabular-nums text-zinc-900">
                          {formatRupiah(slipData.pendapatan.gaji_pokok)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Tunjangan Jabatan</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.pendapatan.tunjangan_jabatan)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Tunjangan Kehadiran</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.pendapatan.tunjangan_kehadiran)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Tunjangan Keluarga</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.pendapatan.tunjangan_keluarga)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Bonus / Insentif Tambahan</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.pendapatan.bonus_tambahan)}
                        </span>
                      </div>
                    </div>

                    {/* Kolom Potongan */}
                    <div className="divide-y divide-zinc-200">
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">BPJS Ketenagakerjaan/Kes</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.potongan.potongan_bpjs)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Kasbon / Pinjaman Pegawai</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.potongan.potongan_kasbon)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Potongan Keterlambatan</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.potongan.potongan_terlambat)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3">
                        <span className="font-sans text-zinc-700">Infaq / Potongan Lain</span>
                        <span className="tabular-nums text-zinc-800">
                          {formatRupiah(slipData.potongan.potongan_lain)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 px-3 bg-zinc-50/50">
                        <span className="font-sans text-zinc-400 italic">-</span>
                        <span className="tabular-nums text-zinc-400">-</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal Penerimaan & Potongan */}
                  <div className="grid grid-cols-2 divide-x divide-zinc-300 bg-zinc-100 font-mono font-bold text-xs border-t border-zinc-300">
                    <div className="flex justify-between py-2 px-3">
                      <span className="font-sans uppercase text-[11px] text-zinc-800">Total Penghasilan (A):</span>
                      <span className="text-emerald-800 tabular-nums">
                        {formatRupiah(slipData.pendapatan.total_pendapatan)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 px-3">
                      <span className="font-sans uppercase text-[11px] text-zinc-800">Total Potongan (B):</span>
                      <span className="text-red-700 tabular-nums">
                        {formatRupiah(slipData.potongan.total_potongan)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Highlight Gaji Bersih (Take Home Pay) & Terbilang */}
                <div className="bg-emerald-50 border-2 border-emerald-800 rounded p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                        GAJI BERSIH DITERIMA (TAKE HOME PAY)
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        (Total Penghasilan A - Total Potongan B)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-900 font-mono tabular-nums">
                        {formatRupiah(slipData.gaji_bersih)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-emerald-200 text-xs">
                    <span className="font-semibold text-emerald-900">Terbilang: </span>
                    <span className="italic font-bold text-emerald-800">
                      &ldquo;{terbilangStr}&rdquo;
                    </span>
                  </div>
                </div>

                {/* Audit & Ref Transaksi */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-6 pb-2 border-b border-zinc-200">
                  <span>
                    Tanggal Pembayaran: {slipData.slip.tanggal_pembayaran || "-"}
                  </span>
                  <span>
                    Ref Jurnal ISAK 35: {slipData.slip.nomor_jurnal || "JU-PAYROLL-AUTO"}
                  </span>
                </div>

                {/* 6. Kolom Tanda Tangan Ganda (Penerima & Bendahara Yayasan) */}
                <div className="grid grid-cols-2 text-center text-xs text-zinc-800 pt-2">
                  <div>
                    <p className="font-medium">Penerima,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-zinc-900">
                      ( {slipData.karyawan.nama_lengkap} )
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      NIP. {slipData.karyawan.nip || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">
                      Tasikmalaya, {slipData.slip.tanggal_pembayaran !== "-" ? slipData.slip.tanggal_pembayaran : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="font-semibold text-zinc-900 mt-0.5">Bendahara Yayasan YAMUTI</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-400 italic font-mono border border-zinc-300 rounded px-2 py-0.5 print:hidden">
                        [Stempel & TTD Digital Sah]
                      </span>
                    </div>
                    <p className="font-bold underline text-zinc-900">
                      ( Siti Aminah, S.E. )
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Bagian Keuangan & Administrasi SDM
                    </p>
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-6 pt-3 border-t border-zinc-200 text-center text-[9px] text-zinc-400 italic">
                  Slip gaji ini diterbitkan resmi oleh Sistem Informasi Kepegawaian YAMUTI dan terintegrasi secara otomatis dengan Jurnal Akuntansi Standar ISAK 35.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
