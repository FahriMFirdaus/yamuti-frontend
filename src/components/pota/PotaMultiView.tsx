"use client";

import { useState } from "react";
import { PotaCard } from "@/components/pota/PotaCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, Rows } from "lucide-react";
import { cn } from "@/lib/utils";

interface PotaMultiViewProps {
  anakAsuhList: any[];
  onOpenReport: (pota: any) => void;
  onOpenPay: (pota: any) => void;
  onOpenBulkPay?: () => void;
}

export function PotaMultiView({
  anakAsuhList,
  onOpenReport,
  onOpenPay,
  onOpenBulkPay,
}: PotaMultiViewProps) {
  const [viewMode, setViewMode] = useState<"strip" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(anakAsuhList.length / itemsPerPage);
  const paginatedList = anakAsuhList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3.5">
      {/* Subheader & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Total {anakAsuhList.length} Ananda Binaan Aktif
          </span>
          {anakAsuhList.length > 1 && onOpenBulkPay && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenBulkPay}
              className="h-7 px-2.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg cursor-pointer"
            >
              Salur Sekaligus Semua Anak
            </Button>
          )}
        </div>

        {/* View Mode Toggle (Strip vs Grid) */}
        {anakAsuhList.length > 2 && (
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("strip")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                viewMode === "strip"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Strip Geser</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Halaman</span>
            </button>
          </div>
        )}
      </div>

      {/* STRIP VIEW: Horizontal Carousel with Snap */}
      {viewMode === "strip" ? (
        <div className="relative w-full max-w-full overflow-hidden">
          <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth overscroll-x-contain [scrollbar-width:thin] px-0.5">
            {anakAsuhList.map((pota, idx) => (
              <div
                key={pota.id || idx}
                className="w-[270px] sm:w-[290px] shrink-0 snap-start"
              >
                <PotaCard
                  pota={pota}
                  onOpenReport={onOpenReport}
                  onOpenPay={onOpenPay}
                  compact
                />
              </div>
            ))}
          </div>
          <div className="text-[11px] text-zinc-400 text-right pr-1 select-none">
            ← Geser ke samping untuk melihat ananda lainnya →
          </div>
        </div>
      ) : (
        /* GRID VIEW: Max 4 Cards per Page */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {paginatedList.map((pota, idx) => (
              <PotaCard
                key={pota.id || idx}
                pota={pota}
                onOpenReport={onOpenReport}
                onOpenPay={onOpenPay}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2 text-xs rounded-md"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-7 px-2 text-xs rounded-md"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
