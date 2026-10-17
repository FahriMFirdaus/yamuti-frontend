"use client";

import React, { useRef } from "react";
import { Printer, Download, X, Calendar, FileText, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalLaporanKasProps {
  isOpen: boolean;
  onClose: () => void;
  transaksi: any[];
  entitasKas: string[];
  saldos: Record<string, number>;
  activeTab: string;
}

export function ModalLaporanKas({
  isOpen,
  onClose,
  transaksi,
  entitasKas,
  saldos,
  activeTab
}: ModalLaporanKasProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const filteredTransaksi = transaksi.filter(t => 
    activeTab === "Semua Kas" ? true : t.jenis_kas === activeTab
  );

  const totalMasuk = filteredTransaksi
    .filter(t => t.tipe_transaksi === "Debit")
    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  const totalKeluar = filteredTransaksi
    .filter(t => t.tipe_transaksi === "Kredit")
    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  const totalSaldo = totalMasuk - totalKeluar;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        
        {/* Action Header - Hidden on Print */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
              Laporan Keuangan & Mutasi Kas ({activeTab})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm">
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div ref={printRef} className="p-8 print:p-0 bg-white text-zinc-900 print:text-black">
          {/* Print specific style */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 15mm;
                background: white !important;
                color: black !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
            }
          `}</style>

          <div className="print-container">
            {/* KOP SURAT */}
            <div className="border-b-2 border-zinc-900 pb-4 mb-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow">
                YM
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-black tracking-wide uppercase text-zinc-900">
                  Yayasan Amanah Muhsinin Peduli Umat (YAMUTI)
                </h1>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                  Akta Notaris No. 12/2020 • SK Kemenkumham: AHU-0014285.AH.01.04.Tahun 2020<br />
                  Sekretariat: Jl. Raya Tasikmalaya - Ciamis No. 88, Jawa Barat | Telp/WA: 0812-3456-7890
                </p>
              </div>
            </div>

            {/* TITLE & PERIOD */}
            <div className="text-center my-4">
              <h2 className="text-lg font-bold tracking-tight uppercase underline underline-offset-4">
                LAPORAN MUTASI KAS & ARUS DANA
              </h2>
              <p className="text-xs text-zinc-600 mt-1">
                Kategori: <strong className="text-zinc-800">{activeTab}</strong> | Dicetak pada: {today}
              </p>
            </div>

            {/* FINANCIAL SUMMARY BOX */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> Total Pemasukan (Debit)
                </span>
                <p className="text-base font-black text-emerald-600 font-mono mt-1">
                  {formatRupiah(totalMasuk)}
                </p>
              </div>
              <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-600" /> Total Pengeluaran (Kredit)
                </span>
                <p className="text-base font-black text-red-600 font-mono mt-1">
                  {formatRupiah(totalKeluar)}
                </p>
              </div>
              <div className="border border-zinc-900 rounded-lg p-3 bg-zinc-900 text-white print:border-black print:text-black print:bg-zinc-100">
                <span className="text-[11px] font-semibold uppercase text-zinc-300 print:text-zinc-600">
                  Saldo Buku Kas Saat Ini
                </span>
                <p className="text-base font-black font-mono mt-1 text-white print:text-black">
                  {formatRupiah(totalSaldo)}
                </p>
              </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="border border-zinc-300 rounded-lg overflow-hidden my-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 border-b border-zinc-300 text-zinc-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3 w-28">Tanggal</th>
                    <th className="py-2 px-3">Keterangan / Uraian</th>
                    <th className="py-2 px-3 w-24">Buku Kas</th>
                    <th className="py-2 px-3 w-28 text-right">Debit (Masuk)</th>
                    <th className="py-2 px-3 w-28 text-right">Kredit (Keluar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredTransaksi.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-zinc-500">
                        Tidak ada catatan transaksi pada kategori buku kas ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTransaksi.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="py-2 px-3 text-center text-zinc-500">{idx + 1}</td>
                        <td className="py-2 px-3 text-zinc-600 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                        </td>
                        <td className="py-2 px-3 font-medium text-zinc-800">
                          {item.deskripsi}
                          {item.donasi_id && (
                            <span className="block text-[10px] text-zinc-500 italic">Ref Donasi #{item.donasi_id}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-zinc-600">{item.jenis_kas || "Umum"}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">
                          {item.tipe_transaksi === "Debit" ? formatRupiah(item.nominal) : "-"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-red-700">
                          {item.tipe_transaksi === "Kredit" ? formatRupiah(item.nominal) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-zinc-100 font-bold border-t-2 border-zinc-300">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right uppercase">Total:</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-800">{formatRupiah(totalMasuk)}</td>
                    <td className="py-2 px-3 text-right font-mono text-red-800">{formatRupiah(totalKeluar)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SIGNATURE / PENGESAHAN */}
            <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs text-zinc-800">
              <div>
                <p className="font-medium">Mengetahui,</p>
                <p className="font-semibold text-zinc-900 mt-0.5">Ketua Yayasan YAMUTI</p>
                <div className="h-16"></div>
                <p className="font-bold underline">( H. Muhsinin Rahman, Lc. )</p>
              </div>
              <div>
                <p className="font-medium">Tasikmalaya, {today}</p>
                <p className="font-semibold text-zinc-900 mt-0.5">Bendahara Yayasan</p>
                <div className="h-16"></div>
                <p className="font-bold underline">( Siti Aminah, S.E. )</p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-6 pt-3 border-t border-zinc-200 text-center text-[10px] text-zinc-400 italic">
              Dokumen ini dicetak otomatis dari Sistem Informasi Manajemen YAMUTI. Laporan resmi dan sah tanpa tanda tangan basah jika berhologram elektronik.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
