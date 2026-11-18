import { Metadata } from "next";
import { Heart } from "lucide-react";
import { ProgramClient } from "./program-client";

export const metadata: Metadata = {
  title: "Program Kebaikan",
  description: "Daftar program wakaf, infaq santri, beasiswa yatim, dan kebutuhan asrama YAMUTI Tasikmalaya yang sedang berjalan.",
};

async function getKampanye() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
    const res = await fetch(`${apiUrl}/kampanye?per_page=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error("Gagal mengambil data kampanye:", error);
    return [];
  }
}

export default async function ProgramPage() {
  const campaigns = await getKampanye();

  return (
    <main className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 pb-20">
      <header className="border-b border-stone-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 mb-3">
            <Heart className="w-3.5 h-3.5" />
            Wakaf, Zakat & Infaq Santri
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Daftar Program Kebaikan
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Setiap bantuan Anda dialokasikan langsung untuk pendidikan, nutrisi harian, asrama layak, dan kemandirian santri yatim piatu di Tasikmalaya.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <ProgramClient initialCampaigns={campaigns} />
      </div>
    </main>
  );
}
