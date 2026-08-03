"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Heart, CalendarDays, LogOut, CheckCircle2, Clock, Pencil, Camera, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



function ProfilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profil");
  const [donasiPage, setDonasiPage] = useState(1);
  const [kunjunganPage, setKunjunganPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  
  // API states
  const [riwayatDonasi, setRiwayatDonasi] = useState<any[]>([]);
  const [donasiMeta, setDonasiMeta] = useState<any>(null);
  const [isLoadingDonasi, setIsLoadingDonasi] = useState(false);
  const [selectedDonasi, setSelectedDonasi] = useState<any>(null);
  const [isDonasiModalOpen, setIsDonasiModalOpen] = useState(false);
  
  const [riwayatKunjungan, setRiwayatKunjungan] = useState<any[]>([]);
  const [kunjunganMeta, setKunjunganMeta] = useState<any>(null);
  const [isLoadingKunjungan, setIsLoadingKunjungan] = useState(false);
  const [selectedKunjungan, setSelectedKunjungan] = useState<any>(null);
  const [isKunjunganModalOpen, setIsKunjunganModalOpen] = useState(false);
  
  // States for avatar upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const itemsPerPage = 3;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "donasi" || tab === "kunjungan") {
      setActiveTab(tab);
    }
    
    // Ambil data user dari localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        if (parsed.foto_identitas) setPreviewUrl(parsed.foto_identitas);
      } catch (e) {
        // ignore
      }
    }
  }, [searchParams]);

  const fetchDonasi = async (page: number) => {
    setIsLoadingDonasi(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/user/riwayat-donasi?page=${page}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data?.data || [];
        const meta = result.data || {};
        setRiwayatDonasi(data);
        setDonasiMeta(meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDonasi(false);
    }
  };

  useEffect(() => {
    if (activeTab === "donasi") {
      fetchDonasi(donasiPage);
    }
  }, [activeTab, donasiPage]);

  const fetchKunjungan = async (page: number) => {
    setIsLoadingKunjungan(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/user/riwayat-kunjungan?page=${page}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data?.data || [];
        const meta = result.data || {};
        setRiwayatKunjungan(data);
        setKunjunganMeta(meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingKunjungan(false);
    }
  };

  useEffect(() => {
    if (activeTab === "kunjungan") {
      fetchKunjungan(kunjunganPage);
    }
  }, [activeTab, kunjunganPage]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Tampilkan notifikasi agar user tahu mereka harus menekan tombol simpan
      setUpdateMessage({ type: 'success', text: 'Foto dipilih. Jangan lupa tekan "Simpan Perubahan" di tab Data Diri.' });
      setTimeout(() => setUpdateMessage(null), 4000);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    const nama = (document.getElementById('nama') as HTMLInputElement)?.value;
    const whatsapp = (document.getElementById('whatsapp') as HTMLInputElement)?.value;
    const email = (document.getElementById('email') as HTMLInputElement)?.value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setUpdateMessage({ type: 'error', text: 'Format email tidak valid (harus mengandung @ dan domain).' });
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);
    
    try {
      const token = localStorage.getItem("token") || undefined;
      
      // Menggunakan FormData agar bisa mengirim file gambar ke backend Laravel
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Trick Laravel untuk method PUT menggunakan POST
      if (nama) formData.append('name', nama);
      if (whatsapp) formData.append('no_hp', whatsapp);
      if (email) formData.append('email', email);
      if (selectedFile) formData.append('foto_identitas', selectedFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/profile`, {
        method: "POST", // Harus POST untuk mengirim FormData di Laravel
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
          // Jangan set Content-Type secara manual jika menggunakan FormData
        },
        body: formData
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }
      
      // Update local storage and state with new user data
      localStorage.setItem("user", JSON.stringify(result.data));
      setUser(result.data);
      if (result.data.foto_identitas) setPreviewUrl(result.data.foto_identitas);
      setUpdateMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      
      // Hide message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      setUpdateMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24 pt-12 dark:bg-zinc-950">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dashboard Donatur
            </h1>
            <p className="text-zinc-500 mt-2 text-base">Kelola informasi pribadi dan pantau jejak kebaikan Anda.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full md:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" /> Keluar Akun
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Menu */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            {/* User Info Card */}
            <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
              <CardContent className="p-6 text-center">
                {/* Avatar / Foto Profil (Clickable) */}
                <div className="relative w-max mx-auto mb-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-amber-100 text-3xl font-bold text-red-600 shadow-inner overflow-hidden dark:from-red-900/40 dark:to-amber-900/40 dark:text-red-400 group ring-4 ring-white dark:ring-zinc-950 hover:ring-red-100 dark:hover:ring-red-900/30 transition-all"
                  >
                    {previewUrl ? (
                      <Image src={previewUrl} alt="Foto Profil" fill className="object-cover" />
                    ) : (
                      <span>{user ? getInitials(user.name) : "..."}</span>
                    )}
                    {/* Overlay Hover */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  {/* Pensil Icon Kecil di Sudut (Selalu Tampil) */}
                  <div 
                    className="absolute bottom-0 right-0 bg-red-600 rounded-full p-1.5 border-2 border-white dark:border-zinc-900 shadow-sm pointer-events-none"
                  >
                    <Pencil className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user?.name || "Memuat..."}</h2>
                <p className="text-sm text-zinc-500">{user?.email || "..."}</p>
                <div className="mt-4 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Donatur Aktif
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
              <div className="flex flex-col p-2">
                <button 
                  onClick={() => setActiveTab("profil")}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all",
                    activeTab === 'profil' 
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <User className="h-4 w-4" /> Data Diri Pribadi
                </button>
                <button 
                  onClick={() => setActiveTab("donasi")}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all",
                    activeTab === 'donasi' 
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Heart className="h-4 w-4" /> Riwayat Donasi
                </button>
                <button 
                  onClick={() => setActiveTab("kunjungan")}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all",
                    activeTab === 'kunjungan' 
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <CalendarDays className="h-4 w-4" /> Jadwal Kunjungan
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === "profil" && (
              <div className="space-y-6">
                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                  <CardHeader className="border-b border-zinc-100 pb-6 dark:border-zinc-800/50">
                    <CardTitle className="text-xl">Informasi Akun</CardTitle>
                    <CardDescription>Pastikan data diri Anda selalu diperbarui untuk memudahkan komunikasi.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {user ? (
                      <>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="nama" className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</Label>
                            <Input id="nama" defaultValue={user.name} className="h-11 bg-white dark:bg-zinc-900" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="font-semibold text-zinc-700 dark:text-zinc-300">No. WhatsApp</Label>
                            <Input id="whatsapp" defaultValue={user.no_hp || ""} className="h-11 bg-white dark:bg-zinc-900" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-semibold text-zinc-700 dark:text-zinc-300">Alamat Email</Label>
                          <Input id="email" type="email" defaultValue={user.email} className="h-11 bg-white dark:bg-zinc-900" />
                          <p className="text-xs text-zinc-500">Anda akan menerima pemberitahuan WhatsApp ke nomor terdaftar jika Anda mengubah alamat email.</p>
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center text-zinc-500">Memuat data profil...</div>
                    )}
                    
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center gap-4">
                      <Button 
                        onClick={handleUpdateProfile} 
                        disabled={isUpdating}
                        className="h-11 w-full sm:w-auto px-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                      {updateMessage && (
                        <span className={cn("text-sm font-semibold", updateMessage.type === 'success' ? "text-green-600" : "text-red-600")}>
                          {updateMessage.text}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Form Ubah Password (Conditional Rendering) */}
                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 overflow-hidden transition-all duration-300">
                  <div 
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                  >
                    <div>
                      <CardTitle className="text-xl">Ubah Kata Sandi</CardTitle>
                      <CardDescription className="mt-1">Kelola keamanan akun Anda dengan memperbarui kata sandi secara berkala.</CardDescription>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-zinc-500 transition-transform duration-300", isPasswordOpen && "rotate-180")} />
                  </div>
                  
                  {isPasswordOpen && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800/50 animate-in slide-in-from-top-4 fade-in duration-300">
                      <CardContent className="pt-6">
                        {user?.has_password === true ? (
                          <form className="space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="current-password" className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Saat Ini</Label>
                                <Input id="current-password" type="password" placeholder="Masukkan kata sandi saat ini" className="h-11 max-w-md bg-white dark:bg-zinc-900" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="new-password" className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Baru</Label>
                                <Input id="new-password" type="password" placeholder="Masukkan kata sandi baru" className="h-11 max-w-md bg-white dark:bg-zinc-900" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="font-semibold text-zinc-700 dark:text-zinc-300">Konfirmasi Kata Sandi Baru</Label>
                                <Input id="confirm-password" type="password" placeholder="Ketik ulang kata sandi baru" className="h-11 max-w-md bg-white dark:bg-zinc-900" />
                              </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                              <Button type="button" className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white font-bold">
                                Perbarui Kata Sandi
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.25028 6.60998L5.27028 9.72498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.1 21.215C22.449 19.05 23.49 15.92 23.49 12.275Z" fill="#4285F4"/><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.23999 6.58984C0.439987 8.19984 0 10.0299 0 11.9999C0 13.9699 0.444986 15.7999 1.23999 17.4099L5.26498 14.2949Z" fill="#FBBC05"/><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L15.9204 17.98C14.8454 18.705 13.5354 19.16 12.0004 19.16C8.8704 19.16 6.2154 17.05 5.2704 14.185L1.2454 17.3C3.2504 21.22 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Login dengan Google</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                              Akun Anda terhubung langsung dengan Google. Oleh karena itu, pengaturan dan autentikasi kata sandi dikelola sepenuhnya oleh Google.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "donasi" && (
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardHeader className="border-b border-zinc-100 pb-6 dark:border-zinc-800/50">
                  <CardTitle className="text-xl">Riwayat Donasi</CardTitle>
                  <CardDescription>Terima kasih atas segala bentuk donasi yang telah Anda salurkan.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {isLoadingDonasi ? (
                      <div className="p-8 text-center text-zinc-500">Memuat riwayat donasi...</div>
                    ) : riwayatDonasi.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                          <Heart className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Belum Ada Riwayat Donasi</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">Anda belum melakukan donasi apa pun. Mari mulai langkah kebaikan Anda hari ini dengan membantu anak-anak asuh kami.</p>
                        <Button onClick={() => router.push('/donasi')} className="h-11 text-base font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full px-8 shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:-translate-y-0.5">
                          Donasi Sekarang
                        </Button>
                      </div>
                    ) : (
                      riwayatDonasi.map((donasi) => (
                        <div key={donasi.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                          <div className="mb-4 sm:mb-0">
                            <p className="font-bold text-zinc-900 text-base mb-1 dark:text-zinc-100">
                              {donasi.kampanye?.judul || donasi.program || "Donasi Umum"}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                              <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                {donasi.invoice || `INV-${donasi.id}`}
                              </span>
                              <span>•</span>
                              <span>{new Date(donasi.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-red-600 text-lg dark:text-red-400">
                                Rp {Number(donasi.gross_amount || donasi.nominal || 0).toLocaleString('id-ID')}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="hidden sm:flex text-xs h-7 px-2 border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                onClick={() => {
                                  setSelectedDonasi(donasi);
                                  setIsDonasiModalOpen(true);
                                }}
                              >
                                Detail
                              </Button>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3">
                              {donasi.status === 'success' || donasi.status === 'settlement' || donasi.status === 'Berhasil' ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none flex items-center gap-1.5 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle2 className="w-3 h-3" /> Berhasil
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none flex items-center gap-1.5 dark:bg-amber-900/30 dark:text-amber-400">
                                  <Clock className="w-3 h-3" /> Pending
                                </Badge>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="sm:hidden text-xs h-7 px-2 border-zinc-200"
                                onClick={() => {
                                  setSelectedDonasi(donasi);
                                  setIsDonasiModalOpen(true);
                                }}
                              >
                                Detail
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  {donasiMeta && donasiMeta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/50">
                      <span className="text-sm text-zinc-500">
                        Menampilkan {donasiMeta.from || 0}-{donasiMeta.to || 0} dari {donasiMeta.total || 0}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDonasiPage(p => Math.max(1, p - 1))}
                          disabled={donasiPage === 1 || isLoadingDonasi}
                        >
                          Sebelumnya
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDonasiPage(p => Math.min(donasiMeta.last_page, p + 1))}
                          disabled={donasiPage >= donasiMeta.last_page || isLoadingDonasi}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Modal Detail Donasi */}
            <Dialog open={isDonasiModalOpen} onOpenChange={setIsDonasiModalOpen}>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Detail Donasi</DialogTitle>
                  <DialogDescription>
                    Informasi lengkap mengenai donasi Anda.
                  </DialogDescription>
                </DialogHeader>
                {selectedDonasi && (
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">ID/Invoice</p>
                        <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                          {selectedDonasi.invoice || `INV-${selectedDonasi.id}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</p>
                        {selectedDonasi.status === 'success' || selectedDonasi.status === 'settlement' || selectedDonasi.status === 'Berhasil' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none mt-1">Berhasil</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none mt-1">Pending</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Program / Tujuan</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {selectedDonasi.kampanye?.judul || selectedDonasi.program || "Donasi Umum YAMUTI"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tanggal</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {new Date(selectedDonasi.created_at || selectedDonasi.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Nominal</p>
                          <p className="text-lg font-extrabold text-red-600 dark:text-red-400">
                            Rp {Number(selectedDonasi.gross_amount || selectedDonasi.nominal || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      {selectedDonasi.pesan && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pesan / Doa</p>
                          <p className="text-sm italic text-zinc-700 bg-zinc-50 p-3 rounded-md mt-1 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
                            "{selectedDonasi.pesan}"
                          </p>
                        </div>
                      )}
                    </div>

                    {(selectedDonasi.status === 'pending' || selectedDonasi.status === 'Pending') && selectedDonasi.payment_url && (
                      <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                          onClick={() => window.open(selectedDonasi.payment_url, '_blank')}
                        >
                          Lanjutkan Pembayaran
                        </Button>
                        <p className="text-xs text-center text-zinc-500 mt-2">
                          Klik tombol di atas untuk menyelesaikan pembayaran Anda via Midtrans.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {activeTab === "kunjungan" && (
              <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                <CardHeader className="border-b border-zinc-100 pb-6 dark:border-zinc-800/50">
                  <CardTitle className="text-xl">Jadwal Kunjungan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {isLoadingKunjungan ? (
                      <div className="p-8 text-center text-zinc-500">Memuat jadwal kunjungan...</div>
                    ) : riwayatKunjungan.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                          <CalendarDays className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Belum Ada Jadwal Kunjungan</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">Anda belum pernah mengajukan jadwal kunjungan. Jadwalkan kehadiran Anda sekarang untuk bersilaturahmi dengan anak-anak asuh kami.</p>
                        <Button onClick={() => router.push('/kunjungan')} className="h-11 text-base font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full px-8 shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:-translate-y-0.5">
                          Jadwalkan Kunjungan
                        </Button>
                      </div>
                    ) : (
                      riwayatKunjungan.map((kunjungan) => (
                        <div key={kunjungan.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                          <div className="mb-4 sm:mb-0">
                            <p className="font-bold text-zinc-900 text-base mb-1 dark:text-zinc-100">
                              {kunjungan.maksud || kunjungan.tujuan || "Kunjungan Umum"}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                              <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                KNJ-{kunjungan.id}
                              </span>
                              <span>•</span>
                              <span>{new Date(kunjungan.slot_waktu || kunjungan.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3">
                            {kunjungan.status === 'Selesai' || kunjungan.status === 'selesai' || kunjungan.status === 'approved' ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none flex items-center gap-1.5 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="w-3 h-3" /> Disetujui
                              </Badge>
                            ) : kunjungan.status === 'Menunggu Konfirmasi' || kunjungan.status === 'pending' ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none flex items-center gap-1.5 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="w-3 h-3" /> Menunggu
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none flex items-center gap-1.5 dark:bg-red-900/30 dark:text-red-400">
                                <LogOut className="w-3 h-3" /> Dibatalkan
                              </Badge>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-7 px-2 border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                              onClick={() => {
                                setSelectedKunjungan(kunjungan);
                                setIsKunjunganModalOpen(true);
                              }}
                            >
                              Detail
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  {kunjunganMeta && kunjunganMeta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/50">
                      <span className="text-sm text-zinc-500">
                        Menampilkan {kunjunganMeta.from || 0}-{kunjunganMeta.to || 0} dari {kunjunganMeta.total || 0}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setKunjunganPage(p => Math.max(1, p - 1))}
                          disabled={kunjunganPage === 1 || isLoadingKunjungan}
                        >
                          Sebelumnya
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setKunjunganPage(p => Math.min(kunjunganMeta.last_page, p + 1))}
                          disabled={kunjunganPage >= kunjunganMeta.last_page || isLoadingKunjungan}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Modal Detail Kunjungan */}
            <Dialog open={isKunjunganModalOpen} onOpenChange={setIsKunjunganModalOpen}>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Detail Kunjungan</DialogTitle>
                  <DialogDescription>
                    Informasi lengkap mengenai jadwal kunjungan Anda.
                  </DialogDescription>
                </DialogHeader>
                {selectedKunjungan && (
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">ID Kunjungan</p>
                        <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                          KNJ-{selectedKunjungan.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</p>
                        {selectedKunjungan.status === 'Selesai' || selectedKunjungan.status === 'selesai' || selectedKunjungan.status === 'approved' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none mt-1">Disetujui</Badge>
                        ) : selectedKunjungan.status === 'Menunggu Konfirmasi' || selectedKunjungan.status === 'pending' ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none mt-1">Menunggu</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none mt-1">Dibatalkan</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Nama Perwakilan</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {selectedKunjungan.nama_tamu}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Maksud / Tujuan</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {selectedKunjungan.maksud || selectedKunjungan.tujuan || "Kunjungan Umum"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tanggal Kunjungan</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {new Date(selectedKunjungan.slot_waktu || selectedKunjungan.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Jumlah Orang</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {selectedKunjungan.jumlah_pengunjung || "-"} Orang
                          </p>
                        </div>
                      </div>
                      {selectedKunjungan.no_whatsapp && (
                        <div>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Nomor WhatsApp</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {selectedKunjungan.no_whatsapp}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ProfilContent />
    </Suspense>
  );
}
