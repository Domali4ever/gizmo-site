(function () {
  'use strict';

  var EASE = 'cubic-bezier(.2,.9,.25,1)';

  function hexRgb(hex) {
    return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }).join(',');
  }

  // ---- flip cards (Make / Play / Adapt / diverge) ----------------------------------
  var LENSES = ['make', 'play', 'adapt', 'diverge'];
  var flipped = {};

  LENSES.forEach(function (key) {
    flipped[key] = false;
    var inner = document.getElementById(key + '-flip');
    if (!inner) return;
    var front = inner.querySelector('.gz-flip-front');
    var back = inner.querySelector('.gz-flip-back');
    var frontBtn = front.querySelector('[data-flip-toggle]');
    var backBtn = back.querySelector('[data-flip-toggle]');

    function apply() {
      var f = flipped[key];
      inner.style.transform = f ? 'rotateY(180deg)' : 'rotateY(0deg)';
      front.setAttribute('aria-hidden', String(f));
      back.setAttribute('aria-hidden', String(!f));
      front.style.pointerEvents = f ? 'none' : 'auto';
      back.style.pointerEvents = f ? 'auto' : 'none';
      frontBtn.tabIndex = f ? -1 : 0;
      backBtn.tabIndex = f ? 0 : -1;
    }

    function toggle() {
      flipped[key] = !flipped[key];
      apply();
    }

    front.addEventListener('click', toggle);
    frontBtn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    backBtn.addEventListener('click', toggle);
  });

  function unflip(key) {
    if (flipped[key]) {
      flipped[key] = false;
      var inner = document.getElementById(key + '-flip');
      if (!inner) return;
      var front = inner.querySelector('.gz-flip-front');
      var back = inner.querySelector('.gz-flip-back');
      inner.style.transform = 'rotateY(0deg)';
      front.setAttribute('aria-hidden', 'false');
      back.setAttribute('aria-hidden', 'true');
      front.style.pointerEvents = 'auto';
      back.style.pointerEvents = 'none';
      front.querySelector('[data-flip-toggle]').tabIndex = 0;
      back.querySelector('[data-flip-toggle]').tabIndex = -1;
    }
  }

  // ---- magnet-tile hover backgrounds -----------------------------------------------------
  var ICON_SRC = {
    Make: 'lens-icons/make-icon.svg',
    Play: 'lens-icons/play-icon.svg',
    Adapt: 'lens-icons/adapt-icon.svg',
    diverge: 'lens-icons/diverge-icon.svg'
  };
  // one theme per lens: the tile fill, its hard drop-shadow accent, and how the icon is tinted.
  var TILE_THEMES = {
    Make: { fill: '#084a8c', shadow: '#f9b233', tint: 'brightness(0) invert(1)' },
    Play: { fill: '#e8323a', shadow: '#084a8c', tint: 'brightness(0) invert(1)' },
    Adapt: { fill: '#1fb755', shadow: '#e8323a', tint: 'brightness(0) invert(1)' },
    diverge: { fill: '#f9b233', shadow: '#1fb755', tint: 'brightness(0)' }
  };
  var ALL_LENSES = ['Make', 'Play', 'Adapt', 'diverge'];
  var COLS = 20, ROWS = 10, RADIUS = 170;

  var TILE_CONFIGS = [
    { sectionId: 'g-hero', tilesId: 'tiles-hero', lenses: ALL_LENSES, dark: false },
    { sectionId: 'make', tilesId: 'tiles-make', lenses: ['Make'], dark: false },
    { sectionId: 'play', tilesId: 'tiles-play', lenses: ['Play'], dark: false },
    { sectionId: 'adapt', tilesId: 'tiles-adapt', lenses: ['Adapt'], dark: true },
    { sectionId: 'diverge', tilesId: 'tiles-diverge', lenses: ['diverge'], dark: true },
    { sectionId: 'make-it-matter', tilesId: 'tiles-mim', lenses: ALL_LENSES, dark: false }
  ];

  TILE_CONFIGS.forEach(function (cfg) {
    var section = document.getElementById(cfg.sectionId);
    var container = document.getElementById(cfg.tilesId);
    if (!section || !container) return;

    var lineRgb = cfg.dark ? '0,0,0' : '255,255,255';
    var themePrep = cfg.lenses.map(function (name) {
      var th = TILE_THEMES[name];
      return {
        fillRgb: hexRgb(th.fill),
        shadowRgb: hexRgb(th.shadow),
        iconUrl: ICON_SRC[name],
        tint: th.tint
      };
    });

    var tiles = [];
    for (var r = 0; r < ROWS; r++) {
      var rowShiftCss = (r % 2 === 0) ? '0' : '50%';
      for (var c = 0; c < COLS; c++) {
        var idx = r * COLS + c;
        var theme = themePrep[idx % themePrep.length];

        var el = document.createElement('div');
        el.className = 'gz-tile';

        var icon = document.createElement('div');
        icon.className = 'gz-tile-icon';
        icon.style.backgroundImage = 'url(' + theme.iconUrl + ')';
        icon.style.filter = theme.tint;
        el.appendChild(icon);
        container.appendChild(el);

        tiles.push({
          el: el, icon: icon, row: r, col: c,
          rowShiftCss: rowShiftCss,
          fillRgb: theme.fillRgb, shadowRgb: theme.shadowRgb
        });
      }
    }

    var mag = { x: -9999, y: -9999, w: 1, h: 1 };
    var pending = false;

    function update() {
      pending = false;
      var cw = mag.w / COLS, ch = mag.h / ROWS;
      for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i];
        var rowShift = (t.row % 2 === 0) ? 0 : cw / 2;
        var dx = mag.x - ((t.col + 0.5) * cw + rowShift);
        var dy = mag.y - (t.row + 0.5) * ch;
        var dist = Math.hypot(dx, dy);
        var v = dist >= RADIUS ? 0 : 1 - dist / RADIUS;
        var e = v * v;
        var lift = (4.5 * v).toFixed(1);
        var eStr = e.toFixed(3);

        t.el.style.zIndex = v > 0 ? Math.round(v * 100) : 0;
        t.el.style.backgroundColor = 'rgba(' + t.fillRgb + ',' + eStr + ')';
        t.el.style.borderColor = 'rgba(' + lineRgb + ',' + (0.3 * e).toFixed(3) + ')';
        t.el.style.transform = 'translateX(' + t.rowShiftCss + ') translateY(-' + lift + 'px)';
        t.el.style.boxShadow = e > 0.01 ? '9px 9px 0 rgba(' + t.shadowRgb + ',' + eStr + ')' : 'none';
        t.icon.style.opacity = eStr;
      }
    }

    section.addEventListener('mousemove', function (e) {
      if (pending) return;
      pending = true;
      var r = section.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top, w = r.width, h = r.height;
      requestAnimationFrame(function () {
        mag = { x: x, y: y, w: w, h: h };
        update();
      });
    });

    section.addEventListener('mouseleave', function () {
      mag = { x: -9999, y: -9999, w: mag.w, h: mag.h };
      update();
    });
  });

  // ---- rail progress, scroll-triggered reveals, section tracking ------------------------
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));
  var current = 0;

  function updateRail() {
    railLinks.forEach(function (a) {
      var sectionIdx = Number(a.dataset.rail);
      var collected = current >= sectionIdx;
      var active = current === sectionIdx;
      a.style.background = collected ? a.dataset.color : 'transparent';
      a.style.color = collected ? a.dataset.fg : '#8c8c94';
      a.style.borderColor = collected ? a.dataset.color : '#3f3f46';
      a.style.boxShadow = active ? '4px 4px 0 #f7f7f7' : 'none';
    });
  }

  var scrollRoot = document.getElementById('gz-scroll');
  var sections = Array.prototype.slice.call(scrollRoot.querySelectorAll('section[data-gz-section]'));

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) {
        var key = en.target.id === 'make-it-matter' ? null : en.target.id;
        if (key && flipped[key]) unflip(key);
        return;
      }
      var idx = sections.indexOf(en.target);
      if (idx !== current) {
        current = idx;
        updateRail();
      }
      en.target.querySelectorAll('[data-reveal]').forEach(function (el, i) {
        el.animate(
          [{ opacity: 0, transform: 'translateY(44px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 620, delay: 90 * i, easing: EASE, fill: 'backwards' }
        );
      });
      var letter = en.target.querySelector('[data-letter]');
      if (letter) {
        var t = getComputedStyle(letter).transform;
        var base = (t && t !== 'none') ? t + ' ' : '';
        letter.animate(
          [{ opacity: 0, transform: base + 'translateX(80px)' }, { opacity: 1, transform: base + 'translateX(0px)' }],
          { duration: 800, easing: EASE, fill: 'backwards' }
        );
      }
    });
  }, { root: scrollRoot, threshold: 0.4 });

  sections.forEach(function (s) { io.observe(s); });
})();
