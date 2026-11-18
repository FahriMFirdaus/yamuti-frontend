"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isBefore, startOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  CalendarCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const kunjunganSchema = z.object({
  nama_tamu: z.string().min(3, { message: "Nama perwakilan minimal 3 karakter." }),
  no_whatsapp: z
    .string()
    .min(9, { message: "Nomor WhatsApp minimal 9 digit." })
    .max(15, { message: "Nomor WhatsApp maksimal 15 digit." })
    .regex(/^[0-9]+$/, { message: "Hanya angka tanpa spasi atau tanda hubung." }),
  jumlah_pengunjung: z
    .number()
    .min(1, { message: "Minimal 1 orang pengunjung." })
    .max(100, { message: "Maksimal 100 orang pengunjung per rombongan." }),
  maksud: z
    .string()
    .min(10, { message: "Maksud kunjungan minimal 10 karakter agar pengurus dapat mempersiapkan sambutan." }),
  tanggal_kunjungan: z.date({ message: "Silakan pilih tanggal kunjungan di kalender." }),
  waktu_kunjungan: z.string().min(1, { message: "Silakan pilih jam kunjungan yang tersedia." }),
});

type KunjunganFormValues = z.infer<typeof kunjunganSchema>;

export default function KunjunganPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [timeSlots, setTimeSlots] = useState<{ jam: string; is_available: boolean }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [stepError, setStepError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<KunjunganFormValues>({
    resolver: zodResolver(kunjunganSchema),
    defaultValues: {
      nama_tamu: "",
      no_whatsapp: "",
      jumlah_pengunjung: 1,
      maksud: "",
      waktu_kunjungan: "",
    },
  });

  const jumlahPengunjungValue = watch("jumlah_pengunjung");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
      fetch(`${apiUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.success && data.data) {
            setValue("nama_tamu", data.data.name || "");
            setValue("no_whatsapp", data.data.no_hp || "");
          }
        })
        .catch(() => {});
    }
  }, [setValue]);

  useEffect(() => {
    if (date) {
      setTime("");
      setIsCustomTime(false);
      setTimeSlots([]);
      setIsLoadingSlots(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

      fetch(`${apiUrl}/kunjungan/ketersediaan?tanggal=${formattedDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.data && data.data.slot_waktu) {
            setTimeSlots(data.data.slot_waktu);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingSlots(false));
    }
  }, [date]);

  const handleNextStep = () => {
    setStepError("");
    if (!date) {
      setStepError("Tentukan tanggal kunjungan di kalender terlebih dahulu.");
      return;
    }
    if (!time) {
      setStepError("Pilih slot jam kehadiran atau ajukan jam khusus.");
      return;
    }
    setValue("tanggal_kunjungan", date);
    setValue("waktu_kunjungan", time);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: KunjunganFormValues) => {
    setIsLoading(true);
    setSubmitError("");

    const formattedDate = format(data.tanggal_kunjungan, "yyyy-MM-dd");
    const isFullDay = data.waktu_kunjungan === "FULL DAY";
    const timeString = isFullDay
      ? "00:00:00"
      : data.waktu_kunjungan.length === 5
      ? `${data.waktu_kunjungan}:00`
      : data.waktu_kunjungan;
    const slotWaktu = `${formattedDate} ${timeString}`;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
      const response = await fetch(`${apiUrl}/kunjungan`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          nama_tamu: data.nama_tamu,
          no_whatsapp: data.no_whatsapp,
          jumlah_pengunjung: data.jumlah_pengunjung,
          maksud: data.maksud,
          slot_waktu: slotWaktu,
          is_full_day: isFullDay,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Gagal mengirim formulir kunjungan.");
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kendala saat mengirim data kunjungan.";
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-[80vh] bg-stone-50 dark:bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-5">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full mb-3 border border-emerald-200/60 dark:border-emerald-800/40">
            Pengajuan Diterima
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Jadwal Kunjungan Terkirim
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed max-w-md mx-auto">
            Terima kasih atas niat tulus Anda bersilaturahmi. Pengurus asrama akan meninjau slot dan mengonfirmasi kesiapan penerimaan melalui WhatsApp sebelum hari H.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700/60 text-left text-xs space-y-2">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Waktu Kunjungan</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {date ? format(date, "d MMMM yyyy", { locale: idLocale }) : "-"} • {time}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Lokasi</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Asrama YAMUTI Tasikmalaya</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={() => router.push("/profil?tab=kunjungan")}
              className="h-11 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              Pantau Status di Akun Saya
            </Button>
            <Button
              onClick={() => {
                setIsSuccess(false);
                setStep(1);
                setDate(undefined);
                setTime("");
              }}
              variant="outline"
              className="h-11 px-6 rounded-xl border-stone-200 dark:border-zinc-800 font-semibold text-xs cursor-pointer"
            >
              Ajukan Jadwal Lain
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 pb-20">
      <header className="border-b border-stone-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 mb-3">
                <CalendarCheck className="w-3.5 h-3.5" />
                Silaturahmi & Kunjungan Kasih
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Pilih Jadwal Silaturahmi Asrama
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Pintu asrama terbuka hangat bagi bapak, ibu, dan keluarga yang ingin melihat langsung keseharian, makan bersama, atau berbagi keceriaan dengan anak-anak asuh kami.
              </p>
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-stone-100/80 dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-700/80 shrink-0 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Asrama Utama YAMUTI</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Pasar Gunung Kalong, Tamansari, Tasikmalaya
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <nav aria-label="Progress" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-3 sm:gap-4 max-w-md">
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={cn(
                  "w-full text-left py-2 border-b-2 transition-colors cursor-pointer",
                  step === 1
                    ? "border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-bold"
                    : "border-stone-200 dark:border-zinc-800 text-zinc-400"
                )}
              >
                <span className="text-[11px] block uppercase tracking-wider">Langkah 1</span>
                <span className="text-xs sm:text-sm font-semibold">Waktu & Jam</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                type="button"
                disabled={!date || !time}
                onClick={() => {
                  if (date && time) setStep(2);
                }}
                className={cn(
                  "w-full text-left py-2 border-b-2 transition-colors",
                  step === 2
                    ? "border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-bold cursor-pointer"
                    : "border-stone-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                <span className="text-[11px] block uppercase tracking-wider">Langkah 2</span>
                <span className="text-xs sm:text-sm font-semibold">Identitas Tamu</span>
              </button>
            </li>
          </ol>
        </nav>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  1. Pilih Hari & Tanggal
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Pilih hari yang paling luang bagi Anda atau rombongan.
                </p>
              </div>

              <div className="flex justify-center border border-stone-100 dark:border-zinc-800/80 rounded-2xl p-2 bg-stone-50/50 dark:bg-zinc-950/50">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => isBefore(d, startOfDay(new Date()))}
                  className="rounded-xl w-full max-w-[320px]"
                />
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3.5 leading-relaxed">
                * Asrama menerima tamu setiap hari. Untuk kunjungan kelompok di atas 15 orang, disarankan memilih waktu minimal 2 hari sebelumnya.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  2. Pilih Sesi Jam Kunjungan
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {date
                    ? `Menampilkan jadwal untuk ${format(date, "EEEE, d MMMM yyyy", { locale: idLocale })}`
                    : "Pilih tanggal di sisi kiri untuk melihat jam operasional asrama."}
                </p>
              </div>

              {!date ? (
                <div className="py-12 px-6 rounded-2xl border border-dashed border-stone-200 dark:border-zinc-800 text-center text-zinc-400 text-xs sm:text-sm">
                  Silakan tentukan tanggal kunjungan pada kalender terlebih dahulu.
                </div>
              ) : isLoadingSlots ? (
                <div className="py-12 px-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 text-center space-y-3">
                  <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs text-zinc-500">Mengecek ketersediaan slot penerimaan...</span>
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {timeSlots.map((slot, i) => {
                      const isFullDay = slot.jam === "FULL DAY";
                      const isSelected = !isCustomTime && time === slot.jam;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!slot.is_available}
                          onClick={() => {
                            setIsCustomTime(false);
                            setTime(slot.jam);
                          }}
                          className={cn(
                            "h-11 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                            isFullDay ? "col-span-2 sm:col-span-4" : "",
                            isSelected
                              ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                              : "border-stone-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 bg-stone-50/50 dark:bg-zinc-800/40",
                            !slot.is_available &&
                              "opacity-40 cursor-not-allowed bg-stone-100 dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-zinc-400 line-through"
                          )}
                        >
                          <span>{slot.jam}</span>
                          {!slot.is_available && <span className="text-[10px] no-underline">(Penuh)</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-stone-100 dark:border-zinc-800">
                    {isCustomTime ? (
                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            Masukkan Jam Khusus yang Dikehendaki
                          </Label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomTime(false);
                              setTime("");
                            }}
                            className="text-xs text-zinc-500 hover:underline cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="h-10 text-xs font-mono max-w-[160px] bg-white dark:bg-zinc-900 rounded-xl"
                          />
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">
                            Pengurus akan memastikan kesiapan jadwal anak-anak pada jam tersebut.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTime(true);
                          setTime("");
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
                      >
                        + Butuh hadir di luar slot di atas? Ajukan jam khusus
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                  Belum ada slot jam pada tanggal yang dipilih. Silakan coba tanggal lain atau hubungi narahubung asrama.
                </div>
              )}

              {stepError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{stepError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!date || !time}
                  className="h-11 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  Lanjut ke Data Tamu <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  Jadwal Dipilih
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {date ? format(date, "EEEE, d MMMM yyyy", { locale: idLocale }) : ""} • Pukul {time} WIB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-emerald-800 dark:text-emerald-300 hover:underline font-semibold cursor-pointer"
              >
                Ubah Waktu
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama_tamu" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Nama Lengkap Perwakilan
                </Label>
                <Input
                  id="nama_tamu"
                  placeholder="Contoh: H. Agus Salim"
                  {...register("nama_tamu")}
                  className={cn(
                    "h-11 rounded-xl text-xs bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800",
                    errors.nama_tamu && "border-rose-500 focus-visible:ring-rose-500"
                  )}
                />
                {errors.nama_tamu && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.nama_tamu.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="no_whatsapp" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Nomor WhatsApp Aktif
                  </Label>
                  <Input
                    id="no_whatsapp"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Contoh: 081234567890"
                    {...register("no_whatsapp", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      },
                    })}
                    maxLength={15}
                    className={cn(
                      "h-11 rounded-xl text-xs font-mono bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800",
                      errors.no_whatsapp && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                  {errors.no_whatsapp ? (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.no_whatsapp.message}</p>
                  ) : (
                    <p className="text-[11px] text-zinc-500">Konfirmasi jadwal dikirim ke nomor ini.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="jumlah_pengunjung" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Jumlah Rombongan (Orang)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="jumlah_pengunjung"
                      type="number"
                      min={1}
                      max={100}
                      {...register("jumlah_pengunjung", { valueAsNumber: true })}
                      className={cn(
                        "h-11 rounded-xl text-xs font-mono bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 w-28",
                        errors.jumlah_pengunjung && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <span>{jumlahPengunjungValue > 15 ? "Kategori Rombongan Besar" : "Keluarga / Pribadi"}</span>
                    </div>
                  </div>
                  {errors.jumlah_pengunjung && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.jumlah_pengunjung.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maksud" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Tujuan atau Rencana Kegiatan Kunjungan
                </Label>
                <textarea
                  id="maksud"
                  rows={3}
                  placeholder="Ceritakan gambaran singkat kunjungan, misalnya: silaturahmi keluarga, doa bersama santri, berbagi makan siang, atau perayaan ulang tahun..."
                  {...register("maksud")}
                  className={cn(
                    "w-full rounded-xl border border-stone-200 bg-stone-50/50 dark:bg-zinc-950 dark:border-zinc-800 p-3 text-xs leading-relaxed transition-colors focus-visible:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 resize-none",
                    errors.maksud && "border-rose-500 focus:ring-rose-500/20"
                  )}
                />
                {errors.maksud ? (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.maksud.message}</p>
                ) : (
                  <p className="text-[11px] text-zinc-500">Membantu asrama menyiapkan ruang pertemuan dan sambutan anak-anak.</p>
                )}
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold flex items-center gap-1 cursor-pointer order-2 sm:order-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali Pilih Waktu
              </button>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50 order-1 sm:order-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan Jadwal...
                  </span>
                ) : (
                  "Konfirmasi & Ajukan Jadwal Kunjungan"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
