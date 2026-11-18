import { Metadata } from "next";
import { Camera } from "lucide-react";
import { GaleriClient } from "./galeri-client";

export const metadata: Metadata = {
  title: "Galeri Foto Asrama",
  description: "Dokumentasi visual keseharian, kegiatan belajar, mengaji, dan momen kebersamaan anak-anak asuh di Panti Asuhan YAMUTI Tasikmalaya.",
};

async function getGaleri() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
    const res = await fetch(`${apiUrl}/galeri?per_page=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error("Gagal mengambil data galeri:", error);
    return [];
  }
}

export default async function GaleriPage() {
  const galeriList = await getGaleri();

  return (
    <main className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 pb-20">
      <header className="border-b border-stone-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 mb-3">
            <Camera className="w-3.5 h-3.5" />
            Dokumentasi & Potret Santri
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Galeri Kegiatan Asrama
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Potret senyum dan kebersamaan santri yatim dhuafa dalam aktivitas keseharian, ibadah berjamaah, dan kegiatan pendidikan di Tasikmalaya.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <GaleriClient initialGaleri={galeriList} />
      </div>
    </main>
  );
}
