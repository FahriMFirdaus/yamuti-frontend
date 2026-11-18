"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Eye, X, ChevronLeft, ChevronRight, Calendar, Image as ImageIcon, RefreshCw } from "lucide-react";
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

  const syncGallery = async () => {
    try {
      setIsSyncing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
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
    } catch {
      // diamkan error sinkronisasi latar
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
    <div className="space-y-8">
      {/* Search & Sync Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari dokumentasi kegiatan, doa bersama..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50/60 dark:bg-zinc-800/60 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <span className={cn("w-2 h-2 rounded-full bg-emerald-600", isSyncing && "animate-ping")} />
              <span>Tersedia <strong>{filteredGaleri.length}</strong> foto kegiatan</span>
            </div>
            <button
              onClick={syncGallery}
              disabled={isSyncing}
              title="Perbarui data galeri"
              className="p-2 rounded-xl text-zinc-400 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-emerald-700")} />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredGaleri.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
          <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Foto Tidak Ditemukan</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tidak ada dokumentasi kegiatan yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tampilkan Semua Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedGaleri.map((foto) => (
            <div
              key={foto.id}
              onClick={() => setSelectedPhoto(foto)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.file_url}
                  alt={foto.judul}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-white font-medium">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Lihat Foto Penuh
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {foto.judul}
                </h3>
                {foto.deskripsi && (
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {foto.deskripsi}
                  </p>
                )}
                {foto.created_at && (
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-zinc-400">
                    <Calendar className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>{formatDate(foto.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <span className="text-xs text-zinc-400 font-mono">
                {currentIndex + 1} dari {filteredGaleri.length}
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.judul}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />

              {filteredGaleri.length > 1 && (
                <>
                  <button
                    onClick={showPrev}
                    className="absolute left-3 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={showNext}
                    className="absolute right-3 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 space-y-1">
              <h4 className="font-bold text-sm sm:text-base text-white">
                {selectedPhoto.judul}
              </h4>
              {selectedPhoto.deskripsi && (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {selectedPhoto.deskripsi}
                </p>
              )}
              {selectedPhoto.created_at && (
                <p className="text-[10px] text-zinc-500 font-mono pt-1">
                  Didokumentasikan: {formatDate(selectedPhoto.created_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
