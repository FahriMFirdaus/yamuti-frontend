"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
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
      // Authenticate directly to Sanctum to grab token for localStorage
      const apiRes = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      const apiJson = await apiRes.json();
      
      if (apiRes.ok && apiJson.data?.token) {
        localStorage.setItem("token", apiJson.data.token);
        if (apiJson.data.user) {
          localStorage.setItem("user", JSON.stringify(apiJson.data.user));
        }
      }

      // NextAuth session sign-in
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setErrorMsg("Email atau password salah.");
        setIsLoading(false);
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server. Pastikan backend aktif.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 py-8 sm:py-12 dark:bg-zinc-950 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute top-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-red-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <Card className="z-10 w-full max-w-md border-zinc-200/60 bg-white/90 backdrop-blur-xl shadow-xl dark:border-zinc-800/60 dark:bg-zinc-900/90 rounded-2xl sm:rounded-3xl">
        <CardHeader className="space-y-2 text-center">
          <Link href="/" className="mx-auto mb-2 inline-block bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent">
            YAMUTI
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Login Admin
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Masukkan kredensial Anda untuk masuk ke Dashboard Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@yamuti.org"
                {...register("email")}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</Label>
                <Link href="/lupa-password" className="text-xs font-semibold text-red-600 hover:text-red-500">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi admin"
                  {...register("password")}
                  className={cn("pr-11", errors.password ? "border-red-500 focus-visible:ring-red-500" : "")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20"
            >
              {isLoading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hanya untuk staf & pengurus YAMUTI Tasikmalaya.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
