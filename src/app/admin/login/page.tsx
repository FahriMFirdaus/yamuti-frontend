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

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute top-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-red-500/10 blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px] mix-blend-multiply" />
      </div>

      <Card className="z-10 w-full max-w-md border-white/20 bg-white/80 backdrop-blur-xl shadow-xl dark:bg-zinc-900/80">
        <CardHeader className="space-y-2 text-center">
          <Link href="/" className="mx-auto mb-4 inline-block bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
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
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</Label>
                <Link href="#" className="text-sm font-medium text-red-600 hover:text-red-500">
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
            >
              {isLoading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Hanya untuk staf & pengurus YAMUTI.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
