/**
 * Produk Module - Abah Suhar Farm Finance
 */

if (!Auth.requireAuth()) { /* redirect */ }

let allData = [];

document.addEventListener('DOMContentLoaded', async () => {
  Utils.setupSidebar('produk');
  await loadData();
});

async function loadData() {
  Utils.showLoading('tableBody', 5, 4);
  try {
    allData = await API.getProduk();
    renderTable();
  } catch (e) {
    Utils.toast('Gagal memuat data', 'error');
  }
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (allData.length === 0) {
    Utils.showEmpty('tableBody', 'Belum ada produk', 'fa-boxes-stacked', 4);
    return;
  }

  tbody.innerHTML = allData.map((d, i) => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-leaf text-purple-400 text-xs"></i>
          </div>
          <span class="text-white font-medium">${Utils.sanitize(d.nama)}</span>
        </div>
      </td>
      <td><span class="badge badge-blue">${Utils.sanitize(d.satuan)}</span></td>
      <td class="text-right text-farm-400 font-semibold">${Utils.formatRupiah(d.harga_default || 0)}</td>
      <td class="text-center">
        <div class="flex items-center justify-center gap-1">
          <button class="btn-edit" onclick="editData('${d.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-danger" onclick="deleteData('${d.id}', '${Utils.sanitize(d.nama)}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openModal(data = null) {
  document.getElementById('modalTitle').textContent = data ? 'Edit Produk' : 'Tambah Produk';
  document.getElementById('editId').value = data?.id || '';
  document.getElementById('fNama').value = data?.nama || '';
  document.getElementById('fSatuan').value = data?.satuan || 'kg';
  document.getElementById('fHarga').value = data?.harga_default || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('produkForm').reset();
}

function editData(id) {
  const d = allData.find(x => x.id === id);
  if (d) openModal(d);
}

async function deleteData(id, name) {
  const confirmed = await Utils.confirmDelete(name);
  if (!confirmed) return;
  try {
    await API.deleteProduk(id);
    Utils.toast('Produk berhasil dihapus', 'success');
    await loadData();
  } catch (e) {
    Utils.toast('Gagal menghapus produk', 'error');
  }
}

document.getElementById('produkForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const data = {
    nama: Utils.sanitize(document.getElementById('fNama').value.trim()),
    satuan: Utils.sanitize(document.getElementById('fSatuan').value),
    harga_default: Number(document.getElementById('fHarga').value) || 0
  };

  if (!data.nama) {
    Utils.toast('Nama produk wajib diisi', 'warning');
    return;
  }

  try {
    if (id) {
      await API.updateProduk(id, data);
      Utils.toast('Produk berhasil diperbarui', 'success');
    } else {
      await API.addProduk(data);
      Utils.toast('Produk berhasil ditambahkan', 'success');
    }
    closeModal();
    await loadData();
  } catch (err) {
    Utils.toast('Gagal menyimpan produk', 'error');
  }
});

document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
