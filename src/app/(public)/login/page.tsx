"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Format email tidak valid (harus mengandung '@' dan domain)" }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) {
        if (res.status === 422 && result.errors) {
          const firstErrorKey = Object.keys(result.errors)[0];
          let backendError = result.errors[firstErrorKey][0];
          
          if (backendError.includes("credentials do not match")) {
            backendError = "Email atau kata sandi yang Anda masukkan tidak sesuai.";
          } else if (backendError.includes("Too many login attempts")) {
            backendError = "Terlalu banyak percobaan. Silakan coba lagi beberapa saat.";
          }
          throw new Error(backendError);
        }
        
        let msg = result.message || "Gagal masuk. Silakan coba lagi.";
        if (msg.includes("credentials do not match")) msg = "Email atau kata sandi yang Anda masukkan tidak sesuai.";
        if (msg.includes("Unauthenticated")) msg = "Sesi tidak valid atau Anda belum mendaftar.";
        
        throw new Error(msg);
      }
      
      // Simpan token dan data user (misal di localStorage untuk sementara)
      if (result.data && result.data.token) {
        localStorage.setItem("token", result.data.token);
      }
      if (result.data && result.data.user) {
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }
      
      window.location.href = "/"; // Force hard refresh agar Navbar (Client Component) membaca localStorage terbaru
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/google/redirect`, {
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

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* Background Ornaments */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Selamat Datang Kembali
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Atau{" "}
          <Link href="/register" className="font-semibold text-red-600 hover:text-red-500 transition-colors">
            buat akun baru sekarang
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
                Atau masuk dengan email
              </span>
            </div>
          </div>

          <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
            
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="email"
                  placeholder="Contoh: budi@gmail.com"
                  className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Kata Sandi</Label>
                <div className="text-sm">
                  <Link href="/lupa-password" className="font-semibold text-red-600 hover:text-red-500">
                    Lupa sandi?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="password"
                  placeholder="Masukkan kata sandi Anda"
                  className={cn("pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:border-red-400", errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-zinc-200 dark:border-zinc-800")}
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>}
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {errorMsg}
              </div>
            )}

            <div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500">
                  Aman & Terenkripsi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
