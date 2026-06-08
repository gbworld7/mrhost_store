(function () {
  var TITLE = 'MrHost';
  var VERSION = 'mrhost-1';

  function upsertLink(rel, href, attrs) {
    var selector = 'link[rel="' + rel + '"]';
    var el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href + '?v=' + VERSION);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    }
  }

  function applyBrand() {
    if (document.title !== TITLE) document.title = TITLE;
    if (document.head) {
      upsertLink('icon', '/favicon.ico', { sizes: 'any' });
      upsertLink('apple-touch-icon', '/apple-touch-icon.png', {});
      var svg = document.querySelector('link[data-mrhost-svg-icon="1"]');
      if (!svg) {
        svg = document.createElement('link');
        svg.setAttribute('rel', 'icon');
        svg.setAttribute('type', 'image/svg+xml');
        svg.setAttribute('data-mrhost-svg-icon', '1');
        document.head.appendChild(svg);
      }
      svg.setAttribute('href', '/favicon.svg?v=' + VERSION);
    }
  }

  applyBrand();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrand);
  }
  window.addEventListener('load', applyBrand);

  var titleEl = document.querySelector('title');
  if (window.MutationObserver && titleEl) {
    new MutationObserver(applyBrand).observe(titleEl, { childList: true, subtree: true, characterData: true });
  }

  var left = 20;
  var timer = setInterval(function () {
    applyBrand();
    left -= 1;
    if (left <= 0) clearInterval(timer);
  }, 500);
})();
