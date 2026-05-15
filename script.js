const employees = [
	{
		id: "emp-1",
		name: "Alexei S.",
		role: "Electronics Lead",
		status: "On duty",
		zone: "Electronics",
		position: { x: 16, y: 28 },
		tasks: [
			{ title: "Display check", time: "09:10", status: "active", zone: "Electronics" },
			{ title: "Demo unit reset", time: "09:40", status: "pending", zone: "Electronics" },
			{ title: "Inventory scan", time: "10:20", status: "active", zone: "Electronics" },
			{ title: "Promo signage", time: "10:50", status: "pending", zone: "Electronics" },
			{ title: "Aisle tidy", time: "11:20", status: "done", zone: "Electronics" },
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
			{ title: "Size restock", time: "09:30", status: "active", zone: "Apparel" },
			{ title: "Fitting room check", time: "10:05", status: "pending", zone: "Apparel" },
			{ title: "Fold tables", time: "10:45", status: "active", zone: "Apparel" },
			{ title: "New arrivals rack", time: "11:15", status: "pending", zone: "Apparel" },
			{ title: "Returns audit", time: "11:50", status: "done", zone: "Apparel" },
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
			{ title: "Cooler temp log", time: "09:15", status: "done", zone: "Grocery" },
			{ title: "End-cap refill", time: "09:55", status: "active", zone: "Grocery" },
			{ title: "Freshness check", time: "10:35", status: "pending", zone: "Grocery" },
			{ title: "Planogram update", time: "11:05", status: "active", zone: "Grocery" },
			{ title: "Backroom pull", time: "11:40", status: "pending", zone: "Grocery" },
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
			{ title: "Register balance", time: "12:05", status: "pending", zone: "Checkout" },
			{ title: "Queue support", time: "12:20", status: "active", zone: "Checkout" },
			{ title: "Refund approval", time: "12:35", status: "pending", zone: "Checkout" },
			{ title: "Shift handoff", time: "12:55", status: "active", zone: "Checkout" },
			{ title: "Receipt audit", time: "13:15", status: "done", zone: "Checkout" },
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
			{ title: "Restroom check", time: "12:10", status: "active", zone: "Restrooms" },
			{ title: "Signage update", time: "12:30", status: "pending", zone: "Front" },
			{ title: "Lost & found", time: "12:45", status: "pending", zone: "Front" },
			{ title: "Front cleanup", time: "13:05", status: "active", zone: "Front" },
			{ title: "Entrance assist", time: "13:30", status: "done", zone: "Entrance" },
		],
	},
];

const employeeTaskQueue = [
	{
		id: "task-1",
		title: "Replenish headphones display",
		time: "09:20",
		status: "active",
		zone: "Electronics",
		state: "new",
		points: [
			{ x: 18, y: 26 },
			{ x: 22, y: 32 },
		],
	},
	{
		id: "task-2",
		title: "Replace price tags",
		time: "09:40",
		status: "pending",
		zone: "Electronics",
		state: "new",
		points: [{ x: 26, y: 30 }],
	},
	{
		id: "task-3",
		title: "Customer pickup prep",
		time: "10:05",
		status: "active",
		zone: "Entrance",
		state: "new",
		points: [{ x: 46, y: 86 }],
	},
	{
		id: "task-4",
		title: "Camera lens wipe",
		time: "10:30",
		status: "pending",
		zone: "Checkout",
		state: "new",
		points: [{ x: 20, y: 64 }],
	},
	{
		id: "task-5",
		title: "Shelf gap audit",
		time: "10:55",
		status: "active",
		zone: "Grocery",
		state: "new",
		points: [
			{ x: 66, y: 26 },
			{ x: 68, y: 58 },
		],
	},
	{
		id: "task-6",
		title: "Promo end-cap build",
		time: "11:15",
		status: "pending",
		zone: "Grocery",
		state: "new",
		points: [{ x: 62, y: 60 }],
	},
	{
		id: "task-7",
		title: "Return cart check",
		time: "11:40",
		status: "active",
		zone: "Apparel",
		state: "new",
		points: [{ x: 46, y: 28 }],
	},
	{
		id: "task-8",
		title: "Front desk assist",
		time: "12:05",
		status: "pending",
		zone: "Front",
		state: "new",
		points: [{ x: 34, y: 82 }],
	},
];

const products = [
	{ id: "A-102", name: "Wireless Mouse", position: { x: 20, y: 26 }, zone: "Electronics" },
	{ id: "A-221", name: "Bluetooth Speaker", position: { x: 28, y: 32 }, zone: "Electronics" },
	{ id: "C-410", name: "Cotton Hoodie", position: { x: 44, y: 24 }, zone: "Apparel" },
	{ id: "C-505", name: "Denim Jacket", position: { x: 50, y: 30 }, zone: "Apparel" },
	{ id: "G-302", name: "Organic Oats", position: { x: 66, y: 28 }, zone: "Grocery" },
	{ id: "G-380", name: "Cold Brew", position: { x: 64, y: 60 }, zone: "Grocery" },
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

const managerMarkersRoot = document.getElementById("managerMarkers");
const employeeMarkersRoot = document.getElementById("employeeMarkers");
const panelTitle = document.getElementById("panelTitle");
const panelSubtitle = document.getElementById("panelSubtitle");
const panelContent = document.getElementById("panelContent");
const tasksSummary = document.getElementById("tasksSummary");
const priorityList = document.getElementById("priorityList");
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
const appHeader = document.getElementById("appHeader");
const loginView = document.getElementById("loginView");
const managerView = document.getElementById("managerView");
const employeeView = document.getElementById("employeeView");
const switchRole = document.getElementById("switchRole");
const employeeTaskList = document.getElementById("employeeTaskList");
const acceptedTasks = document.getElementById("acceptedTasks");
const routeSteps = document.getElementById("routeSteps");
const employeeTasksView = document.getElementById("employeeTasksView");
const employeeMapView = document.getElementById("employeeMapView");
const toggleEmployeeMap = document.getElementById("toggleEmployeeMap");
const productName = document.getElementById("productName");
const productId = document.getElementById("productId");
const clearProduct = document.getElementById("clearProduct");
const productMarker = document.getElementById("productMarker");
const productLabel = document.getElementById("productLabel");
const productResult = document.getElementById("productResult");
const interactionMarkers = document.getElementById("interactionMarkers");

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

const priorityOrder = {
	active: 0,
	pending: 1,
	done: 2,
};

const renderManagerMarkers = () => {
	managerMarkersRoot.innerHTML = "";

	employees.forEach((employee) => {
		const marker = createMarker(
			"employee",
			employee.id,
			employee.name,
			employee.position
		);
		marker.addEventListener("click", () => selectEmployee(employee.id));
		managerMarkersRoot.appendChild(marker);
	});

	cameras.forEach((camera) => {
		const marker = createMarker(
			"camera",
			camera.id,
			camera.label,
			camera.position
		);
		marker.addEventListener("click", () => selectCamera(camera.id));
		managerMarkersRoot.appendChild(marker);
	});
};

const renderEmployeeMarkers = () => {
	employeeMarkersRoot.innerHTML = "";

	cameras.forEach((camera) => {
		const marker = createMarker(
			"camera",
			camera.id,
			camera.label,
			camera.position
		);
		employeeMarkersRoot.appendChild(marker);
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
	managerMarkersRoot.querySelectorAll(".marker").forEach((marker) => {
		marker.classList.remove("focus");
	});
};

const selectEmployee = (employeeId) => {
	const employee = employees.find((item) => item.id === employeeId);
	if (!employee) return;

	selectedMarkerId = employeeId;
	clearFocus();
	const marker = managerMarkersRoot.querySelector(
		`[data-id="${employeeId}"]`
	);
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
		renderPriorityPreview();
		renderTasksTable();
	});
};

const selectCamera = (cameraId) => {
	const camera = cameras.find((item) => item.id === cameraId);
	if (!camera) return;

	selectedMarkerId = cameraId;
	clearFocus();
	const marker = managerMarkersRoot.querySelector(
		`[data-id="${cameraId}"]`
	);
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

const renderPriorityPreview = () => {
	const allTasks = getAllTasks();
	const sorted = [...allTasks].sort((a, b) => {
		const statusDiff = priorityOrder[a.status] - priorityOrder[b.status];
		if (statusDiff !== 0) return statusDiff;
		return a.time.localeCompare(b.time);
	});

	const top = sorted.slice(0, 4);
	if (tasksSummary) {
		tasksSummary.textContent = `Total tasks: ${allTasks.length}`;
	}
	if (priorityList) {
		priorityList.innerHTML = top
			.map(
				(task) => `
			<div class="priority-item">
				<div>
					<div class="task-title">${task.title}</div>
					<span>${task.assignee} · ${task.time}</span>
				</div>
				<span class="status ${statusClass[task.status]}">${
					statusLabels[task.status]
				}</span>
			</div>
		`
			)
			.join("");
	}
};

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

const renderEmployeeTasks = () => {
	if (!employeeTaskList) return;
	const tasks = employeeTaskQueue;
	if (!tasks.length) {
		employeeTaskList.innerHTML = "<p>No tasks assigned.</p>";
		return;
	}

	employeeTaskList.innerHTML = tasks
		.map((task) => {
			const action =
				task.state === "new"
					? `<button class="primary" data-action="accept" data-id="${task.id}">Accept</button>`
					: task.state === "accepted"
						? `<button class="ghost" data-action="complete" data-id="${task.id}">Complete</button>`
						: `<span class="status done">Done</span>`;

			return `
			<div class="task-card" data-id="${task.id}">
				<div class="task-card-header">
					<div>
						<div class="task-title">${task.title}</div>
						<small>${task.zone} · ${task.time}</small>
					</div>
					<span class="status ${statusClass[task.status]}">${
						statusLabels[task.status]
					}</span>
				</div>
				<div class="task-card-actions">${action}</div>
			</div>
		`;
		})
		.join("");
};

const renderAcceptedTasks = () => {
	if (!acceptedTasks) return;
	const accepted = employeeTaskQueue.filter(
		(task) => task.state === "accepted"
	);

	acceptedTasks.innerHTML = accepted.length
		? accepted
				.map(
					(task) => `
			<div class="task-item" data-id="${task.id}">
				<div>
					<div class="task-title">${task.title}</div>
					<div class="task-meta">${task.zone} · ${task.time}</div>
				</div>
				<span class="status ${statusClass[task.status]}">${
					statusLabels[task.status]
				}</span>
			</div>
		`
				)
				.join("")
		: "<p>No accepted tasks yet.</p>";
};

const renderRoute = () => {
	if (!routeSteps) return;
	const accepted = employeeTaskQueue.filter(
		(task) => task.state === "accepted"
	);
	if (!accepted.length) {
		routeSteps.innerHTML = "<li>Accept tasks to build a route.</li>";
		return;
	}

	routeSteps.innerHTML = accepted
		.map(
			(task) =>
				`<li>Go to ${task.zone} and handle "${task.title}".</li>`
		)
		.join("");
};

const updateEmployeePanels = () => {
	renderEmployeeTasks();
	renderAcceptedTasks();
	renderRoute();
};

const handleEmployeeAction = (event) => {
	const button = event.target.closest("button[data-action]");
	if (!button) return;
	const { action, id } = button.dataset;
	const task = employeeTaskQueue.find((item) => item.id === id);
	if (!task) return;

	if (action === "accept" && task.state === "new") {
		task.state = "accepted";
	} else if (action === "complete" && task.state === "accepted") {
		task.state = "done";
		task.status = "done";
	}

	updateEmployeePanels();
};

const showInteractionPoints = (taskId) => {
	if (!interactionMarkers) return;
	const task = employeeTaskQueue.find((item) => item.id === taskId);
	interactionMarkers.innerHTML = "";
	if (!task || !task.points) return;
	interactionMarkers.innerHTML = task.points
		.map(
			(point) =>
				`<span class="interaction-marker" style="left:${point.x}%; top:${point.y}%"></span>`
		)
		.join("");
};

const toggleEmployeeMapView = () => {
	const isMapVisible = !employeeMapView.classList.contains("hidden");
	employeeMapView.classList.toggle("hidden", isMapVisible);
	employeeTasksView.classList.toggle("hidden", !isMapVisible);
	toggleEmployeeMap.textContent = isMapVisible ? "Show map" : "Show tasks";
};

const updateProductMarker = (product) => {
	if (!product) {
		productMarker.style.display = "none";
		productResult.textContent = "No product selected.";
		return;
	}

	productMarker.style.display = "block";
	productMarker.style.left = `${product.position.x}%`;
	productMarker.style.top = `${product.position.y}%`;
	productLabel.textContent = product.id;
	productResult.textContent = `${product.name} · ${product.zone} (${product.id})`;
};

const handleProductSearch = () => {
	const nameValue = productName.value.trim().toLowerCase();
	const idValue = productId.value.trim().toLowerCase();
	const result = products.find((product) => {
		const matchesName = nameValue
			? product.name.toLowerCase().includes(nameValue)
			: true;
		const matchesId = idValue
			? product.id.toLowerCase() === idValue
			: true;
		return matchesName && matchesId;
	});

	updateProductMarker(result || null);
};

const resetProductSearch = () => {
	productName.value = "";
	productId.value = "";
	updateProductMarker(null);
};

const setRole = (role) => {
	loginView.classList.add("hidden");
	appHeader.classList.remove("hidden");
	managerView.classList.toggle("hidden", role !== "manager");
	employeeView.classList.toggle("hidden", role !== "employee");
	if (role === "manager") {
		toggleLegend.classList.remove("hidden");
	}
	if (role === "employee") {
		toggleLegend.classList.add("hidden");
		updateEmployeePanels();
	}
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

document.querySelectorAll("[data-role]").forEach((button) => {
	button.addEventListener("click", () => setRole(button.dataset.role));
});

switchRole.addEventListener("click", () => {
	managerView.classList.add("hidden");
	employeeView.classList.add("hidden");
	loginView.classList.remove("hidden");
	appHeader.classList.add("hidden");
});

if (employeeTaskList) {
	employeeTaskList.addEventListener("click", handleEmployeeAction);
	employeeTaskList.addEventListener("click", (event) => {
		const card = event.target.closest(".task-card");
		if (!card) return;
		showInteractionPoints(card.dataset.id);
	});
}

if (acceptedTasks) {
	acceptedTasks.addEventListener("click", (event) => {
		const card = event.target.closest(".task-item");
		if (!card) return;
		showInteractionPoints(card.dataset.id);
	});
}

toggleEmployeeMap.addEventListener("click", toggleEmployeeMapView);
productName.addEventListener("input", handleProductSearch);
productId.addEventListener("input", handleProductSearch);
clearProduct.addEventListener("click", resetProductSearch);

renderManagerMarkers();
renderEmployeeMarkers();
populateAssignees();
renderPriorityPreview();
updateEmployeePanels();
