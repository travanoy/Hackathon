// ─── Staff (employee) view script ───────────────────────────────────────────
// Requires: ../map tracking/data.js loaded before this file
// OR a local copy of data.js

// ─── DOM refs ───────────────────────────────────────────────────────────────
const employeeMarkersRoot = document.getElementById("employeeMarkers");
const employeeTaskList    = document.getElementById("employeeTaskList");
const acceptedTasks       = document.getElementById("acceptedTasks");
const routeSteps          = document.getElementById("routeSteps");
const employeeTasksView   = document.getElementById("employeeTasksView");
const employeeMapView     = document.getElementById("employeeMapView");
const toggleEmployeeMap   = document.getElementById("toggleEmployeeMap");
const productName         = document.getElementById("productName");
const productId           = document.getElementById("productId");
const clearProduct        = document.getElementById("clearProduct");
const productMarker       = document.getElementById("productMarker");
const productLabel        = document.getElementById("productLabel");
const productResult       = document.getElementById("productResult");
const interactionMarkers  = document.getElementById("interactionMarkers");

// ─── Camera markers on employee map ──────────────────────────────────────────

const createCameraMarker = (camera) => {
	const marker = document.createElement("div");
	marker.className = "marker camera";
	marker.dataset.id = camera.id;
	marker.style.left = `${camera.position.x}%`;
	marker.style.top  = `${camera.position.y}%`;

	const pin = document.createElement("div");
	pin.className = "pin";
	marker.appendChild(pin);

	const tag = document.createElement("div");
	tag.className = "label camera-label";
	tag.textContent = camera.label;
	marker.appendChild(tag);

	return marker;
};

const renderEmployeeMarkers = () => {
	if (!employeeMarkersRoot) return;
	employeeMarkersRoot.innerHTML = "";
	cameras.forEach((camera) => {
		employeeMarkersRoot.appendChild(createCameraMarker(camera));
	});
};

// ─── Task list ────────────────────────────────────────────────────────────────

const renderEmployeeTasks = () => {
	if (!employeeTaskList) return;

	if (!employeeTaskQueue.length) {
		employeeTaskList.innerHTML = "<p>No tasks assigned.</p>";
		return;
	}

	employeeTaskList.innerHTML = employeeTaskQueue
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
					<span class="status ${statusClass[task.status]}">
						${statusLabels[task.status]}
					</span>
				</div>
				<div class="task-card-actions">${action}</div>
			</div>
		`;
		})
		.join("");
};

// ─── Accepted tasks list ──────────────────────────────────────────────────────

const renderAcceptedTasks = () => {
	if (!acceptedTasks) return;
	const accepted = employeeTaskQueue.filter((t) => t.state === "accepted");

	acceptedTasks.innerHTML = accepted.length
		? accepted
				.map(
					(task) => `
			<div class="task-item" data-id="${task.id}">
				<div>
					<div class="task-title">${task.title}</div>
					<div class="task-meta">${task.zone} · ${task.time}</div>
				</div>
				<span class="status ${statusClass[task.status]}">
					${statusLabels[task.status]}
				</span>
			</div>
		`
				)
				.join("")
		: "<p>No accepted tasks yet.</p>";
};

// ─── Route steps ──────────────────────────────────────────────────────────────

const renderRoute = () => {
	if (!routeSteps) return;
	const accepted = employeeTaskQueue.filter((t) => t.state === "accepted");

	if (!accepted.length) {
		routeSteps.innerHTML = "<li>Accept tasks to build a route.</li>";
		return;
	}

	routeSteps.innerHTML = accepted
		.map((task) => `<li>Go to ${task.zone} and handle "${task.title}".</li>`)
		.join("");
};

const updateEmployeePanels = () => {
	renderEmployeeTasks();
	renderAcceptedTasks();
	renderRoute();
};

// ─── Task action handler (accept / complete) ──────────────────────────────────

const handleEmployeeAction = (event) => {
	const button = event.target.closest("button[data-action]");
	if (!button) return;
	const { action, id } = button.dataset;
	const task = employeeTaskQueue.find((t) => t.id === id);
	if (!task) return;

	if (action === "accept" && task.state === "new") {
		task.state = "accepted";
	} else if (action === "complete" && task.state === "accepted") {
		task.state  = "done";
		task.status = "done";
	}

	updateEmployeePanels();
};

// ─── Interaction points on map ────────────────────────────────────────────────

const showInteractionPoints = (taskId) => {
	if (!interactionMarkers) return;
	const task = employeeTaskQueue.find((t) => t.id === taskId);
	interactionMarkers.innerHTML = "";
	if (!task || !task.points) return;
	interactionMarkers.innerHTML = task.points
		.map(
			(point) =>
				`<span class="interaction-marker" style="left:${point.x}%; top:${point.y}%"></span>`
		)
		.join("");
};

// ─── Toggle between task list and map ────────────────────────────────────────

const toggleEmployeeMapView = () => {
	if (!employeeMapView || !employeeTasksView || !toggleEmployeeMap) return;
	const isMapVisible = !employeeMapView.classList.contains("hidden");
	employeeMapView.classList.toggle("hidden", isMapVisible);
	employeeTasksView.classList.toggle("hidden", !isMapVisible);
	toggleEmployeeMap.textContent = isMapVisible ? "Show map" : "Show tasks";
};

// ─── Product search ───────────────────────────────────────────────────────────

const updateProductMarker = (product) => {
	if (!productMarker || !productLabel || !productResult) return;
	if (!product) {
		productMarker.style.display = "none";
		productResult.textContent   = "No product selected.";
		return;
	}
	productMarker.style.display = "block";
	productMarker.style.left    = `${product.position.x}%`;
	productMarker.style.top     = `${product.position.y}%`;
	productLabel.textContent    = product.id;
	productResult.textContent   = `${product.name} · ${product.zone} (${product.id})`;
};

const handleProductSearch = () => {
	const nameValue = productName ? productName.value.trim().toLowerCase() : "";
	const idValue   = productId   ? productId.value.trim().toLowerCase()   : "";
	const result = products.find((p) => {
		const matchesName = nameValue ? p.name.toLowerCase().includes(nameValue) : true;
		const matchesId   = idValue   ? p.id.toLowerCase() === idValue           : true;
		return matchesName && matchesId;
	});
	updateProductMarker(result || null);
};

const resetProductSearch = () => {
	if (productName) productName.value = "";
	if (productId)   productId.value   = "";
	updateProductMarker(null);
};

// ─── Event listeners ──────────────────────────────────────────────────────────

if (employeeTaskList) {
	// Accept / complete buttons
	employeeTaskList.addEventListener("click", handleEmployeeAction);
	// Show interaction points when clicking a task card
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

if (toggleEmployeeMap) {
	toggleEmployeeMap.addEventListener("click", toggleEmployeeMapView);
}

if (productName) productName.addEventListener("input", handleProductSearch);
if (productId)   productId.addEventListener("input",   handleProductSearch);
if (clearProduct) clearProduct.addEventListener("click", resetProductSearch);

const backToMain = document.getElementById("backToMain");
if (backToMain) {
	backToMain.addEventListener("click", () => {
		window.location.href = "../main/home.html";
	});
}

// ─── Init ─────────────────────────────────────────────────────────────────────

renderEmployeeMarkers();
updateEmployeePanels();
