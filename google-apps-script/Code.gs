/**
 * ============================================================
 * Abah Suhar Farm Finance - Google Apps Script Backend
 * ============================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Buka Google Spreadsheet → Extensions > Apps Script
 * 2. Paste seluruh kode ini, klik Save
 * 3. Jalankan setupSpreadsheet() sekali (pilih dari dropdown fungsi)
 * 4. Deploy > NEW DEPLOYMENT (bukan edit deployment lama!)
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL baru → paste ke js/api.js (APP_CONFIG.API_URL)
 * 
 * PENTING: Setiap kali kode diubah, buat NEW DEPLOYMENT baru
 * atau pilih "Manage Deployments > Edit" lalu klik Deploy.
 * URL lama tidak akan update otomatis!
 * ============================================================
 */

// ─── Spreadsheet Configuration ───────────────────────────────
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAMES = {
  USERS: 'USERS',
  PEMASUKAN: 'PEMASUKAN',
  PENGELUARAN: 'PENGELUARAN',
  SUB_USAHA: 'SUB_USAHA',
  PRODUK: 'PRODUK'
};

// ─── CORS Headers ─────────────────────────────────────────────
function setCORSHeaders(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── Response Helper ──────────────────────────────────────────
function jsonResponse(data) {
  return setCORSHeaders(
    ContentService.createTextOutput(JSON.stringify(data))
  );
}

function successResponse(data, message = 'Success') {
  return jsonResponse({ success: true, message, data });
}

function errorResponse(message = 'Error', code = 400) {
  return jsonResponse({ success: false, message, code });
}

// ─── GET Handler ──────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    const params = e.parameter;
    const callback = params.callback; // JSONP callback name

    let result;

    // Jika ada payload, ini adalah operasi CRUD (write via GET)
    if (params.payload) {
      try {
        const body = JSON.parse(decodeURIComponent(params.payload));
        result = _handleCRUD(action, body);
      } catch (err) {
        result = errorResponse('Payload tidak valid: ' + err.message);
      }
    } else {
      // READ operations
      switch (action) {
        case 'login':       result = handleLogin(params); break;
        case 'getPemasukan': result = handleGetPemasukan(params); break;
        case 'getPengeluaran': result = handleGetPengeluaran(params); break;
        case 'getProduk':   result = handleGetProduk(); break;
        case 'getStatistik': result = handleGetStatistik(params); break;
        default:
          result = ContentService.createTextOutput(
            JSON.stringify({ success: true, message: 'Abah Suhar Farm Finance API v1.0', status: 'running' })
          ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Jika ada JSONP callback, wrap response
    if (callback) {
      // Ambil content dari result
      let content;
      try { content = result.getContent(); } catch(e) { content = '{}'; }
      return ContentService
        .createTextOutput(callback + '(' + content + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return result;

  } catch (err) {
    const errResp = JSON.stringify({ success: false, message: 'Server error: ' + err.message });
    const cb = e.parameter?.callback;
    if (cb) {
      return ContentService.createTextOutput(cb + '(' + errResp + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(errResp).setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── CRUD Handler (dipanggil dari GET dengan payload) ─────────
function _handleCRUD(action, body) {
  switch (action) {
    case 'login':         return handleLoginPost(body);
    case 'addPemasukan':  return handleAddPemasukan(body.data);
    case 'updatePemasukan': return handleUpdatePemasukan(body.id, body.data);
    case 'deletePemasukan': return handleDeletePemasukan(body.id);
    case 'addPengeluaran':  return handleAddPengeluaran(body.data);
    case 'updatePengeluaran': return handleUpdatePengeluaran(body.id, body.data);
    case 'deletePengeluaran': return handleDeletePengeluaran(body.id);
    case 'addSubUsaha':   return handleAddSubUsaha(body.data);
    case 'updateSubUsaha': return handleUpdateSubUsaha(body.id, body.data);
    case 'deleteSubUsaha': return handleDeleteSubUsaha(body.id);
    case 'addProduk':     return handleAddProduk(body.data);
    case 'updateProduk':  return handleUpdateProduk(body.id, body.data);
    case 'deleteProduk':  return handleDeleteProduk(body.id);
    default:              return errorResponse('Unknown action: ' + action);
  }
}

// ─── POST Handler ─────────────────────────────────────────────
function doPost(e) {
  try {
    let body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    const action = body.action || '';

    switch (action) {
      case 'login':
        return handleLoginPost(body);
      case 'addPemasukan':
        return handleAddPemasukan(body.data);
      case 'updatePemasukan':
        return handleUpdatePemasukan(body.id, body.data);
      case 'deletePemasukan':
        return handleDeletePemasukan(body.id);
      case 'addPengeluaran':
        return handleAddPengeluaran(body.data);
      case 'updatePengeluaran':
        return handleUpdatePengeluaran(body.id, body.data);
      case 'deletePengeluaran':
        return handleDeletePengeluaran(body.id);
      case 'addSubUsaha':
        return handleAddSubUsaha(body.data);
      case 'updateSubUsaha':
        return handleUpdateSubUsaha(body.id, body.data);
      case 'deleteSubUsaha':
        return handleDeleteSubUsaha(body.id);
      case 'addProduk':
        return handleAddProduk(body.data);
      case 'updateProduk':
        return handleUpdateProduk(body.id, body.data);
      case 'deleteProduk':
        return handleDeleteProduk(body.id);      default:
        return errorResponse('Unknown action: ' + action);
    }
  } catch (err) {
    return errorResponse('Server error: ' + err.message, 500);
  }
}

// ============================================================
// AUTH
// ============================================================
function handleLogin(params) {
  const { email, password } = params;
  return _validateLogin(email, password);
}

function handleLoginPost(body) {
  const { email, password } = body;
  return _validateLogin(email, password);
}

function _validateLogin(email, password) {
  if (!email || !password) return errorResponse('Email dan password wajib diisi');

  const sheet = _getSheet(SHEET_NAMES.USERS);
  const data = _sheetToObjects(sheet);
  const user = data.find(u =>
    u.email?.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    return successResponse({
      email: user.email,
      role: user.role || 'admin',
      name: user.name || 'Admin',
      loginTime: new Date().toISOString()
    }, 'Login berhasil');
  }
  return errorResponse('Email atau password salah', 401);
}

// ============================================================
// PEMASUKAN
// ============================================================
function handleGetPemasukan(params) {
  const sheet = _getSheet(SHEET_NAMES.PEMASUKAN);
  let data = _sheetToObjects(sheet);

  if (params.bulan && params.tahun) {
    const prefix = `${params.tahun}-${String(params.bulan).padStart(2,'0')}`;
    data = data.filter(d => String(d.tanggal || '').startsWith(prefix));
  } else if (params.tahun) {
    data = data.filter(d => String(d.tanggal || '').startsWith(params.tahun));
  }
  if (params.sub_usaha) {
    data = data.filter(d => d.sub_usaha === params.sub_usaha);
  }

  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  return successResponse(data);
}

function handleAddPemasukan(item) {
  if (!item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PEMASUKAN);
  const id = String(item.id || _genId('pm'));
  const total = Number(item.qty || 0) * Number(item.harga || 0);
  sheet.appendRow([id, String(item.tanggal || ''), String(item.produk || ''), Number(item.qty) || 0, Number(item.harga) || 0, total, String(item.pembeli || ''), String(item.catatan || '')]);
  return successResponse({ id, total }, 'Pemasukan berhasil ditambahkan');
}

function handleUpdatePemasukan(id, item) {
  if (!id || !item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PEMASUKAN);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan: ' + id, 404);
  const total = Number(item.qty || 0) * Number(item.harga || 0);
  sheet.getRange(rowIndex, 1, 1, 8).setValues([[String(id), String(item.tanggal || ''), String(item.produk || ''), Number(item.qty) || 0, Number(item.harga) || 0, total, String(item.pembeli || ''), String(item.catatan || '')]]);
  return successResponse({ id, total }, 'Pemasukan berhasil diperbarui');
}

function handleDeletePemasukan(id) {
  if (!id) return errorResponse('ID tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PEMASUKAN);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan', 404);
  sheet.deleteRow(rowIndex);
  return successResponse(null, 'Pemasukan berhasil dihapus');
}

// ============================================================
// PENGELUARAN
// ============================================================
function handleGetPengeluaran(params) {
  const sheet = _getSheet(SHEET_NAMES.PENGELUARAN);
  let data = _sheetToObjects(sheet);

  if (params.bulan && params.tahun) {
    const prefix = `${params.tahun}-${String(params.bulan).padStart(2,'0')}`;
    data = data.filter(d => String(d.tanggal || '').startsWith(prefix));
  } else if (params.tahun) {
    data = data.filter(d => String(d.tanggal || '').startsWith(params.tahun));
  }
  if (params.sub_usaha) data = data.filter(d => d.sub_usaha === params.sub_usaha);
  if (params.kategori) data = data.filter(d => d.kategori === params.kategori);

  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  return successResponse(data);
}

function handleAddPengeluaran(item) {
  if (!item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PENGELUARAN);
  const id = String(item.id || _genId('pe'));
  sheet.appendRow([id, String(item.tanggal || ''), String(item.kategori || ''), Number(item.nominal) || 0, String(item.deskripsi || '')]);
  return successResponse({ id }, 'Pengeluaran berhasil ditambahkan');
}

function handleUpdatePengeluaran(id, item) {
  if (!id || !item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PENGELUARAN);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan: ' + id, 404);
  sheet.getRange(rowIndex, 1, 1, 5).setValues([[String(id), String(item.tanggal || ''), String(item.kategori || ''), Number(item.nominal) || 0, String(item.deskripsi || '')]]);
  return successResponse({ id }, 'Pengeluaran berhasil diperbarui');
}

function handleDeletePengeluaran(id) {
  if (!id) return errorResponse('ID tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PENGELUARAN);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan', 404);
  sheet.deleteRow(rowIndex);
  return successResponse(null, 'Pengeluaran berhasil dihapus');
}

// ============================================================
// SUB USAHA
// ============================================================
function handleGetSubUsaha() {
  const sheet = _getSheet(SHEET_NAMES.SUB_USAHA);
  return successResponse(_sheetToObjects(sheet));
}

function handleAddSubUsaha(item) {
  if (!item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.SUB_USAHA);
  const id = _genId('su');
  sheet.appendRow([id, item.nama_usaha, item.deskripsi || '']);
  return successResponse({ ...item, id }, 'Sub usaha berhasil ditambahkan');
}

function handleUpdateSubUsaha(id, item) {
  if (!id || !item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.SUB_USAHA);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan', 404);
  sheet.getRange(rowIndex, 1, 1, 3).setValues([[id, item.nama_usaha, item.deskripsi || '']]);
  return successResponse({ ...item, id }, 'Sub usaha berhasil diperbarui');
}

function handleDeleteSubUsaha(id) {
  if (!id) return errorResponse('ID tidak valid');
  const sheet = _getSheet(SHEET_NAMES.SUB_USAHA);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan', 404);
  sheet.deleteRow(rowIndex);
  return successResponse(null, 'Sub usaha berhasil dihapus');
}

// ============================================================
// PRODUK
// ============================================================
function handleGetProduk() {
  const sheet = _getSheet(SHEET_NAMES.PRODUK);
  return successResponse(_sheetToObjects(sheet));
}

function handleAddProduk(item) {
  if (!item) return errorResponse('Data tidak valid');
  if (!item.nama) return errorResponse('Nama produk wajib diisi');
  const sheet = _getSheet(SHEET_NAMES.PRODUK);
  // Gunakan ID dari client (sudah di-generate di browser)
  const id = String(item.id || _genId('p'));
  sheet.appendRow([id, String(item.nama), String(item.satuan || 'kg'), Number(item.harga_default) || 0]);
  return successResponse({ id, nama: item.nama, satuan: item.satuan, harga_default: item.harga_default }, 'Produk berhasil ditambahkan');
}

function handleUpdateProduk(id, item) {
  if (!id || !item) return errorResponse('Data tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PRODUK);
  const rowIndex = _findRowById(sheet, id);
  if (rowIndex === -1) return errorResponse('Data tidak ditemukan: ' + id, 404);
  sheet.getRange(rowIndex, 1, 1, 4).setValues([[String(id), String(item.nama), String(item.satuan || 'kg'), Number(item.harga_default) || 0]]);
  return successResponse({ id, nama: item.nama, satuan: item.satuan, harga_default: item.harga_default }, 'Produk berhasil diperbarui');
}

function handleDeleteProduk(id) {
  if (!id) return errorResponse('ID tidak valid');
  const sheet = _getSheet(SHEET_NAMES.PRODUK);
  // Hapus semua baris dengan ID ini (termasuk duplikat)
  const deleted = _deleteAllRowsById(sheet, id);
  if (deleted === 0) return errorResponse('Data tidak ditemukan (id: ' + id + ')', 404);
  return successResponse(null, deleted + ' baris produk berhasil dihapus');
}

// ============================================================
// STATISTIK
// ============================================================
function handleGetStatistik(params) {
  const pmSheet = _getSheet(SHEET_NAMES.PEMASUKAN);
  const peSheet = _getSheet(SHEET_NAMES.PENGELUARAN);
  const suSheet = _getSheet(SHEET_NAMES.SUB_USAHA);

  let pemasukan = _sheetToObjects(pmSheet);
  let pengeluaran = _sheetToObjects(peSheet);
  const subUsaha = _sheetToObjects(suSheet);

  if (params.bulan && params.tahun) {
    const prefix = `${params.tahun}-${String(params.bulan).padStart(2,'0')}`;
    pemasukan = pemasukan.filter(d => String(d.tanggal || '').startsWith(prefix));
    pengeluaran = pengeluaran.filter(d => String(d.tanggal || '').startsWith(prefix));
  }

  const totalPemasukan = pemasukan.reduce((s, d) => s + Number(d.total || 0), 0);
  const totalPengeluaran = pengeluaran.reduce((s, d) => s + Number(d.nominal || 0), 0);

  const produkMap = {};
  pemasukan.forEach(d => { produkMap[d.produk] = (produkMap[d.produk] || 0) + Number(d.total || 0); });
  const produkTerlaris = Object.entries(produkMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return successResponse({
    totalPemasukan,
    totalPengeluaran,
    labaBersih: totalPemasukan - totalPengeluaran,
    totalTransaksi: pemasukan.length + pengeluaran.length,
    produkTerlaris,
    totalSubUsaha: subUsaha.length
  });
}

// ============================================================
// SETUP SPREADSHEET
// ============================================================
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // USERS sheet
  _createOrGetSheet(ss, SHEET_NAMES.USERS, ['id', 'email', 'password', 'role', 'name']);
  const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow(['admin_1', 'abahsuhar@gmail.com', 'suharsaroh87', 'admin', 'Abah Suhar']);
  }

  // PEMASUKAN sheet
  _createOrGetSheet(ss, SHEET_NAMES.PEMASUKAN, ['id', 'tanggal', 'produk', 'qty', 'harga', 'total', 'pembeli', 'catatan']);

  // PENGELUARAN sheet
  _createOrGetSheet(ss, SHEET_NAMES.PENGELUARAN, ['id', 'tanggal', 'kategori', 'nominal', 'deskripsi']);

  // SUB_USAHA sheet
  _createOrGetSheet(ss, SHEET_NAMES.SUB_USAHA, ['id', 'nama_usaha', 'deskripsi']);
  const suSheet = ss.getSheetByName(SHEET_NAMES.SUB_USAHA);
  if (suSheet.getLastRow() <= 1) {
    suSheet.appendRow(['su1', 'Farm Utama', 'Usaha pertanian utama']);
    suSheet.appendRow(['su2', 'Kebun Lemon', 'Kebun jeruk lemon']);
    suSheet.appendRow(['su3', 'Air Pegunungan', 'Produksi air pegunungan']);
    suSheet.appendRow(['su4', 'Produksi Ketela', 'Produksi ketela pohon']);
  }

  // PRODUK sheet
  _createOrGetSheet(ss, SHEET_NAMES.PRODUK, ['id', 'nama', 'satuan', 'harga_default']);
  const produkSheet = ss.getSheetByName(SHEET_NAMES.PRODUK);
  if (produkSheet.getLastRow() <= 1) {
    produkSheet.appendRow(['p1', 'Kedondong', 'kg', 5000]);
    produkSheet.appendRow(['p2', 'Jeruk Lemon', 'kg', 15000]);
    produkSheet.appendRow(['p3', 'Jambu', 'kg', 8000]);
    produkSheet.appendRow(['p4', 'Ketela Pohon', 'kg', 3000]);
    produkSheet.appendRow(['p5', 'Air Pegunungan', 'galon', 20000]);
  }

  SpreadsheetApp.getUi().alert('✅ Setup berhasil! Spreadsheet siap digunakan.');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function _getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`Sheet "${name}" tidak ditemukan. Jalankan setupSpreadsheet() terlebih dahulu.`);
  return sheet;
}

function _createOrGetSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Style header
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#14532d');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
  }
  return sheet;
}

function _sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== '' ? row[i] : null;
    });
    return obj;
  }).filter(obj => obj[headers[0]]); // Filter empty rows
}

function _findRowById(sheet, id) {
  if (!id) return -1;
  const data = sheet.getDataRange().getValues();
  const searchId = String(id).trim();
  for (let i = 1; i < data.length; i++) {
    const cellId = String(data[i][0] || '').trim();
    if (cellId === searchId) return i + 1; // 1-indexed row number
  }
  return -1;
}

// Hapus SEMUA baris dengan ID tertentu (mengatasi duplikat)
// Harus dari bawah ke atas agar row index tidak bergeser
function _deleteAllRowsById(sheet, id) {
  const searchId = String(id).trim();
  const data = sheet.getDataRange().getValues();
  let count = 0;
  // Loop dari bawah ke atas
  for (let i = data.length - 1; i >= 1; i--) {
    const cellId = String(data[i][0] || '').trim();
    if (cellId === searchId) {
      sheet.deleteRow(i + 1); // +1 karena 1-indexed
      count++;
    }
  }
  return count;
}

function _genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
