// ─── Manager view script ────────────────────────────────────────────────────
// Requires: data.js loaded before this file

// ─── DOM refs ───────────────────────────────────────────────────────────────
const managerMarkersRoot = document.getElementById("managerMarkers");
const panelTitle         = document.getElementById("panelTitle");
const panelSubtitle      = document.getElementById("panelSubtitle");
const panelContent       = document.getElementById("panelContent");
const tasksSummary       = document.getElementById("tasksSummary");
const priorityList       = document.getElementById("priorityList");
const legend             = document.getElementById("legend");

const mapView            = document.getElementById("mapView");
const tasksView          = document.getElementById("tasksView");
const closeTasksPanel    = document.getElementById("closeTasksPanel");
const tasksTable         = document.getElementById("tasksTable");
const assigneeFilter     = document.getElementById("assigneeFilter");
const statusFilter       = document.getElementById("statusFilter");
const searchInput        = document.getElementById("searchInput");
const backToDashboard    = document.getElementById("backToDashboard");
const openAllTasksBtn    = document.getElementById("openAllTasks");

let selectedMarkerId = null;

// ─── Marker helpers ──────────────────────────────────────────────────────────

const createMarker = (type, id, label, position) => {
	const marker = document.createElement("div");
	marker.className = `marker ${type}`;
	marker.dataset.id = id;
	marker.style.left = `${position.x}%`;
	marker.style.top  = `${position.y}%`;

	const pin = document.createElement("div");
	pin.className = "pin";
	if (type === "employee" && label) {
		pin.innerHTML = `<span>${label[0]}</span>`;
	}
	marker.appendChild(pin);

	const tag = document.createElement("div");
	tag.className = type === "camera" ? "label camera-label" : "label";
	tag.textContent = label || "Staff";
	marker.appendChild(tag);

	return marker;
};

const clearFocus = () => {
	if (!managerMarkersRoot) return;
	managerMarkersRoot.querySelectorAll(".marker").forEach((m) =>
		m.classList.remove("focus")
	);
};

// ─── Render markers ──────────────────────────────────────────────────────────

const renderManagerMarkers = () => {
	if (!managerMarkersRoot) return;
	managerMarkersRoot.innerHTML = "";

	employees.forEach((employee) => {
		const marker = createMarker("employee", employee.id, employee.name, employee.position);
		marker.addEventListener("click", () => selectEmployee(employee.id));
		managerMarkersRoot.appendChild(marker);
	});

	cameras.forEach((camera) => {
		const marker = createMarker("camera", camera.id, camera.label, camera.position);
		marker.addEventListener("click", () => selectCamera(camera.id));
		managerMarkersRoot.appendChild(marker);
	});
};

// ─── Side-panel: employee ────────────────────────────────────────────────────

const selectEmployee = (employeeId) => {
	if (!managerMarkersRoot || !panelTitle || !panelSubtitle || !panelContent) return;

	const employee = employees.find((e) => e.id === employeeId);
	if (!employee) return;

	selectedMarkerId = employeeId;
	clearFocus();
	const marker = managerMarkersRoot.querySelector(`[data-id="${employeeId}"]`);
	if (marker) marker.classList.add("focus");

	panelTitle.textContent    = employee.name;
	panelSubtitle.textContent = `${employee.role} · ${employee.zone}`;

	panelContent.innerHTML = `
		<div class="info-card">
			<h3>Profile</h3>
			<div class="meta">
				<span>Status: ${employee.status}</span>
				<span>Zone: ${employee.zone}</span>
			</div>
		</div>
		<div class="info-card">
			<h3>Current tasks</h3>
			<div class="tasks">
				${employee.tasks
					.map(
						(task) => `
					<div class="task-item">
						<div>
							<div class="task-title">${task.title}</div>
							<div class="task-meta">${task.time}</div>
						</div>
						<span class="status ${statusClass[task.status]}">
							${statusLabels[task.status]}
						</span>
					</div>`
					)
					.join("")}
			</div>
		</div>
		<div class="info-card">
			<h3>Add task</h3>
			<form class="task-form" id="taskForm">
				<input type="text" name="title" placeholder="Task title" required />
				<input type="time" name="time" required />
				<select name="status">
					<option value="active">In progress</option>
					<option value="pending">Pending</option>
					<option value="done">Done</option>
				</select>
				<button class="primary" type="submit">Add</button>
			</form>
		</div>
	`;

	document.getElementById("taskForm").addEventListener("submit", (event) => {
		event.preventDefault();
		const fd = new FormData(event.currentTarget);
		employee.tasks.unshift({
			title:  fd.get("title"),
			time:   fd.get("time"),
			status: fd.get("status"),
			zone:   employee.zone,
		});
		selectEmployee(employeeId);
		renderPriorityPreview();
		renderTasksTable();
	});
};

// ─── Side-panel: camera ──────────────────────────────────────────────────────

const selectCamera = (cameraId) => {
	if (!managerMarkersRoot || !panelTitle || !panelSubtitle || !panelContent) return;

	const camera = cameras.find((c) => c.id === cameraId);
	if (!camera) return;

	selectedMarkerId = cameraId;
	clearFocus();
	const marker = managerMarkersRoot.querySelector(`[data-id="${cameraId}"]`);
	if (marker) marker.classList.add("focus");

	panelTitle.textContent    = camera.name;
	panelSubtitle.textContent = `Zone: ${camera.zone}`;

	panelContent.innerHTML = `
		<div class="info-card">
			<h3>Camera view</h3>
			<div class="camera-preview">LIVE FEED</div>
			<div class="meta">Click other cameras to switch</div>
		</div>
		<div class="info-card">
			<h3>Events</h3>
			<div class="tasks">
				<div class="task-item">
					<div>
						<div class="task-title">Stream stable</div>
						<div class="task-meta">Updated 2 min ago</div>
					</div>
					<span class="status done">OK</span>
				</div>
				<div class="task-item">
					<div>
						<div class="task-title">Zone monitoring</div>
						<div class="task-meta">AI tracking enabled</div>
					</div>
					<span class="status active">LIVE</span>
				</div>
			</div>
		</div>
	`;
};

// ─── Tasks table ─────────────────────────────────────────────────────────────

const getAllTasks = () =>
	employees.flatMap((employee) =>
		employee.tasks.map((task, index) => ({
			id:       `${employee.id}-${index}`,
			title:    task.title,
			time:     task.time,
			status:   task.status,
			assignee: employee.name,
		}))
	);

const buildTaskRows = (tasks) => {
	if (!tasksTable) return;
	const rows = tasks
		.map(
			(task) => `
			<div class="table-row">
				<div>${task.title}</div>
				<div>${task.assignee}</div>
				<div>${task.time}</div>
				<div>
					<span class="status ${statusClass[task.status]}">
						${statusLabels[task.status]}
					</span>
				</div>
			</div>
		`
		)
		.join("");

	tasksTable.innerHTML = `
		<div class="table-row header">
			<div>Task</div>
			<div>Assignee</div>
			<div>Time</div>
			<div>Status</div>
		</div>
		${rows || "<p>No tasks match the selected filters.</p>"}
	`;
};

const renderTasksTable = () => {
	if (!searchInput || !statusFilter || !assigneeFilter || !tasksTable) return;
	const searchValue   = searchInput.value.trim().toLowerCase();
	const statusValue   = statusFilter.value;
	const assigneeValue = assigneeFilter.value;

	const allTasks = getAllTasks();
	const filtered = allTasks.filter((task) => {
		const matchesSearch   = task.title.toLowerCase().includes(searchValue);
		const matchesStatus   = statusValue   ? task.status   === statusValue   : true;
		const matchesAssignee = assigneeValue ? task.assignee === assigneeValue : true;
		return matchesSearch && matchesStatus && matchesAssignee;
	});

	buildTaskRows(filtered);
};

const populateAssignees = () => {
	if (!assigneeFilter) return;
	assigneeFilter.innerHTML = `<option value="">All assignees</option>`;
	employees.forEach((employee) => {
		const option = document.createElement("option");
		option.value       = employee.name;
		option.textContent = employee.name;
		assigneeFilter.appendChild(option);
	});
};

// ─── Priority preview (side panel default state) ─────────────────────────────

const renderPriorityPreview = () => {
	const allTasks = getAllTasks();
	const sorted = [...allTasks].sort((a, b) => {
		const diff = priorityOrder[a.status] - priorityOrder[b.status];
		return diff !== 0 ? diff : a.time.localeCompare(b.time);
	});

	const top = sorted.slice(0, 4);
	if (tasksSummary) tasksSummary.textContent = `Total tasks: ${allTasks.length}`;

	if (priorityList) {
		priorityList.innerHTML = top
			.map(
				(task) => `
			<div class="priority-item">
				<div>
					<div class="task-title">${task.title}</div>
					<span>${task.assignee} · ${task.time}</span>
				</div>
				<span class="status ${statusClass[task.status]}">${statusLabels[task.status]}</span>
			</div>
		`
			)
			.join("");
	}
};

// ─── Tasks panel toggle ───────────────────────────────────────────────────────

const toggleTasksPanel = (isOpen) => {
	if (!mapView || !tasksView) return;
	mapView.classList.toggle("hidden", isOpen);
	tasksView.classList.toggle("active", isOpen);
};

// ─── Event listeners ──────────────────────────────────────────────────────────



if (closeTasksPanel) {
	closeTasksPanel.addEventListener("click", () => toggleTasksPanel(false));
}

[searchInput, statusFilter, assigneeFilter]
	.filter(Boolean)
	.forEach((input) => {
		input.addEventListener("input",  renderTasksTable);
		input.addEventListener("change", renderTasksTable);
	});

if (backToDashboard) {
	backToDashboard.addEventListener("click", () => {
		window.location.href = "../dashboard/dashboard.html";
	});
}

// ─── Init ─────────────────────────────────────────────────────────────────────

renderManagerMarkers();
populateAssignees();
renderPriorityPreview();

// ─── All Tasks Modal ──────────────────────────────────────────────────────────

const allTasksOverlay  = document.getElementById("allTasksOverlay");
const allTasksBody     = document.getElementById("allTasksBody");
const allTasksSearchEl = document.getElementById("allTasksSearch");
const allTasksEmpEl    = document.getElementById("allTasksEmployee");
const allTasksStatusEl = document.getElementById("allTasksStatus");

const STATUS_RU = { active: "In progress", pending: "Pending", done: "Done" };
const STATUS_CLS = { active: "active", pending: "pending", done: "done" };

function populateAllTasksFilters() {
	if (!allTasksEmpEl) return;
	allTasksEmpEl.innerHTML = `<option value="">All employees</option>`;
	employees.forEach(e => {
		const opt = document.createElement("option");
		opt.value = e.id;
		opt.textContent = e.name;
		allTasksEmpEl.appendChild(opt);
	});
}

function renderAllTasks() {
	if (!allTasksBody) return;
	const search = allTasksSearchEl?.value.trim().toLowerCase() || "";
	const empFilter = allTasksEmpEl?.value || "";
	const stFilter  = allTasksStatusEl?.value || "";

	const rows = [];
	employees.forEach(emp => {
		if (empFilter && emp.id !== empFilter) return;
		emp.tasks.forEach(task => {
			if (stFilter && task.status !== stFilter) return;
			if (search && !task.title.toLowerCase().includes(search) && !emp.name.toLowerCase().includes(search)) return;
			rows.push({ emp, task });
		});
	});

	if (!rows.length) {
		allTasksBody.innerHTML = `<p style="color:#9ca3af;text-align:center;padding:32px">No tasks match the filters.</p>`;
		return;
	}

	// Group by employee
	const grouped = {};
	rows.forEach(({ emp, task }) => {
		if (!grouped[emp.id]) grouped[emp.id] = { emp, tasks: [] };
		grouped[emp.id].tasks.push(task);
	});

	// Render — first group open, rest collapsed
	allTasksBody.innerHTML = Object.values(grouped).map(({ emp, tasks }, idx) => `
		<div class="at-group ${idx !== 0 ? 'at-collapsed' : ''}" data-empid="${emp.id}">
			<div class="at-emp-header at-clickable" role="button" tabindex="0" aria-expanded="${idx === 0}">
				<span class="at-avatar">${emp.name[0]}</span>
				<div class="at-emp-info">
					<strong>${emp.name}</strong>
					<span class="at-emp-meta">${emp.role} · ${emp.zone} · <em>${emp.status}</em></span>
				</div>
				<span class="at-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
				<span class="at-chevron" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
				</span>
			</div>
			<div class="at-task-list">
				${tasks.map(t => `
					<div class="at-task-row">
						<div>
							<div class="at-task-title">${t.title}</div>
							<div class="at-task-meta">${t.zone} · ${t.time}${t.assignedBy ? ' · <span class="at-ai-badge">🤖 AI</span>' : ''}</div>
						</div>
						<span class="status ${STATUS_CLS[t.status]}">${STATUS_RU[t.status]}</span>
					</div>
				`).join('')}
			</div>
		</div>
	`).join('');

	// Bind accordion clicks
	allTasksBody.querySelectorAll('.at-emp-header.at-clickable').forEach(header => {
		const toggle = () => {
			const group = header.closest('.at-group');
			const isCollapsed = group.classList.toggle('at-collapsed');
			header.setAttribute('aria-expanded', String(!isCollapsed));
		};
		header.addEventListener('click', toggle);
		header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
	});
}

function openAllTasksModal() {
	if (!allTasksOverlay) return;
	populateAllTasksFilters();
	renderAllTasks();
	allTasksOverlay.classList.remove("hidden");
}

function closeAllTasksModal() {
	if (allTasksOverlay) allTasksOverlay.classList.add("hidden");
}

if (openAllTasksBtn) openAllTasksBtn.addEventListener("click", openAllTasksModal);
const closeAllTasksBtn = document.getElementById("closeAllTasks");
if (closeAllTasksBtn) closeAllTasksBtn.addEventListener("click", closeAllTasksModal);
if (allTasksOverlay) allTasksOverlay.addEventListener("click", e => { if (e.target === allTasksOverlay) closeAllTasksModal(); });
[allTasksSearchEl, allTasksEmpEl, allTasksStatusEl].filter(Boolean).forEach(el => {
	el.addEventListener("input",  renderAllTasks);
	el.addEventListener("change", renderAllTasks);
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAllTasksModal(); });
