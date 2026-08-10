(function () {
  'use strict';

  /* ── 1. CSS — no layout-shifting hover tricks ──────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    /* collapsible content wrapper */
    '.section-content{overflow:hidden;' +
    '  transition:max-height .3s ease, opacity .18s ease;}' +

    /* section header: give it consistent padding so hover never shifts */
    '.section-block > div:first-child{' +
    '  cursor:pointer;-webkit-user-select:none;user-select:none;' +
    '  border-radius:.6rem;padding:4px 4px;margin:-4px -4px;' +
    '  transition:background .15s ease;}' +

    /* hover — only background changes, zero geometry change */
    '.section-block > div:first-child:hover{background:rgba(0,0,0,0.04);}' +

    /* chevron */
    '.toggle-chevron{margin-left:auto;color:#cbd5e1;flex-shrink:0;' +
    '  display:inline-flex;align-items:center;' +
    '  transition:transform .22s ease, color .15s ease;pointer-events:none;}' +
    '.section-block > div:first-child:hover .toggle-chevron{color:#64748b;}' +

    /* expand / collapse all bar */
    '#layer-ctrl{display:flex;gap:.5rem;margin-bottom:1.25rem;' +
    '  justify-content:flex-end;}' +
    '#layer-ctrl button{font-size:.72rem;font-weight:600;padding:.35rem .85rem;' +
    '  border-radius:.55rem;border:1px solid #e2e8f0;background:#fff;' +
    '  color:#475569;cursor:pointer;transition:background .14s,color .14s;}' +
    '#layer-ctrl button:hover{background:#f1f5f9;color:#1e293b;}';
  document.head.appendChild(style);

  /* ── 2. Collect section blocks and wire collapse ───────────────────── */
  var sections = [];

  document.querySelectorAll('.section-block').forEach(function (section) {
    var header = section.querySelector(':scope > div:first-child');
    if (!header) return;

    var kids = Array.from(section.children).slice(1);
    if (!kids.length) return;

    /* wrap remaining children in collapsible div */
    var wrap = document.createElement('div');
    wrap.className = 'section-content';
    kids.forEach(function (k) { wrap.appendChild(k); });
    section.appendChild(wrap);

    /* start expanded */
    wrap.style.opacity   = '1';
    wrap.style.maxHeight = wrap.scrollHeight + 'px';

    /* chevron */
    var chevron = document.createElement('span');
    chevron.className = 'toggle-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML =
      '<svg width="14" height="14" fill="none" viewBox="0 0 24 24"' +
      ' stroke="currentColor" stroke-width="2.5">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>' +
      '</svg>';
    header.appendChild(chevron);

    /* toggle fn exposed so Expand/Collapse All can call it */
    var entry = { wrap: wrap, chevron: chevron, isOpen: true };

    function setOpen(open) {
      entry.isOpen = open;
      if (open) {
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        wrap.style.opacity   = '1';
        chevron.style.transform = 'rotate(0deg)';
      } else {
        wrap.style.maxHeight = '0px';
        wrap.style.opacity   = '0';
        chevron.style.transform = 'rotate(-90deg)';
      }
    }

    entry.setOpen = setOpen;
    sections.push(entry);

    header.addEventListener('click', function () { setOpen(!entry.isOpen); });
  });

  /* ── 3. Inject Expand All / Collapse All bar above <main> ─────────── */
  var main = document.querySelector('main');
  if (!main || !sections.length) return;

  var bar = document.createElement('div');
  bar.id = 'layer-ctrl';

  var btnExpand = document.createElement('button');
  btnExpand.textContent = 'Expand All';
  btnExpand.addEventListener('click', function () {
    sections.forEach(function (s) { s.setOpen(true); });
  });

  var btnCollapse = document.createElement('button');
  btnCollapse.textContent = 'Collapse All';
  btnCollapse.addEventListener('click', function () {
    sections.forEach(function (s) { s.setOpen(false); });
  });

  bar.appendChild(btnExpand);
  bar.appendChild(btnCollapse);
  main.insertBefore(bar, main.firstChild);

})();
