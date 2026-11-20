export type TipeSDM = "Pengasuh/Ustadz" | "Staf/Amil";

export type StatusKepegawaian = "Tetap" | "Kontrak" | "Honorer" | "Magang";

export type StatusAktif = "Aktif" | "Nonaktif" | "Cuti";

export type StatusPayroll = "Draft" | "Disetujui" | "Dibayar";

export type JenisKelamin = "Laki-laki" | "Perempuan";

export type MetodePembayaran = "Transfer Bank" | "Kas Tunai";

export interface Karyawan {
  id: string;
  nip: string;
  nik?: string | null;
  nama_lengkap: string;
  jenis_kelamin: JenisKelamin;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  no_hp?: string | null;
  email?: string | null;
  alamat?: string | null;
  tipe_sdm: TipeSDM;
  jabatan: string;
  divisi?: string | null;
  status_kepegawaian: StatusKepegawaian;
  status_aktif: StatusAktif;
  tanggal_bergabung?: string | null;
  tanggal_berhenti?: string | null;
  nama_bank?: string | null;
  nomor_rekening?: string | null;
  atas_nama_rekening?: string | null;
  gaji_pokok_standar: number;
  tunjangan_tetap_standar: number;
  foto?: string | null;
  catatan?: string | null;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
  payrolls?: Payroll[];
  creator?: {
    id: number;
    name: string;
  } | null;
}

export interface KaryawanSummary {
  total: number;
  aktif: number;
  nonaktif: number;
  cuti: number;
  pengasuh: number;
  staf: number;
  pengasuh_aktif: number;
  staf_aktif: number;
}

export interface Payroll {
  id: string;
  nomor_slip: string;
  karyawan_id: string;
  karyawan?: Karyawan;
  periode_bulan: number;
  periode_tahun: number;
  tanggal_pembayaran?: string | null;
  gaji_pokok: number;
  tunjangan_jabatan: number;
  tunjangan_kehadiran: number;
  tunjangan_keluarga: number;
  bonus_tambahan: number;
  total_pendapatan: number;
  potongan_bpjs: number;
  potongan_kasbon: number;
  potongan_terlambat: number;
  potongan_lain: number;
  total_potongan: number;
  gaji_bersih: number;
  status: StatusPayroll;
  metode_pembayaran: MetodePembayaran;
  kas_bank_akun_id?: string | null;
  kas_bank_akun?: {
    id: string;
    kode_akun: string;
    nama_akun: string;
  } | null;
  jurnal_umum_id?: string | null;
  jurnal_umum?: {
    id: string;
    nomor_referensi: string;
    tanggal_transaksi: string;
    keterangan: string;
    items?: Array<{
      id: string;
      chart_of_account_id: string;
      debit: number;
      kredit: number;
      account?: {
        id: string;
        kode_akun: string;
        nama_akun: string;
      };
    }>;
  } | null;
  disetujui_oleh?: number | null;
  disetujui_pada?: string | null;
  dibayar_oleh?: number | null;
  dibayar_pada?: string | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
  approver?: {
    id: number;
    name: string;
  } | null;
  payer?: {
    id: number;
    name: string;
  } | null;
  creator?: {
    id: number;
    name: string;
  } | null;
}

export interface PayrollSummary {
  periode_bulan: number;
  periode_tahun: number;
  total_slip: number;
  total_draft: number;
  total_disetujui: number;
  total_dibayar: number;
  nominal_dibayar: number;
  nominal_draft: number;
  nominal_disetujui: number;
  total_pengeluaran_est: number;
}

export interface SlipGajiData {
  yayasan: {
    nama: string;
    sk_kemenkumham: string;
    alamat: string;
    telepon: string;
    email: string;
    website: string;
  };
  slip: {
    id: string;
    nomor_slip: string;
    periode_bulan: number;
    periode_tahun: number;
    nama_periode: string;
    tanggal_pembayaran: string;
    metode_pembayaran: string;
    status: string;
    kas_bank: string;
    nomor_jurnal?: string | null;
  };
  karyawan: {
    id?: string | null;
    nip?: string | null;
    nik?: string | null;
    nama_lengkap?: string | null;
    tipe_sdm?: string | null;
    jabatan?: string | null;
    divisi?: string | null;
    status_kepegawaian?: string | null;
    nama_bank?: string | null;
    nomor_rekening?: string | null;
    atas_nama_rekening?: string | null;
  };
  pendapatan: {
    gaji_pokok: number;
    tunjangan_jabatan: number;
    tunjangan_kehadiran: number;
    tunjangan_keluarga: number;
    bonus_tambahan: number;
    total_pendapatan: number;
  };
  potongan: {
    potongan_bpjs: number;
    potongan_kasbon: number;
    potongan_terlambat: number;
    potongan_lain: number;
    total_potongan: number;
  };
  gaji_bersih: number;
  terbilang: string;
  catatan?: string | null;
  approver: {
    nama?: string | null;
    tanggal?: string | null;
  };
  payer: {
    nama?: string | null;
    tanggal?: string | null;
  };
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
