"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, DollarSign, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface KampanyeUpdate {
  id: string;
  judul: string;
  konten: string;
  dana_disalurkan: number | string;
  tanggal_penyaluran: string | null;
  foto_urls?: string[];
  created_at: string;
}

interface ProgramUpdatesTabProps {
  updates: KampanyeUpdate[];
}

export function ProgramUpdatesTab({ updates = [] }: ProgramUpdatesTabProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!updates || updates.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
        <p className="text-base font-medium">Belum ada kabar penyaluran untuk program ini.</p>
        <p className="text-sm mt-1">Pihak yayasan akan memperbarui informasi dan dokumentasi setelah dana disalurkan.</p>
      </div>
    );
  }

  const formatRupiah = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="relative pl-6 border-l-2 border-red-500/30 space-y-8">
        {updates.map((item, index) => {
          const tgl = item.tanggal_penyaluran || item.created_at;
          const formattedDate = tgl
            ? format(new Date(tgl), "dd MMMM yyyy", { locale: id })
            : "-";
          const dana = Number(item.dana_disalurkan);

          return (
            <div key={item.id || index} className="relative group">
              {/* Bullet circle */}
              <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-red-500 bg-white dark:bg-zinc-950 group-hover:scale-125 transition-transform" />

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-5 md:p-6 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>{formattedDate}</span>
                  </div>
                  {dana > 0 && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 font-semibold">
                      <DollarSign className="w-3 h-3" />
                      Disalurkan: {formatRupiah(dana)}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {item.judul}
                </h3>

                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {item.konten}
                </p>

                {item.foto_urls && item.foto_urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 mb-3">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Dokumentasi Penyaluran ({item.foto_urls.length})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {item.foto_urls.map((foto, fIdx) => (
                        <div
                          key={fIdx}
                          onClick={() => setSelectedPhoto(foto)}
                          className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group/img border border-zinc-200 dark:border-zinc-800"
                        >
                          <img
                            src={foto}
                            alt={`Dokumentasi ${fIdx + 1}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Modal Foto preview */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Preview Dokumentasi"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white text-zinc-900 font-bold flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

