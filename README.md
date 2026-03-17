# 📄 Dokumen Fitur & Alur Pengguna Aplikasi moklet.org

Dokumen ini merangkum seluruh fitur utama, modul sistem, serta alur pengguna (*user journey*) yang tersedia dalam aplikasi **moklet.org**. Cakupan dokumen meliputi fitur yang digunakan oleh pengguna publik (Guest/Siswa) maupun pengguna administratif (Admin/Organisasi).

Fitur eksperimental atau rute internal untuk pengujian sistem (misalnya rute migrasi database atau endpoint debugging) tidak disertakan dalam dokumen ini.

---

# 🏗️ Arsitektur Sistem & Performa

Aplikasi **moklet.org** dibangun menggunakan pendekatan *Serverless Free Tier Stack* untuk memastikan performa tinggi, skalabilitas yang baik, serta meminimalkan kebutuhan pemeliharaan server.

## Komponen Arsitektur

### Hosting & Runtime
Aplikasi di-deploy menggunakan **Vercel**, memanfaatkan *Edge Network* dan *Serverless Functions* untuk distribusi global dengan latensi rendah.

### Database
Sistem menggunakan **Supabase PostgreSQL** sebagai basis data utama.

Koneksi database menggunakan **Supavisor IPv4 Pooling** untuk menjaga stabilitas koneksi saat terjadi lonjakan akses tanpa melebihi batas koneksi database.

### Caching & Rate Limiting
**Upstash Redis** digunakan untuk:

- Menyimpan cache dari query berat (misalnya statistik dashboard)
- Mengimplementasikan rate limiting pada form publik untuk mencegah spam  
  *(contoh: maksimal 3 pengiriman per menit per IP)*

### Rendering Strategy

Halaman publik seperti:

- Homepage
- Berita
- Organisasi

menggunakan **Incremental Static Regeneration (ISR)** dengan interval revalidasi **60 detik**.

Komponen berat seperti:

- Markdown Editor
- Chart (Recharts / ECharts)
- QR Code Generator

dimuat menggunakan **lazy loading (`next/dynamic`)** untuk menghemat bandwidth dan mempercepat waktu muat halaman.

---

# 🎯 Modul 1: Sistem Aspirasi (Pengaduan & Saran)

Modul Aspirasi menyediakan sarana digital bagi siswa untuk menyampaikan pertanyaan, kritik, keluhan, maupun ide kepada unit sekolah atau organisasi siswa secara terstruktur.

## Fitur Utama

### Target Aspirasi Dinamis

Aspirasi dapat ditujukan kepada dua kategori utama.

#### Unit Sekolah

- Hubin
- Kurikulum
- Kesiswaan
- Sarana & Prasarana
- ISO
- Tata Usaha
- Guru
- Satpam / Cleaning Service

#### Organisasi Siswa

- MPK
- OSIS
- TSBC
- PMR
- dan organisasi lainnya

---

### Mode Identitas Pengirim

Pengirim aspirasi dapat memilih:

- **Anonim** (identitas disembunyikan)
- **Terbuka** (menggunakan identitas akun)

---

### Dashboard Statistik Publik

Sistem menampilkan statistik aspirasi secara visual dalam bentuk:

- **Bar Chart** → tren aspirasi bulanan
- **Pie Chart** → distribusi aspirasi berdasarkan target

---

### Status Pelacakan Aspirasi

Setiap aspirasi memiliki status:

- Belum Dibaca
- Diproses
- Selesai
- Ditolak

---

### Tutorial Interaktif

Halaman aspirasi dilengkapi **komponen tutorial animatif** berbasis *glassmorphism UI* untuk membantu siswa memahami langkah pengisian form secara visual.

---

## Alur Pengguna

### Publik (Siswa)

1. Siswa membuka halaman beranda.
2. Sistem menampilkan komponen **AspirationTutorial**.
3. Siswa mengisi:
   - data diri (jika belum login)
   - target aspirasi
   - isi aspirasi
4. Siswa menekan tombol **Kirim**.
5. Sistem memvalidasi melalui **Upstash Redis Rate Limiter** untuk mencegah spam.

---

### Sistem Notifikasi

Setelah aspirasi berhasil dikirim:

- Sistem mengirim **notifikasi WhatsApp** menggunakan **Fonnte API** ( iki nggawe wa ku, ojok ngelamak timbang ke ban wa ku )
- Pesan dikirim ke **PIC / Leader** dari unit terkait.

---

### Admin / Leader

1. Admin login ke **Dashboard Admin → Aspirasi**
2. Admin melihat daftar aspirasi yang masuk
3. Admin membaca detail aspirasi
4. Admin memberikan tanggapan
5. Admin memperbarui status menjadi:
   - Diproses
   - Selesai
   - Ditolak

---

# 👔 Modul 2: Manajemen Struktur Organisasi

Modul ini merupakan inti dari sistem manajemen organisasi siswa yang memungkinkan pengaturan struktur kepengurusan, pembagian jabatan, serta delegasi akses.

---

## Fitur Utama

### Periode Kepengurusan

Setiap organisasi dikelola berdasarkan periode jabatan, misalnya:

- 2024/2025
- 2025/2026

Pendekatan ini memungkinkan riwayat kepengurusan tetap tersimpan tanpa mengganggu periode baru.

---

### Hierarki Level

SuperAdmin dapat membuat dan mengatur **tingkatan hierarki organisasi** menggunakan mekanisme **drag-and-drop** tanpa perlu memuat ulang halaman.

Contoh:

1. Badan Pengurus Harian
2. Divisi Kominfo
3. Staff

---

### Jabatan Kustom

Admin dapat membuat **jabatan khusus secara dinamis**, misalnya:

- Ketua Umum
- Koordinator Acara
- PIC Acoustic
- Ketua Pelaksana

Sistem memastikan bahwa dalam satu organisasi **tidak boleh terdapat lebih dari satu Leader aktif**.

---

### Penugasan Anggota Real-Time

Admin dapat menambahkan anggota dengan memasukkan **email siswa**.

Backend akan otomatis:

- membuat entitas **User**
- membuat **User_Auth**
- menetapkan **System Role**
- menghubungkan dengan organisasi dan jabatan terkait

UI akan diperbarui secara **reaktif tanpa refresh halaman**.

---

### Template Izin (Permission Template)

SuperAdmin dapat memberikan **sekumpulan hak akses sekaligus** kepada satu kelompok anggota.

Contoh:

Template **Editor Berita** diberikan kepada seluruh anggota **Divisi Jurnalistik**.

---

### Organogram Visual

Sistem menyediakan **preview bagan organisasi** dalam bentuk **visual organogram** berbasis kartu hierarki (*glass card*).

---

## Alur Manajemen Keanggotaan

1. SuperAdmin login.
2. Membuka menu **Kelola Organisasi**.
3. Memilih periode kepengurusan.
4. Membuat atau mengatur **hierarki level**.
5. Membuat **jabatan baru**.
6. Menambahkan anggota organisasi.
7. Sistem memperbarui **preview organogram secara real-time**.

---

# 📰 Modul 3: Content Management System (Berita)

Modul CMS menggantikan fungsi **mading sekolah tradisional** dengan sistem publikasi berita digital.

---

## Fitur Utama

### Rich Markdown Editor

Editor mendukung berbagai fitur:

- teks tebal
- teks miring
- heading
- daftar
- blok kode
- gambar

Editor dimuat menggunakan **lazy loading** untuk menghemat ukuran bundle.

---

### Integrasi Cloudinary

Thumbnail artikel diunggah melalui **Cloudinary Upload Preset** sehingga proses unggah gambar cepat dan stabil.

---

### Tagging & Metadata

Artikel dapat memiliki beberapa tag, misalnya:

- `#lomba`
- `#pengumuman`
- `#kegiatan`

Sistem juga otomatis membuat **Open Graph Metadata** untuk preview saat artikel dibagikan ke media sosial.

---

### Sistem Draft & Publikasi

Artikel dapat disimpan sebagai:

- **Draft (Published: false)**
- **Published**

---

## Alur Publikasi Berita

1. Anggota jurnalistik login
2. Membuka **Dashboard → Posts → Buat Berita**
3. Mengunggah thumbnail
4. Menulis isi berita
5. Menambahkan tag
6. Menyimpan artikel

Sistem melakukan **revalidasi ISR setiap 60 detik** sehingga berita baru segera muncul di halaman publik.

---

# 🔗 Modul 4: Formulir Dinamis

Modul ini berfungsi sebagai alternatif internal dari **Google Forms** yang terintegrasi dengan ekosistem moklet.org.

---

## Fitur Utama

### Form Builder

Admin dapat membuat pertanyaan dengan berbagai tipe:

- Text Input
- Radio Button
- Checkbox
- Dropdown

---

### Public Submission

Siswa dapat mengisi formulir melalui tautan publik dengan perlindungan:

- rate limiting
- batas submit

---

### Analitik & Ekspor Data

Jawaban responden dapat ditampilkan sebagai:

- grafik **ECharts**
- tabel data

Data juga dapat diekspor menjadi **Microsoft Excel**.

---

# 🚀 Modul 5: Tools Produktivitas

Selain modul utama, moklet.org juga menyediakan alat tambahan untuk kebutuhan organisasi siswa.

---

## Shortlink System

Sistem pemendek URL:
