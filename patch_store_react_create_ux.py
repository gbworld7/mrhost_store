#!/usr/bin/env python3
"""
store_react UX: confirmation toast + auto-refresh + owner/public mode split.

Fixes the reported issues:
  - creating a category/card now shows a confirmation toast (and surfaces
    errors instead of failing silently),
  - the list refreshes after create (onChange/onSaved -> reload already wired),
  - admin fetches categories with mode=owner (sees empty categories), while
    the public storefront fetches mode=public (customers don't see empty ones).

Edits (idempotent, all-or-nothing per file):
  src/components/ui.jsx   - add toast() + <Toaster/> (imports useEffect, Check)
  src/api/client.js       - categories(mode)
  src/App.jsx             - reload passes owner/public mode; mount <Toaster/>
  src/screens/admin.jsx   - import toast; category + card create/delete feedback

Run from the store_react root (e.g. /var/www/store_react), then rebuild:
    python3 patch_store_react_create_ux.py --check
    python3 patch_store_react_create_ux.py
    npm run build
"""
import io, os, sys

UI = "src/components/ui.jsx"
CLIENT = "src/api/client.js"
APP = "src/App.jsx"
ADMIN = "src/screens/admin.jsx"

TOASTER_BLOCK = '''

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
'''

# (file, list of (old, new), marker_already_applied)
EDITS = {
    UI: (
        [
            ('import React, { useState } from "react";',
             'import React, { useState, useEffect } from "react";'),
            ('import { ChevronLeft, Star, Image as ImageIcon, X, Loader2 } from "lucide-react";',
             'import { ChevronLeft, Star, Image as ImageIcon, X, Loader2, Check } from "lucide-react";'),
        ],
        "export function Toaster()",   # marker
        TOASTER_BLOCK,                 # append at EOF if marker missing
    ),
    CLIENT: (
        [
            ('  categories: () => get("/categories"),',
             '  categories: (mode) => get("/categories", mode ? { mode } : {}),'),
        ],
        'categories: (mode) =>',
        None,
    ),
    APP: (
        [
            ('import { Tabs, Avatar, STORE_LOGO_DRAGON } from "./components/ui.jsx";',
             'import { Tabs, Avatar, STORE_LOGO_DRAGON, Toaster } from "./components/ui.jsx";'),
            ('    Promise.allSettled([api.list(), api.categories()]).then(([l, c]) => {',
             '    Promise.allSettled([api.list(), api.categories(owner ? "owner" : "public")]).then(([l, c]) => {'),
            ('        {pay && <P.PaySheet cart={cart} onClose={() => setPay(false)} agentId={q.agent_id} storeName={q.store} />}\n      </div>\n    </div>\n  );',
             '        {pay && <P.PaySheet cart={cart} onClose={() => setPay(false)} agentId={q.agent_id} storeName={q.store} />}\n      </div>\n      <Toaster />\n    </div>\n  );'),
        ],
        "<Toaster />",
        None,
    ),
    ADMIN: (
        [
            ('import { card, primaryBtn, ghostBtn, Back, Pic, Stars, Field, Toggle, Section, Spinner, Overlay, Empty, Avatar } from "../components/ui.jsx";',
             'import { card, primaryBtn, ghostBtn, Back, Pic, Stars, Field, Toggle, Section, Spinner, Overlay, Empty, Avatar, toast } from "../components/ui.jsx";'),
            ('    try { await api.saveCard(payload); } catch {} finally { setBusy(false); onSaved?.(); }',
             '    try { await api.saveCard(payload); toast(init.id ? "Card saved" : "Card created"); setBusy(false); onSaved?.(); }\n    catch { setBusy(false); toast("Could not save card. Try again.", "error"); }'),
            ('  const del = async () => { if (!init.id) { onBack(); return; } try { await api.deleteCard(init.id); } catch {} onSaved?.(); };',
             '  const del = async () => { if (!init.id) { onBack(); return; } try { await api.deleteCard(init.id); toast("Card deleted"); } catch { toast("Could not delete card.", "error"); } onSaved?.(); };'),
            ('  const add = async () => { if (!name.trim()) return; try { await api.saveCategory({ title: name.trim() }); } catch {} setName(""); setAdding(false); onChange?.(); };',
             '  const add = async () => { const t = name.trim(); if (!t) return; try { await api.saveCategory({ title: t }); toast(`Category "${t}" created`); setName(""); setAdding(false); onChange?.(); } catch { toast("Could not create category. Try again.", "error"); } };'),
            ('  const del = async (id) => { try { await api.deleteCategory(id); } catch {} onChange?.(); };',
             '  const del = async (id) => { try { await api.deleteCategory(id); toast("Category deleted"); } catch { toast("Could not delete category.", "error"); } onChange?.(); };'),
        ],
        "import { card, primaryBtn, ghostBtn, Back, Pic, Stars, Field, Toggle, Section, Spinner, Overlay, Empty, Avatar, toast }",
        None,
    ),
}


def process(check: bool):
    ok = True
    for path, (pairs, marker, append_block) in EDITS.items():
        if not os.path.exists(path):
            print(f"[ABORT] {path}: not found (run from store_react root)")
            return False
        s = io.open(path, encoding="utf-8").read()
        if marker in s:
            print(f"[skip] {path}: already patched")
            continue
        missing = [old for old, _ in pairs if old not in s]
        if missing:
            print(f"[ABORT] {path}: {len(missing)} anchor(s) not found")
            for m in missing:
                print("        - " + (m[:80] + ("..." if len(m) > 80 else "")))
            ok = False
            continue
        if check:
            print(f"[check] {path}: {len(pairs)} anchor(s) present" + (" (+append Toaster)" if append_block else ""))
            continue
        out = s
        for old, new in pairs:
            out = out.replace(old, new, 1)
        if append_block:
            out = out.rstrip("\n") + "\n" + append_block
        if not os.path.exists(path + ".bak_createux"):
            io.open(path + ".bak_createux", "w", encoding="utf-8").write(s)
        io.open(path, "w", encoding="utf-8").write(out)
        print(f"[ok] {path} patched (backup: {os.path.basename(path)}.bak_createux)")
    return ok


def main():
    check = "--check" in sys.argv
    if not process(check):
        sys.exit(2)
    if not check:
        print("\nNext: npm run build   (then hard-refresh the Mini App)")


if __name__ == "__main__":
    main()
