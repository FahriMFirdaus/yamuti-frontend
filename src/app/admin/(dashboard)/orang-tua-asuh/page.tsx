"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, HeartHandshake, Phone, Mail, User, CheckCircle2, Loader2, AlertCircle, Trash2, Edit, X } from "lucide-react";
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

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchPota = useCallback(async () => {
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
    } catch {
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, getAuthHeaders]);

  const fetchAnakOptions = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/anak-asuh?per_page=100`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setAnakOptions(json.data?.data || json.data || []);
      }
    } catch {
      // Abaikan error background
    }
  }, [apiUrl, getAuthHeaders]);

  useEffect(() => {
    fetchPota();
    fetchAnakOptions();
  }, [fetchPota, fetchAnakOptions]);

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
    setFormFeedback(null);
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
    setFormFeedback(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (pota: OrangTuaAsuh) => {
    setSelectedPota(pota);
    setFormFeedback(null);
    setIsDeleteOpen(true);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaDonatur || !formNoHp || !formAnakId) {
      setFormFeedback({ type: "error", message: "Mohon lengkapi nama donatur, no WhatsApp, dan pilih anak asuh." });
      return;
    }

    setSubmitting(true);
    setFormFeedback(null);
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
      } else {
        setFormFeedback({ type: "error", message: json.message || "Gagal menyimpan komitmen orang tua asuh." });
      }
    } catch {
      setFormFeedback({ type: "error", message: "Terjadi kesalahan jaringan saat menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPota) return;

    setSubmitting(true);
    setFormFeedback(null);
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
      } else {
        setFormFeedback({ type: "error", message: json.message || "Gagal memperbarui data." });
      }
    } catch {
      setFormFeedback({ type: "error", message: "Terjadi kesalahan jaringan saat memperbarui data." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPota) return;

    setSubmitting(true);
    setFormFeedback(null);
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
        setFormFeedback({ type: "error", message: json.message || "Gagal menghapus data." });
      }
    } catch {
      setFormFeedback({ type: "error", message: "Terjadi kesalahan jaringan saat menghapus data." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((pota) => {
      const query = search.toLowerCase().trim();
      const matchSearch =
        pota.nama_donatur.toLowerCase().includes(query) ||
        pota.no_hp.includes(query) ||
        (pota.anak_asuh?.nama?.toLowerCase().includes(query) ?? false);

      const matchStatus = filterStatus === "ALL" || pota.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [items, search, filterStatus]);

  const totalKomitmenAktif = useMemo(() => {
    return items
      .filter((i) => i.status === "Aktif")
      .reduce((acc, curr) => acc + (Number(curr.nominal_bulanan) || 0), 0);
  }, [items]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-emerald-700 dark:text-emerald-400" /> Program Orang Tua Asuh (POTA)
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 mt-1">
            Kelola komitmen donatur tetap yang mendampingi kebutuhan pendidikan dan pembinaan anak asuh binaan.
          </p>
        </div>
        <Button
          onClick={handleOpenTambah}
          className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 font-semibold text-xs sm:text-sm h-10"
        >
          <Plus className="w-4 h-4" /> Daftarkan Orang Tua Asuh
        </Button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPota} className="text-xs h-7">Coba Lagi</Button>
        </div>
      )}

      {/* Ringkasan Statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-stone-200 dark:border-zinc-800 rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
              Orang Tua Asuh Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {items.filter((i) => i.status === "Aktif").length} <span className="text-xs font-normal text-stone-500">Donatur</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" /> Komitmen bulanan berjalan aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-zinc-800 rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
              Estimasi Donasi Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
              {formatRupiah(totalKomitmenAktif)}
            </div>
            <p className="text-xs text-stone-500 mt-1">Akumulasi komitmen per bulan</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-zinc-800 rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
              Anak Yang Terbina POTA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {new Set(items.map((i) => i.anak_asuh_id || i.anak_asuh?.id).filter(Boolean)).size} <span className="text-xs font-normal text-stone-500">Anak</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">Anak asuh binaan yang memiliki orang tua asuh</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data */}
      <Card className="border-stone-200 dark:border-zinc-800 shadow-sm rounded-xl">
        <CardHeader className="border-b border-stone-150 dark:border-zinc-800/80 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400 dark:text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari donatur, no HP, atau nama anak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 focus-visible:ring-emerald-700 rounded-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs sm:text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
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
            <TableHeader className="bg-stone-50/80 dark:bg-zinc-900/60">
              <TableRow className="border-stone-200 dark:border-zinc-800">
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300 pl-6">Donatur Asuh</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Anak Asuh Binaan</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Komitmen Bulanan</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Jadwal Tagihan</TableHead>
                <TableHead className="font-bold text-xs text-stone-700 dark:text-zinc-300">Status</TableHead>
                <TableHead className="w-[160px] text-center font-bold text-xs text-stone-700 dark:text-zinc-300 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
                      <span className="text-xs">Memuat data Orang Tua Asuh...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-stone-500 dark:text-zinc-400 text-sm">
                    {search ? `Tidak ditemukan data dengan kata kunci "${search}".` : "Belum ada komitmen Orang Tua Asuh yang tercatat."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((pota) => (
                  <TableRow key={pota.id} className="border-stone-150 dark:border-zinc-800/50 hover:bg-stone-50/60 dark:hover:bg-zinc-850/60">
                    <TableCell className="pl-6">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{pota.nama_donatur}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-stone-400" /> {pota.no_hp}</span>
                        {pota.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-stone-400" /> {pota.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {pota.anak_asuh?.nama || "-"}
                      </div>
                      <div className="text-xs text-stone-500">
                        {pota.anak_asuh?.tingkat_pendidikan || "Sekolah"} • {pota.anak_asuh?.nama_sekolah || "Panti Asuhan"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-400">
                        {formatRupiah(Number(pota.nominal_bulanan) || 0)}
                      </span>
                      <span className="text-[11px] text-stone-400 block">/ bulan</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        Setiap Tgl {pota.hari_tagihan_per_bulan}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Mulai {pota.tanggal_mulai ? pota.tanggal_mulai.split("T")[0] : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pota.status === "Aktif" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none text-[11px]">Aktif</Badge>
                      ) : pota.status === "Jeda" ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none text-[11px]">Jeda</Badge>
                      ) : (
                        <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-100 border-none text-[11px]">Selesai</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPota(pota)}
                          className="text-xs h-7 px-2 border-stone-200 dark:border-zinc-700"
                        >
                          Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(pota)}
                          className="text-xs h-7 px-2 text-blue-600 border-stone-200 dark:border-zinc-700 hover:bg-blue-50"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(pota)}
                          className="text-xs h-7 px-2 text-red-600 border-stone-200 dark:border-zinc-700 hover:bg-red-50"
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
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Detail Orang Tua Asuh</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-stone-500">
              Komitmen donasi rutin untuk {selectedPota?.anak_asuh?.nama}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs sm:text-sm">
            <div className="rounded-xl bg-stone-50 dark:bg-zinc-900 p-3.5 space-y-2 border border-stone-150 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-stone-500">Donatur:</span>
                <span className="font-semibold">{selectedPota?.nama_donatur}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Kontak:</span>
                <span>{selectedPota?.no_hp}</span>
              </div>
              {selectedPota?.email && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Email:</span>
                  <span>{selectedPota.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Nominal:</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  {formatRupiah(Number(selectedPota?.nominal_bulanan) || 0)} / bulan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status Komitmen:</span>
                <span className="font-semibold">{selectedPota?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tanggal Pengingat:</span>
                <span>Setiap Tanggal {selectedPota?.hari_tagihan_per_bulan}</span>
              </div>
            </div>

            {selectedPota?.catatan_doa && (
              <div className="border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-r-lg">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Pesan & Doa Donatur:
                </span>
                <p className="text-xs italic text-stone-700 dark:text-zinc-300">
                  &ldquo;{selectedPota.catatan_doa}&rdquo;
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedPota(null)} className="text-xs rounded-lg">Tutup</Button>
            <Button
              onClick={() => {
                const message = encodeURIComponent(
                  `Halo Bapak/Ibu ${selectedPota?.nama_donatur}, kami dari Yayasan YAMUTI ingin mengabarkan perkembangan anak asuh binaan Anda (${selectedPota?.anak_asuh?.nama || 'anak asuh'}). Terima kasih atas kebaikan Anda!`
                );
                window.open(`https://wa.me/${selectedPota?.no_hp.replace(/^0/, "62")}?text=${message}`, "_blank");
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 text-xs rounded-lg font-semibold"
            >
              <Phone className="w-3.5 h-3.5" /> Kirim Kabar via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pendaftaran Orang Tua Asuh Baru */}
      <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-stone-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Daftarkan Orang Tua Asuh Baru</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-stone-500">
              Hubungkan donatur tetap dengan anak asuh pilihan untuk komitmen donasi bulanan.
            </DialogDescription>
          </DialogHeader>

          {formFeedback && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              formFeedback.type === "error" ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSimpan} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="nama_donatur" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Nama Lengkap Donatur *</Label>
              <Input
                id="nama_donatur"
                value={formNamaDonatur}
                onChange={(e) => setFormNamaDonatur(e.target.value)}
                placeholder="Contoh: H. Ahmad Subarjo"
                className="h-9 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="no_hp" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">No. WhatsApp *</Label>
                <Input
                  id="no_hp"
                  value={formNoHp}
                  onChange={(e) => setFormNoHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="h-9 text-xs sm:text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="donatur@email.com"
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="anak_asuh" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Pilih Anak Asuh Binaan *</Label>
              <select
                id="anak_asuh"
                value={formAnakId}
                onChange={(e) => setFormAnakId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:border-zinc-700 dark:bg-zinc-900"
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nominal" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Nominal / Bulan *</Label>
                <select
                  id="nominal"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="100000">Rp 100.000 / bulan</option>
                  <option value="250000">Rp 250.000 / bulan</option>
                  <option value="500000">Rp 500.000 / bulan</option>
                  <option value="1000000">Rp 1.000.000 / bulan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hari_tagihan" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Tanggal Pengingat *</Label>
                <select
                  id="hari_tagihan"
                  value={formHariTagihan}
                  onChange={(e) => setFormHariTagihan(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="1">Setiap Tanggal 1</option>
                  <option value="5">Setiap Tanggal 5</option>
                  <option value="10">Setiap Tanggal 10</option>
                  <option value="25">Setiap Tanggal 25</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catatan_doa" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Pesan / Doa Donatur (Opsional)</Label>
              <textarea
                id="catatan_doa"
                value={formCatatanDoa}
                onChange={(e) => setFormCatatanDoa(e.target.value)}
                className="flex min-h-[60px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Tuliskan harapan atau doa dari donatur..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTambahOpen(false)} className="rounded-lg text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold">
                {submitting ? "Mendaftarkan..." : "Daftarkan Sekarang"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Orang Tua Asuh */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-stone-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Edit Data Orang Tua Asuh</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-stone-500">
              Perbarui status atau rincian komitmen donatur asuh.
            </DialogDescription>
          </DialogHeader>

          {formFeedback && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              formFeedback.type === "error" ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit_nama_donatur" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Nama Lengkap Donatur *</Label>
              <Input
                id="edit_nama_donatur"
                value={formNamaDonatur}
                onChange={(e) => setFormNamaDonatur(e.target.value)}
                className="h-9 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit_no_hp" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">No. WhatsApp *</Label>
                <Input
                  id="edit_no_hp"
                  value={formNoHp}
                  onChange={(e) => setFormNoHp(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_email" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Email (Opsional)</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit_anak_asuh" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Pilih Anak Asuh *</Label>
                <select
                  id="edit_anak_asuh"
                  value={formAnakId}
                  onChange={(e) => setFormAnakId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
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

              <div className="space-y-1.5">
                <Label htmlFor="edit_status" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Status Komitmen *</Label>
                <select
                  id="edit_status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Aktif" | "Jeda" | "Selesai")}
                  className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Jeda">Jeda Sementara</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit_nominal" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Nominal / Bulan *</Label>
                <Input
                  id="edit_nominal"
                  type="number"
                  min="10000"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit_hari_tagihan" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Tanggal Pengingat *</Label>
                <Input
                  id="edit_hari_tagihan"
                  type="number"
                  min="1"
                  max="31"
                  value={formHariTagihan}
                  onChange={(e) => setFormHariTagihan(e.target.value)}
                  className="h-9 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_catatan_doa" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Pesan / Doa Donatur</Label>
              <textarea
                id="edit_catatan_doa"
                value={formCatatanDoa}
                onChange={(e) => setFormCatatanDoa(e.target.value)}
                className="flex min-h-[60px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-lg text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold">
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus Orang Tua Asuh */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-stone-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Hapus Komitmen Orang Tua Asuh</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus data orang tua asuh <strong>{selectedPota?.nama_donatur}</strong>?
            </DialogDescription>
          </DialogHeader>

          {formFeedback && (
            <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formFeedback.message}</span>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-lg text-xs">Batal</Button>
            <Button type="button" disabled={submitting} className="bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold" onClick={handleDelete}>
              {submitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
