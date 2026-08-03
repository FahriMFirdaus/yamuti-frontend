"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, ShieldAlert, ShieldCheck, Shield, Trash2, Edit2, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type UserAdmin = {
  id: string;
  nama: string;
  email: string;
  role: "Super Admin" | "Admin Keuangan" | "Admin Konten";
  status: "Aktif" | "Nonaktif";
  lastLogin: string;
};

const MOCK_USERS: UserAdmin[] = [
  { id: "USR-001", nama: "Ferdian (Owner)", email: "ferdian@yamuti.org", role: "Super Admin", status: "Aktif", lastLogin: "Hari ini, 07:45 WIB" },
  { id: "USR-002", nama: "Siti Aminah", email: "siti.keuangan@yamuti.org", role: "Admin Keuangan", status: "Aktif", lastLogin: "Kemarin, 15:30 WIB" },
  { id: "USR-003", nama: "Budi Santoso", email: "budi.konten@yamuti.org", role: "Admin Konten", status: "Aktif", lastLogin: "3 hari yang lalu" },
  { id: "USR-004", nama: "Rina Sukma", email: "rina.magang@yamuti.org", role: "Admin Konten", status: "Nonaktif", lastLogin: "1 bulan yang lalu" },
];

export default function UsersPage() {
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isToggleStatusOpen, setIsToggleStatusOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);

  const handleToggleStatus = (user: UserAdmin) => {
    setSelectedUser(user);
    setIsToggleStatusOpen(true);
  };

  const handleDelete = (user: UserAdmin) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const getRoleBadge = (role: UserAdmin["role"]) => {
    if (role === "Super Admin") {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Super Admin</Badge>;
    }
    if (role === "Admin Keuangan") {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Keuangan</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Konten</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Kelola Akses Admin (RBAC)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Atur hak akses staf panti untuk mengelola dashboard ini.</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 w-full sm:w-auto"
          onClick={() => setIsTambahOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Daftarkan Admin Baru
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama atau email..."
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 hidden sm:block">
              <option value="ALL">Semua Peran</option>
              <option value="SUPER">Super Admin</option>
              <option value="KEUANGAN">Admin Keuangan</option>
              <option value="KONTEN">Admin Konten</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 pl-6">Profil Admin</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Hak Akses (Role)</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Terakhir Login</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-zinc-900 dark:text-zinc-100 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="pl-6">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{user.nama}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    {user.status === "Aktif" ? (
                      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 font-normal shadow-none text-xs">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="border-zinc-200 text-zinc-500 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 font-normal shadow-none text-xs">Suspended</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    {user.id !== "USR-001" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuLabel>Aksi Akun</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4 text-blue-600" /> Edit Akses
                          </DropdownMenuItem>
                          
                          {user.status === "Aktif" ? (
                            <DropdownMenuItem 
                              className="cursor-pointer text-amber-600 focus:text-amber-600"
                              onClick={() => handleToggleStatus(user)}
                            >
                              <UserX className="mr-2 h-4 w-4" /> Nonaktifkan (Suspend)
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="cursor-pointer text-green-600 focus:text-green-600"
                              onClick={() => handleToggleStatus(user)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Pulihkan Akses
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus Akun
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">Owner</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Tambah Admin */}
      <Dialog open={isTambahOpen} onOpenChange={setIsTambahOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Daftarkan Admin Baru</DialogTitle>
            <DialogDescription>
              Buat kredensial login untuk staf panti asuhan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama_staf">Nama Lengkap</Label>
              <Input id="nama_staf" placeholder="Misal: Ahmad Fauzi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_staf">Email Akses</Label>
              <Input id="email_staf" type="email" placeholder="ahmad@yamuti.org" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_staf">Password Sementara</Label>
              <Input id="password_staf" type="text" placeholder="Yamuti2026!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_staf">Hak Akses (Role)</Label>
              <select id="role_staf" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Admin Keuangan">Admin Keuangan (Akses Donasi & Laporan)</option>
                <option value="Admin Konten">Admin Konten (Akses CMS, Artikel, Galeri)</option>
                <option value="Super Admin">Super Admin (Akses Penuh)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTambahOpen(false)}>Batal</Button>
            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => setIsTambahOpen(false)}>Buat Akun</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Toggle Status */}
      <AlertDialog open={isToggleStatusOpen} onOpenChange={setIsToggleStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === "Aktif" ? "Cabut Akses Admin?" : "Pulihkan Akses Admin?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === "Aktif" 
                ? `Akun ${selectedUser?.nama} akan ditangguhkan (Suspended). Ia tidak akan bisa login ke dalam dashboard ini sampai Anda memulihkannya.`
                : `Akun ${selectedUser?.nama} akan dipulihkan. Ia akan kembali memiliki akses ke dashboard ini.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => setIsToggleStatusOpen(false)} 
              className={selectedUser?.status === "Aktif" ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {selectedUser?.status === "Aktif" ? "Ya, Nonaktifkan" : "Ya, Pulihkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Hapus Permanen */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Hapus Akun Permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Kredensial staf <strong>{selectedUser?.nama}</strong> akan dihapus selamanya dari database YAMUTI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsDeleteOpen(false)} className="bg-red-600 hover:bg-red-700 text-white">
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
