# Aplikasi Dashboard Ternak

Aplikasi web untuk mengelola data peternakan ayam dengan fitur:
- Login authentication
- Input telur masuk
- Input hasil tetasan
- Input penjualan
- Input pengeluaran
- Dashboard dengan grafik dan filter

## Kredensial Login:

**Username:** `abah-suhar57`  
**Password:** `Kandangan2026`

## File-file:

- `login.html` - Halaman login
- `auth.js` - Script proteksi autentikasi
- `index.html` - Halaman input telur masuk
- `tetasan.html` - Halaman input hasil tetasan
- `penjualan.html` - Halaman input penjualan
- `pengeluaran.html` - Halaman input pengeluaran
- `dashboard.html` - Halaman dashboard dengan grafik
- `navbar.html` - Navigasi menu dengan tombol logout
- `google-apps-script.js` - Script untuk Google Apps Script
- `SETUP-GOOGLE-APPS-SCRIPT.md` - Panduan setup lengkap

## Cara Setup:

1. Buka `login.html` di browser sebagai halaman utama
2. Login dengan kredensial di atas
3. Baca file `SETUP-GOOGLE-APPS-SCRIPT.md` untuk panduan lengkap
4. Setup Google Spreadsheet dengan sheet yang diperlukan
5. Deploy Google Apps Script
6. Update URL di semua file HTML

## Fitur Login:

### Keamanan
- Session-based authentication menggunakan sessionStorage
- Auto-redirect ke login jika belum login
- Auto-redirect ke dashboard jika sudah login
- Tombol logout di navbar

### Proteksi Halaman
Semua halaman (kecuali login.html) dilindungi dengan auth.js yang akan:
- Cek status login saat halaman dimuat
- Redirect ke login.html jika belum login
- Menyimpan session selama browser terbuka

## Troubleshooting Dashboard Tidak Muncul:

### 1. Cek Console Browser
- Tekan F12 di browser
- Buka tab Console
- Lihat pesan error yang muncul

### 2. Kemungkinan Masalah:

**Error: "Failed to fetch"**
- URL Google Apps Script salah atau belum diganti
- Solusi: Pastikan URL sudah benar di `dashboard.html`

**Error: "Data tidak lengkap"**
- Nama sheet di spreadsheet tidak sesuai
- Solusi: Pastikan ada sheet dengan nama:
  - TELUR_MASUK
  - TETASAN
  - PENJUALAN
  - PENGELUARAN

**Dashboard kosong tapi tidak ada error**
- Belum ada data di spreadsheet
- Solusi: Input data melalui halaman Telur Masuk, Tetasan, dll

**Error CORS**
- Apps Script belum di-deploy dengan akses "Anyone"
- Solusi: Deploy ulang dengan "Who has access: Anyone"

### 3. Test Manual:

Buka URL Google Apps Script di browser:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Seharusnya menampilkan JSON seperti:
```json
{
  "telur": [[...data...]],
  "tetas": [[...data...]],
  "jual": [[...data...]],
  "keluar": [[...data...]]
}
```

Jika tidak muncul JSON, berarti ada masalah di Google Apps Script.

## Fitur:

### Responsif
- Tampilan otomatis menyesuaikan untuk HP, tablet, dan laptop

### Validasi
- Semua field wajib diisi sebelum bisa submit
- Loading indicator saat menyimpan data

### Dashboard
- Filter berdasarkan tanggal
- Grafik produksi (menetas vs terjual)
- Grafik keuangan (pemasukan vs pengeluaran)
- Grafik laba
- Card summary untuk semua data

## Jenis Ayam:
- Mardi ORI
- Bangkodi
- Bangkok x Aseel

## Support:
Jika masih ada masalah, cek:
1. Console browser (F12)
2. Google Apps Script logs (View > Logs)
3. Pastikan semua sheet sudah ada dan nama sesuai
