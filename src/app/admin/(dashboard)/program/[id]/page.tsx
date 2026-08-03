"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, AlertCircle, Target, Calendar, Clock, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSession } from "next-auth/react";
import Image from "next/image";

export default function DetailKampanyePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const session = await getSession();
        let token = session?.accessToken;
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("token");
        }
        
        const res = await fetch(`http://localhost:8000/api/kampanye/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) throw new Error("Gagal mengambil detail kampanye");
        
        const result = await res.json();
        setData(result.data || result); // Mengatasi perbedaan format response
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const confirmDelete = async () => {
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      
      const res = await fetch(`http://localhost:8000/api/kampanye/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error("Gagal menghapus data");
      
      router.push("/admin/program");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data kampanye");
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-1 h-[300px] rounded-3xl" />
          <Skeleton className="md:col-span-2 h-[300px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Data Tidak Ditemukan</h2>
        <p>{error || "Kampanye mungkin telah dihapus."}</p>
        <Link href="/admin/program" className="mt-4">
          <Button variant="outline">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const terkumpul = parseFloat(data.donasi_sum_gross_amount) || 0;
  const target = parseFloat(data.target_donasi) || 0;
  const progress = target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0;
  const isSelesai = progress >= 100 || data.status?.toLowerCase() === 'selesai';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/program">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border-zinc-200 hover:bg-zinc-100 shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1">{data.judul}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">ID Program: #{data.id}</p>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Dibuat: {new Date(data.created_at).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/program/edit/${data.id}`}>
            <Button variant="outline" className="rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="rounded-full shadow-sm text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Visual & Progress */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
            <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800">
              {data.thumbnail ? (
                <Image src={data.thumbnail} alt={data.judul} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                  <Target className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">Tidak ada foto sampul</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                {isSelesai ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg px-3 py-1 text-sm">Selesai</Badge>
                ) : data.status?.toLowerCase() === 'aktif' ? (
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600 border-none shadow-lg px-3 py-1 text-sm">Aktif</Badge>
                ) : (
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none shadow-lg px-3 py-1 text-sm capitalize">{data.status || 'Draft'}</Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Terkumpul</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatRupiah(terkumpul)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Target</p>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatRupiah(target)}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner mt-4 mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isSelesai ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span>{progress}% Tercapai</span>
                    {target - terkumpul > 0 && !isSelesai && (
                      <span>Kekurangan: {formatRupiah(target - terkumpul)}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Detail Informasi */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl h-full">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-red-600" />
                Deskripsi Program
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300">
                <p className="whitespace-pre-wrap leading-relaxed">{data.deskripsi || "Tidak ada deskripsi yang ditambahkan untuk program ini."}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tanggal Mulai</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {data.tanggal_mulai ? new Date(data.tanggal_mulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tanggal Berakhir</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {data.tanggal_berakhir ? new Date(data.tanggal_berakhir).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanpa Batas Waktu'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-red-200 dark:border-red-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Konfirmasi Penghapusan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus program <strong>{data.judul}</strong>? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data yang terkait dengannya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 rounded-full shadow-md shadow-red-500/20">
              Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
