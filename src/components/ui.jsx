import React, { useState, useEffect } from "react";
import { ChevronLeft, Star, Image as ImageIcon, X, Loader2, Check } from "lucide-react";
import { T } from "../theme/tokens.js";

export const STORE_LOGO_DRAGON = "data:image/png;base64,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";

const _AV_PALETTE = ["#C5A059","#7C9A6B","#6B8AAE","#B07A56","#8A6FA8","#A85C5C","#5C8A82","#9A8A4A","#C77D4A"];
function _avColor(s){ let h=0; const t=s||""; for(let i=0;i<t.length;i++) h=(h*31+t.charCodeAt(i))>>>0; return _AV_PALETTE[h % _AV_PALETTE.length]; }
export function Avatar({ name = "", src = "", size = 36, ring = true }) {
  const [err, setErr] = useState(false);
  const wrap = { width: size, height: size, borderRadius: "50%", overflow: "hidden", flex: "0 0 auto", display: "grid", placeItems: "center", background: "#fff", border: ring ? `1px solid ${T.line}` : "none" };
  if (src && !err) return (<div style={wrap}><img src={src} onError={() => setErr(true)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></div>);
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (<div style={{ ...wrap, background: _avColor(name), border: "none" }}><span style={{ fontFamily: T.fontDisplay, fontWeight: 800, color: "#fff", fontSize: Math.round(size * 0.42) }}>{letter}</span></div>);
}


export const card = { background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: 14 };
export const primaryBtn = { display: "inline-flex", gap: 7, alignItems: "center", background: T.ink, color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontFamily: T.fontBody, fontWeight: 700, fontSize: 14, cursor: "pointer" };
export const ghostBtn = { display: "inline-flex", gap: 6, alignItems: "center", background: "#fff", border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "9px 13px", fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, color: T.ink, cursor: "pointer" };
export const cta = { width: "100%", padding: "14px", borderRadius: 13, cursor: "pointer", fontFamily: T.fontBody, fontWeight: 700, fontSize: 15, background: T.ink, color: "#fff", border: "none" };
export const backBtn = { display: "inline-flex", gap: 4, alignItems: "center", background: "none", border: "none", color: T.gray, fontFamily: T.fontBody, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0 };
export const secLbl = { fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, color: T.gray, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 9 };
export const h2 = { fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 22, margin: "2px 0 14px" };

export const Back = ({ onClick }) => <button onClick={onClick} style={backBtn}><ChevronLeft size={18} /> Back</button>;
export function DroneArt() {
  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(120% 120% at 50% 30%, #FFFFFF, #F2EEE3)", display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 200 200" width="74%" height="74%" fill="none">
        {[[58, 58], [142, 58], [58, 142], [142, 142]].map(([x, y], i) => (
          <g key={i}>
            <line x1="100" y1="100" x2={x} y2={y} stroke={T.ink} strokeWidth="6" strokeLinecap="round" />
            <ellipse cx={x} cy={y} rx="34" ry="9" fill={T.gold} opacity="0.25" />
            <ellipse cx={x} cy={y} rx="9" ry="34" fill={T.gold} opacity="0.25" />
            <circle cx={x} cy={y} r="7" fill={T.ink} />
          </g>
        ))}
        <rect x="78" y="78" width="44" height="44" rx="11" fill={T.ink} />
        <circle cx="100" cy="100" r="10" fill={T.gold} />
        <circle cx="100" cy="100" r="4" fill="#fff" />
      </svg>
    </div>
  );
}
export function RobotArt() {
  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(120% 120% at 50% 30%, #FFFFFF, #F2EEE3)", display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 200 200" width="66%" height="66%" fill="none">
        <line x1="100" y1="36" x2="100" y2="58" stroke={T.ink} strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="30" r="8" fill={T.gold} />
        <rect x="52" y="58" width="96" height="74" rx="18" fill={T.ink} />
        <circle cx="80" cy="92" r="11" fill="#fff" /><circle cx="80" cy="92" r="5" fill={T.gold} />
        <circle cx="120" cy="92" r="11" fill="#fff" /><circle cx="120" cy="92" r="5" fill={T.gold} />
        <rect x="80" y="114" width="40" height="7" rx="3.5" fill={T.gold} opacity="0.7" />
        <rect x="70" y="138" width="60" height="30" rx="10" fill={T.ink} opacity="0.85" />
        <rect x="40" y="74" width="12" height="40" rx="6" fill={T.ink} />
        <rect x="148" y="74" width="12" height="40" rx="6" fill={T.ink} />
      </svg>
    </div>
  );
}
export function Pic({ tone = "#EFEDE7" }) {
  const [err, setErr] = useState(false);
  if (typeof tone === "string" && tone.startsWith("http") && !err)
    return <img src={tone} onError={() => setErr(true)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  if (tone === "drone") return <DroneArt />;
  if (tone === "robot") return <RobotArt />;
  const bg = typeof tone === "string" && tone.startsWith("#") ? tone : "#EFEDE7";
  return <div style={{ width: "100%", height: "100%", background: bg, display: "grid", placeItems: "center" }}><ImageIcon size={26} color="#C9C6BD" /></div>;
}
export const Spinner = ({ size = 20 }) => <Loader2 size={size} className="spin" />;
export const Overlay = ({ children }) => <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(255,255,255,.7)", color: T.gold }}>{children}</div>;
export const Empty = ({ text, sub }) => <div style={{ textAlign: "center", padding: "60px 20px", color: T.gray2 }}><div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 18, color: T.ink }}>{text}</div>{sub && <div style={{ marginTop: 6, fontSize: 14 }}>{sub}</div>}</div>;

export function Stars({ value, size = 14 }) {
  return <span style={{ display: "inline-flex", gap: 2 }}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} color={T.star} fill={i <= Math.round(value) ? T.star : "none"} />)}</span>;
}
export function Chip({ children, on, onClick }) {
  return <button onClick={onClick} style={{ padding: "8px 15px", borderRadius: 40, border: `1.5px solid ${on ? T.ink : T.line}`, background: on ? T.ink : "#fff", color: on ? "#fff" : T.ink, fontFamily: T.fontPill, fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" }}>{children}</button>;
}
export function Toggle({ on, set }) {
  return <button onClick={() => set(!on)} style={{ width: 46, height: 26, borderRadius: 40, border: "none", cursor: "pointer", background: on ? T.gold : "#D9D9D9", position: "relative", transition: "background .2s", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} /></button>;
}
export function Field({ label, value, set, ph, area, half, type }) {
  const C = area ? "textarea" : "input";
  return (
    <label style={{ display: "block", flex: half ? 1 : "auto", marginBottom: 12 }}>
      {label && <span style={{ display: "block", fontSize: 12.5, color: T.gray, marginBottom: 5 }}>{label}</span>}
      <C type={type} value={value} placeholder={ph} onChange={(e) => set(e.target.value)} rows={area ? 3 : undefined}
        style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "11px 13px", fontFamily: T.fontBody, fontSize: 14, outline: "none", resize: "vertical", background: "#fff" }} />
    </label>
  );
}
export function Section({ title, right, children }) {
  return <div style={{ marginBottom: 18 }}><div style={{ display: "flex", alignItems: "center", marginBottom: 9 }}><span style={secLbl}>{title}</span>{right}</div>{children}</div>;
}
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 22, borderBottom: `1px solid ${T.line}`, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", padding: "0 2px" }}>
      {tabs.map((tb) => {
        const on = tb.key === active;
        return (
          <button key={tb.key} onClick={() => onChange(tb.key)} style={{ position: "relative", flex: "0 0 auto", background: "none", border: "none", cursor: "pointer", padding: "13px 2px", whiteSpace: "nowrap", fontFamily: T.fontBody, fontSize: 15, color: on ? T.ink : T.gray2, transition: "color .2s" }}>
            <span style={{ display: "grid" }}>
              <span aria-hidden style={{ gridColumn: 1, gridRow: 1, fontWeight: 700, visibility: "hidden", pointerEvents: "none" }}>{tb.label}</span>
              <span style={{ gridColumn: 1, gridRow: 1, fontWeight: on ? 700 : 500 }}>{tb.label}</span>
            </span>
            <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 3, borderRadius: 3, background: T.blue, transform: on ? "scaleX(1)" : "scaleX(0)", transition: "transform .25s ease" }} />
          </button>
        );
      })}
    </div>
  );
}


/* -------- Toast (confirmation / error feedback) -------- */
export function toast(message, type = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("store-toast", { detail: { message, type, id: Date.now() + Math.random() } }));
}
export function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const it = e.detail; if (!it) return;
      setItems((l) => [...l, it]);
      setTimeout(() => setItems((l) => l.filter((x) => x.id !== it.id)), 2600);
    };
    window.addEventListener("store-toast", on);
    return () => window.removeEventListener("store-toast", on);
  }, []);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 9999, pointerEvents: "none" }}>
      {items.map((it) => (
        <div key={it.id} style={{ pointerEvents: "auto", maxWidth: 360, background: it.type === "error" ? "#fff" : T.ink, color: it.type === "error" ? "#A85C5C" : "#fff", border: it.type === "error" ? "1.5px solid #eccfca" : "none", borderRadius: 12, padding: "11px 16px", fontFamily: T.fontBody, fontWeight: 700, fontSize: 13.5, boxShadow: "0 10px 30px rgba(0,0,0,.18)", display: "flex", alignItems: "center", gap: 8 }}>
          {it.type === "error" ? <X size={15} /> : <Check size={15} />}
          <span>{it.message}</span>
        </div>
      ))}
    </div>
  );
}
