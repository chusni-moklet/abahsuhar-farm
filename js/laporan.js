/**
 * Laporan Module - Abah Suhar Farm Finance
 */

if (!Auth.requireAuth()) { /* redirect */ }

let reportData = null;

document.addEventListener('DOMContentLoaded', async () => {
  Utils.setupSidebar('laporan');
  await loadSubUsahaOptions();
  // Auto-generate for current month
  const now = new Date();
  document.getElementById('filterBulan').value = now.getMonth() + 1;
  document.getElementById('filterTahun').value = now.getFullYear();
  await generateLaporan();
});

async function loadSubUsahaOptions() {
  const list = await API.getSubUsaha();
  const el = document.getElementById('filterSubUsaha');
  if (!el) return;
  el.innerHTML = '<option value="">Semua Sub Usaha</option>' +
    list.map(s => `<option value="${Utils.sanitize(s.nama_usaha)}">${Utils.sanitize(s.nama_usaha)}</option>`).join('');
}

async function generateLaporan() {
  const bulan = document.getElementById('filterBulan')?.value;
  const tahun = document.getElementById('filterTahun')?.value;
  const subUsaha = document.getElementById('filterSubUsaha')?.value;

  const filters = {};
  if (bulan) filters.bulan = parseInt(bulan);
  if (tahun) filters.tahun = parseInt(tahun);
  if (subUsaha) filters.sub_usaha = subUsaha;

  try {
    const [pemasukan, pengeluaran] = await Promise.all([
      API.getPemasukan(filters),
      API.getPengeluaran(filters)
    ]);

    reportData = { pemasukan, pengeluaran, filters };

    // Update periode label
    let periodeLabel = '';
    if (bulan && tahun) periodeLabel = `${Utils.getMonthName(parseInt(bulan))} ${tahun}`;
    else if (tahun) periodeLabel = `Tahun ${tahun}`;
    else periodeLabel = 'Semua Periode';
    if (subUsaha) periodeLabel += ` - ${subUsaha}`;

    document.getElementById('reportPeriode').textContent = periodeLabel;
    document.getElementById('reportDate').textContent = `Dicetak: ${Utils.formatDate(new Date().toISOString())}`;
    document.getElementById('reportMeta').classList.remove('hidden');

    renderLabaRugi(pemasukan, pengeluaran);
    renderProdukTerlaris(pemasukan);
    renderKategori(pengeluaran);
    renderSubUsahaPerf(pemasukan, pengeluaran);

    Utils.toast('Laporan berhasil digenerate', 'success');
  } catch (e) {
    Utils.toast('Gagal generate laporan', 'error');
  }
}

function renderLabaRugi(pemasukan, pengeluaran) {
  const totalPm = pemasukan.reduce((s, d) => s + Number(d.total || 0), 0);
  const totalPe = pengeluaran.reduce((s, d) => s + Number(d.nominal || 0), 0);
  const laba = totalPm - totalPe;

  document.getElementById('rTotalPemasukan').textContent = Utils.formatRupiah(totalPm);
  document.getElementById('rTotalPengeluaran').textContent = Utils.formatRupiah(totalPe);
  document.getElementById('rLabaBersih').textContent = Utils.formatRupiah(Math.abs(laba));

  const labaCard = document.getElementById('labaCard');
  const labaLabel = document.getElementById('labaLabel');
  const labaVal = document.getElementById('rLabaBersih');

  if (laba >= 0) {
    labaCard.className = 'p-4 rounded-xl bg-farm-500/10 border border-farm-500/20';
    labaLabel.className = 'text-farm-300 text-xs font-medium mb-1';
    labaVal.className = 'text-farm-400 font-bold text-2xl';
    labaLabel.textContent = 'Laba Bersih';
  } else {
    labaCard.className = 'p-4 rounded-xl bg-orange-500/10 border border-orange-500/20';
    labaLabel.className = 'text-orange-300 text-xs font-medium mb-1';
    labaVal.className = 'text-orange-400 font-bold text-2xl';
    labaLabel.textContent = 'Rugi Bersih';
  }

  const tbody = document.getElementById('labaRugiTable');
  const margin = totalPm > 0 ? ((laba / totalPm) * 100).toFixed(1) : 0;

  tbody.innerHTML = `
    <tr class="font-semibold">
      <td class="text-green-300">PEMASUKAN</td>
      <td class="text-right text-green-400">${Utils.formatRupiah(totalPm)}</td>
      <td class="text-right text-green-400">100%</td>
    </tr>
    ${pemasukan.length === 0 ? `<tr><td colspan="3" class="text-center text-gray-500 py-2 text-xs">Tidak ada data pemasukan</td></tr>` : ''}
    <tr class="font-semibold">
      <td class="text-red-300">PENGELUARAN</td>
      <td class="text-right text-red-400">${Utils.formatRupiah(totalPe)}</td>
      <td class="text-right text-red-400">${totalPm > 0 ? ((totalPe/totalPm)*100).toFixed(1) : 0}%</td>
    </tr>
    ${pengeluaran.length === 0 ? `<tr><td colspan="3" class="text-center text-gray-500 py-2 text-xs">Tidak ada data pengeluaran</td></tr>` : ''}
    <tr class="border-t border-white/20 font-bold text-lg">
      <td class="${laba >= 0 ? 'text-farm-300' : 'text-orange-300'}">${laba >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}</td>
      <td class="text-right ${laba >= 0 ? 'text-farm-400' : 'text-orange-400'}">${Utils.formatRupiah(Math.abs(laba))}</td>
      <td class="text-right ${laba >= 0 ? 'text-farm-400' : 'text-orange-400'}">${Math.abs(margin)}%</td>
    </tr>`;
}

function renderProdukTerlaris(pemasukan) {
  const produkMap = {};
  pemasukan.forEach(d => {
    if (!produkMap[d.produk]) produkMap[d.produk] = { qty: 0, total: 0 };
    produkMap[d.produk].qty += Number(d.qty || 0);
    produkMap[d.produk].total += Number(d.total || 0);
  });

  const totalAll = Object.values(produkMap).reduce((s, v) => s + v.total, 0);
  const sorted = Object.entries(produkMap).sort((a, b) => b[1].total - a[1].total);

  const tbody = document.getElementById('produkTable');
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-8">Tidak ada data</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(([nama, v], i) => `
    <tr>
      <td>
        <div class="flex items-center gap-2">
          ${i === 0 ? '<span class="badge badge-yellow text-xs">🏆 #1</span>' : `<span class="text-gray-500 text-xs">#${i+1}</span>`}
          <span class="text-white font-medium">${Utils.sanitize(nama)}</span>
        </div>
      </td>
      <td class="text-right">${Utils.formatNumber(v.qty)}</td>
      <td class="text-right text-green-400 font-semibold">${Utils.formatRupiah(v.total)}</td>
      <td class="text-right">
        <div class="flex items-center justify-end gap-2">
          <div class="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-farm-500 rounded-full" style="width:${totalAll > 0 ? (v.total/totalAll*100).toFixed(0) : 0}%"></div>
          </div>
          <span class="text-gray-300 text-xs">${totalAll > 0 ? (v.total/totalAll*100).toFixed(1) : 0}%</span>
        </div>
      </td>
    </tr>`).join('');
}

function renderKategori(pengeluaran) {
  const katMap = {};
  pengeluaran.forEach(d => {
    katMap[d.kategori] = (katMap[d.kategori] || 0) + Number(d.nominal || 0);
  });

  const totalAll = Object.values(katMap).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(katMap).sort((a, b) => b[1] - a[1]);

  const tbody = document.getElementById('kategoriTable');
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-gray-500 py-8">Tidak ada data</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(([nama, total]) => `
    <tr>
      <td><span class="badge ${Utils.getCategoryBadge(nama)}">${Utils.sanitize(nama)}</span></td>
      <td class="text-right text-red-400 font-semibold">${Utils.formatRupiah(total)}</td>
      <td class="text-right">
        <div class="flex items-center justify-end gap-2">
          <div class="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-red-500 rounded-full" style="width:${totalAll > 0 ? (total/totalAll*100).toFixed(0) : 0}%"></div>
          </div>
          <span class="text-gray-300 text-xs">${totalAll > 0 ? (total/totalAll*100).toFixed(1) : 0}%</span>
        </div>
      </td>
    </tr>`).join('');
}

function renderSubUsahaPerf(pemasukan, pengeluaran) {
  const suMap = {};
  pemasukan.forEach(d => {
    if (!suMap[d.sub_usaha]) suMap[d.sub_usaha] = { pm: 0, pe: 0 };
    suMap[d.sub_usaha].pm += Number(d.total || 0);
  });
  pengeluaran.forEach(d => {
    if (!suMap[d.sub_usaha]) suMap[d.sub_usaha] = { pm: 0, pe: 0 };
    suMap[d.sub_usaha].pe += Number(d.nominal || 0);
  });

  const sorted = Object.entries(suMap).sort((a, b) => (b[1].pm - b[1].pe) - (a[1].pm - a[1].pe));

  const tbody = document.getElementById('subUsahaTable');
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-8">Tidak ada data</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(([nama, v]) => {
    const laba = v.pm - v.pe;
    return `
      <tr>
        <td class="font-medium text-white">${Utils.sanitize(nama)}</td>
        <td class="text-right text-green-400">${Utils.formatRupiah(v.pm)}</td>
        <td class="text-right text-red-400">${Utils.formatRupiah(v.pe)}</td>
        <td class="text-right font-bold ${laba >= 0 ? 'text-farm-400' : 'text-orange-400'}">${Utils.formatRupiah(Math.abs(laba))} ${laba >= 0 ? '▲' : '▼'}</td>
      </tr>`;
  }).join('');
}

// ─── Export ───────────────────────────────────────────────────
function exportExcelLaporan() {
  if (!reportData) { Utils.toast('Generate laporan terlebih dahulu', 'warning'); return; }
  const { pemasukan, pengeluaran } = reportData;

  const wb = XLSX.utils.book_new();

  // Sheet Pemasukan
  const pmRows = pemasukan.map(d => ({
    'Tanggal': Utils.formatDate(d.tanggal), 'Sub Usaha': d.sub_usaha,
    'Produk': d.produk, 'Qty': d.qty, 'Harga': d.harga, 'Total': d.total, 'Pembeli': d.pembeli || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pmRows), 'Pemasukan');

  // Sheet Pengeluaran
  const peRows = pengeluaran.map(d => ({
    'Tanggal': Utils.formatDate(d.tanggal), 'Sub Usaha': d.sub_usaha,
    'Kategori': d.kategori, 'Nominal': d.nominal, 'Deskripsi': d.deskripsi || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(peRows), 'Pengeluaran');

  // Sheet Summary
  const totalPm = pemasukan.reduce((s, d) => s + Number(d.total || 0), 0);
  const totalPe = pengeluaran.reduce((s, d) => s + Number(d.nominal || 0), 0);
  const summary = [
    { 'Keterangan': 'Total Pemasukan', 'Nilai': totalPm },
    { 'Keterangan': 'Total Pengeluaran', 'Nilai': totalPe },
    { 'Keterangan': 'Laba Bersih', 'Nilai': totalPm - totalPe }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Ringkasan');

  XLSX.writeFile(wb, `Laporan_Farm_${new Date().toISOString().slice(0,10)}.xlsx`);
  Utils.toast('File Excel berhasil diunduh', 'success');
}

async function exportPDFLaporan() {
  if (!reportData) { Utils.toast('Generate laporan terlebih dahulu', 'warning'); return; }
  const { pemasukan, pengeluaran } = reportData;

  const totalPm = pemasukan.reduce((s, d) => s + Number(d.total || 0), 0);
  const totalPe = pengeluaran.reduce((s, d) => s + Number(d.nominal || 0), 0);
  const laba = totalPm - totalPe;

  const headers = ['Keterangan', 'Nilai', '%'];
  const rows = [
    ['TOTAL PEMASUKAN', Utils.formatRupiah(totalPm), '100%'],
    ['TOTAL PENGELUARAN', Utils.formatRupiah(totalPe), `${totalPm > 0 ? ((totalPe/totalPm)*100).toFixed(1) : 0}%`],
    [laba >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH', Utils.formatRupiah(Math.abs(laba)), `${totalPm > 0 ? Math.abs(((laba/totalPm)*100)).toFixed(1) : 0}%`]
  ];

  await Utils.exportPDF(
    `Laporan Laba Rugi - ${document.getElementById('reportPeriode').textContent}`,
    headers, rows, `Laporan_Farm_${new Date().toISOString().slice(0,10)}`
  );
}
