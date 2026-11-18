import { Metadata } from "next";
import { CheckCircle2, Building2, ShieldCheck, HeartHandshake, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Profil Yayasan Mutiara Titipan Illahi (YAMUTI) Tasikmalaya. Sejarah pengabdian, visi misi, nilai HEBAT, dan legalitas resmi organisasi.",
};

export default function TentangKamiPage() {
  return (
    <main className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 pb-20">
      <header className="border-b border-stone-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Profil & Landasan Lembaga
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Yayasan Mutiara Titipan Illahi
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Menelusuri jejak ikhtiar, cita-cita, dan komitmen perlindungan masa depan bagi santri yatim dan dhuafa di wilayah Tasikmalaya.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Sejarah Singkat Pendirian
              </h2>
              <div className="space-y-3.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p>
                  Yayasan Mutiara Titipan Illahi (YAMUTI) Cabang Tasikmalaya merupakan lembaga kesejahteraan sosial dan kemanusiaan resmi yang bergerak di bawah naungan YAMUTI Pusat Bandung. Didirikan pada tahun 2019 saat masa pandemi COVID-19, kehadiran yayasan bermula dari kepedulian mendalam atas kondisi anak-anak yang kehilangan orang tua dan keluarga prasejahtera yang terdampak langsung secara ekonomi.
                </p>
                <p>
                  Melalui asrama yang berlokasi di Tamansari Tasikmalaya, YAMUTI kini mengasuh dan mendampingi puluhan anak yatim dan dhuafa dengan jaminan tempat tinggal layak, kebutuhan nutrisi harian, perlindungan kesehatan, serta pembinaan pendidikan formal dan kepesantrenan.
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Arah Pengabdian
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Visi & Misi Yayasan
                </h2>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                  Visi Utama
                </span>
                <p className="text-sm sm:text-base font-semibold text-emerald-950 dark:text-emerald-100 italic leading-snug">
                  &ldquo;Menjadi Lembaga yang Amanah dan Profesional Menuju Masyarakat yang Rahmatan lil &lsquo;Alamiin.&rdquo;
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-3">
                  Ikhtiar Nyata (Misi Lembaga):
                </span>
                <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Membina Insan Berakhlak:</strong> Menyiapkan generasi santri yang mandiri, berilmu amaliah, dan berakhlak mulia.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Tata Kelola Akuntabel:</strong> Mengelola amanah donatur dengan pelaporan transparan dan audit berkala.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Jembatan Gotong Royong:</strong> Menghubungkan kepedulian para dermawan dengan kebutuhan mendesak anak asuh di lapangan.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Kemanfaatan Berkelanjutan:</strong> Menghadirkan program sosial yang berdampak jangka panjang bagi kemandirian santri.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="mb-5">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Budaya Kerja
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Nilai Inti (HEBAT)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Lima pilar etika yang mendasari setiap pengambilan keputusan dan pengasuhan anak asuh:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-emerald-700 dark:text-emerald-400">H — Harmoni</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">Keselarasan hubungan persaudaraan antara pengurus, anak asuh, dan lingkungan sosial.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-emerald-700 dark:text-emerald-400">E — Empati</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">Ketulusan hati untuk mendengarkan, merasakan, dan mendampingi kebutuhan anak yatim.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-emerald-700 dark:text-emerald-400">B — Barokah</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">Menjaga niat ikhlas agar setiap rupiah donasi membawa kebaikan yang berlipat ganda.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-emerald-700 dark:text-emerald-400">A — Amanah</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">Integritas tanpa kompromi dalam menyalurkan bantuan persis kepada yang berhak.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80 sm:col-span-2">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-emerald-700 dark:text-emerald-400">T — Terbuka</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">Keterbukaan informasi dan penerimaan silaturahmi bagi seluruh lapisan masyarakat.</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-zinc-800">
                <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  Legalitas Resmi Lembaga
                </h3>
              </div>
              
              <dl className="space-y-4 text-xs">
                <div>
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Nama Lembaga</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">YAMUTI Tasikmalaya</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">SK Kemenkumham</dt>
                  <dd className="font-mono font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">AHU-0016666.AH.01.04.Tahun 2017</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">NPWP Lembaga</dt>
                  <dd className="font-mono font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">83.302.637.0-445.00</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Izin Dinsos Provinsi</dt>
                  <dd className="font-mono font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">062/21/PPSKS/19/2022</dd>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
                  <dt className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Akreditasi Kemensos RI</dt>
                  <dd className="text-base font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">A (EXCELLENT)</dd>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5">Standar kelayakan asuhan panti terverifikasi resmi oleh Kementerian Sosial.</p>
                </div>
              </dl>
            </div>

            <div className="bg-stone-100/70 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80 rounded-3xl p-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Ingin Silaturahmi Langsung?
              </span>
              <p className="leading-relaxed">
                Asrama YAMUTI menerima kunjungan donatur setiap hari untuk doa bersama, makan bareng, atau perayaan syukuran.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
