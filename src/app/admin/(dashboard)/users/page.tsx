"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, ShieldCheck, Shield, Trash2, Edit2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { getSession } from "next-auth/react";

type RoleItem = {
  id: number;
  name: string;
};

type UserAdmin = {
  id: number;
  name: string;
  email: string;
  role?: string;
  roles?: { id: number; name: string }[];
  status_pegawai?: string;
  created_at?: string;
};

const DEFAULT_USERS: UserAdmin[] = [
  {
    id: 1,
    name: "Super Administrator",
    email: "superadmin@yamuti.org",
    role: "super_admin",
    status_pegawai: "Aktif",
    roles: [{ id: 1, name: "super_admin" }],
  },
  {
    id: 4,
    name: "Siti Aminah, S.Ak",
    email: "keuangan@yamuti.org",
    role: "Admin Keuangan",
    status_pegawai: "Aktif",
    roles: [{ id: 5, name: "Admin Keuangan" }],
  },
  {
    id: 5,
    name: "Ust. Ahmad Fauzi",
    email: "asrama@yamuti.org",
    role: "Pengurus Asrama",
    status_pegawai: "Aktif",
    roles: [{ id: 6, name: "Pengurus Asrama" }],
  },
  {
    id: 6,
    name: "Budi Santoso, S.Kom",
    email: "humas@yamuti.org",
    role: "Staf Humas & Media",
    status_pegawai: "Aktif",
    roles: [{ id: 7, name: "Staf Humas & Media" }],
  },
  {
    id: 2,
    name: "Admin System",
    email: "admin@yamuti.org",
    role: "admin",
    status_pegawai: "Aktif",
    roles: [{ id: 2, name: "admin" }],
  },
];

const DEFAULT_ROLES: RoleItem[] = [
  { id: 1, name: "super_admin" },
  { id: 5, name: "Admin Keuangan" },
  { id: 6, name: "Pengurus Asrama" },
  { id: 7, name: "Staf Humas & Media" },
];

export default function UsersPage() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const [users, setUsers] = useState<UserAdmin[]>(DEFAULT_USERS);
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [saving, setSaving] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      const activeToken =
        session?.accessToken ||
        (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

      if (activeToken) setToken(activeToken);

      const headers: HeadersInit = {
        Accept: "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      };

      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${apiUrl}/admins`, { headers }),
        fetch(`${apiUrl}/roles`, { headers }),
      ]);

      if (usersRes.ok) {
        const uJson = await usersRes.json();
        setUsers(uJson.data || []);
      }
      if (rolesRes.ok) {
        const rJson = await rolesRes.json();
        setRoles(rJson.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat data pengguna/peran:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    const availableRoles = roles.filter((r) => r.name !== "super_admin");
    const defaultRole = availableRoles[0]?.name || roles[0]?.name || "Admin Keuangan";
    setFormData({
      name: "",
      email: "",
      password: "",
      role: defaultRole,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserAdmin) => {
    setEditingUser(user);
    const userRole = user.roles?.[0]?.name || user.role || "";
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: userRole,
    });
    setIsFormOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      alert("Harap lengkapi semua kolom yang wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const url = editingUser ? `${apiUrl}/admins/${editingUser.id}` : `${apiUrl}/admins`;
      const method = editingUser ? "PUT" : "POST";

      const payload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchData();
      } else {
        const errJson = await res.json();
        alert(errJson.message || "Gagal menyimpan data pengguna.");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${apiUrl}/admins/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setIsDeleteOpen(false);
        setSelectedUser(null);
        fetchData();
      } else {
        const errJson = await res.json();
        alert(errJson.message || "Gagal menghapus admin.");
      }
    } catch (err) {
      console.error("Gagal menghapus user:", err);
    }
  };

  const getRoleDisplayName = (user: UserAdmin) => {
    const rawRole = user.roles?.[0]?.name || user.role || "Staf";
    return rawRole.replace(/_/g, " ");
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const userRole = u.roles?.[0]?.name || u.role || "";
    const matchesRole = roleFilter === "ALL" || userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Manajemen Pengguna
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Daftar akun staf & pengurus yayasan yang telah diberikan peran dan akses sistem.
          </p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 w-full sm:w-auto"
          onClick={handleOpenCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Daftarkan Pengguna Baru
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="ALL">Semua Peran</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 pl-6">Profil Pengguna</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Peran (Role)</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-zinc-900 dark:text-zinc-100 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-zinc-500">
                    Memuat data pengguna...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-zinc-400 stroke-[1.5]" />
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">Belum ada akun admin tambahan.</p>
                      <p className="text-xs text-zinc-500 max-w-sm text-center">
                        Buat peran terlebih dahulu di menu <strong>Peran & Hak Akses</strong>, lalu klik <strong>Daftarkan Pengguna Baru</strong> untuk memasangkan peran kepada staf.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const roleName = getRoleDisplayName(user);
                  const isSuperAdmin = user.roles?.[0]?.name === "super_admin" || user.role === "super_admin";

                  return (
                    <TableRow key={user.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="pl-6">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isSuperAdmin ? "destructive" : "secondary"}
                          className="flex w-fit items-center gap-1 font-medium capitalize"
                        >
                          {isSuperAdmin ? <ShieldCheck className="w-3 h-3 text-white" /> : <Shield className="w-3 h-3 text-amber-500" />}
                          {roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 font-normal shadow-none text-xs">
                          {user.status_pegawai || "Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        {isSuperAdmin ? (
                          <span className="text-xs text-zinc-400 italic">Utama</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuLabel>Aksi Akun</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Edit2 className="mr-2 h-4 w-4 text-blue-600" /> Edit Peran & Akun
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus Akun
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Tambah / Edit Admin */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit Pengguna" : "Daftarkan Pengguna Baru"}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Perbarui informasi staf atau ubah peran hak aksesnya." 
                : "Buat akun staf baru dan pasangkan peran yang telah Anda buat."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nama_staf">Nama Lengkap</Label>
              <Input 
                id="nama_staf" 
                placeholder="Misal: Siti Aminah" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_staf">Email Akses</Label>
              <Input 
                id="email_staf" 
                type="email" 
                placeholder="siti.keuangan@yamuti.org" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_staf">
                {editingUser ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Awal"}
              </Label>
              <Input 
                id="password_staf" 
                type="password" 
                placeholder={editingUser ? "••••••••" : "Minimal 8 karakter"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_staf">Pilih Peran (Role)</Label>
              <select 
                id="role_staf" 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                {roles.length === 0 ? (
                  <option value="">Belum ada peran dibuat (buat peran terlebih dahulu)</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name.replace(/_/g, " ")}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[11px] text-zinc-500">
                Pilihan peran di atas diambil langsung dari menu <strong>Peran & Hak Akses</strong>.
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-red-600 text-white hover:bg-red-700">
                {saving ? "Menyimpan..." : editingUser ? "Simpan Perubahan" : "Buat Akun Staf"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Hapus Permanen */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <DialogTitle className="text-red-600">Hapus Akun Pengguna?</DialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Kredensial staf <strong>{selectedUser?.name}</strong> akan dihapus dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">
              Hapus Akun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
