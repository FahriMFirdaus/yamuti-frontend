"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ShareButton } from "@/components/ui/share-button";
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react";
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
    <div className="space-y-8">
      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari kabar, laporan donasi, kegiatan..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50/60 dark:bg-zinc-800/60 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                selectedCategory === "all"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700"
              )}
            >
              Semua Kabar
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === (cat.slug || cat.nama_kategori).toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug || cat.nama_kategori)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700"
                  )}
                >
                  {cat.nama_kategori}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
          <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Kabar Tidak Ditemukan</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tidak ada kabar atau artikel yang sesuai dengan kata pencarian atau kategori yang dipilih.
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Atur Ulang Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="group rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <Link
                  href={`/artikel/${featuredArticle.slug}`}
                  className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full overflow-hidden block bg-stone-100 dark:bg-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredArticle.thumbnail_url || featuredArticle.thumbnail || featuredArticle.file_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop"}
                    alt={featuredArticle.judul}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-700 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
                      Kabar Utama
                    </span>
                  </div>
                </Link>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        {formatDate(featuredArticle.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {featuredArticle.penulis?.name || "Pengurus YAMUTI"}
                      </span>
                    </div>

                    <Link href={`/artikel/${featuredArticle.slug}`}>
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-3">
                        {featuredArticle.judul}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {stripHtml(featuredArticle.konten)}
                    </p>
                  </div>

                  <div className="pt-6 flex gap-2">
                    <Link
                      href={`/artikel/${featuredArticle.slug}`}
                      className="flex-1 h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <ShareButton
                      title={featuredArticle.judul}
                      text={`Kabar YAMUTI: ${featuredArticle.judul}`}
                      url={typeof window !== "undefined" ? `${window.location.origin}/artikel/${featuredArticle.slug}` : ""}
                      className="h-10 w-10 shrink-0 rounded-xl border border-stone-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Article Grid */}
          {regularArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRegularArticles.map((artikel) => {
                const categoryBadge =
                  artikel.kategori_artikel?.nama_kategori ||
                  artikel.kategori_artikel?.nama ||
                  artikel.kategori ||
                  "Berita";

                return (
                  <div
                    key={artikel.id}
                    className="group rounded-3xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <Link href={`/artikel/${artikel.slug}`} className="relative h-48 w-full overflow-hidden block bg-stone-100 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artikel.thumbnail_url || artikel.thumbnail || artikel.file_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop"}
                          alt={artikel.judul}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-zinc-900/80 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white/20">
                            {categoryBadge}
                          </span>
                        </div>
                      </Link>

                      <div className="p-5 sm:p-6 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            {formatDate(artikel.created_at)}
                          </span>
                        </div>

                        <Link href={`/artikel/${artikel.slug}`}>
                          <h3
                            className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug"
                            title={artikel.judul}
                          >
                            {artikel.judul}
                          </h3>
                        </Link>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {stripHtml(artikel.konten)}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 pt-0 flex gap-2">
                      <Link
                        href={`/artikel/${artikel.slug}`}
                        className="flex-1 h-9 px-3 rounded-xl bg-stone-100 dark:bg-zinc-800/80 hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-700 dark:hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Baca Artikel</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <ShareButton
                        title={artikel.judul}
                        text={`Kabar YAMUTI: ${artikel.judul}`}
                        url={typeof window !== "undefined" ? `${window.location.origin}/artikel/${artikel.slug}` : ""}
                        className="h-9 w-9 shrink-0 rounded-xl border border-stone-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
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
      )}
    </div>
  );
}
