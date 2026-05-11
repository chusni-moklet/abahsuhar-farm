/**
 * Pemasukan Module - Abah Suhar Farm Finance
 * Mobile-first: card view on small screens, table on desktop
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
  showSkeletonCards();
  try {
    allData = await API.getPemasukan();
    filteredData = [...allData];
    applySort();
    renderView();
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
    if (opt?.dataset?.harga) {
      document.getElementById('fHarga').value = opt.dataset.harga;
      calcTotal();
    }
  });
}

// ─── Detect Mobile ────────────────────────────────────────────
function isMobile() {
  return window.innerWidth < 768;
}

// ─── Render View (auto switch mobile/desktop) ─────────────────
function renderView() {
  if (isMobile()) {
    renderCards();
  } else {
    renderTable();
  }
}

// ─── Skeleton Cards (mobile loading) ─────────────────────────
function showSkeletonCards() {
  const container = document.getElementById('dataContainer');
  if (!container) return;
  container.innerHTML = [1,2,3,4].map(() => `
    <div class="rounded-2xl p-4 border border-white/08 bg-white/04 space-y-3">
      <div class="flex justify-between">
        <div class="skeleton h-4 w-24 rounded"></div>
        <div class="skeleton h-4 w-16 rounded"></div>
      </div>
      <div class="skeleton h-5 w-32 rounded"></div>
      <div class="flex justify-between">
        <div class="skeleton h-4 w-20 rounded"></div>
        <div class="skeleton h-4 w-24 rounded"></div>
      </div>
    </div>`).join('');
}

// ─── Render Cards (Mobile) ────────────────────────────────────
function renderCards() {
  const { items, total, totalPages } = Utils.paginate(filteredData, currentPage, PER_PAGE);
  const container = document.getElementById('dataContainer');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state py-16">
        <i class="fa-solid fa-arrow-trend-up text-5xl mb-4 opacity-30"></i>
        <p class="text-sm font-medium text-gray-400">Tidak ada data pemasukan</p>
        <p class="text-xs text-gray-500 mt-1">Tap tombol + untuk menambah data</p>
      </div>`;
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  container.innerHTML = items.map(d => `
    <div class="rounded-2xl p-4 border border-white/08 bg-white/04 active:bg-white/08 transition-colors">
      <!-- Row 1: Tanggal + Total -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-gray-400 text-xs flex items-center gap-1.5">
          <i class="fa-regular fa-calendar text-farm-500"></i>
          ${Utils.formatDateShort(d.tanggal)}
        </span>
        <span class="text-green-400 font-bold text-base">${Utils.formatRupiah(d.total)}</span>
      </div>
      <!-- Row 2: Produk -->
      <p class="text-white font-semibold text-sm mb-2">${Utils.sanitize(d.produk)}</p>
      <!-- Row 3: Qty x Harga + Pembeli -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-gray-400 text-xs">
          ${Utils.formatNumber(d.qty)} × ${Utils.formatRupiah(d.harga)}
        </span>
        ${d.pembeli ? `<span class="text-gray-400 text-xs flex items-center gap-1">
          <i class="fa-solid fa-user text-xs text-gray-500"></i>${Utils.sanitize(d.pembeli)}
        </span>` : ''}
      </div>
      ${d.catatan ? `<p class="text-gray-500 text-xs mb-3 italic">"${Utils.sanitize(d.catatan)}"</p>` : ''}
      <!-- Actions -->
      <div class="flex gap-2 pt-2 border-t border-white/06">
        <button onclick="editData('${d.id}')"
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/15 text-blue-400 text-xs font-medium active:bg-blue-500/25 transition-colors">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button onclick="deleteData('${d.id}', '${Utils.sanitize(d.produk)}')"
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/15 text-red-400 text-xs font-medium active:bg-red-500/25 transition-colors">
          <i class="fa-solid fa-trash"></i> Hapus
        </button>
      </div>
    </div>`).join('');

  Utils.renderPagination('paginationContainer',
    { page: currentPage, totalPages, total, perPage: PER_PAGE },
    (p) => { currentPage = p; renderView(); });
}

// ─── Render Table (Desktop) ───────────────────────────────────
function renderTable() {
  const { items, total, totalPages } = Utils.paginate(filteredData, currentPage, PER_PAGE);
  const container = document.getElementById('dataContainer');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state py-16">
        <i class="fa-solid fa-arrow-trend-up text-5xl mb-4 opacity-30"></i>
        <p class="text-sm font-medium text-gray-400">Tidak ada data pemasukan</p>
      </div>`;
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr>
            <th class="text-left cursor-pointer hover:text-white" onclick="sortData('tanggal')">
              Tanggal <i class="fa-solid fa-sort ml-1 text-xs opacity-50"></i>
            </th>
            <th class="text-left cursor-pointer hover:text-white" onclick="sortData('produk')">
              Produk <i class="fa-solid fa-sort ml-1 text-xs opacity-50"></i>
            </th>
            <th class="text-right">Qty</th>
            <th class="text-right">Harga</th>
            <th class="text-right cursor-pointer hover:text-white" onclick="sortData('total')">
              Total <i class="fa-solid fa-sort ml-1 text-xs opacity-50"></i>
            </th>
            <th class="text-left">Pembeli</th>
            <th class="text-center w-24">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(d => `
            <tr>
              <td class="whitespace-nowrap">${Utils.formatDateShort(d.tanggal)}</td>
              <td class="font-medium text-white">${Utils.sanitize(d.produk)}</td>
              <td class="text-right">${Utils.formatNumber(d.qty)}</td>
              <td class="text-right">${Utils.formatRupiah(d.harga)}</td>
              <td class="text-right font-semibold text-green-400">${Utils.formatRupiah(d.total)}</td>
              <td class="text-gray-300">${Utils.sanitize(d.pembeli || '-')}</td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button class="btn-edit" onclick="editData('${d.id}')" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn-danger" onclick="deleteData('${d.id}', '${Utils.sanitize(d.produk)}')" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid rgba(255,255,255,0.15)">
            <td colspan="4" class="font-bold" style="color:#86efac;padding:0.75rem 1rem">
              TOTAL (${filteredData.length} transaksi)
            </td>
            <td class="text-right font-bold text-lg" style="color:#4ade80;padding:0.75rem 1rem">
              ${Utils.formatRupiah(filteredData.reduce((s,d)=>s+Number(d.total||0),0))}
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>`;

  Utils.renderPagination('paginationContainer',
    { page: currentPage, totalPages, total, perPage: PER_PAGE },
    (p) => { currentPage = p; renderView(); });
}

// ─── Render Summary ───────────────────────────────────────────
function renderSummary() {
  const total = filteredData.reduce((s, d) => s + Number(d.total || 0), 0);
  const count = filteredData.length;
  document.getElementById('summaryTotal').textContent = Utils.formatRupiah(total);
  document.getElementById('summaryCount').textContent = Utils.formatNumber(count);
  document.getElementById('summaryAvg').textContent = Utils.formatRupiah(count > 0 ? total / count : 0);
}

// ─── Filters ─────────────────────────────────────────────────
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
  renderView();
  renderSummary();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterBulan').value = '';
  document.getElementById('filterTahun').value = '2026';
  filteredData = [...allData];
  applySort();
  currentPage = 1;
  renderView();
  renderSummary();
}

// ─── Sort ─────────────────────────────────────────────────────
function sortData(field) {
  if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortField = field; sortDir = 'desc'; }
  applySort();
  renderView();
}

function applySort() {
  filteredData.sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'tanggal') { va = new Date(va); vb = new Date(vb); }
    else if (['total','qty','harga'].includes(sortField)) { va = Number(va); vb = Number(vb); }
    else { va = String(va||'').toLowerCase(); vb = String(vb||'').toLowerCase(); }
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
  const qty = parseFloat(document.getElementById('fQty')?.value || 0);
  const harga = Number(document.getElementById('fHarga')?.value || 0);
  document.getElementById('fTotalDisplay').textContent = Utils.formatRupiah(qty * harga);
}

function editData(id) {
  const d = allData.find(x => String(x.id) === String(id));
  if (d) openModal(d);
  else Utils.toast('Data tidak ditemukan', 'error');
}

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
    qty: parseFloat(document.getElementById('fQty').value),
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
    'Tanggal': Utils.formatDate(d.tanggal), 'Produk': d.produk,
    'Qty': d.qty, 'Harga': d.harga, 'Total': d.total,
    'Pembeli': d.pembeli || '', 'Catatan': d.catatan || ''
  }));
  // Tambah baris total
  const grandTotal = filteredData.reduce((s, d) => s + Number(d.total || 0), 0);
  rows.push({ 'Tanggal': '', 'Produk': '', 'Qty': '', 'Harga': 'TOTAL', 'Total': grandTotal, 'Pembeli': '', 'Catatan': '' });
  Utils.exportExcel(rows, 'Pemasukan_Farm', 'Pemasukan');
}

async function exportPDFData() {
  const headers = ['Tanggal', 'Produk', 'Qty', 'Harga', 'Total', 'Pembeli'];
  const rows = filteredData.map(d => [
    Utils.formatDateShort(d.tanggal), d.produk, d.qty,
    Utils.formatRupiah(d.harga), Utils.formatRupiah(d.total), d.pembeli || '-'
  ]);
  // Tambah baris total
  const grandTotal = filteredData.reduce((s, d) => s + Number(d.total || 0), 0);
  rows.push(['', '', '', { content: 'TOTAL', styles: { fontStyle: 'bold' } }, { content: Utils.formatRupiah(grandTotal), styles: { fontStyle: 'bold', textColor: [22, 163, 74] } }, '']);
  await Utils.exportPDF('Laporan Pemasukan', headers, rows, 'Pemasukan_Farm');
}

// ─── Setup Events ─────────────────────────────────────────────
function setupEvents() {
  document.getElementById('searchInput')?.addEventListener('input', Utils.debounce(applyFilters, 400));
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  // Re-render on resize (switch between card/table)
  window.addEventListener('resize', Utils.debounce(() => renderView(), 300));
}
