import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

// Tipe Data Galeri dari API
interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  file_url: string;
}

// Fetch Data Galeri dari API
async function getGaleri() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/galeri`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || [];
  } catch (error) {
    console.error("Gagal mengambil data galeri:", error);
    return [];
  }
}

export default async function GaleriPage() {
  const galeriList: GaleriItem[] = await getGaleri();

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      {/* Header Section */}
      <div className="relative bg-zinc-900 py-16 text-center dark:bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-500/20 blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Galeri Kebahagiaan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Setiap senyum mereka adalah bukti nyata dari kepedulian Anda. Lihat dokumentasi kegiatan dan momen indah di Panti Asuhan YAMUTI.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20 min-h-[80vh]">
        {galeriList.length === 0 ? (
          <div className="text-center py-32 text-zinc-500 flex flex-col items-center">
            <ImageIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-lg">Belum ada foto galeri yang diunggah saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {galeriList.map((foto) => (
              <div key={foto.id} className="group cursor-pointer">
                <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      {foto.file_url ? (
                        <Image 
                          src={foto.file_url} 
                          alt={foto.judul}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                          <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs">Gambar Tidak Tersedia</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 p-6">
                          <p className="text-white font-semibold text-lg">{foto.judul}</p>
                          {foto.deskripsi && (
                            <p className="text-white/80 text-sm mt-1 line-clamp-2">{foto.deskripsi}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
