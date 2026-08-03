import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Profil Yayasan Mutiara Titipan Illahi (YAMUTI) Tasikmalaya. Visi, Misi, dan Legalitas Organisasi.",
};

export default function TentangKamiPage() {
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
            Tentang YAMUTI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Mengenal lebih dekat Yayasan Mutiara Titipan Illahi Tasikmalaya dan komitmen kami untuk anak bangsa.
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-16 px-4 md:px-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Main Content - Visi Misi */}
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 border-b-2 border-red-500 pb-2 inline-block mb-6">
                Sejarah Singkat
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                Yayasan Mutiara Titipan Illahi (YAMUTI) Cabang Tasikmalaya merupakan lembaga kesejahteraan sosial dan kemanusiaan resmi yang beroperasi di bawah naungan YAMUTI Pusat Bandung. Yayasan ini didirikan pada tahun 2019, bertepatan dengan masa krisis pandemi COVID-19, sebagai respons nyata terhadap tingginya urgensi penanganan masalah sosial di wilayah Tasikmalaya.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify mt-4">
                Fokus utama kami adalah memberikan perlindungan, jaminan kelayakan hidup, serta pendidikan moral dan keagamaan bagi anak yatim piatu, kaum dhuafa, dan anak-anak terlantar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 border-b-2 border-red-500 pb-2 inline-block mb-6">
                Visi & Misi
              </h2>
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-red-600 mb-4">Visi</h3>
                <p className="text-lg italic text-zinc-700 dark:text-zinc-300 mb-8 border-l-4 border-amber-500 pl-4">
                  "Menjadi Lembaga yang Amanah dan professional menuju Masyarakat yang Rahmatan lil alamiin."
                </p>

                <h3 className="text-xl font-bold text-red-600 mb-4">Misi</h3>
                <ul className="space-y-4 text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Membangun sumber daya insani yang amanah dan professional.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Memantapkan positioning sebagai lembaga yang amanah dan professional.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Menumbuhkembangkan kepedulian masyarakat kepada nilai-nilai kehidupan yang berorientasi pada kemanusiaan.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                    <span>Menjadikan lembaga sebagai akselerator perubahan menuju peradaban rahmatan lil alamiin.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 border-b-2 border-red-500 pb-2 inline-block mb-6">
                Nilai Inti (HEBAT)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg text-amber-600 mb-2">Harmoni</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Keselarasan nilai-nilai kehidupan berdasarkan nilai ilahi rahmatan (universal).</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg text-amber-600 mb-2">Empati</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Menciptakan keinginan tulus untuk menolong sesama dan merasakan emosi orang lain.</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg text-amber-600 mb-2">Barokah</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Kehidupan yang dipenuhi rasa syukur dan tetap istiqomah dalam proses ikhtiar.</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg text-amber-600 mb-2">Amanah</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Kehidupan yang secara tegas menjaga kemurnian nilai keimanan dari kezaliman.</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-2">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg text-amber-600 mb-2">Terbuka</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Membangun budaya toleransi dan perdamaian yang menerima perbedaan tanpa harus memaksakan keseragaman.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Sidebar - Identitas Legalitas */}
          <div className="space-y-8">
            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 sticky top-28">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg mb-6">
                <Info className="h-5 w-5" />
                Legalitas Institusi
              </div>
              
              <ul className="space-y-5">
                <li>
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nama Resmi</span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">YAYASAN MUTIARA TITIPAN ILLAHI TASIKMALAYA</span>
                </li>
                <li>
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Domisili</span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">JL. Letjen Masudi Pasar Gunung Kalong, Kec. Tamansari, Kota Tasikmalaya</span>
                </li>
                <li>
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">SK Kemenkumham</span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">AHU-0016666.AH.01.04.Tahun 2017</span>
                </li>
                <li>
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">NPWP</span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">83.302.637.0-445.00</span>
                </li>
                <li>
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Dinsos Provinsi</span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">062/21/PPSKS/19/2022</span>
                </li>
                <li className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <span className="block text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Akreditasi Kemensos</span>
                  <span className="block text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">A EXCELLENT</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
