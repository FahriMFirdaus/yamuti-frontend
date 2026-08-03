"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldCheck, HeartHandshake, Info, ShoppingCart } from "lucide-react";
import Script from "next/script";

const PRESET_AMOUNTS = [10000, 50000, 100000, 250000, 500000, 1000000];

function DonasiContent() {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "initial" | "anonymous">("public");

  const [snapToken, setSnapToken] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const programSlug = searchParams.get('program');
  const [kampanye, setKampanye] = useState<any>(null);

  useEffect(() => {
    if (programSlug) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kampanye/${programSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setKampanye(data.data);
          }
        })
        .catch(err => console.error("Gagal mengambil detail kampanye:", err));
    }
  }, [programSlug]);

  // Autofill form jika user sedang login
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
          // Hanya isi jika state masih kosong (menghindari penimpaan saat user sudah mengetik)
          setName(prev => prev ? prev : (data.data.name || ""));
          setWhatsapp(prev => prev ? prev : (data.data.no_hp || ""));
          setEmail(prev => prev ? prev : (data.data.email || ""));
        }
      })
      .catch(err => console.error("Gagal auto-fill profil:", err));
    }
  }, []);

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount("");
    setSnapToken(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(rawValue);
    setSnapToken(null);
    if (rawValue) {
      setAmount(parseInt(rawValue));
    } else {
      setAmount(0);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const censorName = (fullName: string) => {
    return fullName
      .split(" ")
      .map((word) => {
        if (word.length <= 1) return word;
        return word[0] + "*".repeat(word.length - 1);
      })
      .join(" ");
  };

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handlePayment = async (isDraft = false) => {
    if (amount === 0) {
      alert("Silakan pilih atau masukkan nominal donasi terlebih dahulu.");
      return;
    }

    if (amount < 10000) {
      alert("Minimal donasi adalah Rp 10.000.");
      return;
    }
    
    if (!whatsapp) {
      alert("Mohon lengkapi No. WhatsApp Anda pada bagian 'Data Donatur' terlebih dahulu.");
      return;
    }
    
    if (whatsapp.length < 9 || whatsapp.length > 15) {
      alert("Nomor WhatsApp harus terdiri dari 9 hingga 15 digit.");
      return;
    }

    // Tentukan nama final untuk dikirim ke backend berdasarkan opsi privasi
    let finalName = name.trim() || "Hamba Allah";
    
    if (privacy === "anonymous") {
      finalName = "Hamba Allah";
    } else if (privacy === "initial" && finalName !== "Hamba Allah") {
      finalName = censorName(finalName);
    }

    setIsLoading(true);

    try {
        const authToken = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "Accept": "application/json",
        };
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const endpoint = isDraft ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/keranjang` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/donasi`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: headers,
        body: JSON.stringify({
          nama_donatur: finalName,
          no_whatsapp: whatsapp,
          gross_amount: amount,
          pesan: pesan, // Mengirim data doa ke Backend
          kampanye_id: kampanye ? kampanye.id : null, // Mengirim ID kampanye jika Donasi Khusus
          is_anonymous: privacy === "anonymous", // Flag privasi ke Backend
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || `Terjadi kesalahan saat memproses ${isDraft ? 'draft' : 'donasi'}.`);
      }

      if (isDraft) {
        alert("Berhasil ditambahkan ke Keranjang Donasi!");
        // Refresh halaman atau trigger update navbar bisa dilakukan dengan window location
        window.location.reload();
        return;
      }

      // Midtrans Snap Token dikembalikan oleh backend (asumsi: resData.data.snap_token)
      const token = resData.data?.snap_token || resData.snap_token;

      if (token) {
        setSnapToken(token);
        // Beri waktu sedikit untuk React merender <div id="snap-container">
        setTimeout(() => {
          // @ts-ignore
          window.snap.embed(token, {
            embedId: 'snap-container',
            onSuccess: function (result: any) {
              setIsSuccess(true);
            },
            onPending: function (result: any) {
              alert("Menunggu pembayaran Anda diselesaikan.");
            },
            onError: function (result: any) {
              alert("Pembayaran gagal. Silakan coba lagi.");
              setSnapToken(null);
            },
            onClose: function () {
              setSnapToken(null);
            }
          });
        }, 100);
      } else {
        throw new Error("Gagal mendapatkan Token Pembayaran dari server.");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 px-4 bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-lg border-green-500/30 bg-white shadow-xl dark:bg-zinc-900 text-center py-16 px-4 rounded-3xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-in zoom-in duration-500" />
          </div>
          <CardTitle className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">Alhamdulillah, Donasi Tercatat!</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 px-6 mt-2 text-base leading-relaxed">
            Data donasi Anda sebesar <strong className="text-zinc-900 dark:text-white">{formatRupiah(amount)}</strong> telah masuk ke dalam sistem. Semoga pahala mengalir deras untuk Anda dan keluarga.
          </CardDescription>
          <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-8 h-12 rounded-xl px-8 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
            Salurkan Donasi Lainnya
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key="SB-Mid-client-DUMMY_KEY"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24 pt-32">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Sederhana, Bersih, Profesional */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
              Mulai <span className="text-red-600">Berdonasi</span>
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Lengkapi detail di bawah ini. Proses pembayaran cepat, aman, dan transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* --- KIRI: FORMULIR DONASI (COL-SPAN 7) --- */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold text-sm">1</div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Pilih Nominal</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleAmountClick(preset)}
                        className={cn(
                          "py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all",
                          amount === preset && !customAmount
                            ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400"
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-red-200 hover:bg-red-50/50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-red-900/50"
                        )}
                      >
                        {formatRupiah(preset)}
                      </button>
                    ))}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">Atau Masukkan Nominal Lain</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="font-semibold text-zinc-500">Rp</span>
                      </div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className={cn(
                          "h-14 pl-12 rounded-xl text-lg font-bold bg-zinc-50 dark:bg-zinc-950 transition-all",
                          customAmount ? "border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800 focus:border-red-400"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold text-sm">2</div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Data Donatur</h2>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</Label>
                      <Input 
                        placeholder="Contoh: Budi Santoso" 
                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-red-400 text-base" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 pt-1">
                      <Label className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">Tampilan Nama di Publik</Label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <input type="radio" name="privacy" value="public" checked={privacy === "public"} onChange={() => setPrivacy("public")} className="w-5 h-5 accent-red-600" />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tampilkan Nama Terang</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <input type="radio" name="privacy" value="initial" checked={privacy === "initial"} onChange={() => setPrivacy("initial")} className="w-5 h-5 accent-red-600" />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tampilkan Inisial Saja (Sensor ***)</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <input type="radio" name="privacy" value="anonymous" checked={privacy === "anonymous"} onChange={() => setPrivacy("anonymous")} className="w-5 h-5 accent-red-600" />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sembunyikan Nama (Anonim / Hamba Allah)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label className="font-semibold text-zinc-700 dark:text-zinc-300">
                        No. WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        placeholder="Contoh: 0812..." 
                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-red-400 text-base" 
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ""))}
                        minLength={9}
                        maxLength={15}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Email <span className="text-zinc-400 font-normal">(Opsional)</span>
                      </Label>
                      <Input 
                        type="email"
                        placeholder="Untuk opsi pendaftaran" 
                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-red-400 text-base" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>Pesan / Titipan Doa (Opsional)</span>
                      <span className="text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">Tampil di Beranda</span>
                    </Label>
                    <textarea 
                      rows={3} 
                      placeholder="Tuliskan doa Anda agar kami aminkan..."
                      className="flex w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 px-4 py-3 text-sm transition-all focus-visible:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white resize-none"
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- KANAN: RINGKASAN & Q&A (COL-SPAN 5) --- */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Box Ringkasan atau Midtrans Embed */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/40 dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {snapToken ? (
                  // Midtrans Embed Container
                  <div id="snap-container" className="w-full min-h-[500px] bg-white rounded-3xl" />
                ) : (
                  // Ringkasan Biasa
                  <div className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      Ringkasan Donasi
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">Jenis Donasi</span>
                        <div className="text-right">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                            {kampanye ? "Donasi Khusus Program" : "Donasi Umum"}
                          </span>
                          {kampanye && (
                            <span className="text-xs text-zinc-500 block mt-0.5 max-w-[200px] line-clamp-2">
                              {kampanye.judul}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">Nominal Donasi</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatRupiah(amount)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 mb-8">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-zinc-500">Total Sementara (Sebelum Biaya Payment Gateway)</span>
                        <span className="text-3xl font-black text-red-600 dark:text-red-400">
                          {formatRupiah(amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        size="lg" 
                        className="flex-1 h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all"
                        onClick={() => handlePayment(false)}
                        disabled={isLoading}
                      >
                        {isLoading && !isAddingToCart ? (
                           <span className="flex items-center justify-center gap-2">
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Memproses...
                           </span>
                        ) : (
                          "Donasi Sekarang"
                        )}
                      </Button>
                      
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="flex-1 h-14 rounded-xl border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 font-bold text-base transition-all"
                        onClick={async () => {
                          setIsAddingToCart(true);
                          await handlePayment(true);
                          setIsAddingToCart(false);
                        }}
                        disabled={isLoading}
                      >
                        {isAddingToCart ? "Menyimpan..." : (
                          <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Tambah ke Keranjang
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Pembayaran Aman Terenkripsi oleh Midtrans
                    </div>
                  </div>
                )}
              </div>

              {/* Q&A Section - EXACTLY BELOW SUMMARY */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h4 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <Info className="w-5 h-5 text-zinc-400" />
                  Pertanyaan Seputar Donasi
                </h4>
                
                <div className="space-y-1">
                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-sm outline-none hover:text-red-600 transition-colors">
                      Apakah informasi saya aman?
                      <span className="relative size-4 shrink-0 text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-4 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-4 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </span>
                    </summary>
                    <div className="pb-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Sangat aman. Kami menggunakan sistem enkripsi tingkat bank (bekerja sama dengan Midtrans) sehingga tidak ada data pembayaran Anda yang disimpan di server kami.
                    </div>
                  </details>

                  <details className="group border-t border-zinc-100 dark:border-zinc-800 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-sm outline-none hover:text-red-600 transition-colors">
                      Mengapa butuh No WhatsApp & Email?
                      <span className="relative size-4 shrink-0 text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-4 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-4 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </span>
                    </summary>
                    <div className="pb-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Data ini murni hanya kami gunakan untuk mengirimkan resi/tanda terima donasi yang sah, serta mengirimkan laporan berkala (maksimal sebulan sekali) terkait penyaluran dana.
                    </div>
                  </details>

                  <details className="group border-t border-zinc-100 dark:border-zinc-800 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-sm outline-none hover:text-red-600 transition-colors">
                      Bisakah saya mengembalikan Donasi Saya?
                      <span className="relative size-4 shrink-0 text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-4 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-4 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </span>
                    </summary>
                    <div className="pb-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Sesuai dengan ketentuan syariat dan operasional sistem perbankan kami, dana donasi yang telah masuk bersifat final (akad hibah) dan tidak dapat ditarik kembali/dikembalikan (*Refund*). Pastikan nominal sudah sesuai sebelum membayar.
                    </div>
                  </details>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default function DonasiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center text-zinc-500 flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Memuat formulir donasi...
        </div>
      </div>
    }>
      <DonasiContent />
    </Suspense>
  );
}
