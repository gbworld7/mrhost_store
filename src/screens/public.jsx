import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Trash2, ChevronLeft, ChevronRight, X, Star, Calendar, Clock, Search, Download,
  Play, Plus, Video, FileText, Package, Tag, Award, ChevronRight as Arrow, Copy, Check, MessageCircle,
  CreditCard, Building2, Wallet, Clock as ClockI,
} from "lucide-react";
import { T } from "../theme/tokens.js";
import { api } from "../api/client.js";
import { card, cta, Back, Pic, Stars, Chip, Field, Empty, secLbl, h2, Avatar } from "../components/ui.jsx";

const tagBadge = { position: "absolute", top: 8, left: 8, display: "inline-flex", gap: 4, alignItems: "center", background: "rgba(17,17,17,.82)", color: "#fff", borderRadius: 8, padding: "4px 8px", fontFamily: T.fontBody, fontWeight: 600, fontSize: 11 };
const grid = { display: "grid", gridTemplateColumns: "1fr", gap: 18, maxWidth: 520, marginLeft: "auto", marginRight: "auto" };
const title = (it) => it.title || (it.description || "").split("—")[0].trim() || "Untitled";
const DAYS = ["Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6"];

// DRONOVOD_DESCRIPTION_MODAL_V2
const descOnly = (it) => ((it.description || "").split("—").slice(1).join("—").trim()) || it.description || "";
const twoLineDesc = {
  fontSize: 15,
  color: T.gray,
  margin: "0 0 8px",
  lineHeight: 1.4,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
function DescriptionModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,.38)", display: "grid", placeItems: "end center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px,100%)", maxHeight: "72vh", overflow: "auto", borderRadius: 26, background: "#fff", border: `1px solid ${T.line}`, boxShadow: "0 24px 80px rgba(0,0,0,.22)", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 900, letterSpacing: "-.03em", flex: 1 }}>{title(item)}</div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: T.lineSoft, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <p style={{ color: T.gray, fontSize: 16, lineHeight: 1.55, margin: 0 }}>{descOnly(item)}</p>
      </div>
    </div>
  );
}

const SLOTS = ["10:00", "12:30", "15:00", "17:30"];

/* -------- Catalog -------- */
export function Catalog({ items, cats, onOpen, onAdd }) {
  const [cat, setCat] = useState("all");
  const [descModal, setDescModal] = useState(null);
  const [q, setQ] = useState("");
  const baseCats = [{ id: "all", label: "All" }, ...cats.map((c) => ({ id: c.id, label: c.title }))];
  let list = items.filter((i) => cat === "all" ? true : i.category_id === cat);
  if (q.trim()) { const s = q.toLowerCase(); list = list.filter((i) => title(i).toLowerCase().includes(s) || (i.description || "").toLowerCase().includes(s)); }
  return (
    <>
      <DescriptionModal item={descModal} onClose={() => setDescModal(null)} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...card, padding: "10px 13px", margin: "16px 0 12px" }}>
        <Search size={18} color={T.gray2} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products & services" style={{ border: "none", outline: "none", flex: 1, fontFamily: T.fontBody, fontSize: 14.5, background: "none" }} />
        {q && <button onClick={() => setQ("")} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}><X size={16} /></button>}
      </div>
      <div style={{ display: "flex", gap: 9, overflowX: "auto" }}>{baseCats.map((c) => <Chip key={c.id} on={c.id === cat} onClick={() => setCat(c.id)}>{c.label}</Chip>)}</div>
      {!list.length ? <Empty text="Nothing here yet" sub="Try another search or category." /> : (
        <div style={{ ...grid, marginTop: 14 }}>
          {list.map((it) => (
            <div key={it.id} style={{ background: "linear-gradient(180deg,#F9F3E5,#FFFFFF)", border: `1px solid ${T.gold}`, borderRadius: 22, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,.06)", display: "flex", flexDirection: "column" }}>
              <button onClick={() => onOpen(it)} style={{ border: "none", padding: 0, background: "none", cursor: "pointer" }}>
                <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 18, overflow: "hidden", background: "#fff", position: "relative", border: `1px solid ${T.lineSoft}` }}>
                  <Pic tone={(it.images || [])[0]} />
                  {it.booking?.enabled && <span style={tagBadge}><Calendar size={12} /> Booking</span>}
                  {it.video && <span style={{ ...tagBadge, left: "auto", right: 8 }}><Video size={12} /></span>}
                </div>
              </button>
              <h4 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 23, margin: "16px 0 6px", letterSpacing: "-.01em" }}>{title(it)}</h4>
              <p style={twoLineDesc}>{descOnly(it)}</p>
              {descOnly(it) && <button onClick={() => setDescModal(it)} style={{ border: "none", background: "none", color: T.goldDeep || T.gold, padding: 0, margin: "0 0 12px", textAlign: "left", fontFamily: T.fontBody, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Details</button>}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16, marginTop: "auto" }}>
                <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 28, color: T.orange }}>${it.price}</span>
                {it.vnd && <span style={{ fontSize: 13, color: T.gray2 }}>/ {it.vnd}</span>}
                {it.booking?.enabled && <span style={{ fontSize: 13, color: T.gray2 }}>· prepay {it.booking.deposit_percent}%</span>}
              </div>
              <button onClick={() => it.booking?.enabled ? onOpen(it) : onAdd(it)} style={{ ...cta, padding: 15, fontSize: 16, borderRadius: 14 }}>{it.booking?.enabled ? "Book now" : "Add to cart"}</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* -------- Fullscreen gallery -------- */
function Gallery({ imgs, start, onClose }) {
  const [i, setI] = useState(start || 0); const tx = useRef(0);
  useEffect(() => { const h = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") setI((x) => Math.min(imgs.length - 1, x + 1)); if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1)); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [imgs.length, onClose]);
  const arrow = (side) => ({ position: "absolute", [side]: 14, top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.14)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" });
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,.94)", zIndex: 60, display: "grid", placeItems: "center" }}
      onTouchStart={(e) => (tx.current = e.touches[0].clientX)} onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - tx.current; if (d < -40) setI((x) => Math.min(imgs.length - 1, x + 1)); if (d > 40) setI((x) => Math.max(0, x - 1)); }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.14)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={20} /></button>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(86vw,520px)", aspectRatio: "1/1", borderRadius: 18, overflow: "hidden", position: "relative" }}>
        {imgs.map((t, k) => <div key={k} style={{ position: "absolute", inset: 0, opacity: k === i ? 1 : 0, transition: "opacity .3s" }}><Pic tone={t} /></div>)}
      </div>
      {imgs.length > 1 && (<>
        {i > 0 && <button onClick={(e) => { e.stopPropagation(); setI(i - 1); }} style={arrow("left")}><ChevronLeft size={22} /></button>}
        {i < imgs.length - 1 && <button onClick={(e) => { e.stopPropagation(); setI(i + 1); }} style={arrow("right")}><ChevronRight size={22} /></button>}
      </>)}
    </div>
  );
}

/* -------- Item detail -------- */
export function Item({ item, onBack, onAdd }) {
  const imgs = item.images || [];
  const [idx, setIdx] = useState(0); const [gal, setGal] = useState(false);
  const [day, setDay] = useState(0); const [slot, setSlot] = useState(null);
  const isBooking = !!item.booking?.enabled;
  return (
    <div>
      {gal && <Gallery imgs={imgs} start={idx} onClose={() => setGal(false)} />}
      <Back onClick={onBack} />
      <button onClick={() => setGal(true)} style={{ display: "block", width: "100%", border: "none", padding: 0, background: "none", cursor: "zoom-in", marginTop: 12 }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: 20, overflow: "hidden", background: T.lineSoft }}>
          {imgs.map((t, i) => <div key={i} style={{ position: "absolute", inset: 0, opacity: i === idx ? 1 : 0, transition: "opacity .35s" }}><Pic tone={t} /></div>)}
        </div>
      </button>
      {imgs.length > 1 && <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>{imgs.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 8, border: "none", cursor: "pointer", background: i === idx ? T.gold : "#D9D9D9", transition: "all .25s" }} />)}</div>}
      <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 26, margin: "18px 0 6px" }}>{title(item)}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Stars value={item.rating || 0} /><span style={{ color: T.gray2, fontSize: 13 }}>{(item.rating || 0)} · {item.reviews || 0} reviews</span></div>
      <p style={{ color: T.gray, margin: "0 0 16px", lineHeight: 1.5 }}>{item.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}><span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 30, color: T.orange }}>${item.price}</span>{isBooking && <span style={{ color: T.gray2 }}>· prepay {item.booking.deposit_percent}%</span>}</div>

      {isBooking && (
        <div style={{ ...card, marginBottom: 16 }}>
          <Lbl icon={<Calendar size={16} color={T.gold} />}>Pick a date</Lbl>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>{DAYS.map((d, i) => <Chip key={d} on={i === day} onClick={() => setDay(i)}>{d}</Chip>)}</div>
          <Lbl icon={<Clock size={16} color={T.gold} />}>Time</Lbl>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{SLOTS.map((s) => <Chip key={s} on={s === slot} onClick={() => setSlot(s)}>{s}</Chip>)}</div>
        </div>
      )}

      {(item.files || []).length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={secLbl}>Files</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.files.map((f) => (
              <a key={f.name} href={f.url || "#"} style={{ textDecoration: "none", color: T.ink, display: "flex", gap: 10, alignItems: "center", ...card, padding: "10px 12px" }}>
                <FileText size={17} color={T.gold} /><span style={{ flex: 1, fontSize: 13.5 }}>{f.name}</span><span style={{ fontSize: 12, color: T.gray2 }}>{f.size}</span><Download size={16} color={T.gray} />
              </a>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => onAdd(item)} style={{ ...cta, padding: 15, fontSize: 16 }}>{isBooking ? `Book${slot ? " · " + DAYS[day] + " " + slot : ""}` : "Add to cart"}</button>
      <Reviews item={item} />
    </div>
  );
}
const Lbl = ({ icon, children }) => <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: T.fontBody, fontWeight: 700, marginBottom: 10 }}>{icon}{children}</div>;

/* -------- Reviews (read + write) -------- */
function Reviews({ item }) {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false); const [rating, setRating] = useState(5); const [text, setText] = useState("");
  useEffect(() => { api.reviews(item.id).then((d) => setList(d.reviews || d || [])).catch(() => setList([{ id: "d1", name: "Anna", rating: 5, text: "Exactly as described." }])); }, [item.id]);
  const submit = async () => {
    if (!text.trim()) return;
    setList((l) => [{ id: "tmp" + Date.now(), name: "You", rating, text: text.trim() }, ...l]); setText(""); setOpen(false);
    try { await api.addReview(item.id, rating, text.trim(), "You"); } catch (e) {}
  };
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18 }}>Reviews</h3>
        <button onClick={() => setOpen((o) => !o)} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "8px 13px", borderRadius: 10, border: `1.5px solid ${T.ink}`, background: "#fff", color: T.ink, fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, cursor: "pointer" }}><Plus size={15} /> Write</button>
      </div>
      {open && (
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>{[1, 2, 3, 4, 5].map((i) => <button key={i} onClick={() => setRating(i)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}><Star size={22} color={T.star} fill={i <= rating ? T.star : "none"} /></button>)}</div>
          <Field value={text} set={setText} ph="Share your experience" area />
          <button onClick={submit} style={{ ...cta, padding: 11 }}>Post review</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((r) => (
          <div key={r.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.goldSoft, color: T.goldDeep, display: "grid", placeItems: "center", fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13 }}>{(r.name || r.author_name || "?")[0]}</div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name || r.author_name}</span><span style={{ marginLeft: "auto" }}><Stars value={r.rating} size={12} /></span>
            </div>
            <p style={{ fontSize: 13.5, color: T.gray, margin: 0 }}>{r.text || r.body}</p>
            {r.reply && <div style={{ marginTop: 8, background: T.goldSoft, border: `1px solid ${T.gold}`, borderRadius: 11, padding: "8px 11px", fontSize: 13 }}><b style={{ color: "#8A6D2F" }}>Reply:</b> {r.reply}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- Cart -------- */
export function Cart({ cart, setCart, onCheckout }) {
  if (!cart.length) return <Empty text="Cart is empty" sub="Browse the catalog to add items." />;
  const total = cart.reduce((s, x) => s + Number(x.price) * x.qty, 0);
  const setQty = (id, d) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const Round = ({ children, onClick }) => <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>{children}</button>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      {cart.map((x) => (
        <div key={x.id} style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", background: T.lineSoft, flexShrink: 0 }}><Pic tone={(x.images || [])[0]} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: T.fontDisplay, fontWeight: 700 }}>{title(x)}</div><div style={{ color: T.orange, fontWeight: 700, fontFamily: T.fontDisplay }}>${x.price}</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Round onClick={() => setQty(x.id, -1)}>–</Round><span style={{ minWidth: 18, textAlign: "center", fontWeight: 700 }}>{x.qty}</span><Round onClick={() => setQty(x.id, +1)}>+</Round></div>
          <button onClick={() => setCart((c) => c.filter((y) => y.id !== x.id))} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}><Trash2 size={18} /></button>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}><span style={{ color: T.gray }}>Total</span><span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 24 }}>${total}</span></div>
      <button onClick={onCheckout} style={{ ...cta, background: T.gold }}>Checkout</button>
    </div>
  );
}

/* -------- Categories / Rating / Purchases / Partner / Cabinet -------- */
export function Categories({ cats, counts, onPick }) {
  return (<div><h2 style={h2}>Categories</h2>
    <div style={{ ...grid }}>
      {cats.map((c) => (
        <button key={c.id} onClick={() => onPick(c.id)} style={{ ...card, padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer" }}>
          <div style={{ aspectRatio: "16/10", background: T.lineSoft, display: "grid", placeItems: "center" }}><Tag size={22} color="#C9C6BD" /></div>
          <div style={{ padding: "11px 13px", display: "flex", alignItems: "center", gap: 11 }}><Avatar name={c.title} src={c.logo || ""} size={38} /><div><div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 16 }}>{c.title}</div><div style={{ fontSize: 12.5, color: T.gray2 }}>{counts[c.id] || 0} items</div></div><Arrow size={18} color={T.gray2} style={{ marginLeft: "auto" }} /></div>
        </button>
      ))}
    </div></div>);
}
export function Rating({ items }) {
  const top = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  return (<div><h2 style={h2}>Top rated</h2><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {top.map((t, i) => (
      <div key={t.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
        <div style={{ width: 30, fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, color: i === 0 ? T.gold : T.gray2, textAlign: "center" }}>{i + 1}</div>
        <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", background: T.lineSoft, flexShrink: 0 }}><Pic tone={(t.images || [])[0]} /></div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15 }}>{title(t)}</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}><Stars value={t.rating || 0} size={12} /><span style={{ fontSize: 12, color: T.gray2 }}>{(t.rating || 0)} · {t.reviews || 0}</span></div></div>
        {i === 0 && <Award size={20} color={T.gold} />}
      </div>
    ))}
  </div></div>);
}
export function Purchases({ orders }) {
  if (!orders.length) return <Empty text="No purchases yet" sub="Your orders & bookings will appear here." />;
  const sc = { Delivered: T.green, Shipped: T.blue, Booked: T.gold, Paid: T.blue, Pending: T.gray2 };
  return (<div><h2 style={h2}>My purchases</h2><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {orders.map((o) => (
      <div key={o.id} style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontWeight: 700 }}>{o.id}</span><span style={{ fontSize: 12.5, color: T.gray2 }}>{o.date}</span><span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 12, color: sc[o.status] || T.gray2, border: `1px solid ${(sc[o.status] || T.gray2)}33`, borderRadius: 8, padding: "3px 9px" }}>{o.status}</span></div>
        <div style={{ display: "flex", gap: 10 }}><div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: T.lineSoft, flexShrink: 0 }}><Pic tone={o.tone} /></div><div style={{ flex: 1, fontSize: 13.5, color: T.gray }}>{(o.items || []).join(", ")}</div><div style={{ fontFamily: T.fontDisplay, fontWeight: 800, color: T.orange }}>${o.total}</div></div>
      </div>
    ))}
  </div></div>);
}
export function PartnerApply() {
  const [f, setF] = useState({ name: "", contact: "", commission: "", payout: "", about: "" });
  return (<div><h2 style={h2}>Partner program</h2>
    <div style={{ ...card, marginBottom: 14, background: T.goldSoft, borderColor: T.gold }}><div style={{ color: "#8A6D2F", fontWeight: 700, marginBottom: 4 }}>Become a partner</div><div style={{ fontSize: 13.5, color: "#8A6D2F" }}>Refer customers and earn a commission on each sale.</div></div>
    <Field label="Your name" value={f.name} set={(v) => setF({ ...f, name: v })} ph="Full name" />
    <Field label="Contact" value={f.contact} set={(v) => setF({ ...f, contact: v })} ph="@username or email" />
    <div style={{ display: "flex", gap: 10 }}><Field label="Commission %" value={f.commission} set={(v) => setF({ ...f, commission: v })} ph="10" half /><Field label="Payout method" value={f.payout} set={(v) => setF({ ...f, payout: v })} ph="Card / wallet" half /></div>
    <Field label="About you" value={f.about} set={(v) => setF({ ...f, about: v })} ph="Audience, channels…" area />
    <button style={cta}>Send application</button>
  </div>);
}
export function Cabinet({ user, balance, ledger, onTab }) {
  return (<div>
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
      <div style={{ width: 54, height: 54, borderRadius: "50%", background: T.goldSoft, color: T.goldDeep, display: "grid", placeItems: "center", fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 22 }}>{(user.name || "U")[0]}</div>
      <div><div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18 }}>{user.name}</div><div style={{ fontSize: 13, color: T.gray2 }}>@{user.username} · {user.lang}</div></div>
    </div>
    <div style={{ ...card, marginBottom: 14, background: T.ink, color: "#fff", border: "none" }}><div style={{ fontSize: 12.5, color: "#bdbdbd", marginBottom: 4 }}>Store balance</div><div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 30 }}>${balance}</div></div>
    <div style={{ ...card }}>
      <div style={secLbl}>History</div>
      {ledger.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < ledger.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14 }}>{l.t}</div><div style={{ fontSize: 12, color: T.gray2 }}>{l.date}</div></div>
          <span style={{ fontFamily: T.fontDisplay, fontWeight: 700, color: l.d.startsWith("+") ? T.green : T.ink }}>{l.d}</span>
        </div>
      ))}
    </div>
  </div>);
}

/* -------- PaySheet: Delivery -> Payment (USDT/Polygon). Matches W❤️² flow. -------- */
/* Methods: only USDT active+colored; others grayscale until wired to backend. */
const MRHOST_API = "https://api.mrhost.asia";
const fmtAmt = (v) => { const n = Number(v); return Number.isFinite(n) ? String(n) : String(v == null ? "" : v); };
const PAY_METHODS = [
  { id: "gpay", label: "GPay" },
  { id: "usdt", label: "USDT" },
  { id: "card", label: "Card" },
  { id: "vietqr", label: "VietQR" },
  { id: "paypal", label: "PayPal", wide: true },
];
function PayLogo({ id, on }) {
  const gray = !on ? { filter: "grayscale(1)", opacity: 0.5 } : {};
  if (id === "usdt") return (<span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", ...gray }}><span style={{ width: 30, height: 30, borderRadius: "50%", background: "#26A17B", color: "#fff", display: "grid", placeItems: "center", fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 17 }}>₮</span></span>);
  if (id === "gpay") return <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 21, letterSpacing: "-.05em", ...gray }}><span style={{ color: on ? T.gold : undefined }}>G</span>Pay</span>;
  if (id === "card") return <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: ".03em", ...gray }}>VISA<span style={{ margin: "0 3px", color: "#bbb" }}>·</span>MC</span>;
  if (id === "vietqr") return <span style={{ fontWeight: 900, fontSize: 16, ...gray }}><span style={{ color: on ? "#E11" : undefined }}>V</span>IET<span style={{ color: on ? "#1565C0" : undefined }}>QR</span></span>;
  if (id === "paypal") return <span style={{ fontWeight: 900, fontStyle: "italic", fontSize: 17, ...gray }}><span style={{ color: on ? "#003087" : undefined }}>Pay</span><span style={{ color: on ? "#009CDE" : undefined }}>Pal</span></span>;
  return null;
}
function PayInput({ label, value, onChange, onBlur, ph, half, type = "text", required, err, leftAdorn }) {
  const [focus, setFocus] = useState(false);
  const showErr = !!err;
  const ok = required && value && String(value).trim() && !showErr;
  const borderColor = showErr ? T.red : (focus ? T.gold : T.line);
  return (
    <div style={{ marginBottom: 12, width: half ? "calc(50% - 5px)" : "100%" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: showErr ? T.red : T.gray2, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>{label}{required && <span style={{ color: showErr ? T.red : "#CDC9BE", fontSize: 13, transition: "color .15s" }}>*</span>}</div>
      <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${borderColor}`, borderRadius: 13, background: "#fff", boxShadow: focus && !showErr ? `0 0 0 3px ${T.goldSoft}` : (showErr ? "0 0 0 3px rgba(200,60,50,.10)" : "none"), transition: "border-color .15s, box-shadow .15s" }}>
        {leftAdorn && <div style={{ padding: "0 8px 0 12px", color: T.gray, fontSize: 14, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, borderRight: `1px solid ${T.lineSoft}` }}>{leftAdorn}</div>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => { setFocus(false); onBlur && onBlur(); }} placeholder={ph || ""} style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", padding: "12px 14px", fontFamily: T.fontBody, fontSize: 15 }} />
        {ok && <Check size={16} color={T.green} style={{ marginRight: 12, flexShrink: 0 }} />}
        {showErr && <span style={{ marginRight: 12, color: T.red, fontWeight: 800, fontSize: 16, flexShrink: 0, lineHeight: 1 }}>!</span>}
      </div>
      {showErr && <div style={{ color: T.red, fontSize: 12, marginTop: 4, fontWeight: 600 }}>{err}</div>}
    </div>
  );
}
function PaySelect({ label, value, onChange, options, half, required }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 12, width: half ? "calc(50% - 5px)" : "100%" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.gray2, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>{label}{required && <span style={{ color: "#CDC9BE", fontSize: 13 }}>*</span>}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${focus ? T.gold : T.line}`, borderRadius: 13, padding: "12px 14px", fontFamily: T.fontBody, fontSize: 15, outline: "none", background: "#fff", boxShadow: focus ? `0 0 0 3px ${T.goldSoft}` : "none", transition: "border-color .15s, box-shadow .15s", cursor: "pointer" }}>
        {options.map((o) => <option key={o.code} value={o.code}>{o.flag ? o.flag + "  " : ""}{o.name}</option>)}
      </select>
    </div>
  );
}
const PAY_COUNTRIES = [
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dial: "+84" },
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dial: "+66" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dial: "+62" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dial: "+63" },
  { code: "IN", name: "India", flag: "🇮🇳", dial: "+91" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dial: "+7" },
  { code: "AE", name: "UAE", flag: "🇦🇪", dial: "+971" },
  { code: "OTHER", name: "Other", flag: "🌍", dial: "+" },
];
export function PaySheet({ cart, onClose, agentId = "", storeName = "" }) {
  const [stage, setStage] = useState("delivery");
  const [method, setMethod] = useState("usdt");
  const [f, setF] = useState({ fname: "", lname: "", email: "", phone: "", addr: "", city: "", zip: "", country: "VN" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const total = cart.reduce((s, x) => s + Number(x.price) * x.qty, 0);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const mark = (k) => setTouched((t) => ({ ...t, [k]: true }));
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errs = {
    fname: !f.fname.trim() ? "Required" : "",
    lname: !f.lname.trim() ? "Required" : "",
    email: !f.email.trim() ? "Required" : (!emailRe.test(f.email) ? "Enter a valid email" : ""),
    addr: !f.addr.trim() ? "Required" : "",
    city: !f.city.trim() ? "Required" : "",
    zip: !f.zip.trim() ? "Required" : "",
  };
  const valid = !Object.values(errs).some(Boolean);
  const errFor = (k) => ((touched[k] || submitted) && errs[k]) ? errs[k] : "";
  const country = PAY_COUNTRIES.find((c) => c.code === f.country) || PAY_COUNTRIES[0];
  const onContinue = () => { if (valid) setStage("payment"); else setSubmitted(true); };
  const [inv, setInv] = useState(null);
  const [invErr, setInvErr] = useState("");
  const [invLoading, setInvLoading] = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [copied, setCopied] = useState("");
  const isPaid = (s) => ["paid", "confirmed", "completed", "settled", "success"].includes(String(s || "").toLowerCase());
  const isDead = (s) => ["expired", "cancelled", "canceled", "rejected", "failed"].includes(String(s || "").toLowerCase());
  const copy = (k, v) => { try { navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 1300); } catch (_) {} };

  async function createInvoice() {
    setStage("invoice"); setInv(null); setInvErr(""); setInvLoading(true); setPayStatus("");
    const items = cart.map((x) => ({ id: String(x.id), title: title(x), qty: x.qty, price: Number(x.price) }));
    const single = cart.length === 1 ? cart[0] : null;
    const body = {
      order: {
        product_id: single ? String(single.id) : "cart",
        product_title: single ? title(single) : `${cart.length} items · ${storeName || "Store"}`,
        product_kind: "agent_store_item",
        qty: cart.reduce((s, x) => s + x.qty, 0),
        amount_usd: String(total),
        currency: "USD",
        metadata: { agent_id: agentId, source: "agent_store", store: storeName, items, email: f.email },
      },
      shipping: { first_name: f.fname, last_name: f.lname, email: f.email, phone: f.phone ? `${country.dial} ${f.phone}`.trim() : "", address1: f.addr, city: f.city, zip_code: f.zip, country_code: f.country },
      payment: { method: "USDT", network: "POLYGON" },
    };
    try {
      const res = await fetch(`${MRHOST_API}/api/v1/gpay/order-payment-requests`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => null);
      if (!res.ok) { const d = data && data.detail; setInvErr((d && (d.message || (typeof d === "string" ? d : ""))) || (data && data.message) || `Server error ${res.status}`); setInvLoading(false); return; }
      setInv(data); setPayStatus(data && data.status || ""); setInvLoading(false);
    } catch (_) { setInvErr("Could not reach the payment server (network / CORS). If this persists we enable the store origin on the API."); setInvLoading(false); }
  }

  useEffect(() => {
    if (!inv) return;
    const pid = inv.order_id || (inv.order && inv.order.public_id);
    if (!pid) return;
    let alive = true; let iv;
    const tick = async () => {
      try {
        const r = await fetch(`${MRHOST_API}/api/v1/gpay/order-payment-requests/${encodeURIComponent(pid)}/status`, { headers: { Accept: "application/json" } });
        const d = await r.json().catch(() => null);
        if (!alive) return;
        const st = (d && (d.status || (d.order && (d.order.status || d.order.lifecycle_status)) || (d.intent && d.intent.status))) || "";
        if (st) setPayStatus(st);
        if (isPaid(st) || isDead(st)) clearInterval(iv);
      } catch (_) {}
    };
    if (!isPaid(inv.status) && !isDead(inv.status)) { iv = setInterval(tick, 5000); tick(); }
    return () => { alive = false; clearInterval(iv); };
  }, [inv]);
  const back = { display: "inline-flex", gap: 4, alignItems: "center", background: "none", border: "none", color: T.gray, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0, fontFamily: T.fontBody };
  const closeBtn = { position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center", color: T.gray };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,.5)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(100%,520px)", background: "#fff", borderRadius: 22, padding: "26px 22px 22px", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={closeBtn}><X size={17} /></button>

        {stage === "delivery" && (<>
          <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 28, margin: "0 0 4px" }}>Checkout</h3>
          <div style={{ color: T.gray2, fontSize: 14, marginBottom: 16 }}>Enter your details — we'll handle the rest.</div>
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {cart.map((x) => <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}><span style={{ fontWeight: 700 }}>{title(x)} <span style={{ color: T.gray2, fontWeight: 500 }}>· QTY {x.qty}</span></span><span style={{ color: T.gold, fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18 }}>${Number(x.price) * x.qty}</span></div>)}
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Delivery details</div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            <PayInput label="First name" required value={f.fname} onChange={(v) => set("fname", v)} onBlur={() => mark("fname")} err={errFor("fname")} ph="Ruslan" half />
            <PayInput label="Last name" required value={f.lname} onChange={(v) => set("lname", v)} onBlur={() => mark("lname")} err={errFor("lname")} ph="Volkov" half />
          </div>
          <PayInput label="Email" required value={f.email} onChange={(v) => set("email", v)} onBlur={() => mark("email")} err={errFor("email")} ph="you@email.com" type="email" />
          <PayInput label="Phone" value={f.phone} onChange={(v) => set("phone", v)} ph="000 000 000" leftAdorn={<span><span style={{ fontSize: 16 }}>{country.flag}</span> {country.dial}</span>} />
          <PayInput label="Street address" required value={f.addr} onChange={(v) => set("addr", v)} onBlur={() => mark("addr")} err={errFor("addr")} ph="Street, building" />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            <PayInput label="City" required value={f.city} onChange={(v) => set("city", v)} onBlur={() => mark("city")} err={errFor("city")} ph="Nha Trang" half />
            <PayInput label="ZIP / Postal" required value={f.zip} onChange={(v) => set("zip", v)} onBlur={() => mark("zip")} err={errFor("zip")} ph="000000" half />
          </div>
          <PaySelect label="Country" required value={f.country} onChange={(v) => set("country", v)} options={PAY_COUNTRIES} />
          {submitted && !valid && <div style={{ color: T.red, fontSize: 12.5, fontWeight: 600, margin: "2px 0 8px" }}>Please fill the highlighted fields.</div>}
          <button onClick={onContinue} style={{ ...cta, marginTop: 6 }}>Continue to payment</button>
        </>)}

        {stage === "payment" && (<>
          <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 30, margin: "0 0 4px" }}>Payment</h3>
          <div style={{ color: T.gray2, fontSize: 14, marginBottom: 18 }}>Choose payment method for this order.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PAY_METHODS.map((m) => {
              const isUsdt = m.id === "usdt";
              const sel = method === m.id && isUsdt;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{ gridColumn: m.wide ? "1 / -1" : "auto", minHeight: 84, borderRadius: 16, border: `2px solid ${sel ? "#111" : T.line}`, background: sel ? "#111" : "#fff", color: sel ? "#fff" : T.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: T.fontBody, fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}>
                  <PayLogo id={m.id} on={isUsdt} />
                  <span style={{ color: sel ? "#fff" : (isUsdt ? T.ink : "#9a9a9a") }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {method === "usdt" ? (
            <div style={{ marginTop: 16, border: `1px solid ${T.line}`, borderRadius: 16, padding: 16, textAlign: "center" }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                <span style={{ height: 36, padding: "0 18px", borderRadius: 999, background: "#111", color: "#fff", display: "inline-flex", alignItems: "center", fontWeight: 800, fontSize: 12, letterSpacing: ".02em" }}>POLYGON</span>
              </div>
              <div style={{ color: T.gray2, fontSize: 13, lineHeight: 1.45 }}>Polygon selected. The invoice will use the same USDT payment layout as the W❤️² flow.</div>
            </div>
          ) : (
            <div style={{ marginTop: 16, border: `1px solid ${T.line}`, borderRadius: 16, padding: 16, textAlign: "center", color: T.gray2, fontSize: 13.5 }}>
              <b style={{ color: T.ink }}>{PAY_METHODS.find((x) => x.id === method)?.label}</b> will be enabled soon. Use <b style={{ color: T.ink }}>USDT</b> for now.
            </div>
          )}

          <button onClick={() => method === "usdt" && createInvoice()} disabled={method !== "usdt"} style={{ ...cta, marginTop: 16, opacity: method === "usdt" ? 1 : 0.4, cursor: method === "usdt" ? "pointer" : "not-allowed" }}>{method === "usdt" ? "Pay with USDT POLYGON" : "Select USDT to continue"}</button>
          <button onClick={() => setStage("delivery")} style={{ ...back, marginTop: 14, width: "100%", justifyContent: "center" }}><ChevronLeft size={16} /> Back to order preview</button>
        </>)}

        {stage === "invoice" && (<>
          <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 28, margin: "0 0 2px", letterSpacing: "-.02em", lineHeight: 1.05 }}>Pay with USDT POLYGON</h3>
          <div style={{ color: T.gray2, fontSize: 14, marginBottom: 16 }}>Scan QR or copy wallet address.</div>
          {invLoading && <div style={{ ...card, textAlign: "center", padding: "30px 18px", color: T.gray2 }}>Creating invoice…</div>}
          {invErr && !invLoading && (
            <div style={{ ...card, padding: 18 }}>
              <div style={{ color: T.red, fontWeight: 700, marginBottom: 6 }}>Couldn't create invoice</div>
              <div style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.5 }}>{String(invErr)}</div>
              <button onClick={createInvoice} style={{ ...cta, marginTop: 14 }}>Try again</button>
            </div>
          )}
          {inv && !invLoading && (isPaid(payStatus) ? (
            <div style={{ ...card, textAlign: "center", padding: "26px 18px" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: T.green, color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Check size={24} /></div>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Payment received</div>
              <div style={{ color: T.gray2, fontSize: 13.5, lineHeight: 1.5 }}>Your order is created and USDT is credited to your GPay balance. Check <b style={{ color: T.ink }}>{f.email}</b> to verify your email and open your cabinet.</div>
            </div>
          ) : (() => {
            const amt = fmtAmt(inv.exact_amount || inv.amount_requested);
            const addr = inv.deposit_address || inv.wallet_address || "";
            const net = (inv.network || "POLYGON").toUpperCase();
            const prod = cart.length === 1 ? title(cart[0]) : `${cart.length} items`;
            const st = payStatus || inv.status || "waiting_tx";
            const rows = [["Order", inv.order_id, false], ["Product", prod, false], ["Network", net, false], ["Deposit address", addr, true], ["Amount (USDT)", amt, false], ["Status", st, true]];
            return (<>
              <div style={{ ...card, padding: 18 }}>
                {(inv.qr_payload || addr) && <div style={{ display: "grid", placeItems: "center", marginBottom: 12 }}><img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inv.qr_payload || addr)}`} style={{ width: 190, height: 190 }} /></div>}
                <div style={{ textAlign: "center", fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 36, letterSpacing: "-.03em", color: T.orange }}>{amt} <span style={{ fontSize: 20, color: T.gray2 }}>USDT</span></div>
                <div style={{ textAlign: "center", color: T.gray2, fontSize: 13.5, margin: "4px 0 8px" }}>Send exactly this amount via <b style={{ color: T.ink }}>{net}</b>.</div>
                {rows.map(([k, v, mono]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: `1px solid ${T.lineSoft}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.gray2, textTransform: "uppercase", letterSpacing: ".03em", flexShrink: 0 }}>{k}</span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, textAlign: "right", wordBreak: mono ? "break-all" : "normal", fontFamily: mono ? "monospace" : T.fontBody }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => copy("addr", addr)} style={{ width: "100%", display: "inline-flex", gap: 8, alignItems: "center", justifyContent: "center", border: "1px solid #CDD1DA", background: copied === "addr" ? "linear-gradient(135deg,#E7F6EC,#F6FBF7,#DDEFE2)" : "linear-gradient(135deg,#ECEEF1 0%,#FBFBFD 45%,#D9DCE3 100%)", borderRadius: 13, padding: "14px", fontFamily: T.fontBody, fontWeight: 800, fontSize: 14.5, letterSpacing: ".01em", cursor: "pointer", color: copied === "addr" ? T.green : T.ink, marginTop: 12, boxShadow: "0 1px 0 rgba(255,255,255,.9) inset, 0 3px 9px rgba(20,22,30,.12)" }}>{copied === "addr" ? <><Check size={16} /> Copied</> : "Copy Polygon address"}</button>
              <div style={{ marginTop: 12, background: "#111", color: "#fff", borderRadius: 14, padding: "14px 16px", fontSize: 13, lineHeight: 1.5, textAlign: "center" }}>Send <b>{amt} USDT</b> on {net} to the address above. Payment is detected automatically — no need to paste a transaction hash.</div>
            </>);
          })())}
          <button onClick={() => setStage("payment")} style={{ ...back, marginTop: 14, width: "100%", justifyContent: "center" }}><ChevronLeft size={16} /> Back to payment methods</button>
        </>)}
      </div>
    </div>
  );
}
