"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "next-auth/react";

type KampanyeForm = {
  judul: string;
  deskripsi: string;
  target_donasi: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status: string;
};

export default function EditKampanyePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<KampanyeForm>();

  useEffect(() => {
    if (!id) return;
    
    const fetchKampanye = async () => {
      setIsLoading(true);
      try {
        const session = await getSession();
        let token = session?.accessToken;
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("token") || undefined;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (!res.ok) throw new Error("Gagal mengambil data kampanye");
        
        const result = await res.json();
        const data = result.data || result; // Menyesuaikan format JSON
        
        // Populate form
        reset({
          judul: data.judul,
          deskripsi: data.deskripsi,
          target_donasi: data.target_donasi,
          tanggal_mulai: data.tanggal_mulai ? new Date(data.tanggal_mulai).toISOString().split('T')[0] : "",
          tanggal_berakhir: data.tanggal_berakhir ? new Date(data.tanggal_berakhir).toISOString().split('T')[0] : "",
          status: data.status?.toLowerCase(),
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKampanye();
  }, [id, reset]);

  const onSubmit = async (data: KampanyeForm) => {
    setIsSubmitting(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      // Laravel menerima _method PUT pada endpoint POST saat menggunakan FormData untuk file
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("judul", data.judul);
      formData.append("deskripsi", data.deskripsi || "");
      formData.append("target_donasi", String(data.target_donasi));
      formData.append("tanggal_mulai", data.tanggal_mulai);
      if (data.tanggal_berakhir) {
        formData.append("tanggal_berakhir", data.tanggal_berakhir);
      }
      formData.append("status", data.status || "aktif");
      
      if (selectedFile) {
        formData.append("gambar", selectedFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/${id}`, {
        method: "POST", // Karena kita menggunakan trik _method=PUT untuk formdata laravel
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan perubahan");
      }

      router.push("/admin/program");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
        <p>{error}</p>
        <Link href="/admin/program" className="mt-4">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/program">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Edit Program</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Memperbarui data ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Kolom Kiri: Informasi Utama */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Informasi Utama</CardTitle>
              <CardDescription>Detail inti dari program kebaikan.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="judul" className="font-semibold">Judul Program *</Label>
                  <Input 
                    id="judul" 
                    {...register("judul", { required: "Judul wajib diisi" })} 
                    className={cn(errors.judul && "border-red-500")} 
                  />
                  {errors.judul && <p className="text-xs text-red-500">{errors.judul.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_donasi" className="font-semibold">Target Donasi (Rp) *</Label>
                  <Input 
                    id="target_donasi" 
                    type="number" 
                    {...register("target_donasi", { required: "Target donasi wajib diisi", min: 1000 })} 
                    className={cn(errors.target_donasi && "border-red-500")} 
                  />
                  {errors.target_donasi && <p className="text-xs text-red-500">{errors.target_donasi.message}</p>}
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <Label htmlFor="deskripsi" className="font-semibold mb-2">Deskripsi Program *</Label>
                  <textarea 
                    id="deskripsi" 
                    {...register("deskripsi", { required: "Deskripsi wajib diisi" })} 
                    className={cn(
                      "flex flex-1 min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      errors.deskripsi && "border-red-500"
                    )}
                  />
                  {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kolom Kanan: Waktu & Media */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Pengaturan Tambahan</CardTitle>
              <CardDescription>Jadwal tayang, status, dan gambar kover.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_mulai" className="font-semibold">Tanggal Mulai *</Label>
                    <Input 
                      id="tanggal_mulai" 
                      type="date" 
                      {...register("tanggal_mulai", { required: "Tanggal mulai wajib diisi" })} 
                      className={cn(errors.tanggal_mulai && "border-red-500")} 
                    />
                    {errors.tanggal_mulai && <p className="text-xs text-red-500">{errors.tanggal_mulai.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_berakhir" className="font-semibold">Tanggal Berakhir</Label>
                    <Input 
                      id="tanggal_berakhir" 
                      type="date" 
                      {...register("tanggal_berakhir")} 
                    />
                    <p className="text-xs text-zinc-500">Biarkan kosong jika tanpa batas waktu.</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
                  <Label htmlFor="status" className="font-semibold">Status Program</Label>
                  <select 
                    id="status" 
                    {...register("status")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="draft">Draft</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
                  <Label className="font-semibold">Perbarui Thumbnail (Opsional)</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="cursor-pointer file:text-red-600" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-zinc-500">Biarkan kosong jika tidak ingin mengubah foto program saat ini.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Link href="/admin/program">
              <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
              {isSubmitting ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Perbarui Data</>}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
