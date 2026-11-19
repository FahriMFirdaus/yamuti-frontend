"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Trash2, 
  ShoppingCart, 
  ShieldCheck, 
  ArrowRight, 
  Wallet, 
  AlertCircle, 
  ArrowLeft,
  UserCheck,
  Sparkles,
  Heart
} from "lucide-react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CartItem {
  id: string;
  kampanye_id: string | null;
  kampanye: {
    judul: string;
    gambar?: string;
    thumbnail?: string;
    slug?: string;
  } | null;
  nominal: number;
  pesan: string | null;
  is_anonymous: boolean;
  created_at: string;
}

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function CartContent() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [userName, setUserName] = useState<string | null>(null);

  // Fetch Cart Items
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) setUserName(parsed.name);
        } catch {
          // ignore
        }
      }

      if (!token) {
        router.push("/login");
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/keranjang`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data keranjang", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [router]);

  const handleDelete = async (id: string) => {
    setErrorMessage(null);
    setDeletingId(id);
    
    try {
      const token = localStorage.getItem("token") || undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/keranjang/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        window.dispatchEvent(new Event('storage'));
      } else {
        setErrorMessage("Gagal menghapus donasi dari keranjang.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan saat menghapus.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckoutAll = async () => {
    if (items.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token") || undefined;
      const keranjangIds = items.map(item => item.id);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/keranjang/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ keranjang_ids: keranjangIds })
      });
      
      const data = await res.json();
      if (res.ok && data.data?.snap_token) {
        setSnapToken(data.data.snap_token);
        
        // Render Snap Embed
        setTimeout(() => {
          // @ts-ignore
          window.snap.embed(data.data.snap_token, {
            embedId: 'snap-container',
            onSuccess: function (_result: any) {
              router.push('/profil?tab=donasi');
            },
            onPending: function (_result: any) {
              setErrorMessage("Menunggu pembayaran Anda diselesaikan.");
              router.push('/profil?tab=donasi');
            },
            onError: function (_result: any) {
              setErrorMessage("Pembayaran gagal atau dibatalkan. Silakan coba kembali.");
              setSnapToken(null);
            },
            onClose: function () {
              setSnapToken(null);
            }
          });
        }, 100);
      } else {
        setErrorMessage(data.message || "Gagal memproses checkout keranjang donasi.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan saat memproses donasi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = items.reduce((acc, curr) => acc + curr.nominal, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="font-medium animate-pulse">Memuat Keranjang...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"} 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-DUMMY_KEY"}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 py-10 sm:py-12 border-b border-zinc-800 text-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                  <Link href="/program" className="inline-flex items-center gap-1 hover:underline text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Program Donasi
                  </Link>
                  <span>/</span>
                  <span className="text-zinc-200">Keranjang</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Keranjang Donasi</h1>
                <p className="mt-1 text-sm text-zinc-400 max-w-xl">
                  Selesaikan niat baik Anda sekaligus dalam satu transaksi yang transparan dan amanah.
                </p>
              </div>

              {/* Akun Donatur Badge */}
              {userName && (
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 backdrop-blur-sm self-start sm:self-auto">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-500/30">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="text-zinc-400 text-[10px]">Tercatat atas nama</p>
                    <p className="font-semibold text-zinc-100 line-clamp-1">{userName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-6 max-w-6xl">
          {items.length === 0 ? (
            <div className="max-w-xl mx-auto text-center py-16 sm:py-20 px-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="mx-auto w-20 h-20 mb-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShoppingCart className="w-9 h-9" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">Keranjang Anda Masih Kosong</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                Belum ada donasi yang dimasukkan ke keranjang. Mari pilih program binaan atau tunaikan zakat untuk anak yatim piatu dhuafa.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/program" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-11 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20">
                    Jelajahi Program <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/profil?tab=donasi" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-full border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Lihat Riwayat Donasi
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Daftar Item */}
              <div className="lg:w-2/3 space-y-4">
                {/* Banner Akuntabilitas Donasi */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Kuitansi otomatis tersedia di <strong>Profil &gt; Riwayat Donasi</strong> setelah pembayaran berhasil.</span>
                  </div>
                  <Link href="/profil?tab=donasi" className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline shrink-0 hidden sm:inline">
                    Cek Riwayat
                  </Link>
                </div>
              {items.map((item) => {
                const isZakat = Boolean(
                  item.kampanye?.slug?.includes("zakat") ||
                  item.kampanye?.judul?.toLowerCase().includes("zakat") ||
                  (item.pesan && item.pesan.includes("[Zakat"))
                );

                const itemTitle = (() => {
                  if (item.kampanye?.judul) return item.kampanye.judul;
                  if (item.pesan && item.pesan.includes("[Zakat")) {
                    const match = item.pesan.match(/\[(Zakat[^\]]*)\]/);
                    if (match && match[1]) return match[1];
                    return "Zakat";
                  }
                  return "Donasi Umum untuk Yayasan";
                })();

                const itemImage = item.kampanye?.thumbnail || item.kampanye?.gambar;

                return (
                  <Card key={item.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden rounded-2xl group transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/30">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-40 h-28 sm:h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative shrink-0">
                        {itemImage ? (
                          <Image src={itemImage} alt={itemTitle} fill className="object-cover" />
                        ) : isZakat ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-3 text-center">
                            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-1">
                              Z
                            </span>
                            <span className="text-xs font-bold leading-tight line-clamp-1">{itemTitle}</span>
                            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">BAZNAS RI</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">Donasi Umum</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              {isZakat && (
                                <span className="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                  Zakat BAZNAS
                                </span>
                              )}
                              <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-2">
                                {itemTitle}
                              </h3>
                            </div>
                            <button 
                              type="button"
                              disabled={deletingId === item.id}
                              onClick={() => handleDelete(item.id)} 
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shrink-0 disabled:opacity-50"
                              title="Hapus dari keranjang"
                              aria-label="Hapus donasi"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          {item.pesan && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 italic">
                              &ldquo;{item.pesan}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-zinc-500 mt-2">
                            Tampil sebagai: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.is_anonymous ? 'Hamba Allah' : 'Publik'}</span>
                          </p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <span className="text-xs text-zinc-400">Ditambahkan {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(item.nominal)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Ringkasan Checkout */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rounded-3xl bg-white dark:bg-zinc-900">
                  <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                      Ringkasan Pembayaran
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                      <span>Total Item</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{items.length} Donasi</span>
                    </div>
                    
                    <div className="pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-500">Total Keseluruhan</span>
                        <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{formatRupiah(totalAmount)}</span>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {snapToken ? (
                      <div className="mt-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                         <div id="snap-container" className="w-full min-h-[400px]"></div>
                      </div>
                    ) : (
                      <>
                        <Button 
                          onClick={handleCheckoutAll} 
                          disabled={isProcessing}
                          className="w-full h-14 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30"
                        >
                          {isProcessing ? "Memproses..." : "Checkout Semua"}
                        </Button>
                        <div className="mt-4 flex justify-center gap-2 text-xs text-zinc-400 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          Pembayaran Aman oleh Midtrans
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky Checkout Bar */}
        {items.length > 0 && !snapToken && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-4 px-6 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500">Total ({items.length} donasi)</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{formatRupiah(totalAmount)}</span>
            </div>
            <Button
              onClick={handleCheckoutAll}
              disabled={isProcessing}
              className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20"
            >
              {isProcessing ? "Memproses..." : "Checkout"}
            </Button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default function KeranjangPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <CartContent />
    </Suspense>
  );
}
