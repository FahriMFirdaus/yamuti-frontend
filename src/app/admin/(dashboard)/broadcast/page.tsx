"use client";

import { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Smartphone,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSession } from "next-auth/react";

export default function BroadcastPage() {
  const [targetPenerima, setTargetPenerima] = useState<"donatur" | "kunjungan" | "semua">("donatur");
  const [pesan, setPesan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [result, setResult] = useState<{
    total_target: number;
    berhasil: number;
    gagal: number;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getAuthToken = async () => {
    const session = await getSession();
    let token = session?.accessToken;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token") || undefined;
    }
    return token || "";
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) {
      setValidationError("Isi pesan WhatsApp broadcast wajib diisi terlebih dahulu!");
      return;
    }
    setValidationError(null);
    setIsConfirmOpen(true);
  };

  const handleSendBroadcast = async () => {
    setIsConfirmOpen(false);
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const token = await getAuthToken();
      const res = await fetch(`${apiUrl}/broadcast/send`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          target_penerima: targetPenerima,
          pesan: pesan.trim(),
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
        setError(json.message || "Gagal mengirim broadcast WhatsApp.");
      }
    } catch (err: unknown) {
      console.error("Broadcast request failed:", err);
      setError("Terjadi kesalahan jaringan saat mengirim broadcast.");
    } finally {
      setSubmitting(false);
    }
  };

  const setTemplate = (text: string) => {
    setPesan(text);
    setValidationError(null);
  };

  const getTargetLabel = (target: "donatur" | "kunjungan" | "semua") => {
    if (target === "donatur") return "Donatur Yayasan (Pernah Berdonasi / Akun Terdaftar)";
    if (target === "kunjungan") return "Tamu Kunjungan (Kontak dari Booking Panti)";
    return "Seluruh Kontak (Donatur, Pengguna, dan Tamu)";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-emerald-600" /> WhatsApp Broadcast
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kirimkan pesan pengumuman, kabar penyaluran sembako, atau ucapan doa secara massal ke nomor WhatsApp donatur & tamu yayasan.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-semibold underline hover:opacity-75"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Success Result Summary */}
      {result && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-3">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Proses Pengiriman Pesan Massal Selesai</span>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Tutup Hasil
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs text-zinc-500 block">Total Target Kontak</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {result.total_target} Nomor
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs text-zinc-500 block">Berhasil Terkirim</span>
              <span className="text-xl font-bold text-emerald-600">{result.berhasil} Nomor</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs text-zinc-500 block">Gagal / Tidak Aktif</span>
              <span className="text-xl font-bold text-amber-600">{result.gagal} Nomor</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form & Live Chat Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Broadcast Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleOpenConfirm}>
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
                  <Label className="font-semibold text-sm">Pilih Kelompok Penerima *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTargetPenerima("donatur")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetPenerima === "donatur"
                          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Donatur Yayasan</span>
                        {targetPenerima === "donatur" && (
                          <Badge className="bg-emerald-600 text-[10px] h-4 px-1.5">Dipilih</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-snug">
                        Donatur yang pernah transfer atau terdaftar
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetPenerima("kunjungan")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetPenerima === "kunjungan"
                          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Tamu Kunjungan</span>
                        {targetPenerima === "kunjungan" && (
                          <Badge className="bg-emerald-600 text-[10px] h-4 px-1.5">Dipilih</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-snug">
                        Kontak dari data booking jadwal kunjungan
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetPenerima("semua")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetPenerima === "semua"
                          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Seluruh Kontak</span>
                        {targetPenerima === "semua" && (
                          <Badge className="bg-emerald-600 text-[10px] h-4 px-1.5">Dipilih</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-snug">
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
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-lg"
                      onClick={() =>
                        setTemplate(
                          "Assalamu'alaikum Wr. Wb. Bapak/Ibu Donatur yang dirahmati Allah, kami dari Yayasan YAMUTI Tasikmalaya mengucapkan terima kasih atas sedekah dan kebaikan yang telah disalurkan. Semoga Allah SWT membalas dengan kesehatan, keberkahan, dan rezeki yang berlimpah. Aamiin."
                        )
                      }
                    >
                      Doa & Apresiasi Donatur
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-lg"
                      onClick={() =>
                        setTemplate(
                          "Assalamu'alaikum Wr. Wb. Alhamdulillah, amanah donasi kebutuhan pokok santri asrama YAMUTI telah kami salurkan hari ini. Terima kasih kepada seluruh sahabat donatur. Laporan transparansi lengkap dapat dilihat di website resmi kami: https://yamuti.org"
                        )
                      }
                    >
                      Kabar Penyaluran Sembako
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-lg"
                      onClick={() =>
                        setTemplate(
                          "Assalamu'alaikum Wr. Wb. Salam silaturahmi dari Yayasan YAMUTI. Kami mengundang Bapak/Ibu sahabat yayasan untuk hadir dalam agenda doa bersama anak-anak asuh panti asuhan kami pada hari Minggu mendatang. Kehadiran Bapak/Ibu sangat membahagiakan ananda sekalian."
                        )
                      }
                    >
                      Undangan Silaturahmi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-lg"
                      onClick={() =>
                        setTemplate(
                          "Assalamu'alaikum Wr. Wb. Sahabat YAMUTI, salam berkah di hari Jumat. Mari lipatgandakan kebaikan hari ini melalui infak sedekah untuk beasiswa pendidikan adik-adik yatim dhuafa yayasan kami: https://yamuti.org/program"
                        )
                      }
                    >
                      Jumat Berkah
                    </Button>
                  </div>
                </div>

                {/* Textarea Pesan */}
                <div className="space-y-1.5">
                  <Label htmlFor="pesan" className="font-semibold text-sm">
                    Isi Pesan WhatsApp *
                  </Label>
                  <textarea
                    id="pesan"
                    rows={6}
                    value={pesan}
                    onChange={(e) => {
                      setPesan(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Ketik isi pesan WhatsApp di sini..."
                    className="w-full rounded-xl border border-input bg-background p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    required
                  />
                  {validationError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {validationError}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-zinc-400 pt-1">
                    <span>
                      Gunakan format: *tebal*, _miring_, ~coret~
                    </span>
                    <span>{pesan.length} karakter</span>
                  </div>
                </div>

                {/* Antispam Notice */}
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                    Pesan dikirimkan otomatis melalui antrean WhatsApp Gateway (Baileys). Sistem menstandarisasi kode negara (+62) dan memfilter nomor duplikat untuk mencegah spam.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2.5 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPesan("");
                    setValidationError(null);
                  }}
                  disabled={submitting || !pesan}
                  className="gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Kosongkan
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
                      <span>Kirim Pesan Massal</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Live Chat Preview Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
            <Smartphone className="w-4 h-4" />
            <span>Pratinjau Layar WhatsApp</span>
          </div>

          <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-[#efeae2] dark:bg-zinc-950 p-4 shadow-sm min-h-[380px] flex flex-col justify-between">
            {/* Header Chat Mockup */}
            <div className="bg-[#075e54] text-white p-3 rounded-xl flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                YM
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs truncate">Yayasan YAMUTI Official</p>
                <p className="text-[10px] text-emerald-200">Terverifikasi • Online</p>
              </div>
            </div>

            {/* Bubble Chat Body */}
            <div className="my-4 flex flex-col items-end">
              <div className="bg-[#dcf8c6] dark:bg-emerald-950 dark:text-emerald-100 text-zinc-900 rounded-2xl rounded-tr-xs p-3.5 max-w-[90%] text-xs shadow-xs space-y-1.5 break-words whitespace-pre-wrap leading-relaxed border border-emerald-200/50 dark:border-emerald-800/40">
                {pesan ? (
                  <span>{pesan}</span>
                ) : (
                  <span className="text-zinc-400 italic">
                    Ketik isi pesan di formulir sebelah kiri untuk melihat tampilan langsung di sini...
                  </span>
                )}
                <div className="text-[10px] text-zinc-500 text-right pt-1 flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  <CheckCircle2 className="w-3 h-3 text-blue-500 inline" />
                </div>
              </div>
            </div>

            {/* Footer Target Info */}
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
              <span>Target:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[200px]">
                {targetPenerima === "donatur" ? "Donatur" : targetPenerima === "kunjungan" ? "Tamu" : "Semua Kontak"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Confirmation Dialog (No window.confirm) */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Eye className="w-5 h-5" /> Konfirmasi Broadcast WhatsApp
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
            <p>
              Anda akan mengirimkan pesan WhatsApp ke kelompok:
            </p>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Kelompok Target:</span>
                <strong className="text-zinc-900 dark:text-zinc-100">{getTargetLabel(targetPenerima)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Jumlah Karakter:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{pesan.length} Karakter</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Pastikan isi pesan telah sesuai dengan adab dan etika komunikasi yayasan sebelum proses kirim dijalankan.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal Periksa</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendBroadcast}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Ya, Kirim Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
