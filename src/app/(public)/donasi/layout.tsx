import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donasi Sekarang",
  description: "Mulai langkah kebaikan Anda. Berdonasi dengan mudah dan aman untuk anak asuh YAMUTI.",
};

export default function DonasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
