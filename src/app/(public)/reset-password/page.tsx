"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Tangkap token dan email dari URL query string
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(urlEmail);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setErrorMsg("Konfirmasi sandi tidak cocok!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation
        }),
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || "Gagal mengatur ulang kata sandi");
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 px-4 bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-lg border-green-500/30 bg-white shadow-xl dark:bg-zinc-900 text-center py-16 px-4 rounded-3xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-in zoom-in duration-500" />
          </div>
          <CardTitle className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">Sandi Berhasil Diperbarui!</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 px-6 mt-2 text-base leading-relaxed">
            Kata sandi Anda telah berhasil diubah. Silakan gunakan kata sandi baru Anda untuk masuk ke sistem.
          </CardDescription>
          <Link href="/login">
            <Button className="mt-8 h-12 rounded-xl px-8 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold" variant="outline">
              Masuk Sekarang
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* Background Ornaments */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Buat Sandi Baru
        </h2>
        <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-400 px-4">
          Masukkan kata sandi baru yang kuat untuk akun Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 sm:rounded-3xl sm:px-10 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Kata Sandi Baru</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-red-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Konfirmasi Sandi Baru</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-red-400"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
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
                    Memperbarui Sandi...
                  </span>
                ) : (
                  "Simpan Kata Sandi"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <Card className="w-full max-w-md p-8 shadow-xl text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-zinc-200 border-t-red-600 dark:border-zinc-800 dark:border-t-red-600" />
            <CardTitle className="text-xl font-bold">Memuat...</CardTitle>
          </div>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
