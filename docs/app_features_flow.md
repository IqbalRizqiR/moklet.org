# Dokumen Fitur & Alur Pengguna (User Flow) Aplikasi moklet.org

Dokumen ini merangkum seluruh fitur, modul, dan alur pengguna (user journey) yang ada dalam aplikasi **moklet.org**, baik dari sisi publik (Guest/Student) maupun sisi administratif (Admin/Organisasi). Fitur-fitur eksperimental atau API testing (seperti rute migrasi database internal) tidak disertakan.

---

## 🏗️ Arsitektur & Performa Inti
Aplikasi ini berjalan di atas *Serverless Free Tier Stack*:
- **Hosting**: Vercel (Edge Network & Serverless Functions).
- **Database**: Supabase PostgreSQL menggunakan koneksi Pooling (Supavisor IPv4) agar tahan concurrency tinggi tanpa membebani batas koneksi database.
- **Caching & Rate Limiting**: Upstash Redis digunakan dengan *wrapper* khusus untuk menyimpan *query* berat (seperti statistik dashboard) dan membatasi frekuensi *submit* form (3x/menit) demi mencegah serangan spam.
- **Rendering**: Incremental Static Regeneration (ISR) dengan revalidasi 60 detik di halaman publik (Homepage, Berita, Organisasi) dan *lazy loading* komponen berat (Markdown Editor, Chart Recharts & Echarts, QR Code) menggunakan `next/dynamic`.

---

## 🎯 Modul 1: Sistem Aspirasi (Pengaduan & Saran)

Sistem interaktif bagi siswa/i untuk menyuarakan pertanyaan, keluhan, atau ide yang ditujukan ke pihak spesifik di sekolah atau organisasi siswa.

### Fitur Tersedia
- **Target Dinamis**: Aspirasi dapat ditujukan ke `Unit Sekolah` (Hubin, Kurikulum, Kesiswaan, Sarpras, ISO, TU, Guru, Satpam/CS) atau `Organisasi` (MPK, OSIS, TSBC, PMR, dll).
- **Publikasi Anonim atau Terbuka**: Siswa bisa memilih untuk merahasiakan nama (*Anonymous*) atau menggunakan identitas login.
- **Dashboard Statistik Publik**: Menampilkan tren aspirasi bulanan dan distribusi aspirasi per target secara *real-time* dengan membedakan warna dan grafik (*Bar Chart & Pie Chart*).
- **Status Tracking**: Aspirasi memiliki status `Belum Dibaca`, `Diproses`, `Selesai`, `Ditolak`.
- **Tutorial Animatif**: Komponen panduan mikro-animasi (*glassmorphism*) di halaman utama untuk mengedukasi siswa cara mengisi form aspirasi langkah demi langkah.

### Alur Pengguna (Scratch Flow) Publik & Admin
1. **[Publik]** Siswa membuka halaman Beranda. Disambut dengan `AspirationTutorial` yang elegan.
2. **[Publik]** Siswa mengisi data diri (jika tidak login), memilih "Unit Sekolah" atau "Badan Organisasi", mengetikkan aspirasi, dan menekan Kirim. Input dicegat oleh Upstash Redis Rate Limiter; jika spam, ditolak.
3. **[Notifikasi]** Sistem otomatis menembak pesan WhatsApp via Fonnte API ke PIC (Leader) dari target terkait agar bisa segera ditindaklanjuti.
4. **[Admin]** Leader organisasi/guru login ke Dashboard Admin > Aspirasi. Mereka melihat daftar keluhan yang belum dibaca masuk.
5. **[Admin]** Admin membaca detail aspirasi, menurunkan instruksi/tanggapan, dan merubah status menjadi `Diproses` atau `Selesai`.

---

## 👔 Modul 2: Struktur Organisasi (Organization Management)

Modul ini adalah *core* untuk pengaturan akses multi-organisasi dan pendelegasian wewenang lintas divisi atau angkatan.

### Fitur Tersedia
- **Periode Kepengurusan**: Organisasi dipecah berdasarkan masa jabatan (misal: 2024/2025, 2025/2026).
- **Manajemen Level (Hierarchy)**: SuperAdmin dapat menyeret-dan-melepas (*drag-and-drop*) urutan tingkatan hierarki (misal. 1 = MPK Inti, 2 = Divisi Kominfo, 3 = Staff) tanpa perlu mereload halaman web.
- **Custom Roles (Jabatan Kustom)**: Pembuatan nama jabatan apa saja secara dinamis (misal: PIC Acoustic, Ketua Pelaksana, Koordinator) yang ditautkan ke Level Tertentu dan divalidasi tidak boleh ada 2 Leader dalam 1 organisasi.
- **Penugasan Anggota Real-Time**: Integrasi UI tanpa *refresh*. Admin dapat mendaftarkan siswa baru. Sistem **otomatis** akan membuat kredensial sinkronisasi (*User_Auth*) dan menge-set *System Role* (bukan hanya *Guest*) mencocokkan asal organisasi.
- **Template Izin (Permission Templates)**: Fitur memberikan sekumpulan *Role Access* sekaligus ke satu angkatan (Contoh: "Beri Template Editor Berita untuk seluruh Divisi Jurnalistik").
- **Organogram Visual**: Pratinjau susunan struktur yang mengelompokkan siswa ke dalam pil-pil hierarki (*glass-card*) layaknya bagan organisasi.

### Alur Pengguna (Scratch Flow) Manajemen Keanggotaan
1. **[SuperAdmin]** Login dan masuk ke menu kelola Organisasi untuk periode `2025/2026`.
2. **[SuperAdmin]** Membuat Hierarki Level (contoh: "Badan Pengurus Harian"). Jika dirasa kurang naik jabatannya, mereka men-drag level tersebut ke urutan paling atas.
3. **[SuperAdmin]** Membuat Jabatan Baru (contoh: "Ketua Umum OSIS") dan mencentang opsi "Leader". Sistem memastikan belum ada leader lain sebelumnya.
4. **[SuperAdmin]** Mendaftarkan email siswa. Sistem di *backend* menciptakan relasi `User`, menyetel *Enum Role System*, membuat `User_Auth`, dan menautkan jabatan.
5. **[Sistem]** UI langsung *update* (reaktif) menambahkan daftar ke dalam tabel, dan *Preview Organogram* secara otomatis menggambar ulang pohon jabatannya.

---

## 📰 Modul 3: Content Management System (Berita & Informasi)

Menggantikan fungsi web mading tradisional dengan fitur modern pembuatan artikel bagi ekskul jurnalistik atau pengumuman resmi sekolah.

### Fitur Tersedia
- **Rich Markdown Editor**: Editor penulisan super lengkap (cetak tebal, miring, sisip kode, lampirkan gambar) yang bersifat *lazy-load* (di-load hanya ketika akan mengetik berita sehingga menghemat ratusan Kilobytes data internet).
- **Thumbnail Cloudinary Integrator**: Unggah gambar sampul artikel ditangani oleh layanan Cloudinary (memakai *Upload Preset* khusus) yang sangat cepat.
- **Tagging & Metadata**: Kategorisasi artikel dengan multitag (#lomba, #pengumuman). Dan fitur otomatisasi generasi meta *og-image* untuk *sharing preview* ke media sosial (WhatsApp/Instagram).
- **Approval Flow**: Draft berita bisa disimpan secara privat (Published: False) hingga disetujui untuk rilis publik.

### Alur Pengguna (Scratch Flow) Rilis Berita
1. **[Anggota Ekskul Jurnalistik]** Login, navigasi ke Dashboard Admin > Posts > Buat Berita.
2. **[Anggota Ekskul Jurnalistik]** Mengunggah sampul, menulis tajuk utama, dan mengetik isi laporan di Markdown Editor. Memberikan tag `Kegiatan`. Simpan.
3. **[Sistem]** Halaman Home & News Portal otomatis me-*revalidate* cache ISR setiap 60 detik; berita terbaru siap dibaca audiens secara global dan cepat tanpa *loading* abu-abu karena disokong struktur CSS transisi natural.

---

## 🔗 Modul 4: Formulir Kustom & Pendaftaran Dinamis

Berfungsi mirip Google Forms namun terintegrasi langsung dengan ekosistem Moklet; data tersimpan rapi untuk kebutuhan acara internal.

### Fitur Tersedia
- **Form Builder**: Admin merancang pertanyaan (*Text, Radio Button, Checkbox, Dropdown*).
- **Public Submission & Anti-Spam**: Siswa mengisi *link* pendaftaran dengan proteksi batas *submit* unik.
- **Analytics & Export**: Tanggapan (*responses*) disajikan dalam wujud *Echarts* (grafik) yang *lazy-loaded* dan data mentah bisa di-**Export ke Microsoft Excel** secara utuh lewat satu tombol klik.

---

## 🚀 Modul 5: Tools Produktivitas Pendukung (Link & Twibbon)

- **Sistem Shortlink Terpadu (s.moklet.org/...)**: Fitur memendekkan tautan URL yang amat panjang menjadi pendek. Dilengkapi kemampuan membangun **QR Code Stand-alone modal** yang siap di-*download* siswa untuk dipajang di poster *(QR Code library diload terpisah demi penghematan kuota)*.
- **Twibbon Generator**: Admin dapat mengunggah aset bingkai transparan berformat PNG. Siswa secara mandiri masuk ke tautan kampanye, mengunggah foto pribadinya, menyelaraskan posisi muka ke dalam bingkai (*drag, zoom*), lalu mengunduh *output* jadinya langsung dari sisi *client/browser* (tanpa membebani pemrosesan server).

---

## 🛡️ Keselamatan, Sekuriti & Sinkronisasi
- **Autentikasi NextAuth & Google Provider**: *Refresh token* dan manajemen otorisasi lewat *Identity Access Management* eksternal untuk menghindari bocor kredensial.
- **Rate Limit Upstash**: Seluruh *form* di sisi pengguna (*Guest*) dikunci dengan batasan pendaftaran (Misal: 3x form aspirasi menit/IP address) menggunakan fungsi logis Redis. 
- **Server Sent Events (SSE)**: Admin dikirim notifikasi secara seketika (*pop-up bell* bergetar) tanpa perlu *refresh* jika ada data masuk penting.

> *Seluruh aplikasi moklet.org telah memigrasikan pola desain arsitekturnya ke ranah **Free, Highly Scalable, Zero Maintainance** lepas dari rantai ketergantungan tagihan pascabayar dari layanan server awan konvensional (AWS/GCP).*
