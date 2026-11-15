"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, ArrowRightLeft, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
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
  deskripsi?: string;
  stok_sekarang: number;
  satuan: string;
  tanggal_kadaluarsa?: string | null;
  lokasi_penyimpanan?: string | null;
  stok_minimum?: number;
};

export default function InventarisPage() {
  const [items, setItems] = useState<Inventaris[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("ALL");

  const [selectedBarang, setSelectedBarang] = useState<Inventaris | null>(null);
  const [isMutasiOpen, setIsMutasiOpen] = useState(false);
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State Mutasi
  const [mutasiTipe, setMutasiTipe] = useState<"masuk" | "keluar">("masuk");
  const [mutasiJumlah, setMutasiJumlah] = useState("");
  const [mutasiKeterangan, setMutasiKeterangan] = useState("");
  const [mutasiTanggal, setMutasiTanggal] = useState(new Date().toISOString().split("T")[0]);

  // Form State Tambah / Edit Barang
  const [formData, setFormData] = useState({
    nama_barang: "",
    kategori: "Sembako",
    deskripsi: "",
    stok_sekarang: 0,
    satuan: "Kg",
    tanggal_kadaluarsa: "",
    lokasi_penyimpanan: "",
    stok_minimum: 5,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  };

  const fetchInventaris = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/inventaris?per_page=100`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setItems(json.data?.data || json.data || []);
      } else {
        setError(json.message || "Gagal memuat data inventaris.");
      }
    } catch (err: any) {
      console.error("Error fetching inventaris:", err);
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventaris();
  }, []);

  const handleOpenTambah = () => {
    setFormData({
      nama_barang: "",
      kategori: "Sembako",
      deskripsi: "",
      stok_sekarang: 0,
      satuan: "Kg",
      tanggal_kadaluarsa: "",
      lokasi_penyimpanan: "",
      stok_minimum: 5,
    });
    setIsTambahOpen(true);
  };

  const handleOpenEdit = (barang: Inventaris) => {
    setSelectedBarang(barang);
    setFormData({
      nama_barang: barang.nama_barang,
      kategori: barang.kategori || "Sembako",
      deskripsi: barang.deskripsi || "",
      stok_sekarang: barang.stok_sekarang,
      satuan: barang.satuan,
      tanggal_kadaluarsa: barang.tanggal_kadaluarsa ? barang.tanggal_kadaluarsa.split("T")[0] : "",
      lokasi_penyimpanan: barang.lokasi_penyimpanan || "",
      stok_minimum: barang.stok_minimum ?? 5,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (barang: Inventaris) => {
    setSelectedBarang(barang);
    setIsDeleteOpen(true);
  };

  const handleSimpanBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_barang || !formData.satuan) {
      alert("Nama barang dan satuan wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_barang: formData.nama_barang,
        kategori: formData.kategori,
        deskripsi: formData.deskripsi || null,
        stok_sekarang: Number(formData.stok_sekarang),
        satuan: formData.satuan,
        tanggal_kadaluarsa: formData.tanggal_kadaluarsa || null,
        lokasi_penyimpanan: formData.lokasi_penyimpanan || null,
        stok_minimum: Number(formData.stok_minimum) || 0,
      };

      const res = await fetch(`${apiUrl}/inventaris`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsTambahOpen(false);
        await fetchInventaris();
      } else {
        alert(json.message || "Gagal menyimpan barang baru.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang) return;

    setSubmitting(true);
    try {
      const payload = {
        nama_barang: formData.nama_barang,
        kategori: formData.kategori,
        deskripsi: formData.deskripsi || null,
        stok_sekarang: Number(formData.stok_sekarang),
        satuan: formData.satuan,
        tanggal_kadaluarsa: formData.tanggal_kadaluarsa || null,
        lokasi_penyimpanan: formData.lokasi_penyimpanan || null,
        stok_minimum: Number(formData.stok_minimum) || 0,
      };

      const res = await fetch(`${apiUrl}/inventaris/${selectedBarang.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsEditOpen(false);
        setSelectedBarang(null);
        await fetchInventaris();
      } else {
        alert(json.message || "Gagal memperbarui data barang.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBarang = async () => {
    if (!selectedBarang) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/inventaris/${selectedBarang.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsDeleteOpen(false);
        setSelectedBarang(null);
        await fetchInventaris();
      } else {
        alert(json.message || "Gagal menghapus barang.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus barang.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMutasiClick = (barang: Inventaris) => {
    setSelectedBarang(barang);
    setMutasiTipe("masuk");
    setMutasiJumlah("");
    setMutasiKeterangan("");
    setMutasiTanggal(new Date().toISOString().split("T")[0]);
    setIsMutasiOpen(true);
  };

  const handleSimpanMutasi = async () => {
    if (!selectedBarang) return;
    const jumlahNum = Number(mutasiJumlah);
    if (!mutasiJumlah || isNaN(jumlahNum) || jumlahNum <= 0) {
      alert("Jumlah mutasi harus berupa angka lebih dari 0!");
      return;
    }

    if (mutasiTipe === "keluar" && jumlahNum > selectedBarang.stok_sekarang) {
      alert(`Stok tidak mencukupi! Stok saat ini hanya ${selectedBarang.stok_sekarang} ${selectedBarang.satuan}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tipe: mutasiTipe,
        jumlah: jumlahNum,
        keterangan: mutasiKeterangan || null,
        tanggal_mutasi: mutasiTanggal,
      };

      const res = await fetch(`${apiUrl}/inventaris/${selectedBarang.id}/mutasi`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsMutasiOpen(false);
        setSelectedBarang(null);
        await fetchInventaris();
      } else {
        alert(json.message || "Gagal mencatat mutasi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((barang) => {
    const matchSearch =
      barang.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
      (barang.lokasi_penyimpanan?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchKategori = filterKategori === "ALL" || barang.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Manajemen Inventaris
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola stok barang kebutuhan pokok dan logistik panti asuhan secara realtime.</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 w-full sm:w-auto"
          onClick={handleOpenTambah}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Barang Baru
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInventaris}>Coba Lagi</Button>
        </div>
      )}

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama barang atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 hidden sm:block"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Sembako">Sembako</option>
              <option value="Obat-obatan">Obat-obatan</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Perlengkapan Sekolah">Perlengkapan Sekolah</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 pl-6">Nama Barang</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kategori & Lokasi</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Stok Tersedia</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Kadaluarsa (Exp)</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Status Stok</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-zinc-900 dark:text-zinc-100 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                      <span>Memuat data inventaris...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                    Tidak ada data barang yang sesuai kriteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((barang) => {
                  const isExpiringSoon = barang.tanggal_kadaluarsa && new Date(barang.tanggal_kadaluarsa) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  const isExpired = barang.tanggal_kadaluarsa && new Date(barang.tanggal_kadaluarsa) < new Date();
                  const isMenipis = barang.stok_sekarang <= (barang.stok_minimum ?? 5);

                  return (
                    <TableRow key={barang.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="pl-6 font-semibold text-zinc-900 dark:text-zinc-100">
                        {barang.nama_barang}
                        {barang.deskripsi && (
                          <div className="text-xs font-normal text-zinc-500 truncate max-w-xs">{barang.deskripsi}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-800/50 font-normal">
                            {barang.kategori}
                          </Badge>
                          {barang.lokasi_penyimpanan && (
                            <span className="text-[11px] text-zinc-400">{barang.lokasi_penyimpanan}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-bold ${isMenipis ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {barang.stok_sekarang}
                          </span>
                          <span className="text-xs text-zinc-500">{barang.satuan}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {barang.tanggal_kadaluarsa ? (
                          <div className="flex flex-col">
                            <span className={`text-xs font-medium ${isExpired ? 'text-red-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-semibold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                              {new Date(barang.tanggal_kadaluarsa).toLocaleDateString('id-ID')}
                            </span>
                            {isExpired ? (
                              <span className="text-[10px] text-red-500 font-bold">Kadaluarsa!</span>
                            ) : isExpiringSoon ? (
                              <span className="text-[10px] text-amber-500 font-medium">Segera Expire</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isMenipis ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none dark:bg-red-900/30 dark:text-red-400">
                            Stok Menipis
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none dark:bg-green-900/30 dark:text-green-400">
                            Aman
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center pr-6">
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(barang)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleOpenDelete(barang)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus Barang
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
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
              Catat pergerakan stok <strong>{selectedBarang?.nama_barang}</strong>. Saat ini tersedia {selectedBarang?.stok_sekarang} {selectedBarang?.satuan}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Jenis Mutasi</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant={mutasiTipe === "masuk" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("masuk")}
                  className={mutasiTipe === "masuk" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Barang Masuk
                </Button>
                <Button 
                  type="button" 
                  variant={mutasiTipe === "keluar" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("keluar")}
                  className={mutasiTipe === "keluar" ? "bg-amber-600 hover:bg-amber-700" : ""}
                >
                  Barang Keluar
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jumlah" className="text-right">
                Jumlah *
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="jumlah"
                  type="number"
                  min="1"
                  value={mutasiJumlah}
                  onChange={(e) => setMutasiJumlah(e.target.value)}
                  className="w-full"
                  placeholder="Misal: 10"
                  required
                />
                <span className="text-sm font-medium text-zinc-500">{selectedBarang?.satuan}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggal_mutasi" className="text-right">
                Tanggal *
              </Label>
              <Input
                id="tanggal_mutasi"
                type="date"
                value={mutasiTanggal}
                onChange={(e) => setMutasiTanggal(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keterangan" className="text-right">
                Catatan
              </Label>
              <Input
                id="keterangan"
                value={mutasiKeterangan}
                onChange={(e) => setMutasiKeterangan(e.target.value)}
                placeholder="Misal: Bantuan donatur / Masak harian"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsMutasiOpen(false)}>Batal</Button>
            <Button type="button" disabled={submitting} className="bg-red-600 text-white hover:bg-red-700" onClick={handleSimpanMutasi}>
              {submitting ? "Menyimpan..." : "Simpan Mutasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Barang */}
      <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Tambah Barang Baru</DialogTitle>
            <DialogDescription>
              Daftarkan logistik/inventaris baru ke database yayasan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSimpanBarang} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nama_barang">Nama Barang *</Label>
              <Input
                id="nama_barang"
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                placeholder="Contoh: Beras Premium RojoLele"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <select
                  id="kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Sembako">Sembako</option>
                  <option value="Obat-obatan">Obat-obatan</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Perlengkapan Sekolah">Perlengkapan Sekolah</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="satuan">Satuan *</Label>
                <Input
                  id="satuan"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  placeholder="Kg, Liter, Pcs, Box..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stok_sekarang">Stok Awal</Label>
                <Input
                  id="stok_sekarang"
                  type="number"
                  min="0"
                  value={formData.stok_sekarang}
                  onChange={(e) => setFormData({ ...formData, stok_sekarang: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stok_minimum">Stok Minimum (Alert)</Label>
                <Input
                  id="stok_minimum"
                  type="number"
                  min="0"
                  value={formData.stok_minimum}
                  onChange={(e) => setFormData({ ...formData, stok_minimum: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal_kadaluarsa">Tgl Kadaluarsa</Label>
                <Input
                  id="tanggal_kadaluarsa"
                  type="date"
                  value={formData.tanggal_kadaluarsa}
                  onChange={(e) => setFormData({ ...formData, tanggal_kadaluarsa: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lokasi_penyimpanan">Lokasi Rak / Gudang</Label>
                <Input
                  id="lokasi_penyimpanan"
                  value={formData.lokasi_penyimpanan}
                  onChange={(e) => setFormData({ ...formData, lokasi_penyimpanan: e.target.value })}
                  placeholder="Gudang A, Dapur, dll"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Keterangan Tambahan</Label>
              <Input
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Catatan merek atau spesifikasi barang"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTambahOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 text-white hover:bg-red-700">
                {submitting ? "Menyimpan..." : "Simpan Barang"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Barang */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Data Barang</DialogTitle>
            <DialogDescription>
              Perbarui rincian informasi dan batas stok inventaris.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBarang} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit_nama_barang">Nama Barang *</Label>
              <Input
                id="edit_nama_barang"
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_kategori">Kategori</Label>
                <select
                  id="edit_kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Sembako">Sembako</option>
                  <option value="Obat-obatan">Obat-obatan</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Perlengkapan Sekolah">Perlengkapan Sekolah</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_satuan">Satuan *</Label>
                <Input
                  id="edit_satuan"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_stok_sekarang">Stok Saat Ini</Label>
                <Input
                  id="edit_stok_sekarang"
                  type="number"
                  min="0"
                  value={formData.stok_sekarang}
                  onChange={(e) => setFormData({ ...formData, stok_sekarang: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_stok_minimum">Stok Minimum (Alert)</Label>
                <Input
                  id="edit_stok_minimum"
                  type="number"
                  min="0"
                  value={formData.stok_minimum}
                  onChange={(e) => setFormData({ ...formData, stok_minimum: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_tanggal_kadaluarsa">Tgl Kadaluarsa</Label>
                <Input
                  id="edit_tanggal_kadaluarsa"
                  type="date"
                  value={formData.tanggal_kadaluarsa}
                  onChange={(e) => setFormData({ ...formData, tanggal_kadaluarsa: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_lokasi_penyimpanan">Lokasi Rak / Gudang</Label>
                <Input
                  id="edit_lokasi_penyimpanan"
                  value={formData.lokasi_penyimpanan}
                  onChange={(e) => setFormData({ ...formData, lokasi_penyimpanan: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_deskripsi">Keterangan Tambahan</Label>
              <Input
                id="edit_deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 text-white hover:bg-red-700">
                {submitting ? "Memperbarui..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus Barang */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Barang Inventaris</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus barang <strong>{selectedBarang?.nama_barang}</strong> dari inventaris? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button type="button" disabled={submitting} className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteBarang}>
              {submitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
