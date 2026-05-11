/**
 * API Module - Abah Suhar Farm Finance
 * Handles all communication with Google Apps Script backend
 * Falls back to localStorage for demo/offline mode
 */

// ============================================================
// CONFIGURATION - Update this with your Google Apps Script URL
// ============================================================
window.APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzvMA3tlphyUhNkBmpeIbqJXSA8XRm_jgLp-o7qwAQIyL9IyrDiCPZB3ESsXqP3CZqpqQ/exec', // Paste your Google Apps Script Web App URL here
  APP_NAME: 'Abah Suhar Farm Finance',
  VERSION: '1.0.0'
};

const API = (() => {
  const STORAGE_KEYS = {
    pemasukan: 'farm_pemasukan',
    pengeluaran: 'farm_pengeluaran',
    produk: 'farm_produk'
  };

  // ─── Default seed data ───────────────────────────────────────
  const DEFAULT_PRODUK = [
    { id: 'p1', nama: 'Kedondong', satuan: 'kg', harga_default: 5000 },
    { id: 'p2', nama: 'Jeruk Lemon', satuan: 'kg', harga_default: 15000 },
    { id: 'p3', nama: 'Jambu', satuan: 'kg', harga_default: 8000 },
    { id: 'p4', nama: 'Ketela Pohon', satuan: 'kg', harga_default: 3000 },
    { id: 'p5', nama: 'Air Pegunungan', satuan: 'galon', harga_default: 20000 }
  ];

  const DEFAULT_PEMASUKAN = [
    { id: 'pm1', tanggal: '2026-01-05', produk: 'Kedondong', qty: 50, harga: 5000, total: 250000, pembeli: 'Pak Budi', catatan: '' },
    { id: 'pm2', tanggal: '2026-01-10', produk: 'Jeruk Lemon', qty: 30, harga: 15000, total: 450000, pembeli: 'Bu Sari', catatan: 'Pesanan rutin' },
    { id: 'pm3', tanggal: '2026-01-15', produk: 'Jambu', qty: 20, harga: 8000, total: 160000, pembeli: 'Pak Joko', catatan: '' },
    { id: 'pm4', tanggal: '2026-02-03', produk: 'Air Pegunungan', qty: 10, harga: 20000, total: 200000, pembeli: 'Warung Maju', catatan: '' },
    { id: 'pm5', tanggal: '2026-02-08', produk: 'Ketela Pohon', qty: 100, harga: 3000, total: 300000, pembeli: 'Pabrik Tapioka', catatan: 'Kontrak bulanan' },
    { id: 'pm6', tanggal: '2026-02-14', produk: 'Jeruk Lemon', qty: 45, harga: 15000, total: 675000, pembeli: 'Toko Buah Segar', catatan: '' },
    { id: 'pm7', tanggal: '2026-03-01', produk: 'Kedondong', qty: 80, harga: 5500, total: 440000, pembeli: 'Pasar Induk', catatan: '' },
    { id: 'pm8', tanggal: '2026-03-10', produk: 'Air Pegunungan', qty: 25, harga: 20000, total: 500000, pembeli: 'Hotel Melati', catatan: 'Langganan' },
    { id: 'pm9', tanggal: '2026-04-05', produk: 'Jambu', qty: 35, harga: 9000, total: 315000, pembeli: 'Bu Dewi', catatan: '' },
    { id: 'pm10', tanggal: '2026-04-20', produk: 'Jeruk Lemon', qty: 60, harga: 16000, total: 960000, pembeli: 'Restoran Hijau', catatan: 'Pesanan besar' },
    { id: 'pm11', tanggal: '2026-05-02', produk: 'Ketela Pohon', qty: 150, harga: 3200, total: 480000, pembeli: 'Pabrik Tapioka', catatan: '' },
    { id: 'pm12', tanggal: '2026-05-08', produk: 'Air Pegunungan', qty: 30, harga: 20000, total: 600000, pembeli: 'Kantor Desa', catatan: '' }
  ];

  const DEFAULT_PENGELUARAN = [
    { id: 'pe1', tanggal: '2026-01-03', kategori: 'Bibit', nominal: 150000, deskripsi: 'Bibit kedondong' },
    { id: 'pe2', tanggal: '2026-01-07', kategori: 'Pupuk', nominal: 200000, deskripsi: 'Pupuk NPK' },
    { id: 'pe3', tanggal: '2026-01-12', kategori: 'Gaji', nominal: 500000, deskripsi: 'Gaji pekerja kebun' },
    { id: 'pe4', tanggal: '2026-01-20', kategori: 'Transport', nominal: 100000, deskripsi: 'Ongkos kirim ke pasar' },
    { id: 'pe5', tanggal: '2026-02-05', kategori: 'Operasional', nominal: 250000, deskripsi: 'Perawatan mesin pompa' },
    { id: 'pe6', tanggal: '2026-02-10', kategori: 'Listrik', nominal: 180000, deskripsi: 'Tagihan listrik Februari' },
    { id: 'pe7', tanggal: '2026-02-15', kategori: 'Bibit', nominal: 120000, deskripsi: 'Bibit ketela unggul' },
    { id: 'pe8', tanggal: '2026-03-03', kategori: 'Pupuk', nominal: 300000, deskripsi: 'Pupuk organik' },
    { id: 'pe9', tanggal: '2026-03-08', kategori: 'Gaji', nominal: 600000, deskripsi: 'Gaji 2 pekerja' },
    { id: 'pe10', tanggal: '2026-04-02', kategori: 'Operasional', nominal: 150000, deskripsi: 'Galon & tutup baru' },
    { id: 'pe11', tanggal: '2026-04-15', kategori: 'Transport', nominal: 120000, deskripsi: 'Sewa pickup' },
    { id: 'pe12', tanggal: '2026-05-05', kategori: 'Gaji', nominal: 500000, deskripsi: 'Gaji pekerja Mei' }
  ];

  // ─── Initialize local storage with defaults ──────────────────
  const _initStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.produk)) {
      localStorage.setItem(STORAGE_KEYS.produk, JSON.stringify(DEFAULT_PRODUK));
    }
    if (!localStorage.getItem(STORAGE_KEYS.pemasukan)) {
      localStorage.setItem(STORAGE_KEYS.pemasukan, JSON.stringify(DEFAULT_PEMASUKAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.pengeluaran)) {
      localStorage.setItem(STORAGE_KEYS.pengeluaran, JSON.stringify(DEFAULT_PENGELUARAN));
    }
  };

  // ─── Generic API call - GAS compatible ───────────────────────
  // GAS Web App tidak support CORS fetch biasa dari localhost/browser.
  // Solusi: gunakan script tag injection (JSONP-style) untuk GET,
  // dan no-cors fetch untuk write operations (fire-and-forget).
  const _call = async (action, method = 'GET', body = null) => {
    const apiUrl = window.APP_CONFIG?.API_URL;
    if (!apiUrl) return null;

    if (method === 'POST' && body) {
      // WRITE: kirim via no-cors (tidak bisa baca response, tapi data masuk ke GAS)
      try {
        const payload = encodeURIComponent(JSON.stringify(body));
        const url = `${apiUrl}?action=${action}&payload=${payload}`;
        // no-cors: browser tidak bisa baca response tapi request tetap dikirim
        await fetch(url, { method: 'GET', mode: 'no-cors' });
        return { success: true }; // Asumsikan berhasil
      } catch (e) {
        console.warn('Write API failed:', e.message);
        return null;
      }
    } else {
      // READ: gunakan JSONP via script tag agar bypass CORS
      return new Promise((resolve) => {
        const cbName = '_gasCb_' + Date.now();
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
          delete window[cbName];
          script.remove();
          console.warn('API timeout, using localStorage fallback');
          resolve(null);
        }, 8000);

        window[cbName] = (data) => {
          clearTimeout(timeout);
          delete window[cbName];
          script.remove();
          resolve(data?.success ? data : null);
        };

        script.src = `${apiUrl}?action=${action}&callback=${cbName}`;
        script.onerror = () => {
          clearTimeout(timeout);
          delete window[cbName];
          script.remove();
          resolve(null);
        };
        document.head.appendChild(script);
      });
    }
  };

  // ─── Generate unique ID ───────────────────────────────────────
  const _genId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // ─── LOCAL STORAGE HELPERS ────────────────────────────────────
  const _getLocal = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };
  const _setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  // ============================================================
  // PEMASUKAN
  // ============================================================
  const getPemasukan = async (filters = {}) => {
    _initStorage();
    const remote = await _call('getPemasukan');
    let data = remote?.data || _getLocal(STORAGE_KEYS.pemasukan);
    // Sync cache jika dapat data dari server
    if (remote?.data) _setLocal(STORAGE_KEYS.pemasukan, remote.data);

    if (filters.bulan) data = data.filter(d => d.tanggal?.startsWith(`${filters.tahun || new Date().getFullYear()}-${String(filters.bulan).padStart(2,'0')}`));
    if (filters.tahun && !filters.bulan) data = data.filter(d => d.tanggal?.startsWith(String(filters.tahun)));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(d => d.produk?.toLowerCase().includes(q) || d.pembeli?.toLowerCase().includes(q));
    }
    return data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  };

  const addPemasukan = async (item) => {
    _initStorage();
    const newItem = {
      id: _genId('pm'), tanggal: item.tanggal, produk: item.produk,
      qty: Number(item.qty), harga: Number(item.harga),
      total: Number(item.qty) * Number(item.harga),
      pembeli: item.pembeli || '', catatan: item.catatan || ''
    };
    const list = _getLocal(STORAGE_KEYS.pemasukan);
    list.push(newItem);
    _setLocal(STORAGE_KEYS.pemasukan, list);
    _call('addPemasukan', 'POST', { action: 'addPemasukan', data: newItem });
    return { success: true, data: newItem };
  };

  const updatePemasukan = async (id, item) => {
    _initStorage();
    const updated = {
      id: String(id), tanggal: item.tanggal, produk: item.produk,
      qty: Number(item.qty), harga: Number(item.harga),
      total: Number(item.qty) * Number(item.harga),
      pembeli: item.pembeli || '', catatan: item.catatan || ''
    };
    const list = _getLocal(STORAGE_KEYS.pemasukan);
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) { list[idx] = updated; _setLocal(STORAGE_KEYS.pemasukan, list); }
    _call('updatePemasukan', 'POST', { action: 'updatePemasukan', id: String(id), data: updated });
    return { success: true, data: updated };
  };

  const deletePemasukan = async (id) => {
    _initStorage();
    const list = _getLocal(STORAGE_KEYS.pemasukan).filter(d => String(d.id) !== String(id));
    _setLocal(STORAGE_KEYS.pemasukan, list);
    _call('deletePemasukan', 'POST', { action: 'deletePemasukan', id: String(id) });
    return { success: true };
  };

  // ============================================================
  // PENGELUARAN
  // ============================================================
  const getPengeluaran = async (filters = {}) => {
    _initStorage();
    const remote = await _call('getPengeluaran');
    let data = remote?.data || _getLocal(STORAGE_KEYS.pengeluaran);
    // Sync cache jika dapat data dari server
    if (remote?.data) _setLocal(STORAGE_KEYS.pengeluaran, remote.data);

    if (filters.bulan) data = data.filter(d => d.tanggal?.startsWith(`${filters.tahun || new Date().getFullYear()}-${String(filters.bulan).padStart(2,'0')}`));
    if (filters.tahun && !filters.bulan) data = data.filter(d => d.tanggal?.startsWith(String(filters.tahun)));
    if (filters.kategori) data = data.filter(d => d.kategori === filters.kategori);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(d => d.deskripsi?.toLowerCase().includes(q) || d.kategori?.toLowerCase().includes(q));
    }
    return data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  };

  const addPengeluaran = async (item) => {
    _initStorage();
    const newItem = {
      id: _genId('pe'), tanggal: item.tanggal,
      kategori: item.kategori, nominal: Number(item.nominal),
      deskripsi: item.deskripsi || ''
    };
    const list = _getLocal(STORAGE_KEYS.pengeluaran);
    list.push(newItem);
    _setLocal(STORAGE_KEYS.pengeluaran, list);
    _call('addPengeluaran', 'POST', { action: 'addPengeluaran', data: newItem });
    return { success: true, data: newItem };
  };

  const updatePengeluaran = async (id, item) => {
    _initStorage();
    const updated = {
      id: String(id), tanggal: item.tanggal,
      kategori: item.kategori, nominal: Number(item.nominal),
      deskripsi: item.deskripsi || ''
    };
    const list = _getLocal(STORAGE_KEYS.pengeluaran);
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) { list[idx] = updated; _setLocal(STORAGE_KEYS.pengeluaran, list); }
    _call('updatePengeluaran', 'POST', { action: 'updatePengeluaran', id: String(id), data: updated });
    return { success: true, data: updated };
  };

  const deletePengeluaran = async (id) => {
    _initStorage();
    const list = _getLocal(STORAGE_KEYS.pengeluaran).filter(d => String(d.id) !== String(id));
    _setLocal(STORAGE_KEYS.pengeluaran, list);
    _call('deletePengeluaran', 'POST', { action: 'deletePengeluaran', id: String(id) });
    return { success: true };
  };

  // ============================================================
  // PRODUK
  // ============================================================
  const getProduk = async () => {
    _initStorage();
    const remote = await _call('getProduk');
    if (remote?.data) {
      // Sync localStorage dengan data terbaru dari server
      _setLocal(STORAGE_KEYS.produk, remote.data);
      return remote.data;
    }
    return _getLocal(STORAGE_KEYS.produk);
  };

  const addProduk = async (item) => {
    _initStorage();
    const newItem = {
      id: _genId('p'),
      nama: item.nama,
      satuan: item.satuan || 'kg',
      harga_default: Number(item.harga_default) || 0
    };
    // Simpan ke localStorage dulu (optimistic update)
    const list = _getLocal(STORAGE_KEYS.produk);
    list.push(newItem);
    _setLocal(STORAGE_KEYS.produk, list);
    // Kirim ke server (fire and forget, ID sudah sama)
    _call('addProduk', 'POST', { action: 'addProduk', data: newItem });
    return { success: true, data: newItem };
  };

  const updateProduk = async (id, item) => {
    _initStorage();
    const updated = {
      id: String(id),
      nama: item.nama,
      satuan: item.satuan || 'kg',
      harga_default: Number(item.harga_default) || 0
    };
    // Update localStorage dulu
    const list = _getLocal(STORAGE_KEYS.produk);
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) { list[idx] = updated; _setLocal(STORAGE_KEYS.produk, list); }
    // Kirim ke server
    _call('updateProduk', 'POST', { action: 'updateProduk', id: String(id), data: updated });
    return { success: true, data: updated };
  };

  const deleteProduk = async (id) => {
    _initStorage();
    const strId = String(id);
    // Hapus dari localStorage dulu
    const list = _getLocal(STORAGE_KEYS.produk).filter(d => String(d.id) !== strId);
    _setLocal(STORAGE_KEYS.produk, list);
    // Kirim ke server
    _call('deleteProduk', 'POST', { action: 'deleteProduk', id: strId });
    return { success: true };
  };

  // ============================================================
  // STATISTIK DASHBOARD
  // ============================================================
  const getStatistik = async (filters = {}) => {
    _initStorage();
    const [pemasukan, pengeluaran] = await Promise.all([
      getPemasukan(filters),
      getPengeluaran(filters)
    ]);

    const totalPemasukan = pemasukan.reduce((s, d) => s + Number(d.total || 0), 0);
    const totalPengeluaran = pengeluaran.reduce((s, d) => s + Number(d.nominal || 0), 0);
    const labaBersih = totalPemasukan - totalPengeluaran;

    // Produk terlaris
    const produkMap = {};
    pemasukan.forEach(d => {
      produkMap[d.produk] = (produkMap[d.produk] || 0) + Number(d.total || 0);
    });
    const produkTerlaris = Object.entries(produkMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    // Monthly data for charts (last 6 months)
    const monthlyData = _getMonthlyData(pemasukan, pengeluaran);

    // Produk sales for bar chart
    const produkSales = Object.entries(produkMap).map(([nama, total]) => ({ nama, total })).sort((a, b) => b.total - a.total);

    // Pengeluaran by kategori
    const kategoriMap = {};
    pengeluaran.forEach(d => {
      kategoriMap[d.kategori] = (kategoriMap[d.kategori] || 0) + Number(d.nominal || 0);
    });
    const pengeluaranKategori = Object.entries(kategoriMap).map(([nama, total]) => ({ nama, total }));

    return {
      totalPemasukan,
      totalPengeluaran,
      labaBersih,
      totalTransaksi: pemasukan.length + pengeluaran.length,
      produkTerlaris,
      monthlyData,
      produkSales,
      pengeluaranKategori
    };
  };

  const _getMonthlyData = (pemasukan, pengeluaran) => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      const pm = pemasukan.filter(x => x.tanggal?.startsWith(key)).reduce((s, x) => s + Number(x.total || 0), 0);
      const pe = pengeluaran.filter(x => x.tanggal?.startsWith(key)).reduce((s, x) => s + Number(x.nominal || 0), 0);
      months.push({ key, label, pemasukan: pm, pengeluaran: pe, profit: pm - pe });
    }
    return months;
  };

  return {
    getPemasukan, addPemasukan, updatePemasukan, deletePemasukan,
    getPengeluaran, addPengeluaran, updatePengeluaran, deletePengeluaran,
    getProduk, addProduk, updateProduk, deleteProduk,
    getStatistik
  };
})();

window.API = API;
