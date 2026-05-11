/**
 * Utility Functions - Abah Suhar Farm Finance
 */

const Utils = (() => {

  // ─── Format Currency ─────────────────────────────────────────
  const formatRupiah = (amount) => {
    if (isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ─── Format Number ───────────────────────────────────────────
  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // ─── Format Date ─────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ─── Get Month Name ───────────────────────────────────────────
  const getMonthName = (month) => {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return months[month - 1] || '';
  };

  // ─── Toast Notification ──────────────────────────────────────
  const toast = (message, type = 'success', duration = 3000) => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '<i class="fa-solid fa-circle-check text-farm-400"></i>',
      error: '<i class="fa-solid fa-circle-xmark text-red-400"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation text-yellow-400"></i>',
      info: '<i class="fa-solid fa-circle-info text-blue-400"></i>'
    };

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(t);

    setTimeout(() => {
      t.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => t.remove(), 300);
    }, duration);
  };

  // ─── Show Loading ─────────────────────────────────────────────
  const showLoading = (containerId, rows = 5, cols = 5) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        html += `<td class="px-4 py-3"><div class="skeleton h-4 w-full"></div></td>`;
      }
      html += '</tr>';
    }
    el.innerHTML = html;
  };

  // ─── Show Empty State ─────────────────────────────────────────
  const showEmpty = (containerId, message = 'Tidak ada data', icon = 'fa-inbox', colspan = 5) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <tr>
        <td colspan="${colspan}">
          <div class="empty-state">
            <i class="fa-solid ${icon}"></i>
            <p class="text-sm font-medium">${message}</p>
            <p class="text-xs mt-1">Tambahkan data baru untuk memulai</p>
          </div>
        </td>
      </tr>`;
  };

  // ─── Confirm Delete ───────────────────────────────────────────
  const confirmDelete = async (itemName = 'data ini') => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      html: `Apakah Anda yakin ingin menghapus <strong>${itemName}</strong>?<br><small class="text-gray-400">Tindakan ini tidak dapat dibatalkan.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-trash mr-1"></i> Ya, Hapus',
      cancelButtonText: 'Batal',
      background: '#0d2b14',
      color: '#d1fae5',
      iconColor: '#fbbf24',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#374151',
      reverseButtons: true
    });
    return result.isConfirmed;
  };

  // ─── Sanitize Input ───────────────────────────────────────────
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>'"&]/g, c => ({
      '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;'
    }[c]));
  };

  // ─── Debounce ─────────────────────────────────────────────────
  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ─── Paginate ─────────────────────────────────────────────────
  const paginate = (data, page, perPage = 10) => {
    const total = data.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const items = data.slice(start, start + perPage);
    return { items, total, totalPages, page, perPage };
  };

  // ─── Render Pagination ────────────────────────────────────────
  const renderPagination = (containerId, { page, totalPages, total, perPage }, onPageChange) => {
    const el = document.getElementById(containerId);
    if (!el) return;

    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    // Build page buttons — show max 5 around current page
    let btns = '';
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
        btns += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>`;
      } else if (i === page - range - 1 || i === page + range + 1) {
        btns += `<span class="text-gray-500 px-0.5 text-sm">…</span>`;
      }
    }

    el.innerHTML = `
      <div style="display:flex;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
        <p class="text-gray-400 text-xs whitespace-nowrap">
          ${start}–${end} dari ${total} data
        </p>
        <div style="display:flex;flex-direction:row;align-items:center;gap:0.25rem;flex-wrap:wrap;">
          <button class="page-btn" onclick="(${onPageChange})(${page - 1})" ${page <= 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>
          ${btns}
          <button class="page-btn" onclick="(${onPageChange})(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>`;
  };
  };

  // ─── Category Colors ──────────────────────────────────────────
  const getCategoryBadge = (kategori) => {
    const map = {
      'Bibit': 'badge-green',
      'Pupuk': 'badge-yellow',
      'Gaji': 'badge-blue',
      'Transport': 'badge-purple',
      'Operasional': 'badge-red',
      'Listrik': 'badge-yellow'
    };
    return map[kategori] || 'badge-blue';
  };

  // ─── Export to Excel ──────────────────────────────────────────
  const exportExcel = (data, filename, sheetName = 'Data') => {
    if (typeof XLSX === 'undefined') {
      toast('Library Excel belum dimuat', 'error');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast('File Excel berhasil diunduh', 'success');
  };

  // ─── Export to PDF ────────────────────────────────────────────
  const exportPDF = async (title, headers, rows, filename) => {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      toast('Library PDF belum dimuat', 'error');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header
    doc.setFillColor(14, 43, 20);
    doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
    doc.setTextColor(74, 222, 128);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Abah Suhar Farm Finance', 14, 12);
    doc.setFontSize(10);
    doc.setTextColor(200, 240, 210);
    doc.text(title, 14, 22);
    doc.setFontSize(8);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, doc.internal.pageSize.width - 14, 22, { align: 'right' });

    // Table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`${filename}.pdf`);
    toast('File PDF berhasil diunduh', 'success');
  };

  // ─── Setup Sidebar ────────────────────────────────────────────
  const setupSidebar = (activePage) => {
    // Set active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.page === activePage) el.classList.add('active');
    });

    // User info
    const user = window.Auth?.getUser();
    if (user) {
      const nameEl = document.getElementById('sidebarUserName');
      const emailEl = document.getElementById('sidebarUserEmail');
      if (nameEl) nameEl.textContent = user.name || 'Admin';
      if (emailEl) emailEl.textContent = user.email || '';
    }

    // Sidebar toggle (desktop collapse)
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const desktopToggle = document.getElementById('desktopSidebarToggle');

    if (desktopToggle) {
      desktopToggle.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
        mainContent?.classList.toggle('expanded');
      });
    }

    // Mobile sidebar
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarToggle');

    const openMobile = () => {
      sidebar?.classList.add('mobile-open');
      overlay?.classList.remove('hidden');
    };
    const closeMobile = () => {
      sidebar?.classList.remove('mobile-open');
      overlay?.classList.add('hidden');
    };

    mobileToggle?.addEventListener('click', openMobile);
    closeBtn?.addEventListener('click', closeMobile);
    overlay?.addEventListener('click', closeMobile);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      const result = await Swal.fire({
        title: 'Keluar?',
        text: 'Anda akan keluar dari sistem',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        background: '#0d2b14',
        color: '#d1fae5',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#374151'
      });
      if (result.isConfirmed) {
        window.Auth?.logout();
        window.location.href = '../login.html';
      }
    });

    // Dark mode toggle
    const darkBtn = document.getElementById('darkModeToggle');
    const darkIcon = document.getElementById('darkModeIcon');
    const darkText = document.getElementById('darkModeText');
    const isDark = localStorage.getItem('farm_dark') !== 'false';

    const applyDark = (dark) => {
      document.documentElement.classList.toggle('dark', dark);
      if (darkIcon) darkIcon.className = dark ? 'fa-solid fa-sun w-5 text-center text-yellow-400' : 'fa-solid fa-moon w-5 text-center text-indigo-400';
      if (darkText) darkText.textContent = dark ? 'Mode Terang' : 'Mode Gelap';
    };
    applyDark(isDark);

    darkBtn?.addEventListener('click', () => {
      const newDark = !document.documentElement.classList.contains('dark');
      localStorage.setItem('farm_dark', newDark);
      applyDark(newDark);
    });
  };

  return {
    formatRupiah, formatNumber, formatDate, formatDateShort, getMonthName,
    toast, showLoading, showEmpty, confirmDelete, sanitize, debounce,
    paginate, renderPagination, getCategoryBadge, exportExcel, exportPDF,
    setupSidebar
  };
})();

window.Utils = Utils;
