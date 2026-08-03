import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArtikelDetail {
  id: string;
  slug: string;
  judul: string;
  konten: string;
  thumbnail_url: string | null;
  created_at: string;
  kategori_artikel?: {
    nama: string;
  };
  penulis?: {
    name: string;
  };
}

async function getArtikelDetail(slug: string): Promise<ArtikelDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/artikel/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Gagal mengambil detail artikel:", error);
    return null;
  }
}

export default async function DetailArtikelPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const artikel = await getArtikelDetail(slug);

  if (!artikel) {
    notFound();
  }

  const tanggal = new Date(artikel.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-24">
      {/* Hero Thumbnail */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-zinc-900 overflow-hidden">
        {artikel.thumbnail_url ? (
          <Image 
            src={artikel.thumbnail_url} 
            alt={artikel.judul}
            fill
            priority
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <Link href="/artikel" className="inline-flex items-center text-sm font-medium text-zinc-300 hover:text-white transition-colors mb-6 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Artikel
            </Link>
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-none shadow-sm font-semibold mb-4 text-sm px-4 py-1">
              {artikel.kategori_artikel?.nama || "Berita"}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
              {artikel.judul}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-300">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {tanggal}
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {artikel.penulis?.name || "Admin YAMUTI"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 md:px-8 pt-12 md:pt-16">
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-zinc-800 -mt-24 relative z-10 prose prose-lg prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-red-600 hover:prose-a:text-red-700 prose-img:rounded-2xl">
          <div dangerouslySetInnerHTML={{ __html: artikel.konten }} />
        </div>
        
        <div className="mt-12 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <div className="flex items-center text-zinc-600 dark:text-zinc-400 font-medium">
            <Tag className="w-5 h-5 mr-2" />
            Kategori: <span className="text-zinc-900 dark:text-white ml-2">{artikel.kategori_artikel?.nama || "Berita"}</span>
          </div>
          <Link href="/artikel" className="font-bold text-red-600 hover:text-red-700 hover:underline">
            Baca Artikel Lainnya &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
