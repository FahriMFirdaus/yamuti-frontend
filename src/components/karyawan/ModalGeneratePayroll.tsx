"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Info, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ModalGeneratePayrollProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedBulan: number;
  selectedTahun: number;
  token: string | null;
  apiUrl?: string;
}

export function ModalGeneratePayroll({
  isOpen,
  onClose,
  onSuccess,
  selectedBulan,
  selectedTahun,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
}: ModalGeneratePayrollProps) {
  const [bulan, setBulan] = useState(selectedBulan || new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(selectedTahun || new Date().getFullYear());
  const [tipeSdm, setTipeSdm] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBulan(selectedBulan || new Date().getMonth() + 1);
      setTahun(selectedTahun || new Date().getFullYear());
      setTipeSdm("all");
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  }, [isOpen, selectedBulan, selectedTahun]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    const payload: {
      periode_bulan: number;
      periode_tahun: number;
      tipe_sdm?: string;
    } = {
      periode_bulan: Number(bulan),
      periode_tahun: Number(tahun),
    };

    if (tipeSdm !== "all") {
      payload.tipe_sdm = tipeSdm;
    }

    try {
      const res = await fetch(`${apiUrl}/payroll/generate-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal membuat daftar payroll");
      }

      const count = json.data?.generated_count ?? json.generated_count ?? 0;
      if (count === 0) {
        setSuccessInfo(
          "Seluruh karyawan aktif pada periode ini sudah memiliki daftar payroll atau tidak ada karyawan aktif yang cocok."
        );
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      } else {
        setSuccessInfo(`Berhasil membuat ${count} draft payroll untuk periode tersebut!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan tidak terduga saat membuat payroll.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/75 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Buat Draf Payroll Massal
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate draf slip gaji untuk seluruh SDM aktif pada periode terpilih
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Mekanisme Pembuatan Otomatis:</p>
              <ul className="list-disc ml-3.5 space-y-0.5 text-emerald-800/90 dark:text-emerald-300">
                <li>Mengambil semua karyawan dengan status <strong>Aktif</strong>.</li>
                <li>Mengisi nominal awal dari <strong>Gaji Pokok & Tunjangan Tetap Standar</strong> masing-masing.</li>
                <li>Melewati karyawan yang sudah memiliki slip pada periode ini (tanpa duplikasi).</li>
                <li>Status awal adalah <strong>Draft</strong> sehingga masih dapat disesuaikan jika ada bonus atau potongan.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulan" className="text-xs font-semibold">
                Periode Bulan
              </Label>
              <select
                id="bulan"
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tahun" className="text-xs font-semibold">
                Tahun
              </Label>
              <select
                id="tahun"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipe_sdm" className="text-xs font-semibold">
              Filter Tipe SDM
            </Label>
            <select
              id="tipe_sdm"
              value={tipeSdm}
              onChange={(e) => setTipeSdm(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua SDM (Pengasuh & Staf Yayasan)</option>
              <option value="Pengasuh/Ustadz">Hanya Pengasuh / Ustadz Santri</option>
              <option value="Staf/Amil">Hanya Staf Manajemen & Amil Kantor</option>
            </select>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs text-zinc-700 dark:text-zinc-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Draf Payroll
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
