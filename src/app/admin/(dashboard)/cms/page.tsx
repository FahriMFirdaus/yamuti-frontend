"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, UploadCloud, ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_ARTIKEL = [
  { id: "1", judul: "Kegiatan Ramadhan Bersama Anak Panti", kategori: "Berita", tanggal: "15 April 2026", status: "Published" },
  { id: "2", judul: "Penyaluran Beasiswa Pendidikan Tahap 1", kategori: "Program", tanggal: "02 Maret 2026", status: "Published" },
  { id: "3", judul: "Cara Donasi Menggunakan QRIS", kategori: "Panduan", tanggal: "28 Februari 2026", status: "Draft" },
];

const MOCK_GALERI = [
  { id: "1", judul: "Buka Puasa Bersama 2026", url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400&auto=format&fit=crop" },
  { id: "2", judul: "Serah Terima Bantuan Pakaian", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop" },
  { id: "3", judul: "Kegiatan Belajar Mengajar", url: "https://images.unsplash.com/photo-1541888040003-7f28dbce1587?q=80&w=400&auto=format&fit=crop" },
  { id: "4", judul: "Renovasi Asrama Baru", url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop" },
  { id: "5", judul: "Penyaluran Sembako Lebaran", url: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=400&auto=format&fit=crop" },
  { id: "6", judul: "Santunan Anak Yatim", url: "https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?q=80&w=400&auto=format&fit=crop" },
  { id: "7", judul: "Tadarus Al-Quran Rutin", url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=400&auto=format&fit=crop" },
  { id: "8", judul: "Bantuan Biaya Kesehatan", url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=400&auto=format&fit=crop" },
  { id: "9", judul: "Peresmian Ruang Belajar", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop" },
];

export default function CMSPage() {
  const [isTulisArtikelOpen, setIsTulisArtikelOpen] = useState(false);
  const [isUnggahFotoOpen, setIsUnggahFotoOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            CMS Website (Konten)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola artikel berita dan galeri foto untuk halaman publik.</p>
        </div>
      </div>

      <Tabs defaultValue="artikel" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="artikel" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" /> Artikel Berita
          </TabsTrigger>
          <TabsTrigger value="galeri" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <ImageIcon className="w-4 h-4 mr-2" /> Galeri Foto
          </TabsTrigger>
        </TabsList>

        {/* Tab Konten: ARTIKEL */}
        <TabsContent value="artikel" className="space-y-4">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input type="search" placeholder="Cari judul artikel..." className="pl-9" />
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsTulisArtikelOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                  <TableRow className="border-zinc-200 dark:border-zinc-800">
                    <TableHead className="font-semibold text-zinc-900 pl-6 dark:text-zinc-100">Judul Artikel</TableHead>
                    <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kategori</TableHead>
                    <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Tanggal Terbit</TableHead>
                    <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold text-zinc-900 pr-6 dark:text-zinc-100">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ARTIKEL.map((artikel) => (
                    <TableRow key={artikel.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="pl-6 font-semibold text-zinc-900 dark:text-zinc-100">
                        {artikel.judul}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {artikel.kategori}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {artikel.tanggal}
                      </TableCell>
                      <TableCell>
                        {artikel.status === "Published" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none dark:bg-green-900/30 dark:text-green-400">Published</Badge>
                        ) : (
                          <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none shadow-none dark:bg-zinc-800 dark:text-zinc-300">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Aksi Konten</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" /> Edit Artikel
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus Artikel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Konten: GALERI */}
        <TabsContent value="galeri" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsUnggahFotoOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" /> Unggah Foto Galeri
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {MOCK_GALERI.map((foto) => (
              <div key={foto.id} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto.url} alt={foto.judul} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-white font-medium text-sm line-clamp-2">{foto.judul}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Tulis Artikel Baru */}
      <Dialog open={isTulisArtikelOpen} onOpenChange={setIsTulisArtikelOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Tulis Artikel Baru</DialogTitle>
            <DialogDescription>
              Buat berita atau pengumuman yang akan tampil di halaman publik.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="judul_artikel">Judul Artikel</Label>
              <Input id="judul_artikel" placeholder="Masukkan judul..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori_artikel">Kategori</Label>
              <select id="kategori_artikel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Berita">Berita</option>
                <option value="Program">Program Panti</option>
                <option value="Panduan">Panduan Donasi</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Banner (Gambar Utama)</Label>
              <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
                <UploadCloud className="h-8 w-8 text-zinc-400 mb-2" />
                <p className="text-xs font-medium text-zinc-500">Klik untuk upload gambar cover</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="konten_artikel">Konten Berita</Label>
              <Textarea id="konten_artikel" rows={10} placeholder="Tulis isi berita selengkapnya di sini..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTulisArtikelOpen(false)}>Batal</Button>
            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => setIsTulisArtikelOpen(false)}>Publikasikan Artikel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Unggah Galeri */}
      <Dialog open={isUnggahFotoOpen} onOpenChange={setIsUnggahFotoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Unggah Foto Galeri</DialogTitle>
            <DialogDescription>
              Tambahkan momen kebahagiaan panti asuhan ke dalam galeri publik.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Foto Momen</Label>
              <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 flex flex-col items-center justify-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
                <ImageIcon className="h-10 w-10 text-zinc-400 mb-2" />
                <p className="text-sm font-medium text-zinc-500">Upload Foto JPG/PNG (Max 5MB)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="judul_foto">Judul / Keterangan Foto</Label>
              <Input id="judul_foto" placeholder="Misal: Acara Buka Bersama 2026" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUnggahFotoOpen(false)}>Batal</Button>
            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => setIsUnggahFotoOpen(false)}>Simpan ke Galeri</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
