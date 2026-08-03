import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

// Fetch Detail Program dari API
async function getKampanyeDetail(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Gagal mengambil detail kampanye:", error);
    return null;
  }
}

export default async function DetailProgramPage({ params }: { params: { slug: string } }) {
  const campaign = await getKampanyeDetail(params.slug);

  if (!campaign) {
    notFound();
  }

  const target = Number(campaign.target_donasi) || 0;
  const terkumpul = Number(campaign.donasi_sum_gross_amount) || 0;
  const persentase = target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0;
  const isTercapai = persentase >= 100 || campaign.status === 'Selesai';

  let sisaHari = 0;
  if (campaign.tanggal_berakhir) {
    const end = new Date(campaign.tanggal_berakhir).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    sisaHari = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }

  // Fallback data untuk donatur terbaru (jika backend belum memberikan relasi)
  const donaturTerakhir = campaign.donasi || [];

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      <div className="relative h-[400px] w-full bg-zinc-900">
        <img 
          src={campaign.thumbnail} 
          alt={campaign.judul} 
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        <div className="absolute bottom-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <Badge className="mb-4 bg-red-600 text-white hover:bg-red-700 uppercase tracking-wider">
              {isTercapai ? "Tercapai" : (campaign.status || "Aktif")}
            </Badge>
            <h1 className="text-3xl font-extrabold text-white md:text-5xl max-w-4xl leading-tight">
              {campaign.judul}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Cerita Program</h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {campaign.deskripsi || "Mari bantu sukseskan program kebaikan ini. Setiap donasi Anda akan sangat berarti bagi anak-anak asuh di Panti Asuhan YAMUTI."}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl shadow-red-900/5 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="mb-4">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  Rp {terkumpul.toLocaleString('id-ID')}
                </span>
                <span className="block text-sm text-zinc-500 mt-1">
                  terkumpul dari target Rp {target.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${persentase}%` }}
                />
              </div>

              <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6">
                <span>{persentase}% Tercapai</span>
                {isTercapai ? (
                  <span className="text-green-600 dark:text-green-400">Selesai</span>
                ) : campaign.tanggal_berakhir ? (
                  <span>{sisaHari} Hari Lagi</span>
                ) : (
                  <span>Tanpa batas waktu</span>
                )}
              </div>

              <Link href={`/donasi?program=${campaign.slug}`} className="block w-full">
                <Button 
                  size="lg" 
                  disabled={isTercapai}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-red-500/25 transition-all"
                >
                  {isTercapai ? "Donasi Ditutup" : "Donasi Sekarang"}
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Donatur Terbaru</h3>
              <div className="space-y-4">
                {donaturTerakhir.length > 0 ? (
                  donaturTerakhir.map((donatur: any, i: number) => {
                    // Coba ambil avatar dari relasi user jika tersedia
                    const avatarUrl = donatur.user?.avatar || donatur.user?.profile_photo_url || null;
                    const finalName = donatur.nama_donatur || donatur.nama || donatur.donatur?.nama || "Hamba Allah";

                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 dark:bg-zinc-800 shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={finalName} className="h-full w-full object-cover" />
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{finalName}</p>
                          <p className="text-xs text-red-600 font-medium">Rp {Number(donatur.gross_amount || donatur.nominal || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-xs text-zinc-400 whitespace-nowrap shrink-0">
                          {new Date(donatur.created_at || donatur.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500 italic">Belum ada donatur, jadilah yang pertama!</p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
