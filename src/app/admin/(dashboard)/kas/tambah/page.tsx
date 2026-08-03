"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { getSession } from "next-auth/react";

type ManualKasForm = {
  deskripsi: string;
  nominal: number;
  tipe_transaksi: "Debit" | "Kredit";
  jenis_kas: string;
};

export default function TambahKasManualPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bukuKasOptions, setBukuKasOptions] = useState<string[]>(["Yayasan Tasikmalaya"]);

  const { register, handleSubmit, formState: { errors } } = useForm<ManualKasForm>({
    defaultValues: {
      tipe_transaksi: "Kredit",
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const session = await getSession();
        let token = session?.accessToken || localStorage.getItem("token") || undefined;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/settings`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        
        const splitSetting = result.data?.find((s: any) => s.key === 'donasi_split_rule');
        if (splitSetting && splitSetting.value) {
          const rules = typeof splitSetting.value === 'string' ? JSON.parse(splitSetting.value) : splitSetting.value;
          if (Array.isArray(rules)) {
            setBukuKasOptions(rules.map((r: any) => r.nama_kas));
          }
        } else {
          setBukuKasOptions(["Yayasan Tasikmalaya", "Admin Sistem", "IT Support", "Operasional Website"]);
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan buku kas", err);
      }
    };
    fetchSettings();
  }, []);

  const onSubmit = async (data: ManualKasForm) => {
    setIsSubmitting(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/transaksi-keuangan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan transaksi");
      }

      router.push("/admin/kas");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/kas">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Tambah Transaksi Manual
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Pencairan gaji/biaya, atau catat pengeluaran operasional lain.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
            <CardTitle className="text-lg">Detail Transaksi</CardTitle>
            <CardDescription>Pilih Buku Kas mana yang uangnya akan dikeluarkan (dicairkan).</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6">
              
              <div className="space-y-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800">
                <Label className="font-semibold text-zinc-900 dark:text-zinc-100">Tipe Transaksi *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Label 
                    className="flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all border-zinc-200 hover:border-red-400 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 [&:has(:checked)]:border-red-600 [&:has(:checked)]:bg-red-50 dark:[&:has(:checked)]:bg-red-900/20 shadow-sm"
                  >
                    <input 
                      type="radio" 
                      value="Kredit" 
                      {...register("tipe_transaksi")} 
                      className="peer sr-only" 
                    />
                    <TrendingDown className="w-6 h-6 text-zinc-400 peer-checked:text-red-600" />
                    <span className="font-semibold text-zinc-600 peer-checked:text-red-600">Pengeluaran (Kredit)</span>
                  </Label>

                  <Label 
                    className="flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all border-zinc-200 hover:border-emerald-400 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 [&:has(:checked)]:border-emerald-600 [&:has(:checked)]:bg-emerald-50 dark:[&:has(:checked)]:bg-emerald-900/20 shadow-sm"
                  >
                    <input 
                      type="radio" 
                      value="Debit" 
                      {...register("tipe_transaksi")} 
                      className="peer sr-only" 
                    />
                    <TrendingUp className="w-6 h-6 text-zinc-400 peer-checked:text-emerald-600" />
                    <span className="font-semibold text-zinc-600 peer-checked:text-emerald-600">Pemasukan (Debit)</span>
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jenis_kas" className="font-semibold">Pilih Buku Kas *</Label>
                  <select 
                    id="jenis_kas" 
                    {...register("jenis_kas", { required: "Buku Kas wajib dipilih" })}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      errors.jenis_kas && "border-red-500"
                    )}
                  >
                    <option value="">-- Pilih Kas --</option>
                    {bukuKasOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.jenis_kas && <p className="text-xs text-red-500">{errors.jenis_kas.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominal" className="font-semibold">Nominal (Rp) *</Label>
                  <Input 
                    id="nominal" 
                    type="number" 
                    placeholder="Contoh: 50000" 
                    {...register("nominal", { required: "Nominal wajib diisi", min: 100, valueAsNumber: true })} 
                    className={cn("font-bold tracking-wider", errors.nominal && "border-red-500")} 
                  />
                  {errors.nominal && <p className="text-xs text-red-500">{errors.nominal.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi" className="font-semibold">Deskripsi Transaksi *</Label>
                <Input 
                  id="deskripsi" 
                  placeholder="Contoh: Pembayaran listrik atau Pencairan Gaji Admin" 
                  {...register("deskripsi", { required: "Deskripsi wajib diisi" })} 
                  className={cn(errors.deskripsi && "border-red-500")}
                />
                {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi.message}</p>}
              </div>

            </div>
          </CardContent>
          <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50 p-4 flex justify-end gap-2">
            <Link href="/admin/kas">
              <Button type="button" variant="ghost" disabled={isSubmitting}>Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isSubmitting ? "Menyimpan..." : (
                <><Save className="mr-2 h-4 w-4" /> Simpan Transaksi</>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
