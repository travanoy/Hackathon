// ─── AI Task Dispatcher (Navigation & Staff Tasks page) ──────────────────────
// Gemini AI assigns tasks from employeeTaskQueue to employees based on:
//   1. Availability (status weight)
//   2. Proximity on the map
//   3. Load balancing

// ─── Config ───────────────────────────────────────────────────────────────────
const GEMINI_KEY = 'AIzaSyB7Su_C6IxirM3POoGFvqM1lD__koPE_9Q';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

// ─── State ────────────────────────────────────────────────────────────────────
let dispatchMode = 'proximity'; // 'proximity' | 'balance'

// ─── Scoring ──────────────────────────────────────────────────────────────────
const DISP_STATUS_WEIGHT = { 'Available': 1.0, 'On duty': 0.65, 'Busy': 0.0 };

function dispEuclidean(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function dispTaskCenter(task) {
  if (!task.points?.length) return { x: 50, y: 50 };
  return {
    x: task.points.reduce((s, p) => s + p.x, 0) / task.points.length,
    y: task.points.reduce((s, p) => s + p.y, 0) / task.points.length,
  };
}

function dispActiveCount(emp) {
  return emp.tasks.filter(t => t.status !== 'done').length;
}

function dispScore(emp, task, mode) {
  const sw = DISP_STATUS_WEIGHT[emp.status] ?? 0;
  if (sw === 0) return -1;
  const dist = dispEuclidean(emp.position, dispTaskCenter(task));
  const prox = 1 / (1 + dist / 25);
  const load = 1 / (1 + dispActiveCount(emp));
  return mode === 'proximity'
    ? sw * 0.3 + prox * 0.55 + load * 0.15
    : sw * 0.3 + prox * 0.15 + load * 0.55;
}

function dispRank(task, mode) {
  return [...employees]
    .map(e => ({ employee: e, score: dispScore(e, task, mode) }))
    .sort((a, b) => b.score - a.score);
}

function dispBest(task, mode) {
  const ranked = dispRank(task, mode);
  return ranked[0]?.score > 0 ? ranked[0].employee : null;
}

// ─── Gemini API ───────────────────────────────────────────────────────────────
async function askGeminiDisp(task, recommended, ranked) {
  const center = dispTaskCenter(task);
  const empList = ranked.slice(0, 5).map(({ employee: e, score }) => {
    const dist = Math.round(dispEuclidean(e.position, center));
    const scoreStr = score < 0 ? 'недоступен (занят)' : score.toFixed(2);
    return `• ${e.name} [${e.status}] — зона: ${e.zone}, активных задач: ${dispActiveCount(e)}, расстояние: ~${dist} ед., оценка: ${scoreStr}`;
  }).join('\n');

  const prompt = `Ты — умный диспетчер задач в магазине SuperMart. Объясни выбор сотрудника.

ЗАДАЧА: "${task.title}"
Зона: ${task.zone} | Срочность: ${task.status === 'active' ? 'Срочная' : 'Обычная'} | Позиция: (${Math.round(center.x)}, ${Math.round(center.y)})

РЕЙТИНГ СОТРУДНИКОВ:
${empList}

ВЫБРАН: ${recommended.name} (${recommended.status}, зона: ${recommended.zone})
РЕЖИМ: ${dispatchMode === 'proximity' ? 'По близости к задаче' : 'Равномерная нагрузка'}

Напиши 2-3 предложения — почему именно этот сотрудник лучший выбор. На русском языке, кратко и конкретно.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 250, temperature: 0.4 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || 'Gemini не вернул ответ.';
  } catch (err) {
    console.error('[Dispatcher] Gemini error:', err);
    return `⚠️ Gemini: ${err.message}. Алгоритм выбрал лучшего сотрудника самостоятельно.`;
  }
}

// ─── Assign logic ─────────────────────────────────────────────────────────────
function dispAssign(task, emp) {
  emp.tasks.unshift({
    title:      task.title,
    time:       task.time,
    status:     task.status,
    zone:       task.zone,
    assignedBy: 'AI',
  });
  task.state      = 'assigned';
  task.assignedTo = emp.id;
}

// ─── Render ───────────────────────────────────────────────────────────────────
const DISP_STATUS_EMOJI = { Available: '🟢', 'On duty': '🟡', Busy: '🔴' };
const DISP_STATUS_CLS   = { Available: 'emp-available', 'On duty': 'emp-onduty', Busy: 'emp-busy' };

function renderDispEmpGrid() {
  const grid = document.getElementById('dispatchEmpGrid');
  if (!grid) return;
  grid.innerHTML = employees.map(e => {
    const active = dispActiveCount(e);
    const pct    = Math.min(100, Math.round((active / 6) * 100));
    const cls    = DISP_STATUS_CLS[e.status] || 'emp-onduty';
    const barColor = pct > 80 ? '#dc2626' : pct > 50 ? '#d97706' : '#16a34a';
    return `
      <div class="disp-emp-card ${cls}">
        <div class="disp-emp-top">
          <span class="disp-emp-avatar">${e.name[0]}</span>
          <div>
            <div class="disp-emp-name">${e.name}</div>
            <div class="disp-emp-role">${e.role}</div>
          </div>
          <span class="disp-status-badge">${DISP_STATUS_EMOJI[e.status]} ${e.status}</span>
        </div>
        <div class="disp-emp-zone">📍 ${e.zone}</div>
        <div class="disp-load-row">
          <span>Нагрузка: ${active} задач</span><span>${pct}%</span>
        </div>
        <div class="disp-load-bar">
          <div class="disp-load-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
      </div>`;
  }).join('');
}

function renderDispTasks() {
  const list = document.getElementById('dispatchTaskList');
  if (!list) return;

  const pending = employeeTaskQueue.filter(t => t.state === 'new');

  if (!pending.length) {
    list.innerHTML = '<p class="disp-empty">✅ Все задачи распределены!</p>';
    return;
  }

  list.innerHTML = pending.map(task => {
    const best   = dispBest(task, dispatchMode);
    const ranked = dispRank(task, dispatchMode);
    const center = dispTaskCenter(task);
    const alts   = ranked.slice(1, 3).filter(r => r.score > 0)
      .map(r => `<span class="disp-alt">${r.employee.name} (${r.score.toFixed(2)})</span>`).join('');

    return `
      <div class="disp-task-card" data-taskid="${task.id}">
        <div class="disp-task-header">
          <div>
            <div class="disp-task-title">${task.title}</div>
            <div class="disp-task-meta">📍 ${task.zone} · 🕐 ${task.time} · ${task.status === 'active' ? '🔴 Срочная' : '🟡 Обычная'}</div>
          </div>
          <span class="disp-task-pos">pos (${Math.round(center.x)}, ${Math.round(center.y)})</span>
        </div>
        ${best ? `
          <div class="disp-recommend">
            <div class="disp-recommend-label">🤖 AI рекомендует:</div>
            <div class="disp-recommend-emp">
              <span class="disp-emp-dot ${DISP_STATUS_CLS[best.status]}"></span>
              <strong>${best.name}</strong>
              <span class="disp-emp-info">${best.status} · ${best.zone} · ${dispActiveCount(best)} задач</span>
            </div>
            ${alts ? `<div class="disp-alternatives">Альтернативы: ${alts}</div>` : ''}
          </div>
          <div class="disp-task-actions">
            <button class="btn-assign primary" data-taskid="${task.id}" data-empid="${best.id}">
              ⚡ Назначить ${best.name}
            </button>
            <button class="btn-ai-explain ghost" data-taskid="${task.id}" data-empid="${best.id}">
              💬 Объяснить AI
            </button>
          </div>
        ` : `<div class="disp-no-emp">⛔ Нет доступных сотрудников</div>`}
        <div class="disp-ai-reasoning hidden" id="reasoning-${task.id}"></div>
      </div>`;
  }).join('');

  list.querySelectorAll('.btn-assign').forEach(btn =>
    btn.addEventListener('click', handleDispAssign)
  );
  list.querySelectorAll('.btn-ai-explain').forEach(btn =>
    btn.addEventListener('click', handleDispExplain)
  );
}

function renderDispatcher() {
  renderDispEmpGrid();
  renderDispTasks();
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
async function handleDispAssign(e) {
  const btn    = e.currentTarget;
  const taskId = btn.dataset.taskid;
  const empId  = btn.dataset.empid;
  const task   = employeeTaskQueue.find(t => t.id === taskId);
  const emp    = employees.find(em => em.id === empId);
  if (!task || !emp) return;

  btn.disabled = true;
  btn.textContent = '✓ Назначено';
  btn.style.opacity = '0.6';
  dispAssign(task, emp);
  dispToast(`✅ «${task.title}» → ${emp.name}`);
  setTimeout(() => renderDispatcher(), 700);
}

async function handleDispExplain(e) {
  const btn       = e.currentTarget;
  const taskId    = btn.dataset.taskid;
  const empId     = btn.dataset.empid;
  const task      = employeeTaskQueue.find(t => t.id === taskId);
  const emp       = employees.find(em => em.id === empId);
  const reasonBox = document.getElementById(`reasoning-${taskId}`);
  if (!task || !emp || !reasonBox) return;

  btn.disabled = true;
  btn.textContent = '⏳ Спрашиваю AI...';
  reasonBox.classList.remove('hidden');
  reasonBox.innerHTML = '<div class="disp-thinking"><span></span><span></span><span></span></div>';

  const ranked = dispRank(task, dispatchMode);
  const text   = await askGeminiDisp(task, emp, ranked);

  reasonBox.innerHTML = `<div class="disp-ai-bubble">🤖 <strong>Gemini:</strong> ${text}</div>`;
  btn.textContent = '💬 Объяснить AI';
  btn.disabled    = false;
}

// ─── Assign All ───────────────────────────────────────────────────────────────
function dispAssignAll() {
  const pending = employeeTaskQueue.filter(t => t.state === 'new');
  let count = 0;
  pending.forEach(task => {
    const emp = dispBest(task, dispatchMode);
    if (emp) { dispAssign(task, emp); count++; }
  });
  dispToast(`✅ Распределено ${count} задач (режим: ${dispatchMode === 'proximity' ? 'По близости' : 'Балансировка'})`);
  setTimeout(() => renderDispatcher(), 400);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function dispToast(msg) {
  let wrap = document.getElementById('dispToastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'dispToastWrap';
    wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'background:#111827;color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.2);opacity:0;transform:translateX(40px);transition:opacity .3s,transform .3s;';
  wrap.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; });
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateX(40px)';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ─── Open / Close ─────────────────────────────────────────────────────────────
function openDispatcherPanel() {
  const panel = document.getElementById('dispatcherPanel');
  if (!panel) return;
  panel.classList.remove('hidden');
  renderDispatcher();
}

function closeDispatcherPanel() {
  const panel = document.getElementById('dispatcherPanel');
  if (panel) panel.classList.add('hidden');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
(function initDispatcher() {
  // Wait for DOM
  const run = () => {
    const openBtn    = document.getElementById('openDispatcher');
    const closeBtn   = document.getElementById('closeDispatcher');
    const assignAllB = document.getElementById('assignAllBtn');
    const overlay    = document.getElementById('dispatcherPanel');

    if (openBtn)    openBtn.addEventListener('click', openDispatcherPanel);
    if (closeBtn)   closeBtn.addEventListener('click', closeDispatcherPanel);
    if (assignAllB) assignAllB.addEventListener('click', dispAssignAll);
    if (overlay)    overlay.addEventListener('click', e => { if (e.target === overlay) closeDispatcherPanel(); });

    // Mode buttons
    document.querySelectorAll('.disp-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.disp-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dispatchMode = btn.dataset.mode;
        renderDispTasks();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDispatcherPanel();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
