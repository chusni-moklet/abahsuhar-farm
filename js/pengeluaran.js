/**
 * Pengeluaran Module - Abah Suhar Farm Finance
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
  Utils.setupSidebar('pengeluaran');
  await loadData();
  setupEvents();
});

async function loadData() {
  showSkeletonCards();
  try {
    allData = await API.getPengeluaran();
    filteredData = [...allData];
    applySort();
    renderView();
    renderSummary();
  } catch (e) {
    Utils.toast('Gagal memuat data', 'error');
  }
}

function isMobile() { return window.innerWidth < 768; }

function renderView() {
  if (isMobile()) renderCards();
  else renderTable();
}

function showSkeletonCards() {
  const container = document.getElementById('dataContainer');
  if (!container) return;
  container.innerHTML = [1,2,3,4].map(() => `
    <div class="rounded-2xl p-4 border border-white/08 bg-white/04 space-y-3">
      <div class="flex justify-between">
        <div class="skeleton h-4 w-24 rounded"></div>
        <div class="skeleton h-5 w-20 rounded"></div>
      </div>
      <div class="skeleton h-4 w-16 rounded"></div>
      <div class="skeleton h-4 w-40 rounded"></div>
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
        <i class="fa-solid fa-arrow-trend-down text-5xl mb-4 opacity-30"></i>
        <p class="text-sm font-medium text-gray-400">Tidak ada data pengeluaran</p>
        <p class="text-xs text-gray-500 mt-1">Tap tombol + untuk menambah data</p>
      </div>`;
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  const KATEGORI_ICON = {
    'Bibit': 'fa-seedling', 'Pupuk': 'fa-flask', 'Gaji': 'fa-users',
    'Transport': 'fa-truck', 'Operasional': 'fa-gear', 'Listrik': 'fa-bolt'
  };

  container.innerHTML = items.map(d => `
    <div class="rounded-2xl p-4 border border-white/08 bg-white/04 active:bg-white/08 transition-colors">
      <!-- Row 1: Tanggal + Nominal -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-gray-400 text-xs flex items-center gap-1.5">
          <i class="fa-regular fa-calendar text-red-500/70"></i>
          ${Utils.formatDateShort(d.tanggal)}
        </span>
        <span class="text-red-400 font-bold text-base">${Utils.formatRupiah(d.nominal)}</span>
      </div>
      <!-- Row 2: Kategori badge -->
      <div class="mb-2">
        <span class="badge ${Utils.getCategoryBadge(d.kategori)} text-xs">
          <i class="fa-solid ${KATEGORI_ICON[d.kategori] || 'fa-tag'} mr-1"></i>
          ${Utils.sanitize(d.kategori)}
        </span>
      </div>
      <!-- Row 3: Deskripsi -->
      ${d.deskripsi ? `<p class="text-gray-300 text-sm mb-3">${Utils.sanitize(d.deskripsi)}</p>` : '<p class="text-gray-500 text-xs mb-3 italic">Tidak ada deskripsi</p>'}
      <!-- Actions -->
      <div class="flex gap-2 pt-2 border-t border-white/06">
        <button onclick="editData('${d.id}')"
          class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/15 text-blue-400 text-xs font-medium active:bg-blue-500/25 transition-colors">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button onclick="deleteData('${d.id}', '${Utils.sanitize(d.deskripsi || d.kategori)}')"
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
        <i class="fa-solid fa-arrow-trend-down text-5xl mb-4 opacity-30"></i>
        <p class="text-sm font-medium text-gray-400">Tidak ada data pengeluaran</p>
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
            <th class="text-left">Kategori</th>
            <th class="text-right cursor-pointer hover:text-white" onclick="sortData('nominal')">
              Nominal <i class="fa-solid fa-sort ml-1 text-xs opacity-50"></i>
            </th>
            <th class="text-left">Deskripsi</th>
            <th class="text-center w-24">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(d => `
            <tr>
              <td class="whitespace-nowrap">${Utils.formatDateShort(d.tanggal)}</td>
              <td><span class="badge ${Utils.getCategoryBadge(d.kategori)}">${Utils.sanitize(d.kategori)}</span></td>
              <td class="text-right font-semibold text-red-400">${Utils.formatRupiah(d.nominal)}</td>
              <td class="text-gray-300 max-w-xs truncate">${Utils.sanitize(d.deskripsi || '-')}</td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button class="btn-edit" onclick="editData('${d.id}')" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn-danger" onclick="deleteData('${d.id}', '${Utils.sanitize(d.deskripsi || d.kategori)}')" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  Utils.renderPagination('paginationContainer',
    { page: currentPage, totalPages, total, perPage: PER_PAGE },
    (p) => { currentPage = p; renderView(); });
}

function renderSummary() {
  const total = filteredData.reduce((s, d) => s + Number(d.nominal || 0), 0);
  const count = filteredData.length;
  document.getElementById('summaryTotal').textContent = Utils.formatRupiah(total);
  document.getElementById('summaryCount').textContent = Utils.formatNumber(count);
  document.getElementById('summaryAvg').textContent = Utils.formatRupiah(count > 0 ? total / count : 0);
}

function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase();
  const kategori = document.getElementById('filterKategori')?.value;
  const bulan = document.getElementById('filterBulan')?.value;
  const tahun = document.getElementById('filterTahun')?.value;

  filteredData = allData.filter(d => {
    if (search && !d.deskripsi?.toLowerCase().includes(search) && !d.kategori?.toLowerCase().includes(search)) return false;
    if (kategori && d.kategori !== kategori) return false;
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
  ['searchInput','filterKategori','filterBulan'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('filterTahun').value = '2026';
  filteredData = [...allData];
  applySort();
  currentPage = 1;
  renderView();
  renderSummary();
}

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
    else if (sortField === 'nominal') { va = Number(va); vb = Number(vb); }
    else { va = String(va||'').toLowerCase(); vb = String(vb||'').toLowerCase(); }
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
}

function openModal(data = null) {
  document.getElementById('modalTitle').textContent = data ? 'Edit Pengeluaran' : 'Tambah Pengeluaran';
  document.getElementById('editId').value = data?.id || '';
  document.getElementById('fTanggal').value = data?.tanggal || new Date().toISOString().slice(0,10);
  document.getElementById('fKategori').value = data?.kategori || '';
  document.getElementById('fNominal').value = data?.nominal || '';
  document.getElementById('fDeskripsi').value = data?.deskripsi || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('pengeluaranForm').reset();
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
    await API.deletePengeluaran(id);
    Utils.toast('Data berhasil dihapus', 'success');
    await loadData();
  } catch (e) {
    Utils.toast('Gagal menghapus data', 'error');
  }
}

document.getElementById('pengeluaranForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const data = {
    tanggal: document.getElementById('fTanggal').value,
    kategori: Utils.sanitize(document.getElementById('fKategori').value),
    nominal: Number(document.getElementById('fNominal').value),
    deskripsi: Utils.sanitize(document.getElementById('fDeskripsi').value)
  };

  if (!data.tanggal || !data.kategori || !data.nominal) {
    Utils.toast('Lengkapi semua field wajib', 'warning');
    return;
  }

  try {
    if (id) {
      await API.updatePengeluaran(id, data);
      Utils.toast('Data berhasil diperbarui', 'success');
    } else {
      await API.addPengeluaran(data);
      Utils.toast('Data berhasil ditambahkan', 'success');
    }
    closeModal();
    await loadData();
  } catch (err) {
    Utils.toast('Gagal menyimpan data', 'error');
  }
});

function exportExcelData() {
  const rows = filteredData.map(d => ({
    'Tanggal': Utils.formatDate(d.tanggal), 'Kategori': d.kategori,
    'Nominal': d.nominal, 'Deskripsi': d.deskripsi || ''
  }));
  Utils.exportExcel(rows, 'Pengeluaran_Farm', 'Pengeluaran');
}

async function exportPDFData() {
  const headers = ['Tanggal', 'Kategori', 'Nominal', 'Deskripsi'];
  const rows = filteredData.map(d => [
    Utils.formatDateShort(d.tanggal), d.kategori,
    Utils.formatRupiah(d.nominal), d.deskripsi || '-'
  ]);
  await Utils.exportPDF('Laporan Pengeluaran', headers, rows, 'Pengeluaran_Farm');
}

function setupEvents() {
  document.getElementById('searchInput')?.addEventListener('input', Utils.debounce(applyFilters, 400));
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  window.addEventListener('resize', Utils.debounce(() => renderView(), 300));
}
