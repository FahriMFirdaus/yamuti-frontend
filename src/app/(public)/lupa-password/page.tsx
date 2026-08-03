"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Format email tidak valid (harus mengandung '@' dan domain).");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || "Gagal mengirim link reset password");
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
          <CardTitle className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">Email Terkirim!</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 px-6 mt-2 text-base leading-relaxed">
            Jika email <strong>{email}</strong> terdaftar di sistem kami, Anda akan menerima link untuk mengatur ulang kata sandi dalam beberapa saat.
          </CardDescription>
          <Link href="/login">
            <Button className="mt-8 h-12 rounded-xl px-8 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold" variant="outline">
              Kembali ke Login
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
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Lupa Kata Sandi?
        </h2>
        <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-400 px-4">
          Jangan khawatir! Masukkan email yang terdaftar dan kami akan mengirimkan link untuk mengatur ulang sandi Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 sm:rounded-3xl sm:px-10 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl">
          <form className="space-y-6" noValidate onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Alamat Email Terdaftar</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="email"
                  required
                  placeholder="Contoh: budi@gmail.com"
                  className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-red-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Mengirim Link...
                  </span>
                ) : (
                  "Kirim Link Reset"
                )}
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke halaman Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
