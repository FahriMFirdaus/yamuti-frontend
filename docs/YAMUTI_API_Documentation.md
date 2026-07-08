# YAMUTI REST API Documentation
*Base URL (Production)*: `https://yamuti-backend.onrender.com/api`
*Base URL (Local)*: `http://localhost:8000/api`

Dokumentasi ini ditujukan bagi Tim Frontend. Seluruh *endpoint* mengembalikan *response* berformat JSON. Sebagian besar *endpoint* untuk Admin memerlukan Autentikasi menggunakan *Bearer Token* (Sanctum).

---

## 1. Authentication (`/auth`)

### Register (Publik)
- **Endpoint:** `POST /auth/register`
- **Body:** `name`, `email`, `password`, `password_confirmation`, `no_hp` (opsional), `nik` (opsional), `alamat` (opsional).

### Login
- **Endpoint:** `POST /auth/login`
- **Body:**
  ```json
  {
    "email": "admin@yamuti.org",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "user": {
        "id": 1,
        "name": "Super Administrator",
        "email": "admin@yamuti.org",
        "role": "super_admin",
        "nik": "1234567890",
        "no_hp": "081234567890"
      },
      "token": "1|xxxxxxxxx"
    }
  }
  ```
*(Catatan: Properti `role` secara otomatis dilampirkan agar Frontend dapat mengelola hak akses UI).*

### Get Current User
- **Endpoint:** `GET /auth/me`
- **Headers:** `Authorization: Bearer <token>`

### Logout
- **Endpoint:** `POST /auth/logout`
- **Headers:** `Authorization: Bearer <token>`

### Lupa Password & Reset Password
- **POST** `/auth/forgot-password` (Body: `email`)
- **POST** `/auth/reset-password` (Body: `email`, `token`, `password`, `password_confirmation`)

### Kelola Profil Mandiri (User Login)
- **GET** `/profile` (Mendapatkan detail profil)
- **PUT** `/profile` (Mengupdate `name` atau `no_hp`)
- **PUT** `/profile/password` (Mengupdate password menggunakan `current_password`, `password`, dan `password_confirmation`)
- **GET** `/user/riwayat-donasi` (Mendapatkan riwayat donasi milik user yang sedang login)
- **GET** `/user/riwayat-kunjungan` (Mendapatkan riwayat kunjungan berdasarkan nomor HP user)

---

## 2. Dashboard (`/dashboard`)

### Summary Dashboard (Admin & Owner)
- **Endpoint:** `GET /dashboard/summary`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Mengembalikan total anak asuh, total donasi bulan ini, kunjungan menunggu, dan saldo kas terkini.

---

## 3. Manajemen Admin (`/admins`)

### Kelola Akses Admin & Owner (Owner Only)
- **GET** `/admins` (List data)
- **POST** `/admins` (Tambah admin baru, sertakan `role`)
- **GET** `/admins/{id}` (Detail admin)
- **PUT** `/admins/{id}` (Update admin & role)
- **DELETE** `/admins/{id}` (Hapus admin)

---

## 4. Anak Asuh (`/anak-asuh`)

**Headers:** `Authorization: Bearer <token>`

### Kelola Data Anak Asuh
- **GET** `/anak-asuh` (Daftar anak asuh, dukung paginasi `?per_page=15`)
- **POST** `/anak-asuh` (Tambah anak asuh, format JSON dengan `nama`, `no_kk`, `no_akte`, `tempat_lahir`, `jenis_kelamin`, `tanggal_lahir`)
- **GET** `/anak-asuh/{id}` (Detail)
- **PUT** `/anak-asuh/{id}` (Update)
- **DELETE** `/anak-asuh/{id}` (Hapus)

---

## 5. Kampanye Crowdfunding (`/kampanye`)

### Daftar Kampanye (Public)
- **Endpoint:** `GET /kampanye`
- **Query Params:** `?status=Aktif`, `?per_page=15`
- **Response:** Mengembalikan daftar kampanye lengkap dengan total donasi terkumpul.

### Detail Kampanye (Public)
- **Endpoint:** `GET /kampanye/{id}` (bisa menggunakan `id` atau `slug`)

### Kelola Kampanye (Admin Only)
**Headers:** `Authorization: Bearer <token>`
- **POST** `/kampanye` (Format `multipart/form-data` untuk mendukung upload `thumbnail`)
- **PUT** `/kampanye/{id}` (Update detail kampanye)
- **DELETE** `/kampanye/{id}` (Hapus kampanye)

---

## 6. Donasi & Keuangan (`/donasi` & `/keuangan`)

### Buat Donasi Baru (Public - Tidak Butuh Token)
- **Endpoint:** `POST /donasi`
- **Body:** `nama_donatur`, `no_whatsapp`, `gross_amount` (nominal donasi), `kampanye_id` (opsional: jika berdonasi untuk kampanye tertentu).
- **Response:** Mengembalikan `snap_token` dan `payment_url` (Midtrans).

### Manajemen Donasi (Admin)
- **GET** `/donasi` (Riwayat/List)
- **PATCH** `/donasi/{id}/verify` (Admin memverifikasi bukti donasi manual atau mengubah status menjadi PAID).

### Laporan Keuangan & Kas
- **GET** `/transaksi-keuangan` (Riwayat Transaksi)
- **POST** `/transaksi-keuangan` (Tambah Pemasukan/Pengeluaran Kas)
- **GET** `/keuangan/laporan` (Filter berdasarkan `?bulan=06&tahun=2026&jenis=pemasukan`)

---

## 7. Kunjungan / Tamu (`/kunjungan`)

### Ajukan Kunjungan Baru (Public)
- **Endpoint:** `POST /kunjungan`
- **Body:** `nama_tamu`, `no_whatsapp`, `jumlah_pengunjung`, `maksud`, `slot_waktu` (Format: YYYY-MM-DD HH:MM:SS).

### Kelola Jadwal Kunjungan (Admin Only)
**Headers:** `Authorization: Bearer <token>`
- **Endpoint:** `GET /kunjungan` (Melihat seluruh daftar antrean kunjungan)
- **Endpoint:** `GET /kunjungan/{id}` (Melihat detail permintaan kunjungan spesifik)
- **Endpoint:** `PATCH /kunjungan/{id}/status`
- **Body Update Status:**
  ```json
  {
    "status": "APPROVED" // atau "REJECTED", "COMPLETED"
  }
  ```

---

## 8. Logistik & Inventaris (`/inventaris`)

### Kelola Barang
**Headers:** `Authorization: Bearer <token>`
- **GET** `/inventaris`
- **POST** `/inventaris` (Tambah master barang)
- **GET / PUT / DELETE** `/inventaris/{id}`

### Mutasi Barang Keluar/Masuk
- **Endpoint:** `POST /mutasi-barang`
- **Body:** `inventaris_id`, `tipe` (masuk/keluar/rusak), `jumlah`, `keterangan`.
- *(Catatan: Mutasi keluar otomatis akan mengurangi stok dan mencetak Event pengeluaran kas jika ada harganya).*

---

## 9. Broadcast & Artikel CMS

### Broadcast WhatsApp / Email
- **Endpoint:** `POST /broadcast/send`
- **Body:**
  ```json
  {
    "pesan": "Isi pesan notifikasi...",
    "target_penerima": "donatur" // donatur, umum, semua
  }
  ```

### Artikel CMS & Galeri
- **GET / POST** `/artikel` (Body `multipart/form-data`: `judul`, `konten`, `kategori_id` (UUID), `thumbnail`)
- **GET / PUT / DELETE** `/artikel/{id}`
- **GET / POST / DELETE** `/kategori-artikel`
- **GET / POST** `/galeri` (Dukung format `multipart/form-data`)

---

## Format Response Error Global
Jika terjadi *error* atau validasi *frontend* gagal, *backend* akan merespons dengan struktur kode `422 Unprocessable Entity`:
```json
{
  "success": false,
  "message": "Validasi Gagal",
  "data": {
    "gross_amount": [
      "The gross amount field is required."
    ],
    "no_whatsapp": [
      "Nomor WhatsApp tidak valid."
    ]
  }
}
```
