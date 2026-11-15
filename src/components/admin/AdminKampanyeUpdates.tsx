"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, DollarSign, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface AdminKampanyeUpdatesProps {
  kampanyeId: string;
  initialUpdates?: any[];
  onUpdateChanged?: () => void;
}

export function AdminKampanyeUpdates({ kampanyeId, initialUpdates = [], onUpdateChanged }: AdminKampanyeUpdatesProps) {
  const [updates, setUpdates] = useState<any[]>(initialUpdates);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [danaDisalurkan, setDanaDisalurkan] = useState("");
  const [tanggalPenyaluran, setTanggalPenyaluran] = useState("");
  const [fotoUrlInput, setFotoUrlInput] = useState("");
  const [fotoList, setFotoList] = useState<string[]>([]);

  const handleAddFotoUrl = () => {
    if (!fotoUrlInput.trim()) return;
    setFotoList([...fotoList, fotoUrlInput.trim()]);
    setFotoUrlInput("");
  };

  const handleRemoveFoto = (index: number) => {
    setFotoList(fotoList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !konten.trim()) {
      alert("Judul dan isi kabar penyaluran wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/${kampanyeId}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          judul,
          konten,
          dana_disalurkan: danaDisalurkan ? Number(danaDisalurkan) : 0,
          tanggal_penyaluran: tanggalPenyaluran || null,
          foto_urls: fotoList,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan kabar penyaluran");
      }

      const resData = await res.json();
      const newUpdate = resData.data;

      setUpdates([newUpdate, ...updates]);
      // Reset form
      setJudul("");
      setKonten("");
      setDanaDisalurkan("");
      setTanggalPenyaluran("");
      setFotoList([]);
      setIsFormOpen(false);

      if (onUpdateChanged) onUpdateChanged();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memposting kabar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kabar penyaluran ini?")) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/updates/${updateId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      setUpdates(updates.filter((u) => u.id !== updateId));
      if (onUpdateChanged) onUpdateChanged();
    } catch (err) {
      alert("Gagal menghapus kabar penyaluran");
    }
  };

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Kabar Penyaluran Dana</span>
            <Badge variant="secondary" className="rounded-full">
              {updates.length} Kabar
            </Badge>
          </CardTitle>
          <CardDescription>
            Dokumentasi penyaluran dana yang dapat dilihat donatur secara publik
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isFormOpen ? "Tutup Form" : "Tambah Kabar"}
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Form Posting Penyaluran Dana Baru
            </h4>

            <div className="space-y-1.5">
              <Label className="text-xs">Judul Kabar / Agenda Penyaluran *</Label>
              <Input
                placeholder="Contoh: Penyaluran 50 Paket Sembako & Santunan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nominal Dana Disalurkan (Rp)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 5000000"
                  value={danaDisalurkan}
                  onChange={(e) => setDanaDisalurkan(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Penyaluran</Label>
                <Input
                  type="date"
                  value={tanggalPenyaluran}
                  onChange={(e) => setTanggalPenyaluran(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Laporan Lengkap & Cerita Penyaluran *</Label>
              <Textarea
                placeholder="Tuliskan rincian pembelian barang, proses pembagian, serta ucapan dari anak-anak asuh..."
                rows={4}
                value={konten}
                onChange={(e) => setKonten(e.target.value)}
                required
              />
            </div>

            {/* Input Foto URL */}
            <div className="space-y-2">
              <Label className="text-xs">URL Foto Dokumentasi / Struk</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://contoh.com/foto-penyaluran.jpg"
                  value={fotoUrlInput}
                  onChange={(e) => setFotoUrlInput(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddFotoUrl}>
                  Tambah
                </Button>
              </div>

              {fotoList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {fotoList.map((url, idx) => (
                    <div key={idx} className="relative group/pic w-20 h-20 rounded-xl overflow-hidden border">
                      <img src={url} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(idx)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/pic:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Publikasikan Kabar
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* List Kabar yang Ada */}
        {updates.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Belum ada kabar penyaluran yang diposting.
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      {item.tanggal_penyaluran
                        ? format(new Date(item.tanggal_penyaluran), "dd MMMM yyyy", { locale: idLocale })
                        : format(new Date(item.created_at), "dd MMMM yyyy", { locale: idLocale })}
                    </span>
                    {Number(item.dana_disalurkan) > 0 && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                        {formatRupiah(item.dana_disalurkan)}
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
                    {item.judul}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {item.konten}
                  </p>

                  {item.foto_urls && item.foto_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.foto_urls.map((foto: string, fIdx: number) => (
                        <div key={fIdx} className="w-16 h-16 rounded-lg overflow-hidden border">
                          <img src={foto} alt="Dokumentasi" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs h-8"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Hapus Kabar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

