"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with clean ellipsis: e.g. [1, 2, 3] or [1, '...', 4, 5, 6, '...', 10]
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // adjacent pages around current page

    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    let l: number | null = null;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      }
    }

    const result: (number | string)[] = [];
    for (const p of pages) {
      if (typeof p === "number") {
        if (l !== null) {
          if (p - l === 2) {
            result.push(l + 1);
          } else if (p - l !== 1) {
            result.push("...");
          }
        }
        result.push(p);
        l = p;
      }
    }

    return result;
  };

  const pages = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    // Smooth scroll back to top of content
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Navigasi Halaman"
      className={cn("flex items-center justify-center gap-1.5 py-6", className)}
    >
      {/* Tombol Sebelumnya */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "inline-flex items-center gap-1 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none border",
          currentPage <= 1
            ? "border-transparent text-zinc-300 dark:text-zinc-700 pointer-events-none cursor-not-allowed"
            : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 active:scale-95"
        )}
        aria-label="Halaman Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </button>

      {/* Daftar Nomor Halaman */}
      <div className="flex items-center gap-1">
        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-10 flex items-center justify-center text-zinc-400 select-none"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const pageNum = Number(page);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => handlePageClick(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "min-w-10 h-10 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all select-none flex items-center justify-center",
                isActive
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 active:scale-95"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60"
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Tombol Selanjutnya */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "inline-flex items-center gap-1 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none border",
          currentPage >= totalPages
            ? "border-transparent text-zinc-300 dark:text-zinc-700 pointer-events-none cursor-not-allowed"
            : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 active:scale-95"
        )}
        aria-label="Halaman Selanjutnya"
      >
        <span className="hidden sm:inline">Selanjutnya</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
