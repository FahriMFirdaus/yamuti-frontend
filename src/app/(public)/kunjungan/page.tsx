"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isBefore, startOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Kita akan mengambil jam dinamis dari Backend
const kunjunganSchema = z.object({
  nama_tamu: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  no_whatsapp: z.string()
    .min(9, { message: "Nomor WA minimal 9 angka" })
    .max(15, { message: "Nomor WA maksimal 15 angka" })
    .regex(/^[0-9]+$/, { message: "Hanya angka yang diperbolehkan" }),
  jumlah_pengunjung: z.number().min(1, { message: "Minimal 1 pengunjung" }).max(100, { message: "Maksimal 100 pengunjung" }),
  maksud: z.string().min(10, { message: "Maksud kunjungan harap diisi (min 10 karakter)" }),
  tanggal_kunjungan: z.date({ message: "Silakan pilih tanggal kunjungan" }),
  waktu_kunjungan: z.string().min(1, { message: "Silakan pilih jam kunjungan" }),
});

type KunjunganFormValues = z.infer<typeof kunjunganSchema>;

export default function KunjunganPage() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [timeSlots, setTimeSlots] = useState<{jam: string, is_available: boolean}[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [stepError, setStepError] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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

  // Auto-fill dari Profile API jika login
  useEffect(() => {
    const token = localStorage.getItem("token") || undefined;
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setValue("nama_tamu", data.data.name || "");
          setValue("no_whatsapp", data.data.no_hp || "");
        }
      })
      .catch(err => console.error("Gagal auto-fill profil:", err));
    }
  }, [setValue]);

  // Fetch Ketersediaan Waktu saat tanggal berubah
  useEffect(() => {
    if (date) {
      setTime(""); // Reset jam terpilih
      setIsCustomTime(false); // Reset custom time mode
      setTimeSlots([]);
      setIsLoadingSlots(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kunjungan/ketersediaan?tanggal=${formattedDate}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.slot_waktu) {
            setTimeSlots(data.data.slot_waktu);
          }
        })
        .catch(err => console.error("Gagal mengambil ketersediaan slot:", err))
        .finally(() => setIsLoadingSlots(false));
    }
  }, [date]);

  const handleNextStep = () => {
    setStepError(""); // Reset error
    if (!date) {
      setStepError("Silakan pilih tanggal kunjungan terlebih dahulu di kalender.");
      return;
    }
    if (!time) {
      setStepError("Silakan pilih slot jam kunjungan yang tersedia.");
      return;
    }
    setValue("tanggal_kunjungan", date);
    setValue("waktu_kunjungan", time);
    setStepError("");
    setStep(2);
  };

  const onSubmit = async (data: KunjunganFormValues) => {
    setIsLoading(true);
    
    const formattedDate = format(data.tanggal_kunjungan, "yyyy-MM-dd");
    const isFullDay = data.waktu_kunjungan === "FULL DAY";
    
    // Gabungkan tanggal dan waktu
    // Jika FULL DAY, kita bisa kirimkan 00:00:00 atau membiarkan backend yang memproses berdasarkan flag is_full_day
    const timeString = isFullDay ? "00:00:00" : (data.waktu_kunjungan.length === 5 ? `${data.waktu_kunjungan}:00` : data.waktu_kunjungan);
    const slotWaktu = `${formattedDate} ${timeString}`;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kunjungan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
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
        throw new Error(resData.message || "Gagal mengirim permintaan kunjungan");
      }

      console.log("Data Kunjungan berhasil dikirim:", resData);
      setIsSuccess(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 px-4 bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-lg border-red-500/50 bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-zinc-900/80 text-center py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="mb-2 text-2xl text-red-700 dark:text-red-400">Pengajuan Terkirim!</CardTitle>
          <CardDescription className="text-zinc-600 dark:text-zinc-300 px-6 mt-4">
            Terima kasih telah menjadwalkan kunjungan Anda ke Yayasan Mutiara Harapan. Admin kami akan memverifikasi dan menghubungi Anda kembali melalui WhatsApp sesegera mungkin.
          </CardDescription>
          <Button onClick={() => { setIsSuccess(false); setStep(1); setDate(undefined); setTime(""); }} variant="outline" className="mt-8 rounded-full">
            Ajukan Kunjungan Lain
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      {/* Header Section */}
      <div className="relative bg-zinc-900 py-16 text-center dark:bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-500/20 blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Jadwalkan Kunjungan Anda
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Kehadiran Anda adalah semangat baru bagi anak-anak asuh kami. Mari jadwalkan kunjungan Anda dan buat kenangan berharga bersama mereka.
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-16 px-4 flex justify-center">
        <Card className="w-full max-w-3xl border-zinc-200 shadow-xl dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
          
          {/* Premium Step Indicator */}
          <div className="flex justify-center pt-10 pb-2 bg-white dark:bg-zinc-900">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => step === 2 && setStep(1)}
                className={cn("flex items-center gap-2 md:gap-3 px-4 py-2 rounded-full transition-all", step === 1 ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "text-zinc-400 hover:text-zinc-600")}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step === 1 ? "bg-red-600 text-white shadow-md shadow-red-500/30" : "bg-zinc-100 dark:bg-zinc-800")}>1</div>
                <span className="font-bold text-sm md:text-base">Pilih Jadwal</span>
              </button>
              
              <div className="w-8 md:w-16 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-500 ease-in-out" style={{ width: step === 2 ? '100%' : '0%' }} />
              </div>
              
              <div className={cn("flex items-center gap-2 md:gap-3 px-4 py-2 rounded-full transition-all", step === 2 ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "text-zinc-400")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step === 2 ? "bg-red-600 text-white shadow-md shadow-red-500/30" : "bg-zinc-100 dark:bg-zinc-800")}>2</div>
                <span className="font-bold text-sm md:text-base">Data Diri</span>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Kapan Anda ingin berkunjung?</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">Pilih tanggal dan jam ketersediaan yang cocok untuk Anda.</p>
                  

                </div>
                
                <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
                  {/* Kalender */}
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mx-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => isBefore(d, startOfDay(new Date()))}
                      className="rounded-md"
                    />
                  </div>

                  {/* Waktu */}
                  <div className="flex-1 w-full space-y-4">
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Slot Jam {date ? format(date, "d MMMM yyyy", { locale: idLocale }) : ""}
                    </h3>
                    
                    {!date ? (
                      <div className="p-6 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-400 text-sm">
                        Pilih tanggal di kalender terlebih dahulu untuk melihat slot jam.
                      </div>
                    ) : isLoadingSlots ? (
                      <div className="p-6 text-center flex flex-col items-center justify-center space-y-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <svg className="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-sm text-zinc-500">Mengecek ketersediaan...</span>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {timeSlots.map((slot, i) => {
                            const isFullDayBtn = slot.jam === "FULL DAY";
                            const isSelected = !isCustomTime && time === slot.jam;
                            return (
                              <Button
                                key={i}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                  "h-12 rounded-xl border-zinc-200 dark:border-zinc-800 transition-all",
                                  isFullDayBtn ? "col-span-2" : "",
                                  isSelected ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-600/20" : "",
                                  !slot.is_available ? "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900" : "hover:border-red-400 hover:text-red-600"
                                )}
                                disabled={!slot.is_available}
                                onClick={() => {
                                  setIsCustomTime(false);
                                  setTime(slot.jam);
                                }}
                              >
                                {slot.jam}
                                {!slot.is_available && <span className="ml-2 text-xs font-normal">(Penuh)</span>}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                          {isCustomTime ? (
                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                              <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Pilih Waktu Khusus</Label>
                              <div className="flex items-center gap-3">
                                <Input 
                                  type="time" 
                                  value={time} 
                                  onChange={(e) => setTime(e.target.value)}
                                  className="h-12 rounded-xl"
                                />
                                <Button type="button" variant="ghost" onClick={() => { setIsCustomTime(false); setTime(""); }} className="text-zinc-500 rounded-full shrink-0">Batal</Button>
                              </div>
                            </div>
                          ) : (
                            <Button type="button" variant="ghost" onClick={() => { setIsCustomTime(true); setTime(""); }} className="w-full h-12 border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">
                              + Ajukan Waktu Khusus
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-dashed border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        Tidak ada jadwal kunjungan di tanggal ini.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-sm font-medium text-red-500">
                    {stepError && <span className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>{stepError}</span>}
                  </div>
                  <Button 
                    onClick={handleNextStep}
                    className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 w-full sm:w-auto shrink-0"
                  >
                    Lanjut Isi Data &rarr;
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* Ringkasan Pilihan Jadwal */}
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex items-center justify-between border border-red-100 dark:border-red-900/30">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Jadwal Terpilih:</p>
                    <p className="font-bold text-zinc-900 dark:text-white">
                      {date ? format(date, "EEEE, d MMMM yyyy", { locale: idLocale }) : ""} <span className="mx-2 text-zinc-300">|</span> Jam {time}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                    Ubah
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nama_tamu" className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Perwakilan</Label>
                    <Input
                      id="nama_tamu"
                      placeholder="Budi Santoso"
                      {...register("nama_tamu")}
                      className={cn("h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800", errors.nama_tamu && "border-red-500")}
                    />
                    {errors.nama_tamu && <p className="text-sm text-red-500">{errors.nama_tamu.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="no_whatsapp" className="font-semibold text-zinc-700 dark:text-zinc-300">No. WhatsApp</Label>
                    <Input
                      id="no_whatsapp"
                      type="tel"
                      placeholder="081234567890"
                      {...register("no_whatsapp", {
                        onChange: (e) => e.target.value = e.target.value.replace(/[^0-9]/g, "")
                      })}
                      maxLength={15}
                      className={cn("h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800", errors.no_whatsapp && "border-red-500")}
                    />
                    {errors.no_whatsapp && <p className="text-sm text-red-500">{errors.no_whatsapp.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jumlah_pengunjung" className="font-semibold text-zinc-700 dark:text-zinc-300">Estimasi Jumlah Pengunjung</Label>
                  <Input
                    id="jumlah_pengunjung"
                    type="number"
                    min="1"
                    {...register("jumlah_pengunjung", { valueAsNumber: true })}
                    className={cn("h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 max-w-[200px]", errors.jumlah_pengunjung && "border-red-500")}
                  />
                  {errors.jumlah_pengunjung && <p className="text-sm text-red-500">{errors.jumlah_pengunjung.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maksud" className="font-semibold text-zinc-700 dark:text-zinc-300">Maksud / Tujuan Kunjungan</Label>
                  <textarea
                    id="maksud"
                    rows={4}
                    placeholder="Contoh: Ingin bersilaturahmi dan membagikan bingkisan untuk anak-anak..."
                    {...register("maksud")}
                    className={cn(
                      "flex w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 px-4 py-3 text-sm transition-all focus-visible:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 resize-none",
                      errors.maksud ? "border-red-500 focus-visible:ring-red-500" : ""
                    )}
                  />
                  {errors.maksud && <p className="text-sm text-red-500">{errors.maksud.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full h-14 mt-6 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white text-lg font-bold shadow-lg shadow-red-500/25 transition-all hover:-translate-y-1"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Mengirim Permintaan...
                    </span>
                  ) : (
                    `Kirim Permintaan Kunjungan`
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
