"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, AlertCircle, RefreshCw, X } from "lucide-react";
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

interface AnakAsuhItem {
  id: string;
  nama: string;
  jenis_kelamin: string;
  tanggal_lahir?: string;
  kategori_bayi?: boolean | string;
  status?: string;
  tingkat_pendidikan?: string;
  status_keluarga?: string;
}

export default function AnakAsuhPage() {
  const router = useRouter();
  const [data, setData] = useState<AnakAsuhItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AKTIF" | "ALUMNI" | "BAYI">("ALL");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [selectedAnak, setSelectedAnak] = useState<{ id: string; nama: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnakAsuh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const params = new URLSearchParams({
        page: String(currentPage),
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`${apiUrl}/anak-asuh?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Gagal mengambil data anak asuh dari server.");
      const result = await res.json();

      if (result.data && result.data.data) {
        setData(result.data.data);
        setCurrentPage(result.data.current_page || 1);
        setTotalPages(result.data.last_page || 1);
        setPerPage(result.data.per_page || 15);
      } else {
        setData(result.data || []);
        setTotalPages(1);
        setPerPage(15);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAnakAsuh();
  }, [fetchAnakAsuh]);

  const handleDeleteClick = (anak: { id: string; nama: string }) => {
    setSelectedAnak(anak);
    setDeleteErrorMessage(null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnak) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/anak-asuh/${selectedAnak.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || "Gagal menghapus data anak asuh.");
      }

      setData((prev) => prev.filter((item) => item.id !== selectedAnak.id));
      setIsDeleteDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus data anak asuh.";
      setDeleteErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter pencarian dan status di sisi klien terhadap data aktif
  const filteredData = useMemo(() => {
    return data.filter((anak) => {
      const matchSearch = (anak.nama || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchSearch) return false;

      if (statusFilter === "AKTIF") {
        return (anak.status || "").toUpperCase() === "AKTIF";
      }
      if (statusFilter === "ALUMNI") {
        return (anak.status || "").toUpperCase() === "ALUMNI";
      }
      if (statusFilter === "BAYI") {
        return String(anak.kategori_bayi) === "true" || anak.kategori_bayi === true;
      }
      return true;
    });
  }, [data, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Data Anak Asuh</h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            Kelola basis data anak asuh binaan Yayasan Mutiara Titipan Illahi (YAMUTI) Tasikmalaya.
          </p>
        </div>
        <Link href="/admin/anak-asuh/tambah">
          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm w-full sm:w-auto font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Anak Asuh
          </Button>
        </Link>
      </div>

      {deleteErrorMessage && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs sm:text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{deleteErrorMessage}</span>
          </div>
          <button onClick={() => setDeleteErrorMessage(null)} className="text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card className="border-stone-200 dark:border-zinc-800 shadow-sm rounded-xl">
        {/* Toolbar Pencarian & Filter Status */}
        <CardHeader className="border-b border-stone-150 dark:border-zinc-800/80 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400 dark:text-zinc-500" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak asuh..."
                className="pl-9 h-9 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 focus-visible:ring-emerald-700 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs Sederhana */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter("AKTIF")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "AKTIF"
                    ? "bg-emerald-700 text-white dark:bg-emerald-600"
                    : "text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter("BAYI")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "BAYI"
                    ? "bg-blue-700 text-white dark:bg-blue-600"
                    : "text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Balita
              </button>
              <button
                onClick={() => setStatusFilter("ALUMNI")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "ALUMNI"
                    ? "bg-stone-700 text-white dark:bg-zinc-700"
                    : "text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Alumni
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-stone-50/80 dark:bg-zinc-900/60">
              <TableRow className="border-stone-200 dark:border-zinc-800">
                <TableHead className="w-[60px] text-center font-bold text-xs text-stone-700 dark:text-zinc-300">No</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Nama Lengkap</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Jenis Kelamin</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Tanggal Lahir</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Kategori</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Status</TableHead>
                <TableHead className="w-[100px] text-center font-bold text-xs text-stone-700 dark:text-zinc-300">Aksi</TableHead>
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
                  <TableCell colSpan={7} className="h-32 text-center text-red-600 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <span>{error}</span>
                      <Button variant="outline" size="sm" onClick={fetchAnakAsuh} className="mt-2 text-xs">
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Coba Lagi
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-stone-500 dark:text-zinc-400 text-sm">
                    {searchQuery ? `Tidak ditemukan anak asuh dengan kata kunci "${searchQuery}".` : "Belum ada data anak asuh yang tersimpan."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((anak, index) => {
                  // Perhitungan nomor urut absolut pagination
                  const rowNumber = (currentPage - 1) * perPage + index + 1;

                  return (
                    <ContextMenu key={anak.id}>
                      <ContextMenuTrigger 
                        render={
                          <TableRow 
                            className="border-stone-150 dark:border-zinc-800/50 hover:bg-stone-50/60 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/anak-asuh/${anak.id}`)}
                          />
                        }
                      >
                        <TableCell className="text-center font-medium text-xs text-stone-500">{rowNumber}</TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{anak.nama}</TableCell>
                        <TableCell className="text-xs text-stone-600 dark:text-zinc-400 capitalize">{anak.jenis_kelamin}</TableCell>
                        <TableCell className="text-xs text-stone-600 dark:text-zinc-400">
                          {anak.tanggal_lahir ? new Date(anak.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell>
                          {String(anak.kategori_bayi) === 'true' || anak.kategori_bayi === true ? (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-900/20 text-[11px]">Balita</Badge>
                          ) : (
                            <Badge variant="outline" className="border-stone-200 text-stone-700 bg-stone-50 dark:border-zinc-800 dark:text-zinc-300 dark:bg-zinc-800/50 text-[11px]">Anak-anak</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(anak.status || "").toUpperCase() === "AKTIF" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px]">Aktif</Badge>
                          ) : (
                            <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-100 border-none dark:bg-zinc-800 dark:text-zinc-300 text-[11px] capitalize">{anak.status?.toLowerCase() || 'aktif'}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4 text-stone-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-stone-200 dark:border-zinc-800">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs font-semibold text-stone-500">Aksi Data</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <Link href={`/admin/anak-asuh/${anak.id}`}>
                                <DropdownMenuItem className="cursor-pointer text-xs">
                                  <Eye className="mr-2 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                  Lihat Detail
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/admin/anak-asuh/edit/${anak.id}`}>
                                <DropdownMenuItem className="cursor-pointer text-xs">
                                  <Pencil className="mr-2 h-3.5 w-3.5 text-blue-600" />
                                  Edit Data
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem 
                                className="cursor-pointer text-xs text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteClick(anak)}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Hapus Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </ContextMenuTrigger>
                      
                      <ContextMenuContent className="w-48 rounded-xl border-stone-200 dark:border-zinc-800">
                        <ContextMenuGroup>
                          <ContextMenuLabel className="text-xs font-semibold text-stone-500">Aksi Cepat</ContextMenuLabel>
                        </ContextMenuGroup>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => router.push(`/admin/anak-asuh/${anak.id}`)} className="text-xs">
                          <Eye className="mr-2 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                          Lihat Detail
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => router.push(`/admin/anak-asuh/edit/${anak.id}`)} className="text-xs">
                          <Pencil className="mr-2 h-3.5 w-3.5 text-blue-600" />
                          Edit Data
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => handleDeleteClick(anak)} className="text-xs text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
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
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="text-xs border-stone-200 dark:border-zinc-800"
            >
              Sebelumnya
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className="text-xs border-stone-200 dark:border-zinc-800"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-stone-200 dark:border-zinc-800 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold">Hapus Data Anak Asuh</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus data atas nama <strong className="text-zinc-900 dark:text-zinc-100">{selectedAnak?.nama}</strong>? Tindakan ini akan menghapus data profil dan seluruh rekam medis/perkembangan anak terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-lg text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
