#!/usr/bin/env python3
"""
store_react — CATEGORY visibility toggle (green = published / red = hidden).

Pairs with the backend patch (category `visible` column + endpoint). Adds a
tap eye toggle on each category row in the admin: green = visible in public,
red = hidden (the whole category and its cards disappear from the public
storefront). Hidden categories are dimmed.

Apply AFTER the earlier store_react patches. Idempotent, all-or-nothing.
Run from the store_react root, then rebuild:
    python3 patch_store_react_category_visibility.py --check
    python3 patch_store_react_category_visibility.py
    npm run build
"""
import io, os, sys

CLIENT = "src/api/client.js"
ADMIN = "src/screens/admin.jsx"

ROW_OLD = '    {cats.map((c) => (<div key={c.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><Avatar name={c.title} src={c.logo || ""} size={40} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{c.title}</div><div style={{ fontSize: 12.5, color: T.gray2 }}>{counts[c.id] || 0} cards</div></div><button onClick={() => del(c.id)} style={{ ...ghostBtn, padding: "8px 11px", color: T.red, borderColor: "#eccfca" }}><Trash2 size={15} /></button></div>))}'
ROW_NEW = '    {cats.map((c) => (<div key={c.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 10, opacity: c.visible === false ? 0.55 : 1 }}><Avatar name={c.title} src={c.logo || ""} size={40} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{c.title}</div><div style={{ fontSize: 12.5, color: T.gray2 }}>{counts[c.id] || 0} cards</div></div><button onClick={() => vis(c)} title={c.visible === false ? "Hidden — tap to publish" : "Published — tap to hide"} style={{ ...ghostBtn, padding: "8px 11px", border: "none", color: "#fff", background: c.visible === false ? "rgba(168,92,92,.95)" : "rgba(31,157,85,.95)" }}>{c.visible === false ? <EyeOff size={15} /> : <Eye size={15} />}</button><button onClick={() => del(c.id)} style={{ ...ghostBtn, padding: "8px 11px", color: T.red, borderColor: "#eccfca" }}><Trash2 size={15} /></button></div>))}'

EDITS = {
    CLIENT: (
        [
            ('  saveCategory: (cat) => post("/categories", cat),',
             '  saveCategory: (cat) => post("/categories", cat),\n  setCategoryVisible: (id, visible) => post("/categories/visibility", { id, visible }),'),
        ],
        "setCategoryVisible:",
    ),
    ADMIN: (
        [
            ('  const del = async (id) => { try { await api.deleteCategory(id); toast("Category deleted"); } catch { toast("Could not delete category.", "error"); } onChange?.(); };',
             '  const del = async (id) => { try { await api.deleteCategory(id); toast("Category deleted"); } catch { toast("Could not delete category.", "error"); } onChange?.(); };\n  const vis = async (c) => { const next = c.visible === false; try { await api.setCategoryVisible(c.id, next); toast(next ? "Category published" : "Category hidden from public"); onChange?.(); } catch { toast("Could not change visibility.", "error"); } };'),
            (ROW_OLD, ROW_NEW),
        ],
        "const vis = async (c) =>",
    ),
}


def process(check: bool):
    ok = True
    for path, (pairs, marker) in EDITS.items():
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
            ok = False
            continue
        if check:
            print(f"[check] {path}: {len(pairs)} anchor(s) present")
            continue
        out = s
        for old, new in pairs:
            out = out.replace(old, new, 1)
        if not os.path.exists(path + ".bak_catvis"):
            io.open(path + ".bak_catvis", "w", encoding="utf-8").write(s)
        io.open(path, "w", encoding="utf-8").write(out)
        print(f"[ok] {path} patched (backup: {os.path.basename(path)}.bak_catvis)")
    return ok


def main():
    check = "--check" in sys.argv
    if not process(check):
        sys.exit(2)
    if not check:
        print("\nNext: npm run build   (then hard-refresh the Mini App)")


if __name__ == "__main__":
    main()
