# RPH KAFA (Jawi / Rumi) — Versi 2 (2 Mod Berasingan)

Aplikasi web interaktif moden untuk memudahkan guru **KAFA (Kelas Al-Quran dan Fardhu Ain)** menyediakan rancangan pengajaran dan mengisi harian dengan pantas dalam dwitulisan (tulisan Jawi dan Rumi), lengkap dengan penjanaan PDF A4 mengikut format tapak asal.

---

## 🌟 Konsep Teras: 2 Mod Berasingan Sepenuhnya

Aplikasi ini dipisahkan kepada **DUA mod khusus** untuk menjimatkan masa guru dan mengelakkan percampuran fungsi:

### 🅰️ 1. Mod Editor (`/editor`) — Sedia Templat Kandungan RPH
Digunakan semasa **merancang pengajaran** (biasanya seminggu sekali atau sebelum kelas):
- Taip / kemaskini nama **Tajuk & Subtajuk** (kod dan teks).
- Pilih atau **tambah entri baharu (+ Tambah Baharu)** ke senarai master:
  - **Mata Pelajaran**: Al-Quran, Jawi, Adab, Fardhu Ain, Sirah, Bahasa Arab, Akhlak *(atau tambah subjek baharu)*.
  - **Bidang**: *(Muncul automatik HANYA jika Mata Pelajaran = Al-Quran)* seperti Tilawah, Tajwid, Hafazan, Tasmi', Fasih *(atau tambah bidang baharu)*.
  - **Tahun**: 1–6 *(atau tambah tahun baharu)*.
  - **Kelas**: Umar, Bilal, Uthman, Ali *(atau tambah kelas baharu seperti Umar 2, dll.)*.
- Taip Objektif Pembelajaran & Aktiviti Murid secara dinamik (tambah baris bebas).
- **TIADA** kotak semak kemahiran dan nombor refleksi di sini.
- Simpan sebagai rekod templat untuk digunakan bila-bila masa.

---

### 🅱️ 2. Mod Tick (`/tick` atau `/isi`) — Pengisian Harian Pantas
Digunakan **setiap hari atau selepas kelas** (sangat mesra telefon pintar & pantas):
- Guru memilih rekod RPH yang telah disediakan dalam Mod Editor.
- Semua medan templat (Tajuk, Subtajuk, Subjek, Bidang, Objektif, Aktiviti) dipaparkan sebagai **READ-ONLY** (dikunci dan tidak boleh diubah di sini).
- Guru **HANYA** perlu mengisi 3 perkara:
  1. ✅ **Tick** Kemahiran: Lisan / Bertulis / Pemerhatian.
  2. ✅ **Taip nombor** Refleksi: Murid Menguasai, Belum Menguasai, dan Jumlah Murid.
  3. ✅ **Taip satu medan teks bebas**: **"Tindakan Susulan / Catatan Guru"** (ulasan harian situasi kelas).
- Tekan **"Jana & Muat Turun PDF"** untuk muat turun dokumen A4 rasmi.

---

### 📋 3. Halaman Senarai RPH (`/senarai`)
- Senarai semua rekod RPH tersimpan dengan carian (tajuk, subjek, kelas) dan penapis status (🟡 *Belum Diisi Harian* vs 🟢 *Lengkap*).
- Butang tindakan segera: **Isi Harian (Tick)**, **Edit Templat**, **Salin/Duplikasi**, dan **Padam**.

---

## 🛠️ Penambahbaikan PDF v2

1. **Pembaikan Ruangan Bidang (No "-" dash)**:
   - Jika mata pelajaran bukan Al-Quran, ruangan Bidang tidak dirender langsung dalam dokumen (tiada sebarang dash atau placeholder yang tersangkut).
2. **Mampatkan Spacing A4**:
   - Susun atur jadual dimampatkan secara seimbang supaya muat dengan kemas pada kertas A4 Portrait tanpa ruang kosong berlebihan di bahagian bawah.
3. **Nama Sekolah**:
   - Disediakan ruangan nama sekolah di bahagian atas kepala dokumen RPH.
4. **Kotak Semak & Refleksi**:
   - Kemahiran terpapar sebagai tanda **☑** (jika dipilih) atau **☐** (jika tidak dipilih).
   - Penunjuk warna hijau/merah bagi nisbah murid menguasai.
   - Format nama fail automatik: `RPH_{tajuk.kod}_{tarikh}.pdf`.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Jalankan Server Pembangunan (Development)
```bash
npm run dev
```
Buka pelayar web pada alamat `http://localhost:5173`.

### 2. Jalankan Ujian Integriti
```bash
npm test
```

### 3. Kompilasi Pengeluaran (Build)
```bash
npm run build
```

---

## 📁 Struktur Fail Konfigurasi & Kod

- `src/config/labels.json` — Kamus label dwitulisan Jawi & Rumi (boleh disunting terus tanpa ubah kod).
- `src/config/options.ts` — Nilai lalai senarai master dan rekod contoh awal.
- `src/utils/storage.ts` — Pengurusan storan `localStorage` untuk rekod RPH dan senarai master.
- `src/components/Navbar.tsx` — Bar navigasi atas (desktop) dan bar bawah (telefon) antara 3 halaman.
- `src/components/EditorView.tsx` — Halaman Mod Editor (sedia templat & tambah master item).
- `src/components/RphListView.tsx` — Halaman Senarai RPH (carian, penapis, salin, padam).
- `src/components/TickView.tsx` — Halaman Mod Tick (read-only + tick kemahiran + refleksi + tindakan susulan).
- `src/components/RphPreview.tsx` — Pratonton dan penjanaan dokumen A4 rasmi.
- `src/components/MasterListModal.tsx` — Dialog pengurusan senarai master.
