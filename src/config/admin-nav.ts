import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  CalendarDays, 
  Package, 
  Wallet, 
  BookOpen, 
  Megaphone, 
  FileText, 
  ImageIcon, 
  ShieldCheck, 
  UserCog, 
  Settings,
  Newspaper,
  LucideIcon
} from "lucide-react";

export interface AdminNavChild {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export interface AdminNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
  children?: AdminNavChild[];
}

export interface AdminNavSection {
  title?: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Program & Asrama",
    items: [
      { name: "Anak Asuh", href: "/admin/anak-asuh", icon: Users },
      { name: "Orang Tua Asuh", href: "/admin/orang-tua-asuh", icon: HeartHandshake },
      { name: "Kunjungan", href: "/admin/kunjungan", icon: CalendarDays },
      { name: "Inventaris", href: "/admin/inventaris", icon: Package },
    ],
  },
  {
    title: "Keuangan & Donasi",
    items: [
      { name: "Donasi", href: "/admin/donasi", icon: Wallet },
      { name: "Buku Kas", href: "/admin/kas", icon: BookOpen },
      { 
        name: "Akuntansi Yayasan", 
        href: "/admin/akuntansi", 
        icon: FileText,
        children: [
          { name: "Jurnal Umum", href: "/admin/akuntansi?tab=jurnal" },
          { name: "Buku Besar", href: "/admin/akuntansi?tab=buku-besar" },
          { name: "Neraca & Aktivitas", href: "/admin/akuntansi?tab=neraca" },
        ]
      },
      { name: "Program Donasi", href: "/admin/program", icon: Megaphone },
    ],
  },
  {
    title: "Publikasi & CMS",
    items: [
      { 
        name: "CMS Website", 
        href: "/admin/cms", 
        icon: Newspaper,
        children: [
          { name: "Artikel Berita", href: "/admin/cms", icon: FileText },
          { name: "Galeri Foto", href: "/admin/cms?tab=galeri", icon: ImageIcon },
        ]
      },
      { name: "WhatsApp Broadcast", href: "/admin/broadcast", icon: Megaphone },
    ],
  },
  {
    title: "Pengaturan & Akses",
    items: [
      { name: "Peran & Akses", href: "/admin/roles", icon: ShieldCheck, superAdminOnly: true },
      { name: "Pengguna", href: "/admin/users", icon: UserCog, superAdminOnly: true },
      { name: "Pengaturan Sistem", href: "/admin/pengaturan", icon: Settings },
    ],
  },
];
