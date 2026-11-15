"use client";

import { useState } from "react";
import { Send, Users, CheckCircle2, AlertCircle, Loader2, MessageSquare, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BroadcastPage() {
  const [targetPenerima, setTargetPenerima] = useState<"donatur" | "kunjungan" | "semua">("donatur");
  const [pesan, setPesan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    total_target: number;
    berhasil: number;
    gagal: number;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) {
      alert("Pesan broadcast tidak boleh kosong!");
      return;
    }

    const confirmSend = window.confirm(
      `Apakah Anda yakin ingin mengirim pesan WhatsApp massal ini ke target: ${targetPenerima.toUpperCase()}?`
    );
    if (!confirmSend) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/broadcast/send`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          target_penerima: targetPenerima,
          pesan: pesan,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setResult({
          total_target: json.data?.total_target || 0,
          berhasil: json.data?.berhasil || 0,
          gagal: json.data?.gagal || 0,
          message: json.message,
        });
        setPesan("");
      } else {
        setError(json.message || "Gagal mengirim broadcast.");
      }
    } catch (err: any) {
      console.error("Broadcast request failed:", err);
      setError("Terjadi kesalahan jaringan saat mengirim broadcast.");
    } finally {
      setSubmitting(false);
    }
  };

  const setTemplate = (text: string) => {
    setPesan(text);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-emerald-600" /> WhatsApp Broadcast
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kirimkan pesan pengumuman, kabar penyaluran, atau ucapan doa secara massal ke WhatsApp donatur dan tamu yayasan.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Pesan Broadcast Selesai Diproses</span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 text-sm">
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs text-zinc-500 block">Total Target</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{result.total_target} Nomor</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs text-zinc-500 block">Berhasil Terkirim</span>
              <span className="text-lg font-bold text-emerald-600">{result.berhasil} Nomor</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs text-zinc-500 block">Gagal / Pending</span>
              <span className="text-lg font-bold text-amber-600">{result.gagal} Nomor</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSendBroadcast}>
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Form Pengiriman Pesan Massal</CardTitle>
            <CardDescription>
              Tentukan target kelompok penerima dan susun pesan yang ingin disebarkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Target Penerima */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Pilih Kelompok Penerima</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetPenerima("donatur")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetPenerima === "donatur"
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Donatur Yayasan</span>
                    {targetPenerima === "donatur" && <Badge className="bg-emerald-600">Dipilih</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    Donatur terdaftar & yang pernah berdonasi
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPenerima("kunjungan")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetPenerima === "kunjungan"
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Tamu Kunjungan</span>
                    {targetPenerima === "kunjungan" && <Badge className="bg-emerald-600">Dipilih</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    Kontak tamu dari riwayat booking kunjungan
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPenerima("semua")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetPenerima === "semua"
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Seluruh Kontak</span>
                    {targetPenerima === "semua" && <Badge className="bg-emerald-600">Dipilih</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    Semua nomor HP donatur, pengguna & tamu
                  </p>
                </button>
              </div>
            </div>

            {/* Template Cepat */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Template Pesan Cepat:
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTemplate("Assalamu'alaikum Wr. Wb. Bapak/Ibu Donatur yang dirahmati Allah, kami dari Yayasan YAMUTI Tasikmalaya mengucapkan terima kasih atas sedekah dan kebaikan yang telah disalurkan. Semoga Allah SWT membalas dengan kesehatan, keberkahan, dan rezeki yang berlimpah. Aamiin.")}
                >
                  Doa & Apresiasi Donatur
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTemplate("Assalamu'alaikum Wr. Wb. Alhamdulillah, amanah donasi kebutuhan pokok santri asrama YAMUTI telah kami salurkan hari ini. Terima kasih kepada seluruh sahabat donatur. Laporan transparansi lengkap dapat dilihat di website resmi kami: https://yamuti.org")}
                >
                  Kabar Penyaluran Sembako
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTemplate("Assalamu'alaikum Wr. Wb. Salam silaturahmi dari Yayasan YAMUTI. Kami mengundang Bapak/Ibu sahabat yayasan untuk hadir dalam agenda doa bersama anak-anak asuh panti asuhan kami pada hari Minggu mendatang. Kehadiran Bapak/Ibu sangat membahagiakan ananda sekalian.")}
                >
                  Undangan Silaturahmi
                </Button>
              </div>
            </div>

            {/* Isi Pesan */}
            <div className="space-y-2">
              <Label htmlFor="pesan" className="font-semibold text-sm">
                Isi Pesan WhatsApp *
              </Label>
              <textarea
                id="pesan"
                rows={6}
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Ketik isi pesan WhatsApp di sini..."
                className="w-full rounded-xl border border-input bg-background p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Tips: Format tebal (*teks*), miring (_teks_), dan baris baru didukung oleh WhatsApp.</span>
                <span>{pesan.length} karakter</span>
              </div>
            </div>

            {/* Notice Antispam */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-400">
                Pesan akan dikirimkan otomatis melalui antrean WhatsApp Gateway lokal (Baileys). Sistem memfilter nomor duplikat dan menstandarisasi format kode negara (+62).
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPesan("")}
              disabled={submitting || !pesan}
            >
              Kosongkan
            </Button>
            <Button
              type="submit"
              disabled={submitting || !pesan.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Pengiriman...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Broadcast Sekarang</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
