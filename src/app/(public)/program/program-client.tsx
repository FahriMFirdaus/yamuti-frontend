"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ui/share-button";
import { Pagination } from "@/components/ui/pagination";
import { Search, ArrowRight } from "lucide-react";

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
    <div className="space-y-8">
      {/* Search & Counter Filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari program kebaikan, wakaf, zakat..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50/60 dark:bg-zinc-800/60 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Tersedia <strong>{filteredCampaigns.length}</strong> program aktif</span>
          </div>
        </div>
      </div>

      {/* Program Grid */}
      {paginatedCampaigns.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">Program Tidak Ditemukan</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tidak ada program kampanye yang cocok dengan kata pencarian &ldquo;{searchQuery}&rdquo;.
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tampilkan Semua Program
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCampaigns.map((program) => {
            const target = Number(program.target_donasi) || 0;
            const terkumpul = Number(program.donasi_sum_gross_amount) || 0;
            const persentase = target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0;
            const isMendesak = program.status === "Mendesak";
            const isTercapai = persentase >= 100 || program.status === "Selesai" || program.status === "Tercapai";

            return (
              <div 
                key={program.id} 
                className="group rounded-3xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <Link href={`/program/${program.slug || program.id}`} className="relative h-48 w-full overflow-hidden block bg-stone-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={program.thumbnail || "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"} 
                      alt={program.judul} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        className={cn(
                          "px-2.5 py-0.5 font-bold text-[10px] tracking-wide shadow-sm border", 
                          isMendesak 
                            ? "bg-rose-700 text-white border-rose-800" 
                            : isTercapai
                            ? "bg-emerald-700 text-white border-emerald-800"
                            : "bg-zinc-900/80 text-white border-white/20"
                        )}
                      >
                        {isTercapai ? "Tercapai" : (program.status || "Aktif")}
                      </Badge>
                    </div>
                  </Link>

                  <div className="p-5 sm:p-6 space-y-3">
                    <Link href={`/program/${program.slug || program.id}`}>
                      <h3 
                        className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2"
                        title={program.judul}
                      >
                        {program.judul}
                      </h3>
                    </Link>

                    {program.deskripsi && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {program.deskripsi}
                      </p>
                    )}
                    
                    <div className="pt-2 space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">Terkumpul</span>
                        <span className="font-bold font-mono text-emerald-800 dark:text-emerald-400">{persentase}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold font-mono">
                          Rp {terkumpul.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                          Target Rp {target.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-700 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(persentase, 2)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex gap-2">
                  {isTercapai ? (
                    <div className="flex-1 h-10 rounded-xl font-semibold text-xs flex items-center justify-center text-zinc-400 bg-stone-100 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-800">
                      Target Terpenuhi
                    </div>
                  ) : (
                    <Link 
                      href={`/donasi?program=${program.slug || program.id}`} 
                      className="flex-1 h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Salurkan Donasi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <ShareButton 
                    title={program.judul} 
                    text={`Dukung program kebaikan YAMUTI: ${program.judul}`}
                    url={typeof window !== 'undefined' ? `${window.location.origin}/program/${program.slug || program.id}` : ''}
                    className="h-10 w-10 shrink-0 rounded-xl border border-stone-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
                  />
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
