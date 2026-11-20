"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Scale,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Loader2,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Payroll, MetodePembayaran } from "@/types/karyawan";

export interface AccountOption {
  id: string;
  kode_akun: string;
  nama_akun: string;
  tipe_akun?: string;
}

interface ModalBayarPayrollProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Supports paying a single payroll or multiple payrolls for a period
  payroll: Payroll | null;
  bulkPayrolls?: Payroll[];
  token: string | null;
  apiUrl?: string;
}

export function ModalBayarPayroll({
  isOpen,
  onClose,
  onSuccess,
  payroll,
  bulkPayrolls = [],
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
}: ModalBayarPayrollProps) {
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>("Transfer Bank");
  const [tanggalPembayaran, setTanggalPembayaran] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedAkunId, setSelectedAkunId] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [coaOptions, setCoaOptions] = useState<AccountOption[]>([]);
  const [isLoadingCoa, setIsLoadingCoa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Targets to pay: either single `payroll` or multiple `bulkPayrolls`
  const targetPayrolls: Payroll[] = React.useMemo(() => {
    if (payroll) return [payroll];
    return bulkPayrolls.filter((p) => p.status !== "Dibayar");
  }, [payroll, bulkPayrolls]);

  // Fallback Kas & Bank accounts if API is loading or empty
  const defaultAccounts: AccountOption[] = [
    { id: "bsi-default", kode_akun: "1-1003", nama_akun: "Bank Syariah Indonesia (BSI)" },
    { id: "kas-default", kode_akun: "1-1001", nama_akun: "Kas Tunai Yayasan" },
  ];

  // Fetch COA (Aset Kas & Bank)
  useEffect(() => {
    if (!isOpen) return;

    setTanggalPembayaran(new Date().toISOString().substring(0, 10));
    setCatatan("");
    setErrorMessage(null);

    const fetchAccounts = async () => {
      setIsLoadingCoa(true);
      try {
        const res = await fetch(`${apiUrl}/akuntansi/coa?tipe=Aset`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();
        const data: AccountOption[] = json.data?.data || json.data || [];
        // Filter kas & bank (kode 1-10xx)
        const kasBankList = data.filter((acc) =>
          acc.kode_akun.startsWith("1-100") ||
          acc.nama_akun.toLowerCase().includes("kas") ||
          acc.nama_akun.toLowerCase().includes("bank")
        );

        if (kasBankList.length > 0) {
          setCoaOptions(kasBankList);
          // Default to BSI or first account
          const bsi = kasBankList.find((a) => a.kode_akun === "1-1003") || kasBankList[0];
          setSelectedAkunId(bsi.id);
        } else {
          setCoaOptions(defaultAccounts);
          setSelectedAkunId(defaultAccounts[0].id);
        }
      } catch {
        setCoaOptions(defaultAccounts);
        setSelectedAkunId(defaultAccounts[0].id);
      } finally {
        setIsLoadingCoa(false);
      }
    };

    fetchAccounts();
  }, [isOpen, apiUrl, token]);

  // Adjust default account when metodePembayaran changes
  const handleMetodeChange = (metode: MetodePembayaran) => {
    setMetodePembayaran(metode);
    if (metode === "Kas Tunai") {
      const kas = coaOptions.find((a) => a.kode_akun === "1-1001");
      if (kas) setSelectedAkunId(kas.id);
    } else {
      const bsi = coaOptions.find((a) => a.kode_akun === "1-1003") || coaOptions[0];
      if (bsi) setSelectedAkunId(bsi.id);
    }
  };

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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  // Calculations for ISAK 35 Journal Preview
  const totalBebanPengasuh = targetPayrolls
    .filter((p) => p.karyawan?.tipe_sdm === "Pengasuh/Ustadz")
    .reduce((acc, p) => acc + (Number(p.gaji_bersih) || 0), 0);

  const totalBebanStaf = targetPayrolls
    .filter((p) => p.karyawan?.tipe_sdm !== "Pengasuh/Ustadz")
    .reduce((acc, p) => acc + (Number(p.gaji_bersih) || 0), 0);

  const totalPengeluaran = totalBebanPengasuh + totalBebanStaf;

  const selectedAccount = coaOptions.find((a) => a.id === selectedAkunId) || coaOptions[0];

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPayrolls.length === 0) {
      setErrorMessage("Tidak ada slip payroll yang dapat dibayarkan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (targetPayrolls.length > 1) {
        // Gunakan atomic batch payment endpoint
        const payload: Record<string, unknown> = {
          payroll_ids: targetPayrolls.map((t) => t.id),
          metode_pembayaran: metodePembayaran,
          tanggal_pembayaran: tanggalPembayaran,
          catatan: catatan.trim() || undefined,
        };

        if (selectedAkunId && !selectedAkunId.includes("default")) {
          payload.kas_bank_akun_id = selectedAkunId;
        }

        const res = await fetch(`${apiUrl}/payroll/pay-bulk`, {
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
          throw new Error(json.message || "Gagal mencairkan payroll massal");
        }
      } else {
        // Single payment
        for (const target of targetPayrolls) {
          const payload: Record<string, unknown> = {
            metode_pembayaran: metodePembayaran,
            tanggal_pembayaran: tanggalPembayaran,
            catatan: catatan.trim() || undefined,
          };

          if (selectedAkunId && !selectedAkunId.includes("default")) {
            payload.kas_bank_akun_id = selectedAkunId;
          }

          const res = await fetch(`${apiUrl}/payroll/${target.id}/pay`, {
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
            throw new Error(
              json.message || `Gagal mencairkan slip ${target.nomor_slip || target.id}`
            );
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan tidak terduga saat mencairkan payroll.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/75 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pencairan Gaji & Integrasi Jurnal ISAK 35
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Konfirmasi pembayaran honor dan pencatatan otomatis ke buku besar akuntansi
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
        <form onSubmit={handleConfirmPay} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Target Summary Card */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
              <div>
                <span className="text-xs text-zinc-500">Target Pembayaran:</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {payroll
                    ? `${payroll.karyawan?.nama_lengkap || "Karyawan"} (${payroll.nomor_slip})`
                    : `${targetPayrolls.length} Karyawan (Periode Terpilih)`}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-zinc-500">Total Pengeluaran Kas:</span>
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                  {formatRupiah(totalPengeluaran)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
              <div>
                <span className="text-zinc-500 block">Beban Pengasuh (5-1007):</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {formatRupiah(totalBebanPengasuh)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Beban Staf & Amil (5-1008):</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {formatRupiah(totalBebanStaf)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="metode_pembayaran" className="text-xs font-semibold">
                Metode Pembayaran
              </Label>
              <select
                id="metode_pembayaran"
                value={metodePembayaran}
                onChange={(e) => handleMetodeChange(e.target.value as MetodePembayaran)}
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Transfer Bank">Transfer Bank (BSI)</option>
                <option value="Kas Tunai">Kas Tunai Yayasan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tanggal_pembayaran" className="text-xs font-semibold">
                Tanggal Pembayaran / Posting
              </Label>
              <Input
                id="tanggal_pembayaran"
                type="date"
                value={tanggalPembayaran}
                onChange={(e) => setTanggalPembayaran(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sumber_dana" className="text-xs font-semibold">
              Akun Kas / Bank Pengeluaran (Buku Besar)
            </Label>
            <select
              id="sumber_dana"
              value={selectedAkunId}
              onChange={(e) => setSelectedAkunId(e.target.value)}
              disabled={isLoadingCoa}
              className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {coaOptions.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.kode_akun} — {acc.nama_akun}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="catatan" className="text-xs font-semibold">
              Keterangan Transaksi (Memo Jurnal)
            </Label>
            <Input
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Pencairan gaji bulan berjalan via transfer rekening BSI"
              className="h-9 text-sm"
            />
          </div>

          {/* Pratinjau Jurnal Berimbang ISAK 35 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> Pratinjau Jurnal Otomatis ISAK 35
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jurnal Berimbang (Balance)
              </span>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Kode & Nama Akun</th>
                    <th className="py-2 px-3 text-right">Debit (Rp)</th>
                    <th className="py-2 px-3 text-right">Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 font-mono">
                  {totalBebanPengasuh > 0 && (
                    <tr>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          5-1007 Beban Honor Pengasuh & Ustadz Santri
                        </span>
                        <span className="block text-[10px] text-zinc-500 font-sans">
                          Alokasi SDM Asrama & Pendidikan
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatRupiah(totalBebanPengasuh)}
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-400">-</td>
                    </tr>
                  )}
                  {totalBebanStaf > 0 && (
                    <tr>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          5-1008 Beban Honor Staf & Amil Yayasan
                        </span>
                        <span className="block text-[10px] text-zinc-500 font-sans">
                          Alokasi SDM Manajemen & Kantor Yayasan
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatRupiah(totalBebanStaf)}
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-400">-</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 px-3 pl-6">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {selectedAccount?.kode_akun || "1-1003"} {selectedAccount?.nama_akun || "Bank Syariah Indonesia"}
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-sans">
                        Pengeluaran Kas/Bank Operasional
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-400">-</td>
                    <td className="py-2 px-3 text-right font-bold text-red-700 dark:text-red-400 tabular-nums">
                      {formatRupiah(totalPengeluaran)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-zinc-50 dark:bg-zinc-800/70 border-t border-zinc-200 dark:border-zinc-800 font-bold font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans text-right uppercase text-[11px] text-zinc-600 dark:text-zinc-400">
                      Total Saldo Jurnal:
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-800 dark:text-emerald-300 tabular-nums">
                      {formatRupiah(totalPengeluaran)}
                    </td>
                    <td className="py-2 px-3 text-right text-red-800 dark:text-red-300 tabular-nums">
                      {formatRupiah(totalPengeluaran)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Perhatian:</strong> Setelah dikonfirmasi, status payroll berubah menjadi <strong>Dibayar</strong> dan jurnal akuntansi langsung diposting secara permanen ke buku besar dan buku kas yayasan demi integritas pelaporan ISAK 35.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs text-zinc-700 dark:text-zinc-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || totalPengeluaran <= 0}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses Pembayaran...
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  Konfirmasi Pembayaran & Posting Jurnal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
