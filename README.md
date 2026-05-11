# 🌿 Abah Suhar Farm Finance

Sistem Neraca Keuangan Farm Modern — Pemasukan, Pengeluaran, Laporan & Analytics

---

## 🚀 Cara Menjalankan

### Mode Demo (Tanpa Backend)
Cukup buka `index.html` di browser. Sistem akan berjalan dengan data localStorage.

**Login:**
- Email: `abahsuhar@gmail.com`
- Password: `suharsaroh87`

---

## 🔗 Menghubungkan Google Spreadsheet

### 1. Buat Google Spreadsheet
- Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru

### 2. Setup Apps Script
- Klik **Extensions > Apps Script**
- Hapus kode default, paste isi file `google-apps-script/Code.gs`
- Klik **Save** 

### 3. Inisialisasi Spreadsheet
- Di Apps Script, jalankan fungsi `setupSpreadsheet()`
- Ini akan membuat semua sheet dan data awal

### 4. Deploy sebagai Web App
- Klik **Deploy > New Deployment**
- Type: **Web App**
- Execute as: **Me**
- Who has access: **Anyone**
- Klik **Deploy** dan copy URL

### 5. Konfigurasi URL di Website
- Buka `js/api.js`
- Isi `API_URL` dengan URL deployment:
```javascript
window.APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  ...
};
```

---

## 📁 Struktur Folder

```
farm-finance/
├── index.html              # Redirect handler
├── login.html              # Halaman login
├── dashboard.html          # Dashboard utama
├── README.md
│
├── assets/
│   └── css/
│       └── main.css        # Stylesheet utama
│
├── pages/
│   ├── pemasukan.html      # Modul pemasukan
│   ├── pengeluaran.html    # Modul pengeluaran
│   ├── laporan.html        # Laporan bulanan
│   ├── usaha.html          # Sub usaha
│   └── produk.html         # Manajemen produk
│
├── js/
│   ├── api.js              # API & localStorage handler
│   ├── auth.js             # Autentikasi & session
│   ├── utils.js            # Utility functions
│   ├── dashboard.js        # Dashboard logic
│   ├── pemasukan.js        # Pemasukan CRUD
│   ├── pengeluaran.js      # Pengeluaran CRUD
│   ├── laporan.js          # Laporan generator
│   ├── usaha.js            # Sub usaha CRUD
│   └── produk.js           # Produk CRUD
│
└── google-apps-script/
    └── Code.gs             # Backend API (Google Apps Script)
```

---

## 🎯 Fitur

| Fitur | Status |
|-------|--------|
| Login & Session | ✅ |
| Dashboard Analytics | ✅ |
| 5 Grafik Chart.js | ✅ |
| CRUD Pemasukan | ✅ |
| CRUD Pengeluaran | ✅ |
| CRUD Sub Usaha | ✅ |
| CRUD Produk | ✅ |
| Laporan Laba Rugi | ✅ |
| Export Excel | ✅ |
| Export PDF | ✅ |
| Print | ✅ |
| Dark Mode | ✅ |
| Responsive Mobile | ✅ |
| Auto Refresh 30s | ✅ |
| Toast Notification | ✅ |
| Skeleton Loading | ✅ |
| Pagination | ✅ |
| Search & Filter | ✅ |
| Sort Kolom | ✅ |
| Google Sheets Backend | ✅ |

---

## 🛠️ Library yang Digunakan

- **TailwindCSS** — Styling
- **Chart.js** — Grafik analytics
- **SweetAlert2** — Dialog & konfirmasi
- **SheetJS (XLSX)** — Export Excel
- **jsPDF + AutoTable** — Export PDF
- **Font Awesome** — Icons
- **Animate.css** — Animasi

---

## 🌐 Deploy ke Hosting

### Vercel / Netlify / GitHub Pages
Sistem ini adalah static website murni (HTML + CSS + JS).
Cukup upload seluruh folder `farm-finance/` ke hosting pilihan.

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/farm-finance.git
git push -u origin main
# Aktifkan GitHub Pages di Settings > Pages
```

---

## 📊 Sheet Spreadsheet

| Sheet | Kolom |
|-------|-------|
| USERS | id, email, password, role, name |
| PEMASUKAN | id, tanggal, sub_usaha, produk, qty, harga, total, pembeli, catatan |
| PENGELUARAN | id, tanggal, sub_usaha, kategori, nominal, deskripsi |
| SUB_USAHA | id, nama_usaha, deskripsi |
| PRODUK | id, nama, satuan, harga_default |

---

## 🔒 Keamanan

- Session disimpan di localStorage dengan expiry time
- Input disanitasi sebelum disimpan
- Proteksi halaman dashboard (redirect ke login jika belum login)
- Session otomatis expired setelah 8 jam (atau 30 hari jika "Ingat Saya")

---

*Abah Suhar Farm Finance v1.0.0*
