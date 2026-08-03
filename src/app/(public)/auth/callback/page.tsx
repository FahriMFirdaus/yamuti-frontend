"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  
  // Phone form states
  const [phoneInput, setPhoneInput] = useState("");
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (token) {
        localStorage.setItem("token", token);
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/me`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const result = await res.json();
            const userData = result.data || result; // Menyesuaikan dengan format response auth/me backend
            localStorage.setItem("user", JSON.stringify(userData));
            
            // Interceptor logic
            if (!userData.no_hp) {
              setStatus("need_phone");
              return; // Berhenti di sini, tampilkan form
            }
          }
          
          setStatus("success");
          
          // Redirect ke Beranda/Dashboard setelah 1.5 detik
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } catch (e) {
          setStatus("error");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } else {
        setStatus("error");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };
    
    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 px-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md bg-white shadow-xl dark:bg-zinc-900 text-center py-16 px-4 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">Memproses Autentikasi...</CardTitle>
            <CardDescription className="text-zinc-500">Mohon tunggu sebentar.</CardDescription>
          </div>
        )}
        
        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-in zoom-in duration-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Login Berhasil!</CardTitle>
            <CardDescription className="text-zinc-500">Mengarahkan Anda ke Beranda...</CardDescription>
          </div>
        )}

        {status === "need_phone" && (
          <div className="flex flex-col text-left space-y-4 animate-in fade-in duration-500">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Phone className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-white">Lengkapi Profil Anda</CardTitle>
            <CardDescription className="text-center text-zinc-500 pb-4">
              Satu langkah lagi! Kami membutuhkan nomor WhatsApp Anda untuk mengirimkan notifikasi donasi.
            </CardDescription>
            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingPhone(true);
                setPhoneError("");
                const phoneRegex = /^[0-9]{9,15}$/;
                if (!phoneRegex.test(phoneInput)) {
                  setPhoneError("Nomor WhatsApp harus berupa angka (9 - 15 digit).");
                  setIsSubmittingPhone(false);
                  return;
                }
                try {
                  const token = localStorage.getItem("token") || undefined;
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ no_hp: phoneInput })
                  });
                  const result = await res.json();
                  if (!res.ok) throw new Error(result.message || "Gagal menyimpan nomor");
                  localStorage.setItem("user", JSON.stringify(result.data));
                  setStatus("success");
                  setTimeout(() => { window.location.href = "/"; }, 1500);
                } catch (err: any) {
                  setPhoneError(err.message);
                  setIsSubmittingPhone(false);
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="wa_modal" className="font-semibold text-zinc-700 dark:text-zinc-300">Nomor WhatsApp <span className="text-red-500">*</span></Label>
                <Input 
                  id="wa_modal" type="text" placeholder="Contoh: 081234567890" 
                  className="h-12 text-lg focus:border-red-400 dark:bg-zinc-950"
                  value={phoneInput} onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))} required
                />
                {phoneError && <p className="text-sm font-medium text-red-500">{phoneError}</p>}
              </div>
              <Button type="submit" disabled={isSubmittingPhone} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white">
                {isSubmittingPhone ? "Menyimpan..." : "Simpan & Lanjutkan"}
              </Button>
            </form>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <span className="text-3xl">❌</span>
            </div>
            <CardTitle className="text-xl font-bold text-red-600">Autentikasi Gagal</CardTitle>
            <CardDescription className="text-zinc-500">Gagal memproses sesi. Mengembalikan Anda ke halaman login...</CardDescription>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
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
      <AuthCallbackContent />
    </Suspense>
  );
}
