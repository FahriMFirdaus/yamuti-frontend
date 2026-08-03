"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Users, CheckCircle, ArrowRight, Quote, BookOpen, Share2, MapPin, Clock, Phone, Calendar } from "lucide-react";

const ALL_PROGRAMS = [
  { id: "1", judul: "Wakaf Pembebasan Lahan Asrama Tasikmalaya", target_donasi: 500000000, terkumpul: 125000000, status: "Aktif", thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" },
  { id: "2", judul: "Beasiswa Pendidikan Yatim & Dhuafa", target_donasi: 150000000, terkumpul: 150000000, status: "Tercapai", thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop" },
  { id: "3", judul: "Sedekah Subuh & Sembako Rutin", target_donasi: 20000000, terkumpul: 8500000, status: "Aktif", thumbnail: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=800&auto=format&fit=crop" },
  { id: "4", judul: "Bantuan Kesehatan Anak Panti", target_donasi: 30000000, terkumpul: 12000000, status: "Mendesak", thumbnail: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop" },
];

const ALL_ARTICLES = [
  { id: "1", slug: "kegiatan-ramadhan", judul: "Keseruan Buka Bersama 100 Anak Yatim", tanggal: "15 Apr 2026", kategori: "Kunjungan", thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop" },
  { id: "2", slug: "beasiswa-tahap-1", judul: "Penyaluran Beasiswa Pendidikan Tahap 1", tanggal: "02 Mar 2026", kategori: "Program", thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop" },
];

const ALL_GALLERY = [
  { id: "1", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop" },
  { id: "2", url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop" },
  { id: "3", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" },
  { id: "4", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop" },
  { id: "5", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop" },
  { id: "6", url: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=600&auto=format&fit=crop" },
  { id: "7", url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=600&auto=format&fit=crop" },
  { id: "8", url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=600&auto=format&fit=crop" },
  { id: "9", url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop" },
  { id: "10", url: "https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?q=80&w=600&auto=format&fit=crop" },
];

const ALL_DOA = [
  { id: "1", nama: "B*** T.", doa: "Semoga YAMUTI semakin berkah dan amanah. Semoga sedikit dari kami bisa bermanfaat untuk anak-anak." },
  { id: "2", nama: "R*** W.", doa: "Bismillah, titip doa untuk almarhum ayah saya. Semoga sedekah ini menjadi amal jariyah baginya." },
  { id: "3", nama: "D*** P.", doa: "Semoga anak-anak panti selalu diberi kesehatan, kebahagiaan, dan menjadi anak yang sholeh." },
  { id: "4", nama: "S*** M.", doa: "Alhamdulillah bisa ikut berbagi bulan ini. Semoga YAMUTI sukses terus dan selalu istiqomah." },
  { id: "5", nama: "P*** A.", doa: "Semoga sedekah ini membersihkan harta kami. Sukses untuk program-program YAMUTI." },
  { id: "6", nama: "R*** H.", doa: "Titip doa agar keluarga kami diberi kelancaran rezeki dan kesehatan. Aamiin." },
  { id: "7", nama: "N*** F.", doa: "Masyaallah, senang melihat perkembangan panti. Semoga pembangunannya cepat selesai." },
  { id: "8", nama: "Y*** S.", doa: "Semoga bermanfaat untuk pendidikan anak-anak. Jangan patah semangat belajarnya ya nak!" },
  { id: "9", nama: "A*** K.", doa: "Untuk semua pengurus YAMUTI, semoga Allah membalas keikhlasan antum semua." },
  { id: "10", nama: "H*** Z.", doa: "Bismillah, semoga doa-doa kami diijabah. Titip doa untuk kelancaran usaha kami." }
];

export default function Home() {
  const [randomPrograms, setRandomPrograms] = useState<typeof ALL_PROGRAMS>([]);
  const [randomGallery, setRandomGallery] = useState<typeof ALL_GALLERY>([]);
  const [randomArticles, setRandomArticles] = useState<typeof ALL_ARTICLES>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Quran API State
  const [quranData, setQuranData] = useState<{ arabic: string; terjemahan: string; surah: string; nomor: number } | null>(null);
  const [loadingQuran, setLoadingQuran] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const shuffle = <T,>(array: T[]) => [...array].sort(() => 0.5 - Math.random());
    setRandomPrograms(shuffle(ALL_PROGRAMS).slice(0, 3));
    setRandomArticles(shuffle(ALL_ARTICLES).slice(0, 2));
    setRandomGallery(shuffle(ALL_GALLERY).slice(0, 10));

    // Fetch random Ayah related to Orphans/Charity
    const fetchQuran = async () => {
      try {
        const ayahs = [
          "2:220", "2:215", "93:9", "76:8", "4:36", 
          "2:261", "2:274", "63:10", "107:2", "2:254"
        ];
        const randomAyah = ayahs[Math.floor(Math.random() * ayahs.length)];
        
        // Menggunakan quran-uthmani dikombinasikan dengan Amiri_Quran Next Font agar tampil persis seperti Mushaf cetak
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/quran-uthmani,id.indonesian`);
        const result = await res.json();
        
        if (result.code === 200 && result.data.length === 2) {
          setQuranData({
            arabic: result.data[0].text,
            terjemahan: result.data[1].text,
            surah: result.data[1].surah.englishName,
            nomor: result.data[1].numberInSurah
          });
        }
      } catch (error) {
        console.error("Gagal mengambil ayat Al-Quran", error);
      } finally {
        setLoadingQuran(false);
      }
    };
    fetchQuran();
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#faf9f6] dark:bg-zinc-950 pb-24">
      {/* --- HERO SECTION: BESPOKE DESIGN --- */}
      <section className="relative w-full pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Soft blob background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-amber-300/30 blur-[100px] dark:bg-amber-900/20" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] rounded-full bg-red-400/20 blur-[120px] dark:bg-red-900/20" />

        <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left: Typography & CTA */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm border border-red-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-red-400">
              <Heart className="h-4 w-4 animate-pulse" />
              <span>Bersama Membangun Harapan</span>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-6xl lg:text-7xl leading-[1.1]">
              Wujudkan <span className="text-red-600">Masa Depan</span> Cerah Untuk Mereka.
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              YAMUTI Tasikmalaya hadir sebagai jembatan kebaikan Anda. Setiap rupiah yang disalurkan menjadi senyum, pendidikan, dan kehidupan yang lebih layak bagi anak-anak asuh kami.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="/program" 
                className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/30 transition-all hover:-translate-y-1")}
              >
                Mulai Berdonasi <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <div className="flex -space-x-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Donatur" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="Donatur" />
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs">
                    5k+
                  </div>
                </div>
                <span>Donatur Aktif</span>
              </div>
            </div>
          </div>

          {/* Right: Bespoke Masonry Image Grid */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
              <div className="space-y-4 md:space-y-6 mt-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=500&auto=format&fit=crop" alt="Kegiatan" className="w-full h-48 md:h-64 object-cover rounded-3xl shadow-2xl" />
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-3xl text-red-600">120+</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">Anak Asuh Dibina</p>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div className="bg-amber-400 p-6 rounded-3xl shadow-xl text-zinc-900">
                  <Heart className="h-8 w-8 mb-4 opacity-80" />
                  <h3 className="font-bold text-xl leading-tight">Berbagi Adalah Bukti Peduli</h3>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=500&auto=format&fit=crop" alt="Kegiatan" className="w-full h-56 md:h-72 object-cover rounded-3xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INSPIRASI AL-QURAN SECTION --- */}
      <section className="relative my-12 mx-4 md:mx-8 rounded-[3rem] overflow-hidden shadow-2xl">
        {/* Aesthetic Background Image (Floral/Nature) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop')" }} 
        />
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 z-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md" />

        <div className="container relative z-10 mx-auto px-4 py-16 md:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-zinc-900 text-red-600 dark:text-red-400 rounded-full mb-8 shadow-sm border border-red-100 dark:border-zinc-800">
            <BookOpen className="h-8 w-8" />
          </div>
          
          {loadingQuran ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4 mx-auto" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mx-auto" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6 mx-auto" />
            </div>
          ) : quranData ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Quote className="h-10 w-10 text-red-600/30 mx-auto rotate-180" />
              <p 
                className="text-3xl md:text-5xl text-zinc-900 dark:text-zinc-100" 
                dir="rtl" 
                lang="ar"
                style={{ fontFamily: "var(--font-amiri-quran), serif", lineHeight: "2.2" }}
              >
                {quranData.arabic}
              </p>
              <div className="w-16 h-1 bg-red-600 mx-auto rounded-full my-6 opacity-70" />
              <p className="text-lg text-zinc-700 dark:text-zinc-300 italic font-medium max-w-3xl mx-auto leading-relaxed">
                "{quranData.terjemahan}"
              </p>
              <Badge variant="outline" className="text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 px-4 py-1.5 mt-6 font-semibold shadow-sm backdrop-blur-sm">
                QS. {quranData.surah} : {quranData.nomor}
              </Badge>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg text-zinc-700 dark:text-zinc-300 italic font-medium max-w-3xl mx-auto leading-relaxed">
                "Maka terhadap anak yatim janganlah engkau berlaku sewenang-wenang. Dan terhadap orang yang meminta-minta janganlah engkau menghardik(nya)."
              </p>
              <Badge variant="outline" className="text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 px-4 py-1.5 mt-6 font-semibold shadow-sm backdrop-blur-sm">
                QS. Ad-Duha : 9-10
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* --- SPOTLIGHT PROGRAMS --- */}
      <section className="container mx-auto px-4 md:px-8 mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">Program Sedang Berjalan</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">Pilih ladang pahala Anda hari ini. Dukungan sekecil apapun sangat berarti bagi mereka.</p>
          </div>
          <Link href="/program" className="inline-flex items-center text-red-600 font-bold hover:text-red-700 transition-colors">
            Jelajahi Semua <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Dynamic Program Layout */}
        {isClient && (() => {
          const count = randomPrograms.length;
          
          if (count === 0) {
            return <p className="text-center text-zinc-500 py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">Belum ada program donasi yang aktif saat ini.</p>;
          }

          let gridClass = "grid grid-cols-1 gap-8";
          if (count === 1) gridClass = "grid grid-cols-1 gap-8 max-w-md mx-auto";
          else if (count === 2) gridClass = "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto";
          else gridClass = "grid grid-cols-1 md:grid-cols-3 gap-8";

          return (
            <div className={gridClass}>
              {randomPrograms.map((program) => {
                const persentase = Math.min(Math.round((program.terkumpul / program.target_donasi) * 100), 100);
                return (
                  <Card key={program.id} className="group overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-zinc-900 flex flex-col">
                    <div className="relative h-60 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={program.thumbnail} alt={program.judul} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 right-4">
                        <Badge className={cn("px-3 py-1 font-semibold", program.status === "Mendesak" ? "bg-red-600 animate-pulse" : "bg-zinc-900")}>
                          {program.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xl mb-4 line-clamp-2 text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                          {program.judul}
                        </h3>
                        <div className="flex justify-between text-sm font-medium mb-3">
                          <span className="text-zinc-500">Terkumpul</span>
                          <span className="text-red-600">{persentase}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-red-600 rounded-full" style={{ width: `${persentase}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-8">
                        <Link href={`/donasi?program=${program.id}`} className={cn(buttonVariants({ size: "lg" }), "flex-1 h-[52px] rounded-xl font-bold text-base bg-zinc-900 text-white hover:bg-red-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-red-600 dark:hover:text-white transition-colors")}>
                          Donasi
                        </Link>
                        <button
                          onClick={() => {
                            const url = window.location.origin + '/program/' + program.id; // Or program.slug
                            if (navigator.share) {
                              navigator.share({
                                title: program.judul,
                                text: 'Mari bantu wujudkan harapan bersama YAMUTI Tasikmalaya untuk program ini.',
                                url: url,
                              }).catch(console.error);
                            } else {
                              navigator.clipboard.writeText(url);
                              alert('Tautan program berhasil disalin!');
                            }
                          }}
                          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-xl h-[52px] w-[52px] flex-shrink-0 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:border-red-600 transition-colors")}
                          title="Bagikan Program"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* --- LATEST STORIES (BESPOKE LAYOUT) --- */}
      <section className="container mx-auto px-4 md:px-8 mt-32 relative">
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">Cerita & Dampak Kebaikan Anda</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Setiap donasi mengukir senyuman. Baca laporan kegiatan terbaru kami.</p>
            <Link href="/artikel" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full font-bold border-2")}>
              Baca Selengkapnya
            </Link>
          </div>
          
          <div className="lg:w-2/3">
            {/* Dynamic Articles Layout */}
            {isClient && (() => {
              const count = randomArticles.length;
              
              if (count === 0) {
                return <p className="text-center text-zinc-500 py-10">Belum ada kabar atau artikel terbaru saat ini.</p>;
              }

              let gridClass = "grid grid-cols-1 gap-6";
              if (count === 1) gridClass = "grid grid-cols-1 gap-6 max-w-2xl mx-auto";
              else gridClass = "grid grid-cols-1 lg:grid-cols-2 gap-6";

              return (
                <div className={gridClass}>
                  {randomArticles.map((artikel) => (
                    <Link href={`/artikel/${artikel.slug}`} key={artikel.id} className="group relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artikel.thumbnail} alt={artikel.judul} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6">
                        <Badge className="bg-red-600 mb-3 border-none">{artikel.kategori}</Badge>
                        <h3 className="text-white font-bold text-xl leading-snug line-clamp-2">{artikel.judul}</h3>
                        <p className="text-zinc-300 text-sm mt-2">{artikel.tanggal}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* --- TITIPAN DOA (DONOR MESSAGES) --- */}
      <section className="relative my-24 overflow-hidden py-16 bg-white dark:bg-zinc-950">
        <div className="text-center mb-12 px-4 relative z-20">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white md:text-4xl">
            Titipan Doa Donatur
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            Setiap donasi selalu diiringi dengan doa dan harapan tulus. Kebaikan Anda adalah nafas bagi mereka.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative flex flex-col gap-6 pause-on-hover">
          {ALL_DOA.length <= 4 ? (
            // STATIC LAYOUT (Jika data sedikit, pusatkan ke tengah)
            <div className="flex flex-wrap justify-center gap-6 px-4">
              {ALL_DOA.map((doa) => (
                <div key={doa.id} className="w-full md:w-80 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <p className="text-zinc-700 dark:text-zinc-300 italic mb-6">"{doa.doa}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-lg">
                      {doa.nama.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{doa.nama}</h4>
                      <p className="text-xs text-zinc-500">Hamba Allah</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // MARQUEE LAYOUT (Jika data banyak, jalankan animasi)
            <>
              {/* Row 1: Left to Right (CSS translates -50%, so it moves left) */}
              <div className="flex w-max animate-marquee-left gap-6 px-3">
                {[...ALL_DOA, ...ALL_DOA].map((doa, i) => (
                  <div key={`row1-${i}`} className="w-80 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 p-6 flex flex-col justify-between rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
                    <p className="text-zinc-700 dark:text-zinc-300 italic mb-6">"{doa.doa}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-lg">
                        {doa.nama.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{doa.nama}</h4>
                        <p className="text-xs text-zinc-500">Orang Baik</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2: Right to Left (CSS translates from -50% to 0, so it moves right) */}
              <div className="flex w-max animate-marquee-right gap-6 px-3">
                {[...ALL_DOA.slice().reverse(), ...ALL_DOA.slice().reverse()].map((doa, i) => (
                  <div key={`row2-${i}`} className="w-80 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 p-6 flex flex-col justify-between rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
                    <p className="text-zinc-700 dark:text-zinc-300 italic mb-6">"{doa.doa}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
                        {doa.nama.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{doa.nama}</h4>
                        <p className="text-xs text-zinc-500">Hamba Allah</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Gradient Overlay for seamless fade effect on edges */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
      </section>

      {/* --- BENTO GALLERY SECTION --- */}
      <section className="container mx-auto px-4 md:px-8 mt-24 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">Galeri Kebahagiaan</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">Setiap momen adalah cerita nyata tentang harapan yang terus tumbuh berkat doa dan dukungan Anda.</p>
          </div>
          <Link href="/galeri" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full font-bold border-2")}>
            Jelajahi Semua Foto
          </Link>
        </div>

        {/* Dynamic Gallery Layout Based on Content Count */}
        {isClient && (() => {
          const count = randomGallery.length;
          
          const renderItem = (foto: any, extraClass: string = "") => (
            <div key={foto.id} className={cn("relative rounded-3xl overflow-hidden group shadow-md cursor-pointer", extraClass)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.url} alt="Galeri" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 text-zinc-900 font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-xl scale-90 group-hover:scale-100 transition-transform">Lihat Momen</div>
              </div>
            </div>
          );

          if (count === 0) return <p className="text-center text-zinc-500 py-10">Belum ada foto galeri.</p>;

          // --- Symmetrical Clamping Logic ---
          let displayCount = count;
          if (count >= 5 && count < 10) displayCount = 5;
          if (count >= 10) displayCount = 10;

          if (displayCount === 1) {
            return <div className="h-[400px] md:h-[600px]">{renderItem(randomGallery[0], "w-full h-full")}</div>;
          }

          if (displayCount === 2) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[800px] md:h-[500px]">
                {renderItem(randomGallery[0], "w-full h-full")}
                {renderItem(randomGallery[1], "w-full h-full")}
              </div>
            );
          }

          if (displayCount === 3) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[800px] md:h-[600px]">
                {renderItem(randomGallery[0], "w-full h-full")}
                <div className="grid grid-rows-2 gap-4 h-full">
                  {renderItem(randomGallery[1], "w-full h-full")}
                  {renderItem(randomGallery[2], "w-full h-full")}
                </div>
              </div>
            );
          }

          if (displayCount === 4) {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[800px] md:h-[600px]">
                {renderItem(randomGallery[0], "w-full h-full")}
                {renderItem(randomGallery[1], "w-full h-full")}
                {renderItem(randomGallery[2], "w-full h-full")}
                {renderItem(randomGallery[3], "w-full h-full")}
              </div>
            );
          }

          if (displayCount === 5) {
            // Perfect 5-piece Bento (1 Large, 4 Small)
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-4 h-[600px] md:h-[500px]">
                {renderItem(randomGallery[0], "col-span-2 row-span-2")}
                {renderItem(randomGallery[1], "col-span-1 row-span-1")}
                {renderItem(randomGallery[2], "col-span-1 row-span-1")}
                {renderItem(randomGallery[3], "col-span-1 row-span-1")}
                {renderItem(randomGallery[4], "col-span-1 row-span-1")}
              </div>
            );
          }

          // 10 items (Massive Double Bento Grid)
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-4 gap-2 md:gap-4 h-[1200px] md:h-[1000px]">
              {/* TOP HALF: Large on Left, 4 Smalls on Right */}
              {renderItem(randomGallery[0], "col-span-2 row-span-2")}
              {renderItem(randomGallery[1], "col-span-1 row-span-1")}
              {renderItem(randomGallery[2], "col-span-1 row-span-1")}
              {renderItem(randomGallery[3], "col-span-1 row-span-1")}
              {renderItem(randomGallery[4], "col-span-1 row-span-1")}
              
              {/* BOTTOM HALF: 4 Smalls on Left, Large on Right */}
              {renderItem(randomGallery[5], "col-span-1 row-span-1 hidden md:block")}
              {renderItem(randomGallery[6], "col-span-1 row-span-1 hidden md:block")}
              {renderItem(randomGallery[7], "col-span-1 row-span-1 hidden md:block")}
              {renderItem(randomGallery[8], "col-span-1 row-span-1 hidden md:block")}
              {renderItem(randomGallery[9], "col-span-2 row-span-2 md:col-start-3 md:row-start-3")}
            </div>
          );
        })()}
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="container mx-auto px-4 md:px-8 mt-24">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-1 text-xs uppercase tracking-wider font-bold">Pusat Bantuan</Badge>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white md:text-4xl">
            Pertanyaan Umum
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan yang sering diajukan oleh calon donatur dan relawan kami.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-zinc-900 dark:text-zinc-100 outline-none">
              Apakah Yayasan YAMUTI adalah lembaga resmi?
              <span className="relative size-5 shrink-0 text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Ya, YAMUTI (Yayasan Mutiara Titipan Illahi) adalah lembaga sosial berbadan hukum resmi yang terdaftar di Kementerian Hukum dan HAM serta memiliki izin operasional dari Dinas Sosial dan pemerintah daerah setempat.
            </div>
          </details>

          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-zinc-900 dark:text-zinc-100 outline-none">
              Bagaimana cara menjadi donatur tetap (rutin)?
              <span className="relative size-5 shrink-0 text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Anda dapat bergabung menjadi Orang Tua Asuh dengan menekan tombol "Donasi Sekarang" lalu memilih opsi Donasi Bulanan. Tim kami juga akan secara otomatis memasukkan Anda ke dalam grup silaturahmi khusus donatur tetap.
            </div>
          </details>

          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-zinc-900 dark:text-zinc-100 outline-none">
              Apakah bisa berdonasi selain dalam bentuk uang tunai?
              <span className="relative size-5 shrink-0 text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tentu saja! Kami menerima donasi dalam bentuk sembako, pakaian layak pakai, alat tulis, hingga material bangunan untuk asrama. Silakan jadwalkan kunjungan Anda atau hubungi admin WhatsApp kami untuk penjemputan donasi barang.
            </div>
          </details>

          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-zinc-900 dark:text-zinc-100 outline-none">
              Ke mana dana donasi saya disalurkan?
              <span className="relative size-5 shrink-0 text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </span>
            </summary>
            <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              100% donasi disalurkan sesuai dengan akad program yang Anda pilih. Fokus utama kami meliputi pemenuhan gizi, biaya pendidikan dasar hingga perguruan tinggi, fasilitas asrama, dan kesehatan santri YAMUTI. Laporan penyaluran rutin diunggah pada halaman Berita & Artikel.
            </div>
          </details>
        </div>
      </section>

      {/* --- LOKASI & JAM OPERASIONAL --- */}
      <section className="container mx-auto px-4 md:px-8 my-24">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-1 text-xs uppercase tracking-wider font-bold">Kunjungi Kami</Badge>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white md:text-4xl">
            Lokasi & Jam Buka
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            Mampir langsung ke asrama YAMUTI Tasikmalaya, atau hubungi pengurus kami lewat Telepon & Instagram.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Kiri: Informasi (Bento Style) */}
          <div className="flex flex-col gap-6">
            {/* Box Alamat */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Alamat Asrama</h4>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                  Sukahurip, Kab. Tasikmalaya, Jawa Barat
                </p>
              </div>
            </div>

            {/* Box Jam Operasional */}
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex-grow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Jam Operasional</h4>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Buka Setiap Hari</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Senin - Jumat</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">08.00 - 17.00</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Sabtu - Minggu</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">09.00 - 15.00</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Hari Libur Nasional</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">Sesuai Janji Temu</span>
                </div>
              </div>
            </div>

            {/* Box Buttons */}
            <div className="mt-2">
              <Link 
                href="/kunjungan" 
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "w-full rounded-2xl h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-base md:text-lg shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                )}
              >
                <Calendar className="w-5 h-5 group-hover:animate-bounce" />
                Buat Jadwal Kunjungan
              </Link>
            </div>
          </div>

          {/* Kanan: Google Maps */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800 h-[400px] lg:h-auto relative group">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d989.2178069617374!2d108.23463186963221!3d-7.368327669509687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f571bd02416e5%3A0xc424bdc4b9185c5f!2sYayasan%20Mutiara%20Titipan%20lllaahi%20YAMUTI%20Tasikmalaya!5e0!3m2!1sen!2ssg!4v1783591804254!5m2!1sen!2ssg" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 w-full h-full grayscale-[50%] group-hover:grayscale-0 transition-all duration-700 object-cover"
            />
            {/* Glass overlay on map just for aesthetic touch before hover */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
          </div>
        </div>
      </section>
    </div>
  );
}
