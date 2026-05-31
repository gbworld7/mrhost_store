import React, { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Store as StoreIcon } from "lucide-react";
import { T } from "./theme/tokens.js";
import { api } from "./api/client.js";
import { Tabs, Avatar, STORE_LOGO_DRAGON } from "./components/ui.jsx";
import * as P from "./screens/public.jsx";
import * as A from "./screens/admin.jsx";

/* ---- demo fallback (когда API недоступен — стор всё равно рендерится) ---- */
const DEMO = {
  cats: [{ id: "fpv", title: "FPV" }, { id: "camera", title: "Camera drones" }, { id: "training", title: "Training" }],
  items: [
    { id: "d1", description: "FPV Racing Drone — carbon frame, 6S power, sub-250g, ready to rip.", price: "249", vnd: "6.350.000 đ", category_id: "fpv", images: ["drone"], video: "", files: [{ name: "specs.pdf", size: "180 KB" }], booking: { enabled: false, deposit_percent: 50, slots: [] }, visible: true, rating: 4.8, reviews: 24 },
    { id: "d2", description: "Camera Drone 4K — 3-axis gimbal, 40 min flight, obstacle sensing.", price: "599", vnd: "15.200.000 đ", category_id: "camera", images: ["drone"], video: "v", files: [], booking: { enabled: false, deposit_percent: 50, slots: [] }, visible: true, rating: 4.9, reviews: 41 },
    { id: "d3", description: "Pilot Training — 1-hour hands-on session, book a slot.", price: "50", vnd: "1.270.000 đ", category_id: "training", images: ["drone"], video: "", files: [], booking: { enabled: true, deposit_percent: 30, slots: [{ date: "2026-06-04", time: "15:00", comment: "Online", capacity: 1 }] }, visible: true, rating: 5.0, reviews: 8 },
  ],
  orders: [
    { id: "ORD-1042", customer: "Anna · @anna", product: "Aroma Shampoo 500ml × 1", total: 14, status: "Paid", prod: "not created", date: "May 28", items: ["Aroma Shampoo 500ml"], tone: "#EDEAE2" },
    { id: "ORD-1031", customer: "Minh · @minh", product: "1-hour Consultation · Wed 4, 15:00", total: 50, status: "Booked", prod: "—", date: "May 20", items: ["1-hour Consultation"], tone: "#E7EBEE" },
  ],
  reviews: [
    { id: "r1", name: "Anna", rating: 5, text: "Exactly as described, fast delivery.", item: "Aroma Shampoo 500ml", reply: "", visible: true },
    { id: "r2", name: "Minh", rating: 2, text: "Arrived late, packaging damaged.", item: "Linen Shirt", reply: "", visible: true },
  ],
  partners: [{ id: "p1", name: "Blog A", contact: "@bloga", link: "t.me/bloga", desc: "Beauty blogger", status: "active" }],
  members: [{ id: "m1", name: "You", role: "Owner" }, { id: "m2", name: "Kate", role: "Manager" }],
  user: { name: "Anna Customer", username: "anna", lang: "EN" },
  ledger: [{ t: "Order ORD-1042 cashback", d: "+3.30", date: "May 28" }, { t: "Spent on ORD-1031", d: "-5.00", date: "May 20" }, { t: "Welcome bonus", d: "+5.00", date: "May 02" }],
  stats: { views: "1,284", orders: "37", revenue: "$1,940", conversion: "2.9%" },
};

function useQuery() {
  return useMemo(() => {
    const u = new URL(window.location.href);
    const pathOwner = /\/owner(\b|\/|$)/.test(u.pathname);
    const mode = (u.searchParams.get("mode") || (pathOwner ? "owner" : "")).toLowerCase();
    const store = (u.searchParams.get("store") || "").trim();
    const logo = (u.searchParams.get("logo") || "").trim();
    return { agent_id: u.searchParams.get("agent_id") || "", mode, store, logo };
  }, []);
}

export default function App() {
  const q = useQuery();
  const isDronovod = q.agent_id === "dronovodbot" || /dronovod/i.test(q.store);
  const storeLogo = q.logo || (isDronovod ? STORE_LOGO_DRAGON : "");
  const owner = q.mode === "owner" || q.mode === "admin";
  const [data, setData] = useState(DEMO);
  const [tab, setTab] = useState(q.mode === "owner" || q.mode === "admin" ? "cards" : "catalog");
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [cart, setCart] = useState([]);
  const [pay, setPay] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");

  const reload = () => {
    Promise.allSettled([api.list(), api.categories()]).then(([l, c]) => {
      setData((d) => ({ ...d, items: (l.value?.items || l.value) || d.items, cats: (c.value?.categories || c.value) || d.cats }));
    }).catch(() => {});
  };
  useEffect(() => { reload(); /* admin extras load lazily on tab open */ }, []);

  const counts = useMemo(() => { const m = {}; data.items.forEach((i) => { if (i.category_id) m[i.category_id] = (m[i.category_id] || 0) + 1; }); return m; }, [data.items]);
  const publicItems = data.items.filter((i) => i.visible !== false);
  const add = (it) => { setCart((c) => { const f = c.find((x) => x.id === it.id); return f ? c.map((x) => x.id === it.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...it, qty: 1 }]; }); setDetail(null); setTab("cart"); };
  const count = cart.reduce((s, x) => s + x.qty, 0);

  const pubTabs = [{ key: "catalog", label: "Catalog" }, { key: "categories", label: "Categories" }, { key: "rating", label: "Rating" }, { key: "purchases", label: "Purchases" }, { key: "partner", label: "Partner" }, { key: "cabinet", label: "Cabinet" }, { key: "cart", label: `Cart${count ? " · " + count : ""}` }];
  const admTabs = [{ key: "cards", label: "Cards" }, { key: "categories", label: "Categories" }, { key: "orders", label: "Orders" }, { key: "reviews", label: "Reviews" }, { key: "partners", label: "Partners" }, { key: "print", label: "Print" }, { key: "analytics", label: "Analytics" }, { key: "team", label: "Team" }];

  return (
    <div style={{ background: T.page, minHeight: "100vh", fontFamily: T.fontBody, color: T.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 16px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Avatar name={q.store || "Store"} src={storeLogo} size={36} />
            <div><div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 17, lineHeight: 1 }}>{q.store || "Your Store"}</div><div style={{ fontSize: 11.5, color: T.gray2 }}>powered by ShopLink</div></div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {!owner && <button onClick={() => { setTab("cart"); setDetail(null); }} style={{ position: "relative", border: `1px solid ${T.line}`, background: "#fff", borderRadius: 12, padding: "9px 11px", cursor: "pointer" }}><ShoppingCart size={18} />{count > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: T.orange, color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 6px" }}>{count}</span>}</button>}
            {owner && <span style={{ border: `1.5px solid ${T.gold}`, background: T.goldSoft, color: "#8A6D2F", borderRadius: 12, padding: "8px 13px", fontFamily: T.fontBody, fontWeight: 700, fontSize: 13.5 }}>Admin</span>}
          </div>
        </div>

        <Tabs tabs={owner ? admTabs : pubTabs} active={tab} onChange={(k) => { setTab(k); setDetail(null); setEditing(null); }} />

        <div style={{ marginTop: 16 }}>
          {!owner && (<>
            {tab === "catalog" && !detail && <P.Catalog items={publicItems} cats={data.cats} selectedCat={selectedCat} onSelectCat={setSelectedCat} onOpen={setDetail} onAdd={add} />}
            {tab === "catalog" && detail && <P.Item item={detail} onBack={() => setDetail(null)} onAdd={add} />}
            {tab === "categories" && <P.Categories cats={data.cats} counts={counts} onPick={(id) => { setSelectedCat(id); setTab("catalog"); }} />}
            {tab === "rating" && <P.Rating items={publicItems} />}
            {tab === "purchases" && <P.Purchases orders={data.orders} />}
            {tab === "partner" && <P.PartnerApply />}
            {tab === "cabinet" && <P.Cabinet user={data.user} balance="3.30" ledger={data.ledger} />}
            {tab === "cart" && <P.Cart cart={cart} setCart={setCart} onCheckout={() => setPay(true)} />}
          </>)}

          {owner && (<>
            {tab === "cards" && !editing && <A.AdminCards items={data.items} onEdit={(it) => setEditing(it)} onNew={() => setEditing({ _new: true })} />}
            {tab === "cards" && editing && <A.CardEditor item={editing._new ? null : editing} cats={data.cats} onBack={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
            {tab === "categories" && <A.AdminCategories cats={data.cats} counts={counts} onChange={reload} />}
            {tab === "orders" && <A.Orders orders={data.orders} />}
            {tab === "reviews" && <A.ReviewsAdmin reviews={data.reviews} />}
            {tab === "partners" && <A.Partners partners={data.partners} />}
            {tab === "print" && <A.PrintDesigns items={data.items} />}
            {tab === "analytics" && <A.Analytics stats={data.stats} />}
            {tab === "team" && <A.Team members={data.members} />}
          </>)}
        </div>

        {pay && <P.PaySheet cart={cart} onClose={() => setPay(false)} agentId={q.agent_id} storeName={q.store} />}
      </div>
    </div>
  );
}
