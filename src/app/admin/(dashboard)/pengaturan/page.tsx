"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, AlertCircle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "next-auth/react";

type SplitRule = {
  nama_kas: string;
  persentase: number;
};

export default function PengaturanKasPage() {
  const [rules, setRules] = useState<SplitRule[]>([
    { nama_kas: "Yayasan Tasikmalaya", persentase: 75 },
    { nama_kas: "Admin Sistem", persentase: 10 },
    { nama_kas: "IT Support", persentase: 5 },
    { nama_kas: "Operasional Website", persentase: 10 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kalkulasi total persentase
  const totalPersentase = rules.reduce((acc, curr) => acc + (Number(curr.persentase) || 0), 0);
  const isTotalValid = totalPersentase === 100;

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const session = await getSession();
        let token = session?.accessToken || localStorage.getItem("token") || undefined;
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/settings`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        
        const splitSetting = result.data?.find((s: any) => s.key === 'donasi_split_rule');
        if (splitSetting && splitSetting.value) {
          const parsed = typeof splitSetting.value === 'string' ? JSON.parse(splitSetting.value) : splitSetting.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRules(parsed);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleAddRow = () => {
    setRules([...rules, { nama_kas: "", persentase: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const handleChange = (index: number, field: keyof SplitRule, value: string | number) => {
    const newRules = [...rules];
    newRules[index] = {
      ...newRules[index],
      [field]: field === 'persentase' ? Number(value) : value
    };
    setRules(newRules);
  };

  const handleSave = async () => {
    if (!isTotalValid) {
      alert("Total persentase harus tepat 100%!");
      return;
    }

    // Validasi kosong
    if (rules.some(r => !r.nama_kas.trim())) {
      alert("Nama Kas tidak boleh ada yang kosong!");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const payload = {
        value: rules
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/settings/split-rule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      
      alert("Pengaturan Split Rule Donasi berhasil diperbarui!");
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Pengaturan Buku Kas</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola pembagian otomatis dana donasi ke berbagai laci buku kas (Split Rule).</p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-600" />
            Distribusi Otomatis (Split Rule)
          </CardTitle>
          <CardDescription>
            Setiap donasi yang masuk (via Midtrans atau Manual) akan otomatis dipecah dan dicatat ke masing-masing buku kas di bawah ini berdasarkan persentase.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
              <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400 px-2">
                <div className="col-span-7 md:col-span-8">Nama Buku Kas Target</div>
                <div className="col-span-3 md:col-span-3 text-center">Persentase (%)</div>
                <div className="col-span-2 md:col-span-1 text-center">Aksi</div>
              </div>

              {rules.map((rule, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-zinc-50/50 dark:bg-zinc-900/50 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="col-span-7 md:col-span-8">
                    <Input 
                      placeholder="Contoh: Operasional Panti" 
                      value={rule.nama_kas}
                      onChange={(e) => handleChange(index, 'nama_kas', e.target.value)}
                      className="border-zinc-200 shadow-none bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-3">
                    <div className="relative">
                      <Input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={rule.persentase || ""}
                        onChange={(e) => handleChange(index, 'persentase', e.target.value)}
                        className="border-zinc-200 shadow-none pr-8 text-center bg-white dark:bg-zinc-900 font-semibold text-emerald-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveRow(index)}
                      disabled={rules.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddRow}
                className="w-full border-dashed border-2 text-zinc-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 mt-4"
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Pembagian Kas Baru
              </Button>
            </div>
          )}

          <div className={`mt-8 p-4 rounded-xl border flex items-center justify-between ${
            isTotalValid 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300' 
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {!isTotalValid && <AlertCircle className="w-5 h-5" />}
              <div>
                <p className="font-semibold text-sm">Total Distribusi Persentase</p>
                <p className="text-xs opacity-80">
                  {isTotalValid ? "Total sudah tepat 100%. Data siap disimpan." : "Total harus tepat mencapai 100% agar sistem akuntansi seimbang."}
                </p>
              </div>
            </div>
            <div className="text-2xl font-black">
              {totalPersentase}%
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button 
          onClick={handleSave} 
          disabled={!isTotalValid || isSubmitting || isLoading} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px] shadow-lg shadow-emerald-500/20"
        >
          {isSubmitting ? "Menyimpan..." : <><Save className="mr-2 h-4 w-4" /> Simpan Pengaturan Kas</>}
        </Button>
      </div>
    </div>
  );
}
