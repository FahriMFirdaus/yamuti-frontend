"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "@/components/ui/share-button";
import { Search, Calendar, User, ArrowRight, BookOpen, Sparkles, Filter } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface ArtikelItem {
  id: string;
  slug: string;
  judul: string;
  konten: string;
  thumbnail_url: string | null;
  thumbnail?: string | null;
  file_url?: string | null;
  kategori?: string;
  created_at: string;
  penulis?: {
    name: string;
  };
  kategori_artikel?: {
    nama_kategori?: string;
    nama?: string;
    slug?: string;
  };
}

interface KategoriItem {
  id: string;
  nama_kategori: string;
  slug: string;
}

interface ArtikelClientProps {
  initialArticles: ArtikelItem[];
  categories: KategoriItem[];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

const REGULAR_ITEMS_PER_PAGE = 6;

export function ArtikelClient({ initialArticles, categories }: ArtikelClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((artikel) => {
      const catName =
        artikel.kategori_artikel?.nama_kategori ||
        artikel.kategori_artikel?.nama ||
        artikel.kategori ||
        "";
      const matchesCategory =
        selectedCategory === "all" ||
        catName.toLowerCase() === selectedCategory.toLowerCase() ||
        artikel.kategori_artikel?.slug === selectedCategory;

      const titleMatch = (artikel.judul || "").toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = stripHtml(artikel.konten || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && (titleMatch || contentMatch);
    });
  }, [initialArticles, selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles.length > 0 && selectedCategory === "all" && !searchQuery ? filteredArticles[0] : null;
  const regularArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

  const totalPages = Math.ceil(regularArticles.length / REGULAR_ITEMS_PER_PAGE);

  const paginatedRegularArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * REGULAR_ITEMS_PER_PAGE;
    return regularArticles.slice(startIndex, startIndex + REGULAR_ITEMS_PER_PAGE);
  }, [regularArticles, currentPage]);

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl -mt-8 relative z-20">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 md:p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Input Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari berita, kegiatan, inspirasi..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all",
                selectedCategory === "all"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              Semua Berita
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === (cat.slug || cat.nama_kategori).toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug || cat.nama_kategori)}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all",
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  {cat.nama_kategori}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zero State */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Tidak ada artikel yang ditemukan</h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang lain atau pilih kategori artikel berbeda.
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-6 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* FEATURED ARTICLE HERO CARD */}
          {featuredArticle && (
            <div className="group relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Image Section */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[460px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      featuredArticle.thumbnail_url ||
                      featuredArticle.thumbnail ||
                      featuredArticle.file_url ||
                      "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt={featuredArticle.judul}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white font-bold text-xs px-3.5 py-1.5 shadow-lg border-none flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Sorotan Utama
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mb-3 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-red-600" />
                        {formatDate(featuredArticle.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-zinc-400" />
                        {featuredArticle.penulis?.name || "Admin YAMUTI"}
                      </span>
                    </div>

                    <Badge variant="outline" className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 mb-3">
                      {featuredArticle.kategori_artikel?.nama_kategori ||
                        featuredArticle.kategori_artikel?.nama ||
                        featuredArticle.kategori ||
                        "Kegiatan"}
                    </Badge>

                    <Link href={`/artikel/${featuredArticle.slug}`}>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors leading-tight line-clamp-3">
                        {featuredArticle.judul}
                      </h2>
                    </Link>

                    <p className="mt-4 text-sm md:text-base text-zinc-600 dark:text-zinc-400 line-clamp-4 leading-relaxed">
                      {stripHtml(featuredArticle.konten || "")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <Link
                      href={`/artikel/${featuredArticle.slug}`}
                      className="inline-flex items-center justify-center flex-1 h-[50px] px-6 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-sm hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors gap-2"
                    >
                      Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                    </Link>
                    <ShareButton
                      url={`/artikel/${featuredArticle.slug}`}
                      title={featuredArticle.judul}
                      text={`Baca artikel YAMUTI: ${featuredArticle.judul}`}
                      className="rounded-2xl h-[50px] w-[50px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRID ARTICLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedRegularArticles.map((artikel) => {
              const plainText = stripHtml(artikel.konten || "");
              const kategoriName =
                artikel.kategori_artikel?.nama_kategori ||
                artikel.kategori_artikel?.nama ||
                artikel.kategori ||
                "Berita";

              return (
                <div
                  key={artikel.id}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  {/* Thumbnail Image */}
                  <Link href={`/artikel/${artikel.slug}`} className="relative h-56 w-full overflow-hidden block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        artikel.thumbnail_url ||
                        artikel.thumbnail ||
                        artikel.file_url ||
                        "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={artikel.judul}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/60 text-white font-semibold text-xs border border-white/20 backdrop-blur-md px-3 py-1 shadow-md">
                        {kategoriName}
                      </Badge>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 md:p-7 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-2.5">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        <span>{formatDate(artikel.created_at)}</span>
                        <span>•</span>
                        <span>{artikel.penulis?.name || "Admin"}</span>
                      </div>

                      <Link href={`/artikel/${artikel.slug}`}>
                        <h3
                          className="font-bold text-lg md:text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug"
                          title={artikel.judul}
                        >
                          {artikel.judul}
                        </h3>
                      </Link>

                      <p className="mt-2 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {plainText}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-2 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
                      <Link
                        href={`/artikel/${artikel.slug}`}
                        className="flex-1 inline-flex items-center justify-center h-[46px] rounded-xl font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                      >
                        Baca Artikel
                      </Link>
                      <ShareButton
                        url={`/artikel/${artikel.slug}`}
                        title={artikel.judul}
                        text={`Baca artikel YAMUTI: ${artikel.judul}`}
                        className="rounded-xl h-[46px] w-[46px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
      )}
    </div>
  );
}
