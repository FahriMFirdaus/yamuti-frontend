"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModalJurnalManualProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  coaList: any[];
  token: string | null;
  apiUrl: string;
}

export function ModalJurnalManual({
  isOpen,
  onClose,
  onSuccess,
  coaList,
  token,
  apiUrl,
}: ModalJurnalManualProps) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [items, setItems] = useState<
    { chart_of_account_id: string; debit: number; kredit: number; memo: string }[]
  >([
    { chart_of_account_id: coaList[0]?.id || "", debit: 0, kredit: 0, memo: "" },
    { chart_of_account_id: coaList[1]?.id || "", debit: 0, kredit: 0, memo: "" },
  ]);

  if (!isOpen) return null;

  const totalDebit = items.reduce((acc, curr) => acc + (Number(curr.debit) || 0), 0);
  const totalKredit = items.reduce((acc, curr) => acc + (Number(curr.kredit) || 0), 0);
  const isBalanced = totalDebit > 0 && Math.round(totalDebit) === Math.round(totalKredit);
  const selisih = Math.abs(totalDebit - totalKredit);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { chart_of_account_id: coaList[0]?.id || "", debit: 0, kredit: 0, memo: "" },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isBalanced) {
      setErrorMessage("Total Debit dan Kredit belum seimbang! Selisih: Rp " + selisih.toLocaleString("id-ID"));
      return;
    }

    if (!keterangan.trim()) {
      setErrorMessage("Keterangan transaksi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/akuntansi/jurnal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tanggal_transaksi: tanggal,
          keterangan,
          items: items.map((it) => ({
            chart_of_account_id: it.chart_of_account_id,
            debit: Number(it.debit) || 0,
            kredit: Number(it.kredit) || 0,
            memo: it.memo || null,
          })),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Gagal menyimpan jurnal penyesuaian");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan koneksi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Catat Jurnal Manual (Penyesuaian)</span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border-none text-[11px]">
                Double-Entry
              </Badge>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Masukkan akun debit & kredit untuk mencatat beban non-kas atau penyesuaian akhir bulan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Keterangan / Uraian Transaksi
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Beban penyusutan inventaris bulan ini"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Baris Item Debit & Kredit */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Baris Akun (Minimal 2 Baris)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-8 px-2.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-xs gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" /> Tambah Baris
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-5">
                    <select
                      value={item.chart_of_account_id}
                      onChange={(e) => updateItem(idx, "chart_of_account_id", e.target.value)}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium"
                    >
                      {coaList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.kode_akun} - {c.nama_akun} ({c.saldo_normal})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Debit (Rp)"
                      min="0"
                      value={item.debit || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateItem(idx, "debit", val);
                        if (val > 0) updateItem(idx, "kredit", 0);
                      }}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-right font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Kredit (Rp)"
                      min="0"
                      value={item.kredit || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateItem(idx, "kredit", val);
                        if (val > 0) updateItem(idx, "debit", 0);
                      }}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-right font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      disabled={items.length <= 2}
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baris Total & Status Balance */}
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SEIMBANG (BALANCED)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>SELISIH: Rp {selisih.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-right font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px]">TOTAL DEBIT</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Rp {totalDebit.toLocaleString("id-ID")}
                </span>
              </div>
              <span className="text-zinc-400 font-bold">=</span>
              <div>
                <span className="text-zinc-500 block text-[10px]">TOTAL KREDIT</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Rp {totalKredit.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!isBalanced || isSubmitting}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isSubmitting ? "Menyimpan..." : "Posting Jurnal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
