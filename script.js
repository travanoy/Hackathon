const employees = [
	{
		id: "emp-1",
		name: "Alexei S.",
		role: "Electronics Lead",
		status: "On duty",
		zone: "Electronics",
		position: { x: 16, y: 28 },
		tasks: [
			{ title: "Display check", time: "09:10", status: "active" },
			{ title: "Demo unit reset", time: "09:40", status: "pending" },
			{ title: "Inventory scan", time: "10:20", status: "active" },
			{ title: "Promo signage", time: "10:50", status: "pending" },
			{ title: "Aisle tidy", time: "11:20", status: "done" },
		],
	},
	{
		id: "emp-2",
		name: "Olga P.",
		role: "Apparel Associate",
		status: "On duty",
		zone: "Apparel",
		position: { x: 45, y: 24 },
		tasks: [
			{ title: "Size restock", time: "09:30", status: "active" },
			{ title: "Fitting room check", time: "10:05", status: "pending" },
			{ title: "Fold tables", time: "10:45", status: "active" },
			{ title: "New arrivals rack", time: "11:15", status: "pending" },
			{ title: "Returns audit", time: "11:50", status: "done" },
		],
	},
	{
		id: "emp-3",
		name: "Maria L.",
		role: "Grocery Associate",
		status: "On duty",
		zone: "Grocery",
		position: { x: 70, y: 30 },
		tasks: [
			{ title: "Cooler temp log", time: "09:15", status: "done" },
			{ title: "End-cap refill", time: "09:55", status: "active" },
			{ title: "Freshness check", time: "10:35", status: "pending" },
			{ title: "Planogram update", time: "11:05", status: "active" },
			{ title: "Backroom pull", time: "11:40", status: "pending" },
		],
	},
	{
		id: "emp-4",
		name: "Ivan K.",
		role: "Checkout Lead",
		status: "Busy",
		zone: "Checkout",
		position: { x: 28, y: 63 },
		tasks: [
			{ title: "Register balance", time: "12:05", status: "pending" },
			{ title: "Queue support", time: "12:20", status: "active" },
			{ title: "Refund approval", time: "12:35", status: "pending" },
			{ title: "Shift handoff", time: "12:55", status: "active" },
			{ title: "Receipt audit", time: "13:15", status: "done" },
		],
	},
	{
		id: "emp-5",
		name: "Maria L.",
		role: "Front Desk",
		status: "Available",
		zone: "Restrooms",
		position: { x: 22, y: 82 },
		tasks: [
			{ title: "Restroom check", time: "12:10", status: "active" },
			{ title: "Signage update", time: "12:30", status: "pending" },
			{ title: "Lost & found", time: "12:45", status: "pending" },
			{ title: "Front cleanup", time: "13:05", status: "active" },
			{ title: "Entrance assist", time: "13:30", status: "done" },
		],
	},
];

const cameras = [
	{
		id: "cam-1",
		name: "Camera C5",
		zone: "Electronics",
		label: "C5",
		position: { x: 6, y: 8 },
	},
	{
		id: "cam-2",
		name: "Camera C3",
		zone: "Electronics",
		label: "C3",
		position: { x: 28, y: 6 },
	},
	{
		id: "cam-3",
		name: "Camera C4",
		zone: "Apparel",
		label: "C4",
		position: { x: 46, y: 6 },
	},
	{
		id: "cam-4",
		name: "Camera C7",
		zone: "Grocery",
		label: "C7",
		position: { x: 66, y: 6 },
	},
	{
		id: "cam-5",
		name: "Camera C7",
		zone: "Grocery",
		label: "C7",
		position: { x: 84, y: 6 },
	},
	{
		id: "cam-6",
		name: "Camera C8",
		zone: "Electronics",
		label: "C8",
		position: { x: 6, y: 38 },
	},
	{
		id: "cam-7",
		name: "Camera C7",
		zone: "Checkout",
		label: "C7",
		position: { x: 12, y: 62 },
	},
	{
		id: "cam-8",
		name: "Camera C10",
		zone: "Entrance",
		label: "C10",
		position: { x: 42, y: 74 },
	},
	{
		id: "cam-9",
		name: "Camera C5",
		zone: "Entrance",
		label: "C5",
		position: { x: 54, y: 78 },
	},
	{
		id: "cam-10",
		name: "Camera C7",
		zone: "Warehouse",
		label: "C7",
		position: { x: 96, y: 24 },
	},
];

const markersRoot = document.getElementById("markers");
const panelTitle = document.getElementById("panelTitle");
const panelSubtitle = document.getElementById("panelSubtitle");
const panelContent = document.getElementById("panelContent");
const legend = document.getElementById("legend");
const toggleLegend = document.getElementById("toggleLegend");
const mapView = document.getElementById("mapView");
const tasksView = document.getElementById("tasksView");
const openTasks = document.getElementById("openTasks");
const closeTasksPanel = document.getElementById("closeTasksPanel");
const tasksTable = document.getElementById("tasksTable");
const assigneeFilter = document.getElementById("assigneeFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");

let selectedMarkerId = null;

const statusLabels = {
	active: "In progress",
	pending: "Pending",
	done: "Done",
};

const statusClass = {
	active: "active",
	pending: "pending",
	done: "done",
};

const renderMarkers = () => {
	markersRoot.innerHTML = "";

	employees.forEach((employee) => {
		const marker = createMarker(
			"employee",
			employee.id,
			employee.name,
			employee.position
		);
		marker.addEventListener("click", () => selectEmployee(employee.id));
		markersRoot.appendChild(marker);
	});

	cameras.forEach((camera) => {
		const marker = createMarker(
			"camera",
			camera.id,
			camera.label,
			camera.position
		);
		marker.addEventListener("click", () => selectCamera(camera.id));
		markersRoot.appendChild(marker);
	});
};

const createMarker = (type, id, label, position) => {
	const marker = document.createElement("div");
	marker.className = `marker ${type}`;
	marker.dataset.id = id;
	marker.style.left = `${position.x}%`;
	marker.style.top = `${position.y}%`;

	const pin = document.createElement("div");
	pin.className = "pin";
	if (type === "employee" && label) {
		pin.innerHTML = `<span>${label[0]}</span>`;
	}

	marker.appendChild(pin);
	if (type === "employee") {
		const tag = document.createElement("div");
		tag.className = "label";
		tag.textContent = label || "Staff";
		marker.appendChild(tag);
	}
	if (type === "camera") {
		const tag = document.createElement("div");
		tag.className = "label camera-label";
		tag.textContent = label;
		marker.appendChild(tag);
	}
	return marker;
};

const clearFocus = () => {
	document.querySelectorAll(".marker").forEach((marker) => {
		marker.classList.remove("focus");
	});
};

const selectEmployee = (employeeId) => {
	const employee = employees.find((item) => item.id === employeeId);
	if (!employee) return;

	selectedMarkerId = employeeId;
	clearFocus();
	const marker = document.querySelector(`[data-id="${employeeId}"]`);
	if (marker) marker.classList.add("focus");

	panelTitle.textContent = employee.name;
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

	const taskForm = document.getElementById("taskForm");
	taskForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const formData = new FormData(taskForm);
		employee.tasks.unshift({
			title: formData.get("title"),
			time: formData.get("time"),
			status: formData.get("status"),
		});
		selectEmployee(employeeId);
		renderTasksTable();
	});
};

const selectCamera = (cameraId) => {
	const camera = cameras.find((item) => item.id === cameraId);
	if (!camera) return;

	selectedMarkerId = cameraId;
	clearFocus();
	const marker = document.querySelector(`[data-id="${cameraId}"]`);
	if (marker) marker.classList.add("focus");

	panelTitle.textContent = camera.name;
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

const buildTaskRows = (tasks) => {
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

const getAllTasks = () =>
	employees.flatMap((employee) =>
		employee.tasks.map((task, index) => ({
			id: `${employee.id}-${index}`,
			title: task.title,
			time: task.time,
			status: task.status,
			assignee: employee.name,
		}))
	);

const renderTasksTable = () => {
	const searchValue = searchInput.value.trim().toLowerCase();
	const statusValue = statusFilter.value;
	const assigneeValue = assigneeFilter.value;

	const allTasks = getAllTasks();
	const filtered = allTasks.filter((task) => {
		const matchesSearch = task.title.toLowerCase().includes(searchValue);
		const matchesStatus = statusValue ? task.status === statusValue : true;
		const matchesAssignee = assigneeValue ? task.assignee === assigneeValue : true;
		return matchesSearch && matchesStatus && matchesAssignee;
	});

	buildTaskRows(filtered);
};

const populateAssignees = () => {
	assigneeFilter.innerHTML = `<option value="">All assignees</option>`;
	employees.forEach((employee) => {
		const option = document.createElement("option");
		option.value = employee.name;
		option.textContent = employee.name;
		assigneeFilter.appendChild(option);
	});
};

const toggleTasksPanel = (isOpen) => {
	mapView.classList.toggle("hidden", isOpen);
	tasksView.classList.toggle("active", isOpen);
};

toggleLegend.addEventListener("click", () => {
	legend.classList.toggle("hidden");
	toggleLegend.textContent = legend.classList.contains("hidden")
		? "Show legend"
		: "Hide legend";
});

openTasks.addEventListener("click", () => {
	toggleTasksPanel(true);
	renderTasksTable();
});

closeTasksPanel.addEventListener("click", () => toggleTasksPanel(false));

[searchInput, statusFilter, assigneeFilter].forEach((input) => {
	input.addEventListener("input", renderTasksTable);
	input.addEventListener("change", renderTasksTable);
});

renderMarkers();
populateAssignees();
