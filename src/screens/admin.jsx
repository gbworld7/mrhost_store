import React, { useState, useRef } from "react";
import {
  Plus, Trash2, X, Check, ChevronLeft, ChevronDown, ChevronRight, Upload, Eye, EyeOff,
  Star, MessageCircle, Package, BarChart3, FileArchive, Reply, Image as ImageIcon, FileText,
  RefreshCw, Send, UserPlus, Calendar, Video, Sparkles, FolderOpen,
} from "lucide-react";
import { T, STATUS } from "../theme/tokens.js";
import { api } from "../api/client.js";
import { card, primaryBtn, ghostBtn, Back, Pic, Stars, Field, Toggle, Section, Spinner, Overlay, Empty, Avatar, toast } from "../components/ui.jsx";

const h3 = { fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18 };
const title = (it) => (it.description || "").split("—")[0].trim() || "Untitled";
const tileX = { position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.6)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" };
const tile = { position: "relative", aspectRatio: "1/1", borderRadius: 12, overflow: "hidden", background: T.lineSoft, border: `1px solid ${T.line}` };
const addTile = { display: "flex", flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center", aspectRatio: "1/1", borderRadius: 12, border: `1.5px dashed ${T.gold}`, background: T.goldSoft, color: "#8A6D2F", cursor: "pointer" };

// DRONOVOD_ADMIN_DESCRIPTION_MODAL_V2
const cardDescOnly = (it) => ((it.description || "").split("—").slice(1).join("—").trim()) || it.description || "";
const cardDescPreview = {
  color: T.gray,
  fontSize: 14,
  lineHeight: 1.35,
  margin: "0 0 10px",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
function CardDescriptionModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,.38)", display: "grid", placeItems: "end center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px,100%)", maxHeight: "72vh", overflow: "auto", borderRadius: 26, background: "#fff", border: `1px solid ${T.line}`, boxShadow: "0 24px 80px rgba(0,0,0,.22)", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 900, letterSpacing: "-.03em", flex: 1 }}>{title(item)}</div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: T.lineSoft, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <p style={{ color: T.gray, fontSize: 16, lineHeight: 1.55, margin: 0 }}>{cardDescOnly(item)}</p>
      </div>
    </div>
  );
}

function Pill({ s }) { const c = STATUS[s] || T.gray2; return <span style={{ fontWeight: 700, fontSize: 12, color: c, border: `1px solid ${c}44`, borderRadius: 8, padding: "3px 9px", fontFamily: T.fontBody }}>{s}</span>; }

/* -------- Cards list -------- */
export function AdminCards({ items, onEdit, onNew, onChange }) {
  const [descOpen, setDescOpen] = useState(null);
  const toggleVis = async (it) => { try { await api.setVisible(it.id, !it.visible); toast(it.visible ? "Hidden from public" : "Published"); onChange?.(); } catch { toast("Could not change visibility.", "error"); } };
  return (<div>
    <CardDescriptionModal item={descOpen} onClose={() => setDescOpen(null)} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px" }}><h3 style={h3}>Cards</h3><button onClick={onNew} style={primaryBtn}><Plus size={16} /> New card</button></div>
    {!items.length ? <Empty text="No cards yet" sub="Create your first card." /> : (
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
        {items.map((it) => (
          <div key={it.id} style={{ background: "linear-gradient(180deg,#F9F3E5,#FFFFFF)", border: `1px solid ${T.gold}`, borderRadius: 22, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,.06)", opacity: it.visible ? 1 : 0.6 }}>
            <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 18, overflow: "hidden", background: "#fff", position: "relative", border: `1px solid ${T.lineSoft}` }}>
              <Pic tone={(it.images || [])[0]} />
              {it.booking?.enabled && <span style={badge}><Calendar size={12} /> Booking</span>}
              <button onClick={() => toggleVis(it)} title={it.visible ? "Published — tap to hide" : "Hidden — tap to publish"} style={{ ...badge, left: "auto", right: 8, border: "none", cursor: "pointer", background: it.visible ? "rgba(31,157,85,.95)" : "rgba(168,92,92,.95)" }}>{it.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, margin: "16px 0 4px", fontSize: 23, letterSpacing: "-.01em" }}>{title(it)}</div>
            <p style={cardDescPreview}>{cardDescOnly(it)}</p>
            {cardDescOnly(it) && <button onClick={() => setDescOpen(it)} style={{ border: "none", background: "none", color: T.goldDeep || T.gold, padding: 0, margin: "0 0 10px", textAlign: "left", fontFamily: T.fontBody, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Details</button>}
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 28, color: T.orange, marginBottom: 14 }}>${it.price}</div>
            <button onClick={() => onEdit(it)} style={{ width: "100%", padding: 15, borderRadius: 14, border: `1.5px solid ${T.ink}`, background: "#fff", color: T.ink, fontFamily: T.fontBody, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Edit</button>
          </div>
        ))}
      </div>
    )}
  </div>);
}
const badge = { position: "absolute", top: 8, left: 8, display: "inline-flex", gap: 4, alignItems: "center", background: "rgba(17,17,17,.82)", color: "#fff", borderRadius: 8, padding: "4px 7px", fontFamily: T.fontBody, fontWeight: 600, fontSize: 11 };

/* -------- Card editor -------- */
export function CardEditor({ item, cats, onBack, onSaved }) {
  const init = item || { id: "", description: "", price: "", category_id: "", images: [], video: "", files: [], booking: { enabled: false, deposit_percent: 50, slots: [] }, visible: false };
  const [photos, setPhotos] = useState((init.images || []).map((t, i) => ({ id: "p" + i, tone: t, url: t, status: "done" })));
  const [video, setVideo] = useState(init.video ? { url: init.video, status: "done" } : null);
  const [files, setFiles] = useState((init.files || []).map((f, i) => ({ id: "f" + i, ...f, status: "done" })));
  const [desc, setDesc] = useState(init.description); const [price, setPrice] = useState(init.price); const [catId, setCatId] = useState(init.category_id);
  const [booking, setBooking] = useState(init.booking || { enabled: false, deposit_percent: 50, slots: [] });
  const [visible, setVisible] = useState(!!init.visible);
  const [busy, setBusy] = useState(false); const [aiBusy, setAiBusy] = useState(false); const [slotForm, setSlotForm] = useState(false);
  const fileIn = useRef(); const vidIn = useRef(); const docIn = useRef(); const seq = useRef(0);

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file || busy) return; setBusy(true);
    const id = "p" + (++seq.current); const tone = "#EFEDE7";
    setPhotos((p) => [...p, { id, tone, status: "uploading" }]);
    try { const r = await api.uploadMedia(file); setPhotos((p) => p.map((x) => x.id === id ? { ...x, url: r.url, status: "done" } : x)); }
    catch { setPhotos((p) => p.map((x) => x.id === id ? { ...x, status: "done" } : x)); } finally { setBusy(false); }
  };
  const onVideo = async (e) => { const file = e.target.files?.[0]; if (!file || busy) return; setBusy(true); setVideo({ status: "uploading" }); try { const r = await api.uploadMedia(file); setVideo({ url: r.url, status: "done" }); } catch { setVideo({ status: "done" }); } finally { setBusy(false); } };
  const onDoc = async (e) => { const file = e.target.files?.[0]; if (!file || busy) return; setBusy(true); const id = "f" + Date.now(); setFiles((f) => [...f, { id, name: file.name, size: "", status: "uploading" }]); try { const r = await api.uploadFile(file); setFiles((f) => f.map((x) => x.id === id ? { ...x, url: r.url, name: r.name || file.name, status: "done" } : x)); } catch { setFiles((f) => f.map((x) => x.id === id ? { ...x, status: "done" } : x)); } finally { setBusy(false); } };
  const aiText = async () => { if (aiBusy) return; setAiBusy(true); try { const r = await api.aiText(desc || ""); if (r.text) setDesc(r.text); } catch { setDesc((d) => d || "Premium product — crafted with care, ready to ship."); } finally { setAiBusy(false); } };
  const aiImage = async () => { if (busy) return; setBusy(true); const id = "ai" + Date.now(); setPhotos((p) => [...p, { id, tone: "#EEE9F0", status: "uploading" }]); try { const r = await api.aiImage(desc || ""); setPhotos((p) => p.map((x) => x.id === id ? { ...x, url: r.url, status: "done" } : x)); } catch { setPhotos((p) => p.map((x) => x.id === id ? { ...x, status: "done" } : x)); } finally { setBusy(false); } };
  const save = async () => {
    if (busy) return; setBusy(true);
    const payload = { id: init.id, description: desc, price, category_id: catId, images: photos.map((p) => p.url || p.tone), video: video?.url || "", files: files.map((f) => ({ name: f.name, url: f.url, size: f.size })), booking, visible };
    try { await api.saveCard(payload); toast(init.id ? "Card saved" : "Card created"); setBusy(false); onSaved?.(); }
    catch { setBusy(false); toast("Could not save card. Try again.", "error"); }
  };
  const del = async () => { if (!init.id) { onBack(); return; } try { await api.deleteCard(init.id); toast("Card deleted"); } catch { toast("Could not delete card.", "error"); } onSaved?.(); };

  return (<div>
    <Back onClick={onBack} />
    <h3 style={{ ...h3, fontSize: 20, margin: "12px 0 16px" }}>{item ? "Edit card" : "New card"}</h3>
    <input ref={fileIn} type="file" accept="image/*" hidden onChange={onPhoto} />
    <input ref={vidIn} type="file" accept="video/*" hidden onChange={onVideo} />
    <input ref={docIn} type="file" hidden onChange={onDoc} />

    <Section title="Photos" right={<button onClick={aiImage} disabled={busy} style={{ ...ghostBtn, marginLeft: "auto", padding: "6px 11px", fontSize: 12.5, color: T.goldDeep, borderColor: T.gold }}><Sparkles size={14} /> AI image</button>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {photos.map((p) => (<div key={p.id} style={tile}><Pic tone={p.tone} />{p.status === "uploading" && <Overlay><Spinner /></Overlay>}{p.status === "done" && <button onClick={() => setPhotos((x) => x.filter((y) => y.id !== p.id))} style={tileX}><X size={13} /></button>}</div>))}
        <button onClick={() => fileIn.current.click()} disabled={busy} style={addTile}><ImageIcon size={20} /><span style={{ fontSize: 11 }}>Add photo</span></button>
      </div>
    </Section>

    <Section title="Video">
      {video ? <div style={{ ...tile, width: "100%", aspectRatio: "16/9", background: "#000" }}>{video.status === "uploading" ? <Overlay><Spinner size={22} /></Overlay> : (<><Video size={26} color="#fff" style={{ position: "absolute", inset: 0, margin: "auto" }} /><button onClick={() => setVideo(null)} style={tileX}><X size={13} /></button></>)}</div>
        : <button onClick={() => vidIn.current.click()} disabled={busy} style={{ ...addTile, width: "100%", aspectRatio: "16/9" }}><Video size={22} /><span style={{ fontSize: 11 }}>Add video</span></button>}
    </Section>

    <Section title="Files / documents">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {files.map((f) => (<div key={f.id} style={{ ...card, display: "flex", gap: 10, alignItems: "center", padding: "10px 12px" }}><FileText size={17} color={T.gold} /><span style={{ flex: 1, fontSize: 13.5 }}>{f.name}</span>{f.status === "uploading" ? <Spinner size={15} /> : <button onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}><Trash2 size={15} /></button>}</div>))}
        <button onClick={() => docIn.current.click()} disabled={busy} style={{ ...ghostBtn, width: "fit-content" }}><Upload size={15} /> Add file</button>
      </div>
    </Section>

    <Section title="Details" right={<button onClick={aiText} disabled={aiBusy} style={{ ...ghostBtn, marginLeft: "auto", padding: "6px 11px", fontSize: 12.5, color: T.goldDeep, borderColor: T.gold }}>{aiBusy ? <Spinner size={14} /> : <Sparkles size={14} />} AI text</button>}>
      <Field label="Description" value={desc} set={setDesc} ph="Describe the product or service" area />
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Price ($)" value={price} set={setPrice} ph="0" half />
        <label style={{ flex: 1, marginBottom: 12 }}><span style={{ display: "block", fontSize: 12.5, color: T.gray, marginBottom: 5 }}>Category</span>
          <select value={catId} onChange={(e) => setCatId(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "11px 13px", fontFamily: T.fontBody, fontSize: 14, background: "#fff" }}>
            <option value="">Main (no category)</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
      </div>
    </Section>

    <Section title="Booking">
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: booking.enabled ? 14 : 0 }}><Calendar size={17} color={T.gold} /><span style={{ flex: 1, fontWeight: 700 }}>Enable booking</span><Toggle on={booking.enabled} set={(v) => setBooking((b) => ({ ...b, enabled: v }))} /></div>
        {booking.enabled && (<>
          <Field label="Deposit / prepay %" value={String(booking.deposit_percent)} set={(v) => setBooking((b) => ({ ...b, deposit_percent: parseInt(v || 0) || 0 }))} ph="50" />
          <div style={{ fontSize: 12.5, color: T.gray, margin: "4px 0 8px" }}>Slots</div>
          {!booking.slots.length && <div style={{ color: T.gray2, fontSize: 13.5, marginBottom: 8 }}>No dates yet.</div>}
          {booking.slots.map((s, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.lineSoft}` }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{s.date} · {s.time}</div><div style={{ fontSize: 12, color: T.gray2 }}>{s.comment || "—"} · {s.capacity} seat(s)</div></div><button onClick={() => setBooking((b) => ({ ...b, slots: b.slots.filter((_, k) => k !== i) }))} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}><Trash2 size={15} /></button></div>))}
          {slotForm ? <SlotForm onAdd={(s) => { setBooking((b) => ({ ...b, slots: [...b.slots, s] })); setSlotForm(false); }} onCancel={() => setSlotForm(false)} /> : <button onClick={() => setSlotForm(true)} style={{ ...ghostBtn, marginTop: 10 }}><Plus size={15} /> Add date</button>}
        </>)}
      </div>
    </Section>

    <Section title="Visibility"><div style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>{visible ? <Eye size={17} color={T.green} /> : <EyeOff size={17} color={T.gray2} />}<span style={{ flex: 1, fontWeight: 700 }}>{visible ? "Visible in catalog" : "Hidden"}</span><Toggle on={visible} set={setVisible} /></div></Section>

    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
      <button onClick={save} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.5 : 1, flex: 1, justifyContent: "center", padding: 14 }}><Check size={17} /> Save card</button>
      <button onClick={del} style={{ ...ghostBtn, padding: "13px 14px", color: T.red, borderColor: "#eccfca" }}><Trash2 size={16} /></button>
    </div>
  </div>);
}
function SlotForm({ onAdd, onCancel }) {
  const [s, setS] = useState({ date: "", time: "", comment: "", capacity: "1" });
  return (<div style={{ background: T.goldSoft, border: `1px solid ${T.gold}`, borderRadius: 12, padding: 12, marginTop: 10 }}>
    <div style={{ display: "flex", gap: 10 }}><Field label="Date" value={s.date} set={(v) => setS({ ...s, date: v })} ph="2026-06-04" half /><Field label="Time" value={s.time} set={(v) => setS({ ...s, time: v })} ph="15:00" half /></div>
    <div style={{ display: "flex", gap: 10 }}><Field label="Comment" value={s.comment} set={(v) => setS({ ...s, comment: v })} ph="Online / address" half /><Field label="Seats" value={s.capacity} set={(v) => setS({ ...s, capacity: v })} ph="1" half /></div>
    <div style={{ display: "flex", gap: 8 }}><button onClick={() => s.date && s.time && onAdd({ ...s, capacity: parseInt(s.capacity || 1) || 1 })} style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}><Check size={15} /> Add</button><button onClick={onCancel} style={ghostBtn}>Cancel</button></div>
  </div>);
}

/* -------- Categories -------- */
export function AdminCategories({ cats, counts, onChange }) {
  const [adding, setAdding] = useState(false); const [name, setName] = useState("");
  const add = async () => { const t = name.trim(); if (!t) return; try { await api.saveCategory({ title: t }); toast(`Category "${t}" created`); setName(""); setAdding(false); onChange?.(); } catch { toast("Could not create category. Try again.", "error"); } };
  const del = async (id) => { try { await api.deleteCategory(id); toast("Category deleted"); } catch { toast("Could not delete category.", "error"); } onChange?.(); };
  const vis = async (c) => { const next = c.visible === false; try { await api.setCategoryVisible(c.id, next); toast(next ? "Category published" : "Category hidden from public"); onChange?.(); } catch { toast("Could not change visibility.", "error"); } };
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px" }}><h3 style={h3}>Categories</h3><button onClick={() => setAdding(true)} style={primaryBtn}><Plus size={16} /> New category</button></div>
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 10, borderColor: T.blue }}><FolderOpen size={18} color={T.blue} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: T.blue }}>Main</div><div style={{ fontSize: 12.5, color: T.gray2 }}>All cards</div></div></div>
    {adding && <div style={{ ...card, marginBottom: 10, background: T.goldSoft, borderColor: T.gold }}><Field label="Category name" value={name} set={setName} ph="e.g. Accessories" /><div style={{ display: "flex", gap: 8 }}><button onClick={add} style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}><Check size={15} /> Create</button><button onClick={() => { setAdding(false); setName(""); }} style={ghostBtn}>Cancel</button></div></div>}
    {cats.map((c) => (<div key={c.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 10, opacity: c.visible === false ? 0.55 : 1 }}><Avatar name={c.title} src={c.logo || ""} size={40} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{c.title}</div><div style={{ fontSize: 12.5, color: T.gray2 }}>{counts[c.id] || 0} cards</div></div><button onClick={() => vis(c)} title={c.visible === false ? "Hidden — tap to publish" : "Published — tap to hide"} style={{ ...ghostBtn, padding: "8px 11px", border: "none", color: "#fff", background: c.visible === false ? "rgba(168,92,92,.95)" : "rgba(31,157,85,.95)" }}>{c.visible === false ? <EyeOff size={15} /> : <Eye size={15} />}</button><button onClick={() => del(c.id)} style={{ ...ghostBtn, padding: "8px 11px", color: T.red, borderColor: "#eccfca" }}><Trash2 size={15} /></button></div>))}
  </div>);
}

/* -------- Orders -------- */
export function Orders({ orders }) {
  const [open, setOpen] = useState(null);
  if (!orders.length) return <Empty text="No orders yet" sub="Orders and bookings will appear here." />;
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px" }}><h3 style={h3}>Orders</h3><button style={ghostBtn}><RefreshCw size={15} /> Reload</button></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {orders.map((o) => (
        <div key={o.id} style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700 }}>{o.id}</span><Pill s={o.status} /></div><div style={{ fontSize: 13, color: T.gray, marginTop: 3 }}>{o.customer}</div><div style={{ fontSize: 13.5, marginTop: 3 }}>{o.product}</div></div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, color: T.orange }}>${o.total}</div>
            <button onClick={() => setOpen(open === o.id ? null : o.id)} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}>{open === o.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</button>
          </div>
          {open === o.id && (<div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.lineSoft}` }}>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Fulfillment · {o.prod || "—"}</div>
            <Field label="Production notes" value="" set={() => {}} ph="Notes for the factory / fulfillment" area />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button style={primaryBtn}><FileArchive size={15} /> Compose package</button><button style={ghostBtn}><Upload size={15} /> Download ZIP</button><button style={ghostBtn}><Send size={15} /> Send test</button></div>
          </div>)}
        </div>
      ))}
    </div>
  </div>);
}

/* -------- Reviews moderation -------- */
export function ReviewsAdmin({ reviews }) {
  const [list, setList] = useState(reviews); const [draft, setDraft] = useState({});
  const reply = async (id) => { const r = draft[id] || ""; setList((l) => l.map((x) => x.id === id ? { ...x, reply: r } : x)); setDraft((d) => ({ ...d, [id]: "" })); try { await api.replyReview(id, r); } catch {} };
  const vis = async (id, v) => { setList((l) => l.map((x) => x.id === id ? { ...x, visible: v } : x)); try { await api.reviewVisibility(id, v); } catch {} };
  if (!list.length) return <Empty text="No reviews yet" />;
  return (<div><h3 style={{ ...h3, margin: "4px 0 14px" }}>Reviews</h3><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {list.map((r) => (
      <div key={r.id} style={{ ...card, opacity: r.visible === false ? 0.6 : 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.goldSoft, color: T.goldDeep, display: "grid", placeItems: "center", fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 12 }}>{(r.name || "?")[0]}</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span><Stars value={r.rating} size={12} />
          <button onClick={() => vis(r.id, r.visible === false)} style={{ marginLeft: "auto", ...ghostBtn, padding: "6px 10px", fontSize: 12 }}>{r.visible === false ? <><Eye size={14} /> Show</> : <><EyeOff size={14} /> Hide</>}</button>
        </div>
        {r.item && <div style={{ fontSize: 12, color: T.gray2, marginBottom: 4 }}>on {r.item}</div>}
        <p style={{ fontSize: 13.5, color: T.gray, margin: "0 0 10px" }}>{r.text}</p>
        {r.reply ? <div style={{ background: T.goldSoft, border: `1px solid ${T.gold}`, borderRadius: 11, padding: "9px 12px", fontSize: 13.5 }}><b style={{ color: "#8A6D2F" }}>Reply:</b> {r.reply}</div>
          : <div style={{ display: "flex", gap: 8 }}><input value={draft[r.id] || ""} onChange={(e) => setDraft((d) => ({ ...d, [r.id]: e.target.value }))} placeholder="Admin reply" style={{ flex: 1, border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "10px 12px", fontFamily: T.fontBody, fontSize: 13.5, outline: "none" }} /><button onClick={() => reply(r.id)} style={primaryBtn}><Reply size={15} /> Reply</button></div>}
      </div>
    ))}
  </div></div>);
}

/* -------- Partners -------- */
export function Partners({ partners, onChange }) {
  const [list, setList] = useState(partners); const [add, setAdd] = useState(false); const [f, setF] = useState({ name: "", contact: "", link: "", desc: "" });
  const save = async () => { if (!f.name.trim()) return; const p = { id: "p" + Date.now(), ...f, status: "active" }; setList((l) => [...l, p]); setF({ name: "", contact: "", link: "", desc: "" }); setAdd(false); try { await api.savePartner(p); } catch {} };
  const del = async (id) => { setList((l) => l.filter((x) => x.id !== id)); try { await api.deletePartner(id); } catch {} };
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px" }}><h3 style={h3}>Partners</h3><button onClick={() => setAdd(true)} style={primaryBtn}><Plus size={16} /> Add partner</button></div>
    {add && <div style={{ ...card, marginBottom: 12, background: T.goldSoft, borderColor: T.gold }}><Field label="Name" value={f.name} set={(v) => setF({ ...f, name: v })} ph="Name or brand" /><div style={{ display: "flex", gap: 10 }}><Field label="Contact" value={f.contact} set={(v) => setF({ ...f, contact: v })} ph="Contact" half /><Field label="Telegram / link" value={f.link} set={(v) => setF({ ...f, link: v })} ph="t.me/..." half /></div><Field label="Description" value={f.desc} set={(v) => setF({ ...f, desc: v })} ph="Short description" area /><div style={{ display: "flex", gap: 8 }}><button onClick={save} style={{ ...primaryBtn, flex: 1, justifyContent: "center" }}><Check size={15} /> Save</button><button onClick={() => setAdd(false)} style={ghostBtn}>Cancel</button></div></div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((p) => (<div key={p.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 11, background: T.goldSoft, color: T.goldDeep, display: "grid", placeItems: "center", fontFamily: T.fontDisplay, fontWeight: 700 }}>{p.name[0]}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 12.5, color: T.gray2 }}>{p.contact} · {p.link}</div></div><span style={{ fontSize: 12, fontWeight: 700, color: T.green, border: `1px solid ${T.green}44`, borderRadius: 8, padding: "3px 9px" }}>{p.status}</span><button onClick={() => del(p.id)} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}><Trash2 size={16} /></button></div>))}
    </div>
  </div>);
}

/* -------- Print designs -------- */
export function PrintDesigns({ items }) {
  const [tpl, setTpl] = useState(false); const [prev, setPrev] = useState(false); const [instr, setInstr] = useState(false);
  const [text, setText] = useState(""); const [mode, setMode] = useState("standard"); const [notes, setNotes] = useState("");
  const slot = (label, on, set, icon) => (<div style={{ flex: 1 }}><div style={{ fontSize: 12, color: T.gray, marginBottom: 6 }}>{label}</div>{on ? <div style={{ ...tile }}><Pic tone="#EFEDE7" /><button onClick={() => set(false)} style={tileX}><X size={13} /></button></div> : <button onClick={() => set(true)} style={{ ...addTile, width: "100%" }}>{icon}<span style={{ fontSize: 11 }}>{label}</span></button>}</div>);
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px" }}><h3 style={h3}>Print designs</h3><div style={{ display: "flex", gap: 8 }}><button style={ghostBtn}><FileArchive size={15} /> Bulk ZIP</button><button style={ghostBtn}><RefreshCw size={15} /> Reload</button></div></div>
    <label style={{ display: "block", marginBottom: 14 }}><span style={{ display: "block", fontSize: 12.5, color: T.gray, marginBottom: 5 }}>Item</span><select style={{ width: "100%", border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "11px 13px", fontFamily: T.fontBody, fontSize: 14, background: "#fff" }}>{items.map((i) => <option key={i.id}>{title(i)}</option>)}</select></label>
    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>{slot("Template", tpl, setTpl, <Upload size={20} />)}{slot("Preview", prev, setPrev, <ImageIcon size={20} />)}{slot("Instruction", instr, setInstr, <FileText size={20} />)}</div>
    <Field label="Custom print text" value={text} set={setText} ph="Print text front center. Logo upper back." />
    <label style={{ display: "block", marginBottom: 12 }}><span style={{ display: "block", fontSize: 12.5, color: T.gray, marginBottom: 5 }}>Mode</span><div style={{ display: "flex", gap: 8 }}>{["standard", "dynamic"].map((m) => <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 15px", borderRadius: 40, border: `1.5px solid ${m === mode ? T.ink : T.line}`, background: m === mode ? T.ink : "#fff", color: m === mode ? "#fff" : T.ink, fontFamily: T.fontPill, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{m}</button>)}</div></label>
    <Field label="Production notes" value={notes} set={setNotes} ph="Notes for the factory" area />
    <button style={{ ...primaryBtn, width: "100%", justifyContent: "center", padding: 14 }}><Check size={16} /> Save print spec</button>
  </div>);
}

/* -------- Analytics -------- */
export function Analytics({ stats }) {
  const m = [{ k: "Views", v: stats.views, icon: Eye }, { k: "Orders", v: stats.orders, icon: Package }, { k: "Revenue", v: stats.revenue, icon: BarChart3 }, { k: "Conversion", v: stats.conversion, icon: ChevronRight }];
  return (<div><h3 style={{ ...h3, margin: "4px 0 14px" }}>Analytics</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 14 }}>{m.map((x) => { const I = x.icon; return (<div key={x.k} style={card}><div style={{ display: "flex", alignItems: "center", gap: 7, color: T.gray2, marginBottom: 6 }}><I size={15} /><span style={{ fontSize: 12.5 }}>{x.k}</span></div><div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 26 }}>{x.v}</div></div>); })}</div>
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Deep analysis</div><div style={{ fontSize: 13, color: T.gray2 }}>Get a breakdown and recommendations in chat.</div></div><button style={{ ...primaryBtn, background: T.blue }}><MessageCircle size={16} /> Analyze</button></div>
  </div>);
}

/* -------- Team -------- */
export function Team({ members }) {
  const [list, setList] = useState(members); const rc = { Owner: T.gold, Manager: T.blue, Staff: T.gray2 };
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px" }}><h3 style={h3}>Team</h3><button style={primaryBtn}><UserPlus size={16} /> Invite</button></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((m) => (<div key={m.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: T.goldSoft, color: T.goldDeep, display: "grid", placeItems: "center", fontFamily: T.fontDisplay, fontWeight: 700 }}>{m.name[0]}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{m.name}</div></div><span style={{ fontSize: 12, fontWeight: 700, color: rc[m.role], border: `1px solid ${rc[m.role]}44`, borderRadius: 8, padding: "3px 10px" }}>{m.role}</span>{m.role !== "Owner" && <button onClick={() => setList((l) => l.filter((x) => x.id !== m.id))} style={{ border: "none", background: "none", cursor: "pointer", color: T.gray2 }}><Trash2 size={16} /></button>}</div>))}
    </div>
  </div>);
}
