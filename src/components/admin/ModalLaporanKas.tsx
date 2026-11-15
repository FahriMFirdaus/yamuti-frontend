"use client";

import React, { useRef, useState } from "react";
import { Printer, Download, X, Calendar, FileText, ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";
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
  const [modeStandar, setModeStandar] = useState(false); // Toggle ISAK 35

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ["No", "Tanggal", "Keterangan", "Buku Kas", "Debit (Masuk)", "Kredit (Keluar)"];
    const rows = filteredTransaksi.map((item, idx) => [
      idx + 1,
      item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
      `"${item.deskripsi?.replace(/"/g, '""') || ''}"`,
      `"${item.jenis_kas || 'Umum'}"`,
      item.tipe_transaksi === "Debit" ? item.nominal : 0,
      item.tipe_transaksi === "Kredit" ? item.nominal : 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Kas_YAMUTI_${activeTab.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Pengelompokan ISAK 35 (Aset Neto Dengan Pembatasan / Program vs Tanpa Pembatasan / Operasional)
  const danaTerikat = filteredTransaksi.filter(t => 
    t.donasi_id || 
    t.deskripsi?.toLowerCase().includes("kampanye") || 
    t.deskripsi?.toLowerCase().includes("program") || 
    t.jenis_kas?.toLowerCase().includes("program")
  );
  const danaTidakTerikat = filteredTransaksi.filter(t => !danaTerikat.includes(t));

  const masukTerikat = danaTerikat.filter(t => t.tipe_transaksi === "Debit").reduce((a, b) => a + Number(b.nominal || 0), 0);
  const keluarTerikat = danaTerikat.filter(t => t.tipe_transaksi === "Kredit").reduce((a, b) => a + Number(b.nominal || 0), 0);
  const masukTidakTerikat = danaTidakTerikat.filter(t => t.tipe_transaksi === "Debit").reduce((a, b) => a + Number(b.nominal || 0), 0);
  const keluarTidakTerikat = danaTidakTerikat.filter(t => t.tipe_transaksi === "Kredit").reduce((a, b) => a + Number(b.nominal || 0), 0);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        
        {/* Action Header - Hidden on Print */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
              Laporan Keuangan & Mutasi Kas ({activeTab})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setModeStandar(!modeStandar)}
              className={modeStandar ? "bg-amber-50 text-amber-800 border-amber-300 font-bold" : ""}
            >
              <Scale className="w-4 h-4 mr-1.5" />
              {modeStandar ? "Format Standar ISAK 35 (Aktif)" : "Format Standar ISAK 35"}
            </Button>
            <Button onClick={handleExportCsv} variant="outline" size="sm" className="gap-1.5">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button onClick={handlePrint} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm">
              <Printer className="w-4 h-4" />
              Cetak / PDF
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
                  Sekretariat: Jl. Letkol Basyir Surya No. 45, Tasikmalaya, Jawa Barat | Telp/WA: 0877-0031-2182
                </p>
              </div>
            </div>

            {/* TITLE & PERIOD */}
            <div className="text-center my-4">
              <h2 className="text-lg font-bold tracking-tight uppercase underline underline-offset-4">
                {modeStandar ? "LAPORAN AKTIVITAS ENTITAS NIRLABA (ISAK 35 / PSAK 409)" : "LAPORAN REKAPITULASI BUKU KAS"}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Buku Kas: <strong>{activeTab}</strong> • Periode Terkini ({today})
              </p>
            </div>

            {/* SUMMARY BOX */}
            {modeStandar ? (
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="border border-zinc-300 rounded-lg p-3 bg-zinc-50">
                  <span className="text-[11px] font-bold uppercase text-zinc-600 block">
                    1. Aset Neto Tanpa Pembatasan (Operasional)
                  </span>
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Penerimaan Operasional:</span>
                      <span className="font-semibold text-emerald-700">{formatRupiah(masukTidakTerikat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Operasional:</span>
                      <span className="font-semibold text-red-700">{formatRupiah(keluarTidakTerikat)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold">
                      <span>Kenaikan/Penurunan Bersih:</span>
                      <span>{formatRupiah(masukTidakTerikat - keluarTidakTerikat)}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-300 rounded-lg p-3 bg-zinc-50">
                  <span className="text-[11px] font-bold uppercase text-zinc-600 block">
                    2. Aset Neto Dengan Pembatasan (Program/Kampanye)
                  </span>
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Donasi Program Terikat:</span>
                      <span className="font-semibold text-emerald-700">{formatRupiah(masukTerikat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penyaluran Program:</span>
                      <span className="font-semibold text-red-700">{formatRupiah(keluarTerikat)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold">
                      <span>Sisa Dana Terikat:</span>
                      <span>{formatRupiah(masukTerikat - keluarTerikat)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="border border-zinc-300 rounded-lg p-3 bg-zinc-50">
                  <span className="text-[11px] font-semibold uppercase text-zinc-500">
                    Total Penerimaan (Debit)
                  </span>
                  <p className="text-base font-bold font-mono mt-1 text-emerald-700">
                    {formatRupiah(totalMasuk)}
                  </p>
                </div>
                <div className="border border-zinc-300 rounded-lg p-3 bg-zinc-50">
                  <span className="text-[11px] font-semibold uppercase text-zinc-500">
                    Total Pengeluaran (Kredit)
                  </span>
                  <p className="text-base font-bold font-mono mt-1 text-red-700">
                    {formatRupiah(totalKeluar)}
                  </p>
                </div>
                <div className="border border-zinc-900 rounded-lg p-3 bg-zinc-900 text-white print:border-black print:text-black print:bg-zinc-100">
                  <span className="text-[11px] font-semibold uppercase text-zinc-300 print:text-zinc-600">
                    Saldo Kas Bersih
                  </span>
                  <p className="text-base font-black font-mono mt-1 text-white print:text-black">
                    {formatRupiah(totalSaldo)}
                  </p>
                </div>
              </div>
            )}

            {/* TRANSACTIONS TABLE */}
            <div className="border border-zinc-300 rounded-lg overflow-hidden my-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 border-b border-zinc-300 text-zinc-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3 w-28">Tanggal</th>
                    <th className="py-2 px-3">Keterangan / Uraian Transaksi</th>
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
                    <td colSpan={4} className="py-2 px-3 text-right uppercase">Total Rekapitulasi:</td>
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
              Dokumen ini dicetak otomatis dari Sistem Informasi Manajemen YAMUTI. Laporan resmi dan sah sesuai standar pelaporan entitas nirlaba.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
