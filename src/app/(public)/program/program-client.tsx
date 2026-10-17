"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ui/share-button";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "lucide-react";

interface ProgramItem {
  id: string;
  slug?: string;
  judul: string;
  deskripsi?: string;
  thumbnail?: string;
  status?: string;
  target_donasi?: number | string;
  donasi_sum_gross_amount?: number | string;
}

interface ProgramClientProps {
  initialCampaigns: ProgramItem[];
}

const ITEMS_PER_PAGE = 6;

export function ProgramClient({ initialCampaigns }: ProgramClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return initialCampaigns;
    const q = searchQuery.toLowerCase();
    return initialCampaigns.filter(
      (p) =>
        p.judul?.toLowerCase().includes(q) ||
        p.deskripsi?.toLowerCase().includes(q)
    );
  }, [initialCampaigns, searchQuery]);

  // Reset page when search query changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCampaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCampaigns, currentPage]);

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
              placeholder="Cari program kebaikan, wakaf, zakat..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Menampilkan <strong>{filteredCampaigns.length}</strong> Program Kebaikan</span>
          </div>
        </div>
      </div>

      {/* Campaign Grid */}
      {paginatedCampaigns.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Program Tidak Ditemukan</p>
          <p className="mt-2 text-sm">Tidak ada program kampanye yang cocok dengan kata kunci &quot;{searchQuery}&quot;.</p>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Lihat Semua Program
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedCampaigns.map((program) => {
            const target = Number(program.target_donasi) || 0;
            const terkumpul = Number(program.donasi_sum_gross_amount) || 0;
            const persentase = target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0;
            const isMendesak = program.status === "Mendesak";
            const isTercapai = persentase >= 100 || program.status === "Selesai" || program.status === "Tercapai";

            return (
              <Card 
                key={program.id} 
                className="group overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500 bg-white dark:bg-zinc-900 flex flex-col p-0 pt-0 gap-0"
              >
                {/* Foto Thumbnail */}
                <Link href={`/program/${program.slug || program.id}`} className="relative h-60 w-full overflow-hidden block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={program.thumbnail || "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"} 
                    alt={program.judul} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 right-4">
                    <Badge 
                      className={cn(
                        "px-3 py-1 font-semibold text-xs shadow-md backdrop-blur-md", 
                        isMendesak 
                          ? "bg-red-600/90 text-white animate-pulse" 
                          : isTercapai
                          ? "bg-emerald-600/90 text-white"
                          : "bg-black/60 text-white border border-white/20"
                      )}
                    >
                      {isTercapai ? "Tercapai" : (program.status || "Aktif")}
                    </Badge>
                  </div>
                </Link>

                {/* Isi Konten Kartu */}
                <CardContent className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <Link href={`/program/${program.slug || program.id}`}>
                      <h3 
                        className="font-bold text-lg md:text-xl truncate text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors"
                        title={program.judul}
                      >
                        {program.judul}
                      </h3>
                    </Link>
                    {program.deskripsi && (
                      <p className="mt-1.5 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {program.deskripsi}
                      </p>
                    )}
                    
                    {/* Bar Progress Donasi */}
                    <div className="space-y-2 mt-4 mb-2">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">Terkumpul</span>
                        <span className="font-bold text-red-600">{persentase}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                          Rp {terkumpul.toLocaleString('id-ID')}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Target Rp {target.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-2">
                        <div 
                          className="h-full bg-red-600 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(persentase, 2)}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex gap-2 mt-8">
                    {isTercapai ? (
                      <div className={cn(buttonVariants({ size: "lg", variant: "outline" }), "flex-1 h-[52px] rounded-xl font-bold text-base text-zinc-400 border-zinc-200 dark:border-zinc-800 pointer-events-none")}>
                        Target Terpenuhi
                      </div>
                    ) : (
                      <Link 
                        href={`/donasi?program=${program.slug || program.id}`} 
                        className={cn(buttonVariants({ size: "lg" }), "flex-1 h-[52px] rounded-xl font-bold text-base bg-zinc-900 text-white hover:bg-red-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-red-600 dark:hover:text-white transition-colors")}
                      >
                        Donasi
                      </Link>
                    )}
                    <ShareButton 
                      url={`/program/${program.slug || program.id}`} 
                      title={program.judul} 
                      text={`Mari bantu wujudkan harapan bersama YAMUTI Tasikmalaya untuk program: ${program.judul}`}
                      className="rounded-xl h-[52px] w-[52px]"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
    </div>
  );
}
