import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

// Tipe Data Artikel dari API
interface ArtikelItem {
  id: string;
  slug: string;
  judul: string;
  konten: string;
  thumbnail_url: string | null;
  created_at: string;
  kategori_artikel?: {
    nama: string;
  };
}

// Fetch Data Artikel dari API
async function getArtikel() {
  try {
    const res = await fetch("http://localhost:8000/api/artikel", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || [];
  } catch (error) {
    console.error("Gagal mengambil data artikel:", error);
    return [];
  }
}

// Utility: Hapus tag HTML dari string untuk mendapatkan kutipan murni
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
}

export default async function ArtikelPage() {
  const artikelList: ArtikelItem[] = await getArtikel();

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
            Berita & Cerita YAMUTI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Ikuti terus perkembangan, program, dan kebahagiaan anak-anak asuh kami melalui artikel-artikel terbaru.
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-12 px-4 md:px-8">
        {artikelList.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            Belum ada artikel yang diterbitkan saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {artikelList.map((artikel) => {
              const plainText = stripHtml(artikel.konten || "");
              const kutipan = plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;
              
              return (
                <Card key={artikel.id} className="group overflow-hidden flex flex-col border-zinc-200/60 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {artikel.thumbnail_url ? (
                      <Image 
                        src={artikel.thumbnail_url} 
                        alt={artikel.judul}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 font-medium">Tanpa Gambar</div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-red-700 hover:bg-white border-none shadow-sm font-semibold backdrop-blur-sm">
                        {artikel.kategori_artikel?.nama || "Berita"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-medium text-zinc-500 mb-2">
                      {new Date(artikel.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <h3 className="line-clamp-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors mb-3">
                      <Link href={`/artikel/${artikel.slug}`} className="before:absolute before:inset-0">
                        {artikel.judul}
                      </Link>
                    </h3>
                    <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {kutipan}
                    </p>
                    <div className="mt-auto pt-6">
                      <span className="text-red-600 font-semibold text-sm hover:underline flex items-center">
                        Baca selengkapnya <span className="ml-1 text-lg leading-none">&rarr;</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
