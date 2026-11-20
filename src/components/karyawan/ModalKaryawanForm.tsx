"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Save, AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Karyawan, TipeSDM, StatusKepegawaian, StatusAktif, JenisKelamin } from "@/types/karyawan";

interface ModalKaryawanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  karyawan: Karyawan | null;
  token: string | null;
  apiUrl?: string;
}

export function ModalKaryawanForm({
  isOpen,
  onClose,
  onSuccess,
  karyawan,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
}: ModalKaryawanFormProps) {
  const isEdit = Boolean(karyawan);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [nip, setNip] = useState("");
  const [nik, setNik] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>("Laki-laki");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tipeSdm, setTipeSdm] = useState<TipeSDM>("Staf/Amil");
  const [jabatan, setJabatan] = useState("");
  const [divisi, setDivisi] = useState("");
  const [statusKepegawaian, setStatusKepegawaian] = useState<StatusKepegawaian>("Tetap");
  const [statusAktif, setStatusAktif] = useState<StatusAktif>("Aktif");
  const [tanggalBergabung, setTanggalBergabung] = useState("");
  const [tanggalBerhenti, setTanggalBerhenti] = useState("");
  const [namaBank, setNamaBank] = useState("Bank Syariah Indonesia (BSI)");
  const [nomorRekening, setNomorRekening] = useState("");
  const [atasNamaRekening, setAtasNamaRekening] = useState("");
  const [gajiPokokStandar, setGajiPokokStandar] = useState<number | string>(0);
  const [tunjanganTetapStandar, setTunjanganTetapStandar] = useState<number | string>(0);
  const [catatan, setCatatan] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate form on open or when karyawan changes
  useEffect(() => {
    if (karyawan) {
      setNamaLengkap(karyawan.nama_lengkap || "");
      setNip(karyawan.nip || "");
      setNik(karyawan.nik || "");
      setJenisKelamin(karyawan.jenis_kelamin || "Laki-laki");
      setTempatLahir(karyawan.tempat_lahir || "");
      setTanggalLahir(karyawan.tanggal_lahir ? karyawan.tanggal_lahir.substring(0, 10) : "");
      setNoHp(karyawan.no_hp || "");
      setEmail(karyawan.email || "");
      setAlamat(karyawan.alamat || "");
      setTipeSdm(karyawan.tipe_sdm || "Staf/Amil");
      setJabatan(karyawan.jabatan || "");
      setDivisi(karyawan.divisi || "");
      setStatusKepegawaian(karyawan.status_kepegawaian || "Tetap");
      setStatusAktif(karyawan.status_aktif || "Aktif");
      setTanggalBergabung(karyawan.tanggal_bergabung ? karyawan.tanggal_bergabung.substring(0, 10) : "");
      setTanggalBerhenti(karyawan.tanggal_berhenti ? karyawan.tanggal_berhenti.substring(0, 10) : "");
      setNamaBank(karyawan.nama_bank || "Bank Syariah Indonesia (BSI)");
      setNomorRekening(karyawan.nomor_rekening || "");
      setAtasNamaRekening(karyawan.atas_nama_rekening || "");
      setGajiPokokStandar(karyawan.gaji_pokok_standar ?? 0);
      setTunjanganTetapStandar(karyawan.tunjangan_tetap_standar ?? 0);
      setCatatan(karyawan.catatan || "");
    } else {
      setNamaLengkap("");
      setNip("");
      setNik("");
      setJenisKelamin("Laki-laki");
      setTempatLahir("");
      setTanggalLahir("");
      setNoHp("");
      setEmail("");
      setAlamat("");
      setTipeSdm("Staf/Amil");
      setJabatan("");
      setDivisi("");
      setStatusKepegawaian("Tetap");
      setStatusAktif("Aktif");
      setTanggalBergabung(new Date().toISOString().substring(0, 10));
      setTanggalBerhenti("");
      setNamaBank("Bank Syariah Indonesia (BSI)");
      setNomorRekening("");
      setAtasNamaRekening("");
      setGajiPokokStandar(0);
      setTunjanganTetapStandar(0);
      setCatatan("");
    }
    setErrorMessage(null);
  }, [karyawan, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!namaLengkap.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }
    if (!jabatan.trim()) {
      setErrorMessage("Jabatan wajib diisi.");
      return;
    }

    setIsLoading(true);

    const payload: Record<string, unknown> = {
      nama_lengkap: namaLengkap.trim(),
      nip: nip.trim() || undefined,
      nik: nik.trim() || undefined,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir.trim() || undefined,
      tanggal_lahir: tanggalLahir || undefined,
      no_hp: noHp.trim() || undefined,
      email: email.trim() || undefined,
      alamat: alamat.trim() || undefined,
      tipe_sdm: tipeSdm,
      jabatan: jabatan.trim(),
      divisi: divisi.trim() || undefined,
      status_kepegawaian: statusKepegawaian,
      status_aktif: statusAktif,
      tanggal_bergabung: tanggalBergabung || undefined,
      tanggal_berhenti: tanggalBerhenti || undefined,
      nama_bank: namaBank.trim() || undefined,
      nomor_rekening: nomorRekening.trim() || undefined,
      atas_nama_rekening: atasNamaRekening.trim() || undefined,
      gaji_pokok_standar: Number(gajiPokokStandar) || 0,
      tunjangan_tetap_standar: Number(tunjanganTetapStandar) || 0,
      catatan: catatan.trim() || undefined,
    };

    try {
      const url = isEdit ? `${apiUrl}/karyawan/${karyawan?.id}` : `${apiUrl}/karyawan`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstErr = Object.values(data.errors).flat()[0] as string;
          throw new Error(firstErr || data.message || "Gagal menyimpan data karyawan");
        }
        throw new Error(data.message || "Gagal menyimpan data karyawan");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan tidak terduga saat menyimpan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/75 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isEdit ? "Edit Data Karyawan & Pengasuh" : "Tambah Karyawan & Pengasuh Baru"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Lengkapi identitas, penugasan, dan standar penggajian SDM Yayasan YAMUTI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Identitas Pokok */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              1. Identitas Pokok
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama_lengkap" className="text-xs font-semibold">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama_lengkap"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd.I"
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jenis_kelamin" className="text-xs font-semibold">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <select
                  id="jenis_kelamin"
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value as JenisKelamin)}
                  className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nip" className="text-xs font-semibold">
                  NIP Pegawai
                </Label>
                <Input
                  id="nip"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Kosongkan untuk auto-generate (YMT-YYYY-XXXX)"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nik" className="text-xs font-semibold">
                  NIK (KTP)
                </Label>
                <Input
                  id="nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="16 digit nomor induk kependudukan"
                  maxLength={16}
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tempat_lahir" className="text-xs font-semibold">
                  Tempat Lahir
                </Label>
                <Input
                  id="tempat_lahir"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  placeholder="Contoh: Tasikmalaya"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tanggal_lahir" className="text-xs font-semibold">
                  Tanggal Lahir
                </Label>
                <Input
                  id="tanggal_lahir"
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="no_hp" className="text-xs font-semibold">
                  Nomor HP / WhatsApp
                </Label>
                <Input
                  id="no_hp"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@yamuti.or.id"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alamat" className="text-xs font-semibold">
                Alamat Domisili
              </Label>
              <Textarea
                id="alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Alamat lengkap tempat tinggal sekarang..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>

          {/* Section 2: Penugasan & Klasifikasi ISAK 35 */}
          <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              2. Penugasan & Klasifikasi Beban ISAK 35
            </h3>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Penting untuk Akuntansi:</strong> Pemilihan Tipe SDM menentukan otomatis pembebanan jurnal buku besar saat penggajian:
                <ul className="list-disc ml-4 mt-1 space-y-0.5">
                  <li><strong>Pengasuh/Ustadz</strong> dialokasikan ke Akun <code>5-1007</code> (Beban Honor Pengasuh & Ustadz Santri).</li>
                  <li><strong>Staf/Amil</strong> dialokasikan ke Akun <code>5-1008</code> (Beban Honor Staf & Amil Yayasan).</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipe_sdm" className="text-xs font-semibold">
                  Tipe SDM <span className="text-red-500">*</span>
                </Label>
                <select
                  id="tipe_sdm"
                  value={tipeSdm}
                  onChange={(e) => setTipeSdm(e.target.value as TipeSDM)}
                  className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Pengasuh/Ustadz">Pengasuh/Ustadz (Asrama & Santri)</option>
                  <option value="Staf/Amil">Staf/Amil (Manajemen & Kantor)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jabatan" className="text-xs font-semibold">
                  Jabatan / Posisi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jabatan"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Kepala Asrama Putra / Staf Keuangan"
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="divisi" className="text-xs font-semibold">
                  Divisi / Bagian
                </Label>
                <Input
                  id="divisi"
                  value={divisi}
                  onChange={(e) => setDivisi(e.target.value)}
                  placeholder="Contoh: Asrama & Pendidikan / Sekretariat"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status_kepegawaian" className="text-xs font-semibold">
                  Status Kepegawaian
                </Label>
                <select
                  id="status_kepegawaian"
                  value={statusKepegawaian}
                  onChange={(e) => setStatusKepegawaian(e.target.value as StatusKepegawaian)}
                  className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Tetap">Karyawan Tetap</option>
                  <option value="Kontrak">Karyawan Kontrak</option>
                  <option value="Honorer">Honorer / Pengabdian</option>
                  <option value="Magang">Magang / Relawan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status_aktif" className="text-xs font-semibold">
                  Status Keaktifan
                </Label>
                <select
                  id="status_aktif"
                  value={statusAktif}
                  onChange={(e) => setStatusAktif(e.target.value as StatusAktif)}
                  className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Aktif">Aktif Bekerja</option>
                  <option value="Cuti">Sedang Cuti</option>
                  <option value="Nonaktif">Non-Aktif / Berhenti</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tanggal_bergabung" className="text-xs font-semibold">
                  Tanggal Mulai Bertugas
                </Label>
                <Input
                  id="tanggal_bergabung"
                  type="date"
                  value={tanggalBergabung}
                  onChange={(e) => setTanggalBergabung(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Rekening & Standar Gaji Bulanan */}
          <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              3. Rekening Pencairan & Standar Honor Bulanan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama_bank" className="text-xs font-semibold">
                  Bank Penampung
                </Label>
                <Input
                  id="nama_bank"
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  placeholder="Contoh: Bank BSI / BCA / Kas Tunai"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nomor_rekening" className="text-xs font-semibold">
                  Nomor Rekening
                </Label>
                <Input
                  id="nomor_rekening"
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  placeholder="Nomor rekening transfer"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="atas_nama_rekening" className="text-xs font-semibold">
                  Atas Nama Rekening
                </Label>
                <Input
                  id="atas_nama_rekening"
                  value={atasNamaRekening}
                  onChange={(e) => setAtasNamaRekening(e.target.value)}
                  placeholder="Sesuai buku tabungan"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gaji_pokok_standar" className="text-xs font-semibold">
                    Standar Gaji Pokok (Rp)
                  </Label>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatRupiah(Number(gajiPokokStandar) || 0)}
                  </span>
                </div>
                <Input
                  id="gaji_pokok_standar"
                  type="number"
                  min={0}
                  value={gajiPokokStandar}
                  onChange={(e) => setGajiPokokStandar(e.target.value)}
                  className="h-9 text-sm font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tunjangan_tetap_standar" className="text-xs font-semibold">
                    Standar Tunjangan Jabatan / Tetap (Rp)
                  </Label>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatRupiah(Number(tunjanganTetapStandar) || 0)}
                  </span>
                </div>
                <Input
                  id="tunjangan_tetap_standar"
                  type="number"
                  min={0}
                  value={tunjanganTetapStandar}
                  onChange={(e) => setTunjanganTetapStandar(e.target.value)}
                  className="h-9 text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catatan" className="text-xs font-semibold">
                Catatan Tambahan
              </Label>
              <Textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan kepegawaian, sertifikasi, atau penugasan khusus..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-zinc-700 dark:text-zinc-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Perbarui Data Karyawan" : "Simpan Karyawan"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
