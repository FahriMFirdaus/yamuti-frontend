"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, AlertCircle, CreditCard, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PotaBulkPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  potaList: any[];
  user: any;
  onSuccess: () => void;
}

export function PotaBulkPayModal({
  isOpen,
  onClose,
  potaList,
  user,
  onSuccess,
}: PotaBulkPayModalProps) {
  // Hitung total komitmen default dari semua anak
  const defaultTotal = useMemo(() => {
    return potaList.reduce((sum, item) => sum + (item.nominal_bulanan || 250000), 0);
  }, [potaList]);

  const [totalNominal, setTotalNominal] = useState<number>(defaultTotal);
  const [pesanDoa, setPesanDoa] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!potaList || potaList.length === 0) return null;

  const namesList = potaList.map((p) => p.anak_asuh?.nama).filter(Boolean).join(", ");

  const handlePay = async () => {
    setErrorMsg(null);
    if (!totalNominal || totalNominal < 10000) {
      setErrorMsg("Nominal donasi minimal Rp 10.000.");
      return;
    }

    setIsLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/donasi`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            nama_donatur: user?.name || "Orang Tua Asuh YAMUTI",
            no_whatsapp: user?.no_hp || "081221650050",
            email: user?.email,
            gross_amount: totalNominal,
            pesan: `[Beasiswa Gabungan POTA - ${potaList.length} Ananda: ${namesList}] ${pesanDoa}`.trim(),
            is_anonymous: false,
          }),
        }
      );

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Gagal membuat tagihan pembayaran.");
      }

      const token = resData.data?.snap_token || resData.snap_token;
      if (token) {
        // @ts-ignore
        if (typeof window !== "undefined" && window.snap) {
          // @ts-ignore
          window.snap.pay(token, {
            onSuccess: function (_result: any) {
              onSuccess();
              onClose();
            },
            onPending: function (_result: any) {
              onSuccess();
              onClose();
            },
            onError: function (_result: any) {
              setErrorMsg("Pembayaran dibatalkan atau terjadi kesalahan.");
            },
            onClose: function () {
              setIsLoading(false);
            },
          });
        } else {
          setErrorMsg("Sistem pembayaran Midtrans belum siap. Muat ulang halaman.");
        }
      } else {
        throw new Error("Token pembayaran tidak ditemukan.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60">
              <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">Salur Kolektif POTA</span>
          </div>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Salur Beasiswa Sekaligus ({potaList.length} Ananda)
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Tunaikan komitmen infak beasiswa untuk seluruh ananda binaan Anda dalam satu kali transaksi praktis via Midtrans.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* List Ringkas Ananda yang Didanai */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Daftar Ananda yang Disalurkan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {potaList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs"
                >
                  <div className="relative h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {item.anak_asuh?.foto_identitas ? (
                      <Image
                        src={item.anak_asuh.foto_identitas}
                        alt={item.anak_asuh.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{item.anak_asuh?.nama?.charAt(0) || "A"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.anak_asuh?.nama}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Rp {(item.nominal_bulanan || 250000).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Total Nominal */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Total Nominal Beasiswa Gabungan (Rp)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[defaultTotal, defaultTotal * 2, defaultTotal * 3].map((val, idx) => (
                <button
                  type="button"
                  key={val + idx}
                  onClick={() => setTotalNominal(val)}
                  className={cn(
                    "py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[38px]",
                    totalNominal === val
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
                  )}
                >
                  {idx === 0 ? "1 Bulan" : `${idx + 1} Bulan`}
                  <span className="block text-[10px] opacity-80 font-normal">
                    Rp {(val / 1000).toLocaleString("id-ID")}rb
                  </span>
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={10000}
              step={10000}
              value={totalNominal || ""}
              onChange={(e) => setTotalNominal(Number(e.target.value) || 0)}
              className="h-11 font-mono font-bold text-sm bg-white dark:bg-zinc-900 rounded-xl"
              placeholder="Atau masukkan total nominal lain"
              required
            />
          </div>

          {/* Doa / Harapan Donatur */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Untaian Doa & Pesan Kebaikan (Opsional)
            </Label>
            <Input
              type="text"
              value={pesanDoa}
              onChange={(e) => setPesanDoa(e.target.value)}
              placeholder="Semoga Allah berkahi rizqi keluarga dan membimbing ananda semua..."
              className="h-10 text-xs bg-white dark:bg-zinc-900 rounded-xl"
              maxLength={300}
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
              Pembayaran aman didukung Midtrans: QRIS, GoPay, OVO, ShopeePay, Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan Kartu Kredit.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs h-11 px-5 rounded-xl border-zinc-300 dark:border-zinc-700"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handlePay}
              disabled={isLoading || totalNominal < 10000}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {isLoading
                ? "Memproses..."
                : `Bayar Sekaligus Rp ${totalNominal.toLocaleString("id-ID")}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
