"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { getSession } from "next-auth/react";

// Schema validasi
const formSchema = z.object({
  nama: z.string().min(3, "Nama wajib diisi"),
  nik: z.string().min(16, "NIK harus 16 digit"),
  no_kk: z.string().min(16, "No KK harus 16 digit"),
  no_akte: z.string().min(1, "No Akte wajib diisi"),
  tempat_lahir: z.string().min(3, "Tempat lahir wajib diisi"),
  jenis_kelamin: z.enum(["Laki-laki", "Perempuan"]),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  status: z.string(),
  kategori_bayi: z.boolean(),
  status_keluarga: z.enum(["Yatim", "Piatu", "Yatim Piatu", "Dhuafa"], { required_error: "Status keluarga wajib dipilih" }),
  tingkat_pendidikan: z.string().optional(),
  nama_sekolah: z.string().optional(),
  tanggal_masuk: z.string().min(1, "Tanggal masuk wajib diisi"),
  golongan_darah: z.string().optional(),
  riwayat_penyakit: z.string().optional(),
  catatan_khusus: z.string().optional(),
});

export default function TambahAnakAsuhPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const shouldContinueRef = useRef(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Aktif",
      kategori_bayi: false,
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        // format kategori_bayi as boolean string compatible with backend if needed, or 1/0
        if (key === 'kategori_bayi') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, String(value));
        }
      });
      
      if (selectedFile) {
        formData.append('foto_identitas', selectedFile);
      }

      const res = await fetch("http://localhost:8000/api/anak-asuh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan data anak asuh");
      }

      alert("Data berhasil ditambahkan!");
      
      if (shouldContinueRef.current) {
        reset();
        setSelectedFile(null);
        window.scrollTo(0, 0); // Scroll to top for new entry
      } else {
        router.push("/admin/anak-asuh");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/anak-asuh">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Tambah Anak Asuh</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Masukkan data lengkap anak asuh yang baru terdaftar.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Kolom Kiri: Data Diri */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Formulir Data Diri</CardTitle>
              <CardDescription>Kolom bertanda bintang (*) wajib diisi.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="font-semibold">Nama Lengkap *</Label>
                <Input id="nama" {...register("nama")} className={cn(errors.nama && "border-red-500")} />
                {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nik" className="font-semibold">NIK *</Label>
                <Input id="nik" type="number" {...register("nik")} className={cn(errors.nik && "border-red-500")} />
                {errors.nik && <p className="text-xs text-red-500">{errors.nik.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_kk" className="font-semibold">No Kartu Keluarga *</Label>
                <Input id="no_kk" type="number" {...register("no_kk")} className={cn(errors.no_kk && "border-red-500")} />
                {errors.no_kk && <p className="text-xs text-red-500">{errors.no_kk.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_akte" className="font-semibold">No Akte Kelahiran *</Label>
                <Input id="no_akte" {...register("no_akte")} className={cn(errors.no_akte && "border-red-500")} />
                {errors.no_akte && <p className="text-xs text-red-500">{errors.no_akte.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempat_lahir" className="font-semibold">Tempat Lahir *</Label>
                <Input id="tempat_lahir" {...register("tempat_lahir")} className={cn(errors.tempat_lahir && "border-red-500")} />
                {errors.tempat_lahir && <p className="text-xs text-red-500">{errors.tempat_lahir.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tanggal_lahir" className="font-semibold">Tanggal Lahir *</Label>
                  <Input id="tanggal_lahir" type="date" {...register("tanggal_lahir")} className={cn(errors.tanggal_lahir && "border-red-500")} />
                  {errors.tanggal_lahir && <p className="text-xs text-red-500">{errors.tanggal_lahir.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jenis_kelamin" className="font-semibold">Jenis Kelamin *</Label>
                  <select 
                    id="jenis_kelamin" 
                    {...register("jenis_kelamin")}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      errors.jenis_kelamin && "border-red-500"
                    )}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  {errors.jenis_kelamin && <p className="text-xs text-red-500">{errors.jenis_kelamin.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="kategori_bayi" {...register("kategori_bayi")} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600" />
                  <Label htmlFor="kategori_bayi" className="font-semibold cursor-pointer">Tandai sebagai Bayi/Balita</Label>
                </div>
              </div>
              
              <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
                <Label className="font-semibold">Pas Foto Identitas</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer file:text-red-600" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-zinc-500">Format JPG/PNG maksimal 2MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Informasi Tambahan */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
            <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
            <CardDescription>Lengkapi data administratif & profil kesehatan.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="status_keluarga" className="font-semibold">Status Keluarga *</Label>
                <select 
                  id="status_keluarga" 
                  {...register("status_keluarga")}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    errors.status_keluarga && "border-red-500"
                  )}
                >
                  <option value="">Pilih Status</option>
                  <option value="Yatim">Yatim</option>
                  <option value="Piatu">Piatu</option>
                  <option value="Yatim Piatu">Yatim Piatu</option>
                  <option value="Dhuafa">Dhuafa</option>
                </select>
                {errors.status_keluarga && <p className="text-xs text-red-500">{errors.status_keluarga.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_masuk" className="font-semibold">Tanggal Masuk Panti *</Label>
                <Input id="tanggal_masuk" type="date" {...register("tanggal_masuk")} className={cn(errors.tanggal_masuk && "border-red-500")} />
                {errors.tanggal_masuk && <p className="text-xs text-red-500">{errors.tanggal_masuk.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tingkat_pendidikan" className="font-semibold">Tingkat Pendidikan</Label>
                <select 
                  id="tingkat_pendidikan" 
                  {...register("tingkat_pendidikan")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="Belum Sekolah">Belum Sekolah</option>
                  <option value="TK/PAUD">TK/PAUD</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="Kuliah">Kuliah</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_sekolah" className="font-semibold">Nama Sekolah (Opsional)</Label>
                <Input id="nama_sekolah" {...register("nama_sekolah")} placeholder="Contoh: SDN 1 Tasikmalaya" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="golongan_darah" className="font-semibold">Golongan Darah</Label>
                <select 
                  id="golongan_darah" 
                  {...register("golongan_darah")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Pilih Golongan Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Belum Tahu">Belum Tahu</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="riwayat_penyakit" className="font-semibold">Riwayat Penyakit (Opsional)</Label>
                <Input id="riwayat_penyakit" {...register("riwayat_penyakit")} placeholder="Contoh: Asma, Alergi Debu" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="catatan_khusus" className="font-semibold">Catatan Khusus (Opsional)</Label>
                <textarea 
                  id="catatan_khusus" 
                  {...register("catatan_khusus")} 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Informasi tambahan mengenai anak..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Link href="/admin/anak-asuh">
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
