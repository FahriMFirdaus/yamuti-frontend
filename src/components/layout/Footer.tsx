import Link from "next/link";

interface OperasionalSettings {
  email?: string;
  no_hp_resmi?: string;
  no_whatsapp_admin?: string;
  no_whatsapp?: string;
  alamat_lengkap?: string;
  alamat_singkat?: string;
}

async function getFooterSettings(): Promise<OperasionalSettings> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/landing/operasional`, {
      cache: "no-store",
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
}

export default async function Footer() {
  const settings = await getFooterSettings();

  const email = settings.email || "yatimmutiara@gmail.com";
  const noHpResmi = settings.no_hp_resmi || settings.no_whatsapp || "+62 877 0031 2182";
  const noWaAdmin = settings.no_whatsapp_admin || settings.no_whatsapp || "+62 877 0031 2182";
  const alamat = settings.alamat_lengkap || "JL. Letjen Masudi Pasar Gunung Kalong, Kec. Tamansari, Kota Tasikmalaya";

  // Format link WhatsApp (misal +62 877... -> 62877...)
  const cleanWa = noWaAdmin.replace(/[^0-9]/g, "");
  const waUrl = cleanWa.startsWith("0") ? `https://wa.me/62${cleanWa.slice(1)}` : `https://wa.me/${cleanWa}`;

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
              <li><Link href="/artikel" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Kabar & Artikel</Link></li>
              <li><Link href="/galeri" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Galeri Dokumentasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Kontak</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Email:</span>{" "}
                <a href={`mailto:${email}`} className="hover:text-red-600 transition-colors">
                  {email}
                </a>
              </li>
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">No. HP Resmi:</span>{" "}
                <a href={`tel:${noHpResmi.replace(/[^0-9+]/g, "")}`} className="hover:text-red-600 transition-colors">
                  {noHpResmi}
                </a>
              </li>
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">WhatsApp Admin:</span>{" "}
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
                  {noWaAdmin}
                </a>
              </li>
              <li>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Alamat:</span> {alamat}
              </li>
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
