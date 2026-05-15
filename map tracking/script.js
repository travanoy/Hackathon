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
const toggleLegend       = document.getElementById("toggleLegend");
const mapView            = document.getElementById("mapView");
const tasksView          = document.getElementById("tasksView");
const closeTasksPanel    = document.getElementById("closeTasksPanel");
const tasksTable         = document.getElementById("tasksTable");
const assigneeFilter     = document.getElementById("assigneeFilter");
const statusFilter       = document.getElementById("statusFilter");
const searchInput        = document.getElementById("searchInput");
const backToDashboard    = document.getElementById("backToDashboard");

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

if (toggleLegend && legend) {
	toggleLegend.addEventListener("click", () => {
		legend.classList.toggle("hidden");
		toggleLegend.textContent = legend.classList.contains("hidden")
			? "Show legend"
			: "Hide legend";
	});
}

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
