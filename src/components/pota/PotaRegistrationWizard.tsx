"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, AlertCircle, School, HeartHandshake, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AnakAsuh {
  id: string;
  nama: string;
  jenis_kelamin: string;
  status_keluarga?: string;
  tingkat_pendidikan?: string;
  nama_sekolah?: string;
  tempat_lahir?: string;
  keterangan?: string;
  foto_identitas?: string | null;
}

interface PotaRegistrationWizardProps {
  availableAnakAsuh: AnakAsuh[];
  isLoadingAvailableAnak: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PotaRegistrationWizard({
  availableAnakAsuh,
  isLoadingAvailableAnak,
  onSuccess,
  onCancel,
}: PotaRegistrationWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAnakIds, setSelectedAnakIds] = useState<string[]>([]);
  const [childCommitments, setChildCommitments] = useState<
    Record<string, { nominal: number; hari: number; doa: string }>
  >({});
  const [activeChildModalDetail, setActiveChildModalDetail] = useState<AnakAsuh | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const toggleSelectAnak = (id: string) => {
    setSelectedAnakIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((x) => x !== id) : [...prev, id];

      if (!exists && !childCommitments[id]) {
        setChildCommitments((c) => ({
          ...c,
          [id]: { nominal: 250000, hari: 1, doa: "" },
        }));
      }
      return updated;
    });
  };

  const updateChildCommitment = (
    id: string,
    field: "nominal" | "hari" | "doa",
    value: any
  ) => {
    setChildCommitments((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { nominal: 250000, hari: 1, doa: "" }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);

    if (selectedAnakIds.length === 0) {
      setFormMessage({
        type: "error",
        text: "Silakan pilih minimal satu ananda asuh binaan.",
      });
      return;
    }

    for (const id of selectedAnakIds) {
      const comm = childCommitments[id] || { nominal: 250000, hari: 1 };
      if (comm.nominal < 50000) {
        const anak = availableAnakAsuh.find((a) => a.id === id);
        setFormMessage({
          type: "error",
          text: `Komitmen beasiswa untuk ${anak?.nama || "ananda"} minimal Rp 50.000 / bulan.`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const payload = {
        items: selectedAnakIds.map((id) => ({
          anak_asuh_id: id,
          nominal_bulanan: childCommitments[id]?.nominal || 250000,
          hari_tagihan_per_bulan: Number(childCommitments[id]?.hari) || 1,
          catatan_doa: childCommitments[id]?.doa || null,
        })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api"}/user/orang-tua-asuh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mendaftarkan komitmen Orang Tua Asuh.");
      }

      setFormMessage({
        type: "success",
        text: `Alhamdulillah! Komitmen Orang Tua Asuh untuk ${selectedAnakIds.length} ananda berhasil didaftarkan.`,
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setFormMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalKomitmen = selectedAnakIds.reduce(
    (sum, id) => sum + (childCommitments[id]?.nominal || 250000),
    0
  );

  return (
    <div className="mb-8 p-5 sm:p-7 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-emerald-200 dark:border-emerald-800/60 space-y-6 animate-in slide-in-from-top-3 duration-300 shadow-sm relative">
      {/* Header & Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pendaftaran Orang Tua Asuh (POTA)</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {step === 1
              ? "Langkah 1: Pilih Calon Ananda Asuh"
              : "Langkah 2: Tentukan Komitmen Beasiswa & Jadwal Salur"}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            {step === 1
              ? "Anda dapat memilih satu atau beberapa ananda binaan sekaligus untuk didampingi beasiswa pendidikannya."
              : `Atur nominal infak beasiswa dan tanggal pengingat rutin untuk ${selectedAnakIds.length} ananda yang dipilih.`}
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer min-h-[36px]",
              step === 1
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
            )}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Pilih ({selectedAnakIds.length})</span>
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">→</span>
          <button
            type="button"
            onClick={() => {
              if (selectedAnakIds.length > 0) setStep(2);
            }}
            disabled={selectedAnakIds.length === 0}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px]",
              step === 2
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 disabled:opacity-50 cursor-pointer"
            )}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Komitmen Beasiswa</span>
          </button>
        </div>
      </div>

      {formMessage && (
        <div
          className={cn(
            "flex items-center gap-2.5 p-4 rounded-xl text-xs font-semibold border",
            formMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          )}
        >
          {formMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          )}
          <span>{formMessage.text}</span>
        </div>
      )}

      {/* STEP 1: SIMPLE CARD GRID + MULTI-SELECT + QUICK DETAIL */}
      {step === 1 && (
        <div className="space-y-6">
          {isLoadingAvailableAnak ? (
            <div className="p-12 text-sm text-zinc-500 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data calon ananda santri binaan...
            </div>
          ) : availableAnakAsuh.length === 0 ? (
            <div className="p-12 text-sm text-zinc-600 dark:text-zinc-400 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Alhamdulillah! Seluruh Ananda Telah Memiliki Orang Tua Asuh
              </p>
              <p className="text-xs text-zinc-500">
                Saat ini belum ada calon ananda binaan baru yang memerlukan beasiswa rutin. Anda tetap dapat berinfak umum melalui tab Donasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[540px] overflow-y-auto p-1 pr-2">
              {availableAnakAsuh.map((anak) => {
                const isSelected = selectedAnakIds.includes(anak.id);
                return (
                  <div
                    key={anak.id}
                    onClick={() => toggleSelectAnak(anak.id)}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative group hover:shadow-md min-h-[140px]",
                      isSelected
                        ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30 dark:border-emerald-500"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-300"
                    )}
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="relative h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-base flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/60 overflow-hidden">
                          {anak.foto_identitas ? (
                            <Image
                              src={anak.foto_identitas}
                              alt={anak.nama}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span>{anak.nama?.charAt(0) || "A"}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                              {anak.status_keluarga || "Yatim"}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {anak.jenis_kelamin}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                            {anak.nama}
                          </h4>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                            <School className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">
                              {anak.tingkat_pendidikan || "Sekolah"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChildModalDetail(anak);
                        }}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            isSelected
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-zinc-400"
                          )}
                        >
                          {isSelected ? "Terpilih" : "Pilih"}
                        </span>
                        <div
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors",
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                          )}
                        >
                          {isSelected && "✓"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Bar Bawah Langkah 1 */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-xs h-11 px-5 rounded-xl border-zinc-300 dark:border-zinc-700"
            >
              Batal
            </Button>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                {selectedAnakIds.length} Ananda Terpilih
              </span>
              <Button
                type="button"
                disabled={selectedAnakIds.length === 0}
                onClick={() => setStep(2)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                Lanjut ke Komitmen Beasiswa (Langkah 2) →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: KOMITMEN BEASISWA & JADWAL SALUR PER ANANDA */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tombol Navigasi Atas ke Langkah 1 */}
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="text-xs font-semibold cursor-pointer h-9 px-3.5 rounded-xl"
            >
              ← Kembali ke Langkah 1 (Pilih Ananda)
            </Button>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium hidden sm:inline">
              Menyesuaikan komitmen untuk{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                {selectedAnakIds.length}
              </strong>{" "}
              ananda binaan
            </span>
          </div>

          {/* Form Komitmen Masing-masing Ananda */}
          <div className="space-y-4">
            {selectedAnakIds.map((id, index) => {
              const anak = availableAnakAsuh.find((a) => a.id === id);
              const comm = childCommitments[id] || { nominal: 250000, hari: 1, doa: "" };
              return (
                <div
                  key={id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-base flex items-center justify-center shrink-0 border border-amber-200 overflow-hidden">
                        {anak?.foto_identitas ? (
                          <Image
                            src={anak.foto_identitas}
                            alt={anak?.nama || "Anak"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{anak?.nama?.charAt(0) || `${index + 1}`}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded">
                            Ananda #{index + 1}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {anak?.jenis_kelamin} • {anak?.status_keluarga || "Yatim"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                          {anak?.nama || "Ananda Asuh"}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          {anak?.tingkat_pendidikan || "Sekolah"} • {anak?.nama_sekolah || "Asrama YAMUTI"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelectAnak(id)}
                      className="text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 min-h-[36px]"
                    >
                      Batal Pilih
                    </Button>
                  </div>

                  {/* Input Komitmen Mandiri untuk Ananda Ini */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nominal Donasi */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Komitmen Donasi Bulanan (Rp)
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[100000, 250000, 500000].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => updateChildCommitment(id, "nominal", val)}
                            className={cn(
                              "py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[38px]",
                              comm.nominal === val
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
                            )}
                          >
                            Rp {(val / 1000).toLocaleString("id-ID")}rb
                          </button>
                        ))}
                      </div>
                      <Input
                        type="number"
                        min={50000}
                        step={10000}
                        value={comm.nominal || ""}
                        onChange={(e) =>
                          updateChildCommitment(id, "nominal", Number(e.target.value) || 0)
                        }
                        className="h-10 text-xs font-mono bg-white dark:bg-zinc-900 rounded-xl"
                        placeholder="Nominal lain, min Rp 50.000"
                        required
                      />
                    </div>

                    {/* Jadwal Pengingat Salur */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Jadwal Pengingat Salur (Tgl Tiap Bulan)
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 5, 10].map((tgl) => (
                          <button
                            type="button"
                            key={tgl}
                            onClick={() => updateChildCommitment(id, "hari", tgl)}
                            className={cn(
                              "py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[38px]",
                              comm.hari === tgl
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
                            )}
                          >
                            Tgl {tgl}
                          </button>
                        ))}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={comm.hari || ""}
                        onChange={(e) =>
                          updateChildCommitment(id, "hari", Number(e.target.value) || 1)
                        }
                        className="h-10 text-xs font-mono bg-white dark:bg-zinc-900 rounded-xl"
                        placeholder="Tanggal 1-31"
                        required
                      />
                    </div>
                  </div>

                  {/* Pesan Doa untuk Ananda ini */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Pesan Doa / Harapan untuk {anak?.nama || "Ananda"} (Opsional)
                    </Label>
                    <Input
                      type="text"
                      value={comm.doa || ""}
                      onChange={(e) => updateChildCommitment(id, "doa", e.target.value)}
                      placeholder="Semoga ananda istiqomah belajar, sholeh/sholehah dan tercapai cita-citanya..."
                      className="h-10 text-xs bg-white dark:bg-zinc-900 rounded-xl"
                      maxLength={500}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ringkasan Total Komitmen */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                Total Komitmen Infak Beasiswa Rutin ({selectedAnakIds.length} Anak):
              </p>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                Rp {totalKomitmen.toLocaleString("id-ID")} / bulan
              </p>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              * Anda dapat menyalurkan donasi bulanan secara fleksibel kapan saja.
            </div>
          </div>

          {/* Action Bar Bawah Langkah 2 */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="text-xs h-11 px-5 rounded-xl border-zinc-300 dark:border-zinc-700"
            >
              ← Kembali ke Langkah 1
            </Button>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="text-xs h-11 px-4 text-zinc-500 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedAnakIds.length === 0}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? "Menyimpan Komitmen..."
                  : `Konfirmasi Jadi Orang Tua Asuh (${selectedAnakIds.length} Anak)`}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* MODAL DIALOG DETAIL ANANDA SANTRI */}
      <Dialog
        open={!!activeChildModalDetail}
        onOpenChange={(open) => !open && setActiveChildModalDetail(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Profil Lengkap Calon Ananda Asuh
            </DialogTitle>
            <DialogDescription>
              Informasi detail ananda santri binaan asrama YAMUTI.
            </DialogDescription>
          </DialogHeader>

          {activeChildModalDetail && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative h-20 w-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-2xl flex items-center justify-center shrink-0 border border-amber-200 overflow-hidden">
                  {activeChildModalDetail.foto_identitas ? (
                    <Image
                      src={activeChildModalDetail.foto_identitas}
                      alt={activeChildModalDetail.nama}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{activeChildModalDetail.nama?.charAt(0) || "A"}</span>
                  )}
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                    {activeChildModalDetail.status_keluarga || "Yatim"}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {activeChildModalDetail.nama}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {activeChildModalDetail.jenis_kelamin} • Lahir di{" "}
                    {activeChildModalDetail.tempat_lahir || "Tasikmalaya"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <span className="text-zinc-500 block">Jenjang Sekolah:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {activeChildModalDetail.tingkat_pendidikan || "Sekolah"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Nama Sekolah:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {activeChildModalDetail.nama_sekolah || "Asrama YAMUTI"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">
                    Bio Singkat & Keterangan:
                  </span>
                  <p className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                    {activeChildModalDetail.keterangan ||
                      "Ananda adalah santri binaan asrama YAMUTI yang tekun menuntut ilmu dan menghafal Al-Qur'an."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveChildModalDetail(null)}
                  className="text-xs rounded-xl"
                >
                  Tutup
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!selectedAnakIds.includes(activeChildModalDetail.id)) {
                      toggleSelectAnak(activeChildModalDetail.id);
                    }
                    setActiveChildModalDetail(null);
                  }}
                  className={cn(
                    "text-xs font-bold rounded-xl",
                    selectedAnakIds.includes(activeChildModalDetail.id)
                      ? "bg-zinc-700 text-white"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  )}
                >
                  {selectedAnakIds.includes(activeChildModalDetail.id)
                    ? "✓ Sudah Dipilih"
                    : "+ Pilih Ananda Ini"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
