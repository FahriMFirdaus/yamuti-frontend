"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, PackagePlus, ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Inventaris = {
  id: string;
  nama_barang: string;
  kategori: string;
  stok: number;
  satuan: string;
  kondisi: "Baik" | "Sebagian Rusak" | "Perlu Restock";
};

const MOCK_INVENTARIS: Inventaris[] = [
  { id: "INV-001", nama_barang: "Beras Premium", kategori: "Sembako", stok: 150, satuan: "Kg", kondisi: "Baik" },
  { id: "INV-002", nama_barang: "Minyak Goreng", kategori: "Sembako", stok: 12, satuan: "Liter", kondisi: "Perlu Restock" },
  { id: "INV-003", nama_barang: "Buku Tulis Sinar Dunia", kategori: "Alat Tulis", stok: 200, satuan: "Pcs", kondisi: "Baik" },
  { id: "INV-004", nama_barang: "Seragam Sekolah SD", kategori: "Pakaian", stok: 15, satuan: "Stel", kondisi: "Baik" },
  { id: "INV-005", nama_barang: "Kasur Busa", kategori: "Fasilitas Asrama", stok: 45, satuan: "Buah", kondisi: "Sebagian Rusak" },
];

export default function InventarisPage() {
  const [selectedBarang, setSelectedBarang] = useState<Inventaris | null>(null);
  const [isMutasiOpen, setIsMutasiOpen] = useState(false);
  const [isTambahOpen, setIsTambahOpen] = useState(false);

  // Form State Mutasi
  const [mutasiTipe, setMutasiTipe] = useState("masuk");
  const [mutasiJumlah, setMutasiJumlah] = useState("");

  const handleMutasiClick = (barang: Inventaris) => {
    setSelectedBarang(barang);
    setMutasiTipe("masuk");
    setMutasiJumlah("");
    setIsMutasiOpen(true);
  };

  const handleSimpanMutasi = () => {
    if (!mutasiJumlah || Number(mutasiJumlah) <= 0) {
      alert("Jumlah mutasi tidak valid!");
      return;
    }
    console.log(`Mutasi ${mutasiTipe} untuk ${selectedBarang?.nama_barang} sebanyak ${mutasiJumlah}`);
    setIsMutasiOpen(false);
    alert("Mutasi barang berhasil dicatat!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Manajemen Inventaris
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola stok barang kebutuhan pokok dan aset panti asuhan.</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 w-full sm:w-auto"
          onClick={() => setIsTambahOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Barang Baru
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama barang..."
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 hidden sm:block">
              <option value="ALL">Semua Kategori</option>
              <option value="Sembako">Sembako</option>
              <option value="Alat Tulis">Alat Tulis</option>
              <option value="Pakaian">Pakaian</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="w-[80px] font-semibold text-zinc-900 dark:text-zinc-100 pl-6">ID</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Nama Barang</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kategori</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Stok Tersedia</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kondisi</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-zinc-900 dark:text-zinc-100">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVENTARIS.map((barang) => (
                <TableRow key={barang.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="pl-6 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {barang.id}
                  </TableCell>
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {barang.nama_barang}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-800/50 font-normal">
                      {barang.kategori}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-bold ${barang.stok < 20 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {barang.stok}
                      </span>
                      <span className="text-xs text-zinc-500">{barang.satuan}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {barang.kondisi === "Baik" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none dark:bg-green-900/30 dark:text-green-400">Baik</Badge>
                    ) : barang.kondisi === "Perlu Restock" ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none dark:bg-amber-900/30 dark:text-amber-400">Restock</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none dark:bg-red-900/30 dark:text-red-400">Rusak / Hilang</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Aksi Barang</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer font-medium text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-950"
                          onClick={() => handleMutasiClick(barang)}
                        >
                          <ArrowRightLeft className="mr-2 h-4 w-4" /> Catat Mutasi
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" /> Edit Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus Barang
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

      {/* Modal Mutasi Barang */}
      <Dialog open={isMutasiOpen} onOpenChange={setIsMutasiOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Catat Mutasi Stok</DialogTitle>
            <DialogDescription>
              Catat pergerakan barang <strong>{selectedBarang?.nama_barang}</strong>. Saat ini tersedia {selectedBarang?.stok} {selectedBarang?.satuan}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Jenis Mutasi</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button" 
                  variant={mutasiTipe === "masuk" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("masuk")}
                  className={mutasiTipe === "masuk" ? "bg-green-600 hover:bg-green-700" : ""}
                >Masuk</Button>
                <Button 
                  type="button" 
                  variant={mutasiTipe === "keluar" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("keluar")}
                  className={mutasiTipe === "keluar" ? "bg-amber-600 hover:bg-amber-700" : ""}
                >Keluar</Button>
                <Button 
                  type="button" 
                  variant={mutasiTipe === "rusak" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("rusak")}
                  className={mutasiTipe === "rusak" ? "bg-red-600 hover:bg-red-700" : ""}
                >Rusak</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jumlah" className="text-right">
                Jumlah
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="jumlah"
                  type="number"
                  value={mutasiJumlah}
                  onChange={(e) => setMutasiJumlah(e.target.value)}
                  className="w-full"
                  placeholder="Misal: 10"
                />
                <span className="text-sm font-medium text-zinc-500">{selectedBarang?.satuan}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keterangan" className="text-right">
                Catatan
              </Label>
              <Input
                id="keterangan"
                placeholder="Misal: Donasi dari warga / Digunakan untuk..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsMutasiOpen(false)}>Batal</Button>
            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={handleSimpanMutasi}>Simpan Mutasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Barang */}
      <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Barang Baru</DialogTitle>
            <DialogDescription>
              Daftarkan inventaris baru ke dalam sistem logistik panti.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama_barang" className="text-right">Nama</Label>
              <Input id="nama_barang" placeholder="Beras Setra Ramos" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kategori" className="text-right">Kategori</Label>
              <select id="kategori" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Sembako">Sembako</option>
                <option value="Alat Tulis">Alat Tulis</option>
                <option value="Pakaian">Pakaian</option>
                <option value="Fasilitas Asrama">Fasilitas Asrama</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stok_awal" className="text-right">Stok Awal</Label>
              <Input id="stok_awal" type="number" placeholder="0" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="satuan" className="text-right">Satuan</Label>
              <Input id="satuan" placeholder="Kg, Pcs, Liter..." className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTambahOpen(false)}>Batal</Button>
            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => setIsTambahOpen(false)}>Simpan Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
