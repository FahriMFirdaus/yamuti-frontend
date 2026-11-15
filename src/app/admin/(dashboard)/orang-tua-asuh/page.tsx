"use client";

import { useState, useEffect } from "react";
import { Plus, Search, HeartHandshake, Phone, Mail, User, CheckCircle2, Loader2, AlertCircle, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AnakAsuhOption = {
  id: string;
  nama: string;
  tingkat_pendidikan?: string;
  nama_sekolah?: string;
};

type OrangTuaAsuh = {
  id: string;
  user_id?: string | null;
  nama_donatur: string;
  no_hp: string;
  email?: string | null;
  anak_asuh_id: string;
  nominal_bulanan: number;
  status: "Aktif" | "Jeda" | "Selesai";
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  hari_tagihan_per_bulan: number;
  catatan_doa?: string | null;
  anak_asuh?: {
    id: string;
    nama: string;
    tingkat_pendidikan?: string;
    nama_sekolah?: string;
  };
};

export default function OrangTuaAsuhPage() {
  const [items, setItems] = useState<OrangTuaAsuh[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anakOptions, setAnakOptions] = useState<AnakAsuhOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPota, setSelectedPota] = useState<OrangTuaAsuh | null>(null);

  // Form State
  const [formNamaDonatur, setFormNamaDonatur] = useState("");
  const [formNoHp, setFormNoHp] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAnakId, setFormAnakId] = useState("");
  const [formNominal, setFormNominal] = useState("250000");
  const [formStatus, setFormStatus] = useState<"Aktif" | "Jeda" | "Selesai">("Aktif");
  const [formHariTagihan, setFormHariTagihan] = useState("1");
  const [formTglMulai, setFormTglMulai] = useState(new Date().toISOString().split("T")[0]);
  const [formCatatanDoa, setFormCatatanDoa] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  };

  const fetchPota = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/orang-tua-asuh?per_page=100`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setItems(json.data?.data || json.data || []);
      } else {
        setError(json.message || "Gagal memuat data Orang Tua Asuh.");
      }
    } catch (err) {
      console.error("Gagal mengambil data Orang Tua Asuh:", err);
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnakOptions = async () => {
    try {
      const res = await fetch(`${apiUrl}/anak-asuh?per_page=100`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setAnakOptions(json.data?.data || json.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data anak asuh:", err);
    }
  };

  useEffect(() => {
    fetchPota();
    fetchAnakOptions();
  }, []);

  const handleOpenTambah = () => {
    setFormNamaDonatur("");
    setFormNoHp("");
    setFormEmail("");
    setFormAnakId("");
    setFormNominal("250000");
    setFormStatus("Aktif");
    setFormHariTagihan("1");
    setFormTglMulai(new Date().toISOString().split("T")[0]);
    setFormCatatanDoa("");
    setIsTambahOpen(true);
  };

  const handleOpenEdit = (pota: OrangTuaAsuh) => {
    setSelectedPota(pota);
    setFormNamaDonatur(pota.nama_donatur);
    setFormNoHp(pota.no_hp);
    setFormEmail(pota.email || "");
    setFormAnakId(pota.anak_asuh_id);
    setFormNominal(String(pota.nominal_bulanan));
    setFormStatus(pota.status);
    setFormHariTagihan(String(pota.hari_tagihan_per_bulan));
    setFormTglMulai(pota.tanggal_mulai ? pota.tanggal_mulai.split("T")[0] : new Date().toISOString().split("T")[0]);
    setFormCatatanDoa(pota.catatan_doa || "");
    setIsEditOpen(true);
  };

  const handleOpenDelete = (pota: OrangTuaAsuh) => {
    setSelectedPota(pota);
    setIsDeleteOpen(true);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaDonatur || !formNoHp || !formAnakId) {
      alert("Mohon lengkapi nama donatur, nomor HP, dan pilih anak asuh!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_donatur: formNamaDonatur,
        no_hp: formNoHp,
        email: formEmail || null,
        anak_asuh_id: formAnakId,
        nominal_bulanan: Number(formNominal),
        status: "Aktif",
        tanggal_mulai: formTglMulai,
        hari_tagihan_per_bulan: Number(formHariTagihan),
        catatan_doa: formCatatanDoa || null,
      };

      const res = await fetch(`${apiUrl}/orang-tua-asuh`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsTambahOpen(false);
        await fetchPota();
        alert("Komitmen Orang Tua Asuh berhasil didaftarkan!");
      } else {
        alert(json.message || "Gagal menyimpan komitmen orang tua asuh.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPota) return;

    setSubmitting(true);
    try {
      const payload = {
        nama_donatur: formNamaDonatur,
        no_hp: formNoHp,
        email: formEmail || null,
        anak_asuh_id: formAnakId,
        nominal_bulanan: Number(formNominal),
        status: formStatus,
        tanggal_mulai: formTglMulai,
        hari_tagihan_per_bulan: Number(formHariTagihan),
        catatan_doa: formCatatanDoa || null,
      };

      const res = await fetch(`${apiUrl}/orang-tua-asuh/${selectedPota.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsEditOpen(false);
        setSelectedPota(null);
        await fetchPota();
        alert("Data Orang Tua Asuh berhasil diperbarui!");
      } else {
        alert(json.message || "Gagal memperbarui data.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPota) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/orang-tua-asuh/${selectedPota.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsDeleteOpen(false);
        setSelectedPota(null);
        await fetchPota();
      } else {
        alert(json.message || "Gagal menghapus data.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((pota) => {
    const matchSearch =
      pota.nama_donatur.toLowerCase().includes(search.toLowerCase()) ||
      pota.no_hp.includes(search) ||
      (pota.anak_asuh?.nama?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchStatus = filterStatus === "ALL" || pota.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-red-600" /> Program Orang Tua Asuh (POTA)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau donatur tetap yang mengasuh anak panti asuhan secara spesifik tiap bulan.
          </p>
        </div>
        <Button
          onClick={handleOpenTambah}
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Daftarkan Orang Tua Asuh
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPota}>Coba Lagi</Button>
        </div>
      )}

      {/* Ringkasan Statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Total Orang Tua Asuh Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {items.filter((i) => i.status === "Aktif").length} Donatur
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Komitmen bulanan berjalan aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Estimasi Donasi Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              Rp{" "}
              {items
                .filter((i) => i.status === "Aktif")
                .reduce((acc, curr) => acc + (Number(curr.nominal_bulanan) || 0), 0)
                .toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Akumulasi komitmen per bulan</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Anak Yang Memiliki Orang Tua Asuh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {new Set(items.map((i) => i.anak_asuh_id || i.anak_asuh?.id).filter(Boolean)).size} Anak
            </div>
            <p className="text-xs text-zinc-500 mt-1">Anak asuh binaan dengan orang tua asuh</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama donatur, no HP, atau nama anak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Jeda">Jeda Sementara</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 pl-6">Donatur Asuh</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Anak Asuh Binaan</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Komitmen Bulanan</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Jadwal Tagihan</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                <TableHead className="w-[180px] text-center font-semibold text-zinc-900 dark:text-zinc-100 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                      <span>Memuat data Orang Tua Asuh...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                    Belum ada data Orang Tua Asuh yang terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((pota) => (
                  <TableRow key={pota.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <TableCell className="pl-6">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{pota.nama_donatur}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {pota.no_hp}</span>
                        {pota.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {pota.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-red-500" />
                        {pota.anak_asuh?.nama || "-"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {pota.anak_asuh?.tingkat_pendidikan || "Sekolah"} • {pota.anak_asuh?.nama_sekolah || "Panti Asuhan"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        Rp {Number(pota.nominal_bulanan).toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-zinc-400 block">/ bulan</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        Setiap Tgl {pota.hari_tagihan_per_bulan}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Mulai {pota.tanggal_mulai ? pota.tanggal_mulai.split("T")[0] : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pota.status === "Aktif" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Aktif</Badge>
                      ) : pota.status === "Jeda" ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Jeda</Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none">Selesai</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPota(pota)}
                          className="text-xs h-8"
                        >
                          Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(pota)}
                          className="text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(pota)}
                          className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Detail & Doa Donatur */}
      <Dialog open={!!selectedPota && !isEditOpen && !isDeleteOpen} onOpenChange={() => setSelectedPota(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Orang Tua Asuh</DialogTitle>
            <DialogDescription>
              Komitmen donasi rutin untuk {selectedPota?.anak_asuh?.nama}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Donatur:</span>
                <span className="font-bold">{selectedPota?.nama_donatur}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Kontak:</span>
                <span>{selectedPota?.no_hp}</span>
              </div>
              {selectedPota?.email && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email:</span>
                  <span>{selectedPota.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Nominal:</span>
                <span className="font-bold text-red-600">
                  Rp {Number(selectedPota?.nominal_bulanan).toLocaleString("id-ID")} / bulan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status Komitmen:</span>
                <span className="font-semibold">{selectedPota?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tanggal Pengingat:</span>
                <span>Setiap Tanggal {selectedPota?.hari_tagihan_per_bulan}</span>
              </div>
            </div>

            {selectedPota?.catatan_doa && (
              <div className="border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-r-md">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Pesan & Doa Donatur:
                </span>
                <p className="text-xs italic text-zinc-700 dark:text-zinc-300">
                  &ldquo;{selectedPota.catatan_doa}&rdquo;
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPota(null)}>Tutup</Button>
            <Button
              onClick={() => {
                const message = encodeURIComponent(
                  `Halo Bapak/Ibu ${selectedPota?.nama_donatur}, kami dari Yayasan YAMUTI ingin mengabarkan perkembangan anak asuh binaan Anda (${selectedPota?.anak_asuh?.nama || 'anak asuh'}). Terima kasih atas kebaikan Anda!`
                );
                window.open(`https://wa.me/${selectedPota?.no_hp.replace(/^0/, "62")}?text=${message}`, "_blank");
              }}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Kirim Kabar via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pendaftaran Orang Tua Asuh Baru */}
      <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Daftarkan Orang Tua Asuh Baru</DialogTitle>
            <DialogDescription>
              Hubungkan donatur tetap dengan anak asuh pilihan untuk komitmen donasi bulanan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSimpan} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nama_donatur">Nama Lengkap Donatur *</Label>
              <Input
                id="nama_donatur"
                value={formNamaDonatur}
                onChange={(e) => setFormNamaDonatur(e.target.value)}
                placeholder="Contoh: H. Ahmad Subarjo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="no_hp">No. WhatsApp *</Label>
                <Input
                  id="no_hp"
                  value={formNoHp}
                  onChange={(e) => setFormNoHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="donatur@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anak_asuh">Pilih Anak Asuh Binaan *</Label>
              <select
                id="anak_asuh"
                value={formAnakId}
                onChange={(e) => setFormAnakId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">-- Pilih Anak Asuh --</option>
                {anakOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nama} ({a.tingkat_pendidikan || "Sekolah"} - {a.nama_sekolah || "Panti"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nominal">Nominal Komitmen / Bulan *</Label>
                <select
                  id="nominal"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="100000">Rp 100.000 / bulan</option>
                  <option value="250000">Rp 250.000 / bulan</option>
                  <option value="500000">Rp 500.000 / bulan</option>
                  <option value="1000000">Rp 1.000.000 / bulan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hari_tagihan">Tanggal Pengingat *</Label>
                <select
                  id="hari_tagihan"
                  value={formHariTagihan}
                  onChange={(e) => setFormHariTagihan(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="1">Setiap Tanggal 1</option>
                  <option value="5">Setiap Tanggal 5</option>
                  <option value="10">Setiap Tanggal 10</option>
                  <option value="25">Setiap Tanggal 25</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan_doa">Pesan / Doa Donatur untuk Anak Asuh (Opsional)</Label>
              <textarea
                id="catatan_doa"
                value={formCatatanDoa}
                onChange={(e) => setFormCatatanDoa(e.target.value)}
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tuliskan harapan atau doa dari donatur..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTambahOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                {submitting ? "Mendaftarkan..." : "Daftarkan Sekarang"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Orang Tua Asuh */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Orang Tua Asuh</DialogTitle>
            <DialogDescription>
              Perbarui status atau komitmen donatur asuh.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit_nama_donatur">Nama Lengkap Donatur *</Label>
              <Input
                id="edit_nama_donatur"
                value={formNamaDonatur}
                onChange={(e) => setFormNamaDonatur(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_no_hp">No. WhatsApp *</Label>
                <Input
                  id="edit_no_hp"
                  value={formNoHp}
                  onChange={(e) => setFormNoHp(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email (Opsional)</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_anak_asuh">Pilih Anak Asuh *</Label>
                <select
                  id="edit_anak_asuh"
                  value={formAnakId}
                  onChange={(e) => setFormAnakId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">-- Pilih Anak Asuh --</option>
                  {anakOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_status">Status Komitmen *</Label>
                <select
                  id="edit_status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Jeda">Jeda Sementara</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_nominal">Nominal Komitmen / Bulan *</Label>
                <Input
                  id="edit_nominal"
                  type="number"
                  min="10000"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_hari_tagihan">Tanggal Pengingat *</Label>
                <Input
                  id="edit_hari_tagihan"
                  type="number"
                  min="1"
                  max="31"
                  value={formHariTagihan}
                  onChange={(e) => setFormHariTagihan(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_catatan_doa">Pesan / Doa Donatur</Label>
              <textarea
                id="edit_catatan_doa"
                value={formCatatanDoa}
                onChange={(e) => setFormCatatanDoa(e.target.value)}
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus Orang Tua Asuh */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Komitmen Orang Tua Asuh</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data orang tua asuh <strong>{selectedPota?.nama_donatur}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button type="button" disabled={submitting} className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
              {submitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
