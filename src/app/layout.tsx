import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri_Quran } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

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

        {/* Global Floating WhatsApp Button (Sinkron Dinamis dengan Pengaturan Sistem) */}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
