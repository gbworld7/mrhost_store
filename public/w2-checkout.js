/* ============================================================================
   w2-checkout.js — THE single W❤️² checkout. One file, one truth.
   Used identically by: agent store (React calls window.W2Checkout.open),
   landing, site, gamelanding. Vanilla JS, no deps except optional QRCode lib.

   Depends on: window.W2_COUNTRIES (w2-countries.js).  Optional: window.QRCode
   (davidshimjs qrcode.min.js) for local QR; falls back to image service.

   API:
     window.W2Checkout.open({
       mode:        "goods" | "subscription",     // goods = address->confirm->pay; subscription = pay only
       items:       [{ id, title, qty, price }],   // goods
       total:       Number,                        // goods (optional; else summed from items)
       plan:        { title, meta, priceUsd },      // subscription
       storeName:   "Dronovod",
       agentId:     "dronovodbot",
       source:      "agent_store",                  // metadata.source
       apiBase:     "https://api.mrhost.asia",
       iconBase:    "/pay/iconspay",
       activeMethods: ["gpay","usdt"],              // colored; only USDT creates an invoice for now
       mock:        false,                          // demo: fake the invoice, no network
       onClose:     fn,
       onPaid:      fn(invoice)
     });
   ========================================================================== */
(function () {
  if (window.W2Checkout) return; // single instance

  /* ----------------------------- design tokens ---------------------------- */
  var CSS = "" +
  ".w2co-ov{position:fixed;inset:0;z-index:99999;background:rgba(12,12,14,.5);" +
  "display:flex;align-items:center;justify-content:center;padding:16px;" +
  "font-family:'DM Sans','Montserrat',system-ui,-apple-system,sans-serif;" +
  "-webkit-font-smoothing:antialiased;animation:w2coFade .18s ease}" +
  "@keyframes w2coFade{from{opacity:0}to{opacity:1}}" +
  "@keyframes w2coRise{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}" +
  ".w2co-sheet{position:relative;width:min(100%,520px);max-height:92vh;overflow-y:auto;" +
  "background:#fff;border-radius:24px;padding:28px 24px 24px;color:#111;" +
  "box-shadow:0 30px 90px rgba(0,0,0,.28);animation:w2coRise .22s cubic-bezier(.2,.8,.2,1)}" +
  ".w2co-sheet::-webkit-scrollbar{width:8px}.w2co-sheet::-webkit-scrollbar-thumb{background:#e3e3e3;border-radius:8px}" +
  ".w2co-x{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;" +
  "border:1px solid #E0E0E0;background:#fff;cursor:pointer;display:grid;place-items:center;color:#666;transition:.15s}" +
  ".w2co-x:hover{background:#f6f6f6;color:#111}" +
  ".w2co-h{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:28px;letter-spacing:-.02em;margin:0 0 4px}" +
  ".w2co-sub{color:#666;font-size:14px;margin-bottom:18px}" +
  ".w2co-card{background:#F8F8F8;border:1px solid #ECECEC;border-radius:16px;padding:16px;margin-bottom:18px}" +
  ".w2co-line{display:flex;justify-content:space-between;align-items:center;font-size:14px;padding:3px 0}" +
  ".w2co-line b{font-weight:700}" +
  ".w2co-amt{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:18px;color:#c5a059}" +
  ".w2co-sec{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:18px;margin:2px 0 12px}" +
  ".w2co-row{display:flex;justify-content:space-between;flex-wrap:wrap;gap:0}" +
  ".w2co-fld{margin-bottom:12px;width:100%}.w2co-fld.half{width:calc(50% - 5px)}" +
  ".w2co-lbl{font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;display:flex;align-items:center;gap:4px}" +
  ".w2co-lbl .req{color:#CDC9BE;font-size:13px}.w2co-fld.err .w2co-lbl{color:#E52D2D}.w2co-fld.err .w2co-lbl .req{color:#E52D2D}" +
  ".w2co-inwrap{display:flex;align-items:center;box-sizing:border-box;height:47px;border:1.5px solid #E0E0E0;border-radius:13px;background:#fff;transition:border-color .15s,box-shadow .15s}" +
  ".w2co-inwrap.f{border-color:#c5a059;box-shadow:0 0 0 3px rgba(197,160,89,.16)}" +
  ".w2co-fld.err .w2co-inwrap{border-color:#E52D2D;box-shadow:0 0 0 3px rgba(229,45,45,.10)}" +
  ".w2co-inwrap input{flex:1;min-width:0;border:none;outline:none;background:transparent;padding:12px 14px;font:inherit;font-size:15px;color:#111;caret-color:#111;-webkit-text-fill-color:#111;color-scheme:light}" +
  ".w2co-adorn{padding:0 8px 0 12px;color:#555;font-size:14px;white-space:nowrap;display:flex;align-items:center;gap:5px;border-right:1px solid #eee}" +
  ".w2co-tick{margin-right:12px;flex-shrink:0;color:#2e9e5b;font-weight:800}" +
  ".w2co-bang{margin-right:12px;flex-shrink:0;color:#E52D2D;font-weight:800;font-size:16px;line-height:1}" +
  ".w2co-ferr{color:#E52D2D;font-size:12px;margin-top:4px;font-weight:600}" +
  ".w2co-sel{width:100%;box-sizing:border-box;height:47px;line-height:44px;border:1.5px solid #E0E0E0;border-radius:13px;padding:0 14px;font:inherit;font-size:15px;outline:none;background:#fff;cursor:pointer;color:#111}" +
  ".w2co-sel:focus{border-color:#c5a059;box-shadow:0 0 0 3px rgba(197,160,89,.16)}" +
  ".w2co-inwrap > select{flex:1;min-width:0;width:100%;height:100%;border:none;outline:none;background:transparent;padding:0 14px;font:inherit;font-size:15px;color:#111;cursor:pointer}" +
  ".w2co-cta{width:100%;border:none;border-radius:14px;background:#111;color:#fff;padding:15px;font:inherit;font-weight:800;font-size:15px;cursor:pointer;margin-top:6px;transition:.15s;letter-spacing:.01em}" +
  ".w2co-cta:hover{background:#000}.w2co-cta:disabled{opacity:.4;cursor:not-allowed}" +
  ".w2co-back{display:inline-flex;gap:4px;align-items:center;background:none;border:none;color:#666;font:inherit;font-weight:600;font-size:14px;cursor:pointer;padding:0;width:100%;justify-content:center;text-align:center;margin-top:14px}" +
  ".w2co-back:hover{color:#111}" +
  ".w2co-formwarn{color:#E52D2D;font-size:12.5px;font-weight:600;margin:2px 0 8px}" +
  ".w2co-ship{background:#F8F8F8;border:1px solid #ECECEC;border-radius:16px;padding:14px 16px;margin:6px 0 18px;font-size:14px;line-height:1.5;color:#333}" +
  ".w2co-ship .t{font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}" +
  /* payment grid */
  ".w2co-pg{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
  ".w2co-pm{min-height:84px;border-radius:16px;border:2px solid #E0E0E0;background:#fff;color:#111;display:flex;" +
  "flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-weight:800;font-size:12px;text-transform:uppercase;transition:.15s}" +
  ".w2co-pm:hover{border-color:#c9c9c9}" +
  ".w2co-pm.wide{grid-column:1 / -1}.w2co-pm.half{grid-column:auto}" +
  ".w2co-pm.sel{border-color:#111;background:#111;color:#fff}" +
  ".w2co-pm.dim{color:#9a9a9a}.w2co-pm.dim img{filter:grayscale(1);opacity:.45}" +
  ".w2co-pm img{height:26px;width:auto;object-fit:contain;pointer-events:none}" +
  ".w2co-pm .lbl{font-size:11px}" +
  ".w2co-gpay{font-family:'Syne',system-ui,sans-serif;font-weight:900;font-size:21px;letter-spacing:-.05em;line-height:1}" +
  ".w2co-gpay .g{color:#c5a059}.w2co-pm.sel .w2co-gpay .g{color:#e9c987}" +
  ".w2co-mir{font-family:'Syne',system-ui,sans-serif;font-weight:900;font-size:18px;letter-spacing:-.02em}" +
  ".w2co-panel{margin-top:16px;border:1px solid #E0E0E0;border-radius:16px;padding:16px;text-align:center}" +
  ".w2co-ptitle{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:17px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:7px}" +
  ".w2co-ptitle .g{color:#c5a059;font-weight:900}" +
  ".w2co-net{display:inline-flex;gap:8px;justify-content:center;margin-bottom:10px}" +
  ".w2co-pill{height:34px;padding:0 16px;border-radius:999px;background:#111;color:#fff;display:inline-flex;align-items:center;font-weight:800;font-size:12px;letter-spacing:.02em}" +
  ".w2co-muted{color:#666;font-size:13px;line-height:1.45}" +
  /* invoice */
  ".w2co-qr{display:grid;place-items:center;margin-bottom:12px}.w2co-qr img,.w2co-qr canvas{width:190px;height:190px;border-radius:8px}" +
  ".w2co-bigamt{text-align:center;font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:36px;letter-spacing:-.03em;color:#ff8a00}" +
  ".w2co-bigamt span{font-size:20px;color:#666}" +
  ".w2co-irow{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid #eee}" +
  ".w2co-irow .k{font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.03em;flex-shrink:0}" +
  ".w2co-irow .v{font-weight:700;font-size:13.5px;text-align:right;word-break:break-all}" +
  ".w2co-copy{width:100%;display:inline-flex;gap:8px;align-items:center;justify-content:center;border:1px solid #CDD1DA;" +
  "background:linear-gradient(135deg,#ECEEF1 0%,#FBFBFD 45%,#D9DCE3 100%);border-radius:13px;padding:14px;font:inherit;font-weight:800;font-size:14.5px;" +
  "cursor:pointer;color:#111;margin-top:12px;box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 3px 9px rgba(20,22,30,.12);transition:.15s}" +
  ".w2co-copy.ok{background:linear-gradient(135deg,#E7F6EC,#F6FBF7,#DDEFE2);color:#2e9e5b}" +
  ".w2co-note{margin-top:12px;background:#111;color:#fff;border-radius:14px;padding:14px 16px;font-size:13px;line-height:1.5;text-align:center}" +
  ".w2co-paid{text-align:center;padding:26px 18px}" +
  ".w2co-paid .ic{width:46px;height:46px;border-radius:50%;background:#2e9e5b;color:#fff;display:grid;place-items:center;margin:0 auto 12px;font-size:22px}" +
  ".w2co-paid .tt{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:20px;margin-bottom:6px}" +
  "@media(max-width:520px){.w2co-sheet{padding:22px 16px 18px;border-radius:20px}.w2co-h{font-size:24px}.w2co-bigamt{font-size:30px}}";

  function injectCSS() {
    if (document.getElementById("w2co-css")) return;
    var s = document.createElement("style");
    s.id = "w2co-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    // best-effort font load (no-op if offline / CSP-blocked)
    if (!document.getElementById("w2co-fonts")) {
      var l = document.createElement("link");
      l.id = "w2co-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap";
      document.head.appendChild(l);
    }
  }

  /* ------------------------------- helpers -------------------------------- */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  function countries() { return window.W2_COUNTRIES || [{ code: "VN", name: "Vietnam", flag: "🇻🇳", dial: "+84" }]; }
  function countryOf(code) { return (window.W2_COUNTRY ? window.W2_COUNTRY(code) : countries()[0]); }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PAID = ["paid", "confirmed", "completed", "settled", "success"];
  var DEAD = ["expired", "cancelled", "canceled", "rejected", "failed"];
  function isPaid(s) { return PAID.indexOf(String(s || "").toLowerCase()) >= 0; }
  function isDead(s) { return DEAD.indexOf(String(s || "").toLowerCase()) >= 0; }
  function fmtAmt(v) { var n = Number(v); return Number.isFinite(n) ? String(n) : String(v == null ? "" : v); }
  function fmtVnd(v) { var n = Number(String(v == null ? "" : v).replace(/[^0-9.-]/g, "")); return isFinite(n) ? new Intl.NumberFormat("vi-VN").format(Math.round(n)) : String(v == null ? "" : v); }

  /* SVG-with-text-fallback payment logo */
  function payLogo(id, iconBase, on) {
    if (id === "gpay") { var g = h("span", { class: "w2co-gpay" }); g.innerHTML = '<span class="g">G</span>Pay'; return g; }
    if (id === "mir")  { return h("span", { class: "w2co-mir" }, "Мир"); }
    var map = { usdt: "usdt.svg", card: "visa.svg", vietqr: "VietQR_Logo.svg", paypal: "paypal.svg" };
    var img = h("img", { src: iconBase + "/" + (map[id] || (id + ".svg")), alt: id });
    img.addEventListener("error", function () {
      var t = { usdt: "USDT", card: "CARD", vietqr: "VietQR", paypal: "PayPal" }[id] || id.toUpperCase();
      var span = h("span", { class: "w2co-mir" }, t);
      if (img.parentNode) img.parentNode.replaceChild(span, img);
    });
    return img;
  }

  /* ------------------------------- main open ------------------------------ */
  /* W2_CHECKOUT_PREFILL_VND_V1 */
  var _W2_VND_RATE = null;
  function ensureVndRate(cb) {
    if (_W2_VND_RATE != null) { cb(_W2_VND_RATE); return; }
    try {
      fetch("https://open.er-api.com/v6/latest/USD")
        .then(function (r) { return r.json(); })
        .then(function (d) { var rt = d && d.rates && d.rates.VND; if (rt && rt > 0) _W2_VND_RATE = rt; cb(_W2_VND_RATE); })
        .catch(function () { cb(null); });
    } catch (e) { cb(null); }
  }
  function open(opts) {
    opts = opts || {};
    injectCSS();

    var API = opts.apiBase || window.W2_API_BASE || "https://api.mrhost.asia";
    var ICON = opts.iconBase || "/pay/iconspay";
    var MODE = opts.mode === "subscription" ? "subscription" : "goods";
    var ACTIVE = opts.activeMethods || ["gpay", "usdt"];
    var STORE = opts.storeName || "Store";

    var items = (opts.items || []).map(function (x) {
      return { id: String(x.id != null ? x.id : ""), title: x.title || "Item", qty: Number(x.qty || 1), price: Number(x.price || 0) };
    });
    var total = (opts.total != null)
      ? Number(opts.total)
      : (MODE === "subscription"
          ? Number((opts.plan && opts.plan.priceUsd) || 0)
          : items.reduce(function (s, x) { return s + x.price * x.qty; }, 0));
    var amountVnd = opts.amountVnd != null ? Number(opts.amountVnd) : null;

    // state
    var f = { fname: "", lname: "", email: "", phone: "", addr: "", city: "", zip: "", state: "", country: (countries()[0] || {}).code || "VN", promo: "" }; /* W2_CHECKOUT_STATE_FULLNAME_V1 */
    if (opts.prefill) {
      var _pf = opts.prefill;
      if (_pf.first_name) f.fname = String(_pf.first_name);
      if (_pf.last_name) f.lname = String(_pf.last_name);
      if (_pf.email) f.email = String(_pf.email);
      if (_pf.phone) f.phone = String(_pf.phone).replace(/^\+\d{1,4}\s*/, "");
      if (_pf.address1) f.addr = String(_pf.address1);
      if (_pf.city) f.city = String(_pf.city);
      if (_pf.zip_code) f.zip = String(_pf.zip_code);
      if (_pf.country_code) f.country = String(_pf.country_code);
      if (_pf.state_code) f.state = String(_pf.state_code);
    }
    var touched = {}, submitted = false;
    var method = ACTIVE.indexOf("usdt") >= 0 ? "usdt" : ACTIVE[0] || "usdt";
    var inv = null, invErr = "", invLoading = false, payStatus = "", copied = false;
    var pollTimer = null, destroyed = false;

    var ov = h("div", { class: "w2co-ov", onclick: function (e) { if (e.target === ov) close(); } });
    var sheet = h("div", { class: "w2co-sheet" });
    ov.appendChild(sheet);
    document.body.appendChild(ov);
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function close() {
      if (destroyed) return; destroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      document.body.style.overflow = prevOverflow;
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      if (typeof opts.onClose === "function") opts.onClose();
    }
    function esc(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); } }
    document.addEventListener("keydown", esc);

    var stage = MODE === "subscription" ? "payment" : "delivery";

    function render() {
      sheet.innerHTML = "";
      var x = h("button", { class: "w2co-x", onclick: close, "aria-label": "Close", html: "&times;" });
      sheet.appendChild(x);
      if (stage === "delivery") renderDelivery();
      else if (stage === "confirm") renderConfirm();
      else if (stage === "payment") renderPayment();
      else if (stage === "invoice") renderInvoice();
    }

    /* ----- order summary card (shared) ----- */
    function summaryCard() {
      var c = h("div", { class: "w2co-card" });
      if (MODE === "subscription") {
        var p = opts.plan || {};
        c.appendChild(h("div", { class: "w2co-line" }, [
          h("span", { html: "<b>" + (p.title || "Subscription") + "</b>" + (p.meta ? " <span style='color:#888'>· " + p.meta + "</span>" : "") }),
          h("span", { class: "w2co-amt" }, "$" + total + (p.per ? "/" + p.per : ""))
        ]));
      } else {
        items.forEach(function (it) {
          c.appendChild(h("div", { class: "w2co-line" }, [
            h("span", { html: "<b>" + it.title + "</b> <span style='color:#888;font-weight:500'>· QTY " + it.qty + "</span>" }),
            h("span", { class: "w2co-amt" }, "$" + (it.price * it.qty))
          ]));
        });
      }
      return c;
    }

    /* ----- field builders ----- */
    function field(key, label, ph, required, opt) {
      /* W2CO_FAST_INPUT_V1 — build once, NO full-form re-render on blur (that was the
         Telegram flicker + focus loss between fields). Value commits to f[key] on input;
         validation is painted in place, per field. */
      opt = opt || {};
      var AC = { fname:"given-name", lname:"family-name", email:"email", phone:"tel", addr:"address-line1", city:"address-level2", zip:"postal-code", state:"address-level1" };
      var IM = { email:"email", phone:"tel", zip:"numeric" };
      var wrap = h("div", { class: "w2co-fld" + (opt.half ? " half" : "") });
      var lbl = h("div", { class: "w2co-lbl" }, [label, required ? h("span", { class: "req" }, "*") : null]);
      var inwrap = h("div", { class: "w2co-inwrap" });
      if (opt.adorn) inwrap.appendChild(h("div", { class: "w2co-adorn", html: opt.adorn }));
      var input = h("input", { type: opt.type || "text", value: f[key], placeholder: ph || "" });
      input.__w2key = key;
      if (AC[key]) input.setAttribute("autocomplete", AC[key]);
      if (IM[key]) input.setAttribute("inputmode", IM[key]);
      inwrap.appendChild(input);
      wrap.appendChild(lbl); wrap.appendChild(inwrap);
      var statusNode = null, ferrNode = null;
      function computeErr() {
        if (!required) return "";
        if (key === "email") return !f.email.trim() ? "Required" : (!EMAIL_RE.test(f.email) ? "Enter a valid email" : "");
        return !String(f[key]).trim() ? "Required" : "";
      }
      function paint(showErr) {
        var err = showErr ? computeErr() : "";
        if (err) wrap.classList.add("err"); else wrap.classList.remove("err");
        if (statusNode && statusNode.parentNode) statusNode.parentNode.removeChild(statusNode);
        if (ferrNode && ferrNode.parentNode) ferrNode.parentNode.removeChild(ferrNode);
        statusNode = null; ferrNode = null;
        var ok = required && f[key] && String(f[key]).trim() && !err && (key !== "email" || EMAIL_RE.test(f.email));
        if (ok) { statusNode = h("span", { class: "w2co-tick" }, "✓"); inwrap.appendChild(statusNode); }
        else if (err) { statusNode = h("span", { class: "w2co-bang" }, "!"); inwrap.appendChild(statusNode); }
        if (err) { ferrNode = h("div", { class: "w2co-ferr" }, err); wrap.appendChild(ferrNode); }
      }
      input.addEventListener("input", function () { f[key] = input.value; if (wrap.classList.contains("err")) paint(true); });
      input.addEventListener("focus", function () { inwrap.classList.add("f"); });
      input.addEventListener("blur", function () { inwrap.classList.remove("f"); touched[key] = true; paint(true); });
      paint(required && (touched[key] || submitted));
      return wrap;
    }
    function selCountry(opt) {
      opt = opt || {};
      var wrap = h("div", { class: "w2co-fld" + (opt.half ? " half" : "") });
      wrap.appendChild(h("div", { class: "w2co-lbl" }, ["Country", h("span", { class: "req" }, "*")]));
      var inwrap = h("div", { class: "w2co-inwrap" });
      var sel = h("select", {});
      countries().forEach(function (c) {
        var o = h("option", { value: c.code }, (c.flag ? c.flag + "  " : "") + c.name);
        if (c.code === f.country) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { f.country = sel.value; if (opt.onChange) opt.onChange(); });
      sel.addEventListener("focus", function () { inwrap.classList.add("f"); });
      sel.addEventListener("blur", function () { inwrap.classList.remove("f"); });
      inwrap.appendChild(sel);
      wrap.appendChild(inwrap);
      return wrap;
    }

    function deliveryValid() {
      return f.fname.trim() && f.lname.trim() && f.email.trim() && EMAIL_RE.test(f.email) &&
             f.addr.trim() && f.city.trim() && f.zip.trim() && f.state.trim();
    }

    /* ----- STAGE: delivery ----- */
    function renderDelivery() {
      sheet.appendChild(h("h3", { class: "w2co-h" }, "Checkout"));
      sheet.appendChild(h("div", { class: "w2co-sub" }, "Enter your details — we'll handle the rest."));
      sheet.appendChild(summaryCard());
      sheet.appendChild(h("div", { class: "w2co-sec" }, "Delivery details"));
      var ctry = countryOf(f.country);
      sheet.appendChild(h("div", { class: "w2co-row" }, [
        field("fname", "First name", "Ruslan", true, { half: true }),
        field("lname", "Last name", "Volkov", true, { half: true })
      ]));
      sheet.appendChild(field("email", "Email", "you@email.com", true, { type: "email" }));
      var phoneFld = field("phone", "Phone", "000 000 000", false, { type: "tel", adorn: "<span style='font-size:16px'>" + ctry.flag + "</span> " + ctry.dial });
      sheet.appendChild(phoneFld);
      sheet.appendChild(field("addr", "Street address", "Street, building", true));
      sheet.appendChild(h("div", { class: "w2co-row" }, [
        field("city", "City", "Nha Trang", true, { half: true }),
        field("zip", "ZIP / Postal", "000000", true, { half: true })
      ]));
      sheet.appendChild(field("state", "State / Region", "Khanh Hoa", true));
      sheet.appendChild(h("div", { class: "w2co-row" }, [
        selCountry({ half: true, onChange: function () { var cc = countryOf(f.country); var ad = phoneFld.querySelector(".w2co-adorn"); if (ad) ad.innerHTML = "<span style='font-size:16px'>" + cc.flag + "</span> " + cc.dial; } }),
        field("promo", "Code", "Promo / code", false, { half: true })
      ]));
      (function () { /* W2CO_FAST_INPUT_V1 enter-nav: Enter -> next field, no re-render */
        var fl = sheet.querySelectorAll(".w2co-fld input, .w2co-fld select");
        for (var i = 0; i < fl.length; i++) { (function (el, i) {
          el.setAttribute("enterkeyhint", i < fl.length - 1 ? "next" : "go");
          if (el.tagName === "SELECT") return;
          el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); var nx = fl[i + 1]; if (nx) { nx.focus(); } else { el.blur(); } } });
        })(fl[i], i); }
      })();
      if (submitted && !deliveryValid()) sheet.appendChild(h("div", { class: "w2co-formwarn" }, "Please fill the highlighted fields."));
      sheet.appendChild(h("button", { class: "w2co-cta", onclick: function () {
        if (deliveryValid()) { stage = "confirm"; render(); } else { submitted = true; render(); }
      } }, "Continue"));
    }

    /* ----- STAGE: confirm ----- */
    function renderConfirm() {
      sheet.appendChild(h("h3", { class: "w2co-h" }, "Confirm order"));
      sheet.appendChild(h("div", { class: "w2co-sub" }, "Review your order before payment."));
      sheet.appendChild(summaryCard());
      sheet.appendChild(h("div", { class: "w2co-card", html:
        "<div class='w2co-line' style='padding:2px 0'><span class='w2co-lbl' style='margin:0'>Total</span>" +
        "<span class='w2co-amt' style='font-size:22px'>$" + total + "</span></div>" }));
      var c = countryOf(f.country);
      sheet.appendChild(h("div", { class: "w2co-ship", html:
        "<div class='t'>Shipping to</div>" +
        "<div><b>" + f.fname + " " + f.lname + "</b></div>" +
        "<div>" + f.addr + ", " + f.city + " " + f.zip + "</div>" +
        "<div>" + c.flag + " " + c.name + "</div>" +
        "<div style='color:#666'>" + f.email + (f.phone ? " · " + c.dial + " " + f.phone : "") + "</div>" }));
      sheet.appendChild(h("button", { class: "w2co-cta", onclick: function () { stage = "payment"; render(); } }, "Confirm & pay"));
      sheet.appendChild(h("button", { class: "w2co-back", onclick: function () { stage = "delivery"; render(); }, html: "&#8249; Back to details" }));
    }

    /* ----- STAGE: payment ----- */
    function renderPayment() {
      sheet.appendChild(h("h3", { class: "w2co-h" }, "Payment"));
      sheet.appendChild(h("div", { class: "w2co-sub" }, "Choose payment method for this order."));

      var methods = [
        { id: "gpay", label: "GPay" },
        { id: "usdt", label: "USDT" },
        { id: "card", label: "Card" },
        { id: "vietqr", label: "VietQR" },
        { id: "paypal", label: "PayPal", half: true },
        { id: "mir", label: "Mir", half: true }
      ];
      var grid = h("div", { class: "w2co-pg" });
      methods.forEach(function (m) {
        var on = ACTIVE.indexOf(m.id) >= 0;
        var sel = method === m.id;
        var btn = h("button", { class: "w2co-pm" + (m.half ? " half" : "") + (sel ? " sel" : "") + (on ? "" : " dim") });
        btn.appendChild(payLogo(m.id, ICON, on));
        btn.appendChild(h("span", { class: "lbl" }, m.label));
        btn.addEventListener("click", function () { method = m.id; render(); });
        grid.appendChild(btn);
      });
      sheet.appendChild(grid);

      var panel = h("div", { class: "w2co-panel" });
      if (method === "usdt") {
        panel.appendChild(h("div", { class: "w2co-net" }, h("span", { class: "w2co-pill" }, "POLYGON")));
        panel.appendChild(h("div", { class: "w2co-muted" }, "Polygon selected. Pay in USDT — the invoice opens on the next step."));
      } else if (method === "vietqr") {
        panel.appendChild(h("div", { class: "w2co-net" }, h("span", { class: "w2co-pill" }, "VietQR")));
        panel.appendChild(h("div", { class: "w2co-muted" }, "Bank transfer via VietQR — the invoice with QR opens on the next step."));
      } else if (method === "gpay") {
        var t = h("div", { class: "w2co-ptitle" }); t.innerHTML = "<span class='g'>G</span>Pay balance";
        panel.appendChild(t);
        panel.appendChild(h("div", { class: "w2co-muted" }, "Pay from your GPay balance. Coming online soon — use USDT for now."));
      } else {
        panel.appendChild(h("div", { class: "w2co-muted", html: "<b style='color:#111'>" + (methods.filter(function(x){return x.id===method;})[0]||{}).label + "</b> will be enabled soon. Use <b style='color:#111'>USDT</b> for now." }));
      }
      sheet.appendChild(panel);

      var canPay = method === "usdt" || method === "vietqr";
      sheet.appendChild(h("button", {
        class: "w2co-cta", disabled: canPay ? null : "disabled",
        onclick: function () {
          if (!canPay) return;
          if (method === "vietqr" && amountVnd == null) {
            ensureVndRate(function (rt) { if (rt) amountVnd = Math.round(total * rt); createInvoice(); });
          } else { createInvoice(); }
        }
      }, !canPay ? "Select a payment method" : (method === "vietqr" ? "Pay with VietQR" : "Pay with USDT POLYGON")));

      if (MODE === "goods") sheet.appendChild(h("button", { class: "w2co-back", onclick: function () { stage = "confirm"; render(); }, html: "&#8249; Back to order preview" }));
    }

    /* ----- order body (matches the proven backend contract) ----- */
    function buildBody() {
      var c = countryOf(f.country);
      if (MODE === "subscription") {
        var p = opts.plan || {};
        return {
          order: {
            product_id: p.id ? String(p.id) : ("sub_" + (p.title || "plan")).toLowerCase().replace(/\s+/g, "_"),
            product_title: (p.title || "Subscription") + (p.meta ? " · " + p.meta : ""),
            product_kind: "subscription",
            qty: 1,
            amount_usd: String(total),
            currency: "USD",
            metadata: Object.assign({ agent_id: opts.agentId || "", source: opts.source || "subscription", store: STORE, plan: p.title || "", email: f.email }, opts.extra || {})
          },
          payment: { method: "USDT", network: "POLYGON" }
        };
      }
      var single = items.length === 1 ? items[0] : null;
      var ord = {
        product_id: single ? single.id : "cart",
        product_title: single ? single.title : (items.length + " items · " + STORE),
        product_kind: opts.productKind || "agent_store_item",
        qty: items.reduce(function (s, x) { return s + x.qty; }, 0),
        amount_usd: String(total),
        currency: "USD",
        metadata: Object.assign({ agent_id: opts.agentId || "", source: opts.source || "agent_store", store: STORE, items: items, email: f.email, promo_code: f.promo }, opts.extra || {})
      };
      if (method === "vietqr" && amountVnd != null) ord.amount_vnd = String(amountVnd);
      return {
        order: ord,
        shipping: {
          full_name: (f.fname + " " + f.lname).trim(), name: (f.fname + " " + f.lname).trim(),
          first_name: f.fname, last_name: f.lname, email: f.email,
          phone: f.phone ? (c.dial + " " + f.phone).trim() : "",
          address1: f.addr, city: f.city, state_code: f.state, state: f.state,
          zip_code: f.zip, country_code: f.country, country: f.country
        },
        payment: method === "vietqr" ? { method: "VIETQR" } : { method: "USDT", network: "POLYGON" }
      };
    }

    function createInvoice() {
      stage = "invoice"; inv = null; invErr = ""; invLoading = true; payStatus = ""; render();

      if (opts.mock) {
        setTimeout(function () {
          inv = { order_id: "W2-DEMO01", status: "waiting_tx", exact_amount: total, network: "POLYGON",
                  deposit_address: "0x9aF3...DEMO...address...b21c", qr_payload: "0x9aF3DEMOaddressb21c" };
          payStatus = "waiting_tx"; invLoading = false; render();
        }, 700);
        return;
      }

      fetch(API + "/api/v1/gpay/order-payment-requests", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildBody())
      }).then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (!res.ok) {
            var d = data && data.detail;
            invErr = (d && (d.message || (typeof d === "string" ? d : ""))) || (data && data.message) || ("Server error " + res.status);
            invLoading = false; render(); return;
          }
          inv = data; payStatus = (data && data.status) || ""; invLoading = false; render(); startPoll();
        });
      }).catch(function () {
        invErr = "Could not reach the payment server. Please try again.";
        invLoading = false; render();
      });
    }

    function startPoll() {
      if (!inv) return;
      var pid = inv.order_id || (inv.order && inv.order.public_id);
      if (!pid) return;
      if (isPaid(inv.status) || isDead(inv.status)) return;
      if (pollTimer) clearInterval(pollTimer);
      var tick = function () {
        fetch(API + "/api/v1/gpay/order-payment-requests/" + encodeURIComponent(pid) + "/status", { headers: { Accept: "application/json" } })
          .then(function (r) { return r.json().catch(function () { return null; }); })
          .then(function (d) {
            if (destroyed) return;
            var st = (d && (d.status || (d.order && (d.order.status || d.order.lifecycle_status)) || (d.intent && d.intent.status))) || "";
            if (st) { payStatus = st; if (stage === "invoice") render(); }
            if (isPaid(st) || isDead(st)) { clearInterval(pollTimer); if (isPaid(st) && typeof opts.onPaid === "function") opts.onPaid(inv); }
          }).catch(function () {});
      };
      pollTimer = setInterval(tick, 5000); tick();
    }

    /* ----- STAGE: invoice ----- */
    function renderInvoice() {
      var isVqr = (inv && inv.provider === "vietqr") || (!inv && method === "vietqr");
      sheet.appendChild(h("h3", { class: "w2co-h" }, isVqr ? "Pay with VietQR" : "Pay with USDT POLYGON"));
      sheet.appendChild(h("div", { class: "w2co-sub" }, isVqr ? "Scan in your banking app or transfer manually." : "Scan QR or copy the wallet address."));

      if (invLoading) { sheet.appendChild(h("div", { class: "w2co-card", html: "<div style='text-align:center;padding:24px;color:#666'>Creating invoice…</div>" })); appendBack(); return; }
      if (invErr) {
        var ec = h("div", { class: "w2co-card" });
        ec.appendChild(h("div", { html: "<div style='color:#E52D2D;font-weight:700;margin-bottom:6px'>Couldn't create invoice</div><div class='w2co-muted'>" + invErr + "</div>" }));
        ec.appendChild(h("button", { class: "w2co-cta", onclick: createInvoice }, "Try again"));
        sheet.appendChild(ec); appendBack(); return;
      }
      if (!inv) { appendBack(); return; }

      if (isPaid(payStatus)) {
        var pc = h("div", { class: "w2co-card w2co-paid" });
        pc.innerHTML = "<div class='ic'>✓</div><div class='tt'>Payment received</div>" +
          "<div class='w2co-muted'>Your order is created and your payment is confirmed. Check <b style='color:#111'>" + (f.email || "your email") + "</b> to verify and open your cabinet.</div>";
        sheet.appendChild(pc); return;
      }

      if (inv.provider === "vietqr") {
        var bank = inv.bank || {};
        var vnd = fmtVnd(inv.amount_vnd || inv.amount || inv.exact_amount);
        var ref = inv.transfer_content || inv.reference || "";
        var prodV = MODE === "subscription" ? ((opts.plan && opts.plan.title) || "Subscription") : (items.length === 1 ? items[0].title : items.length + " items");
        var stV = payStatus || inv.status || "waiting_payment";
        var cardV = h("div", { class: "w2co-card" });
        if (inv.qr_data_url) { var qbV = h("div", { class: "w2co-qr" }); qbV.appendChild(h("img", { alt: "VietQR", src: inv.qr_data_url })); cardV.appendChild(qbV); }
        cardV.appendChild(h("div", { class: "w2co-bigamt", html: vnd + " <span>₫</span>" }));
        cardV.appendChild(h("div", { class: "w2co-muted", style: "text-align:center;margin:4px 0 8px", html: "Transfer the exact amount with the exact content below." }));
        [["Order", inv.order_id], ["Product", prodV], ["Bank", bank.bank_name], ["Account holder", bank.account_holder], ["Account number", bank.account_number], ["Amount (VND)", vnd], ["Transfer content", ref], ["Status", stV]].forEach(function (r) {
          cardV.appendChild(h("div", { class: "w2co-irow" }, [h("span", { class: "k" }, r[0]), h("span", { class: "v" }, r[1] || "—")]));
        });
        sheet.appendChild(cardV);
        var cpV = h("button", { class: "w2co-copy" + (copied ? " ok" : "") }, copied ? "✓ Copied" : "Copy transfer content");
        cpV.addEventListener("click", function () { try { navigator.clipboard.writeText(ref); } catch (e) {} copied = true; render(); setTimeout(function () { copied = false; if (!destroyed && stage === "invoice") render(); }, 1300); });
        sheet.appendChild(cpV);
        sheet.appendChild(h("div", { class: "w2co-note", html: "Transfer <b>" + vnd + " ₫</b> with content <b>" + ref + "</b>. Payment is detected automatically." }));
        appendBack();
        return;
      }

      var amt = fmtAmt(inv.exact_amount || inv.amount_requested);
      var addr = inv.deposit_address || inv.wallet_address || "";
      var net = (inv.network || "POLYGON").toUpperCase();
      var prod = MODE === "subscription" ? ((opts.plan && opts.plan.title) || "Subscription") : (items.length === 1 ? items[0].title : items.length + " items");
      var st = payStatus || inv.status || "waiting_tx";

      var card = h("div", { class: "w2co-card" });
      var qrBox = h("div", { class: "w2co-qr" });
      card.appendChild(qrBox);
      renderQR(qrBox, inv.qr_payload || addr);
      card.appendChild(h("div", { class: "w2co-bigamt", html: amt + " <span>USDT</span>" }));
      card.appendChild(h("div", { class: "w2co-muted", style: "text-align:center;margin:4px 0 8px", html: "Send exactly this amount via <b style='color:#111'>" + net + "</b>." }));
      [["Order", inv.order_id], ["Product", prod], ["Network", net], ["Deposit address", addr], ["Amount (USDT)", amt], ["Status", st]].forEach(function (r) {
        card.appendChild(h("div", { class: "w2co-irow" }, [h("span", { class: "k" }, r[0]), h("span", { class: "v" }, r[1] || "—")]));
      });
      sheet.appendChild(card);

      var copyBtn = h("button", { class: "w2co-copy" + (copied ? " ok" : "") }, copied ? "✓ Copied" : "Copy Polygon address");
      copyBtn.addEventListener("click", function () {
        try { navigator.clipboard.writeText(addr); } catch (e) {}
        copied = true; render(); setTimeout(function () { copied = false; if (!destroyed && stage === "invoice") render(); }, 1300);
      });
      sheet.appendChild(copyBtn);
      sheet.appendChild(h("div", { class: "w2co-note", html: "Send <b>" + amt + " USDT</b> on " + net + " to the address above. Payment is detected automatically — no transaction hash needed." }));
      appendBack();
    }
    function appendBack() {
      sheet.appendChild(h("button", { class: "w2co-back", onclick: function () { stage = "payment"; render(); }, html: "&#8249; Back to payment methods" }));
    }

    function renderQR(box, data) {
      box.innerHTML = "";
      if (!data) return;
      try {
        if (window.QRCode && typeof window.QRCode === "function") { new window.QRCode(box, { text: data, width: 190, height: 190, correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.M : undefined }); return; }
      } catch (e) {}
      var img = h("img", { alt: "QR", src: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(data) });
      box.appendChild(img);
    }

    render();
    return { close: close };
  }

  window.W2Checkout = { open: open, version: "1.0" };
})();
