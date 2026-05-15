// ─── Shared Data ───────────────────────────────────────────────────────────

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
		name: "Lena V.",
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
	{ id: "cam-1",  name: "Camera C1",  zone: "Electronics", label: "C1",  position: { x: 6,  y: 8  } },
	{ id: "cam-2",  name: "Camera C2",  zone: "Electronics", label: "C2",  position: { x: 28, y: 6  } },
	{ id: "cam-3",  name: "Camera C3",  zone: "Apparel",     label: "C3",  position: { x: 46, y: 6  } },
	{ id: "cam-4",  name: "Camera C4",  zone: "Grocery",     label: "C4",  position: { x: 66, y: 6  } },
	{ id: "cam-5",  name: "Camera C5",  zone: "Warehouse",   label: "C5",  position: { x: 84, y: 6  } },
	{ id: "cam-6",  name: "Camera C6",  zone: "Electronics", label: "C6",  position: { x: 6,  y: 38 } },
	{ id: "cam-7",  name: "Camera C7",  zone: "Checkout",    label: "C7",  position: { x: 12, y: 62 } },
	{ id: "cam-8",  name: "Camera C8",  zone: "Entrance",    label: "C8",  position: { x: 42, y: 74 } },
	{ id: "cam-9",  name: "Camera C9",  zone: "Entrance",    label: "C9",  position: { x: 54, y: 78 } },
	{ id: "cam-10", name: "Camera C10", zone: "Warehouse",   label: "C10", position: { x: 96, y: 24 } },
];

// ─── Status helpers (shared) ────────────────────────────────────────────────

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
