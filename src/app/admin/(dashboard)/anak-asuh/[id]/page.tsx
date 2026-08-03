"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, MapPin, Hash, CheckCircle2, FileText, Activity, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSession } from "next-auth/react";

export default function DetailAnakAsuhPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const session = await getSession();
        let token = session?.accessToken;
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("token") || undefined;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (!res.ok) throw new Error("Gagal mengambil detail anak asuh");
        const result = await res.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const confirmDelete = async () => {
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh/${params.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!res.ok) throw new Error("Gagal menghapus data");
      router.push("/admin/anak-asuh");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Data Tidak Ditemukan</h2>
          <p className="text-zinc-500 mt-1">{error || "ID Anak Asuh tidak valid atau telah dihapus."}</p>
        </div>
        <Link href="/admin/anak-asuh">
          <Button variant="outline" className="mt-4">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const defaultAvatar = data.jenis_kelamin?.toLowerCase() === 'perempuan' 
    ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn&backgroundColor=ffdfbf' 
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/anak-asuh">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Detail Anak Asuh</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Link href={`/admin/anak-asuh/edit/${data.id}`}>
            <Button variant="outline" className="bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Data
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil Singkat & Foto */}
        <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden flex flex-col">
          <div className="h-32 bg-gradient-to-br from-red-600 to-amber-500 w-full relative" />
          <CardContent className="pt-0 flex flex-col items-center flex-1">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-zinc-100 -mt-16 shadow-lg z-10 relative">
              <Image 
                src={data.foto_identitas || defaultAvatar} 
                alt={data.nama} 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <h3 className="text-2xl font-bold text-center mt-4 text-zinc-900 dark:text-zinc-100">{data.nama}</h3>
            
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {(String(data.kategori_bayi) === 'true' || data.kategori_bayi === true) ? (
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/20">Bayi/Balita</Badge>
              ) : (
                <Badge variant="outline" className="border-zinc-200 text-zinc-700 bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:bg-zinc-800/50">Anak-anak</Badge>
              )}
              {data.status?.toUpperCase() === "AKTIF" ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none dark:bg-green-900/30 dark:text-green-400">Status: Aktif</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none dark:bg-amber-900/30 dark:text-amber-400 capitalize">Status: {data.status?.toLowerCase()}</Badge>
              )}
            </div>

            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Hash className="w-4 h-4" />
                <span>NIK: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{data.nik || "-"}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <FileText className="w-4 h-4" />
                <span>KK: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{data.no_kk || "-"}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <FileText className="w-4 h-4" />
                <span>Akte: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{data.no_akte || "-"}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Detail Lengkap */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-red-600" />
                Informasi Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{data.nama}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{data.jenis_kelamin}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tempat Lahir</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{data.tempat_lahir || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tanggal Lahir</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Status Keluarga</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{data.status_keluarga || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Golongan Darah</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{data.golongan_darah || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-amber-500" />
                Status Pembinaan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Kategori Usia</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {String(data.kategori_bayi) === 'true' || data.kategori_bayi === true ? 'Bayi/Balita' : 'Anak-anak'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Status Saat Ini</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{data.status || 'Aktif'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tanggal Masuk Panti</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.tanggal_masuk ? new Date(data.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tingkat Pendidikan</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.tingkat_pendidikan || "-"} {data.nama_sekolah ? `(${data.nama_sekolah})` : ""}
                </p>
              </div>
              {data.riwayat_penyakit && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Riwayat Penyakit</p>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30 text-red-700 dark:text-red-400">
                    {data.riwayat_penyakit}
                  </div>
                </div>
              )}
              {data.catatan_khusus && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Catatan Khusus</p>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap min-h-[80px]">
                    {data.catatan_khusus}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-red-200 dark:border-red-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Konfirmasi Penghapusan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data anak asuh <strong>{data.nama}</strong>? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data yang terkait dengannya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 rounded-full shadow-md shadow-red-500/20">
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
