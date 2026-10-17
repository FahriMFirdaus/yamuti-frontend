"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, X, ChevronLeft, ChevronRight, Calendar, Sparkles, Image as ImageIcon, RefreshCw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  file_url: string;
  created_at?: string;
  pengunggah?: {
    name: string;
  };
}

interface GaleriClientProps {
  initialGaleri: GaleriItem[];
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

const ITEMS_PER_PAGE = 9;

export function GaleriClient({ initialGaleri }: GaleriClientProps) {
  const [galeriList, setGaleriList] = useState<GaleriItem[]>(initialGaleri);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<GaleriItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live client-side fetch agar langsung sinkron dengan foto yang baru diunggah/dihapus dari Admin CMS
  const syncGallery = async () => {
    try {
      setIsSyncing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/galeri?per_page=100`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const freshData = json.data?.data || json.data || [];
        if (Array.isArray(freshData) && freshData.length > 0) {
          setGaleriList(freshData);
        }
      }
    } catch (err) {
      console.error("Sinkronisasi galeri gagal:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncGallery();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const filteredGaleri = useMemo(() => {
    if (!searchQuery.trim()) return galeriList;
    const q = searchQuery.toLowerCase();
    return galeriList.filter(
      (item) =>
        item.judul?.toLowerCase().includes(q) ||
        item.deskripsi?.toLowerCase().includes(q)
    );
  }, [galeriList, searchQuery]);

  const totalPages = Math.ceil(filteredGaleri.length / ITEMS_PER_PAGE);

  const paginatedGaleri = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGaleri.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredGaleri, currentPage]);

  const currentIndex = selectedPhoto
    ? filteredGaleri.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const showNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredGaleri.length - 1) {
      setSelectedPhoto(filteredGaleri[currentIndex + 1]);
    } else {
      setSelectedPhoto(filteredGaleri[0]);
    }
  };

  const showPrev = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredGaleri[currentIndex - 1]);
    } else {
      setSelectedPhoto(filteredGaleri[filteredGaleri.length - 1]);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl -mt-8 relative z-20">
      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 md:p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md mb-12">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari momen, kegiatan, santunan..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              <span className={cn("w-2.5 h-2.5 rounded-full bg-emerald-500", isSyncing ? "animate-ping" : "animate-pulse")} />
              <span>Menampilkan <strong>{filteredGaleri.length}</strong> Dokumentasi Momen</span>
            </div>
            <button
              onClick={syncGallery}
              disabled={isSyncing}
              title="Sinkronkan dengan admin"
              className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin text-red-600")} />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredGaleri.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <ImageIcon className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Dokumentasi tidak ditemukan</h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
            Tidak ada foto yang cocok dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-6 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
          >
            Lihat Semua Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {paginatedGaleri.map((foto, idx) => (
            <div
              key={foto.id}
              onClick={() => setSelectedPhoto(foto)}
              className="group relative cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              {/* Photo Area */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.file_url}
                  alt={foto.judul}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Ambient Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Zoom Icon Button */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="w-10 h-10 rounded-2xl bg-white/90 text-zinc-900 flex items-center justify-center shadow-lg backdrop-blur-md">
                    <Eye className="w-5 h-5 text-red-600" />
                  </span>
                </div>

                {/* Corner Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-black/60 text-white font-medium text-xs border border-white/20 backdrop-blur-md px-3 py-1 shadow-sm">
                    Momen #{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                  </Badge>
                </div>
              </div>

              {/* Title & Description Below Image */}
              <div className="p-5 md:p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3
                    className="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors line-clamp-1 leading-snug"
                    title={foto.judul}
                  >
                    {foto.judul}
                  </h3>
                  {foto.deskripsi && (
                    <p className="mt-1.5 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {foto.deskripsi}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  {foto.created_at ? (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-600" />
                      {formatDate(foto.created_at)}
                    </span>
                  ) : (
                    <span>YAMUTI Dokumentasi</span>
                  )}
                  <span className="text-red-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Buka Foto &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl w-full bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/50">
              <div>
                <h3 className="text-white font-bold text-lg md:text-xl line-clamp-1">
                  {selectedPhoto.judul}
                </h3>
                {selectedPhoto.created_at && (
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    {formatDate(selectedPhoto.created_at)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative flex-grow flex items-center justify-center p-2 sm:p-4 bg-black/60 overflow-hidden min-h-[300px] max-h-[60vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.judul}
                className="max-h-[58vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {/* Prev / Next Arrows */}
              {filteredGaleri.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white hover:bg-red-600 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white hover:bg-red-600 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110"
                    aria-label="Foto Selanjutnya"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer Description */}
            {selectedPhoto.deskripsi && (
              <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-900/60 text-zinc-300 text-sm md:text-base leading-relaxed">
                <p>{selectedPhoto.deskripsi}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
