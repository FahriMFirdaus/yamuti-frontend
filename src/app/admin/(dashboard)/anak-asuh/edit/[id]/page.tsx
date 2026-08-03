"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  status_keluarga: z.enum(["Yatim", "Piatu", "Yatim Piatu", "Dhuafa"], { message: "Status keluarga wajib dipilih" }),
  tingkat_pendidikan: z.string().optional(),
  nama_sekolah: z.string().optional(),
  tanggal_masuk: z.string().min(1, "Tanggal masuk wajib diisi"),
  golongan_darah: z.string().optional(),
  riwayat_penyakit: z.string().optional(),
  catatan_khusus: z.string().optional(),
});

export default function EditAnakAsuhPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Aktif",
      kategori_bayi: false,
    }
  });

  useEffect(() => {
    const fetchExistingData = async () => {
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
        if (!res.ok) throw new Error("Gagal memuat data");
        const result = await res.json();
        const existingData = result.data;
        reset({
          nama: existingData.nama || "",
          nik: existingData.nik || "",
          no_kk: existingData.no_kk || "",
          no_akte: existingData.no_akte || "",
          tempat_lahir: existingData.tempat_lahir || "",
          jenis_kelamin: existingData.jenis_kelamin || "",
          tanggal_lahir: existingData.tanggal_lahir ? existingData.tanggal_lahir.split('T')[0] : "",
          status: existingData.status || "Aktif",
          kategori_bayi: String(existingData.kategori_bayi) === 'true' || existingData.kategori_bayi === true,
          status_keluarga: existingData.status_keluarga || "Yatim",
          tingkat_pendidikan: existingData.tingkat_pendidikan || "",
          nama_sekolah: existingData.nama_sekolah || "",
          tanggal_masuk: existingData.tanggal_masuk ? existingData.tanggal_masuk.split('T')[0] : "",
          golongan_darah: existingData.golongan_darah || "",
          riwayat_penyakit: existingData.riwayat_penyakit || "",
          catatan_khusus: existingData.catatan_khusus || "",
        });
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    if (params.id) {
      fetchExistingData();
    }
  }, [params.id, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }
      
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Trick for Laravel to handle PUT via POST
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'kategori_bayi') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, String(value));
        }
      });
      
      if (selectedFile) {
        formData.append('foto_identitas', selectedFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh/${params.id}`, {
        method: "POST", // using POST with _method=PUT
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memperbarui data anak asuh");
      }

      alert("Data berhasil diperbarui!");
      router.push(`/admin/anak-asuh/${params.id}`);
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
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Edit Anak Asuh</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Memperbarui data ID: {params.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tempat_lahir" className="font-semibold">Tempat Lahir *</Label>
                    <Input id="tempat_lahir" {...register("tempat_lahir")} className={cn(errors.tempat_lahir && "border-red-500")} />
                    {errors.tempat_lahir && <p className="text-xs text-red-500">{errors.tempat_lahir.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir" className="font-semibold">Tanggal Lahir *</Label>
                    <Input id="tanggal_lahir" type="date" {...register("tanggal_lahir")} className={cn(errors.tanggal_lahir && "border-red-500")} />
                    {errors.tanggal_lahir && <p className="text-xs text-red-500">{errors.tanggal_lahir.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin" className="font-semibold">Jenis Kelamin *</Label>
                    <select id="jenis_kelamin" {...register("jenis_kelamin")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-semibold">Status Panti *</Label>
                    <select id="status" {...register("status")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Aktif">Aktif</option>
                      <option value="Lulus">Lulus</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="kategori_bayi" {...register("kategori_bayi")} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600" />
                    <Label htmlFor="kategori_bayi" className="font-semibold cursor-pointer">Tandai sebagai Bayi/Balita</Label>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-6">
                  <Label className="font-semibold">Foto Identitas (Ubah Jika Perlu)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
              <CardDescription>Lengkapi data administratif & profil kesehatan.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status_keluarga" className="font-semibold">Status Keluarga *</Label>
                  <select id="status_keluarga" {...register("status_keluarga")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Yatim">Yatim</option>
                    <option value="Piatu">Piatu</option>
                    <option value="Yatim Piatu">Yatim Piatu</option>
                    <option value="Dhuafa">Dhuafa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_masuk" className="font-semibold">Tanggal Masuk Panti *</Label>
                  <Input id="tanggal_masuk" type="date" {...register("tanggal_masuk")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tingkat_pendidikan" className="font-semibold">Tingkat Pendidikan</Label>
                  <select id="tingkat_pendidikan" {...register("tingkat_pendidikan")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                  <Label htmlFor="nama_sekolah" className="font-semibold">Nama Sekolah</Label>
                  <Input id="nama_sekolah" {...register("nama_sekolah")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="golongan_darah" className="font-semibold">Golongan Darah</Label>
                  <select id="golongan_darah" {...register("golongan_darah")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Pilih Golongan Darah</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="Belum Tahu">Belum Tahu</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riwayat_penyakit" className="font-semibold">Riwayat Penyakit</Label>
                  <Input id="riwayat_penyakit" {...register("riwayat_penyakit")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catatan_khusus" className="font-semibold">Catatan Khusus</Label>
                  <textarea id="catatan_khusus" {...register("catatan_khusus")} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Informasi tambahan mengenai anak..." />
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
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
              {isSubmitting ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Perbarui Data</>}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
