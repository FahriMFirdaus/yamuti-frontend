"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Heart,
  CalendarDays,
  LogOut,
  CheckCircle2,
  Clock,
  Pencil,
  Camera,
  ChevronDown,
  Printer,
  HeartHandshake,
  Calculator,
  FileText,
  School,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ModalKwitansi } from "@/components/admin/ModalKwitansi";
import { ModalSertifikatDonatur } from "@/components/admin/ModalSertifikatDonatur";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Script from "next/script";
import { PotaCard } from "@/components/pota/PotaCard";
import { PotaReportModal } from "@/components/pota/PotaReportModal";
import { PotaQuickPayModal } from "@/components/pota/PotaQuickPayModal";



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
  const [selectedKwitansi, setSelectedKwitansi] = useState<any | null>(null);
  const [selectedSertifikat, setSelectedSertifikat] = useState<any | null>(null);

  // POTA / Anak Asuh Saya
  const [anakAsuhSaya, setAnakAsuhSaya] = useState<any[]>([]);
  const [isLoadingPota, setIsLoadingPota] = useState(false);

  // Zakat Calculator
  const [penghasilanBulan, setPenghasilanBulan] = useState<number>(0);
  const [emasGram, setEmasGram] = useState<number>(0);

  const [riwayatKunjungan, setRiwayatKunjungan] = useState<any[]>([]);
  const [kunjunganMeta, setKunjunganMeta] = useState<any>(null);
  const [isLoadingKunjungan, setIsLoadingKunjungan] = useState(false);
  const [selectedKunjungan, setSelectedKunjungan] = useState<any>(null);
  const [isKunjunganModalOpen, setIsKunjunganModalOpen] = useState(false);

  // States for avatar upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Profile Form States (Controlled Inputs)
  const [profileName, setProfileName] = useState("");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // POTA Registration States (In-Card Form)
  const [showPotaForm, setShowPotaForm] = useState(false);
  const [potaStep, setPotaStep] = useState<1 | 2>(1);
  const [availableAnakAsuh, setAvailableAnakAsuh] = useState<any[]>([]);
  const [isLoadingAvailableAnak, setIsLoadingAvailableAnak] = useState(false);
  const [selectedAnakIds, setSelectedAnakIds] = useState<string[]>([]);
  const [childCommitments, setChildCommitments] = useState<Record<string, { nominal: number; hari: number; doa: string }>>({});
  const [activeChildModalDetail, setActiveChildModalDetail] = useState<any | null>(null);
  const [selectedPotaForReport, setSelectedPotaForReport] = useState<any | null>(null);
  const [selectedPotaForPay, setSelectedPotaForPay] = useState<any | null>(null);
  const [isSubmittingPota, setIsSubmittingPota] = useState(false);
  const [potaFormMessage, setPotaFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const itemsPerPage = 3;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profil", "donasi", "anak-asuh", "zakat", "kunjungan"].includes(tab)) {
      setActiveTab(tab);
    }

    // Ambil data user dari localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setProfileName(parsed.name || "");
        setProfileWhatsapp(parsed.no_hp || "");
        setProfileEmail(parsed.email || "");
        if (parsed.foto_identitas) setPreviewUrl(parsed.foto_identitas);
      } catch (e) {
        // ignore
      }
    }
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi saat ini wajib diisi.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi baru minimal 8 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Gagal memperbarui kata sandi. Periksa kata sandi saat ini.');
      }

      setPasswordMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordMessage(null);
        setIsPasswordOpen(false);
      }, 3000);
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const fetchDonasi = async (page: number) => {
    setIsLoadingDonasi(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/user/riwayat-donasi?page=${page}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/user/riwayat-kunjungan?page=${page}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
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

  // Fetch Anak Asuh Binaan (POTA)
  const fetchAnakAsuhPota = async () => {
    setIsLoadingPota(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/user/orang-tua-asuh`, {
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const json = await res.json();
        const potaData = json.data || [];
        setAnakAsuhSaya(potaData);
      }
    } catch (e) {
      console.error("Gagal load POTA", e);
    } finally {
      setIsLoadingPota(false);
    }
  };

  const fetchAvailableAnakAsuh = async () => {
    setIsLoadingAvailableAnak(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/user/anak-asuh-tersedia`, {
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        setAvailableAnakAsuh(list);
      }
    } catch (e) {
      console.error("Gagal load calon anak asuh", e);
    } finally {
      setIsLoadingAvailableAnak(false);
    }
  };

  const toggleSelectAnak = (id: string) => {
    setSelectedAnakIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];

      // Inisialisasi default komitmen jika belum ada
      if (!exists && !childCommitments[id]) {
        setChildCommitments(c => ({
          ...c,
          [id]: { nominal: 250000, hari: 1, doa: "" }
        }));
      }
      return updated;
    });
  };

  const updateChildCommitment = (id: string, field: 'nominal' | 'hari' | 'doa', value: any) => {
    setChildCommitments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { nominal: 250000, hari: 1, doa: "" }),
        [field]: value
      }
    }));
  };

  const handleDaftarPota = async (e: React.FormEvent) => {
    e.preventDefault();
    setPotaFormMessage(null);

    if (selectedAnakIds.length === 0) {
      setPotaFormMessage({ type: 'error', text: 'Silakan pilih minimal satu anak asuh binaan.' });
      return;
    }

    // Validasi setiap anak
    for (const id of selectedAnakIds) {
      const comm = childCommitments[id] || { nominal: 250000, hari: 1 };
      if (comm.nominal < 50000) {
        const anak = availableAnakAsuh.find(a => a.id === id);
        setPotaFormMessage({ type: 'error', text: `Komitmen donasi untuk ${anak?.nama || 'anak asuh'} minimal Rp 50.000 / bulan.` });
        return;
      }
    }

    setIsSubmittingPota(true);
    try {
      const token = localStorage.getItem("token") || undefined;

      const payload = {
        items: selectedAnakIds.map(id => ({
          anak_asuh_id: id,
          nominal_bulanan: childCommitments[id]?.nominal || 250000,
          hari_tagihan_per_bulan: Number(childCommitments[id]?.hari) || 1,
          catatan_doa: childCommitments[id]?.doa || null
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/user/orang-tua-asuh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || "Gagal mendaftarkan Orang Tua Asuh.");
      }

      setPotaFormMessage({ type: 'success', text: `Alhamdulillah! Komitmen Orang Tua Asuh untuk ${selectedAnakIds.length} ananda berhasil didaftarkan.` });
      fetchAnakAsuhPota();
      setTimeout(() => {
        setShowPotaForm(false);
        setPotaStep(1);
        setPotaFormMessage(null);
        setSelectedAnakIds([]);
        setChildCommitments({});
      }, 2500);
    } catch (err: any) {
      setPotaFormMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingPota(false);
    }
  };

  useEffect(() => {
    if (activeTab === "anak-asuh") {
      fetchAnakAsuhPota();
    }
  }, [activeTab, user]);

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
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async () => {
    if (!user) return;

    const nama = profileName.trim();
    const whatsapp = profileWhatsapp.trim();
    const email = profileEmail.trim();

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/profile`, {
        method: "POST", // Harus POST untuk mengirim FormData di Laravel
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
          // Jangan set Content-Type secara manual jika menggunakan FormData
        },
        body: formData
      });

      const result = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      // Update local storage and state with new user data
      localStorage.setItem("user", JSON.stringify(result.data));
      setUser(result.data);
      setProfileName(result.data.name || "");
      setProfileWhatsapp(result.data.no_hp || "");
      setProfileEmail(result.data.email || "");
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

        {/* Mobile Horizontal Pill Navigation (< lg) */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveTab("profil")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border",
                activeTab === "profil"
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-500/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              )}
            >
              <User className="h-4 w-4" /> Data Diri
            </button>
            <button
              onClick={() => setActiveTab("donasi")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border",
                activeTab === "donasi"
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-500/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              )}
            >
              <Heart className="h-4 w-4" /> Riwayat Donasi
            </button>
            <button
              onClick={() => setActiveTab("anak-asuh")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border",
                activeTab === "anak-asuh"
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-500/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              )}
            >
              <HeartHandshake className="h-4 w-4" /> Anak Asuh (POTA)
            </button>
            <button
              onClick={() => setActiveTab("zakat")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border",
                activeTab === "zakat"
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-500/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              )}
            >
              <Calculator className="h-4 w-4" /> Bayar Zakat
            </button>
            <button
              onClick={() => setActiveTab("kunjungan")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border",
                activeTab === "kunjungan"
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-500/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              )}
            >
              <CalendarDays className="h-4 w-4" /> Kunjungan
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Menu (Desktop: full menu, Mobile: user card only) */}
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

            {/* Navigation Menu (Hidden on mobile, shown on lg screens) */}
            <Card className="hidden lg:block border-zinc-200 shadow-sm dark:border-zinc-800">
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
                  <Heart className="h-4 w-4" /> Riwayat Donasi & Kwitansi
                </button>
                <button
                  onClick={() => setActiveTab("anak-asuh")}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all",
                    activeTab === 'anak-asuh'
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <HeartHandshake className="h-4 w-4 text-emerald-600" /> Anak Asuh Binaan (POTA)
                </button>
                <button
                  onClick={() => setActiveTab("zakat")}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all",
                    activeTab === 'zakat'
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Calculator className="h-4 w-4 text-amber-600" /> Hitung & Bayar Zakat
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
                            <Input
                              id="nama"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="h-11 bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="font-semibold text-zinc-700 dark:text-zinc-300">No. WhatsApp</Label>
                            <Input
                              id="whatsapp"
                              value={profileWhatsapp}
                              onChange={(e) => setProfileWhatsapp(e.target.value)}
                              className="h-11 bg-white dark:bg-zinc-900"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-semibold text-zinc-700 dark:text-zinc-300">Alamat Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="h-11 bg-white dark:bg-zinc-900"
                          />
                          <p className="text-xs text-zinc-500">Anda akan menerima pemberitahuan WhatsApp ke nomor terdaftar jika Anda mengubah alamat email.</p>
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center text-zinc-500">Memuat data profil...</div>
                    )}

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="h-11 w-full sm:w-auto px-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer font-semibold"
                      >
                        {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                      {updateMessage && (
                        <div className={cn(
                          "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium w-full sm:w-auto",
                          updateMessage.type === 'success'
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                        )}>
                          {updateMessage.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                          )}
                          <span>{updateMessage.text}</span>
                        </div>
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
                          <form onSubmit={handleUpdatePassword} className="space-y-6">
                            {passwordMessage && (
                              <div className={cn(
                                "flex items-center gap-2 p-3.5 rounded-lg text-sm font-medium",
                                passwordMessage.type === 'success'
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                              )}>
                                {passwordMessage.type === 'success' ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                )}
                                <span>{passwordMessage.text}</span>
                              </div>
                            )}

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="current-password" className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Saat Ini</Label>
                                <div className="relative max-w-md">
                                  <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Masukkan kata sandi saat ini"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="h-11 pr-10 bg-white dark:bg-zinc-900"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    aria-label={showCurrentPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                  >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="new-password" className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Baru</Label>
                                <div className="relative max-w-md">
                                  <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Minimal 8 karakter"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-11 pr-10 bg-white dark:bg-zinc-900"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                  >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="font-semibold text-zinc-700 dark:text-zinc-300">Konfirmasi Kata Sandi Baru</Label>
                                <div className="relative max-w-md">
                                  <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Ketik ulang kata sandi baru"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-11 pr-10 bg-white dark:bg-zinc-900"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                              <Button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                              >
                                {isUpdatingPassword ? "Menyimpan..." : "Perbarui Kata Sandi"}
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.25028 6.60998L5.27028 9.72498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" /><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.1 21.215C22.449 19.05 23.49 15.92 23.49 12.275Z" fill="#4285F4" /><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.23999 6.58984C0.439987 8.19984 0 10.0299 0 11.9999C0 13.9699 0.444986 15.7999 1.23999 17.4099L5.26498 14.2949Z" fill="#FBBC05" /><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L15.9204 17.98C14.8454 18.705 13.5354 19.16 12.0004 19.16C8.8704 19.16 6.2154 17.05 5.2704 14.185L1.2454 17.3C3.2504 21.22 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" /></svg>
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
                              {(donasi.status === 'success' || donasi.status === 'settlement' || donasi.status === 'Berhasil' || donasi.status === 'PAID') && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-2.5 font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
                                    onClick={() => setSelectedKwitansi({
                                      id: donasi.id,
                                      order_id: donasi.invoice || donasi.order_id || `INV-${donasi.id}`,
                                      nama_donatur: user?.name || donasi.nama_donatur || "Donatur YAMUTI",
                                      nominal: Number(donasi.gross_amount || donasi.nominal || 0),
                                      program_nama: donasi.kampanye?.judul || donasi.program || "Donasi Umum YAMUTI",
                                      payment_type: donasi.payment_type || "Transfer Bank / Online",
                                      created_at: donasi.created_at || donasi.tanggal,
                                      status: donasi.status
                                    })}
                                  >
                                    <Printer className="w-3.5 h-3.5 mr-1" /> Kwitansi
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-2.5 font-semibold text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800"
                                    onClick={() => setSelectedSertifikat({
                                      nama_donatur: user?.name || donasi.nama_donatur || "Muhsinin Dermawan",
                                      nominal: Number(donasi.gross_amount || donasi.nominal || 0),
                                      program_nama: donasi.kampanye?.judul || donasi.program || "Santunan Anak Asuh YAMUTI",
                                      tanggal: donasi.created_at || donasi.tanggal || new Date().toISOString(),
                                    })}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> E-Sertifikat
                                  </Button>
                                </>
                              )}
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

            {/* TAB ANAK ASUH SAYA (POTA) */}
            {activeTab === "anak-asuh" && (
              <div className="space-y-6">
                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                  <CardHeader className="border-b border-zinc-100 pb-6 dark:border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <HeartHandshake className="w-5 h-5 text-red-500" />
                          Program Orang Tua Asuh (POTA)
                        </CardTitle>
                        <CardDescription>
                          Pantau pendidikan, kesehatan, dan perkembangan ananda asuh binaan Anda.
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          const nextState = !showPotaForm;
                          setShowPotaForm(nextState);
                          setPotaStep(1);
                          if (nextState) {
                            fetchAvailableAnakAsuh();
                          }
                        }}
                        className={cn(
                          "rounded-full text-xs font-semibold cursor-pointer transition-all",
                          showPotaForm
                            ? "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                      >
                        {showPotaForm ? "Tutup Form" : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Tambah Anak Asuh
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* IN-CARD FORM PENDAFTARAN POTA (2-LANGKAH MULTI-ANAK) */}
                    {showPotaForm && (
                      <div className="mb-8 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-emerald-200 dark:border-emerald-800/50 space-y-6 animate-in slide-in-from-top-3 duration-300">
                        {/* Header & Stepper */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                          <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              {potaStep === 1
                                ? "Langkah 1: Pilih Calon Ananda Asuh"
                                : "Langkah 2: Tentukan Komitmen Beasiswa & Jadwal Salur Tiap Ananda"}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">
                              {potaStep === 1
                                ? "Pilih satu atau beberapa anak asuh yang ingin Anda dampingi beasiswanya."
                                : `Mengatur komitmen donasi dan jadwal salur untuk ${selectedAnakIds.length} ananda yang dipilih.`}
                            </p>
                          </div>

                          {/* Step Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPotaStep(1)}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                                potaStep === 1
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                              )}
                            >
                              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                              <span>Pilih Ananda ({selectedAnakIds.length})</span>
                            </button>
                            <span className="text-zinc-300 dark:text-zinc-700">→</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedAnakIds.length > 0) setPotaStep(2);
                              }}
                              disabled={selectedAnakIds.length === 0}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                                potaStep === 2
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 disabled:opacity-50 cursor-pointer"
                              )}
                            >
                              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                              <span>Komitmen Donasi</span>
                            </button>
                          </div>
                        </div>

                        {potaFormMessage && (
                          <div className={cn(
                            "flex items-center gap-2 p-3.5 rounded-lg text-sm font-medium",
                            potaFormMessage.type === 'success'
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300"
                          )}>
                            {potaFormMessage.type === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                            )}
                            <span>{potaFormMessage.text}</span>
                          </div>
                        )}

                        {/* LANGKAH 1: KARTU SIMPLE DENGAN MULTI-SELECT & TOMBOL LIHAT DETAIL */}
                        {potaStep === 1 && (
                          <div className="space-y-6">
                            {isLoadingAvailableAnak ? (
                              <div className="p-12 text-sm text-zinc-500 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                Memuat calon ananda santri binaan...
                              </div>
                            ) : availableAnakAsuh.length === 0 ? (
                              <div className="p-12 text-sm text-zinc-500 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                Alhamdulillah seluruh ananda santri asrama saat ini telah memiliki orang tua asuh aktif.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto p-1 pr-2">
                                {availableAnakAsuh.map((anak) => {
                                  const isSelected = selectedAnakIds.includes(anak.id);
                                  return (
                                    <div
                                      key={anak.id}
                                      onClick={() => toggleSelectAnak(anak.id)}
                                      className={cn(
                                        "p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative group hover:shadow-md",
                                        isSelected
                                          ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30 dark:border-emerald-500"
                                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-300"
                                      )}
                                    >
                                      <div>
                                        <div className="flex items-start gap-3 mb-2">
                                          {/* Foto Profil / Inisial Ananda */}
                                          <div className="relative h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold text-base flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/60 overflow-hidden">
                                            {anak.foto_identitas ? (
                                              <Image src={anak.foto_identitas} alt={anak.nama} fill className="object-cover" />
                                            ) : (
                                              <span>{anak.nama?.charAt(0) || "A"}</span>
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                                {anak.status_keluarga || "Yatim"}
                                              </span>
                                              <span className="text-[10px] text-zinc-500">
                                                {anak.jenis_kelamin}
                                              </span>
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                                              {anak.nama}
                                            </h4>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                                              <School className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                              <span className="truncate">{anak.tingkat_pendidikan || "Sekolah"}</span>
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveChildModalDetail(anak);
                                          }}
                                          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                          Lihat Detail →
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                          <span className={cn(
                                            "text-[11px] font-semibold",
                                            isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-400"
                                          )}>
                                            {isSelected ? "Terpilih" : "Pilih"}
                                          </span>
                                          <div className={cn(
                                            "w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors",
                                            isSelected
                                              ? "bg-emerald-600 text-white border-emerald-600"
                                              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                          )}>
                                            {isSelected && "✓"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Tombol Aksi Bawah Langkah 1 */}
                            <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowPotaForm(false);
                                  setSelectedAnakIds([]);
                                }}
                                className="text-xs h-10 px-4"
                              >
                                Batal
                              </Button>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                  {selectedAnakIds.length} Ananda Terpilih
                                </span>
                                <Button
                                  type="button"
                                  disabled={selectedAnakIds.length === 0}
                                  onClick={() => setPotaStep(2)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-6 cursor-pointer"
                                >
                                  Lanjut ke Komitmen Beasiswa (Langkah 2) →
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* LANGKAH 2: FORM KOMITMEN PER ANANDA / BISA DIBEDAKAN TIAP ANAK */}
                        {potaStep === 2 && (
                          <form onSubmit={handleDaftarPota} className="space-y-6">
                            {/* Tombol Kembali ke Langkah 1 Tepat di Bagian Atas */}
                            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPotaStep(1)}
                                className="text-xs font-semibold cursor-pointer"
                              >
                                ← Kembali ke Langkah 1 (Pilih Ananda)
                              </Button>
                              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                Menyesuaikan komitmen untuk <strong className="text-zinc-900 dark:text-zinc-100">{selectedAnakIds.length}</strong> ananda asuh
                              </span>
                            </div>

                            {/* Form Komitmen Masing-masing Ananda */}
                            <div className="space-y-4">
                              {selectedAnakIds.map((id, index) => {
                                const anak = availableAnakAsuh.find(a => a.id === id);
                                const comm = childCommitments[id] || { nominal: 250000, hari: 1, doa: "" };
                                return (
                                  <div
                                    key={id}
                                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
                                  >
                                    {/* Header Ananda */}
                                    <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                      <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold text-base flex items-center justify-center shrink-0 border border-amber-200 overflow-hidden">
                                          {anak?.foto_identitas ? (
                                            <Image src={anak.foto_identitas} alt={anak?.nama || "Anak"} fill className="object-cover" />
                                          ) : (
                                            <span>{anak?.nama?.charAt(0) || `${index + 1}`}</span>
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded">
                                              Ananda #{index + 1}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                              {anak?.jenis_kelamin} • {anak?.status_keluarga || "Yatim"}
                                            </span>
                                          </div>
                                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                                            {anak?.nama || "Ananda Asuh"}
                                          </h4>
                                          <p className="text-xs text-zinc-500">
                                            {anak?.tingkat_pendidikan || "Sekolah"} • {anak?.nama_sekolah || "Asrama YAMUTI"}
                                          </p>
                                        </div>
                                      </div>

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSelectAnak(id)}
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                      >
                                        Hapus
                                      </Button>
                                    </div>

                                    {/* Input Komitmen Mandiri untuk Ananda Ini */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Nominal Donasi */}
                                      <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                          Komitmen Donasi Bulanan (Rp)
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                          {[100000, 250000, 500000].map((val) => (
                                            <button
                                              type="button"
                                              key={val}
                                              onClick={() => updateChildCommitment(id, 'nominal', val)}
                                              className={cn(
                                                "py-1.5 px-1 text-center rounded-lg text-xs font-bold border transition-all cursor-pointer",
                                                comm.nominal === val
                                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
                                              )}
                                            >
                                              Rp {(val / 1000).toLocaleString('id-ID')}rb
                                            </button>
                                          ))}
                                        </div>
                                        <Input
                                          type="number"
                                          min={50000}
                                          step={10000}
                                          value={comm.nominal || ""}
                                          onChange={(e) => updateChildCommitment(id, 'nominal', Number(e.target.value) || 0)}
                                          className="h-10 text-xs font-mono bg-white dark:bg-zinc-900"
                                          placeholder="Nominal lain, min Rp 50.000"
                                          required
                                        />
                                      </div>

                                      {/* Jadwal Pengingat Salur */}
                                      <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                          Jadwal Pengingat Salur (Tgl Tiap Bulan)
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                          {[1, 5, 10].map((tgl) => (
                                            <button
                                              type="button"
                                              key={tgl}
                                              onClick={() => updateChildCommitment(id, 'hari', tgl)}
                                              className={cn(
                                                "py-1.5 px-1 text-center rounded-lg text-xs font-bold border transition-all cursor-pointer",
                                                comm.hari === tgl
                                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
                                              )}
                                            >
                                              Tgl {tgl}
                                            </button>
                                          ))}
                                        </div>
                                        <Input
                                          type="number"
                                          min={1}
                                          max={31}
                                          value={comm.hari || ""}
                                          onChange={(e) => updateChildCommitment(id, 'hari', Number(e.target.value) || 1)}
                                          className="h-10 text-xs font-mono bg-white dark:bg-zinc-900"
                                          placeholder="Tanggal 1-31"
                                          required
                                        />
                                      </div>
                                    </div>

                                    {/* Pesan Doa untuk Ananda ini */}
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        Pesan Doa / Harapan untuk {anak?.nama || 'Ananda'} (Opsional)
                                      </Label>
                                      <Input
                                        type="text"
                                        value={comm.doa || ""}
                                        onChange={(e) => updateChildCommitment(id, 'doa', e.target.value)}
                                        placeholder="Semoga ananda rajin belajar, sholeh/sholehah dan tercapai cita-citanya..."
                                        className="h-10 text-xs bg-white dark:bg-zinc-900"
                                        maxLength={500}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Ringkasan Total Komitmen */}
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                                  Total Komitmen Beasiswa Bulanan ({selectedAnakIds.length} Anak):
                                </p>
                                <p className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                                  Rp {selectedAnakIds.reduce((sum, id) => sum + (childCommitments[id]?.nominal || 250000), 0).toLocaleString('id-ID')} / bulan
                                </p>
                              </div>
                            </div>

                            {/* Tombol Aksi Bawah Langkah 2 */}
                            <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPotaStep(1)}
                                className="text-xs h-10 px-4"
                              >
                                ← Kembali ke Langkah 1
                              </Button>
                              <div className="flex items-center gap-3">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    setShowPotaForm(false);
                                    setSelectedAnakIds([]);
                                  }}
                                  className="text-xs h-10 px-4 text-zinc-500"
                                >
                                  Batal
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={isSubmittingPota || selectedAnakIds.length === 0}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-6 cursor-pointer"
                                >
                                  {isSubmittingPota ? "Menyimpan Komitmen..." : `Konfirmasi Jadi Orang Tua Asuh (${selectedAnakIds.length} Anak)`}
                                </Button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {/* MODAL DIALOG DETAIL ANANDA SANTRI */}
                    <Dialog open={!!activeChildModalDetail} onOpenChange={(open) => !open && setActiveChildModalDetail(null)}>
                      <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                          <DialogTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" /> Profil Lengkap Calon Ananda Asuh
                          </DialogTitle>
                          <DialogDescription>
                            Informasi detail ananda santri binaan asrama YAMUTI.
                          </DialogDescription>
                        </DialogHeader>

                        {activeChildModalDetail && (
                          <div className="space-y-4 py-2">
                            <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                              <div className="relative h-20 w-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold text-2xl flex items-center justify-center shrink-0 border border-amber-200 overflow-hidden">
                                {activeChildModalDetail.foto_identitas ? (
                                  <Image src={activeChildModalDetail.foto_identitas} alt={activeChildModalDetail.nama} fill className="object-cover" />
                                ) : (
                                  <span>{activeChildModalDetail.nama?.charAt(0) || "A"}</span>
                                )}
                              </div>
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                  {activeChildModalDetail.status_keluarga || "Yatim"}
                                </span>
                                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                                  {activeChildModalDetail.nama}
                                </h3>
                                <p className="text-xs text-zinc-500">
                                  {activeChildModalDetail.jenis_kelamin} • Lahir di {activeChildModalDetail.tempat_lahir || "Tasikmalaya"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3 text-xs">
                              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                <div>
                                  <span className="text-zinc-500 block">Jenjang Sekolah:</span>
                                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {activeChildModalDetail.tingkat_pendidikan || "Sekolah"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block">Nama Sekolah:</span>
                                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {activeChildModalDetail.nama_sekolah || "Asrama YAMUTI"}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="text-zinc-500 font-semibold block mb-1">Bio Singkat & Keterangan:</span>
                                <p className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                                  {activeChildModalDetail.keterangan || "Ananda adalah santri binaan asrama YAMUTI yang tekun menuntut ilmu dan menghafal Al-Qur'an."}
                                </p>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveChildModalDetail(null)}
                                className="text-xs"
                              >
                                Tutup
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!selectedAnakIds.includes(activeChildModalDetail.id)) {
                                    toggleSelectAnak(activeChildModalDetail.id);
                                  }
                                  setActiveChildModalDetail(null);
                                }}
                                className={cn(
                                  "text-xs font-bold",
                                  selectedAnakIds.includes(activeChildModalDetail.id)
                                    ? "bg-zinc-700 text-white"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                )}
                              >
                                {selectedAnakIds.includes(activeChildModalDetail.id) ? "✓ Sudah Dipilih" : "+ Pilih Ananda Ini"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Jika form registrasi POTA sedang aktif (showPotaForm = true), sembunyikan list atau empty-state di bawahnya */}
                    {!showPotaForm && (
                      isLoadingPota ? (
                        <div className="py-12 text-center text-zinc-500">Memuat data anak asuh binaan...</div>
                      ) : anakAsuhSaya.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <HeartHandshake className="w-8 h-8 text-red-500" />
                          </div>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Belum Memiliki Anak Asuh Binaan</h3>
                          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
                            Mari dampingi masa depan anak yatim & dhuafa melalui beasiswa rutin bulanan program Orang Tua Asuh (POTA).
                          </p>
                          <Button
                            onClick={() => {
                              setShowPotaForm(true);
                              setPotaStep(1);
                              fetchAvailableAnakAsuh();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 shadow-lg shadow-red-500/20 cursor-pointer font-bold"
                          >
                            Pilih Anak Asuh Sekarang
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {anakAsuhSaya.map((pota, idx) => (
                            <PotaCard
                              key={pota.id || idx}
                              pota={pota}
                              onOpenReport={(item) => setSelectedPotaForReport(item)}
                              onOpenPay={(item) => setSelectedPotaForPay(item)}
                            />
                          ))}
                        </div>
                      )
                    )}

                    {/* MODAL RAPOR & PERKEMBANGAN ANANDA */}
                    <PotaReportModal
                      isOpen={!!selectedPotaForReport}
                      onClose={() => setSelectedPotaForReport(null)}
                      pota={selectedPotaForReport}
                    />

                    {/* MODAL SALUR BEASISWA INSTAN VIA MIDTRANS */}
                    <PotaQuickPayModal
                      isOpen={!!selectedPotaForPay}
                      onClose={() => setSelectedPotaForPay(null)}
                      pota={selectedPotaForPay}
                      user={user}
                      onSuccess={() => {
                        fetchDonasi(1);
                        fetchAnakAsuhPota();
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB KALKULATOR & BAYAR ZAKAT */}
            {activeTab === "zakat" && (
              <div className="space-y-6">
                <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
                  <CardHeader className="border-b border-zinc-100 pb-6 dark:border-zinc-800/50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-amber-600" />
                      Kalkulator & Salur Zakat Maal / Profesi
                    </CardTitle>
                    <CardDescription>
                      Hitung kewajiban zakat Anda berdasarkan nisab 85 gram emas sesuai ketentuan syariat Islam.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Ringkasan Nisab */}
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-amber-900 dark:text-amber-300">Ketentuan Nisab Zakat (85 Gram Emas)</p>
                        <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                          Asumsi harga emas saat ini: Rp 1.350.000 / gram • Nisab/tahun: Rp 114.750.000 (Rp 9.562.500 / bulan).
                        </p>
                      </div>
                      <Badge className="bg-amber-600 text-white font-bold w-fit">Tarif: 2.5%</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Form Zakat Penghasilan */}
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">1. Zakat Penghasilan / Profesi</h4>
                        <div className="space-y-2">
                          <Label htmlFor="penghasilan" className="text-xs text-zinc-600">Total Penghasilan Bersih per Bulan (Rp)</Label>
                          <Input
                            id="penghasilan"
                            type="number"
                            placeholder="Contoh: 10000000"
                            value={penghasilanBulan || ""}
                            onChange={(e) => setPenghasilanBulan(Number(e.target.value) || 0)}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-xs text-zinc-500">Kewajiban Zakat Bulanan (2.5%):</span>
                          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                            Rp {Math.round(penghasilanBulan * 0.025).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            const zakat = Math.round(penghasilanBulan * 0.025);
                            router.push(`/donasi?program=Zakat&nominal=${zakat}`);
                          }}
                          disabled={penghasilanBulan <= 0}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Tunaikan Zakat Profesi
                        </Button>
                      </div>

                      {/* Form Zakat Maal (Tabungan / Harta) */}
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Zakat Maal / Simpanan Harta</h4>
                        <div className="space-y-2">
                          <Label htmlFor="tabungan" className="text-xs text-zinc-600">Total Tabungan / Deposito Mengendap 1 Tahun (Rp)</Label>
                          <Input
                            id="tabungan"
                            type="number"
                            placeholder="Contoh: 120000000"
                            value={emasGram || ""}
                            onChange={(e) => setEmasGram(Number(e.target.value) || 0)}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-xs text-zinc-500">Kewajiban Zakat Maal (2.5%):</span>
                          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                            Rp {Math.round(emasGram * 0.025).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            const zakat = Math.round(emasGram * 0.025);
                            router.push(`/donasi?program=Zakat%20Maal&nominal=${zakat}`);
                          }}
                          disabled={emasGram <= 0}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Tunaikan Zakat Maal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                            {new Date(selectedKunjungan.slot_waktu || selectedKunjungan.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

            {/* MODAL KWITANSI DONATUR RESMI */}
            <ModalKwitansi
              isOpen={!!selectedKwitansi}
              onClose={() => setSelectedKwitansi(null)}
              data={selectedKwitansi}
            />

            {/* MODAL PIAGAM APRESIASI DONATUR (E-SERTIFIKAT) */}
            <ModalSertifikatDonatur
              isOpen={!!selectedSertifikat}
              onClose={() => setSelectedSertifikat(null)}
              data={selectedSertifikat}
            />

            {/* Midtrans Snap Script untuk Quick Salur Beasiswa POTA */}
            <Script
              src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
              data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
              strategy="lazyOnload"
            />
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
