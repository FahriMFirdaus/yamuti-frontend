"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal, CheckCircle2, XCircle, CalendarClock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSession } from "next-auth/react";

type Kunjungan = {
  id: string;
  nama_tamu: string;
  no_whatsapp: string;
  jumlah_pengunjung: number;
  maksud: string;
  tujuan?: string;
  slot_waktu: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  created_at: string;
};

export default function KunjunganPage() {
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null);
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | "COMPLETE" | null>(null);

  const fetchKunjungan = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      let token = session?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("token") : null);

      const res = await fetch("http://localhost:8000/api/kunjungan?per_page=100", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setKunjunganList(json.data?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKunjungan();
  }, []);

  const filteredData = kunjunganList.filter(k => 
    k.nama_tamu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.no_whatsapp?.includes(searchQuery)
  );

  const totalMenunggu = kunjunganList.filter(k => k.status === "PENDING").length;
  const totalDisetujui = kunjunganList.filter(k => k.status === "APPROVED").length;
  const totalSelesai = kunjunganList.filter(k => k.status === "COMPLETED").length;
  const totalDitolak = kunjunganList.filter(k => k.status === "REJECTED").length;

  const handleActionClick = (kunjungan: Kunjungan, type: "APPROVE" | "REJECT" | "COMPLETE") => {
    setSelectedKunjungan(kunjungan);
    setModalType(type);
  };

  const confirmAction = async () => {
    if (!selectedKunjungan || !modalType) return;
    
    let statusPayload = "";
    if (modalType === "APPROVE") statusPayload = "APPROVED";
    if (modalType === "REJECT") statusPayload = "REJECTED";
    if (modalType === "COMPLETE") statusPayload = "COMPLETED";

    try {
      const session = await getSession();
      let token = session?.accessToken || localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/api/kunjungan/${selectedKunjungan.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusPayload })
      });

      if (!res.ok) throw new Error("Gagal memperbarui status kunjungan");
      
      alert(`Status kunjungan berhasil diperbarui menjadi ${statusPayload}`);
      fetchKunjungan();
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat memperbarui status kunjungan.");
    } finally {
      setModalType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Manajemen Kunjungan Tamu
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Atur dan verifikasi jadwal kedatangan donatur ke panti asuhan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
        <Card className="bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Menunggu</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{totalMenunggu} Jadwal</h3>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-green-600 dark:text-green-500">Disetujui (Akan Datang)</p>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">{totalDisetujui} Tamu</h3>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-500">Selesai / Terlaksana</p>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2">{totalSelesai} Tamu</h3>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-600 dark:text-red-500">Ditolak / Batal</p>
            <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">{totalDitolak} Tamu</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama atau nomor WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="w-[15%] pl-6 font-semibold">Status</TableHead>
                <TableHead className="w-[20%] font-semibold">Nama / Kontak</TableHead>
                <TableHead className="w-[40%] font-semibold">Maksud Kunjungan</TableHead>
                <TableHead className="w-[15%] font-semibold">Waktu Booking</TableHead>
                <TableHead className="w-[10%] text-center font-semibold pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-10 text-zinc-500">Memuat data kunjungan...</TableCell>
                 </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="text-center py-10 text-zinc-500">Tidak ada jadwal kunjungan.</TableCell>
                 </TableRow>
              ) : (
                filteredData.map((kunjungan) => (
                <TableRow key={kunjungan.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="pl-6 align-top pt-5">
                    {kunjungan.status === "APPROVED" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 flex items-center w-max gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Disetujui
                      </Badge>
                    )}
                    {kunjungan.status === "PENDING" && (
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0 flex items-center w-max gap-1">
                        <CalendarClock className="w-3 h-3" /> Menunggu
                      </Badge>
                    )}
                    {kunjungan.status === "REJECTED" && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 flex items-center w-max gap-1">
                        <XCircle className="w-3 h-3" /> Ditolak
                      </Badge>
                    )}
                    {kunjungan.status === "COMPLETED" && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 flex items-center w-max gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="align-top pt-4">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{kunjungan.nama_tamu}</p>
                    <a href={`https://wa.me/${kunjungan.no_whatsapp.replace(/^0/, "62")}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 mt-1 hover:text-green-600 transition-colors">
                      <MessageCircle className="w-3 h-3" />
                      {kunjungan.no_whatsapp}
                    </a>
                  </TableCell>
                  <TableCell className="align-top pt-4">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 max-w-sm">
                      {kunjungan.maksud || kunjungan.tujuan || "Kunjungan Umum"}
                    </p>
                    <span className="text-xs text-zinc-500 font-medium mt-1.5 inline-block">
                      {kunjungan.jumlah_pengunjung} Orang
                    </span>
                  </TableCell>
                  <TableCell className="align-top pt-4">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(kunjungan.slot_waktu).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                    </p>
                  </TableCell>
                  <TableCell className="text-center pr-6 align-top pt-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 mx-auto items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                        <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer p-0">
                          <a href={`https://wa.me/${kunjungan.no_whatsapp.replace(/^0/, "62")}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full h-full px-2 py-1.5 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                            <MessageCircle className="mr-2 h-4 w-4 text-green-600" /> Hubungi WhatsApp
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(kunjungan.status === "PENDING" || kunjungan.status === "REJECTED") && (
                          <DropdownMenuItem onClick={() => handleActionClick(kunjungan, "APPROVE")} className="text-green-600 cursor-pointer focus:text-green-600 focus:bg-green-50">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Setujui Jadwal
                          </DropdownMenuItem>
                        )}
                        {(kunjungan.status === "PENDING" || kunjungan.status === "APPROVED") && (
                          <DropdownMenuItem onClick={() => handleActionClick(kunjungan, "REJECT")} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                            <XCircle className="mr-2 h-4 w-4" /> Tolak Jadwal
                          </DropdownMenuItem>
                        )}
                        {kunjungan.status === "APPROVED" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleActionClick(kunjungan, "COMPLETE")} className="text-blue-600 cursor-pointer focus:text-blue-600 focus:bg-blue-50">
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Tandai Selesai
                            </DropdownMenuItem>
                          </>
                        )}
                        {kunjungan.status === "COMPLETED" && (
                          <div className="px-2 py-1.5 text-xs text-zinc-500 italic text-center">
                            Kunjungan telah selesai
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Aksi Dinamis */}
      <AlertDialog open={modalType !== null} onOpenChange={(open) => !open && setModalType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={
              modalType === "REJECT" ? "text-red-600" : modalType === "COMPLETE" ? "text-blue-600" : "text-green-600"
            }>
              {modalType === "APPROVE" ? "Setujui Jadwal Kunjungan?" : 
               modalType === "REJECT" ? "Tolak Jadwal Kunjungan?" : 
               "Tandai Kunjungan Selesai?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {modalType === "APPROVE" && (
                <>Jadwal atas nama <strong className="text-zinc-900 dark:text-zinc-100">{selectedKunjungan?.nama_tamu}</strong> pada waktu <strong>{selectedKunjungan?.slot_waktu}</strong> akan disetujui. Sistem dapat otomatis mengirimkan WhatsApp notifikasi ke pemohon.</>
              )}
              {modalType === "REJECT" && (
                <>Anda akan membatalkan/menolak jadwal tamu <strong className="text-zinc-900 dark:text-zinc-100">{selectedKunjungan?.nama_tamu}</strong>. Harap pastikan Anda telah memberitahu tamu jika perlu.</>
              )}
              {modalType === "COMPLETE" && (
                <>Tandai bahwa tamu <strong className="text-zinc-900 dark:text-zinc-100">{selectedKunjungan?.nama_tamu}</strong> sudah benar-benar datang dan menyelesaikan kunjungannya di panti asuhan.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction} 
              className={
                modalType === "REJECT" ? "bg-red-600 hover:bg-red-700 text-white" : 
                modalType === "COMPLETE" ? "bg-blue-600 hover:bg-blue-700 text-white" : 
                "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {modalType === "APPROVE" ? "Ya, Setujui" : 
               modalType === "REJECT" ? "Tolak Kunjungan" : 
               "Tandai Selesai"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
