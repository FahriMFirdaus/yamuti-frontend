"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { 
  Download, Plus, Search, TrendingUp, TrendingDown, 
  Wallet, Pencil, Trash2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BukuKasPage() {
  const [transaksiKas, setTransaksiKas] = useState<any[]>([]);
  const [entitasKas, setEntitasKas] = useState<string[]>([]);
  const [saldos, setSaldos] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("Semua Kas");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSaldos, setIsLoadingSaldos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKas, setSelectedKas] = useState<any | null>(null);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchKasLaporan = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      let token = session?.accessToken || localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/api/transaksi-keuangan`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data laporan kas");
      const result = await res.json();
      setTransaksiKas(result.data?.data || result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettingsAndSaldos = async () => {
    setIsLoadingSaldos(true);
    try {
      const session = await getSession();
      let token = session?.accessToken || localStorage.getItem("token");

      const resSettings = await fetch("http://localhost:8000/api/settings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const resultSettings = await resSettings.json();
      const splitSetting = resultSettings.data?.find((s: any) => s.key === 'donasi_split_rule');
      let kasList: string[] = ["Yayasan Tasikmalaya", "Admin Sistem", "IT Support", "Operasional Website"];
      if (splitSetting && splitSetting.value) {
        const parsed = typeof splitSetting.value === 'string' ? JSON.parse(splitSetting.value) : splitSetting.value;
        if (Array.isArray(parsed) && parsed.length > 0) {
          kasList = parsed.map((r: any) => r.nama_kas);
        }
      }
      setEntitasKas(kasList);

      const saldosObj: Record<string, number> = {};
      await Promise.all(
        kasList.map(async (kasName) => {
          try {
            const resSaldo = await fetch(`http://localhost:8000/api/kas/saldo?jenis_kas=${encodeURIComponent(kasName)}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (resSaldo.ok) {
              const dataSaldo = await resSaldo.json();
              saldosObj[kasName] = dataSaldo.data?.saldo || 0;
            }
          } catch (e) {
            console.error(`Gagal saldo ${kasName}`);
          }
        })
      );
      setSaldos(saldosObj);
    } catch (err) {
      console.error("Gagal mengambil pengaturan kas", err);
    } finally {
      setIsLoadingSaldos(false);
    }
  };

  useEffect(() => {
    fetchKasLaporan();
    fetchSettingsAndSaldos();
  }, []);

  const filteredData = transaksiKas.filter(k => {
    const matchTab = activeTab === "Semua Kas" || k.jenis_kas === activeTab;
    const matchSearch = k.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        k.nominal?.toString().includes(searchQuery);
    return matchTab && matchSearch;
  });

  const handleDeleteClick = (kas: any) => {
    setSelectedKas(kas);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedKas) return;
    try {
      const session = await getSession();
      let token = session?.accessToken || localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/api/transaksi-keuangan/${selectedKas.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error("Gagal menghapus transaksi");
      
      fetchKasLaporan();
      fetchSettingsAndSaldos(); // Refresh Saldo
      setIsDeleteDialogOpen(false);
      setSelectedKas(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus transaksi");
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER UTAMA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buku Kas & Transaksi
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Sistem Fund Accounting. Pantau saldo setiap tabungan secara transparan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-zinc-700 w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export Laporan
          </Button>
          <Link href="/admin/kas/tambah">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Tambah Transaksi Manual
            </Button>
          </Link>
        </div>
      </div>

      {/* PANEL 1: RINGKASAN SALDO BUKU KAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingSaldos ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-[150px] mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          entitasKas.map((kasName) => (
            <Card key={kasName} className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 line-clamp-1 pr-2">
                  Kas {kasName}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(saldos[kasName] || 0)}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Bersih / Tersedia
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="space-y-4">
        {/* PANEL 2: TABS DINAMIS */}
        <div className="flex flex-wrap gap-2">
          {["Semua Kas", ...entitasKas].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900 ring-2 ring-zinc-900/20 dark:ring-white/20 ring-offset-2 dark:ring-offset-black" 
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab === "Semua Kas" ? "Semua Kas" : `Kas ${tab}`}
            </button>
          ))}
        </div>

        {/* TABEL TRANSAKSI */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 p-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Cari transaksi (Deskripsi/Nominal)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-zinc-400"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80">
                <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-transparent">
                  <TableHead className="font-semibold w-[160px] pl-6">Tanggal</TableHead>
                  <TableHead className="font-semibold pl-4">Deskripsi Transaksi</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell pl-4">Buku Kas</TableHead>
                  <TableHead className="font-semibold text-right pl-4">Debit (Masuk)</TableHead>
                  <TableHead className="font-semibold text-right pl-4">Kredit (Keluar)</TableHead>
                  <TableHead className="font-semibold text-center w-[120px] pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-zinc-100 dark:border-zinc-800/50">
                      <TableCell className="pl-6"><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell className="pl-4"><Skeleton className="h-4 w-[250px]" /></TableCell>
                      <TableCell className="hidden lg:table-cell pl-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right pl-4"><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                      <TableCell className="text-right pl-4"><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-red-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        <span>{error}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                      Belum ada laporan transaksi untuk tabungan kas ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((kas: any) => {
                    const isSistem = !!kas.donasi_id; 
                    
                    return (
                      <TableRow key={kas.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <TableCell className="text-sm font-medium text-zinc-600 dark:text-zinc-400 pl-6 align-top pt-5">
                          {kas.created_at ? new Date(kas.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </TableCell>
                        <TableCell className="pl-4 align-top pt-4">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{kas.deskripsi}</p>
                          {isSistem ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-600 mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-sm dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                              ✓ Auto Split (Sistem)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-blue-600 mt-1.5 bg-blue-50 px-2 py-0.5 rounded-sm dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                              ◿ Manual
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell pl-4 align-top pt-5">
                          <Badge variant="outline" className="text-zinc-600 dark:text-zinc-300 font-medium">
                            {kas.jenis_kas || 'Umum'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400 pl-4 align-top pt-5">
                          {kas.tipe_transaksi === 'Debit' ? (
                            <div className="flex items-center justify-end gap-1.5 font-mono">
                              <TrendingUp className="w-3.5 h-3.5" /> {formatRupiah(kas.nominal)}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 dark:text-red-400 pl-4 align-top pt-5">
                          {kas.tipe_transaksi === 'Kredit' ? (
                            <div className="flex items-center justify-end gap-1.5 font-mono">
                              <TrendingDown className="w-3.5 h-3.5" /> {formatRupiah(kas.nominal)}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-center pr-6 align-top pt-4">
                          {isSistem ? (
                            <div className="pt-1 flex justify-center">
                              <span className="inline-flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-semibold px-2 py-1 bg-zinc-100 rounded-md dark:bg-zinc-800/50 cursor-not-allowed">
                                🔒 Read-Only
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                onClick={() => handleDeleteClick(kas)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* MODAL HAPUS TRANSAKSI */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-red-200 dark:border-red-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Konfirmasi Hapus Transaksi
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus transaksi manual <strong>{selectedKas?.deskripsi}</strong> sebesar <strong>{selectedKas && formatRupiah(selectedKas.nominal)}</strong>? Tindakan ini dapat merusak laporan saldo di tab terkait jika tidak berhati-hati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 rounded-full shadow-md shadow-red-500/20">
              Ya, Hapus Transaksi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
