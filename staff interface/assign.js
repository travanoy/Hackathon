// ─── AI Task Dispatcher ────────────────────────────────────────────────────
// Gemini AI assigns tasks based on:
//   1. Employee availability (status weight)
//   2. Proximity to task location on the map
//   3. Load balancing (equal distribution of active tasks)

'use strict';

// ─── Config ───────────────────────────────────────────────────────────────────
const GEMINI_KEY = 'AIzaSyB7Su_C6IxirM3POoGFvqM1lD__koPE_9Q';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

// ─── State ────────────────────────────────────────────────────────────────────
let dispatchMode = 'proximity'; // 'proximity' | 'balance'
let isDispatcherOpen = false;

// ─── Scoring helpers ──────────────────────────────────────────────────────────

const STATUS_WEIGHT = { 'Available': 1.0, 'On duty': 0.65, 'Busy': 0.0 };

function euclidean(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getTaskCenter(task) {
  if (!task.points?.length) return { x: 50, y: 50 };
  return {
    x: task.points.reduce((s, p) => s + p.x, 0) / task.points.length,
    y: task.points.reduce((s, p) => s + p.y, 0) / task.points.length,
  };
}

function getActiveCount(employee) {
  return employee.tasks.filter(t => t.status !== 'done').length;
}

function scoreEmployee(employee, task, mode) {
  const sw = STATUS_WEIGHT[employee.status] ?? 0;
  if (sw === 0) return -1; // Busy — skip

  const dist   = euclidean(employee.position, getTaskCenter(task));
  const prox   = 1 / (1 + dist / 25);          // 0..1, higher = closer
  const load   = 1 / (1 + getActiveCount(employee)); // 0..1, higher = less loaded

  if (mode === 'proximity') return sw * 0.3 + prox * 0.55 + load * 0.15;
  else                       return sw * 0.3 + prox * 0.15 + load * 0.55; // balance
}

function rankEmployees(task, mode) {
  return [...employees]
    .map(e => ({ employee: e, score: scoreEmployee(e, task, mode) }))
    .sort((a, b) => b.score - a.score);
}

function findBestEmployee(task, mode) {
  const ranked = rankEmployees(task, mode);
  return ranked[0]?.score > 0 ? ranked[0].employee : null;
}

// ─── Gemini AI ────────────────────────────────────────────────────────────────

async function askGemini(task, recommended, ranked) {
  const taskCenter = getTaskCenter(task);
  const empList = ranked.slice(0, 5).map(({ employee: e, score }) => {
    const dist = Math.round(euclidean(e.position, taskCenter));
    return `• ${e.name} [${e.status}] — зона: ${e.zone}, активных задач: ${getActiveCount(e)}, расстояние: ~${dist} ед., оценка: ${score < 0 ? 'недоступен (занят)' : score.toFixed(2)}`;
  }).join('\n');

  const prompt = `Ты — умный диспетчер задач магазина SuperMart. Тебе нужно объяснить назначение задачи.

ЗАДАЧА:
• Название: "${task.title}"
• Зона: ${task.zone}
• Статус: ${task.status === 'active' ? 'Срочная' : 'Обычная'}
• Позиция на карте: (${taskCenter.x.toFixed(0)}, ${taskCenter.y.toFixed(0)})

РЕЙТИНГ СОТРУДНИКОВ (топ-5):
${empList}

МОЙ АЛГОРИТМ ВЫБРАЛ: ${recommended.name} (${recommended.status}, зона: ${recommended.zone})
РЕЖИМ РАСПРЕДЕЛЕНИЯ: ${dispatchMode === 'proximity' ? 'По близости' : 'Равномерная нагрузка'}

Объясни в 2-3 коротких предложениях, ПОЧЕМУ выбран этот сотрудник. Учти его статус, близость и загруженность. Отвечай на русском языке. Будь конкретным и кратким.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 220, temperature: 0.35 },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Нет ответа от AI.';
  } catch (err) {
    return `⚠️ Gemini недоступен: ${err.message}. Алгоритм всё равно нашёл лучшего сотрудника.`;
  }
}

// ─── Assignment action ────────────────────────────────────────────────────────

function doAssign(task, employee) {
  employee.tasks.unshift({
    title:      task.title,
    time:       task.time,
    status:     task.status,
    zone:       task.zone,
    assignedBy: 'AI',
  });
  task.state      = 'assigned';
  task.assignedTo = employee.id;
}

// ─── Render helpers ───────────────────────────────────────────────────────────

const STATUS_EMOJI   = { Available: '🟢', 'On duty': '🟡', Busy: '🔴' };
const STATUS_CLASS   = { Available: 'emp-available', 'On duty': 'emp-onduty', Busy: 'emp-busy' };
const TASK_STATUS_RU = { active: 'Срочная', pending: 'Обычная', done: 'Выполнена' };

function renderEmployeeGrid() {
  const grid = document.getElementById('dispatchEmpGrid');
  if (!grid) return;

  grid.innerHTML = employees.map(e => {
    const active = getActiveCount(e);
    const max    = 6;
    const pct    = Math.min(100, Math.round((active / max) * 100));
    const cls    = STATUS_CLASS[e.status] || 'emp-onduty';
    return `
      <div class="disp-emp-card ${cls}" data-empid="${e.id}">
        <div class="disp-emp-top">
          <span class="disp-emp-avatar">${e.name[0]}</span>
          <div>
            <div class="disp-emp-name">${e.name}</div>
            <div class="disp-emp-role">${e.role}</div>
          </div>
          <span class="disp-status-badge">${STATUS_EMOJI[e.status]} ${e.status}</span>
        </div>
        <div class="disp-emp-zone">📍 ${e.zone}</div>
        <div class="disp-load-row">
          <span>Нагрузка: ${active} задач</span>
          <span>${pct}%</span>
        </div>
        <div class="disp-load-bar"><div class="disp-load-fill" style="width:${pct}%; background:${pct>80?'#dc2626':pct>50?'#d97706':'#16a34a'}"></div></div>
      </div>`;
  }).join('');
}

function renderPendingTasks() {
  const list = document.getElementById('dispatchTaskList');
  if (!list) return;

  const pending = employeeTaskQueue.filter(t => t.state === 'new');

  if (!pending.length) {
    list.innerHTML = '<p class="disp-empty">✅ Все задачи распределены!</p>';
    return;
  }

  list.innerHTML = pending.map(task => {
    const best   = findBestEmployee(task, dispatchMode);
    const ranked = rankEmployees(task, dispatchMode);
    const center = getTaskCenter(task);

    const alternativesHtml = ranked.slice(1, 3)
      .filter(r => r.score > 0)
      .map(r => `<span class="disp-alt">${r.employee.name} (${r.score.toFixed(2)})</span>`)
      .join('');

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
              <span class="disp-emp-dot ${STATUS_CLASS[best.status]}"></span>
              <strong>${best.name}</strong>
              <span class="disp-emp-info">${best.status} · ${best.zone} · ${getActiveCount(best)} задач</span>
            </div>
            ${alternativesHtml ? `<div class="disp-alternatives">Альтернативы: ${alternativesHtml}</div>` : ''}
          </div>
          <div class="disp-task-actions">
            <button class="btn-assign primary" data-taskid="${task.id}" data-empid="${best.id}">
              ⚡ Назначить ${best.name}
            </button>
            <button class="btn-ai-explain ghost" data-taskid="${task.id}" data-empid="${best.id}">
              💬 Объяснить AI
            </button>
          </div>
        ` : `
          <div class="disp-no-emp">⛔ Нет доступных сотрудников для этой задачи</div>
        `}
        <div class="disp-ai-reasoning hidden" id="reasoning-${task.id}"></div>
      </div>`;
  }).join('');

  // Bind buttons
  list.querySelectorAll('.btn-assign').forEach(btn => {
    btn.addEventListener('click', handleAssign);
  });
  list.querySelectorAll('.btn-ai-explain').forEach(btn => {
    btn.addEventListener('click', handleExplain);
  });
}

function renderDispatcher() {
  renderEmployeeGrid();
  renderPendingTasks();
}

// ─── Button handlers ──────────────────────────────────────────────────────────

async function handleAssign(e) {
  const taskId = e.currentTarget.dataset.taskid;
  const empId  = e.currentTarget.dataset.empid;
  const task   = employeeTaskQueue.find(t => t.id === taskId);
  const emp    = employees.find(em => em.id === empId);
  if (!task || !emp) return;

  e.currentTarget.disabled = true;
  e.currentTarget.textContent = '✓ Назначено';
  e.currentTarget.style.opacity = '0.6';

  doAssign(task, emp);

  // Flash notification
  showDispatchToast(`✅ Задача «${task.title}» → ${emp.name}`);

  setTimeout(() => renderDispatcher(), 800);
}

async function handleExplain(e) {
  const taskId = e.currentTarget.dataset.taskid;
  const empId  = e.currentTarget.dataset.empid;
  const task   = employees ? employeeTaskQueue.find(t => t.id === taskId) : null;
  const emp    = employees.find(em => em.id === empId);
  const reasonBox = document.getElementById(`reasoning-${taskId}`);
  if (!task || !emp || !reasonBox) return;

  e.currentTarget.disabled = true;
  e.currentTarget.textContent = '⏳ Спрашиваю AI...';
  reasonBox.classList.remove('hidden');
  reasonBox.innerHTML = '<div class="disp-thinking"><span></span><span></span><span></span></div>';

  const ranked = rankEmployees(task, dispatchMode);
  const text   = await askGemini(task, emp, ranked);

  reasonBox.innerHTML = `<div class="disp-ai-bubble">🤖 <strong>Gemini:</strong> ${text}</div>`;
  e.currentTarget.textContent = '💬 Объяснить AI';
  e.currentTarget.disabled = false;
}

// ─── Mode toggle ──────────────────────────────────────────────────────────────

function initModeToggle() {
  const btns = document.querySelectorAll('.disp-mode-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dispatchMode = btn.dataset.mode;
      renderPendingTasks();
    });
  });
}

// ─── Assign All (one-click) ────────────────────────────────────────────────────

function assignAll() {
  const pending = employeeTaskQueue.filter(t => t.state === 'new');
  let count = 0;
  for (const task of pending) {
    const emp = findBestEmployee(task, dispatchMode);
    if (emp) { doAssign(task, emp); count++; }
  }
  showDispatchToast(`✅ Распределено ${count} задач в режиме «${dispatchMode === 'proximity' ? 'По близости' : 'Балансировка'}»`);
  setTimeout(() => renderDispatcher(), 400);
}

// ─── Dispatcher panel toggle ──────────────────────────────────────────────────

function openDispatcher() {
  const panel = document.getElementById('dispatcherPanel');
  if (!panel) return;
  panel.classList.remove('hidden');
  isDispatcherOpen = true;
  renderDispatcher();
}

function closeDispatcher() {
  const panel = document.getElementById('dispatcherPanel');
  if (panel) panel.classList.add('hidden');
  isDispatcherOpen = false;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showDispatchToast(msg) {
  let container = document.getElementById('dispatchToast');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dispatchToast';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.style.cssText = 'background:#111827;color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:toastIn .3s ease;';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(110%)'; el.style.transition = '.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initDispatcher() {
  const openBtn    = document.getElementById('openDispatcher');
  const closeBtn   = document.getElementById('closeDispatcher');
  const assignAllB = document.getElementById('assignAllBtn');

  if (openBtn)    openBtn.addEventListener('click', openDispatcher);
  if (closeBtn)   closeBtn.addEventListener('click', closeDispatcher);
  if (assignAllB) assignAllB.addEventListener('click', assignAll);

  initModeToggle();

  // Close on overlay click
  const overlay = document.getElementById('dispatcherPanel');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeDispatcher();
    });
  }
}

document.addEventListener('DOMContentLoaded', initDispatcher);
