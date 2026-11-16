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
import { useState } from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PotaQuickPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  pota: any;
  user: any;
  onSuccess: () => void;
}

export function PotaQuickPayModal({
  isOpen,
  onClose,
  pota,
  user,
  onSuccess,
}: PotaQuickPayModalProps) {
  const [nominal, setNominal] = useState<number>(pota?.nominal_bulanan || 250000);
  const [pesanDoa, setPesanDoa] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);

  if (!pota || !pota.anak_asuh) return null;
  const anak = pota.anak_asuh;

  const handlePay = async () => {
    setErrorMsg(null);
    if (!nominal || nominal < 10000) {
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
            nama_donatur: user?.name || pota.nama_donatur || "Orang Tua Asuh YAMUTI",
            no_whatsapp: user?.no_hp || pota.no_hp || "081221650050",
            email: user?.email || pota.email,
            gross_amount: nominal,
            pesan: `[Beasiswa Rutin POTA - Ananda ${anak.nama}] ${pesanDoa}`.trim(),
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
        setSnapToken(token);
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
              setSnapToken(null);
            },
            onClose: function () {
              setSnapToken(null);
            },
          });
        } else {
          // Fallback jika snap script belum siap
          if (resData.data?.payment_url) {
            window.open(resData.data.payment_url, "_blank");
            onSuccess();
            onClose();
          }
        }
      } else {
        throw new Error("Gagal memperoleh token pembayaran dari Midtrans.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan pembayaran.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-5">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <CreditCard className="w-5 h-5 text-emerald-600" /> Salur Beasiswa Bulan Ini
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Penyaluran beasiswa bulanan aman & instan via QRIS, Virtual Account, atau E-Wallet.
          </DialogDescription>
        </DialogHeader>

        {/* Ringkasan Ananda */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 overflow-hidden text-base">
            {anak.foto_identitas ? (
              <Image src={anak.foto_identitas} alt={anak.nama} fill className="object-cover" />
            ) : (
              <span>{anak.nama?.charAt(0) || "A"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Ananda Binaan Anda
            </span>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{anak.nama}</h4>
            <p className="text-xs text-zinc-500 truncate">{anak.tingkat_pendidikan || "Sekolah"} • {anak.nama_sekolah || "Tasikmalaya"}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Nominal */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nominal Beasiswa Bulanan</Label>
          <div className="grid grid-cols-3 gap-2">
            {[100000, 250000, 500000].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setNominal(val)}
                className={cn(
                  "py-2 text-center rounded-lg text-xs font-bold border transition-all cursor-pointer",
                  nominal === val
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                )}
              >
                Rp {(val / 1000).toLocaleString("id-ID")}rb
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={nominal || ""}
            onChange={(e) => setNominal(Number(e.target.value) || 0)}
            className="h-10 text-xs font-mono"
            placeholder="Nominal lain, misal: 250000"
          />
        </div>

        {/* Pesan Doa / Niat */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Doa / Hajat Bulan Ini (Opsional)</Label>
          <Input
            type="text"
            value={pesanDoa}
            onChange={(e) => setPesanDoa(e.target.value)}
            placeholder="Mohon doa agar keluarga senantiasa sehat dan berkah..."
            className="h-10 text-xs"
            maxLength={300}
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aman via Midtrans
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Batal
            </Button>
            <Button
              size="sm"
              disabled={isLoading || !nominal}
              onClick={handlePay}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5"
            >
              {isLoading ? "Menyiapkan..." : "Lanjutkan Pembayaran →"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
