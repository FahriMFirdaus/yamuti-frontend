"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, AlertCircle, School, Eye } from "lucide-react";
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
  onStepChange?: (step: 1 | 2) => void;
}

export function PotaRegistrationWizard({
  availableAnakAsuh,
  isLoadingAvailableAnak,
  onSuccess,
  onCancel,
  onStepChange,
}: PotaRegistrationWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAnakIds, setSelectedAnakIds] = useState<string[]>([]);
  const [childCommitments, setChildCommitments] = useState<
    Record<string, { nominal: number | ""; hari: number | ""; doa: string }>
  >({});
  const [activeChildModalDetail, setActiveChildModalDetail] = useState<AnakAsuh | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const wizardRef = useRef<HTMLDivElement>(null);
  const step1ScrollRef = useRef<HTMLDivElement>(null);
  const step2ScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wizardRef.current) {
      const rect = wizardRef.current.getBoundingClientRect();
      const isOutOfView = rect.top < 85 || rect.bottom > window.innerHeight;
      if (isOutOfView) {
        wizardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const goToStep2 = () => {
    if (selectedAnakIds.length > 0) {
      setStep(2);
      onStepChange?.(2);
      setTimeout(() => {
        if (step2ScrollRef.current) {
          step2ScrollRef.current.scrollTop = 0;
        }
        if (wizardRef.current) {
          const rect = wizardRef.current.getBoundingClientRect();
          if (rect.top < 85 || rect.bottom > window.innerHeight) {
            wizardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 0);
    }
  };

  const goToStep1 = () => {
    setStep(1);
    onStepChange?.(1);
    setTimeout(() => {
      if (step1ScrollRef.current) {
        step1ScrollRef.current.scrollTop = 0;
      }
      if (wizardRef.current) {
        const rect = wizardRef.current.getBoundingClientRect();
        if (rect.top < 85 || rect.bottom > window.innerHeight) {
          wizardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 0);
  };

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
    value: number | string
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
      const comm = childCommitments[id] || { nominal: 250000, hari: 1, doa: "" };
      const nominal = Number(comm.nominal) || 0;
      const hari = Number(comm.hari) || 0;
      if (nominal < 50000) {
        const anak = availableAnakAsuh.find((a) => a.id === id);
        setFormMessage({
          type: "error",
          text: `Komitmen beasiswa untuk ${anak?.nama || "ananda"} minimal Rp 50.000 / bulan.`,
        });
        return;
      }
      if (hari < 1 || hari > 31) {
        const anak = availableAnakAsuh.find((a) => a.id === id);
        setFormMessage({
          type: "error",
          text: `Jadwal pengingat salur untuk ${anak?.nama || "ananda"} harus antara tanggal 1 - 31.`,
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
          nominal_bulanan: Number(childCommitments[id]?.nominal) || 250000,
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar";
      setFormMessage({ type: "error", text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalKomitmen = selectedAnakIds.reduce((sum, id) => {
    const raw = childCommitments[id]?.nominal;
    const val = raw === "" || raw === undefined ? 0 : Number(raw);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div
      ref={wizardRef}
      className={cn(
        "scroll-mt-20 lg:scroll-mt-24 mb-6 rounded-2xl sm:rounded-3xl",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative",
        "p-4 sm:p-5",
        "flex flex-col",
        "max-h-[calc(100dvh-120px)] min-h-[380px] sm:min-h-[460px]",
        "lg:h-[min(640px,calc(100dvh-140px))] lg:max-h-[640px] lg:min-h-[500px]"
      )}
    >
      {/* Header Stepper Minimalis */}
      <div className="shrink-0 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {step === 1 ? "Tahap 1 dari 2: Penentuan Calon" : "Tahap 2 dari 2: Rincian Donasi"}
          </span>
        </div>

        {/* Step Indicator Badges (Bersih, Berbobot, Bebas Slop) */}
        <div
          role="group"
          aria-label="Tahapan Formulir Pendaftaran"
          className="flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={goToStep1}
            aria-current={step === 1 ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap",
              step === 1
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700 font-semibold"
                : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                step === 1
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
              )}
            >
              1
            </span>
            <span>1. Pilih Ananda ({selectedAnakIds.length})</span>
          </button>

          <span className="text-zinc-300 dark:text-zinc-700 text-xs select-none" aria-hidden="true">→</span>

          <button
            type="button"
            onClick={goToStep2}
            disabled={selectedAnakIds.length === 0}
            aria-current={step === 2 ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
              step === 2
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700 font-semibold"
                : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-100"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                step === 2
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
              )}
            >
              2
            </span>
            <span>2. Komitmen Donasi</span>
          </button>
        </div>
      </div>

      {/* Form Message Alert */}
      {formMessage && (
        <div
          className={cn(
            "shrink-0 my-2 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold border",
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
          <span className="truncate">{formMessage.text}</span>
        </div>
      )}

      {/* STEP 1: SIMPLE CARD GRID + MULTI-SELECT + QUICK DETAIL */}
      {step === 1 && (
        <div className="flex-1 min-h-0 flex flex-col pt-2.5 sm:pt-3">
          {isLoadingAvailableAnak ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs sm:text-sm text-zinc-500 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data calon ananda santri binaan...
            </div>
          ) : availableAnakAsuh.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Alhamdulillah! Seluruh Ananda Telah Memiliki Orang Tua Asuh
              </p>
              <p className="text-xs text-zinc-500">
                Saat ini belum ada calon ananda binaan baru yang memerlukan beasiswa rutin. Anda tetap dapat berinfak umum melalui tab Donasi.
              </p>
            </div>
          ) : (
            <div
              ref={step1ScrollRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 sm:pr-2 pb-1 [scrollbar-width:thin]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-0.5">
                {availableAnakAsuh.map((anak) => {
                  const isSelected = selectedAnakIds.includes(anak.id);
                  return (
                    <div
                      key={anak.id}
                      onClick={() => toggleSelectAnak(anak.id)}
                      className={cn(
                        "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative group",
                        isSelected
                          ? "bg-emerald-50/70 border-emerald-600 shadow-sm dark:bg-emerald-950/30 dark:border-emerald-500"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-2.5">
                          <div className="relative h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-sm flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
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
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                {anak.status_keluarga || "Yatim"}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {anak.jenis_kelamin}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                              {anak.nama}
                            </h4>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                              <School className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">
                                {anak.tingkat_pendidikan || "Sekolah"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChildModalDetail(anak);
                          }}
                          className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer min-h-[32px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[11px] font-medium",
                              isSelected
                                ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "text-zinc-400"
                            )}
                          >
                            {isSelected ? "Terpilih" : "Pilih"}
                          </span>
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold transition-colors",
                              isSelected
                                ? "bg-emerald-700 text-white border-emerald-700"
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
            </div>
          )}

          {/* Action Bar Bawah Langkah 1 (Sticky/Fixed bottom of card) */}
          <div className="shrink-0 pt-3 pb-1 mt-auto flex flex-row items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800 bg-inherit">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-xs h-9 sm:h-10 px-4 rounded-lg border-zinc-300 dark:border-zinc-700 cursor-pointer"
            >
              Batal
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{selectedAnakIds.length}</strong> anak dipilih
              </span>
              <Button
                type="button"
                disabled={selectedAnakIds.length === 0}
                onClick={goToStep2}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-9 sm:h-10 px-4 sm:px-6 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>Lanjut ke Komitmen</span>
                <span className="ml-1">→</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: KOMITMEN BEASISWA & JADWAL SALUR PER ANANDA */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate className="flex-1 min-h-0 flex flex-col pt-2 sm:pt-2.5">
          {/* Subheader Info Bar */}
          <div className="shrink-0 mb-2 flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-1.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Menyesuaikan komitmen untuk{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                {selectedAnakIds.length}
              </strong>{" "}
              ananda binaan
            </span>
            <button
              type="button"
              onClick={goToStep1}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline text-[11px] sm:text-xs cursor-pointer flex items-center gap-1"
            >
              ← Ubah Pilihan
            </button>
          </div>

          {/* Form Komitmen Masing-masing Ananda (Internal Scroll Container) */}
          <div
            ref={step2ScrollRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 sm:pr-2 space-y-3 pb-1 [scrollbar-width:thin]"
          >
            {selectedAnakIds.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Belum ada ananda yang dipilih untuk komitmen beasiswa.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={goToStep1}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-xl"
                >
                  ← Kembali ke Langkah 1 untuk Memilih Ananda
                </Button>
              </div>
            ) : (
              <>
                {selectedAnakIds.map((id, index) => {
                  const anak = availableAnakAsuh.find((a) => a.id === id);
                  const comm = childCommitments[id] || { nominal: 250000, hari: 1, doa: "" };
                  return (
                    <div
                      key={id}
                      className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200 overflow-hidden">
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
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                #{index + 1}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {anak?.jenis_kelamin} • {anak?.status_keluarga || "Yatim"}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                              {anak?.nama || "Ananda Asuh"}
                            </h4>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {anak?.tingkat_pendidikan || "Sekolah"} • {anak?.nama_sekolah || "Asrama YAMUTI"}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSelectAnak(id)}
                          className="text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 h-8 px-2.5 shrink-0"
                        >
                          Batal Pilih
                        </Button>
                      </div>

                      {/* Inputs: Nominal Donasi & Jadwal Pengingat Salur */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Nominal Donasi */}
                        <div className="space-y-1.5">
                          <Label className="text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Komitmen Beasiswa Bulanan (Rp)
                          </Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[100000, 250000, 500000].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => updateChildCommitment(id, "nominal", val)}
                                className={cn(
                                  "py-1.5 px-1 text-center rounded-lg text-xs font-medium border transition-all cursor-pointer min-h-[34px]",
                                  comm.nominal === val
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600 font-semibold"
                                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                            value={comm.nominal ?? ""}
                            onChange={(e) =>
                              updateChildCommitment(
                                id,
                                "nominal",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            className="h-9 text-xs font-mono bg-white dark:bg-zinc-900 rounded-lg"
                            placeholder="Nominal lain, min Rp 50.000"
                            required
                          />
                        </div>

                        {/* Jadwal Pengingat Salur */}
                        <div className="space-y-1.5">
                          <Label className="text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Tanggal Salur Bulanan
                          </Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[1, 5, 10].map((tgl) => (
                              <button
                                type="button"
                                key={tgl}
                                onClick={() => updateChildCommitment(id, "hari", tgl)}
                                className={cn(
                                  "py-1.5 px-1 text-center rounded-lg text-xs font-medium border transition-all cursor-pointer min-h-[34px]",
                                  comm.hari === tgl
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600 font-semibold"
                                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                            value={comm.hari ?? ""}
                            onChange={(e) =>
                              updateChildCommitment(
                                id,
                                "hari",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            className="h-9 text-xs font-mono bg-white dark:bg-zinc-900 rounded-lg"
                            placeholder="Tanggal 1-31"
                            required
                          />
                        </div>
                      </div>

                      {/* Pesan Doa untuk Ananda ini */}
                      <div className="space-y-1">
                        <Label className="text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Pesan Doa / Harapan (Opsional)
                        </Label>
                        <Input
                          type="text"
                          value={comm.doa || ""}
                          onChange={(e) => updateChildCommitment(id, "doa", e.target.value)}
                          placeholder="Tuliskan doa atau kata motivasi untuk ananda..."
                          className="h-9 text-xs bg-white dark:bg-zinc-900 rounded-lg"
                          maxLength={500}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Ringkasan Total Komitmen */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      Total Komitmen Beasiswa ({selectedAnakIds.length} Anak):
                    </p>
                    <p className="text-lg sm:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                      Rp {totalKomitmen.toLocaleString("id-ID")} <span className="text-xs font-normal text-zinc-500">/ bulan</span>
                    </p>
                  </div>
                  <div className="text-[11px] text-zinc-500 max-w-xs">
                    Pengingat salur akan dikirimkan sesuai tanggal pilihan tiap bulannya.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Bar Bawah Langkah 2 (Sticky/Fixed bottom of card) */}
          <div className="shrink-0 pt-3 pb-1 mt-auto flex flex-row items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800 bg-inherit">
            <Button
              type="button"
              variant="outline"
              onClick={goToStep1}
              className="text-xs h-9 sm:h-10 px-3.5 rounded-lg border-zinc-300 dark:border-zinc-700 cursor-pointer"
            >
              ← Kembali
            </Button>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span>Total:</span>
              <strong className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Rp {totalKomitmen.toLocaleString("id-ID")}
              </strong>
              <span className="text-[11px] text-zinc-500">/bln</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="text-xs h-9 sm:h-10 px-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedAnakIds.length === 0}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-9 sm:h-10 px-4 sm:px-6 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Simpan Komitmen ({selectedAnakIds.length} Anak)
                    </span>
                    <span className="sm:hidden">
                      Simpan ({selectedAnakIds.length})
                    </span>
                  </>
                )}
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
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">
              Profil Lengkap Calon Ananda Asuh
            </DialogTitle>
            <DialogDescription className="text-xs">
              Informasi detail ananda santri binaan asrama YAMUTI.
            </DialogDescription>
          </DialogHeader>

          {activeChildModalDetail && (
            <div className="space-y-3.5 py-1">
              <div className="flex items-center gap-3.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 border border-amber-200 overflow-hidden">
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
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                    {activeChildModalDetail.status_keluarga || "Yatim"}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                    {activeChildModalDetail.nama}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {activeChildModalDetail.jenis_kelamin} • Lahir di{" "}
                    {activeChildModalDetail.tempat_lahir || "Tasikmalaya"}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2.5 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Jenjang Sekolah:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {activeChildModalDetail.tingkat_pendidikan || "Sekolah"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Nama Sekolah:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {activeChildModalDetail.nama_sekolah || "Asrama YAMUTI"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-1 text-[11px]">
                    Bio Singkat & Keterangan:
                  </span>
                  <p className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 italic leading-relaxed text-xs">
                    {activeChildModalDetail.keterangan ||
                      "Ananda adalah santri binaan asrama YAMUTI yang tekun menuntut ilmu dan menghafal Al-Qur'an."}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveChildModalDetail(null)}
                  className="text-xs rounded-xl h-8 px-3"
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
                    "text-xs font-bold rounded-xl h-8 px-3.5",
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
