#!/usr/bin/env python3
"""
Idempotently add optional `opts.prefill` support to w2-checkout.js.
The mini-app does NOT pass prefill, so its behavior is byte-identical.
The site passes the default MyAddress so the delivery form comes pre-filled.

Run on the SERVER:
    cd /var/www/store_react && python3 patch_w2checkout_prefill.py && npm run build
"""
import re, sys, io

PATH = "/var/www/store_react/public/w2-checkout.js"

src = io.open(PATH, encoding="utf-8").read()

if "opts.prefill" in src or "W2_PREFILL_V1" in src:
    print("[skip] w2-checkout.js already has prefill support")
    sys.exit(0)

# anchor: the form-state init line
m = re.search(
    r'(var f = \{ fname: "", lname: "", email: "", phone: "", addr: "", city: "", zip: "", country:[^\n;]*\};)',
    src,
)
if not m:
    print("[ERROR] could not find the `var f = {...}` state line — file shape changed.")
    print("        Send: sed -n '178,186p' " + PATH)
    sys.exit(1)

block = m.group(1) + """
    /* W2_PREFILL_V1 — optional address pre-fill (site uses MyAddress; mini-app omits) */
    if (opts.prefill) {
      var __pf = opts.prefill;
      var __ps = function (v) { return v == null ? "" : String(v); };
      if (__pf.first_name)   f.fname   = __ps(__pf.first_name);
      if (__pf.last_name)    f.lname   = __ps(__pf.last_name);
      if (__pf.email)        f.email   = __ps(__pf.email);
      if (__pf.phone)        f.phone   = __ps(__pf.phone);
      if (__pf.address1)     f.addr    = __ps(__pf.address1);
      if (__pf.city)         f.city    = __ps(__pf.city);
      if (__pf.zip_code)     f.zip     = __ps(__pf.zip_code);
      if (__pf.country_code) f.country = __ps(__pf.country_code);
    }"""

src = src[:m.start(1)] + block + src[m.end(1):]
io.open(PATH, "w", encoding="utf-8").write(src)
print("[ok] w2-checkout.js patched with opts.prefill (W2_PREFILL_V1)")
print("[next] cd /var/www/store_react && npm run build")
