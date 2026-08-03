"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, HandCoins, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { getSession } from "next-auth/react";

type ManualDonasiForm = {
  nama_donatur: string;
  no_whatsapp: string;
  nominal: number;
  payment_type: "CASH" | "MANUAL_TRANSFER";
  kampanye_id: string; // Optional
  keterangan: string;
};

export default function TambahDonasiManualPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<ManualDonasiForm>({
    defaultValues: {
      payment_type: "CASH",
    }
  });

  useEffect(() => {
    // Fetch daftar program aktif untuk dropdown
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye`);
        const result = await res.json();
        // Fallback untuk antisipasi pagination
        const data = result.data?.data || result.data || [];
        setPrograms(data.filter((p: any) => p.status?.toLowerCase() === 'aktif'));
      } catch (err) {
        console.error("Gagal mengambil daftar program", err);
      }
    };
    fetchPrograms();
  }, []);

  const onSubmit = async (data: ManualDonasiForm) => {
    setIsSubmitting(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      // Pastikan nominal adalah angka mutlak
      const payload = {
        nama_donatur: data.nama_donatur || "Hamba Allah",
        no_whatsapp: data.no_whatsapp,
        gross_amount: data.nominal,
        payment_type: data.payment_type,
        kampanye_id: data.kampanye_id || null,
        keterangan: data.keterangan || "Donasi Manual via Admin"
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/donasi/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan donasi manual");
      }

      alert("Donasi manual berhasil ditambahkan dan uang telah masuk otomatis ke Buku Kas Yayasan!");
      router.push("/admin/donasi");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/donasi">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Penerimaan Donasi Manual (Pintu B)</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Catat uang tunai atau transfer manual yang langsung lunas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
            <CardTitle className="text-lg">Detail Transaksi</CardTitle>
            <CardDescription>Semua donasi yang dicatat di sini otomatis memicu Split Rule dan masuk ke Buku Kas.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 md:col-span-2 p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                <Label className="font-semibold text-blue-900 dark:text-blue-300">Metode Penerimaan Uang *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Label 
                    className="flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all border-zinc-200 hover:border-blue-400 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 [&:has([data-state=checked])]:border-blue-600 [&:has([data-state=checked])]:bg-white dark:[&:has([data-state=checked])]:border-blue-500 shadow-sm"
                  >
                    <input 
                      type="radio" 
                      value="CASH" 
                      {...register("payment_type")} 
                      className="peer sr-only" 
                      data-state="checked" // just for styling selector logic workaround if needed, usually react-hook-form handles standard inputs well
                    />
                    <HandCoins className="w-8 h-8 text-zinc-500 peer-checked:text-blue-600" />
                    <span className="font-semibold peer-checked:text-blue-600">Uang Tunai (CASH)</span>
                    <span className="text-xs text-center text-zinc-500">Diterima langsung secara fisik</span>
                  </Label>

                  <Label 
                    className="flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all border-zinc-200 hover:border-blue-400 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 [&:has([data-state=checked])]:border-blue-600 [&:has([data-state=checked])]:bg-white dark:[&:has([data-state=checked])]:border-blue-500 shadow-sm"
                  >
                    <input 
                      type="radio" 
                      value="MANUAL_TRANSFER" 
                      {...register("payment_type")} 
                      className="peer sr-only" 
                    />
                    <Building className="w-8 h-8 text-zinc-500 peer-checked:text-blue-600" />
                    <span className="font-semibold peer-checked:text-blue-600">Transfer Manual</span>
                    <span className="text-xs text-center text-zinc-500">Transfer bank di luar Midtrans</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_donatur" className="font-semibold">Nama Donatur</Label>
                <Input 
                  id="nama_donatur" 
                  placeholder="Opsional (Isi Hamba Allah jika anonim)" 
                  {...register("nama_donatur")} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_whatsapp" className="font-semibold">No. WhatsApp *</Label>
                <Input 
                  id="no_whatsapp" 
                  placeholder="Contoh: 08123456789" 
                  {...register("no_whatsapp", { 
                    required: "Nomor WhatsApp wajib diisi",
                    maxLength: { value: 15, message: "Maksimal 15 karakter" },
                    pattern: { value: /^[0-9+]+$/, message: "Hanya boleh angka dan tanda +" }
                  })} 
                  className={cn(errors.no_whatsapp && "border-red-500")}
                />
                {errors.no_whatsapp && <p className="text-xs text-red-500">{errors.no_whatsapp.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nominal" className="font-semibold">Nominal Donasi (Rp) *</Label>
                <Input 
                  id="nominal" 
                  type="number" 
                  placeholder="Contoh: 150000" 
                  {...register("nominal", { required: "Nominal wajib diisi", min: { value: 1000, message: "Minimal Rp 1.000" } })} 
                  className={cn("text-lg font-bold tracking-widest", errors.nominal && "border-red-500")} 
                />
                {errors.nominal && <p className="text-xs text-red-500">{errors.nominal.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kampanye_id" className="font-semibold">Tujuan Program</Label>
                <select 
                  id="kampanye_id" 
                  {...register("kampanye_id")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Donasi Umum (Yayasan) --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.judul}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500">Biarkan Donasi Umum jika tidak terkait program spesifik.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="keterangan" className="font-semibold">Keterangan Tambahan</Label>
                <Input 
                  id="keterangan" 
                  placeholder="Contoh: Titipan dari keluarga Ibu Wati" 
                  {...register("keterangan")} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/donasi">
            <Button type="button" variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]">
            {isSubmitting ? "Memproses..." : <><Save className="mr-2 h-4 w-4" /> Simpan Donasi Lunas</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
