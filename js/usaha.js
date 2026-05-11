/**
 * Sub Usaha Module - Abah Suhar Farm Finance
 */

if (!Auth.requireAuth()) { /* redirect */ }

let allData = [];

const ICONS = ['fa-building-wheat', 'fa-seedling', 'fa-leaf', 'fa-tree', 'fa-tractor', 'fa-droplet', 'fa-sun', 'fa-mountain'];
const COLORS = [
  'from-yellow-500 to-yellow-700',
  'from-green-500 to-green-700',
  'from-farm-500 to-farm-700',
  'from-teal-500 to-teal-700',
  'from-orange-500 to-orange-700',
  'from-blue-500 to-blue-700',
  'from-amber-500 to-amber-700',
  'from-emerald-500 to-emerald-700'
];

document.addEventListener('DOMContentLoaded', async () => {
  Utils.setupSidebar('usaha');
  await loadData();
});

async function loadData() {
  try {
    allData = await API.getSubUsaha();
    renderCards();
  } catch (e) {
    Utils.toast('Gagal memuat data', 'error');
  }
}

async function renderCards() {
  const grid = document.getElementById('usahaGrid');
  if (!grid) return;

  // Get stats for each sub usaha
  const [pemasukan, pengeluaran] = await Promise.all([
    API.getPemasukan(),
    API.getPengeluaran()
  ]);

  if (allData.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full">
        <div class="empty-state">
          <i class="fa-solid fa-building-wheat"></i>
          <p class="text-sm font-medium">Belum ada sub usaha</p>
          <p class="text-xs mt-1">Tambahkan sub usaha untuk memulai</p>
          <button onclick="openModal()" class="btn-primary mt-4 text-sm">
            <i class="fa-solid fa-plus mr-1"></i>Tambah Sub Usaha
          </button>
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = allData.map((su, i) => {
    const pm = pemasukan.filter(d => d.sub_usaha === su.nama_usaha).reduce((s, d) => s + Number(d.total || 0), 0);
    const pe = pengeluaran.filter(d => d.sub_usaha === su.nama_usaha).reduce((s, d) => s + Number(d.nominal || 0), 0);
    const laba = pm - pe;
    const icon = ICONS[i % ICONS.length];
    const color = COLORS[i % COLORS.length];

    return `
      <div class="stat-card p-5 group animate__animated animate__fadeInUp" style="animation-delay:${i * 0.05}s">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
            <i class="fa-solid ${icon} text-white text-lg"></i>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="btn-edit" onclick="editData('${su.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-danger" onclick="deleteData('${su.id}', '${Utils.sanitize(su.nama_usaha)}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <h3 class="text-white font-bold text-base mb-1">${Utils.sanitize(su.nama_usaha)}</h3>
        <p class="text-gray-400 text-xs mb-4 line-clamp-2">${Utils.sanitize(su.deskripsi || 'Tidak ada deskripsi')}</p>
        <div class="space-y-1.5 pt-3 border-t border-white/08">
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Pemasukan</span>
            <span class="text-green-400 font-medium">${Utils.formatRupiah(pm)}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Pengeluaran</span>
            <span class="text-red-400 font-medium">${Utils.formatRupiah(pe)}</span>
          </div>
          <div class="flex justify-between text-xs font-semibold pt-1 border-t border-white/06">
            <span class="text-gray-300">Laba</span>
            <span class="${laba >= 0 ? 'text-farm-400' : 'text-orange-400'}">${Utils.formatRupiah(Math.abs(laba))} ${laba >= 0 ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

function openModal(data = null) {
  document.getElementById('modalTitle').textContent = data ? 'Edit Sub Usaha' : 'Tambah Sub Usaha';
  document.getElementById('editId').value = data?.id || '';
  document.getElementById('fNama').value = data?.nama_usaha || '';
  document.getElementById('fDeskripsi').value = data?.deskripsi || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('usahaForm').reset();
}

function editData(id) {
  const d = allData.find(x => x.id === id);
  if (d) openModal(d);
}

async function deleteData(id, name) {
  const confirmed = await Utils.confirmDelete(name);
  if (!confirmed) return;
  try {
    await API.deleteSubUsaha(id);
    Utils.toast('Sub usaha berhasil dihapus', 'success');
    await loadData();
  } catch (e) {
    Utils.toast('Gagal menghapus data', 'error');
  }
}

document.getElementById('usahaForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const data = {
    nama_usaha: Utils.sanitize(document.getElementById('fNama').value.trim()),
    deskripsi: Utils.sanitize(document.getElementById('fDeskripsi').value.trim())
  };

  if (!data.nama_usaha) {
    Utils.toast('Nama sub usaha wajib diisi', 'warning');
    return;
  }

  try {
    if (id) {
      await API.updateSubUsaha(id, data);
      Utils.toast('Sub usaha berhasil diperbarui', 'success');
    } else {
      await API.addSubUsaha(data);
      Utils.toast('Sub usaha berhasil ditambahkan', 'success');
    }
    closeModal();
    await loadData();
  } catch (err) {
    Utils.toast('Gagal menyimpan data', 'error');
  }
});

document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
