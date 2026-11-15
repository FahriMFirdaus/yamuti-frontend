"use client";

import { useState } from "react";
import { 
  GraduationCap, 
  Activity, 
  Trophy, 
  Calendar, 
  Plus, 
  Trash2, 
  FileText, 
  Loader2, 
  Image as ImageIcon,
  HeartPulse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface AdminAnakAsuhRecordsProps {
  anakAsuhId: string;
  initialRecords?: any[];
}

export function AdminAnakAsuhRecords({ anakAsuhId, initialRecords = [] }: AdminAnakAsuhRecordsProps) {
  const [records, setRecords] = useState<any[]>(initialRecords);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [tipe, setTipe] = useState<string>("akademik");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggalKejadian, setTanggalKejadian] = useState("");
  const [semester, setSemester] = useState("");
  const [nilaiRataRata, setNilaiRataRata] = useState("");
  const [lampiranInput, setLampiranInput] = useState("");
  const [lampiranList, setLampiranList] = useState<string[]>([]);

  const handleAddLampiran = () => {
    if (!lampiranInput.trim()) return;
    setLampiranList([...lampiranList, lampiranInput.trim()]);
    setLampiranInput("");
  };

  const handleRemoveLampiran = (index: number) => {
    setLampiranList(lampiranList.filter((_, i) => i !== index));
  };

  const getTipeBadge = (t: string) => {
    switch (t) {
      case "akademik":
        return { label: "Akademik / Rapor", icon: GraduationCap, color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" };
      case "kesehatan":
        return { label: "Kesehatan / Medis", icon: HeartPulse, color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300" };
      case "prestasi":
        return { label: "Prestasi / Lomba", icon: Trophy, color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" };
      default:
        return { label: "Kegiatan / Umum", icon: Activity, color: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      alert("Judul dan deskripsi catatan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh/${anakAsuhId}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          tipe,
          judul,
          deskripsi,
          tanggal_kejadian: tanggalKejadian || null,
          semester: semester || null,
          nilai_rata_rata: nilaiRataRata || null,
          lampiran_urls: lampiranList,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan catatan perkembangan");
      }

      const resData = await res.json();
      setRecords([resData.data, ...records]);

      // Reset form
      setJudul("");
      setDeskripsi("");
      setTanggalKejadian("");
      setSemester("");
      setNilaiRataRata("");
      setLampiranList([]);
      setIsFormOpen(false);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memposting catatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Hapus catatan perkembangan ini?")) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/anak-asuh/records/${recordId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) throw new Error("Gagal menghapus");
      setRecords(records.filter((r) => r.id !== recordId));
    } catch (err) {
      alert("Gagal menghapus catatan perkembangan");
    }
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Jurnal & Rekam Perkembangan Anak</span>
            <Badge variant="secondary" className="rounded-full">
              {records.length} Catatan
            </Badge>
          </CardTitle>
          <CardDescription>
            Riwayat rapor, pemeriksaan kesehatan, hafalan/prestasi yang dapat dipantau oleh Orang Tua Asuh
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isFormOpen ? "Tutup Form" : "Tambah Rekam Jejak"}
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Form Catatan Rapor / Kesehatan / Prestasi Baru
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori Catatan *</Label>
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="akademik">Akademik / Nilai Rapor</option>
                  <option value="kesehatan">Kesehatan / Rekam Medis</option>
                  <option value="prestasi">Prestasi & Perlombaan</option>
                  <option value="kegiatan">Kegiatan Panti / Keagamaan</option>
                  <option value="umum">Catatan Umum / Perilaku</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Kejadian / Pemeriksaan</Label>
                <Input
                  type="date"
                  value={tanggalKejadian}
                  onChange={(e) => setTanggalKejadian(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Judul Catatan *</Label>
              <Input
                placeholder="Contoh: Rapor Semester Ganjil TA 2025/2026 atau Juara 1 Lomba Adzan"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            {tipe === "akademik" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Semester / Periode</Label>
                  <Input
                    placeholder="Contoh: Semester Ganjil Kelas 4"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nilai Rata-rata / IP</Label>
                  <Input
                    placeholder="Contoh: 88.5"
                    value={nilaiRataRata}
                    onChange={(e) => setNilaiRataRata(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Keterangan & Catatan Detail *</Label>
              <Textarea
                placeholder="Tuliskan perkembangan ananda, resep/diagnosa dokter jika medis, atau deskripsi capaian..."
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                required
              />
            </div>

            {/* Input Lampiran Dokumen/Foto */}
            <div className="space-y-2">
              <Label className="text-xs">URL Foto Sertifikat / Rapor / Surat Dokter</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://contoh.com/foto-rapor.jpg"
                  value={lampiranInput}
                  onChange={(e) => setLampiranInput(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddLampiran}>
                  Tambah
                </Button>
              </div>

              {lampiranList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {lampiranList.map((url, idx) => (
                    <div key={idx} className="relative group/pic w-16 h-16 rounded-xl overflow-hidden border">
                      <img src={url} alt={`Lampiran ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveLampiran(idx)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/pic:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
                  "Simpan Catatan"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* List Catatan */}
        {records.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Belum ada rekam catatan perkembangan yang ditambahkan untuk anak ini.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((item) => {
              const badge = getTipeBadge(item.tipe);
              const Icon = badge.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className={`flex items-center gap-1 font-semibold ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </Badge>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {item.tanggal_kejadian
                          ? format(new Date(item.tanggal_kejadian), "dd MMMM yyyy", { locale: idLocale })
                          : format(new Date(item.created_at), "dd MMMM yyyy", { locale: idLocale })}
                      </span>
                    </div>

                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                      {item.judul}
                    </h4>

                    {(item.semester || item.nilai_rata_rata) && (
                      <div className="flex items-center gap-3 my-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {item.semester && <span>Semester: {item.semester}</span>}
                        {item.nilai_rata_rata && <span>• Rata-rata: {item.nilai_rata_rata}</span>}
                      </div>
                    )}

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap mt-1">
                      {item.deskripsi}
                    </p>

                    {item.lampiran_urls && item.lampiran_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        {item.lampiran_urls.map((lamp: string, lIdx: number) => (
                          <a key={lIdx} href={lamp} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity">
                            <img src={lamp} alt="Lampiran" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-600 text-xs h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

