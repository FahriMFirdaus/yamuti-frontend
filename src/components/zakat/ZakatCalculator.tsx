"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Coins,
  Building2,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateZakatMaal,
  calculateZakatProfesi,
  buildZakatDonationUrl,
  buildZakatCartPayload,
  type NisabBenchmark,
} from "@/lib/zakat/calculator";

const DEFAULT_BENCHMARK: NisabBenchmark = {
  tahun: 2026,
  dasar_hukum: "SK Ketua BAZNAS No. 15 Tahun 2026",
  nisab_tahunan: 91681728,
  nisab_bulanan: 7640144,
  tarif_persen: 2.5,
  harga_emas_acuan_per_gram: 1078608,
  haul_kondisi_bulan: 12,
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function ZakatCalculator() {
  const router = useRouter();

  const [benchmark, setBenchmark] = useState<NisabBenchmark>(DEFAULT_BENCHMARK);
  const [activeTab, setActiveTab] = useState<"profesi" | "maal" | "fitrah" | "perdagangan">("profesi");

  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);

  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [shortTermDebts, setShortTermDebts] = useState<number>(0);
  const [haulFulfilled, setHaulFulfilled] = useState<boolean>(true);

  const [jumlahJiwaFitrah, setJumlahJiwaFitrah] = useState<number>(1);
  const tarifFitrahPerJiwa = 50000;

  const [asetLancarDagang, setAsetLancarDagang] = useState<number>(0);
  const [hutangJatuhTempoDagang, setHutangJatuhTempoDagang] = useState<number>(0);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmittingCart, setIsSubmittingCart] = useState<boolean>(false);

  useEffect(() => {
    const fetchNisab = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
        const res = await fetch(`${apiUrl}/landing/nisab-zakat`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setBenchmark((prev) => ({ ...prev, ...json.data }));
          }
        }
      } catch {
        // Fallback remains active on network or service error
      }
    };

    fetchNisab();
  }, []);

  const profesiResult = calculateZakatProfesi(monthlyIncome, benchmark);
  const maalResult = calculateZakatMaal(totalAssets, shortTermDebts, haulFulfilled, benchmark);

  const netDagang = Math.max(0, asetLancarDagang - hutangJatuhTempoDagang);
  const isDagangNisabReached = netDagang >= benchmark.nisab_tahunan;
  const zakatDagang = isDagangNisabReached ? Math.round(netDagang * (benchmark.tarif_persen / 100)) : 0;
  const infakDagang = Math.round(netDagang * (benchmark.tarif_persen / 100));

  const totalFitrah = jumlahJiwaFitrah * tarifFitrahPerJiwa;

  const handleAddToCart = async (
    programType: "zakat-maal" | "zakat-profesi",
    amount: number
  ) => {
    setFeedbackMessage(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setFeedbackMessage({
        type: "error",
        text: "Silakan masuk ke akun Anda terlebih dahulu untuk menambahkan zakat ke keranjang.",
      });
      return;
    }

    if (amount < 10000) {
      setFeedbackMessage({
        type: "error",
        text: "Nominal zakat minimal adalah Rp 10.000 untuk transaksi keranjang.",
      });
      return;
    }

    setIsSubmittingCart(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
      const payload = buildZakatCartPayload(programType, amount);

      const res = await fetch(`${apiUrl}/keranjang`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Gagal menyimpan ke keranjang.");
      }

      setFeedbackMessage({
        type: "success",
        text: "Zakat berhasil ditambahkan ke keranjang donasi.",
      });
      window.dispatchEvent(new Event("storage"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kendala saat menyimpan ke keranjang.";
      setFeedbackMessage({ type: "error", text: msg });
    } finally {
      setIsSubmittingCart(false);
    }
  };

  const handleSalurLangsung = (
    programType: "zakat-maal" | "zakat-profesi" | "zakat-fitrah" | "zakat-perdagangan",
    amount: number
  ) => {
    const targetUrl = buildZakatDonationUrl(programType, amount);
    router.push(targetUrl);
  };

  return (
    <div className="space-y-6">
      {/* BAZNAS Benchmark Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60 dark:border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                ✓
              </span>
              <h3 className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                Acuan Resmi Nisab BAZNAS RI ({benchmark.tahun})
              </h3>
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Ketetapan berdasarkan {benchmark.dasar_hukum} dengan tarif zakat {benchmark.tarif_persen}%
            </p>
          </div>
          <a
            href="https://baznas.go.id"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Sumber BAZNAS RI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-zinc-500 dark:text-zinc-400 block">Nisab Penghasilan (Bulanan)</span>
            <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-sm mt-0.5 block">
              {formatRupiah(benchmark.nisab_bulanan)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-zinc-500 dark:text-zinc-400 block">Nisab Harta / Maal (Tahunan)</span>
            <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-sm mt-0.5 block">
              {formatRupiah(benchmark.nisab_tahunan)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-zinc-500 dark:text-zinc-400 block">Acuan Emas 85 Gram</span>
            <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-sm mt-0.5 block">
              {formatRupiah(benchmark.harga_emas_acuan_per_gram)} / gram
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("profesi");
            setFeedbackMessage(null);
          }}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border ${
            activeTab === "profesi"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          <span>Zakat Profesi</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("maal");
            setFeedbackMessage(null);
          }}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border ${
            activeTab === "maal"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>Zakat Maal</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("fitrah");
            setFeedbackMessage(null);
          }}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border ${
            activeTab === "fitrah"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Zakat Fitrah</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("perdagangan");
            setFeedbackMessage(null);
          }}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border ${
            activeTab === "perdagangan"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Perniagaan</span>
        </button>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          )}
          <span className="flex-1">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Tab 1: Zakat Profesi */}
      {activeTab === "profesi" && (
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Zakat Penghasilan / Profesi
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Dihitung dari pendapatan atau gaji bersih bulanan. Batas nisab bulanan BAZNAS: {formatRupiah(benchmark.nisab_bulanan)}.
              </p>
            </div>
            <a
              href="https://baznas.go.id/zakatpenghasilan"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Panduan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-2">
            <Label htmlFor="penghasilan" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Total Penghasilan Bersih per Bulan (Rp)
            </Label>
            <Input
              id="penghasilan"
              type="number"
              placeholder="Contoh: 10000000"
              value={monthlyIncome || ""}
              onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
              className="font-mono text-sm bg-white dark:bg-zinc-900 rounded-xl h-11"
            />
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Preview nominal: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{formatRupiah(monthlyIncome)}</strong></span>
              <span>Batas nisab: {formatRupiah(benchmark.nisab_bulanan)}</span>
            </div>
          </div>

          {/* Live Status Indicator */}
          <div
            aria-live="polite"
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              profesiResult.isObligated
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                : "bg-zinc-100/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {profesiResult.isObligated ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block">
                {profesiResult.isObligated ? "Status: Wajib Zakat Profesi" : "Status: Belum Wajib Zakat"}
              </span>
              <span>
                {profesiResult.isObligated
                  ? `Penghasilan telah memenuhi batas nisab bulanan BAZNAS RI (${formatRupiah(benchmark.nisab_bulanan)}). Kewajiban zakat adalah 2.5%.`
                  : `Penghasilan belum mencapai batas nisab bulanan BAZNAS (${formatRupiah(benchmark.nisab_bulanan)}). Anda dapat menyalurkan infak/sedekah sukarela.`}
              </span>
            </div>
          </div>

          {/* Dual Action Output */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-500">
                {profesiResult.isObligated ? "Kewajiban Zakat Profesi (2.5%):" : "Rekomendasi Infak Sukarela (2.5%):"}
              </span>
              <p
                className={`text-2xl font-black font-mono mt-0.5 ${
                  profesiResult.isObligated
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {formatRupiah(profesiResult.isObligated ? profesiResult.calculatedZakat : profesiResult.recommendedInfak || 0)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingCart || monthlyIncome <= 0}
                onClick={() => {
                  const amt = profesiResult.isObligated ? profesiResult.calculatedZakat : profesiResult.recommendedInfak || 0;
                  handleAddToCart("zakat-profesi", amt);
                }}
                className="h-11 px-4 rounded-xl border-zinc-300 dark:border-zinc-700 text-xs font-semibold gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </Button>

              <Button
                type="button"
                disabled={monthlyIncome <= 0}
                onClick={() => {
                  const amt = profesiResult.isObligated ? profesiResult.calculatedZakat : profesiResult.recommendedInfak || 0;
                  handleSalurLangsung("zakat-profesi", amt);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-sm gap-2"
              >
                <span>Salur Zakat Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Zakat Maal */}
      {activeTab === "maal" && (
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Zakat Maal (Harta Simpanan, Emas, Tabungan)
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Dihitung dari total simpanan harta bersih yang telah mencapai nisab 85 gram emas ({formatRupiah(benchmark.nisab_tahunan)}) dan tersimpan selama 1 tahun (haul).
              </p>
            </div>
            <a
              href="https://baznas.go.id/zakat"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Panduan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAssets" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Total Simpanan Harta, Tabungan, & Emas (Rp)
              </Label>
              <Input
                id="totalAssets"
                type="number"
                placeholder="Contoh: 100000000"
                value={totalAssets || ""}
                onChange={(e) => setTotalAssets(Number(e.target.value) || 0)}
                className="font-mono text-sm bg-white dark:bg-zinc-900 rounded-xl h-11"
              />
              <span className="text-[11px] text-zinc-500 block">
                Preview: {formatRupiah(totalAssets)}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortTermDebts" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Hutang Jatuh Tempo / Beban Kebutuhan Pokok (Rp)
              </Label>
              <Input
                id="shortTermDebts"
                type="number"
                placeholder="Contoh: 5000000"
                value={shortTermDebts || ""}
                onChange={(e) => setShortTermDebts(Number(e.target.value) || 0)}
                className="font-mono text-sm bg-white dark:bg-zinc-900 rounded-xl h-11"
              />
              <span className="text-[11px] text-zinc-500 block">
                Preview: {formatRupiah(shortTermDebts)}
              </span>
            </div>
          </div>

          {/* Haul Selector */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Kondisi Haul (Masa Mengendap Harta)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHaulFulfilled(true)}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                  haulFulfilled
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  haulFulfilled ? "border-emerald-600 bg-emerald-600 text-white text-[10px]" : "border-zinc-400"
                }`}>
                  {haulFulfilled ? "✓" : ""}
                </span>
                <div>
                  <strong className="block text-zinc-900 dark:text-zinc-100">Sudah Mencapai Haul (≥ 1 Tahun)</strong>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Harta telah mengendap dan dimiliki penuh selama minimal 12 bulan qamariyah.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHaulFulfilled(false)}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                  !haulFulfilled
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 ring-1 ring-amber-500"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  !haulFulfilled ? "border-amber-600 bg-amber-600 text-white text-[10px]" : "border-zinc-400"
                }`}>
                  {!haulFulfilled ? "✓" : ""}
                </span>
                <div>
                  <strong className="block text-zinc-900 dark:text-zinc-100">Belum 1 Tahun (&lt; 12 Bulan)</strong>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Harta baru diperoleh atau belum mengendap penuh selama 1 tahun.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Live Status Indicator */}
          <div
            aria-live="polite"
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              maalResult.isObligated
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                : "bg-zinc-100/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {maalResult.isObligated ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block">
                {maalResult.isObligated
                  ? "Status: Wajib Zakat Maal"
                  : maalResult.isNisabReached && !haulFulfilled
                  ? "Status: Mencapai Nisab, Belum Haul 1 Tahun"
                  : "Status: Belum Wajib Zakat Maal"}
              </span>
              <span>
                {maalResult.isObligated
                  ? `Harta bersih (${formatRupiah(Math.max(0, totalAssets - shortTermDebts))}) telah mencapai nisab tahunan BAZNAS (${formatRupiah(benchmark.nisab_tahunan)}) dan haul 1 tahun telah terpenuhi.`
                  : maalResult.isNisabReached && !haulFulfilled
                  ? `Harta telah mencapai batas nisab, namun kewajiban zakat maal baru berlaku setelah genap mengendap 1 tahun. Anda dianjurkan berinfak sukarela.`
                  : `Harta bersih belum mencapai batas nisab tahunan BAZNAS (${formatRupiah(benchmark.nisab_tahunan)}). Disarankan menyalurkan sedekah/infak umum.`}
              </span>
            </div>
          </div>

          {/* Dual Action Output */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-500">
                {maalResult.isObligated ? "Kewajiban Zakat Maal (2.5%):" : "Rekomendasi Infak Sukarela (2.5%):"}
              </span>
              <p
                className={`text-2xl font-black font-mono mt-0.5 ${
                  maalResult.isObligated
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {formatRupiah(maalResult.isObligated ? maalResult.calculatedZakat : maalResult.recommendedInfak || 0)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingCart || totalAssets <= 0}
                onClick={() => {
                  const amt = maalResult.isObligated ? maalResult.calculatedZakat : maalResult.recommendedInfak || 0;
                  handleAddToCart("zakat-maal", amt);
                }}
                className="h-11 px-4 rounded-xl border-zinc-300 dark:border-zinc-700 text-xs font-semibold gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </Button>

              <Button
                type="button"
                disabled={totalAssets <= 0}
                onClick={() => {
                  const amt = maalResult.isObligated ? maalResult.calculatedZakat : maalResult.recommendedInfak || 0;
                  handleSalurLangsung("zakat-maal", amt);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-sm gap-2"
              >
                <span>Salur Zakat Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Zakat Fitrah */}
      {activeTab === "fitrah" && (
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Zakat Fitrah (Penyucian Jiwa)
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Kewajiban setiap jiwa Muslim menjelang Idulfitri. Acuan standar BAZNAS RI: {formatRupiah(tarifFitrahPerJiwa)} per jiwa (setara 2.5 kg beras).
              </p>
            </div>
            <a
              href="https://baznas.go.id/zakat"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Panduan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            <Label htmlFor="jumlah_jiwa_calc" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Jumlah Jiwa / Anggota Keluarga yang Dizakati
            </Label>
            <Input
              id="jumlah_jiwa_calc"
              type="number"
              min={1}
              max={50}
              value={jumlahJiwaFitrah || ""}
              onChange={(e) => setJumlahJiwaFitrah(Math.max(1, Number(e.target.value) || 1))}
              className="font-mono text-sm bg-white dark:bg-zinc-900 rounded-xl h-11"
            />
            <p className="text-xs text-zinc-500">
              Termasuk kepala keluarga, pasangan, anak-anak, dan tanggungan yang dinafkahi.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-500">Total Zakat Fitrah ({jumlahJiwaFitrah} Jiwa):</span>
              <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                {formatRupiah(totalFitrah)}
              </p>
            </div>

            <Button
              type="button"
              disabled={totalFitrah <= 0}
              onClick={() => handleSalurLangsung("zakat-fitrah", totalFitrah)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-sm gap-2"
            >
              <span>Salur Zakat Fitrah</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tab 4: Zakat Perdagangan */}
      {activeTab === "perdagangan" && (
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                  4
                </span>
                Zakat Perniagaan / Perdagangan (Tijarah)
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Rumus Syar&apos;i: (Aset Lancar Usaha + Stok Barang Dagangan) - Hutang Usaha Jatuh Tempo. Nisab setara 85 gram emas ({formatRupiah(benchmark.nisab_tahunan)}).
              </p>
            </div>
            <a
              href="https://baznas.go.id/zakat"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Panduan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aset_dagang_calc" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Total Aset Lancar Usaha + Stok Barang (Rp)
              </Label>
              <Input
                id="aset_dagang_calc"
                type="number"
                placeholder="Kas usaha, stok dagangan, piutang lancar"
                value={asetLancarDagang || ""}
                onChange={(e) => setAsetLancarDagang(Number(e.target.value) || 0)}
                className="font-mono text-sm bg-white dark:bg-zinc-900 rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hutang_dagang_calc" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Hutang Usaha Jatuh Tempo Dekat (Rp)
              </Label>
              <Input
                id="hutang_dagang_calc"
                type="number"
                placeholder="Hutang tempo pendek yang wajib dibayar"
                value={hutangJatuhTempoDagang || ""}
                onChange={(e) => setHutangJatuhTempoDagang(Number(e.target.value) || 0)}
                className="font-mono text-sm bg-white dark:bg-zinc-900 rounded-xl h-11"
              />
            </div>
          </div>

          <div
            aria-live="polite"
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              isDagangNisabReached
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                : "bg-zinc-100/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {isDagangNisabReached ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block">
                {isDagangNisabReached ? "Status: Wajib Zakat Perdagangan" : "Status: Belum Wajib Zakat Perdagangan"}
              </span>
              <span>
                Aset bersih kena zakat: <strong className="font-mono">{formatRupiah(netDagang)}</strong>.
                {isDagangNisabReached
                  ? ` Telah memenuhi nisab tahunan BAZNAS (${formatRupiah(benchmark.nisab_tahunan)}).`
                  : ` Belum mencapai nisab tahunan BAZNAS (${formatRupiah(benchmark.nisab_tahunan)}).`}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-500">
                {isDagangNisabReached ? "Kewajiban Zakat Perniagaan (2.5%):" : "Rekomendasi Infak Usaha (2.5%):"}
              </span>
              <p
                className={`text-2xl font-black font-mono mt-0.5 ${
                  isDagangNisabReached
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {formatRupiah(isDagangNisabReached ? zakatDagang : infakDagang)}
              </p>
            </div>

            <Button
              type="button"
              disabled={netDagang <= 0}
              onClick={() => handleSalurLangsung("zakat-perdagangan", isDagangNisabReached ? zakatDagang : infakDagang)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-11 px-6 rounded-xl shadow-sm gap-2"
            >
              <span>Salur Zakat Perdagangan</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
