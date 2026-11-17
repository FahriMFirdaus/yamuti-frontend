import assert from 'node:assert';
import test from 'node:test';
import {
  calculateZakatMaal,
  calculateZakatProfesi,
  buildZakatDonationUrl,
  buildZakatCartPayload,
  type NisabBenchmark,
} from '../src/lib/zakat/calculator.ts';

const mockBenchmark: NisabBenchmark = {
  tahun: 2026,
  dasar_hukum: 'SK Ketua BAZNAS No. 15 Tahun 2026',
  nisab_tahunan: 91681728,
  nisab_bulanan: 7640144,
  tarif_persen: 2.5,
  harga_emas_acuan_per_gram: 1078608,
  haul_kondisi_bulan: 12,
};

test('calculateZakatProfesi: returns obligation when income meets or exceeds monthly nisab', () => {
  const income = 10000000;
  const result = calculateZakatProfesi(income, mockBenchmark);

  assert.strictEqual(result.isNisabReached, true);
  assert.strictEqual(result.isObligated, true);
  assert.strictEqual(result.calculatedZakat, 250000);
  assert.strictEqual(result.recommendedInfak, 0);
  assert.strictEqual(result.rateApplied, 2.5);
  assert.strictEqual(result.thresholdApplied, 7640144);
});

test('calculateZakatProfesi: returns zero obligation and recommended infak when sub-nisab', () => {
  const income = 5000000;
  const result = calculateZakatProfesi(income, mockBenchmark);

  assert.strictEqual(result.isNisabReached, false);
  assert.strictEqual(result.isObligated, false);
  assert.strictEqual(result.calculatedZakat, 0);
  assert.strictEqual(result.recommendedInfak, 125000);
});

test('calculateZakatProfesi: handles exact boundary and zero/negative income', () => {
  const exact = calculateZakatProfesi(7640144, mockBenchmark);
  assert.strictEqual(exact.isNisabReached, true);
  assert.strictEqual(exact.isObligated, true);
  assert.strictEqual(exact.calculatedZakat, 191004);

  const zero = calculateZakatProfesi(0, mockBenchmark);
  assert.strictEqual(zero.isObligated, false);
  assert.strictEqual(zero.calculatedZakat, 0);
  assert.strictEqual(zero.recommendedInfak, 0);

  const negative = calculateZakatProfesi(-5000, mockBenchmark);
  assert.strictEqual(negative.isObligated, false);
  assert.strictEqual(negative.calculatedZakat, 0);
});

test('calculateZakatMaal: returns obligation when net wealth meets nisab and haul is fulfilled', () => {
  const totalAssets = 120000000;
  const shortTermDebts = 10000000;
  const haulFulfilled = true;

  const result = calculateZakatMaal(totalAssets, shortTermDebts, haulFulfilled, mockBenchmark);

  assert.strictEqual(result.isNisabReached, true);
  assert.strictEqual(result.isHaulReached, true);
  assert.strictEqual(result.isObligated, true);
  assert.strictEqual(result.calculatedZakat, 2750000);
  assert.strictEqual(result.recommendedInfak, 0);
});

test('calculateZakatMaal: returns zero obligation when net wealth meets nisab but haul is not fulfilled', () => {
  const totalAssets = 150000000;
  const shortTermDebts = 0;
  const haulFulfilled = false;

  const result = calculateZakatMaal(totalAssets, shortTermDebts, haulFulfilled, mockBenchmark);

  assert.strictEqual(result.isNisabReached, true);
  assert.strictEqual(result.isHaulReached, false);
  assert.strictEqual(result.isObligated, false);
  assert.strictEqual(result.calculatedZakat, 0);
  assert.strictEqual(result.recommendedInfak, 3750000);
});

test('calculateZakatMaal: debts reduce wealth below nisab', () => {
  const totalAssets = 100000000;
  const shortTermDebts = 20000000;
  const haulFulfilled = true;

  const result = calculateZakatMaal(totalAssets, shortTermDebts, haulFulfilled, mockBenchmark);

  assert.strictEqual(result.isNisabReached, false);
  assert.strictEqual(result.isObligated, false);
  assert.strictEqual(result.calculatedZakat, 0);
  assert.strictEqual(result.recommendedInfak, 2000000);
});

test('buildZakatDonationUrl: generates valid query string format', () => {
  const urlMaal = buildZakatDonationUrl('zakat-maal', 2500000);
  assert.strictEqual(urlMaal, '/donasi?program=zakat-maal&nominal=2500000');

  const urlProfesi = buildZakatDonationUrl('zakat-profesi', 187500);
  assert.strictEqual(urlProfesi, '/donasi?program=zakat-profesi&nominal=187500');
});

test('buildZakatCartPayload: formats standard zakat cart attributes and notes', () => {
  const payloadWithId = buildZakatCartPayload('zakat-maal', 2500000, 'campaign-uuid-1');
  assert.strictEqual(payloadWithId.nominal, 2500000);
  assert.strictEqual(payloadWithId.kampanye_id, 'campaign-uuid-1');
  assert.strictEqual(payloadWithId.is_anonymous, false);
  assert.ok(payloadWithId.pesan.includes('[Zakat Maal]'));

  const payloadWithoutId = buildZakatCartPayload('zakat-profesi', 350000);
  assert.strictEqual(payloadWithoutId.nominal, 350000);
  assert.strictEqual(payloadWithoutId.kampanye_id, null);
  assert.strictEqual(payloadWithoutId.is_anonymous, false);
  assert.ok(payloadWithoutId.pesan.includes('[Zakat Profesi]'));
});
