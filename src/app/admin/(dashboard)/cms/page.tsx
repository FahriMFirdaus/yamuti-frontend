"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  UploadCloud,
  ImageIcon,
  FileText,
  Loader2,
  Eye,
  Pencil,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";

interface ArtikelData {
  id: string;
  slug: string;
  judul: string;
  konten: string;
  thumbnail_url: string | null;
  created_at: string;
  kategori_artikel?: {
    id: string;
    nama_kategori: string;
  };
  penulis?: {
    name: string;
  };
}

interface GaleriData {
  id: string;
  judul: string;
  deskripsi?: string;
  file_url: string;
}

export default function CMSPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "galeri" ? "galeri" : "artikel");
  const [artikelList, setArtikelList] = useState<ArtikelData[]>([]);
  const [galeriList, setGaleriList] = useState<GaleriData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form Upload Foto Galeri
  const [isUnggahFotoOpen, setIsUnggahFotoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formJudulFoto, setFormJudulFoto] = useState("");
  const [formDeskripsiFoto, setFormDeskripsiFoto] = useState("");
  const [formFileFoto, setFormFileFoto] = useState<File | null>(null);
  const [formUploadError, setFormUploadError] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: "artikel" | "galeri"; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthToken = async () => {
    const session = await getSession();
    let token = session?.accessToken;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token") || undefined;
    }
    return token || "";
  };

  const fetchArtikels = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/artikel?per_page=50`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setArtikelList(json.data?.data || json.data || []);
      }
    } catch (err) {
      console.error("Gagal load artikel:", err);
    }
  }, [apiUrl]);

  const fetchGaleri = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/galeri?per_page=100`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setGaleriList(json.data?.data || json.data || []);
      }
    } catch (err) {
      console.error("Gagal load galeri:", err);
    }
  }, [apiUrl]);

  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    await Promise.all([fetchArtikels(), fetchGaleri()]);
    setIsLoading(false);
  }, [fetchArtikels, fetchGaleri]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = await getAuthToken();
        const [resArtikel, resGaleri] = await Promise.all([
          fetch(`${apiUrl}/artikel?per_page=50`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/galeri?per_page=100`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!ignore) {
          if (resArtikel.ok) {
            const json = await resArtikel.json();
            setArtikelList(json.data?.data || json.data || []);
          }
          if (resGaleri.ok) {
            const json = await resGaleri.json();
            setGaleriList(json.data?.data || json.data || []);
          }
        }
      } catch (err) {
        if (!ignore) console.error("Gagal memuat konten CMS:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  // Delete Action Handler
  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      const token = await getAuthToken();
      const endpoint = deleteItem.type === "artikel" ? `artikel/${deleteItem.id}` : `galeri/${deleteItem.id}`;

      const res = await fetch(`${apiUrl}/${endpoint}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Gagal menghapus ${deleteItem.type === "artikel" ? "artikel" : "foto"}`);
      }

      setFeedbackMessage({
        text: `${deleteItem.type === "artikel" ? "Artikel" : "Foto"} "${deleteItem.title}" berhasil dihapus.`,
        type: "success",
      });

      if (deleteItem.type === "artikel") {
        fetchArtikels();
      } else {
        fetchGaleri();
      }

      setDeleteItem(null);
    } catch (err: unknown) {
      console.error(err);
      setFeedbackMessage({
        text: err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus data.",
        type: "error",
      });
      setDeleteItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Upload Foto Handler
  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudulFoto.trim() || !formFileFoto) {
      setFormUploadError("Harap masukkan judul foto dan pilih berkas foto.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormUploadError(null);
      const formData = new FormData();
      formData.append("judul", formJudulFoto.trim());
      if (formDeskripsiFoto.trim()) {
        formData.append("deskripsi", formDeskripsiFoto.trim());
      }
      formData.append("file", formFileFoto);

      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/galeri`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setIsUnggahFotoOpen(false);
        setFormJudulFoto("");
        setFormDeskripsiFoto("");
        setFormFileFoto(null);
        fetchGaleri();
        setFeedbackMessage({
          text: `Foto "${formJudulFoto}" berhasil diunggah ke galeri publik.`,
          type: "success",
        });
      } else {
        const err = await res.json();
        setFormUploadError(err.message || "Gagal mengunggah foto.");
      }
    } catch (err: unknown) {
      console.error(err);
      setFormUploadError("Terjadi kesalahan jaringan saat mengunggah foto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search filtered results
  const filteredArtikel = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return artikelList;
    return artikelList.filter(
      (a) =>
        a.judul.toLowerCase().includes(q) ||
        (a.kategori_artikel?.nama_kategori && a.kategori_artikel.nama_kategori.toLowerCase().includes(q))
    );
  }, [artikelList, searchQuery]);

  const filteredGaleri = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return galeriList;
    return galeriList.filter(
      (g) => g.judul.toLowerCase().includes(q) || (g.deskripsi && g.deskripsi.toLowerCase().includes(q))
    );
  }, [galeriList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            CMS Website (Konten)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola artikel berita dan galeri foto dokumentasi terpadu untuk halaman publik yayasan YAMUTI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllData(true)}
            disabled={isLoading}
            className="text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 gap-1.5"
            title="Segarkan konten CMS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          {activeTab === "artikel" ? (
            <Link href="/admin/cms/tambah">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5">
                <Plus className="h-4 w-4" /> Tulis Artikel Baru
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setFormUploadError(null);
                setIsUnggahFotoOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
            >
              <UploadCloud className="h-4 w-4" /> Unggah Foto Galeri
            </Button>
          )}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg border text-sm flex items-center justify-between ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold ml-4 underline hover:opacity-75"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 max-w-[360px]">
            <TabsTrigger
              value="artikel"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs font-semibold"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Artikel ({artikelList.length})
            </TabsTrigger>
            <TabsTrigger
              value="galeri"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs font-semibold"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Galeri Foto ({galeriList.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder={activeTab === "artikel" ? "Cari judul artikel..." : "Cari foto galeri..."}
              className="pl-9 h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Konten: ARTIKEL */}
        <TabsContent value="artikel" className="space-y-4 m-0">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/60">
                    <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                      <TableHead className="w-16 pl-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Foto
                      </TableHead>
                      <TableHead className="font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Judul Artikel
                      </TableHead>
                      <TableHead className="font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Kategori
                      </TableHead>
                      <TableHead className="font-semibold py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Tanggal Terbit
                      </TableHead>
                      <TableHead className="w-[80px] text-center font-semibold pr-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-16 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                            <span className="text-sm">Memuat artikel berita yayasan...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredArtikel.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-16 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                              Belum ada artikel
                            </p>
                            <p className="text-xs text-zinc-400">
                              {searchQuery
                                ? "Tidak ada artikel yang sesuai dengan kata kunci pencarian."
                                : "Belum ada artikel yang diterbitkan."}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredArtikel.map((artikel) => (
                        <TableRow
                          key={artikel.id}
                          className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <TableCell className="pl-6 py-4 align-top">
                            <div className="w-12 h-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                              {artikel.thumbnail_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={artikel.thumbnail_url}
                                  alt={artikel.judul}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                                  No img
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 align-top">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">
                              {artikel.judul}
                            </p>
                            <p className="text-xs font-mono text-zinc-400 line-clamp-1 mt-0.5">
                              /artikel/{artikel.slug}
                            </p>
                          </TableCell>
                          <TableCell className="py-4 align-top">
                            <Badge
                              variant="outline"
                              className="text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 font-normal"
                            >
                              {artikel.kategori_artikel?.nama_kategori || "Kegiatan"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 text-xs py-4 align-top pt-5">
                            {new Date(artikel.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-center pr-6 py-4 align-top pt-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex h-8 w-8 mx-auto items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem className="p-0">
                                  <Link
                                    href={`/artikel/${artikel.slug}`}
                                    target="_blank"
                                    className="cursor-pointer flex items-center w-full px-2 py-1.5"
                                  >
                                    <Eye className="mr-2 h-4 w-4 text-emerald-600" /> Lihat Artikel
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="p-0">
                                  <Link
                                    href={`/admin/cms/edit/${artikel.id}`}
                                    className="cursor-pointer flex items-center w-full px-2 py-1.5"
                                  >
                                    <Pencil className="mr-2 h-4 w-4 text-blue-600" /> Edit Artikel
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                  onClick={() =>
                                    setDeleteItem({
                                      id: artikel.id,
                                      type: "artikel",
                                      title: artikel.judul,
                                    })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Hapus Artikel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Konten: GALERI */}
        <TabsContent value="galeri" className="space-y-4 m-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <p className="text-xs text-zinc-500">
              Total <strong>{galeriList.length}</strong> foto tersimpan. Semua foto langsung tampil di halaman publik:{" "}
              <Link
                href="/galeri"
                target="_blank"
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                Galeri Publik <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
              Memuat foto galeri...
            </div>
          ) : filteredGaleri.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border rounded-xl border-dashed bg-zinc-50/50 dark:bg-zinc-900/50">
              <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto stroke-[1.5]" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                Tidak ada foto galeri
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {searchQuery
                  ? "Tidak ada foto yang cocok dengan pencarian."
                  : "Belum ada foto yang diunggah ke galeri."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGaleri.map((foto) => (
                <div
                  key={foto.id}
                  className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.file_url}
                      alt={foto.judul}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2.5">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 rounded-full shadow-md bg-rose-600 hover:bg-rose-700"
                        onClick={() =>
                          setDeleteItem({
                            id: foto.id,
                            type: "galeri",
                            title: foto.judul,
                          })
                        }
                        title="Hapus Foto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between grow">
                    <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-xs line-clamp-1">
                      {foto.judul}
                    </p>
                    {foto.deskripsi && (
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                        {foto.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Unggah Galeri */}
      <Dialog open={isUnggahFotoOpen} onOpenChange={setIsUnggahFotoOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUploadFoto}>
            <DialogHeader>
              <DialogTitle className="text-lg">Unggah Foto Galeri</DialogTitle>
              <DialogDescription>
                Tambahkan dokumentasi foto kegiatan panti asuhan ke dalam galeri publik yayasan YAMUTI.
              </DialogDescription>
            </DialogHeader>

            {formUploadError && (
              <div className="p-3 mt-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formUploadError}</span>
              </div>
            )}

            <div className="space-y-4 py-3 text-sm">
              <div className="space-y-1.5">
                <Label>Pilih Berkas Foto *</Label>
                <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFileFoto(e.target.files[0]);
                      }
                    }}
                    required
                  />
                  <ImageIcon className="h-8 w-8 text-zinc-400 mb-2" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center">
                    {formFileFoto ? formFileFoto.name : "Klik untuk pilih berkas foto (JPG / PNG)"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="judul_foto">Judul / Keterangan Singkat *</Label>
                <Input
                  id="judul_foto"
                  placeholder="Misal: Penyerahan Santunan Ramadhan 1447H"
                  value={formJudulFoto}
                  onChange={(e) => setFormJudulFoto(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deskripsi_foto">Deskripsi Lengkap (Opsional)</Label>
                <Textarea
                  id="deskripsi_foto"
                  placeholder="Tuliskan cerita singkat atau suasana kegiatan pada foto ini..."
                  value={formDeskripsiFoto}
                  onChange={(e) => setFormDeskripsiFoto(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUnggahFotoOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengunggah..." : "Simpan ke Galeri"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Hapus Konten (Artikel / Galeri) */}
      <AlertDialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Hapus {deleteItem?.type === "artikel" ? "Artikel Berita" : "Foto Galeri"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {deleteItem?.type === "artikel" ? "artikel" : "foto"}{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{deleteItem?.title}</strong>? Tindakan
              ini bersifat permanen dan akan menghilangkannya dari halaman publik yayasan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
