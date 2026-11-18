import { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ArtikelClient } from "./artikel-client";

export const metadata: Metadata = {
  title: "Kabar & Cerita Asrama",
  description: "Dokumentasi kegiatan santri, laporan penyaluran donasi, dan kisah inspiratif anak asuh YAMUTI Tasikmalaya.",
};

async function getArtikel() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
    const res = await fetch(`${apiUrl}/artikel?per_page=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error("Gagal mengambil data artikel:", error);
    return [];
  }
}

async function getKategori() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
    const res = await fetch(`${apiUrl}/kategori-artikel`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Gagal mengambil kategori artikel:", error);
    return [];
  }
}

export default async function ArtikelPage() {
  const [artikelList, kategoriList] = await Promise.all([
    getArtikel(),
    getKategori(),
  ]);

  return (
    <main className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 pb-20">
      <header className="border-b border-stone-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Transparansi & Kabar Asrama
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Kabar & Kisah YAMUTI
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Menelusuri perkembangan santri, dokumentasi kegiatan belajar mengaji, serta laporan pertanggungjawaban amanah para muhsinin.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <ArtikelClient initialArticles={artikelList} categories={kategoriList} />
      </div>
    </main>
  );
}
