/**
 * Pemasukan Module - Abah Suhar Farm Finance
 */

if (!Auth.requireAuth()) { /* redirect */ }

let allData = [];
let filteredData = [];
let currentPage = 1;
const PER_PAGE = 10;
let sortField = 'tanggal';
let sortDir = 'desc';

document.addEventListener('DOMContentLoaded', async () => {
  Utils.setupSidebar('pemasukan');
  await loadProdukOptions();
  await loadData();
  setupEvents();
});

// ─── Load Data ────────────────────────────────────────────────
async function loadData() {
  Utils.showLoading('tableBody', 5, 8);
  try {
    allData = await API.getPemasukan();
    filteredData = [...allData];
    applySort();
    renderTable();
    renderSummary();
  } catch (e) {
    Utils.toast('Gagal memuat data', 'error');
  }
}

// ─── Load Produk Options ──────────────────────────────────────
async function loadProdukOptions() {
  const list = await API.getProduk();
  const el = document.getElementById('fProduk');
  if (!el) return;
  el.innerHTML = '<option value="">Pilih produk</option>' +
    list.map(p => `<option value="${Utils.sanitize(p.nama)}" data-harga="${p.harga_default}">${Utils.sanitize(p.nama)}</option>`).join('');

  el.addEventListener('change', () => {
    const opt = el.options[el.selectedIndex];
    const harga = opt?.dataset?.harga;
    if (harga) {
      document.getElementById('fHarga').value = harga;
      calcTotal();
    }
  });
}

// ─── Render Table ─────────────────────────────────────────────
function renderTable() {
  const { items, total, totalPages } = Utils.paginate(filteredData, currentPage, PER_PAGE);
  const tbody = document.getElementById('tableBody');

  if (items.length === 0) {
    Utils.showEmpty('tableBody', 'Tidak ada data pemasukan', 'fa-arrow-trend-up', 8);
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  tbody.innerHTML = items.map(d => `
    <tr>
      <td>${Utils.formatDateShort(d.tanggal)}</td>
      <td class="font-medium text-white">${Utils.sanitize(d.produk)}</td>
      <td class="text-right">${Utils.formatNumber(d.qty)}</td>
      <td class="text-right">${Utils.formatRupiah(d.harga)}</td>
      <td class="text-right font-semibold text-green-400">${Utils.formatRupiah(d.total)}</td>
      <td class="text-gray-300">${Utils.sanitize(d.pembeli || '-')}</td>
      <td class="text-center">
        <div class="flex items-center justify-center gap-1">
          <button class="btn-edit" onclick="editData('${d.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-danger" onclick="deleteData('${d.id}', '${Utils.sanitize(d.produk)}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');

  Utils.renderPagination('paginationContainer', { page: currentPage, totalPages, total, perPage: PER_PAGE },
    (p) => { currentPage = p; renderTable(); });
}

// ─── Render Summary ───────────────────────────────────────────
function renderSummary() {
  const total = filteredData.reduce((s, d) => s + Number(d.total || 0), 0);
  const count = filteredData.length;
  const avg = count > 0 ? total / count : 0;
  document.getElementById('summaryTotal').textContent = Utils.formatRupiah(total);
  document.getElementById('summaryCount').textContent = Utils.formatNumber(count);
  document.getElementById('summaryAvg').textContent = Utils.formatRupiah(avg);
}

// ─── Apply Filters ────────────────────────────────────────────
function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase();
  const bulan = document.getElementById('filterBulan')?.value;
  const tahun = document.getElementById('filterTahun')?.value;

  filteredData = allData.filter(d => {
    if (search && !d.produk?.toLowerCase().includes(search) && !d.pembeli?.toLowerCase().includes(search)) return false;
    if (bulan && tahun && !d.tanggal?.startsWith(`${tahun}-${String(bulan).padStart(2,'0')}`)) return false;
    else if (tahun && !bulan && !d.tanggal?.startsWith(tahun)) return false;
    return true;
  });

  applySort();
  currentPage = 1;
  renderTable();
  renderSummary();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterBulan').value = '';
  document.getElementById('filterTahun').value = '2026';
  filteredData = [...allData];
  applySort();
  currentPage = 1;
  renderTable();
  renderSummary();
}

// ─── Sort ─────────────────────────────────────────────────────
function sortData(field) {
  if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortField = field; sortDir = 'desc'; }
  applySort();
  renderTable();
}

function applySort() {
  filteredData.sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'tanggal') { va = new Date(va); vb = new Date(vb); }
    else if (['total', 'qty', 'harga'].includes(sortField)) { va = Number(va); vb = Number(vb); }
    else { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase(); }
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
}

// ─── Modal ────────────────────────────────────────────────────
function openModal(data = null) {
  document.getElementById('modalTitle').textContent = data ? 'Edit Pemasukan' : 'Tambah Pemasukan';
  document.getElementById('editId').value = data?.id || '';
  document.getElementById('fTanggal').value = data?.tanggal || new Date().toISOString().slice(0,10);
  document.getElementById('fProduk').value = data?.produk || '';
  document.getElementById('fQty').value = data?.qty || '';
  document.getElementById('fHarga').value = data?.harga || '';
  document.getElementById('fPembeli').value = data?.pembeli || '';
  document.getElementById('fCatatan').value = data?.catatan || '';
  calcTotal();
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('pemasukanForm').reset();
  document.getElementById('fTotalDisplay').textContent = 'Rp 0';
}

function calcTotal() {
  const qty = Number(document.getElementById('fQty')?.value || 0);
  const harga = Number(document.getElementById('fHarga')?.value || 0);
  document.getElementById('fTotalDisplay').textContent = Utils.formatRupiah(qty * harga);
}

// ─── Edit ─────────────────────────────────────────────────────
function editData(id) {
  const d = allData.find(x => x.id === id);
  if (d) openModal(d);
}

// ─── Delete ───────────────────────────────────────────────────
async function deleteData(id, name) {
  const confirmed = await Utils.confirmDelete(name);
  if (!confirmed) return;
  try {
    await API.deletePemasukan(id);
    Utils.toast('Data berhasil dihapus', 'success');
    await loadData();
  } catch (e) {
    Utils.toast('Gagal menghapus data', 'error');
  }
}

// ─── Form Submit ──────────────────────────────────────────────
document.getElementById('pemasukanForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const data = {
    tanggal: document.getElementById('fTanggal').value,
    produk: Utils.sanitize(document.getElementById('fProduk').value),
    qty: Number(document.getElementById('fQty').value),
    harga: Number(document.getElementById('fHarga').value),
    pembeli: Utils.sanitize(document.getElementById('fPembeli').value),
    catatan: Utils.sanitize(document.getElementById('fCatatan').value)
  };

  if (!data.tanggal || !data.produk || !data.qty || !data.harga) {
    Utils.toast('Lengkapi semua field wajib', 'warning');
    return;
  }

  try {
    if (id) {
      await API.updatePemasukan(id, data);
      Utils.toast('Data berhasil diperbarui', 'success');
    } else {
      await API.addPemasukan(data);
      Utils.toast('Data berhasil ditambahkan', 'success');
    }
    closeModal();
    await loadData();
  } catch (err) {
    Utils.toast('Gagal menyimpan data', 'error');
  }
});

// ─── Export ───────────────────────────────────────────────────
function exportExcelData() {
  const rows = filteredData.map(d => ({
    'Tanggal': Utils.formatDate(d.tanggal),
    'Produk': d.produk,
    'Qty': d.qty,
    'Harga': d.harga,
    'Total': d.total,
    'Pembeli': d.pembeli || '',
    'Catatan': d.catatan || ''
  }));
  Utils.exportExcel(rows, 'Pemasukan_Farm', 'Pemasukan');
}

async function exportPDFData() {
  const headers = ['Tanggal', 'Produk', 'Qty', 'Harga', 'Total', 'Pembeli'];
  const rows = filteredData.map(d => [
    Utils.formatDateShort(d.tanggal), d.produk,
    d.qty, Utils.formatRupiah(d.harga), Utils.formatRupiah(d.total), d.pembeli || '-'
  ]);
  await Utils.exportPDF('Laporan Pemasukan', headers, rows, 'Pemasukan_Farm');
}

// ─── Setup Events ─────────────────────────────────────────────
function setupEvents() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', Utils.debounce(applyFilters, 400));
  }
  // Close modal on overlay click
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
}
