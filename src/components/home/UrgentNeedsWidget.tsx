"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Package, ArrowRight, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UrgentItem {
  id: string;
  nama_barang: string;
  kategori: string;
  stok_sekarang: number;
  stok_minimum: number;
  satuan: string;
  lokasi_penyimpanan?: string;
}

export function UrgentNeedsWidget() {
  const [items, setItems] = useState<UrgentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentNeeds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/kebutuhan-mendesak`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          setItems(json.data || []);
        }
      } catch (err) {
        console.error("Gagal memuat kebutuhan mendesak:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrgentNeeds();
  }, []);

  if (isLoading || items.length === 0) {
    return null; // Sembunyikan widget jika tidak ada stok yang kritis
  }

  return (
    <div className="w-full my-8">
      <Card className="rounded-3xl border-amber-300 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-950 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Kebutuhan Mendesak Panti Asuhan
                  </h3>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-xs">
                    Stok Kritis
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Bantuan sembako atau barang berikut sangat kami butuhkan untuk konsumsi & operasional anak asuh minggu ini:
                </p>
              </div>
            </div>

            <Link href="/kunjungan">
              <Button size="sm" className="rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 shrink-0">
                <HeartHandshake className="w-4 h-4 mr-1.5" />
                Antar Bantuan Langsung
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {items.slice(0, 6).map((item) => {
              const kekurangan = Math.max(item.stok_minimum - item.stok_sekarang, 0);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-zinc-800 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {item.nama_barang}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Kategori: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.kategori || "Sembako"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                      Sisa {item.stok_sekarang} {item.satuan}
                    </span>
                    {kekurangan > 0 && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Kurang ~{kekurangan} {item.satuan}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

