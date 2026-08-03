"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Phone, User, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Format email tidak valid (harus mengandung '@' dan domain)" }),
  no_hp: z.string()
    .min(9, { message: "Nomor WhatsApp minimal 9 digit" })
    .max(15, { message: "Nomor WhatsApp maksimal 15 digit" })
    .regex(/^[0-9]+$/, { message: "Nomor WhatsApp hanya boleh berisi angka" }),
  password: z.string().min(6, { message: "Sandi minimal 6 karakter" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Sandi tidak cocok",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        name: data.name,
        email: data.email,
        no_hp: data.no_hp,
        password: data.password,
        password_confirmation: data.confirmPassword,
      };

      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 422 && result.errors) {
          // Tangkap pesan error validasi pertama dari Laravel
          const firstErrorKey = Object.keys(result.errors)[0];
          let backendError = result.errors[firstErrorKey][0];
          
          // Terjemahkan pesan umum dari backend (Laravel) ke Bahasa Indonesia
          if (backendError.includes("has already been taken")) {
             backendError = `${firstErrorKey === 'email' ? 'Alamat Email' : firstErrorKey === 'nik' ? 'NIK' : firstErrorKey} sudah terdaftar. Silakan gunakan yang lain.`;
          } else if (backendError.includes("is required")) {
             backendError = `Kolom ${firstErrorKey} wajib diisi.`;
          } else if (backendError.includes("must be at least")) {
             backendError = `Kolom ${firstErrorKey} kurang panjang.`;
          }
          
          throw new Error(backendError);
        }
        throw new Error(result.message || "Gagal melakukan registrasi");
      }
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/google/redirect", {
        headers: { "Accept": "application/json" }
      });
      const result = await res.json();
      if (result.data && result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("Gagal mengambil URL Google");
      }
    } catch (err: any) {
      alert(err.message);
      setIsGoogleLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 px-4 bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-lg border-green-500/30 bg-white shadow-xl dark:bg-zinc-900 text-center py-16 px-4 rounded-3xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-in zoom-in duration-500" />
          </div>
          <CardTitle className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">Pendaftaran Berhasil!</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 px-6 mt-2 text-base leading-relaxed">
            Akun donatur Anda telah berhasil dibuat. Silakan login untuk mulai berdonasi dan memantau riwayat kebaikan Anda.
          </CardDescription>
          <Link href="/login">
            <Button className="mt-8 h-12 rounded-xl px-8 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold" variant="outline">
              Lanjut ke Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Daftar Donatur YAMUTI
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-red-600 hover:text-red-500 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 sm:rounded-3xl sm:px-10 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl">
          
          <Button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-12 mb-6 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-semibold flex items-center justify-center gap-3 transition-all"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.25028 6.60998L5.27028 9.72498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.1 21.215C22.449 19.05 23.49 15.92 23.49 12.275Z" fill="#4285F4"/><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.23999 6.58984C0.439987 8.19984 0 10.0299 0 11.9999C0 13.9699 0.444986 15.7999 1.23999 17.4099L5.26498 14.2949Z" fill="#FBBC05"/><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L15.9204 17.98C14.8454 18.705 13.5354 19.16 12.0004 19.16C8.8704 19.16 6.2154 17.05 5.2704 14.185L1.2454 17.3C3.2504 21.22 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/></svg>
                Masuk dengan Google
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500 font-medium">
                Atau daftar dengan email
              </span>
            </div>
          </div>
          <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nama Lengkap <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.name ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="email"
                  placeholder="budi@gmail.com"
                  className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No. WhatsApp / HP <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.no_hp ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                  {...register("no_hp")}
                />
              </div>
              {errors.no_hp && <p className="text-xs font-semibold text-red-500">{errors.no_hp.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Kata Sandi <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Minimal 6 char"
                    className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                    {...register("password")}
                  />
                </div>
                {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Ulangi Sandi <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Konfirmasi"
                    className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs font-semibold text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Mendaftarkan...
                  </span>
                ) : (
                  "Buat Akun"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi YAMUTI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
