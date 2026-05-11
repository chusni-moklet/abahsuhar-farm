/**
 * Pengeluaran Module - Abah Suhar Farm Finance
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
  Utils.showLoading('tableBody', 5, 5);
  try {
    allData = await API.getPengeluaran();
    filteredData = [...allData];
    applySort();
    renderTable();
    renderSummary();
  } catch (e) {
    Utils.toast('Gagal memuat data', 'error');
  }
}

function renderTable() {
  const { items, total, totalPages } = Utils.paginate(filteredData, currentPage, PER_PAGE);
  const tbody = document.getElementById('tableBody');

  if (items.length === 0) {
    Utils.showEmpty('tableBody', 'Tidak ada data pengeluaran', 'fa-arrow-trend-down', 5);
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  tbody.innerHTML = items.map(d => `
    <tr>
      <td>${Utils.formatDateShort(d.tanggal)}</td>
      <td><span class="badge ${Utils.getCategoryBadge(d.kategori)}">${Utils.sanitize(d.kategori)}</span></td>
      <td class="text-right font-semibold text-red-400">${Utils.formatRupiah(d.nominal)}</td>
      <td class="text-gray-300 max-w-xs truncate">${Utils.sanitize(d.deskripsi || '-')}</td>
      <td class="text-center">
        <div class="flex items-center justify-center gap-1">
          <button class="btn-edit" onclick="editData('${d.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-danger" onclick="deleteData('${d.id}', '${Utils.sanitize(d.deskripsi || d.kategori)}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');

  Utils.renderPagination('paginationContainer', { page: currentPage, totalPages, total, perPage: PER_PAGE },
    (p) => { currentPage = p; renderTable(); });
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
  renderTable();
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
  renderTable();
  renderSummary();
}

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
    else if (sortField === 'nominal') { va = Number(va); vb = Number(vb); }
    else { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase(); }
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
  const d = allData.find(x => x.id === id);
  if (d) openModal(d);
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
    sub_usaha: Utils.sanitize(document.getElementById('fSubUsaha').value),
    kategori: Utils.sanitize(document.getElementById('fKategori').value),
    nominal: Number(document.getElementById('fNominal').value),
    deskripsi: Utils.sanitize(document.getElementById('fDeskripsi').value)
  };

  if (!data.tanggal || !data.sub_usaha || !data.kategori || !data.nominal) {
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
    'Tanggal': Utils.formatDate(d.tanggal),
    'Sub Usaha': d.sub_usaha,
    'Kategori': d.kategori,
    'Nominal': d.nominal,
    'Deskripsi': d.deskripsi || ''
  }));
  Utils.exportExcel(rows, 'Pengeluaran_Farm', 'Pengeluaran');
}

async function exportPDFData() {
  const headers = ['Tanggal', 'Sub Usaha', 'Kategori', 'Nominal', 'Deskripsi'];
  const rows = filteredData.map(d => [
    Utils.formatDateShort(d.tanggal), d.sub_usaha, d.kategori,
    Utils.formatRupiah(d.nominal), d.deskripsi || '-'
  ]);
  await Utils.exportPDF('Laporan Pengeluaran', headers, rows, 'Pengeluaran_Farm');
}

function setupEvents() {
  document.getElementById('searchInput')?.addEventListener('input', Utils.debounce(applyFilters, 400));
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
}
