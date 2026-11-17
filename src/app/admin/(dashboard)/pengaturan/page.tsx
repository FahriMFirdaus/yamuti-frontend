"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Percent, 
  MapPin, 
  Navigation, 
  Clock, 
  Compass, 
  ExternalLink,
  CheckCircle2,
  CalendarCheck,
  Calculator,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getSession } from "next-auth/react";

type SplitRule = {
  nama_kas: string;
  persentase: number;
};

interface LokasiOperasionalData {
  email: string;
  no_hp_resmi: string;
  no_whatsapp_admin: string;
  no_whatsapp: string;
  alamat_singkat: string;
  alamat_lengkap: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  embed_map_url: string;
  jam_operasional_label: string;
  jam_senin_jumat: string;
  jam_sabtu_minggu: string;
  jam_libur: string;
  slot_kunjungan_aktif: string[];
}

const DEFAULT_LOKASI_OPERASIONAL: LokasiOperasionalData = {
  email: "yatimmutiara@gmail.com",
  no_hp_resmi: "+62 877 0031 2182",
  no_whatsapp_admin: "+62 877 0031 2182",
  no_whatsapp: "+62 877 0031 2182",
  alamat_singkat: "Sukahurip, Kab. Tasikmalaya, Jawa Barat",
  alamat_lengkap: "JL. Letjen Masudi Pasar Gunung Kalong, Kec. Tamansari, Kota Tasikmalaya",
  latitude: -7.368327,
  longitude: 108.234632,
  google_maps_url: "https://maps.google.com/?q=-7.368327,108.234632",
  embed_map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d989.2178069617374!2d108.23463186963221!3d-7.368327669509687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f571bd02416e5%3A0xc424bdc4b9185c5f!2sYayasan%20Mutiara%20Titipan%20lllaahi%20YAMUTI%20Tasikmalaya!5e0!3m2!1sen!2ssg!4v1783591804254!5m2!1sen!2ssg",
  jam_operasional_label: "Buka Setiap Hari",
  jam_senin_jumat: "08.00 - 17.00",
  jam_sabtu_minggu: "09.00 - 15.00",
  jam_libur: "Sesuai Janji Temu",
  slot_kunjungan_aktif: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
};

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState("kontak");

  // State Split Rule Kas
  const [rules, setRules] = useState<SplitRule[]>([
    { nama_kas: "Yayasan Tasikmalaya", persentase: 75 },
    { nama_kas: "Admin Sistem", persentase: 10 },
    { nama_kas: "IT Support", persentase: 5 },
    { nama_kas: "Operasional Website", persentase: 10 }
  ]);
  const [isSubmittingKas, setIsSubmittingKas] = useState(false);
  const [isLoadingKas, setIsLoadingKas] = useState(true);

  // State Lokasi & Operasional
  const [lokasiForm, setLokasiForm] = useState<LokasiOperasionalData>(DEFAULT_LOKASI_OPERASIONAL);
  const [isSubmittingLokasi, setIsSubmittingLokasi] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [newSlotInput, setNewSlotInput] = useState("");

  // State Nisab Zakat BAZNAS
  const [nisabForm, setNisabForm] = useState({
    tahun: 2026,
    dasar_hukum: "SK Ketua BAZNAS No. 15 Tahun 2026",
    nisab_tahunan: 91681728,
    nisab_bulanan: 7640144,
    tarif_persen: 2.5,
    harga_emas_acuan_per_gram: 1078608,
    keterangan: "Standar resmi nisab zakat pendapatan & jasa BAZNAS RI",
    terakhir_diperbarui: "2026-02-21",
  });
  const [isSubmittingNisab, setIsSubmittingNisab] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Kalkulasi total persentase
  const totalPersentase = rules.reduce((acc, curr) => acc + (Number(curr.persentase) || 0), 0);
  const isTotalValid = totalPersentase === 100;

  // Load Settings
  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        const session = await getSession();
        const token = session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

        // 1. Fetch Split Rule
        const resSplit = await fetch(`${apiUrl}/settings`, {
          headers: { 
            "Authorization": `Bearer ${token || ""}`,
            "Accept": "application/json"
          }
        });
        if (resSplit.ok) {
          const result = await resSplit.json();
          const splitSetting = result.data?.find((s: any) => s.key === 'donasi_split_rule');
          if (splitSetting && splitSetting.value) {
            const parsed = typeof splitSetting.value === 'string' ? JSON.parse(splitSetting.value) : splitSetting.value;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRules(parsed);
            }
          }
        }

        // 2. Fetch Lokasi & Operasional
        const resLokasi = await fetch(`${apiUrl}/landing/operasional`);
        if (resLokasi.ok) {
          const resultLokasi = await resLokasi.json();
          if (resultLokasi.data) {
            setLokasiForm((prev) => ({
              ...prev,
              ...resultLokasi.data
            }));
          }
        }

        // 3. Fetch Nisab Zakat BAZNAS
        const resNisab = await fetch(`${apiUrl}/landing/nisab-zakat`);
        if (resNisab.ok) {
          const resultNisab = await resNisab.json();
          if (resultNisab.data) {
            setNisabForm(resultNisab.data);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan:", err);
      } finally {
        setIsLoadingKas(false);
      }
    };

    fetchAllSettings();
  }, [apiUrl]);

  // --- Handlers Kas ---
  const handleAddRow = () => {
    setRules([...rules, { nama_kas: "", persentase: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const handleChange = (index: number, field: keyof SplitRule, value: string | number) => {
    const newRules = [...rules];
    newRules[index] = {
      ...newRules[index],
      [field]: field === 'persentase' ? Number(value) : value
    };
    setRules(newRules);
  };

  const handleSaveKas = async () => {
    if (!isTotalValid) {
      alert("Total persentase harus tepat 100%!");
      return;
    }

    if (rules.some(r => !r.nama_kas.trim())) {
      alert("Nama Kas tidak boleh ada yang kosong!");
      return;
    }

    setIsSubmittingKas(true);
    try {
      const session = await getSession();
      const token = session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

      const res = await fetch(`${apiUrl}/settings/split-rule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({ value: rules }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      alert("Pengaturan Split Rule Donasi berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan pengaturan.");
    } finally {
      setIsSubmittingKas(false);
    }
  };

  // --- Handlers Geolocation & Lokasi ---
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat atau browser Anda tidak mendukung fitur Geolocation.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLokasiForm((prev) => ({
          ...prev,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          google_maps_url: `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
          embed_map_url: `https://maps.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=17&output=embed`
        }));

        // Coba Reverse Geocoding via Nominatim OpenStreetMap (Gratis & Cepat)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { "Accept-Language": "id" }
          });
          const geoJson = await res.json();
          if (geoJson && geoJson.display_name) {
            const addr = geoJson.address || {};
            const kel = addr.village || addr.suburb || addr.quarter || "";
            const kec = addr.city_district || addr.district || "";
            const kota = addr.city || addr.town || addr.county || "Tasikmalaya";
            const prov = addr.state || "Jawa Barat";
            
            const shortAddr = [kel, kec, kota, prov].filter(Boolean).join(", ");
            setLokasiForm((prev) => ({
              ...prev,
              alamat_singkat: shortAddr || prev.alamat_singkat,
              alamat_lengkap: geoJson.display_name
            }));
          }
        } catch {
          // Tetap gunakan koordinat jika reverse geocoding gagal
        } finally {
          setIsDetectingGps(false);
          alert(`Lokasi perangkat berhasil terdeteksi!\nLatitude: ${lat}\nLongitude: ${lng}`);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        let msg = "Gagal mendeteksi lokasi perangkat.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Izin akses lokasi ditolak oleh pengguna/browser. Harap aktifkan izin lokasi di browser Anda.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Informasi lokasi GPS perangkat tidak tersedia.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Waktu permintaan lokasi GPS habis (timeout).";
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    const formatted = newSlotInput.trim();
    if (!lokasiForm.slot_kunjungan_aktif.includes(formatted)) {
      const updated = [...lokasiForm.slot_kunjungan_aktif, formatted].sort();
      setLokasiForm({ ...lokasiForm, slot_kunjungan_aktif: updated });
    }
    setNewSlotInput("");
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setLokasiForm({
      ...lokasiForm,
      slot_kunjungan_aktif: lokasiForm.slot_kunjungan_aktif.filter((s) => s !== slotToRemove)
    });
  };

  const handleSaveLokasiOperasional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLokasi(true);
    try {
      const session = await getSession();
      const token = session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

      const res = await fetch(`${apiUrl}/settings/lokasi-operasional`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify(lokasiForm),
      });

      if (!res.ok) throw new Error("Gagal menyimpan lokasi & jam operasional");

      alert("Lokasi Asrama dan Jam Operasional berhasil diperbarui dan disinkronkan ke Landing Page!");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan pengaturan lokasi.");
    } finally {
      setIsSubmittingLokasi(false);
    }
  };

  const handleSaveNisabZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNisab(true);
    try {
      const session = await getSession();
      const token = session?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

      const res = await fetch(`${apiUrl}/settings/nisab-zakat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify(nisabForm),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ketetapan nisab zakat BAZNAS");

      alert("Ketetapan Nisab Zakat BAZNAS berhasil diperbarui dan disinkronkan ke seluruh kalkulator zakat!");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan ketetapan nisab zakat.");
    } finally {
      setIsSubmittingNisab(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pengaturan Sistem & Operasional
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kelola koordinat lokasi asrama, integrasi GPS Google Maps, jam operasional kunjungan, dan distribusi bagi hasil donasi.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-4xl mb-6 h-auto p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
          <TabsTrigger value="kontak" className="py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold rounded-lg text-xs sm:text-sm">
            <Compass className="w-4 h-4 mr-2" /> Profil & Kontak
          </TabsTrigger>
          <TabsTrigger value="peta" className="py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold rounded-lg text-xs sm:text-sm">
            <MapPin className="w-4 h-4 mr-2" /> Lokasi & Peta
          </TabsTrigger>
          <TabsTrigger value="jadwal" className="py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold rounded-lg text-xs sm:text-sm">
            <Clock className="w-4 h-4 mr-2" /> Jam & Kunjungan
          </TabsTrigger>
          <TabsTrigger value="kas" className="py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold rounded-lg text-xs sm:text-sm">
            <Percent className="w-4 h-4 mr-2" /> Bagi Kas Donasi
          </TabsTrigger>
          <TabsTrigger value="zakat" className="py-2.5 data-[state=active]:bg-emerald-700 data-[state=active]:text-white font-semibold rounded-lg text-xs sm:text-sm">
            <Calculator className="w-4 h-4 mr-2" /> Nisab Zakat
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* TAB 1: PROFIL & KONTAK RESMI                             */}
        {/* ======================================================== */}
        <TabsContent value="kontak" className="space-y-6">
          <form onSubmit={handleSaveLokasiOperasional} className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Compass className="w-5 h-5 text-red-600" /> Profil Kontak Yayasan
                </CardTitle>
                <CardDescription>
                  Kelola email resmi dan nomor kontak admin yang ditampilkan di website dan tombol WhatsApp mengambang.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Resmi Yayasan</Label>
                    <Input
                      id="email"
                      type="email"
                      value={lokasiForm.email}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, email: e.target.value })}
                      placeholder="Contoh: yatimmutiara@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_hp_resmi">Nomor HP / Telepon Resmi Panti</Label>
                    <Input
                      id="no_hp_resmi"
                      value={lokasiForm.no_hp_resmi}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, no_hp_resmi: e.target.value, no_whatsapp: e.target.value })}
                      placeholder="Contoh: +62 877 0031 2182"
                    />
                    <p className="text-[11px] text-zinc-500">Tampil sebagai kontak resmi kantor di Footer.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_whatsapp_admin">
                      Nomor WhatsApp Admin <span className="text-green-600 font-bold">(Ikon Mengambang)</span>
                    </Label>
                    <Input
                      id="no_whatsapp_admin"
                      value={lokasiForm.no_whatsapp_admin}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, no_whatsapp_admin: e.target.value })}
                      placeholder="Contoh: +62 812 3456 7890"
                    />
                    <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">Tujuan chat saat pengunjung klik tombol WA hijau mengambang.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alamat_singkat">Alamat Singkat (Tampil di Kotak Beranda)</Label>
                    <Input
                      id="alamat_singkat"
                      value={lokasiForm.alamat_singkat}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, alamat_singkat: e.target.value })}
                      placeholder="Contoh: Sukahurip, Kab. Tasikmalaya, Jawa Barat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamat_lengkap">Alamat Lengkap (Tampil di Footer & Detail)</Label>
                    <Input
                      id="alamat_lengkap"
                      value={lokasiForm.alamat_lengkap}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, alamat_lengkap: e.target.value })}
                      placeholder="Contoh: JL. Letjen Masudi Pasar Gunung Kalong, Kec. Tamansari, Kota Tasikmalaya"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingLokasi}
                className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] shadow-lg shadow-red-500/20 font-bold"
              >
                {isSubmittingLokasi ? "Menyimpan..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Profil Kontak
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: LOKASI GPS & PETA GOOGLE MAPS                     */}
        {/* ======================================================== */}
        <TabsContent value="peta" className="space-y-6">
          <form onSubmit={handleSaveLokasiOperasional} className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" /> Koordinat GPS & Peta Asrama
                    </CardTitle>
                    <CardDescription>
                      Atur letak presisi asrama YAMUTI untuk navigasi donatur di Google Maps dan tampilan beranda.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={isDetectingGps}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shrink-0 flex items-center gap-2"
                  >
                    <Navigation className={`w-4 h-4 ${isDetectingGps ? "animate-spin" : ""}`} />
                    {isDetectingGps ? "Membaca GPS..." : "Gunakan Lokasi Perangkat Ini (GPS)"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (Garis Lintang)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={lokasiForm.latitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLokasiForm((prev) => ({
                          ...prev,
                          latitude: val,
                          google_maps_url: `https://maps.google.com/?q=${val},${prev.longitude}`,
                          embed_map_url: `https://maps.google.com/maps?q=${val},${prev.longitude}&z=17&output=embed`
                        }));
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (Garis Bujur)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={lokasiForm.longitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLokasiForm((prev) => ({
                          ...prev,
                          longitude: val,
                          google_maps_url: `https://maps.google.com/?q=${prev.latitude},${val}`,
                          embed_map_url: `https://maps.google.com/maps?q=${prev.latitude},${val}&z=17&output=embed`
                        }));
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embed_map_url">Google Maps Embed URL / Iframe</Label>
                  <Input
                    id="embed_map_url"
                    value={lokasiForm.embed_map_url}
                    onChange={(e) => setLokasiForm({ ...lokasiForm, embed_map_url: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                  <p className="text-xs text-zinc-500">
                    Otomatis diperbarui saat koordinat latitude/longitude diubah atau lokasi GPS dideteksi.
                  </p>
                </div>

                {/* Preview Peta */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Pratinjau Peta Interaktif
                    </Label>
                    <a
                      href={lokasiForm.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      Buka di Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[260px] bg-zinc-100 dark:bg-zinc-900 shadow-inner">
                    <iframe
                      src={lokasiForm.embed_map_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingLokasi}
                className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] shadow-lg shadow-red-500/20 font-bold"
              >
                {isSubmittingLokasi ? "Menyimpan..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Koordinat & Peta
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 3: JAM OPERASIONAL & JADWAL KUNJUNGAN                */}
        {/* ======================================================== */}
        <TabsContent value="jadwal" className="space-y-6">
          <form onSubmit={handleSaveLokasiOperasional} className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" /> Jam Buka & Jadwal Kunjungan
                </CardTitle>
                <CardDescription>
                  Tentukan jam layanan penerimaan tamu dan slot waktu yang tersedia saat donatur membuat janji kunjungan.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jam_operasional_label">Label Status Operasional</Label>
                    <Input
                      id="jam_operasional_label"
                      value={lokasiForm.jam_operasional_label}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, jam_operasional_label: e.target.value })}
                      placeholder="Contoh: Buka Setiap Hari"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jam_senin_jumat">Senin - Jumat</Label>
                    <Input
                      id="jam_senin_jumat"
                      value={lokasiForm.jam_senin_jumat}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, jam_senin_jumat: e.target.value })}
                      placeholder="08.00 - 17.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jam_sabtu_minggu">Sabtu - Minggu</Label>
                    <Input
                      id="jam_sabtu_minggu"
                      value={lokasiForm.jam_sabtu_minggu}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, jam_sabtu_minggu: e.target.value })}
                      placeholder="09.00 - 15.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jam_libur">Hari Libur Nasional</Label>
                    <Input
                      id="jam_libur"
                      value={lokasiForm.jam_libur}
                      onChange={(e) => setLokasiForm({ ...lokasiForm, jam_libur: e.target.value })}
                      placeholder="Sesuai Janji Temu"
                      required
                    />
                  </div>
                </div>

                {/* Slot Kunjungan Aktif */}
                <div className="space-y-3 pt-2">
                  <Label className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    Slot Jam Booking Kunjungan Aktif
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Slot jam berikut akan ditampilkan sebagai opsi yang bisa dipilih oleh donatur pada form booking kunjungan.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {lokasiForm.slot_kunjungan_aktif.map((slot) => (
                      <Badge
                        key={slot}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800"
                      >
                        {slot}
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot)}
                          className="text-zinc-400 hover:text-red-500 rounded-full"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-xs pt-2">
                    <Input
                      placeholder="Misal: 16:00"
                      value={newSlotInput}
                      onChange={(e) => setNewSlotInput(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={handleAddSlot}>
                      Tambah
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingLokasi}
                className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] shadow-lg shadow-red-500/20 font-bold"
              >
                {isSubmittingLokasi ? "Menyimpan..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Jam & Jadwal Kunjungan
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 4: ATURAN KAS DONASI                                 */}
        {/* ======================================================== */}
        <TabsContent value="kas" className="space-y-4">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-600" /> Distribusi Bagi Hasil Donasi Masuk
              </CardTitle>
              <CardDescription>
                Tentukan persentase pemotongan otomatis setiap kali ada donasi berhasil yang masuk ke rekening yayasan.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingKas ? (
                <div className="py-8 text-center text-zinc-500">Memuat konfigurasi kas...</div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-7 md:col-span-8">
                        <Input
                          placeholder="Nama Kas Akuntansi"
                          value={rule.nama_kas}
                          onChange={(e) => handleChange(index, 'nama_kas', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-3">
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={rule.persentase}
                            onChange={(e) => handleChange(index, 'persentase', e.target.value)}
                            className="pr-8 text-center font-semibold text-emerald-600"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(index)}
                          disabled={rules.length === 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddRow}
                    className="w-full border-dashed border-2 text-zinc-500 hover:text-blue-600 mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Pembagian Kas Baru
                  </Button>
                </div>
              )}

              <div className={`mt-8 p-4 rounded-xl border flex items-center justify-between ${
                isTotalValid 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300' 
                  : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300'
              }`}>
                <div className="flex items-center gap-3">
                  {!isTotalValid && <AlertCircle className="w-5 h-5" />}
                  <div>
                    <p className="font-semibold text-sm">Total Distribusi Persentase</p>
                    <p className="text-xs opacity-80">
                      {isTotalValid ? "Total sudah tepat 100%. Data siap disimpan." : "Total harus tepat mencapai 100% agar sistem seimbang."}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-black">{totalPersentase}%</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveKas}
              disabled={!isTotalValid || isSubmittingKas || isLoadingKas}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] shadow-lg shadow-emerald-500/20 font-bold"
            >
              {isSubmittingKas ? "Menyimpan..." : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan Kas
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 5: KETETAPAN NISAB ZAKAT BAZNAS                      */}
        {/* ======================================================== */}
        <TabsContent value="zakat" className="space-y-6">
          {/* Peringatan / Warning Banner Khusus Admin */}
          <div className="p-4 sm:p-5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Peringatan Penting untuk Administrator</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-800 dark:text-amber-300">
              Ketetapan nisab zakat pendapatan dan jasa diatur secara resmi oleh <strong>Badan Amil Zakat Nasional (BAZNAS) Republik Indonesia</strong> melalui Surat Keputusan (SK) tahunan. 
              Mohon pastikan data di bawah ini <strong>selalu diperbarui setiap awal tahun</strong> begitu BAZNAS menerbitkan SK Nisab terbaru, agar kalkulator zakat donatur di portal publik tetap sah dan akurat secara syar&apos;i.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <Info className="w-3.5 h-3.5" />
              <span>Rujukan resmi: <a href="https://baznas.go.id" target="_blank" rel="noreferrer" className="underline font-semibold">baznas.go.id</a></span>
            </div>
          </div>

          <form onSubmit={handleSaveNisabZakat} className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-700" /> Formulir Ketetapan Nisab Zakat BAZNAS
                </CardTitle>
                <CardDescription>
                  Pengaturan ini menjadi acuan utama pada fitur Kalkulator & Salur Zakat Maal / Profesi di halaman profil donatur.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tahun_zakat">Tahun Ketetapan BAZNAS</Label>
                    <Input
                      id="tahun_zakat"
                      type="number"
                      value={nisabForm.tahun}
                      onChange={(e) => setNisabForm({ ...nisabForm, tahun: Number(e.target.value) || 2026 })}
                      placeholder="Contoh: 2026"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dasar_hukum">Dasar Hukum / Nomor SK BAZNAS</Label>
                    <Input
                      id="dasar_hukum"
                      type="text"
                      value={nisabForm.dasar_hukum}
                      onChange={(e) => setNisabForm({ ...nisabForm, dasar_hukum: e.target.value })}
                      placeholder="Contoh: SK Ketua BAZNAS No. 15 Tahun 2026"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nisab_bulanan">Nisab Penghasilan Bulanan (Rp)</Label>
                    <Input
                      id="nisab_bulanan"
                      type="number"
                      value={nisabForm.nisab_bulanan}
                      onChange={(e) => setNisabForm({ ...nisabForm, nisab_bulanan: Number(e.target.value) || 0 })}
                      className="font-mono font-bold text-emerald-700"
                      required
                    />
                    <p className="text-[11px] text-zinc-400">Standar 2026: Rp 7.640.144 / bulan</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nisab_tahunan">Nisab Harta / Tahunan (Rp)</Label>
                    <Input
                      id="nisab_tahunan"
                      type="number"
                      value={nisabForm.nisab_tahunan}
                      onChange={(e) => setNisabForm({ ...nisabForm, nisab_tahunan: Number(e.target.value) || 0 })}
                      className="font-mono font-bold text-emerald-700"
                      required
                    />
                    <p className="text-[11px] text-zinc-400">Standar 2026: Rp 91.681.728 / tahun</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tarif_persen">Tarif Zakat Syar&apos;i (%)</Label>
                    <Input
                      id="tarif_persen"
                      type="number"
                      step="0.1"
                      value={nisabForm.tarif_persen}
                      onChange={(e) => setNisabForm({ ...nisabForm, tarif_persen: Number(e.target.value) || 2.5 })}
                      className="font-mono"
                      required
                    />
                    <p className="text-[11px] text-zinc-400">Ketentuan syariat: 2.5%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="harga_emas_acuan">Harga Emas Acuan BAZNAS per Gram (Rp)</Label>
                    <Input
                      id="harga_emas_acuan"
                      type="number"
                      value={nisabForm.harga_emas_acuan_per_gram || ""}
                      onChange={(e) => setNisabForm({ ...nisabForm, harga_emas_acuan_per_gram: Number(e.target.value) || 0 })}
                      className="font-mono"
                      placeholder="Contoh: 1078608"
                    />
                    <p className="text-[11px] text-zinc-400">Rata-rata acuan emas 14 karat yang dihitung BAZNAS</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keterangan_nisab">Keterangan Tambahan untuk Donatur</Label>
                    <Input
                      id="keterangan_nisab"
                      type="text"
                      value={nisabForm.keterangan || ""}
                      onChange={(e) => setNisabForm({ ...nisabForm, keterangan: e.target.value })}
                      placeholder="Standar resmi nisab zakat BAZNAS RI"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Terakhir disimpan: {nisabForm.terakhir_diperbarui || "Belum ada catatan"}
              </span>
              <Button
                type="submit"
                disabled={isSubmittingNisab}
                className="bg-emerald-700 hover:bg-emerald-800 text-white min-w-[200px] shadow-sm font-bold"
              >
                {isSubmittingNisab ? "Menyimpan..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Ketetapan BAZNAS
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
