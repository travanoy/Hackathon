/* ===== dashboard.js ===== */
'use strict';

// ─── DATA ────────────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const RAW_PRODUCTS = [
  { id:'PRD-001', name:'Молоко 3.2%',       category:'Молочные',     quantity:142, expiry: fmt(addDays(today,-3)),  status:'active' },
  { id:'PRD-002', name:'Кефир 1%',           category:'Молочные',     quantity:5,   expiry: fmt(addDays(today, 4)),  status:'active' },
  { id:'PRD-003', name:'Куриная грудка',     category:'Мясо',         quantity:0,   expiry: fmt(addDays(today, 2)),  status:'out' },
  { id:'PRD-004', name:'Говядина (вырезка)', category:'Мясо',         quantity:34,  expiry: fmt(addDays(today, 6)),  status:'active' },
  { id:'PRD-005', name:'Сок яблочный 1л',   category:'Напитки',      quantity:210, expiry: fmt(addDays(today,120)), status:'active' },
  { id:'PRD-006', name:'Вода газированная',  category:'Напитки',      quantity:7,   expiry: fmt(addDays(today,365)), status:'active' },
  { id:'PRD-007', name:'Шоколад молочный',   category:'Кондитерские', quantity:0,   expiry: fmt(addDays(today, 90)), status:'discontinued' },
  { id:'PRD-008', name:'Пельмени сибирские', category:'Заморозка',    quantity:88,  expiry: fmt(addDays(today,180)), status:'active' },
  { id:'PRD-009', name:'Пицца замороженная', category:'Заморозка',    quantity:4,   expiry: fmt(addDays(today, 60)), status:'active' },
  { id:'PRD-010', name:'Греча',              category:'Бакалея',      quantity:320, expiry: fmt(addDays(today,400)), status:'active' },
  { id:'PRD-011', name:'Рис длиннозёрный',   category:'Бакалея',      quantity:6,   expiry: fmt(addDays(today,300)), status:'active' },
  { id:'PRD-012', name:'Масло сливочное',    category:'Молочные',     quantity:0,   expiry: fmt(addDays(today,-1)),  status:'out' },
  { id:'PRD-013', name:'Творог 5%',          category:'Молочные',     quantity:18,  expiry: fmt(addDays(today, 3)),  status:'active' },
  { id:'PRD-014', name:'Сыр гауда',          category:'Молочные',     quantity:55,  expiry: fmt(addDays(today, 25)), status:'active' },
  { id:'PRD-015', name:'Свинина рёбра',      category:'Мясо',         quantity:3,   expiry: fmt(addDays(today, 5)),  status:'active' },
  { id:'PRD-016', name:'Йогурт натуральный', category:'Молочные',     quantity:0,   expiry: fmt(addDays(today,-5)),  status:'out' },
  { id:'PRD-017', name:'Газировка Cola 0.5', category:'Напитки',      quantity:500, expiry: fmt(addDays(today,200)), status:'active' },
  { id:'PRD-018', name:'Чай чёрный 100п.',   category:'Бакалея',      quantity:74,  expiry: fmt(addDays(today,700)), status:'active' },
  { id:'PRD-019', name:'Конфеты ассорти',    category:'Кондитерские', quantity:2,   expiry: fmt(addDays(today, 45)), status:'active' },
  { id:'PRD-020', name:'Рыба хек',           category:'Заморозка',    quantity:0,   expiry: fmt(addDays(today, 90)), status:'discontinued' },
];

// ─── STATE ────────────────────────────────────────────────────────────────────
const state = {
  products: [...RAW_PRODUCTS],
  filtered:  [...RAW_PRODUCTS],
  search:    '',
  statusFilter: '',
  expiryFilter: '',
  sortCol:   'id',
  sortDir:   'asc',
  page:      1,
  pageSize:  8,
  editId:    null,
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $  = (id) => document.getElementById(id);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
function setCurrentDate() {
  const opts = { day:'numeric', month:'long', year:'numeric' };
  $('currentDate').textContent = today.toLocaleDateString('ru-RU', opts);
}

function expiryStatus(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.ceil((d - today) / 86400000);
  if (diff < 0)  return 'expired';
  if (diff <= 7) return 'expiring';
  return 'ok';
}

function fmtDateRu(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// ─── KPI CARDS ────────────────────────────────────────────────────────────────
function renderKPIs() {
  const products = state.products;
  const total      = products.length;
  const expiring   = products.filter(p => ['expired','expiring'].includes(expiryStatus(p.expiry))).length;
  const lowStock   = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
  const revenue    = (Math.random() * 200000 + 800000).toFixed(0);

  $('kpiTotalVal').textContent    = total;
  $('kpiExpiringVal').textContent = expiring;
  $('kpiLowVal').textContent      = lowStock;
  $('kpiRevenueVal').textContent  = '₽ ' + Number(revenue).toLocaleString('ru-RU');
}

// ─── SPARKLINES ───────────────────────────────────────────────────────────────
function drawSparkline(id, data, color) {
  const canvas = $(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function renderSparklines() {
  drawSparkline('sparkline1', [130,135,138,136,140,139,142], '#2563EB');
  drawSparkline('sparkline2', [2,4,3,5,6,7,8],               '#D97706');
  drawSparkline('sparkline3', [9,7,8,6,5,7,6],               '#DC2626');
  drawSparkline('sparkline4', [720000,780000,810000,760000,820000,850000,880000], '#16A34A');
}

// ─── SALES CHART ──────────────────────────────────────────────────────────────
let salesChartInst = null;

function genSalesData(days) {
  const labels = [], sales = [], returns = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    labels.push(d.toLocaleDateString('ru-RU', { day:'numeric', month:'short' }));
    sales.push(Math.round(Math.random() * 80000 + 60000));
    returns.push(Math.round(Math.random() * 8000 + 2000));
  }
  return { labels, sales, returns };
}

function renderSalesChart(period = 7) {
  const { labels, sales, returns } = genSalesData(period);
  if (salesChartInst) salesChartInst.destroy();
  const ctx = $('salesChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, 'rgba(37,99,235,.18)');
  grad.addColorStop(1, 'rgba(37,99,235,0)');
  salesChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Продажи',
          data: sales,
          borderColor: '#2563EB',
          backgroundColor: grad,
          borderWidth: 2.5,
          pointRadius: period <= 7 ? 4 : 2,
          pointBackgroundColor: '#2563EB',
          fill: true,
          tension: .35,
        },
        {
          label: 'Возвраты',
          data: returns,
          borderColor: '#DC2626',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: .35,
          borderDash: [4, 4],
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Inter', size: 12 }, color: '#6B7280', boxWidth: 12, padding: 16 },
        },
        tooltip: {
          backgroundColor: '#111827',
          titleFont: { family: 'Inter', size: 12 },
          bodyFont: { family: 'Inter', size: 12 },
          callbacks: {
            label: (c) => ` ${c.dataset.label}: ₽ ${c.raw.toLocaleString('ru-RU')}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#9CA3AF', maxTicksLimit: 10 },
        },
        y: {
          grid: { color: '#F3F4F6' },
          ticks: {
            font: { family: 'Inter', size: 11 }, color: '#9CA3AF',
            callback: (v) => '₽ ' + (v / 1000).toFixed(0) + 'k',
          },
        },
      },
    },
  });
}

// ─── CATEGORY DONUT ───────────────────────────────────────────────────────────
let catChartInst = null;

function renderCategoryChart() {
  const cats = {};
  state.products.forEach(p => {
    cats[p.category] = (cats[p.category] || 0) + Math.max(p.quantity, 5);
  });
  const labels = Object.keys(cats);
  const values = Object.values(cats);
  const colors = ['#2563EB','#16A34A','#D97706','#8B5CF6','#EC4899','#0891B2'];
  const total  = values.reduce((a,b) => a + b, 0);

  if (catChartInst) catChartInst.destroy();
  catChartInst = new Chart($('categoryChart').getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#111827',
        callbacks: { label: (c) => ` ${c.label}: ${Math.round(c.raw/total*100)}%` },
      }},
    },
  });

  const ul = $('categoryLegend');
  ul.innerHTML = labels.map((l, i) => `
    <li class="legend-item">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      ${l}
      <span class="legend-pct">${Math.round(values[i]/total*100)}%</span>
    </li>
  `).join('');
}

// ─── FILTERING / SORTING ──────────────────────────────────────────────────────
function applyFilters() {
  let list = [...state.products];
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }
  if (state.statusFilter) list = list.filter(p => p.status === state.statusFilter);
  if (state.expiryFilter) list = list.filter(p => expiryStatus(p.expiry) === state.expiryFilter);

  // sort
  list.sort((a, b) => {
    let va = a[state.sortCol], vb = b[state.sortCol];
    if (state.sortCol === 'quantity') { va = +va; vb = +vb; }
    if (state.sortCol === 'expiry')   { va = new Date(va); vb = new Date(vb); }
    if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
    if (va > vb) return state.sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  state.filtered = list;
  state.page = 1;
  renderTable();
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  active:       { label: 'В продаже',         cls: 'status-active' },
  out:          { label: 'Нет в наличии',      cls: 'status-out' },
  discontinued: { label: 'Снят с производства', cls: 'status-discontinued' },
};
const EXPIRY_MAP = {
  expired:  { cls: 'expiry-expired',  icon: '🔴' },
  expiring: { cls: 'expiry-expiring', icon: '🟡' },
  ok:       { cls: 'expiry-ok',       icon: '🟢' },
};

function renderTable() {
  const { filtered, page, pageSize } = state;
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  $('resultsCount').textContent = `Найдено: ${total}`;
  $('paginationInfo').textContent = total
    ? `Строки ${start + 1}–${Math.min(start + pageSize, total)} из ${total}`
    : 'Нет результатов';

  const tbody = $('tableBody');

  if (!slice.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>Товары не найдены. Измените параметры поиска.</p>
        </div>
      </td></tr>`;
    renderPagination(0, 1, 1);
    return;
  }

  tbody.innerHTML = slice.map(p => {
    const es = expiryStatus(p.expiry);
    const em = EXPIRY_MAP[es];
    const sm = STATUS_MAP[p.status] || STATUS_MAP.active;
    const qtyClass = p.quantity === 0 ? '' : p.quantity < 10 ? 'qty-low' : 'qty-ok';

    return `
      <tr data-id="${p.id}">
        <td class="td-id">${p.id}</td>
        <td class="td-name">
          ${p.name}
          <small>${p.category}</small>
        </td>
        <td class="td-qty ${qtyClass}">${p.quantity.toLocaleString('ru-RU')}</td>
        <td>
          <span class="expiry-badge ${em.cls}">
            <span class="expiry-dot"></span>
            ${fmtDateRu(p.expiry)}
          </span>
        </td>
        <td><span class="status-badge ${sm.cls}">${sm.label}</span></td>
        <td>
          <div class="action-group">
            <button class="action-btn edit-btn" data-id="${p.id}" title="Редактировать" aria-label="Редактировать ${p.name}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn action-btn--danger delete-btn" data-id="${p.id}" title="Удалить" aria-label="Удалить ${p.name}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderPagination(total, page, pages);
  updateSortHeaders();
}

function renderPagination(total, page, pages) {
  $('prevPage').disabled = page <= 1;
  $('nextPage').disabled = page >= pages;

  const nums = $('pageNumbers');
  nums.innerHTML = '';
  const range = [...new Set([1, page - 1, page, page + 1, pages].filter(n => n >= 1 && n <= pages))].sort((a,b)=>a-b);
  let prev = 0;
  range.forEach(n => {
    if (prev && n - prev > 1) {
      const dots = document.createElement('span');
      dots.textContent = '…'; dots.style.padding = '0 4px'; dots.style.color = '#9CA3AF';
      nums.appendChild(dots);
    }
    const btn = document.createElement('button');
    btn.className = 'page-num' + (n === page ? ' active' : '');
    btn.textContent = n;
    btn.dataset.page = n;
    btn.addEventListener('click', () => { state.page = n; renderTable(); });
    nums.appendChild(btn);
    prev = n;
  });
}

function updateSortHeaders() {
  $$('th[data-col]').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.col === state.sortCol) {
      th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function openModal(product = null) {
  state.editId = product ? product.id : null;
  $('modalTitle').textContent = product ? 'Редактировать товар' : 'Добавить товар';
  $('mProductName').value = product ? product.name     : '';
  $('mQuantity').value    = product ? product.quantity : '';
  $('mExpiry').value      = product ? product.expiry   : '';
  $('mStatus').value      = product ? product.status   : 'active';
  $('mCategory').value    = product ? product.category : 'Молочные';
  $('modalOverlay').classList.remove('hidden');
  $('mProductName').focus();
}

function closeModal() { $('modalOverlay').classList.add('hidden'); }

function saveModal() {
  const name     = $('mProductName').value.trim();
  const quantity = parseInt($('mQuantity').value, 10);
  const expiry   = $('mExpiry').value;
  const status   = $('mStatus').value;
  const category = $('mCategory').value;

  if (!name) { showToast('Введите название товара', 'warn'); return; }
  if (isNaN(quantity) || quantity < 0) { showToast('Укажите корректное количество', 'warn'); return; }
  if (!expiry) { showToast('Укажите срок годности', 'warn'); return; }

  if (state.editId) {
    const idx = state.products.findIndex(p => p.id === state.editId);
    if (idx !== -1) state.products[idx] = { ...state.products[idx], name, quantity, expiry, status, category };
    showToast('Товар обновлён', 'success');
  } else {
    const newId = 'PRD-' + String(state.products.length + 1).padStart(3, '0');
    state.products.push({ id: newId, name, category, quantity, expiry, status });
    showToast('Товар добавлен', 'success');
  }

  closeModal();
  applyFilters();
  renderKPIs();
  renderCategoryChart();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'default') {
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  $('toastContainer').appendChild(t);
  setTimeout(() => {
    t.classList.add('toast-out');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────
function initEvents() {
  // search
  $('searchInput').addEventListener('input', (e) => {
    state.search = e.target.value;
    $('searchClear').classList.toggle('hidden', !state.search);
    applyFilters();
  });
  $('searchClear').addEventListener('click', () => {
    $('searchInput').value = '';
    state.search = '';
    $('searchClear').classList.add('hidden');
    applyFilters();
  });

  // filters
  $('statusFilter').addEventListener('change', (e) => { state.statusFilter = e.target.value; applyFilters(); });
  $('expiryFilter').addEventListener('change', (e) => { state.expiryFilter = e.target.value; applyFilters(); });
  $('resetFilters').addEventListener('click', () => {
    state.search = ''; state.statusFilter = ''; state.expiryFilter = '';
    $('searchInput').value = '';
    $('statusFilter').value = '';
    $('expiryFilter').value = '';
    $('searchClear').classList.add('hidden');
    applyFilters();
  });

  // sort
  $$('th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      if (state.sortCol === th.dataset.col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortCol = th.dataset.col;
        state.sortDir = 'asc';
      }
      applyFilters();
    });
  });

  // pagination
  $('prevPage').addEventListener('click', () => { if (state.page > 1) { state.page--; renderTable(); } });
  $('nextPage').addEventListener('click', () => {
    const pages = Math.ceil(state.filtered.length / state.pageSize);
    if (state.page < pages) { state.page++; renderTable(); }
  });

  // table actions (delegated)
  $('tableBody').addEventListener('click', (e) => {
    const editBtn   = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      openModal(state.products.find(p => p.id === id));
    }
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const p  = state.products.find(p => p.id === id);
      if (confirm(`Удалить «${p?.name}»?`)) {
        state.products = state.products.filter(p => p.id !== id);
        applyFilters();
        renderKPIs();
        showToast('Товар удалён', 'error');
      }
    }
  });

  // modal
  $('addProductBtn').addEventListener('click', () => openModal());
  $('modalClose').addEventListener('click', closeModal);
  $('modalCancel').addEventListener('click', closeModal);
  $('modalSave').addEventListener('click', saveModal);
  $('modalOverlay').addEventListener('click', (e) => { if (e.target === $('modalOverlay')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // period buttons
  $$('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSalesChart(+btn.dataset.period);
    });
  });

  // export (demo)
  $('exportBtn').addEventListener('click', () => showToast('Экспорт выполнен (демо)', 'success'));

  const mapControlBtn = $('mapControlBtn');
  if (mapControlBtn) {
    mapControlBtn.addEventListener('click', () => {
      window.location.href = '../map tracking/index.html';
    });
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  setCurrentDate();
  renderKPIs();
  renderSparklines();
  renderSalesChart(7);
  renderCategoryChart();
  applyFilters();
  initEvents();
}

document.addEventListener('DOMContentLoaded', init);
