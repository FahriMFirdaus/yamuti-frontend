export interface NisabBenchmark {
  tahun: number;
  dasar_hukum: string;
  nisab_tahunan: number;
  nisab_bulanan: number;
  tarif_persen: number;
  harga_emas_acuan_per_gram: number;
  haul_kondisi_bulan?: number;
}

export interface CalculationResult {
  isNisabReached: boolean;
  isHaulReached?: boolean;
  isObligated: boolean;
  calculatedZakat: number;
  recommendedInfak?: number;
  rateApplied: number;
  thresholdApplied: number;
}

export type ZakatProgramType = 'zakat-maal' | 'zakat-profesi' | 'zakat-fitrah' | 'zakat-perdagangan';

export function calculateZakatProfesi(
  monthlyIncome: number,
  benchmark: NisabBenchmark
): CalculationResult {
  const sanitizedIncome = Math.max(0, monthlyIncome || 0);
  const isNisabReached = sanitizedIncome >= benchmark.nisab_bulanan;
  const isObligated = isNisabReached;
  const rateFactor = (benchmark.tarif_persen || 2.5) / 100;

  if (isObligated) {
    return {
      isNisabReached: true,
      isObligated: true,
      calculatedZakat: Math.round(sanitizedIncome * rateFactor),
      recommendedInfak: 0,
      rateApplied: benchmark.tarif_persen,
      thresholdApplied: benchmark.nisab_bulanan,
    };
  }

  return {
    isNisabReached: false,
    isObligated: false,
    calculatedZakat: 0,
    recommendedInfak: Math.round(sanitizedIncome * rateFactor),
    rateApplied: benchmark.tarif_persen,
    thresholdApplied: benchmark.nisab_bulanan,
  };
}

export function calculateZakatMaal(
  totalAssets: number,
  shortTermDebts: number,
  haulFulfilled: boolean,
  benchmark: NisabBenchmark
): CalculationResult {
  const grossAssets = Math.max(0, totalAssets || 0);
  const debts = Math.max(0, shortTermDebts || 0);
  const netWealth = Math.max(0, grossAssets - debts);

  const isNisabReached = netWealth >= benchmark.nisab_tahunan;
  const isHaulReached = Boolean(haulFulfilled);
  const isObligated = isNisabReached && isHaulReached;
  const rateFactor = (benchmark.tarif_persen || 2.5) / 100;

  if (isObligated) {
    return {
      isNisabReached: true,
      isHaulReached: true,
      isObligated: true,
      calculatedZakat: Math.round(netWealth * rateFactor),
      recommendedInfak: 0,
      rateApplied: benchmark.tarif_persen,
      thresholdApplied: benchmark.nisab_tahunan,
    };
  }

  return {
    isNisabReached,
    isHaulReached,
    isObligated: false,
    calculatedZakat: 0,
    recommendedInfak: Math.round(netWealth * rateFactor),
    rateApplied: benchmark.tarif_persen,
    thresholdApplied: benchmark.nisab_tahunan,
  };
}

export function buildZakatDonationUrl(
  programType: ZakatProgramType,
  amount: number
): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  return `/donasi?program=${encodeURIComponent(programType)}&nominal=${safeAmount}`;
}

export function buildZakatCartPayload(
  programType: 'zakat-maal' | 'zakat-profesi',
  amount: number,
  kampanyeId?: string | null
): {
  nominal: number;
  kampanye_id: string | null;
  pesan: string;
  is_anonymous: boolean;
} {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const zakatLabel = programType === 'zakat-maal' ? 'Zakat Maal' : 'Zakat Profesi';

  return {
    nominal: safeAmount,
    kampanye_id: kampanyeId || null,
    pesan: `[${zakatLabel}] Penyaluran zakat melalui Yayasan Amanah Muhsinin Peduli Umat`,
    is_anonymous: false,
  };
}
