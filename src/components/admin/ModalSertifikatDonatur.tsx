"use client";

import React, { useRef } from "react";
import { Award, Printer, Share2, X, Download, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ModalSertifikatDonaturProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    nama_donatur: string;
    nominal: number;
    program_nama?: string;
    tanggal: string;
    no_sertifikat?: string;
  } | null;
}

export function ModalSertifikatDonatur({
  isOpen,
  onClose,
  data
}: ModalSertifikatDonaturProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Alhamdulillah, terima kasih kepada YAMUTI atas kesempatan berbagi kebaikan dalam program ${data.program_nama || "Santunan Yatim & Dhuafa"}. Mari bersama dukung anak-anak asuh di yamuti.org!`;
    if (navigator.share) {
      navigator.share({
        title: "Piagam Apresiasi Donatur YAMUTI",
        text: text,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const tanggalFormat = new Date(data.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const noSertifikat = data.no_sertifikat || `CERT/YMT/${new Date(data.tanggal).getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-zinc-950 text-white print:bg-white print:text-black print:max-w-none print:m-0 print:p-0">
        
        {/* Header Aksi - Disembunyikan saat cetak */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm text-zinc-200">
              Piagam Penghargaan & Apresiasi Muhsinin (E-Sertifikat)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 gap-1.5"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              Bagikan
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-md shadow-amber-600/30"
            >
              <Printer className="w-4 h-4" />
              Cetak / Unduh PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lembar Piagam Sertifikat */}
        <div className="p-6 md:p-10 overflow-y-auto max-h-[85vh] print:max-h-none print:p-0">
          <div
            ref={printRef}
            className="relative bg-gradient-to-b from-amber-50/90 via-white to-amber-50/60 text-zinc-900 p-10 md:p-14 rounded-2xl border-8 border-double border-amber-600/60 shadow-2xl print:border-4 print:border-amber-700 print:shadow-none print:rounded-none"
          >
            {/* Ornamen Sudut */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

            {/* Logo & Kop Sertifikat */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white shadow-lg mb-2">
                <HeartHandshake className="w-9 h-9" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700">
                YAYASAN AMANAH MUHSININ PEDULI UMAT (YAMUTI)
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono">
                SK Kemenkumham: AHU-0014285.AH.01.04.Tahun 2020 • No: {noSertifikat}
              </p>
              
              <div className="pt-4">
                <h1 className="text-3xl md:text-4xl font-serif font-black tracking-wide text-zinc-900 uppercase">
                  PIAGAM PENGHARGAAN
                </h1>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mt-1">
                  Certificate of Appreciation & Charity
                </p>
              </div>
            </div>

            {/* Badan Sertifikat */}
            <div className="text-center my-8 space-y-4">
              <p className="text-sm text-zinc-600 italic">
                Dengan penuh rasa syukur dan hormat, piagam ini dianugerahkan kepada:
              </p>

              <div className="py-2 border-b-2 border-dotted border-amber-600/40 inline-block min-w-[320px] max-w-xl">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-amber-800 tracking-wide">
                  {data.nama_donatur || "Hamba Allah"}
                </h2>
              </div>

              <p className="text-xs md:text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-2">
                Atas keikhlasan, kedermawanan, dan kontribusi nyata dalam mendukung keberlangsungan hidup, pendidikan, serta masa depan anak-anak asuh yatim dan dhuafa melalui program:
              </p>

              <div className="p-3 bg-amber-100/60 dark:bg-amber-950/20 rounded-xl border border-amber-300/60 max-w-md mx-auto">
                <p className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  {data.program_nama || "Sedekah Santunan & Kesejahteraan Anak Asuh"}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-mono mt-0.5">
                  Nominal: {formatRupiah(data.nominal)}
                </p>
              </div>

              <p className="text-xs text-zinc-500 italic max-w-xl mx-auto">
                &ldquo;Perumpamaan orang yang menafkahkan hartanya di jalan Allah adalah serupa dengan sebutir benih yang menumbuhkan tujuh bulir, pada tiap-tiap bulir seratus biji.&rdquo; (QS. Al-Baqarah: 261)
              </p>
            </div>

            {/* Tanda Tangan & Verifikasi QR */}
            <div className="mt-10 pt-6 border-t border-amber-200/80 grid grid-cols-3 items-center text-center">
              <div>
                <p className="text-[11px] text-zinc-500">Tasikmalaya, {tanggalFormat}</p>
                <p className="text-xs font-bold text-zinc-900 mt-0.5">Ketua Yayasan YAMUTI</p>
                <div className="h-14 flex items-center justify-center">
                  <span className="font-serif italic text-amber-700 text-lg opacity-80">M. Rahman</span>
                </div>
                <p className="text-xs font-bold underline">( H. Muhsinin Rahman, Lc. )</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-xl border-2 border-amber-600/40 bg-white p-1 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <span className="text-[9px] font-mono uppercase text-zinc-500 mt-1 font-semibold">
                  Terverifikasi Sah
                </span>
              </div>

              <div>
                <p className="text-[11px] text-zinc-500">Mengetahui,</p>
                <p className="text-xs font-bold text-zinc-900 mt-0.5">Pembina Asrama Panti</p>
                <div className="h-14 flex items-center justify-center">
                  <span className="font-serif italic text-amber-700 text-lg opacity-80">Ust. Ahmad</span>
                </div>
                <p className="text-xs font-bold underline">( Ust. Ahmad Fauzi, S.Pd.I. )</p>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

