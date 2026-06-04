// Обёртка над gateway /miniapi/store/*. no-store только на мутациях (GET кэшируется).
const BASE = "/miniapi/store";
function agentId() {
  const u = new URL(window.location.href);
  return u.searchParams.get("agent_id") || "";
}
function stateParam() {
  const u = new URL(window.location.href);
  return u.searchParams.get("state") || "";
}
async function get(path, params = {}) {
  const q = new URLSearchParams({ agent_id: agentId(), ...params }).toString();
  const r = await fetch(`${BASE}${path}?${q}`);
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}
async function post(path, body = {}, params = {}) {
  const q = new URLSearchParams({ agent_id: agentId(), ...params }).toString();
  const r = await fetch(`${BASE}${path}?${q}`, {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}
async function upload(path, file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("agent_id", agentId());
  const r = await fetch(`${BASE}${path}`, { method: "POST", cache: "no-store", body: fd });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.json();
}

export const api = {
  agentId,
  // public
  list: (mode) => get("/list", mode ? { mode } : {}),
  cabinet: (init_data) => post("/cabinet", { init_data, state: stateParam() }),
  orders: (init_data, tab) => post("/orders", { init_data, tab: tab || "active", state: stateParam() }),
  categories: (mode) => get("/categories", mode ? { mode } : {}),
  purchases: () => get("/purchases"),
  reviews: (item_id) => get("/reviews", { item_id }),
  addReview: (item_id, rating, body, author_name) => post("/reviews/add", { item_id, rating, body, author_name }),
  createBooking: (payload) => post("/booking/order/create", payload),
  // admin: cards
  saveCard: (card) => post("/save", card),
  deleteCard: (id) => post("/delete", { id }),
  setVisible: (id, visible) => post("/visibility", { id, visible }),
  uploadMedia: (file) => upload("/upload", file),       // image/video
  uploadFile: (file) => upload("/upload_file", file),    // documents
  aiText: (prompt) => post("/ai_generate", { prompt }),
  aiImage: (prompt) => post("/ai_generate_image", { prompt }),
  // admin: categories
  saveCategory: (cat) => post("/categories", cat),
  setCategoryVisible: (id, visible) => post("/categories/visibility", { id, visible }),
  deleteCategory: (id) => post("/categories/delete", { id }),
  // admin: orders
  adminOrders: () => get("/admin/orders"),
  // admin: merchant (gpay)
  merchant: (init_data) => post("/admin/merchant", { init_data, state: stateParam() }),
  composePackage: (order_id) => post("/admin/orders/compose-print-package", { order_id }),
  // admin: reviews moderation
  adminReviews: () => get("/admin/reviews"),
  replyReview: (id, reply) => post("/admin/reviews/reply", { id, reply }),
  reviewVisibility: (id, visible) => post("/admin/reviews/visibility", { id, visible }),
  // admin: partners
  partners: () => get("/admin/partners"),
  savePartner: (p) => post("/admin/partners/save", p),
  deletePartner: (id) => post("/admin/partners/delete", { id }),
  // admin: print designs
  printDesigns: () => get("/admin/print-designs"),
  savePrint: (spec) => post("/admin/print-designs/save", spec),
  deletePrint: (id) => post("/admin/print-designs/delete", { id }),
  uploadPrint: (file) => upload("/admin/print-designs/upload", file),
};
