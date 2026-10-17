"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ShieldCheck, Shield, KeyRound, Check, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSession } from "next-auth/react";

type PermissionItem = {
  id: number;
  name: string;
};

type RoleItem = {
  id: number;
  name: string;
  permissions: PermissionItem[];
  created_at: string;
};

const PERMISSION_GROUPS: { group: string; permissions: { key: string; label: string }[] }[] = [
  {
    group: "Anak Asuh",
    permissions: [
      { key: "anak_asuh.view", label: "Lihat Data" },
      { key: "anak_asuh.create", label: "Tambah Data" },
      { key: "anak_asuh.edit", label: "Edit Data" },
      { key: "anak_asuh.delete", label: "Hapus Data" },
    ],
  },
  {
    group: "Program / Kampanye",
    permissions: [
      { key: "program.view", label: "Lihat Program" },
      { key: "program.create", label: "Buat Program" },
      { key: "program.edit", label: "Edit Program" },
      { key: "program.delete", label: "Hapus Program" },
    ],
  },
  {
    group: "Donasi",
    permissions: [
      { key: "donasi.view", label: "Lihat Riwayat Donasi" },
      { key: "donasi.create", label: "Input Donasi Manual" },
      { key: "donasi.verify", label: "Verifikasi Donasi" },
    ],
  },
  {
    group: "Buku Kas & Keuangan",
    permissions: [
      { key: "kas.view", label: "Lihat Transaksi Kas" },
      { key: "kas.create", label: "Catat Kas Masuk/Keluar" },
      { key: "kas.edit", label: "Edit Transaksi Kas" },
      { key: "kas.delete", label: "Hapus Transaksi Kas" },
    ],
  },
  {
    group: "Inventaris Logistik",
    permissions: [
      { key: "inventaris.view", label: "Lihat Barang" },
      { key: "inventaris.create", label: "Tambah Barang" },
      { key: "inventaris.edit", label: "Edit Barang" },
      { key: "inventaris.delete", label: "Hapus Barang" },
    ],
  },
  {
    group: "Kunjungan & Pengguna",
    permissions: [
      { key: "kunjungan.view", label: "Lihat Kunjungan" },
      { key: "kunjungan.approve", label: "Setujui / Tolak Kunjungan" },
      { key: "cms.manage", label: "Kelola Artikel & Galeri" },
      { key: "users.manage", label: "Kelola Pengguna" },
      { key: "roles.manage", label: "Kelola Peran & Akses" },
    ],
  },
];

const DEFAULT_ROLES: RoleItem[] = [
  {
    id: 1,
    name: "super_admin",
    permissions: [
      { id: 1, name: "anak_asuh.view" },
      { id: 2, name: "program.view" },
      { id: 3, name: "donasi.view" },
      { id: 4, name: "kas.view" },
      { id: 5, name: "inventaris.view" },
      { id: 6, name: "cms.manage" },
    ],
    created_at: "",
  },
  {
    id: 5,
    name: "Admin Keuangan",
    permissions: [
      { id: 9, name: "donasi.view" },
      { id: 10, name: "donasi.create" },
      { id: 11, name: "donasi.verify" },
      { id: 12, name: "kas.view" },
      { id: 13, name: "kas.create" },
      { id: 14, name: "kas.edit" },
      { id: 15, name: "kas.delete" },
    ],
    created_at: "",
  },
  {
    id: 6,
    name: "Pengurus Asrama",
    permissions: [
      { id: 1, name: "anak_asuh.view" },
      { id: 2, name: "anak_asuh.create" },
      { id: 3, name: "anak_asuh.edit" },
      { id: 16, name: "kunjungan.view" },
      { id: 17, name: "kunjungan.approve" },
      { id: 18, name: "inventaris.view" },
      { id: 19, name: "inventaris.create" },
      { id: 20, name: "inventaris.edit" },
      { id: 21, name: "inventaris.delete" },
    ],
    created_at: "",
  },
  {
    id: 7,
    name: "Staf Humas & Media",
    permissions: [
      { id: 5, name: "program.view" },
      { id: 6, name: "program.create" },
      { id: 7, name: "program.edit" },
      { id: 16, name: "kunjungan.view" },
      { id: 22, name: "cms.view" },
      { id: 23, name: "cms.manage" },
    ],
    created_at: "",
  },
];

export default function RolesPage() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);

  const fetchRoles = async () => {
    try {
      const session = await getSession();
      const activeToken =
        session?.accessToken ||
        (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);

      if (activeToken) setToken(activeToken);

      const res = await fetch(`${apiUrl}/roles`, {
        headers: {
          Accept: "application/json",
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setRoles(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissions([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions.map((p) => p.name));
    setIsFormOpen(true);
  };

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const toggleGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !groupPerms.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPerms])));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setSaving(true);
    try {
      const url = editingRole ? `${apiUrl}/roles/${editingRole.id}` : `${apiUrl}/roles`;
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: roleName.trim(),
          permissions: selectedPermissions,
        }),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchRoles();
      } else {
        const errJson = await res.json();
        alert(errJson.message || "Gagal menyimpan role.");
      }
    } catch (err) {
      console.error("Error saving role:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${apiUrl}/roles/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchRoles();
      } else {
        const errJson = await res.json();
        alert(errJson.message || "Gagal menghapus role.");
      }
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Peran & Hak Akses
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola peran (roles) dan matrix izin akses (permissions) untuk staf dan pengurus yayasan.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Peran Baru
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari nama peran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Grid Kartu Peran */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-zinc-500">
            Memuat daftar peran & izin akses...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500">
            Tidak ada peran ditemukan.
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isSuperAdmin = role.name === "super_admin";
            const permCount = role.permissions?.length || 0;

            return (
              <Card key={role.id} className="border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {isSuperAdmin ? (
                          <ShieldCheck className="w-5 h-5 text-red-600" />
                        ) : (
                          <Shield className="w-5 h-5 text-amber-500" />
                        )}
                        {role.name.replace(/_/g, " ")}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {isSuperAdmin
                          ? "Akses penuh tanpa batas ke semua modul sistem."
                          : `${permCount} hak akses terkonfigurasi`}
                      </CardDescription>
                    </div>
                    <Badge variant={isSuperAdmin ? "destructive" : "secondary"}>
                      {role.name.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="rounded-md bg-zinc-50 dark:bg-zinc-900/50 p-3 text-xs text-zinc-600 dark:text-zinc-400 min-h-[70px]">
                    {isSuperAdmin ? (
                      <span className="font-medium text-red-600 dark:text-red-400">
                        Memiliki semua izin operasional yayasan.
                      </span>
                    ) : permCount > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((p) => (
                          <span key={p.id} className="rounded bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px]">
                            {p.name}
                          </span>
                        ))}
                        {permCount > 5 && (
                          <span className="text-[10px] text-zinc-400 self-center">
                            +{permCount - 5} lainnya
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="italic text-zinc-400">Belum ada izin akses khusus.</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(role)}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Konfigurasi Akses
                    </Button>
                    {!isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(role)}
                        className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Tambah / Edit Role & Permissions Matrix */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Konfigurasi Peran: ${editingRole.name}` : "Tambah Peran Baru"}
            </DialogTitle>
            <DialogDescription>
              Tentukan nama peran dan centang hak akses apa saja yang boleh dijalankan oleh staf dengan peran ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="role_name" className="text-sm font-semibold">Nama Peran / Jabatan</Label>
              <Input
                id="role_name"
                placeholder="Contoh: Admin Keuangan, Pengurus Asrama, Staf Humas"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                disabled={editingRole?.name === "super_admin"}
                required
              />
              <p className="text-xs text-zinc-500">
                Beri nama peran yang jelas sesuai tugas staf. Setelah dibuat, Anda cukup mencentang modul akses di bawah.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-red-600" /> Matrix Hak Akses (Permissions)
              </Label>

              <div className="space-y-4 border rounded-lg p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                {PERMISSION_GROUPS.map((grp) => {
                  const grpKeys = grp.permissions.map((p) => p.key);
                  const isAllChecked = grpKeys.every((k) => selectedPermissions.includes(k));

                  return (
                    <div key={grp.group} className="border-b last:border-b-0 pb-3 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                          {grp.group}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(grpKeys)}
                          className="text-[11px] text-red-600 hover:underline font-medium"
                        >
                          {isAllChecked ? "Batal Semua" : "Pilih Semua"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {grp.permissions.map((p) => {
                          const isChecked = selectedPermissions.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              onClick={() => togglePermission(p.key)}
                              className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? "border-red-500 bg-red-50/60 text-red-900 dark:bg-red-950/40 dark:text-red-200"
                                  : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isChecked ? "bg-red-600 border-red-600 text-white" : "border-zinc-300 dark:border-zinc-600"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="font-medium">{p.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                {saving ? "Menyimpan..." : "Simpan Peran & Akses"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Konfirmasi Hapus */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Peran {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pengguna yang memiliki peran ini akan kehilangan hak akses yang terhubung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
              Hapus Peran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
