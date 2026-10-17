"use client";

import { useState, useEffect } from "react";
import { Plus, Search, HeartHandshake, Calendar, Phone, Mail, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  nama_donatur: string;
  no_hp: string;
  email?: string;
  nominal_bulanan: number;
  status: "Aktif" | "Jeda" | "Selesai";
  tanggal_mulai: string;
  hari_tagihan_per_bulan: number;
  catatan_doa?: string;
  anak_asuh?: {
    id: string;
    nama: string;
    tingkat_pendidikan?: string;
    nama_sekolah?: string;
  };
};

const MOCK_POTA: OrangTuaAsuh[] = [
  {
    id: "POTA-001",
    nama_donatur: "H. Ridwan Kamil",
    no_hp: "081234567890",
    email: "ridwan@example.com",
    nominal_bulanan: 500000,
    status: "Aktif",
    tanggal_mulai: "2025-01-10",
    hari_tagihan_per_bulan: 5,
    catatan_doa: "Semoga kelak menjadi hafiz Quran yang cerdas dan berbakti kepada nusa dan bangsa.",
    anak_asuh: {
      id: "1",
      nama: "Muhammad Yusuf",
      tingkat_pendidikan: "SMP",
      nama_sekolah: "SMP Negeri 1 Tasikmalaya",
    },
  },
  {
    id: "POTA-002",
    nama_donatur: "dr. Nurul Hidayati",
    no_hp: "081398765432",
    email: "nurul.h@example.com",
    nominal_bulanan: 250000,
    status: "Aktif",
    tanggal_mulai: "2025-06-01",
    hari_tagihan_per_bulan: 1,
    catatan_doa: "Semoga sehat selalu, lancar sekolahnya, dan menjadi dokter yang menolong banyak orang.",
    anak_asuh: {
      id: "2",
      nama: "Aisyah Putri",
      tingkat_pendidikan: "SD",
      nama_sekolah: "SDIT Al-Ittihad",
    },
  },
  {
    id: "POTA-003",
    nama_donatur: "Bpk. Bambang Sutrisno",
    no_hp: "082155443322",
    email: "bambang.s@example.com",
    nominal_bulanan: 150000,
    status: "Jeda",
    tanggal_mulai: "2024-03-15",
    hari_tagihan_per_bulan: 10,
    catatan_doa: "Tetap semangat belajar walau ada keterbatasan.",
    anak_asuh: {
      id: "3",
      nama: "Rizky Ramadhan",
      tingkat_pendidikan: "SMA/SMK",
      nama_sekolah: "SMKN 2 Tasikmalaya",
    },
  },
];

export default function OrangTuaAsuhPage() {
  const [items, setItems] = useState<OrangTuaAsuh[]>(MOCK_POTA);
  const [anakOptions, setAnakOptions] = useState<AnakAsuhOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [selectedPota, setSelectedPota] = useState<OrangTuaAsuh | null>(null);

  // Form State
  const [formNamaDonatur, setFormNamaDonatur] = useState("");
  const [formNoHp, setFormNoHp] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAnakId, setFormAnakId] = useState("");
  const [formNominal, setFormNominal] = useState("250000");
  const [formHariTagihan, setFormHariTagihan] = useState("1");
  const [formTglMulai, setFormTglMulai] = useState(new Date().toISOString().split("T")[0]);
  const [formCatatanDoa, setFormCatatanDoa] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    // Ambil daftar anak asuh untuk pilihan dropdown
    const fetchAnak = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`${apiUrl}/anak-asuh?per_page=100`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json();
          setAnakOptions(json.data?.data || json.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data anak asuh:", err);
      }
    };

    fetchAnak();
  }, [apiUrl]);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaDonatur || !formNoHp || !formAnakId) {
      alert("Mohon lengkapi nama donatur, nomor HP, dan pilih anak asuh!");
      return;
    }

    setSubmitting(true);
    const selectedAnakObj = anakOptions.find((a) => a.id === formAnakId);

    const newItem: OrangTuaAsuh = {
      id: `POTA-00${items.length + 1}`,
      nama_donatur: formNamaDonatur,
      no_hp: formNoHp,
      email: formEmail,
      nominal_bulanan: Number(formNominal),
      status: "Aktif",
      tanggal_mulai: formTglMulai,
      hari_tagihan_per_bulan: Number(formHariTagihan),
      catatan_doa: formCatatanDoa,
      anak_asuh: {
        id: formAnakId,
        nama: selectedAnakObj?.nama || "Anak Asuh",
        tingkat_pendidikan: selectedAnakObj?.tingkat_pendidikan,
        nama_sekolah: selectedAnakObj?.nama_sekolah,
      },
    };

    setItems([newItem, ...items]);
    setIsTambahOpen(false);
    setSubmitting(false);
    alert("Komitmen Orang Tua Asuh berhasil didaftarkan!");

    // Reset Form
    setFormNamaDonatur("");
    setFormNoHp("");
    setFormEmail("");
    setFormAnakId("");
    setFormCatatanDoa("");
  };

  const filteredItems = items.filter((pota) => {
    const matchSearch =
      pota.nama_donatur.toLowerCase().includes(search.toLowerCase()) ||
      pota.no_hp.includes(search) ||
      (pota.anak_asuh?.nama.toLowerCase().includes(search.toLowerCase()) ?? false);

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
            Pantau donatur tetap yang mengasuh anak panti secara spesifik tiap bulan.
          </p>
        </div>
        <Button
          onClick={() => setIsTambahOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Daftarkan Orang Tua Asuh
        </Button>
      </div>

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
              <CheckCircle2 className="w-3.5 h-3.5" /> Komitmen bulanan berjalan lancar
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
                .reduce((acc, curr) => acc + curr.nominal_bulanan, 0)
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
              {new Set(items.map((i) => i.anak_asuh?.id)).size} Anak
            </div>
            <p className="text-xs text-zinc-500 mt-1">Dari total anak asuh yayasan</p>
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
                <TableHead className="w-[120px] text-center font-semibold text-zinc-900 dark:text-zinc-100 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((pota) => (
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
                      Rp {pota.nominal_bulanan.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-zinc-400 block">/ bulan</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      Setiap Tgl {pota.hari_tagihan_per_bulan}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Mulai {pota.tanggal_mulai}
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
                        onClick={() => {
                          const message = encodeURIComponent(
                            `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${pota.nama_donatur},\n\nKami dari Yayasan YAMUTI ingin mengabarkan perkembangan ananda ${pota.anak_asuh?.nama || 'anak asuh binaan'}. Alhamdulillah ananda dalam keadaan sehat wal'afiat dan terus bersemangat menuntut ilmu di ${pota.anak_asuh?.nama_sekolah || 'sekolah'}.\n\nTerima kasih yang sebesar-besarnya atas komitmen Bapak/Ibu dalam program Orang Tua Asuh YAMUTI. Semoga Allah SWT membalas dengan keberkahan berlipat ganda.\n\nWassalamu'alaikum Wr. Wb.\nPengurus Yayasan YAMUTI`
                          );
                          window.open(`https://wa.me/${pota.no_hp.replace(/^0/, "62")}?text=${message}`, "_blank");
                        }}
                        className="text-xs h-8 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400"
                        title="Kirim Kabar Perkembangan via WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5 mr-1" /> WA
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Detail & Doa Donatur */}
      <Dialog open={!!selectedPota} onOpenChange={() => setSelectedPota(null)}>
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
              <div className="flex justify-between">
                <span className="text-zinc-500">Nominal:</span>
                <span className="font-bold text-red-600">
                  Rp {selectedPota?.nominal_bulanan.toLocaleString("id-ID")} / bulan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tanggal Tagihan:</span>
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
                  `Halo Bapak/Ibu ${selectedPota?.nama_donatur}, kami dari Yayasan YAMUTI ingin mengabarkan perkembangan anak asuh binaan Anda (${selectedPota?.anak_asuh?.nama}). Terima kasih atas kebaikan Anda!`
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
    </div>
  );
}
