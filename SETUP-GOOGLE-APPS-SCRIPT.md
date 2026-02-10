# Setup Google Apps Script untuk Dashboard

## Langkah-langkah:

### 1. Buka Google Spreadsheet Anda

### 2. Buat Sheet dengan nama yang sesuai:
- `TELUR_MASUK` - untuk data telur masuk
- `TETASAN` - untuk data hasil tetasan
- `PENJUALAN` - untuk data penjualan
- `PENGELUARAN` - untuk data pengeluaran

### 3. Buat Header di setiap sheet:

**TELUR_MASUK:**
| Tanggal | Jumlah | Jenis | Keterangan |

**TETASAN:**
| Tanggal | Menetas | Jenis | Gagal | Keterangan |

**PENJUALAN:**
| Tanggal | Jumlah | Jenis | Produk | Harga | Total |

**PENGELUARAN:**
| Tanggal | Keperluan | Nominal |

### 4. Buka Apps Script Editor:
- Klik menu **Extensions** > **Apps Script**

### 5. Copy Script:
- Hapus semua kode yang ada
- Copy semua kode dari file `google-apps-script.js`
- Paste ke Apps Script Editor

### 6. Deploy sebagai Web App:
1. Klik tombol **Deploy** > **New deployment**
2. Klik icon ⚙️ (gear) di sebelah "Select type"
3. Pilih **Web app**
4. Isi konfigurasi:
   - **Description:** Dashboard Ternak (opsional)
   - **Execute as:** Me (email Anda)
   - **Who has access:** Anyone
5. Klik **Deploy**
6. Klik **Authorize access**
7. Pilih akun Google Anda
8. Klik **Advanced** > **Go to [Project Name] (unsafe)**
9. Klik **Allow**
10. **Copy URL Web App** yang muncul

### 7. Update URL di semua file HTML:
Ganti URL ini di file:
- `index.html`
- `tetasan.html`
- `penjualan.html`
- `pengeluaran.html`
- `dashboard.html`

Cari baris:
```javascript
const URL = "https://script.google.com/macros/s/AKfycbyP2sIYSWEuYipv_hqMru_pIaoYJ9bG_RoZfCMormsy4NJp0ZgVDJs-HOxGbN91Q5FD9Q/exec";
```

Ganti dengan URL Web App yang baru Anda copy.

### 8. Test Dashboard:
- Buka `dashboard.html` di browser
- Dashboard seharusnya menampilkan data dari spreadsheet

## Troubleshooting:

### Dashboard tidak muncul data:
1. Buka Console Browser (F12)
2. Lihat tab **Console** untuk error
3. Pastikan nama sheet sudah benar (case-sensitive)
4. Pastikan URL sudah diganti di semua file
5. Pastikan ada data di spreadsheet (minimal 1 baris selain header)

### Error "Script function not found":
- Pastikan script sudah di-save di Apps Script Editor
- Deploy ulang web app

### Error CORS:
- Pastikan "Who has access" di-set ke "Anyone"
- Deploy ulang web app dengan versi baru

## Catatan:
- Setiap kali mengubah script, Anda perlu deploy ulang sebagai **New deployment** atau **Manage deployments** > pilih deployment > **Edit** > **Version: New version** > **Deploy**
- URL akan tetap sama jika Anda update deployment yang sudah ada
