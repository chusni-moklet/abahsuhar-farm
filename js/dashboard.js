/**
 * Dashboard Module - Abah Suhar Farm Finance
 */

// Auth check
if (!Auth.requireAuthRoot()) { /* redirect handled */ }

// Chart instances
let charts = {};

// Current filters
let currentFilters = {};

// ─── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  Utils.setupSidebar('dashboard');
  updateCurrentDate();
  await loadDashboard();
  setupAutoRefresh();
  setupFilterEvents();
});

// ─── Update Date ──────────────────────────────────────────────
function updateCurrentDate() {
  const el = document.getElementById('currentDate');
  if (el) {
    el.textContent = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

// ─── Load Dashboard ───────────────────────────────────────────
async function loadDashboard() {
  try {
    const stats = await API.getStatistik(currentFilters);
    renderStats(stats);
    renderCharts(stats);
    await renderRecentTransactions();
  } catch (err) {
    console.error('Dashboard load error:', err);
    Utils.toast('Gagal memuat data dashboard', 'error');
  }
}

// ─── Render Stats ─────────────────────────────────────────────
function renderStats(stats) {
  const pm = document.getElementById('statPemasukan');
  const pe = document.getElementById('statPengeluaran');
  const lb = document.getElementById('statLaba');
  const tr = document.getElementById('statTransaksi');
  const pt = document.getElementById('statProdukTerlaris');
  const tp = document.getElementById('statTotalProduk');

  if (pm) pm.textContent = Utils.formatRupiah(stats.totalPemasukan);
  if (pe) pe.textContent = Utils.formatRupiah(stats.totalPengeluaran);
  if (lb) {
    lb.textContent = Utils.formatRupiah(stats.labaBersih);
    lb.className = `font-bold text-lg leading-tight ${stats.labaBersih >= 0 ? 'text-farm-400' : 'text-red-400'}`;
  }
  if (tr) tr.textContent = Utils.formatNumber(stats.totalTransaksi);
  if (pt) pt.textContent = stats.produkTerlaris;
  if (tp) tp.textContent = stats.produkSales?.length || 0;
}

// ─── Chart Colors ─────────────────────────────────────────────
const CHART_COLORS = {
  green: 'rgba(74, 222, 128, 1)',
  greenAlpha: 'rgba(74, 222, 128, 0.15)',
  red: 'rgba(248, 113, 113, 1)',
  redAlpha: 'rgba(248, 113, 113, 0.15)',
  blue: 'rgba(96, 165, 250, 1)',
  yellow: 'rgba(251, 191, 36, 1)',
  purple: 'rgba(167, 139, 250, 1)',
  orange: 'rgba(251, 146, 60, 1)',
  teal: 'rgba(45, 212, 191, 1)',
  pink: 'rgba(244, 114, 182, 1)',
  grid: 'rgba(255, 255, 255, 0.06)',
  text: 'rgba(255, 255, 255, 0.5)'
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(13, 43, 20, 0.95)',
      titleColor: '#4ade80',
      bodyColor: '#d1fae5',
      borderColor: 'rgba(74, 222, 128, 0.3)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => ` ${Utils.formatRupiah(ctx.raw)}`
      }
    }
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.text, font: { size: 11 } }
    },
    y: {
      grid: { color: CHART_COLORS.grid },
      ticks: {
        color: CHART_COLORS.text,
        font: { size: 11 },
        callback: (v) => {
          if (v >= 1000000) return `${(v/1000000).toFixed(1)}jt`;
          if (v >= 1000) return `${(v/1000).toFixed(0)}rb`;
          return v;
        }
      }
    }
  }
};

// ─── Render Charts ────────────────────────────────────────────
function renderCharts(stats) {
  const { monthlyData, produkSales, pengeluaranKategori } = stats;

  // Destroy existing charts
  Object.values(charts).forEach(c => c?.destroy());
  charts = {};

  // 1. Line Chart: Pemasukan vs Pengeluaran
  const lineCtx = document.getElementById('lineChart')?.getContext('2d');
  if (lineCtx) {
    charts.lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: monthlyData.map(d => d.label),
        datasets: [
          {
            label: 'Pemasukan',
            data: monthlyData.map(d => d.pemasukan),
            borderColor: CHART_COLORS.green,
            backgroundColor: CHART_COLORS.greenAlpha,
            borderWidth: 2.5,
            pointBackgroundColor: CHART_COLORS.green,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Pengeluaran',
            data: monthlyData.map(d => d.pengeluaran),
            borderColor: CHART_COLORS.red,
            backgroundColor: CHART_COLORS.redAlpha,
            borderWidth: 2.5,
            pointBackgroundColor: CHART_COLORS.red,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            display: true,
            position: 'top',
            labels: { color: CHART_COLORS.text, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } }
          }
        }
      }
    });
  }

  // 2. Doughnut: Pengeluaran Kategori
  const doughnutCtx = document.getElementById('doughnutChart')?.getContext('2d');
  if (doughnutCtx && pengeluaranKategori.length > 0) {
    const colors = [CHART_COLORS.green, CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.yellow, CHART_COLORS.purple, CHART_COLORS.orange];
    charts.doughnutChart = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: pengeluaranKategori.map(d => d.nama),
        datasets: [{
          data: pengeluaranKategori.map(d => d.total),
          backgroundColor: colors.map(c => c.replace('1)', '0.8)')),
          borderColor: colors,
          borderWidth: 1.5,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${Utils.formatRupiah(ctx.raw)}`
            }
          }
        }
      }
    });

    // Custom legend
    const legend = document.getElementById('doughnutLegend');
    if (legend) {
      legend.innerHTML = pengeluaranKategori.slice(0, 4).map((d, i) => `
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${colors[i]}"></div>
            <span class="text-gray-300">${d.nama}</span>
          </div>
          <span class="text-white font-medium">${Utils.formatRupiah(d.total)}</span>
        </div>`).join('');
    }
  }

  // 3. Bar Chart: Penjualan Produk
  const barCtx = document.getElementById('barChart')?.getContext('2d');
  if (barCtx && produkSales.length > 0) {
    charts.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: produkSales.map(d => d.nama),
        datasets: [{
          label: 'Penjualan',
          data: produkSales.map(d => d.total),
          backgroundColor: [
            'rgba(74,222,128,0.7)', 'rgba(96,165,250,0.7)', 'rgba(251,191,36,0.7)',
            'rgba(167,139,250,0.7)', 'rgba(248,113,113,0.7)'
          ],
          borderColor: [
            CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.yellow,
            CHART_COLORS.purple, CHART_COLORS.red
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: { ...chartDefaults }
    });
  }

  // 5. Area Chart: Profit Bulanan (full width)
  const areaCtx = document.getElementById('areaChart')?.getContext('2d');
  if (areaCtx) {
    charts.areaChart = new Chart(areaCtx, {
      type: 'line',
      data: {
        labels: monthlyData.map(d => d.label),
        datasets: [{
          label: 'Profit',
          data: monthlyData.map(d => d.profit),
          borderColor: CHART_COLORS.teal,
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(45,212,191,0.4)');
            gradient.addColorStop(1, 'rgba(45,212,191,0.02)');
            return gradient;
          },
          borderWidth: 2.5,
          pointBackgroundColor: CHART_COLORS.teal,
          pointRadius: 4,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw;
                return ` Profit: ${Utils.formatRupiah(v)} ${v >= 0 ? '▲' : '▼'}`;
              }
            }
          }
        }
      }
    });
  }
}

// ─── Render Recent Transactions ───────────────────────────────
async function renderRecentTransactions() {
  const [pemasukan, pengeluaran] = await Promise.all([
    API.getPemasukan(),
    API.getPengeluaran()
  ]);

  // Recent Pemasukan
  const pmEl = document.getElementById('recentPemasukan');
  if (pmEl) {
    const recent = pemasukan.slice(0, 5);
    if (recent.length === 0) {
      pmEl.innerHTML = '<div class="empty-state py-8"><i class="fa-solid fa-inbox"></i><p class="text-sm">Belum ada pemasukan</p></div>';
    } else {
      pmEl.innerHTML = recent.map(d => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-leaf text-green-400 text-xs"></i>
            </div>
            <div>
              <p class="text-white text-xs font-medium">${Utils.sanitize(d.produk)}</p>
              <p class="text-gray-400 text-xs">${Utils.sanitize(d.sub_usaha)} · ${Utils.formatDateShort(d.tanggal)}</p>
            </div>
          </div>
          <span class="text-green-400 text-xs font-semibold">${Utils.formatRupiah(d.total)}</span>
        </div>`).join('');
    }
  }

  // Recent Pengeluaran
  const peEl = document.getElementById('recentPengeluaran');
  if (peEl) {
    const recent = pengeluaran.slice(0, 5);
    if (recent.length === 0) {
      peEl.innerHTML = '<div class="empty-state py-8"><i class="fa-solid fa-inbox"></i><p class="text-sm">Belum ada pengeluaran</p></div>';
    } else {
      peEl.innerHTML = recent.map(d => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-receipt text-red-400 text-xs"></i>
            </div>
            <div>
              <p class="text-white text-xs font-medium">${Utils.sanitize(d.deskripsi || d.kategori)}</p>
              <p class="text-gray-400 text-xs">${Utils.sanitize(d.sub_usaha)} · ${Utils.formatDateShort(d.tanggal)}</p>
            </div>
          </div>
          <span class="text-red-400 text-xs font-semibold">${Utils.formatRupiah(d.nominal)}</span>
        </div>`).join('');
    }
  }
}

// ─── Export Chart ─────────────────────────────────────────────
function exportChart(chartId) {
  const chart = charts[chartId];
  if (!chart) return;
  const url = chart.toBase64Image();
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chartId}_${new Date().toISOString().slice(0,10)}.png`;
  a.click();
  Utils.toast('Grafik berhasil diunduh', 'success');
}

// ─── Filter Events ────────────────────────────────────────────
function setupFilterEvents() {
  document.getElementById('applyFilter')?.addEventListener('click', async () => {
    const bulan = document.getElementById('filterBulan')?.value;
    const tahun = document.getElementById('filterTahun')?.value;
    currentFilters = {};
    if (bulan) currentFilters.bulan = parseInt(bulan);
    if (tahun) currentFilters.tahun = parseInt(tahun);
    await loadDashboard();
    Utils.toast('Filter diterapkan', 'info');
  });
}

// ─── Auto Refresh ─────────────────────────────────────────────
function setupAutoRefresh() {
  setInterval(async () => {
    await loadDashboard();
  }, 30000); // 30 seconds
}
