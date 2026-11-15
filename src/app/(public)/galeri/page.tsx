import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { GaleriClient } from "./galeri-client";

export const metadata: Metadata = {
  title: "Galeri Kebahagiaan",
  description: "Setiap senyum mereka adalah bukti nyata dari kepedulian Anda. Lihat dokumentasi kegiatan dan momen indah di Panti Asuhan YAMUTI.",
};

// Fetch Data Galeri dari API
async function getGaleri() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/galeri?per_page=100`, {
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
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      {/* Header Section dengan Ambient Lighting */}
      <div className="relative bg-zinc-900 py-16 md:py-24 text-center dark:bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-[130px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-500/20 blur-[130px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl">
          <Badge 
            variant="outline" 
            className="mb-4 border-red-500/30 text-red-400 bg-red-950/30 px-4 py-1 text-xs uppercase tracking-wider font-bold"
          >
            Dokumentasi & Senyuman
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
            Galeri Kebahagiaan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-zinc-300 leading-relaxed">
            Setiap senyum mereka adalah bukti nyata dari kepedulian Anda. Rekaman momen indah, kegiatan ibadah, dan belajar di asrama YAMUTI Tasikmalaya.
          </p>
        </div>
      </div>

      {/* Main Content with Interactive Search & Lightbox Gallery */}
      <GaleriClient initialGaleri={galeriList} />
    </div>
  );
}
