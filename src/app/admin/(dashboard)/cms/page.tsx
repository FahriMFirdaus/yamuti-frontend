"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Trash2, UploadCloud, ImageIcon, FileText, Loader2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "galeri" ? "galeri" : "artikel");
  const [artikelList, setArtikelList] = useState<ArtikelData[]>([]);
  const [galeriList, setGaleriList] = useState<GaleriData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isUnggahFotoOpen, setIsUnggahFotoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Galeri
  const [formJudulFoto, setFormJudulFoto] = useState("");
  const [formDeskripsiFoto, setFormDeskripsiFoto] = useState("");
  const [formFileFoto, setFormFileFoto] = useState<File | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthToken = async () => {
    const session = await getSession();
    let token = session?.accessToken;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token") || undefined;
    }
    return token || "";
  };

  const fetchArtikels = async () => {
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
  };

  const fetchGaleri = async () => {
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
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchArtikels(), fetchGaleri()]).finally(() => setIsLoading(false));
  }, []);

  const handleDeleteArtikel = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/artikel/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchArtikels();
      } else {
        alert("Gagal menghapus artikel.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudulFoto || !formFileFoto) {
      alert("Harap masukkan judul foto dan pilih berkas foto.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("judul", formJudulFoto);
      if (formDeskripsiFoto) {
        formData.append("deskripsi", formDeskripsiFoto);
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
        alert("Foto berhasil diunggah ke galeri!");
      } else {
        const err = await res.json();
        alert(err.message || "Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGaleri = async (id: string) => {
    if (!confirm("Hapus foto ini dari galeri?")) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/galeri/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchGaleri();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArtikel = artikelList.filter((a) =>
    a.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            CMS Website (Konten)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola artikel berita dan galeri foto terpadu untuk halaman publik dan beranda.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="artikel" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" /> Artikel Berita ({artikelList.length})
          </TabsTrigger>
          <TabsTrigger value="galeri" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <ImageIcon className="w-4 h-4 mr-2" /> Galeri Foto ({galeriList.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Konten: ARTIKEL */}
        <TabsContent value="artikel" className="space-y-4">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    type="search" 
                    placeholder="Cari judul artikel..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Tombol Halaman Mandiri Konsisten dengan /admin/program */}
                <Link href="/admin/cms/tambah">
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-500/20">
                    <Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                  <TableRow className="border-zinc-200 dark:border-zinc-800">
                    <TableHead className="w-16 pl-6">Foto</TableHead>
                    <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Judul Artikel</TableHead>
                    <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kategori</TableHead>
                    <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Tanggal Terbit</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold text-zinc-900 pr-6 dark:text-zinc-100">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                        Memuat artikel dari database...
                      </TableCell>
                    </TableRow>
                  ) : filteredArtikel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                        Belum ada artikel yang diterbitkan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArtikel.map((artikel) => (
                      <TableRow key={artikel.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <TableCell className="pl-6">
                          <div className="w-12 h-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                            {artikel.thumbnail_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={artikel.thumbnail_url} alt={artikel.judul} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">No img</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                          <p className="line-clamp-1">{artikel.judul}</p>
                          <p className="text-xs font-normal text-zinc-500 line-clamp-1 mt-0.5">/artikel/{artikel.slug}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-none font-medium text-xs">
                            {artikel.kategori_artikel?.nama_kategori || (artikel as any).kategori || "Kegiatan"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                          {new Date(artikel.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Aksi Konten</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <Link href={`/artikel/${artikel.slug}`} target="_blank">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4 text-emerald-600" /> Lihat Artikel
                                </DropdownMenuItem>
                              </Link>
                              {/* Halaman Mandiri Konsisten dengan /admin/program/edit/[id] */}
                              <Link href={`/admin/cms/edit/${artikel.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4 text-blue-600" /> Edit Artikel
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteArtikel(artikel.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Konten: GALERI */}
        <TabsContent value="galeri" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <p className="text-sm text-zinc-500">
              Total <strong>{galeriList.length}</strong> foto tersimpan. Semua foto di sini langsung tayang secara real-time di halaman publik <Link href="/galeri" target="_blank" className="text-red-600 hover:underline font-semibold inline-flex items-center gap-1">Galeri Publik &rarr;</Link>
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20" onClick={() => setIsUnggahFotoOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" /> Unggah Foto Galeri
            </Button>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
              Memuat foto galeri...
            </div>
          ) : galeriList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">Belum ada foto yang diunggah ke galeri.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galeriList.map((foto) => (
                <div key={foto.id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-all flex flex-col">
                  <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto.file_url} alt={foto.judul} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-3">
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full shadow-lg"
                        onClick={() => handleDeleteGaleri(foto.id)}
                        title="Hapus Foto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-grow">
                    <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm line-clamp-1">{foto.judul}</p>
                    {foto.deskripsi && (
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">{foto.deskripsi}</p>
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
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUploadFoto}>
            <DialogHeader>
              <DialogTitle>Unggah Foto Galeri</DialogTitle>
              <DialogDescription>
                Tambahkan dokumentasi foto kegiatan panti asuhan ke dalam galeri publik.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Foto Kegiatan</Label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 cursor-pointer">
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
                  <ImageIcon className="h-10 w-10 text-zinc-400 mb-2" />
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {formFileFoto ? formFileFoto.name : "Pilih Berkas Foto JPG/PNG"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="judul_foto">Judul / Keterangan Singkat Foto</Label>
                <Input 
                  id="judul_foto" 
                  placeholder="Misal: Penyerahan Santunan Ramadhan 2026" 
                  value={formJudulFoto}
                  onChange={(e) => setFormJudulFoto(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi_foto">Deskripsi Lengkap (Opsional)</Label>
                <Textarea 
                  id="deskripsi_foto" 
                  placeholder="Tuliskan cerita singkat, suasana, atau rincian kegiatan pada foto ini..." 
                  value={formDeskripsiFoto}
                  onChange={(e) => setFormDeskripsiFoto(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUnggahFotoOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-red-600 text-white hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? "Mengunggah..." : "Simpan ke Galeri"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
