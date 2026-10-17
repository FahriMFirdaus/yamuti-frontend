"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichArticleEditor } from "@/components/ui/rich-article-editor";
import { getSession } from "next-auth/react";

interface KategoriItem {
  id: string;
  nama_kategori: string;
}

export default function TambahArtikelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    // Ambil daftar kategori jika ada dari backend
    fetch(`${apiUrl}/kategori-artikel`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setKategoriList(json.data);
          if (json.data.length > 0) {
            setKategoriId(json.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [apiUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !konten.trim()) {
      alert("Harap lengkapi judul artikel dan konten tulisan.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("konten", konten);
      if (kategoriId) {
        formData.append("kategori_id", kategoriId);
      }
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const session = await getSession();
      let token = session?.accessToken;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
      }

      const res = await fetch(`${apiUrl}/artikel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("Artikel berita berhasil diterbitkan!");
        router.push("/admin/cms");
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menerbitkan artikel.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms">
            <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-zinc-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Tulis Artikel Berita Baru
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Buat rilis berita, laporan kegiatan, atau panduan donatur untuk dipublikasikan.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/cms">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-500/20"
          >
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? "Menerbitkan..." : "Terbitkan Artikel"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri / Utama: Judul & Rich Editor Konten */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <CardTitle>Judul & Narasi Berita</CardTitle>
                <CardDescription>
                  Tuliskan judul yang menarik dan isi narasi kegiatan panti asuhan secara runtut.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="judul" className="text-sm font-semibold">
                    Judul Artikel Berita <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="judul"
                    placeholder="Contoh: Penyaluran Bantuan Nutrisi & Santunan Pendidikan Santri Tahfidz..."
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="text-base font-medium py-6"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Konten & Sisipan Foto Dokumentasi <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-xs text-zinc-500">Bisa menambahkan foto di sela-sela paragraf</span>
                  </div>
                  <RichArticleEditor value={konten} onChange={setKonten} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Pengaturan Banner Cover & Kategori */}
          <div className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <CardTitle>Foto Sampul (Cover Banner)</CardTitle>
                <CardDescription>Foto utama yang tampil di kartu beranda dan halaman depan.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  {thumbnailPreview ? (
                    <div className="w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-44 object-cover rounded-xl shadow-sm mb-2" />
                      <p className="text-xs text-red-600 font-medium">Klik untuk mengganti gambar</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-3">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pilih Foto Sampul</p>
                      <p className="text-xs text-zinc-500 mt-1">Format JPG, PNG atau WebP (Max 2MB)</p>
                    </>
                  )}
                </div>

                {kategoriList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="kategori" className="text-sm font-semibold">Kategori Artikel</Label>
                    <select
                      id="kategori"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={kategoriId}
                      onChange={(e) => setKategoriId(e.target.value)}
                    >
                      {kategoriList.map((kat) => (
                        <option key={kat.id} value={kat.id}>
                          {kat.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
