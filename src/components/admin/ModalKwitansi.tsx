"use client";

import { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type KwitansiData = {
  id: string | number;
  order_id?: string;
  nama_donatur: string;
  nominal: number;
  program_nama?: string;
  payment_type?: string;
  created_at: string;
  status: string;
};

// Fungsi konversi angka ke kalimat terbilang rupiah
function terbilang(n: number): string {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  n = Math.floor(n);
  if (n < 12) return bilangan[n];
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  if (n < 200) return "Seratus " + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  if (n < 2000) return "Seribu " + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
  return "";
}

export function ModalKwitansi({
  data,
  isOpen,
  onClose,
}: {
  data: KwitansiData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const terbilangText = terbilang(data.nominal).trim() + " Rupiah";
  const tanggalFormat = new Date(data.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-zinc-100 dark:bg-zinc-950 print:bg-white print:max-w-none print:m-0 print:p-0">
        {/* Tombol aksi cetak (disembunyikan saat mode cetak) */}
        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Pratinjau Kwitansi Resmi Yayasan
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lembar Dokumen Kwitansi */}
        <div className="p-6 overflow-y-auto max-h-[85vh] print:max-h-none print:p-8">
          <div
            ref={printAreaRef}
            className="bg-white text-zinc-900 p-8 rounded-lg shadow-sm border border-zinc-300 print:border-2 print:border-black print:shadow-none print:rounded-none relative"
          >
            {/* Kop Surat Yayasan */}
            <div className="flex items-center justify-between border-b-2 border-red-700 pb-4 mb-6">
              <div className="space-y-0.5">
                <h1 className="text-xl font-extrabold tracking-wider text-red-700 uppercase">
                  YAYASAN MUTIARA HARAPAN TASIKMALAYA (YAMUTI)
                </h1>
                <p className="text-xs text-zinc-600 font-medium">
                  Akte Notaris No. 12 Tahun 2020 • SK Kemenkumham: AHU-0012345.AH.01.04.Tahun 2020
                </p>
                <p className="text-xs text-zinc-600">
                  Jl. Letkol Basyir Surya No. 45, Tasikmalaya, Jawa Barat • Telp/WA: 0877-0031-2182
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 font-bold text-xs uppercase tracking-widest rounded border border-red-300">
                  KWITANSI RESMI
                </span>
                <p className="text-xs font-mono text-zinc-500 mt-1">
                  NO: KW/{new Date(data.created_at).getFullYear()}/{String(data.id).padStart(5, "0")}
                </p>
              </div>
            </div>

            {/* Konten Kwitansi */}
            <div className="space-y-4 text-sm font-serif">
              <div className="grid grid-cols-12 gap-2 items-baseline">
                <div className="col-span-3 font-semibold text-zinc-700">Telah Terima Dari</div>
                <div className="col-span-1 text-center font-bold">:</div>
                <div className="col-span-8 font-bold text-base text-zinc-900 border-b border-dotted border-zinc-400 pb-1">
                  {data.nama_donatur || "Hamba Allah"}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-baseline">
                <div className="col-span-3 font-semibold text-zinc-700">Uang Sejumlah</div>
                <div className="col-span-1 text-center font-bold">:</div>
                <div className="col-span-8 italic font-semibold text-zinc-800 bg-zinc-50 border border-zinc-200 p-2 rounded">
                  &ldquo;{terbilangText}&rdquo;
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-baseline">
                <div className="col-span-3 font-semibold text-zinc-700">Untuk Pembayaran</div>
                <div className="col-span-1 text-center font-bold">:</div>
                <div className="col-span-8 text-zinc-800 border-b border-dotted border-zinc-400 pb-1">
                  Donasi {data.program_nama || "Umum / Santunan Anak Yatim & Dhuafa"}
                  {data.order_id && (
                    <span className="text-xs text-zinc-500 block font-sans">
                      (Ref Transaksi: {data.order_id} • Metode: {data.payment_type?.toUpperCase() || "TRANSFER"})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Kotak Nominal dan Tanda Tangan */}
            <div className="mt-8 pt-4 flex items-end justify-between">
              <div>
                <div className="inline-block px-5 py-3 border-2 border-red-700 bg-red-50/60 rounded-md">
                  <span className="text-xs font-sans font-bold text-zinc-500 block uppercase">
                    Jumlah Nominal
                  </span>
                  <span className="text-2xl font-sans font-extrabold text-red-700">
                    Rp {data.nominal.toLocaleString("id-ID")},-
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 italic">
                  *Kwitansi ini sah dan diterbitkan secara komputerisasi oleh sistem YAMUTI.
                </p>
              </div>

              <div className="text-center font-sans">
                <p className="text-xs text-zinc-600 mb-14">
                  Tasikmalaya, {tanggalFormat}
                  <span className="block text-zinc-500">Bagian Administrasi & Keuangan</span>
                </p>
                <div className="inline-block border-b border-zinc-800 font-bold text-sm px-4">
                  ( Bendahara Yayasan YAMUTI )
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
