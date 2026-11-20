"use client";

import React, { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ChartOfAccount {
  id: string;
  kode_akun: string;
  nama_akun: string;
  tipe_akun: string;
  saldo_normal: "debit" | "kredit" | string;
}

export interface ModalJurnalManualProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  coaList: ChartOfAccount[];
  token: string | null;
  apiUrl?: string;
}

interface JournalRowItem {
  id: string;
  chart_of_account_id: string;
  debit: number;
  kredit: number;
  memo: string;
}

function generateRowId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9);
}

function createDefaultRow(coaId = ""): JournalRowItem {
  return {
    id: generateRowId(),
    chart_of_account_id: coaId,
    debit: 0,
    kredit: 0,
    memo: "",
  };
}

export function ModalJurnalManual({
  isOpen,
  onClose,
  onSuccess,
  coaList,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
}: ModalJurnalManualProps) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [items, setItems] = useState<JournalRowItem[]>(() => [
    createDefaultRow(coaList[0]?.id || ""),
    createDefaultRow(coaList[1]?.id || coaList[0]?.id || ""),
  ]);

  // Sync initial items if coaList loads after component mounts
  useEffect(() => {
    if (coaList.length > 0 && items.length >= 2 && !items[0].chart_of_account_id) {
      setItems([
        createDefaultRow(coaList[0]?.id || ""),
        createDefaultRow(coaList[1]?.id || coaList[0]?.id || ""),
      ]);
    }
  }, [coaList]);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalDebit = items.reduce((acc, curr) => acc + (Number(curr.debit) || 0), 0);
  const totalKredit = items.reduce((acc, curr) => acc + (Number(curr.kredit) || 0), 0);
  const isBalanced = totalDebit > 0 && Math.round(totalDebit) === Math.round(totalKredit);
  const selisih = Math.abs(totalDebit - totalKredit);

  const addItem = () => {
    setItems((prev) => [...prev, createDefaultRow(coaList[0]?.id || "")]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItemValues = (id: string, updates: Partial<JournalRowItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isBalanced) {
      setErrorMessage(
        `Total Debit dan Kredit belum seimbang! Selisih: Rp ${selisih.toLocaleString("id-ID")}`
      );
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
            memo: it.memo?.trim() || null,
          })),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Gagal menyimpan jurnal penyesuaian");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi server";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-jurnal-title"
      aria-describedby="modal-jurnal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2
                id="modal-jurnal-title"
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white"
              >
                Catat Jurnal Manual (Penyesuaian)
              </h2>
              <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/50 text-[11px]">
                Jurnal Berpasangan
              </Badge>
            </div>
            <p id="modal-jurnal-desc" className="text-xs text-zinc-600 dark:text-zinc-400">
              Masukkan akun debit & kredit untuk mencatat penyesuaian akuntansi sesuai kaidah pembukuan nirlaba ISAK 35.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog pencatatan jurnal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label
                htmlFor="modal-tanggal-transaksi"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5"
              >
                Tanggal Transaksi
              </label>
              <input
                id="modal-tanggal-transaksi"
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="modal-keterangan-transaksi"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5"
              >
                Keterangan / Uraian Transaksi
              </label>
              <input
                id="modal-keterangan-transaksi"
                type="text"
                required
                placeholder="Contoh: Penyesuaian saldo kas kecil akhir bulan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Baris Transaksi Debit & Kredit */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Baris Akun (Minimal 2 Baris)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="min-h-[44px] sm:min-h-[36px] px-3 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs gap-1.5 font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Tambah Baris</span>
              </Button>
            </div>

            {/* Desktop Table Headers */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2.5 px-3 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              <div className="sm:col-span-5">Pilihan Akun</div>
              <div className="sm:col-span-3 text-right">Debit (Rp)</div>
              <div className="sm:col-span-3 text-right">Kredit (Rp)</div>
              <div className="sm:col-span-1 text-center">Aksi</div>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col sm:grid sm:grid-cols-12 gap-2.5 sm:items-center"
                >
                  {/* Account Selection */}
                  <div className="sm:col-span-5">
                    <label
                      htmlFor={`item-account-${item.id}`}
                      className="sm:hidden text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1"
                    >
                      Akun Baris {idx + 1}
                    </label>
                    <select
                      id={`item-account-${item.id}`}
                      aria-label={`Pilih akun baris ${idx + 1}`}
                      value={item.chart_of_account_id}
                      onChange={(e) =>
                        updateItemValues(item.id, { chart_of_account_id: e.target.value })
                      }
                      className="w-full h-10 sm:h-9 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {coaList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.kode_akun} - {c.nama_akun} ({c.saldo_normal})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Debit & Credit Inputs: 2 cols on mobile */}
                  <div className="grid grid-cols-2 sm:contents gap-2">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`item-debit-${item.id}`}
                        className="sm:hidden text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1"
                      >
                        Debit (Rp)
                      </label>
                      <input
                        id={`item-debit-${item.id}`}
                        type="number"
                        placeholder="0"
                        aria-label={`Nominal debit baris ${idx + 1}`}
                        min="0"
                        value={item.debit || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateItemValues(item.id, {
                            debit: val,
                            ...(val > 0 ? { kredit: 0 } : {}),
                          });
                        }}
                        className="w-full h-10 sm:h-9 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-right font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`item-kredit-${item.id}`}
                        className="sm:hidden text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1"
                      >
                        Kredit (Rp)
                      </label>
                      <input
                        id={`item-kredit-${item.id}`}
                        type="number"
                        placeholder="0"
                        aria-label={`Nominal kredit baris ${idx + 1}`}
                        min="0"
                        value={item.kredit || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateItemValues(item.id, {
                            kredit: val,
                            ...(val > 0 ? { debit: 0 } : {}),
                          });
                        }}
                        className="w-full h-10 sm:h-9 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-right font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-1 flex justify-end sm:justify-center">
                    <button
                      type="button"
                      disabled={items.length <= 2}
                      onClick={() => removeItem(item.id)}
                      aria-label={`Hapus baris akun ${idx + 1}`}
                      className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baris Total & Status Keseimbangan */}
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Seimbang (Debit = Kredit)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Selisih: Rp {selisih.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-right font-mono tabular-nums">
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-sans">Total Debit</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Rp {totalDebit.toLocaleString("id-ID")}
                </span>
              </div>
              <span className="text-zinc-400 font-bold" aria-hidden="true">=</span>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-sans">Total Kredit</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Rp {totalKredit.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] px-4 rounded-xl font-semibold border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!isBalanced || isSubmitting}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {isSubmitting ? "Menyimpan..." : "Posting ke Buku Besar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
