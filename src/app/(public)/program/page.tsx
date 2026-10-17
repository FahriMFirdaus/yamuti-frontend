import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ProgramClient } from "./program-client";

export const metadata: Metadata = {
  title: "Program Kebaikan",
  description: "Pilih dan dukung program kebaikan YAMUTI Tasikmalaya yang sedang berjalan hari ini.",
};

// Fetch Data Program dari API
async function getKampanye() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye?per_page=100`, {
      cache: "no-store",
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
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      {/* Header Section dengan Ambient Lighting */}
      <div className="relative bg-zinc-900 py-16 md:py-24 text-center dark:bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-500/20 blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl">
          <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400 bg-red-950/30 px-4 py-1 text-xs uppercase tracking-wider font-bold">
            Wakaf, Zakat & Infaq
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
            Pilih Program Kebaikan Anda
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-zinc-300 leading-relaxed">
            Setiap donasi Anda adalah langkah besar bagi masa depan mereka. 
            Telusuri program kami dan temukan di mana Anda ingin menorehkan jejak kebaikan.
          </p>
        </div>
      </div>

      {/* Main Campaign Grid dengan Pencarian & Pagination Rapi */}
      <ProgramClient initialCampaigns={campaigns} />
    </div>
  );
}
