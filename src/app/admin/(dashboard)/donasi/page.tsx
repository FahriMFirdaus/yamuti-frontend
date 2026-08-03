"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Download, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { getSession } from "next-auth/react";

export default function DonasiPage() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonasi = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      
      const res = await fetch(`http://localhost:8000/api/donasi?page=${currentPage}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!res.ok) throw new Error("Gagal mengambil data donasi");
      const result = await res.json();
      
      if (result.data && result.data.data) {
        setData(result.data.data);
        setCurrentPage(result.data.current_page);
        setTotalPages(result.data.last_page);
      } else {
        setData(result.data || []);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonasi();
  }, [currentPage]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Daftar Donasi Masuk
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pantau aliran dana masuk dari donatur (Midtrans & Manual).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-zinc-700 w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export (.csv)
          </Button>
          <Link href="/admin/donasi/tambah">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Tambah Donasi Manual
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 p-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Cari ID invoice atau donatur..." 
              className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-zinc-400"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80">
              <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-transparent">
                <TableHead className="font-semibold w-[160px] pl-6">ID / Invoice</TableHead>
                <TableHead className="font-semibold pl-4">Donatur & Program</TableHead>
                <TableHead className="font-semibold hidden md:table-cell w-[200px] pl-4">Nominal</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell w-[200px] pl-4">Metode & Waktu</TableHead>
                <TableHead className="font-semibold text-left pl-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-zinc-100 dark:border-zinc-800/50">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="pl-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell pl-4"><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell className="hidden lg:table-cell pl-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[80px]" />
                      </div>
                    </TableCell>
                    <TableCell className="text-left pl-4 pr-6"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      <span>{error}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                    Belum ada transaksi donasi.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((donasi: any) => (
                  <TableRow key={donasi.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 pl-6 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">#{donasi.id}</span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">{donasi.order_id || 'TRX-MANUAL'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pl-4 py-4 align-top">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 shadow-sm border border-blue-200 dark:border-blue-800/50">
                          {(donasi.nama_donatur || "H").charAt(0).toUpperCase()}
                        </div>
                        <div className="pt-0.5">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{donasi.nama_donatur || "Hamba Allah"}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[250px] leading-relaxed">
                            {donasi.program_nama || "Donasi Umum (Tidak terikat program)"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell pl-4 py-4 align-top pt-5">
                      <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-800/30">
                        {formatRupiah(donasi.gross_amount)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm pl-4 py-4 align-top pt-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 capitalize border border-zinc-200 dark:border-zinc-700">
                          <FileText className="w-3 h-3" />
                          {donasi.payment_type?.replace(/_/g, ' ').toLowerCase() || 'Unknown'}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {donasi.created_at ? new Date(donasi.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left pl-4 pr-6 py-4 align-top pt-5">
                      {donasi.status === 'settlement' || donasi.status === 'PAID' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none dark:bg-emerald-900/30 dark:text-emerald-400">Lunas (PAID)</Badge>
                      ) : donasi.status === 'pending' || donasi.status === 'PENDING' ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none dark:bg-red-900/30 dark:text-red-400 capitalize">
                          {donasi.status || 'Batal'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Sebelumnya
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
