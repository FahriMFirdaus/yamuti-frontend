"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const apiRes = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const apiJson = await apiRes.json();

      if (apiRes.ok && apiJson.data?.token) {
        localStorage.setItem("token", apiJson.data.token);
        if (apiJson.data.user) {
          localStorage.setItem("user", JSON.stringify(apiJson.data.user));
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setErrorMsg("Email atau kata sandi tidak cocok. Periksa kembali data login Anda.");
        setIsLoading(false);
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMsg("Koneksi ke server terputus. Pastikan layanan backend aktif.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100/70 dark:bg-zinc-950 flex flex-col justify-between text-zinc-900 dark:text-zinc-100 antialiased">
      {/* Top utility bar */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Portal Administrasi</span>
        </span>
      </header>

      {/* Main card section */}
      <section className="w-full max-w-md mx-auto px-4 py-8 sm:py-12 my-auto">
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-sm">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-stone-150 dark:border-zinc-800/80">
            <div className="w-14 h-14 relative mb-3">
              <Image
                src="/logo_yamuti.webp"
                alt="Logo Yayasan YAMUTI"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Masuk Pengurus & Staf
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed max-w-xs">
              Sistem Informasi Manajemen Yayasan YAMUTI Tasikmalaya
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200"
              >
                Alamat Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="nama@yamuti.org"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "admin-email-error" : undefined}
                className={cn(
                  "h-10 text-sm bg-white dark:bg-zinc-900 border-stone-300 dark:border-zinc-700 focus-visible:ring-emerald-700 focus-visible:border-emerald-700 rounded-lg",
                  errors.email && "border-red-600 focus-visible:ring-red-600 focus-visible:border-red-600"
                )}
              />
              {errors.email && (
                <p id="admin-email-error" className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="admin-password"
                  className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200"
                >
                  Kata Sandi
                </Label>
                <Link
                  href="/lupa-password"
                  className="text-xs font-medium text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "admin-password-error" : undefined}
                  className={cn(
                    "h-10 text-sm pr-10 bg-white dark:bg-zinc-900 border-stone-300 dark:border-zinc-700 focus-visible:ring-emerald-700 focus-visible:border-emerald-700 rounded-lg",
                    errors.password && "border-red-600 focus-visible:ring-red-600 focus-visible:border-red-600"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 focus:outline-none focus-visible:text-stone-900"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="admin-password-error" className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs sm:text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700 dark:text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </span>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>
          </form>

          {/* Micro notice */}
          <div className="mt-6 pt-5 border-t border-stone-150 dark:border-zinc-800/80 text-center">
            <p className="text-xs text-stone-500 dark:text-zinc-400 leading-normal">
              Akses terbatas untuk staf dan pengurus terdaftar. Untuk kebutuhan donatur atau orang tua asuh, gunakan{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-2"
              >
                halaman masuk publik
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Yayasan YAMUTI Tasikmalaya. Hak cipta dilindungi undang-undang.
        </p>
      </footer>
    </main>
  );
}
