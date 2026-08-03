"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, ShieldCheck, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CartItem {
  id: string;
  kampanye_id: string | null;
  kampanye: {
    judul: string;
    gambar: string;
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

  // Fetch Cart Items
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const res = await fetch("http://localhost:8000/api/keranjang", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
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
    
    // Load Midtrans Script
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "SB-Mid-client-XXXXX"); // Replace with actual Client Key
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus donasi ini dari keranjang?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/keranjang/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
        // Update navbar badge by dispatching a storage event or reloading
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      alert("Gagal menghapus item.");
    }
  };

  const handleCheckoutAll = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const keranjangIds = items.map(item => item.id);
      
      const res = await fetch("http://localhost:8000/api/keranjang/checkout", {
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
            onSuccess: function (result: any) {
              alert("Pembayaran Berhasil! Terima kasih orang baik.");
              router.push('/profil?tab=donasi');
            },
            onPending: function (result: any) {
              alert("Menunggu pembayaran Anda.");
              router.push('/profil?tab=donasi');
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
        alert(data.message || "Gagal melakukan checkout");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <div className="bg-zinc-900 py-12 dark:bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Keranjang Donasi</h1>
          <p className="mt-2 text-zinc-400 max-w-2xl mx-auto">Selesaikan donasi kebaikan Anda sekaligus dalam satu transaksi yang mudah.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {items.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Keranjang Anda Kosong</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">Belum ada donasi yang ditambahkan ke keranjang. Mari temukan program kebaikan yang menanti uluran tangan Anda.</p>
            <Link href="/program">
              <Button className="h-12 px-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold">
                Jelajahi Program <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Daftar Item */}
            <div className="lg:w-2/3 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden rounded-2xl group transition-all hover:shadow-md hover:border-red-200 dark:hover:border-red-900/30">
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-40 h-28 sm:h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative shrink-0">
                      {item.kampanye?.gambar ? (
                        <Image src={item.kampanye.gambar} alt="Kampanye" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">Donasi Umum</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-2">
                            {item.kampanye ? item.kampanye.judul : "Donasi Umum untuk Yayasan"}
                          </h3>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shrink-0">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                          Tampil sebagai: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.is_anonymous ? 'Hamba Allah' : 'Publik'}</span>
                        </p>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="text-xs text-zinc-400">Ditambahkan {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        <span className="text-xl font-bold text-red-600">{formatRupiah(item.nominal)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Ringkasan Checkout */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rounded-3xl bg-white dark:bg-zinc-900">
                  <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-red-600" />
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
                        <span className="text-3xl font-black text-red-600">{formatRupiah(totalAmount)}</span>
                      </div>
                    </div>

                    {snapToken ? (
                      <div className="mt-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                         <div id="snap-container" className="w-full min-h-[400px]"></div>
                      </div>
                    ) : (
                      <>
                        <Button 
                          onClick={handleCheckoutAll} 
                          disabled={isProcessing}
                          className="w-full h-14 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all"
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
      </div>
    </div>
  );
}

export default function KeranjangPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <CartContent />
    </Suspense>
  );
}
