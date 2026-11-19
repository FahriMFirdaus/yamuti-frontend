"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  ArrowRightLeft,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
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
import { getSession } from "next-auth/react";

type Inventaris = {
  id: string;
  nama_barang: string;
  kategori: string;
  deskripsi?: string | null;
  stok_sekarang: number;
  satuan: string;
  tanggal_kadaluarsa?: string | null;
  lokasi_penyimpanan?: string | null;
  stok_minimum?: number;
};

type FormDataBarang = {
  nama_barang: string;
  kategori: string;
  deskripsi: string;
  stok_sekarang: number;
  satuan: string;
  tanggal_kadaluarsa: string;
  lokasi_penyimpanan: string;
  stok_minimum: number;
};

const DEFAULT_FORM_DATA: FormDataBarang = {
  nama_barang: "",
  kategori: "Sembako",
  deskripsi: "",
  stok_sekarang: 0,
  satuan: "Kg",
  tanggal_kadaluarsa: "",
  lokasi_penyimpanan: "",
  stok_minimum: 5,
};

export default function InventarisPage() {
  const [items, setItems] = useState<Inventaris[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("ALL");
  const [filterStokStatus, setFilterStokStatus] = useState<"ALL" | "MENIPIS" | "EXPIRING">("ALL");

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal States
  const [selectedBarang, setSelectedBarang] = useState<Inventaris | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isMutasiOpen, setIsMutasiOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State Mutasi
  const [mutasiTipe, setMutasiTipe] = useState<"masuk" | "keluar">("masuk");
  const [mutasiJumlah, setMutasiJumlah] = useState("");
  const [mutasiKeterangan, setMutasiKeterangan] = useState("");
  const [mutasiTanggal, setMutasiTanggal] = useState(new Date().toISOString().split("T")[0]);

  // Form State Tambah/Edit Barang
  const [formData, setFormData] = useState<FormDataBarang>(DEFAULT_FORM_DATA);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthToken = async () => {
    const session = await getSession();
    const token =
      session?.accessToken ||
      (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
    return token;
  };

  const fetchInventaris = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/inventaris?per_page=100`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setItems(json.data?.data || json.data || []);
      } else {
        setError(json.message || "Gagal memuat data inventaris.");
      }
    } catch (err: unknown) {
      console.error("Error fetching inventaris:", err);
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch(`${apiUrl}/inventaris?per_page=100`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();
        if (res.ok && json.success && !ignore) {
          setItems(json.data?.data || json.data || []);
        } else if (!ignore) {
          setError(json.message || "Gagal memuat data inventaris.");
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Error fetching inventaris:", err);
          setError("Terjadi kesalahan saat menghubungi server.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  // Dynamic Categories from Data
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.kategori) set.add(item.kategori);
    });
    return Array.from(set).sort();
  }, [items]);

  // Stock calculations
  const totalBarang = items.length;
  const totalMenipis = useMemo(() => {
    return items.filter((b) => b.stok_sekarang <= (b.stok_minimum ?? 5)).length;
  }, [items]);

  const totalKadaluarsa = useMemo(() => {
    return items.filter((b) => {
      if (!b.tanggal_kadaluarsa) return false;
      const expDate = new Date(b.tanggal_kadaluarsa);
      if (isNaN(expDate.getTime())) return false;
      
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + 30);
      return expDate <= threshold;
    }).length;
  }, [items]);

  // Open Form Handlers
  const handleOpenTambah = () => {
    setFormMode("create");
    setSelectedBarang(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (barang: Inventaris) => {
    setFormMode("edit");
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
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (barang: Inventaris) => {
    setSelectedBarang(barang);
    setIsDeleteOpen(true);
  };

  const handleOpenMutasi = (barang: Inventaris) => {
    setSelectedBarang(barang);
    setMutasiTipe("masuk");
    setMutasiJumlah("");
    setMutasiKeterangan("");
    setMutasiTanggal(new Date().toISOString().split("T")[0]);
    setFormError(null);
    setIsMutasiOpen(true);
  };

  // Submit Handler for Create / Update Barang
  const handleSaveBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_barang.trim() || !formData.satuan.trim()) {
      setFormError("Nama barang dan satuan wajib diisi!");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const token = await getAuthToken();
      const payload = {
        nama_barang: formData.nama_barang.trim(),
        kategori: formData.kategori,
        deskripsi: formData.deskripsi.trim() || null,
        stok_sekarang: Number(formData.stok_sekarang) || 0,
        satuan: formData.satuan.trim(),
        tanggal_kadaluarsa: formData.tanggal_kadaluarsa || null,
        lokasi_penyimpanan: formData.lokasi_penyimpanan.trim() || null,
        stok_minimum: Number(formData.stok_minimum) || 0,
      };

      const url =
        formMode === "create"
          ? `${apiUrl}/inventaris`
          : `${apiUrl}/inventaris/${selectedBarang?.id}`;
      const method = formMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsFormOpen(false);
        setFeedbackMessage({
          text: `Barang "${formData.nama_barang}" berhasil ${
            formMode === "create" ? "ditambahkan" : "diperbarui"
          }.`,
          type: "success",
        });
        fetchInventaris(false);
      } else {
        setFormError(json.message || "Gagal menyimpan data barang.");
      }
    } catch (err: unknown) {
      console.error(err);
      setFormError("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteBarang = async () => {
    if (!selectedBarang) return;

    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/inventaris/${selectedBarang.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsDeleteOpen(false);
        setSelectedBarang(null);
        setFeedbackMessage({
          text: `Barang "${selectedBarang.nama_barang}" berhasil dihapus dari inventaris.`,
          type: "success",
        });
        fetchInventaris(false);
      } else {
        setFeedbackMessage({
          text: json.message || "Gagal menghapus data barang.",
          type: "error",
        });
        setIsDeleteOpen(false);
      }
    } catch (err: unknown) {
      console.error(err);
      setFeedbackMessage({
        text: "Terjadi kesalahan koneksi saat menghapus barang.",
        type: "error",
      });
      setIsDeleteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Mutasi Handler
  const handleSaveMutasi = async () => {
    if (!selectedBarang) return;
    const jumlahNum = Number(mutasiJumlah);
    if (!mutasiJumlah || isNaN(jumlahNum) || jumlahNum <= 0) {
      setFormError("Jumlah mutasi harus berupa angka positif lebih dari 0.");
      return;
    }

    if (mutasiTipe === "keluar" && jumlahNum > selectedBarang.stok_sekarang) {
      setFormError(
        `Stok tidak mencukupi! Stok saat ini ${selectedBarang.stok_sekarang} ${selectedBarang.satuan}.`
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const token = await getAuthToken();
      const payload = {
        tipe: mutasiTipe,
        jumlah: jumlahNum,
        keterangan: mutasiKeterangan.trim() || null,
        tanggal_mutasi: mutasiTanggal,
      };

      const res = await fetch(`${apiUrl}/inventaris/${selectedBarang.id}/mutasi`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsMutasiOpen(false);
        setSelectedBarang(null);
        setFeedbackMessage({
          text: `Mutasi ${mutasiTipe === "masuk" ? "masuk" : "keluar"} ${jumlahNum} ${
            selectedBarang.satuan
          } untuk "${selectedBarang.nama_barang}" berhasil dicatat.`,
          type: "success",
        });
        fetchInventaris(false);
      } else {
        setFormError(json.message || "Gagal mencatat mutasi stok.");
      }
    } catch (err: unknown) {
      console.error(err);
      setFormError("Terjadi kesalahan jaringan saat mencatat mutasi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Date Check Helper (End of Day comparison)
  const getExpirationStatus = (expDateStr?: string | null) => {
    if (!expDateStr) return { status: "NONE", label: "-" };

    const expStr = expDateStr.split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 30);
    const soonStr = soonDate.toISOString().split("T")[0];

    const expDate = new Date(expDateStr);
    const formatted = isNaN(expDate.getTime())
      ? expStr
      : expDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    if (expStr < todayStr) {
      return { status: "EXPIRED", label: formatted, badge: "Kadaluarsa!" };
    }
    if (expStr <= soonStr) {
      return { status: "EXPIRING_SOON", label: formatted, badge: "Segera Expire" };
    }
    return { status: "VALID", label: formatted };
  };

  // Filtered List
  const filteredItems = items.filter((barang) => {
    const matchSearch =
      !search.trim() ||
      barang.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
      (barang.lokasi_penyimpanan?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchKategori = filterKategori === "ALL" || barang.kategori === filterKategori;

    let matchStokStatus = true;
    if (filterStokStatus === "MENIPIS") {
      matchStokStatus = barang.stok_sekarang <= (barang.stok_minimum ?? 5);
    } else if (filterStokStatus === "EXPIRING") {
      const exp = getExpirationStatus(barang.tanggal_kadaluarsa);
      matchStokStatus = exp.status === "EXPIRED" || exp.status === "EXPIRING_SOON";
    }

    return matchSearch && matchKategori && matchStokStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Manajemen Inventaris
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola stok logistik, sembako, dan aset panti asuhan YAMUTI secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInventaris()}
            disabled={loading}
            className="gap-2 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2"
            size="sm"
            onClick={handleOpenTambah}
          >
            <Plus className="h-4 w-4" /> Tambah Barang
          </Button>
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

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchInventaris()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setFilterStokStatus("ALL")}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStokStatus === "ALL"
              ? "bg-zinc-50 border-zinc-400 ring-1 ring-zinc-400 dark:bg-zinc-800/80 dark:border-zinc-600"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Komoditas</p>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{totalBarang} Item</h3>
        </button>

        <button
          type="button"
          onClick={() => setFilterStokStatus(filterStokStatus === "MENIPIS" ? "ALL" : "MENIPIS")}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStokStatus === "MENIPIS"
              ? "bg-rose-50/80 border-rose-300 ring-1 ring-rose-300 dark:bg-rose-950/40 dark:border-rose-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Stok Menipis (Alert)</p>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-2">{totalMenipis} Item</h3>
        </button>

        <button
          type="button"
          onClick={() => setFilterStokStatus(filterStokStatus === "EXPIRING" ? "ALL" : "EXPIRING")}
          className={`text-left p-4 rounded-xl border transition-all ${
            filterStokStatus === "EXPIRING"
              ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300 dark:bg-amber-950/40 dark:border-amber-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Perlu Dicek (Kadaluarsa)</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">{totalKadaluarsa} Item</h3>
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Filter Selector */}
          <div className="flex items-center gap-2">
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-xs"
            >
              <option value="ALL">Semua Kategori ({items.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({items.filter((i) => i.kategori === cat).length})
                </option>
              ))}
            </select>

            {filterStokStatus !== "ALL" && (
              <Badge
                variant="outline"
                className="cursor-pointer text-xs py-1 gap-1 bg-zinc-100 dark:bg-zinc-800"
                onClick={() => setFilterStokStatus("ALL")}
              >
                Filter: {filterStokStatus === "MENIPIS" ? "Stok Menipis" : "Kadaluarsa"} ×
              </Badge>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Cari nama barang atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
            />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/60">
                <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                  <TableHead className="min-w-[220px] pl-6 py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Nama Barang
                  </TableHead>
                  <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Kategori & Lokasi
                  </TableHead>
                  <TableHead className="min-w-[130px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Stok Tersedia
                  </TableHead>
                  <TableHead className="min-w-[150px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Kadaluarsa
                  </TableHead>
                  <TableHead className="min-w-[120px] py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Kondisi
                  </TableHead>
                  <TableHead className="w-[80px] text-center pr-6 py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                        <span className="text-sm">Memuat data inventaris yayasan...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Package className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                          Tidak ada data barang
                        </p>
                        <p className="text-xs text-zinc-400">
                          {search
                            ? "Tidak ada hasil yang sesuai dengan pencarian Anda."
                            : "Belum ada item logistik yang tersimpan."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((barang) => {
                    const isMenipis = barang.stok_sekarang <= (barang.stok_minimum ?? 5);
                    const expInfo = getExpirationStatus(barang.tanggal_kadaluarsa);

                    return (
                      <TableRow
                        key={barang.id}
                        className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/60"
                      >
                        <TableCell className="pl-6 align-top py-4">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {barang.nama_barang}
                          </p>
                          {barang.deskripsi && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-xs">
                              {barang.deskripsi}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <Badge
                            variant="outline"
                            className="text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 font-normal"
                          >
                            {barang.kategori || "Umum"}
                          </Badge>
                          {barang.lokasi_penyimpanan && (
                            <span className="text-[11px] text-zinc-400 block mt-1">
                              📍 {barang.lokasi_penyimpanan}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-base font-bold ${
                                isMenipis
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-zinc-900 dark:text-zinc-100"
                              }`}
                            >
                              {barang.stok_sekarang}
                            </span>
                            <span className="text-xs text-zinc-500">{barang.satuan}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            Min: {barang.stok_minimum ?? 5} {barang.satuan}
                          </span>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                            {expInfo.label}
                          </span>
                          {expInfo.badge && (
                            <span
                              className={`block text-[10px] font-bold mt-0.5 ${
                                expInfo.status === "EXPIRED" ? "text-rose-600" : "text-amber-600"
                              }`}
                            >
                              {expInfo.badge}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          {isMenipis ? (
                            <Badge className="bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 text-xs gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Stok Menipis
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Aman
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center pr-6 align-top py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 mx-auto items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                className="cursor-pointer text-emerald-700 dark:text-emerald-400 font-medium focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
                                onClick={() => handleOpenMutasi(barang)}
                              >
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> Catat Mutasi
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleOpenEdit(barang)}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Edit Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                onClick={() => handleOpenDelete(barang)}
                              >
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
          </div>
        </CardContent>
      </Card>

      {/* Modal Mutasi Stok */}
      <Dialog open={isMutasiOpen} onOpenChange={setIsMutasiOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Catat Mutasi Stok</DialogTitle>
            <DialogDescription>
              Perbarui pergerakan stok untuk <strong>{selectedBarang?.nama_barang}</strong>. Saat ini
              tersedia {selectedBarang?.stok_sekarang} {selectedBarang?.satuan}.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1.5">
              <Label>Jenis Mutasi</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mutasiTipe === "masuk" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("masuk")}
                  className={mutasiTipe === "masuk" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                >
                  Barang Masuk (+)
                </Button>
                <Button
                  type="button"
                  variant={mutasiTipe === "keluar" ? "default" : "outline"}
                  onClick={() => setMutasiTipe("keluar")}
                  className={mutasiTipe === "keluar" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                >
                  Barang Keluar (-)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="mutasi_jumlah" className="text-right">
                Jumlah *
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="mutasi_jumlah"
                  type="number"
                  min="1"
                  value={mutasiJumlah}
                  onChange={(e) => setMutasiJumlah(e.target.value)}
                  placeholder="Contoh: 10"
                  required
                />
                <span className="text-sm font-medium text-zinc-500 min-w-10">
                  {selectedBarang?.satuan}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="mutasi_tanggal" className="text-right">
                Tanggal *
              </Label>
              <Input
                id="mutasi_tanggal"
                type="date"
                value={mutasiTanggal}
                onChange={(e) => setMutasiTanggal(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="mutasi_keterangan" className="text-right">
                Catatan
              </Label>
              <Input
                id="mutasi_keterangan"
                value={mutasiKeterangan}
                onChange={(e) => setMutasiKeterangan(e.target.value)}
                placeholder="Misal: Dari donatur / Masak harian"
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMutasiOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSaveMutasi}
            >
              {submitting ? "Menyimpan..." : "Simpan Mutasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Modal Tambah & Edit Barang */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {formMode === "create" ? "Tambah Barang Baru" : "Edit Rincian Barang"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Daftarkan komoditas atau logistik baru ke database yayasan."
                : `Perbarui informasi dan ambang batas stok untuk "${selectedBarang?.nama_barang}".`}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveBarang} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="form_nama_barang">Nama Barang *</Label>
              <Input
                id="form_nama_barang"
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                placeholder="Contoh: Beras Premium RojoLele"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="form_kategori">Kategori</Label>
                <select
                  id="form_kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-background px-3 py-1.5 text-sm"
                >
                  <option value="Sembako">Sembako</option>
                  <option value="Obat-obatan">Obat-obatan</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Perlengkapan Sekolah">Perlengkapan Sekolah</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="form_satuan">Satuan *</Label>
                <Input
                  id="form_satuan"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  placeholder="Kg, Liter, Pcs, Box..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="form_stok_sekarang">
                  {formMode === "create" ? "Stok Awal" : "Stok Saat Ini"}
                </Label>
                <Input
                  id="form_stok_sekarang"
                  type="number"
                  min="0"
                  value={formData.stok_sekarang}
                  onChange={(e) =>
                    setFormData({ ...formData, stok_sekarang: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="form_stok_minimum">Stok Minimum (Alert)</Label>
                <Input
                  id="form_stok_minimum"
                  type="number"
                  min="0"
                  value={formData.stok_minimum}
                  onChange={(e) =>
                    setFormData({ ...formData, stok_minimum: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="form_tanggal_kadaluarsa">Tgl Kadaluarsa</Label>
                <Input
                  id="form_tanggal_kadaluarsa"
                  type="date"
                  value={formData.tanggal_kadaluarsa}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_kadaluarsa: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="form_lokasi_penyimpanan">Lokasi Rak / Gudang</Label>
                <Input
                  id="form_lokasi_penyimpanan"
                  value={formData.lokasi_penyimpanan}
                  onChange={(e) =>
                    setFormData({ ...formData, lokasi_penyimpanan: e.target.value })
                  }
                  placeholder="Gudang A, Dapur, dll"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="form_deskripsi">Keterangan Tambahan</Label>
              <Input
                id="form_deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Catatan merek atau keterangan khusus"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting
                  ? "Menyimpan..."
                  : formMode === "create"
                  ? "Simpan Barang"
                  : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus Barang */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Hapus Barang Inventaris</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus barang <strong>{selectedBarang?.nama_barang}</strong> dari
              inventaris yayasan? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleDeleteBarang}
            >
              {submitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
