import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { ShareButton } from "@/components/ui/share-button";

export const metadata: Metadata = {
  title: "Program Kebaikan",
  description: "Pilih dan dukung program kebaikan YAMUTI Tasikmalaya yang sedang berjalan hari ini.",
};

// Fetch Data Program dari API
async function getKampanye() {
  try {
    const res = await fetch("http://localhost:8000/api/kampanye", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || [];
  } catch (error) {
    console.error("Gagal mengambil data kampanye:", error);
    return [];
  }
}

export default async function ProgramPage() {
  const campaigns = await getKampanye();
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
            Pilih Program Kebaikan Anda
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Setiap donasi Anda adalah langkah besar bagi masa depan mereka. 
            Telusuri program kami dan temukan di mana Anda ingin memberikan dampak.
          </p>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="container mx-auto mt-12 px-4 md:px-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Belum Ada Program Aktif</p>
            <p className="mt-2 text-sm">Saat ini belum ada program kampanye yang sedang berjalan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign: any) => {
              const target = Number(campaign.target_donasi) || 0;
              const terkumpul = Number(campaign.donasi_sum_gross_amount) || 0;
              const persentase = target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0;
              const isTercapai = persentase >= 100 || campaign.status === 'Selesai';
              
              // Hitung sisa hari
              let sisaHari = 0;
              if (campaign.tanggal_berakhir) {
                const end = new Date(campaign.tanggal_berakhir).getTime();
                const now = new Date().getTime();
                const diff = end - now;
                sisaHari = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
              }

              return (
                <Card key={campaign.id} className="group overflow-hidden flex flex-col border-zinc-200/60 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                  {/* Image Section */}
                  <Link href={`/program/${campaign.slug}`} className="relative h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 block">
                    <img 
                      src={campaign.thumbnail || "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"} 
                      alt={campaign.judul}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={cn(
                          "font-semibold uppercase tracking-wide",
                          campaign.status === "Mendesak" ? "bg-red-600 text-white hover:bg-red-700" :
                          isTercapai ? "bg-green-500 text-white hover:bg-green-600" :
                          "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        {isTercapai ? "Tercapai" : (campaign.status || "Aktif")}
                      </Badge>
                    </div>
                  </Link>

                  {/* Content Section */}
                  <CardContent className="flex flex-1 flex-col p-6">
                    <Link href={`/program/${campaign.slug}`}>
                      <h3 className="line-clamp-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                        {campaign.judul}
                      </h3>
                    </Link>
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {campaign.deskripsi || "Dukung program kebaikan ini untuk membantu anak-anak asuh di Panti Asuhan YAMUTI."}
                    </p>

                    <div className="mt-auto pt-6">
                      {/* Progress Stats */}
                      <div className="flex items-end justify-between text-sm mb-2">
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            Rp {terkumpul.toLocaleString('id-ID')}
                          </span>
                          <span className="text-zinc-500 block text-xs mt-0.5">
                            Terkumpul dari Rp {target.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-red-600 dark:text-red-400">{persentase}%</span>
                        </div>
                      </div>

                      {/* Custom Progress Bar */}
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div 
                          className="h-full rounded-full bg-red-600 transition-all duration-1000 ease-out" 
                          style={{ width: `${persentase}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs font-medium text-zinc-500">
                        <span>- Donatur</span>
                        {isTercapai ? (
                          <span className="text-green-600 dark:text-green-400">Target Tercapai</span>
                        ) : campaign.tanggal_berakhir ? (
                          <span>Sisa {sisaHari} hari lagi</span>
                        ) : (
                          <span>Tanpa batas waktu</span>
                        )}
                      </div>
                    </div>
                  </CardContent>

                {/* Action Section */}
                <CardFooter className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/50 mt-4 flex gap-2">
                  {isTercapai ? (
                    <div 
                      className={cn(
                        buttonVariants({ variant: "outline" }), 
                        "flex-1 text-zinc-500 pointer-events-none border-zinc-200 dark:border-zinc-800"
                      )}
                    >
                      Donasi Terpenuhi
                    </div>
                  ) : (
                    <Link 
                      href={`/donasi?program=${campaign.slug}`} 
                      className={cn(
                        buttonVariants(), 
                        "flex-1 bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5"
                      )}
                    >
                      Donasi
                    </Link>
                  )}
                  <ShareButton url={`http://localhost:3000/program/${campaign.slug}`} title={campaign.judul} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
