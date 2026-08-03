import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri_Quran } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
});

export const metadata: Metadata = {
  title: {
    default: "YAMUTI - Yayasan Mutiara Harapan Tasikmalaya",
    template: "%s | YAMUTI",
  },
  description: "Bantu wujudkan senyum dan harapan untuk masa depan anak-anak panti asuhan YAMUTI Tasikmalaya. Salurkan donasi, zakat, dan sedekah Anda secara transparan dan aman.",
  keywords: ["Panti Asuhan Tasikmalaya", "Donasi Yatim", "Yayasan Mutiara Harapan", "Sedekah Online", "Wakaf", "Zakat"],
  authors: [{ name: "YAMUTI Tasikmalaya" }],
  openGraph: {
    title: "YAMUTI - Yayasan Mutiara Harapan Tasikmalaya",
    description: "Salurkan donasi, zakat, dan sedekah Anda secara transparan dan aman untuk masa depan anak-anak panti asuhan YAMUTI.",
    url: "https://yamuti.id",
    siteName: "YAMUTI",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630&fit=crop", // Simulated OG Image
        width: 1200,
        height: 630,
        alt: "YAMUTI Tasikmalaya",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "YAMUTI - Yayasan Mutiara Harapan Tasikmalaya",
    description: "Bantu wujudkan senyum dan harapan untuk masa depan anak-anak panti asuhan YAMUTI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${amiriQuran.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>

        {/* Global Floating WhatsApp Button */}
        <a 
          href="https://wa.me/6287700312182?text=Halo%20Admin%20YAMUTI,%20saya%20ingin%20bertanya%20seputar%20donasi/kunjungan." 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-[99] flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/40 hover:-translate-y-1 hover:scale-110 transition-all duration-300 group"
          aria-label="Chat WhatsApp Admin"
        >
          {/* Ping effect behind the button */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></div>
          
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-9 md:h-9 relative z-10">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          
          {/* Hover Tooltip */}
          <span className="absolute right-16 md:right-20 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold py-2 px-4 rounded-xl pointer-events-none whitespace-nowrap shadow-lg">
            Chat Admin YAMUTI
          </span>
        </a>
      </body>
    </html>
  );
}
