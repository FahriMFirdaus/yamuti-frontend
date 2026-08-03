"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, CheckCircle2, Eye, AlertCircle, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuLabel, ContextMenuGroup } from "@/components/ui/context-menu";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function KampanyePage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKampanye, setSelectedKampanye] = useState<{ id: string; judul: string } | null>(null);

  const fetchKampanye = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      
      const res = await fetch(`http://localhost:8000/api/kampanye?page=${currentPage}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!res.ok) throw new Error("Gagal mengambil data kampanye");
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
    fetchKampanye();
  }, [currentPage]);

  const handleDeleteClick = (kampanye: any) => {
    setSelectedKampanye(kampanye);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedKampanye) return;
    
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      
      const res = await fetch(`http://localhost:8000/api/kampanye/${selectedKampanye.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error("Gagal menghapus data kampanye");
      
      fetchKampanye();
      setIsDeleteDialogOpen(false);
      setSelectedKampanye(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
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

  const calculateProgress = (terkumpul: number, target: number) => {
    if (!target) return 0;
    const persentase = (terkumpul / target) * 100;
    return Math.min(Math.round(persentase), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Manajemen Program</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Kelola program kebaikan dan donasi untuk yayasan.</p>
        </div>
        <Link href="/admin/program/tambah">
          <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Tambah Program
          </Button>
        </Link>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 p-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Cari nama program..." 
              className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-zinc-400"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80">
              <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-transparent">
                <TableHead className="w-[50px] text-center font-semibold">No</TableHead>
                <TableHead className="font-semibold">Informasi Program</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Target & Terkumpul</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Waktu</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-zinc-100 dark:border-zinc-800/50">
                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-16 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[120px] mb-2" />
                      <Skeleton className="h-2 w-full max-w-[150px]" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-[100px] mb-2" />
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
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
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                    Belum ada data program yang ditambahkan.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((kampanye: any, index: number) => {
                  const terkumpul = parseFloat(kampanye.donasi_sum_gross_amount) || 0;
                  const target = parseFloat(kampanye.target_donasi) || 0;
                  const progress = calculateProgress(terkumpul, target);
                  const isSelesai = progress >= 100 || kampanye.status?.toLowerCase() === 'selesai';
                  
                  return (
                    <ContextMenu key={kampanye.id}>
                      <ContextMenuTrigger 
                        render={
                          <TableRow 
                            className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/program/${kampanye.id}`)}
                          />
                        }
                      >
                        <TableCell className="text-center font-medium text-zinc-500">
                          {((currentPage - 1) * 15) + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative flex-shrink-0">
                              {kampanye.gambar ? (
                                <Image src={kampanye.gambar} alt={kampanye.judul} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                  <Target className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{kampanye.judul}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 max-w-sm">
                                {kampanye.deskripsi || "Tidak ada deskripsi"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-zinc-900 dark:text-zinc-100">{formatRupiah(terkumpul)}</span>
                              <span className="text-zinc-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full ${isSelesai ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                style={{ width: `${progress}%` }} 
                              />
                            </div>
                            <p className="text-xs text-zinc-500">Target: {formatRupiah(target)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm">
                            <p className="text-zinc-900 dark:text-zinc-100">
                              {kampanye.tanggal_mulai ? new Date(kampanye.tanggal_mulai).toLocaleDateString('id-ID') : '-'}
                            </p>
                            <p className="text-xs text-zinc-500">
                              s/d {kampanye.tanggal_berakhir ? new Date(kampanye.tanggal_berakhir).toLocaleDateString('id-ID') : 'Tanpa batas'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isSelesai ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none dark:bg-emerald-900/30 dark:text-emerald-400">Selesai</Badge>
                          ) : kampanye.status?.toLowerCase() === 'aktif' ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none dark:bg-blue-900/30 dark:text-blue-400">Aktif</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none dark:bg-amber-900/30 dark:text-amber-400 capitalize">
                              {kampanye.status || 'Draft'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Aksi Data</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <Link href={`/admin/program/${kampanye.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                                  Lihat Detail
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/admin/program/edit/${kampanye.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                                  Edit Data
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteClick(kampanye)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </ContextMenuTrigger>
                      
                      <ContextMenuContent className="w-48">
                        <ContextMenuGroup>
                          <ContextMenuLabel>Aksi Cepat</ContextMenuLabel>
                        </ContextMenuGroup>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => router.push(`/admin/program/${kampanye.id}`)}>
                          <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                          Lihat Detail
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => router.push(`/admin/program/edit/${kampanye.id}`)}>
                          <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                          Edit Data
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => handleDeleteClick(kampanye)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Data
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-red-200 dark:border-red-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Konfirmasi Penghapusan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus program <strong>{selectedKampanye?.judul}</strong>? Tindakan ini tidak dapat dibatalkan.
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
