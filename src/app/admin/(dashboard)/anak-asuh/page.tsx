"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, CheckCircle2, Eye, AlertCircle } from "lucide-react";
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

export default function AnakAsuhPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState<{ id: string; nama: string } | null>(null);

  const fetchAnakAsuh = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh?page=${currentPage}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!res.ok) throw new Error("Gagal mengambil data anak asuh");
      const result = await res.json();
      
      if (result.data && result.data.data) {
        // Laravel Pagination Format
        setData(result.data.data);
        setCurrentPage(result.data.current_page);
        setTotalPages(result.data.last_page);
      } else {
        // Fallback for non-paginated or simple array
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
    fetchAnakAsuh();
  }, [currentPage]);

  const handleDeleteClick = (anak: { id: string; nama: string }) => {
    setSelectedAnak(anak);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnak) return;
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh/${selectedAnak.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!res.ok) throw new Error("Gagal menghapus data");
      setData(data.filter(item => item.id !== selectedAnak.id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Data Anak Asuh</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Kelola informasi seluruh anak asuh di Yayasan Mutiara Harapan.</p>
        </div>
        <Link href="/admin/anak-asuh/tambah">
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Tambah Data
          </Button>
        </Link>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama anak..."
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="w-[50px] text-center font-semibold text-zinc-900 dark:text-zinc-100">No</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Nama Lengkap</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Jenis Kelamin</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Tanggal Lahir</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kategori</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-zinc-900 dark:text-zinc-100">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-red-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      <span>{error}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                    Belum ada data anak asuh yang ditambahkan.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((anak: any, index: number) => (
                  <ContextMenu key={anak.id}>
                    <ContextMenuTrigger 
                      render={
                        <TableRow 
                          className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/anak-asuh/${anak.id}`)}
                        />
                      }
                    >
                        <TableCell className="text-center font-medium text-zinc-500">{index + 1}</TableCell>
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{anak.nama}</TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400 capitalize">{anak.jenis_kelamin}</TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400">
                          {anak.tanggal_lahir ? new Date(anak.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell>
                          {String(anak.kategori_bayi) === 'true' || anak.kategori_bayi === true ? (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/20">Bayi/Balita</Badge>
                          ) : (
                            <Badge variant="outline" className="border-zinc-200 text-zinc-700 bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:bg-zinc-800/50">Anak-anak</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {anak.status === "AKTIF" || anak.status === "Aktif" ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none dark:bg-green-900/30 dark:text-green-400">Aktif</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none dark:bg-amber-900/30 dark:text-amber-400 capitalize">{anak.status?.toLowerCase() || 'aktif'}</Badge>
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
                              <Link href={`/admin/anak-asuh/${anak.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                                  Lihat Detail
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/admin/anak-asuh/edit/${anak.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                                  Edit Data
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteClick(anak)}
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
                      <ContextMenuItem onClick={() => router.push(`/admin/anak-asuh/${anak.id}`)}>
                        <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                        Lihat Detail
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => router.push(`/admin/anak-asuh/edit/${anak.id}`)}>
                        <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                        Edit Data
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleDeleteClick(anak)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Data
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
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

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus data anak asuh atas nama <strong className="text-zinc-900 dark:text-zinc-100">{selectedAnak?.nama}</strong> dari database (termasuk foto identitas).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
