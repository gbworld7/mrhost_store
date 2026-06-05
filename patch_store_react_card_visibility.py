#!/usr/bin/env python3
"""
store_react — CARD visibility toggle (green = published / red = hidden).

- Admin card list: the eye badge becomes a tap toggle. Green eye = visible in
  public, red eye = hidden. Tapping calls /visibility, shows a toast, refreshes.
- Admin now fetches cards with mode=owner (so HIDDEN cards stay visible in the
  admin and can be re-published); the public storefront fetches mode=public.

Apply AFTER patch_store_react_create_ux.py. Idempotent, all-or-nothing per file.
Run from the store_react root, then rebuild:
    python3 patch_store_react_card_visibility.py --check
    python3 patch_store_react_card_visibility.py
    npm run build
"""
import io, os, sys

CLIENT = "src/api/client.js"
APP = "src/App.jsx"
ADMIN = "src/screens/admin.jsx"

EDITS = {
    CLIENT: (
        [
            ('  list: () => get("/list"),',
             '  list: (mode) => get("/list", mode ? { mode } : {}),'),
        ],
        "list: (mode) =>",
    ),
    APP: (
        [
            ('    Promise.allSettled([api.list(), api.categories(owner ? "owner" : "public")]).then(([l, c]) => {',
             '    Promise.allSettled([api.list(owner ? "owner" : "public"), api.categories(owner ? "owner" : "public")]).then(([l, c]) => {'),
            ('{tab === "cards" && !editing && <A.AdminCards items={data.items} onEdit={(it) => setEditing(it)} onNew={() => setEditing({ _new: true })} />}',
             '{tab === "cards" && !editing && <A.AdminCards items={data.items} onEdit={(it) => setEditing(it)} onNew={() => setEditing({ _new: true })} onChange={reload} />}'),
        ],
        "api.list(owner ?",
    ),
    ADMIN: (
        [
            ('export function AdminCards({ items, onEdit, onNew }) {\n  const [descOpen, setDescOpen] = useState(null);',
             'export function AdminCards({ items, onEdit, onNew, onChange }) {\n  const [descOpen, setDescOpen] = useState(null);\n  const toggleVis = async (it) => { try { await api.setVisible(it.id, !it.visible); toast(it.visible ? "Hidden from public" : "Published"); onChange?.(); } catch { toast("Could not change visibility.", "error"); } };'),
            ('              <span style={{ ...badge, left: "auto", right: 8, background: it.visible ? "rgba(31,157,85,.9)" : "rgba(17,17,17,.7)" }}>{it.visible ? <Eye size={12} /> : <EyeOff size={12} />}</span>',
             '              <button onClick={() => toggleVis(it)} title={it.visible ? "Published — tap to hide" : "Hidden — tap to publish"} style={{ ...badge, left: "auto", right: 8, border: "none", cursor: "pointer", background: it.visible ? "rgba(31,157,85,.95)" : "rgba(168,92,92,.95)" }}>{it.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>'),
        ],
        "const toggleVis = async (it)",
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
        if not os.path.exists(path + ".bak_cardvis"):
            io.open(path + ".bak_cardvis", "w", encoding="utf-8").write(s)
        io.open(path, "w", encoding="utf-8").write(out)
        print(f"[ok] {path} patched (backup: {os.path.basename(path)}.bak_cardvis)")
    return ok


def main():
    check = "--check" in sys.argv
    if not process(check):
        sys.exit(2)
    if not check:
        print("\nNext: npm run build   (then hard-refresh the Mini App)")


if __name__ == "__main__":
    main()
