import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-4 text-red-600 text-2xl font-extrabold tracking-tight">
              YAMUTI <span className="text-zinc-900 dark:text-white">Tasikmalaya</span>
            </h3>
            <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
              Yayasan Mutiara Titipan Illahi Tasikmalaya. Bersama kita merajut asa, menebar manfaat, dan membangun masa depan gemilang bagi anak-anak panti asuhan.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Navigasi</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Beranda</Link></li>
              <li><Link href="/program" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Program Donasi</Link></li>
              <li><Link href="/kunjungan" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Jadwal Kunjungan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Kontak</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>Email: yatimmutiara@gmail.com</li>
              <li>WhatsApp: +62 877 0031 2182</li>
              <li>Alamat: JL. Letjen Masudi Pasar Gunung Kalong, Kec. Tamansari, Kota Tasikmalaya</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Yayasan Mutiara Titipan Illahi Tasikmalaya. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
