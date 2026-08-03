"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { getSession } from "next-auth/react";

type KampanyeForm = {
  judul: string;
  deskripsi: string;
  target_donasi: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status: string;
};

export default function TambahKampanyePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const shouldContinueRef = useRef(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<KampanyeForm>();

  const onSubmit = async (data: KampanyeForm) => {
    setIsSubmitting(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const formData = new FormData();
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan data kampanye");
      }

      if (shouldContinueRef.current) {
        reset();
        setSelectedFile(null);
        alert("Data program berhasil ditambahkan. Silakan isi data selanjutnya.");
        window.scrollTo(0, 0);
      } else {
        router.push("/admin/program");
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/program">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Tambah Program</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Buat program kebaikan atau donasi baru.</p>
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
                    placeholder="Contoh: Wakaf Pembebasan Lahan" 
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
                    placeholder="Contoh: 50000000" 
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
                    placeholder="Tuliskan alasan dan tujuan dari program ini secara lengkap..."
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
                  <Label htmlFor="status" className="font-semibold">Status Awal Program</Label>
                  <select 
                    id="status" 
                    {...register("status")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="aktif">Aktif (Langsung Tayang)</option>
                    <option value="draft">Draft (Belum Tayang)</option>
                    <option value="selesai">Selesai (Tutup)</option>
                  </select>
                </div>

                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
                  <Label className="font-semibold">Thumbnail / Gambar Utama</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="cursor-pointer file:text-red-600" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-zinc-500">Format JPG/PNG maksimal 2MB. Menggunakan rasio 16:9 disarankan.</p>
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                variant="secondary"
                className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => shouldContinueRef.current = true}
              >
                <Save className="mr-2 h-4 w-4" /> Simpan & Lanjut Tambah
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                onClick={() => shouldContinueRef.current = false}
              >
                {isSubmitting ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Simpan & Selesai</>}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
