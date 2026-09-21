/*
DIRECTION D: "CONSOLE" — direction A's amber restraint, direction A's honesty,
but the sections are no longer a page you scroll. They are SCREENS you move between.

  Palette : amber #ffb000 + neutrals. Nothing else. (Every colour token is at :root.)
  Motion  : maximalist. Navigation is a three-stage state transition, not a scroll.
            [1] UNMOUNT  the live screen leaves, direction-aware, panels peel off
            [2] ROUTE    interstitial: sweep bar crosses the stage, the rail types
                         the route, the frame brackets retract
            [3] ASSEMBLE panels lock in from staggered offsets with a settle,
                         then rows stream in one at a time
            lateral ~760ms · dive (into a project) ~880ms
  Dive    : entering a project dossier is NOT a sideways move. The grid recedes on Z,
            an aperture closes over the stage, and the dossier assembles outward from
            the centre. Returning plays it backwards and re-lands on the source card.
  Keys    : ← → screens · ↑ ↓ targets · Enter open · Esc back · Tab is native.
  Backdrop: a WebGL lattice — the seed graph in 3D. Sparse amber nodes and edges
            receding into black; each screen owns a region of ONE continuous graph, so
            moving between screens is travel through it and a dossier dives inward.
            On a transition the edges release, the camera moves, the nodes flare.
            Dimmed hard under the text-dense screens. three.js r134 UMD from cdnjs;
            if it fails to load the page is unchanged and the backdrop is simply absent.
  A11y    : prefers-reduced-motion collapses every transition to an instant swap and
            stops the WebGL loop entirely (one still frame, no rAF).
  No build, no assets, system monospace only. One external script: three.js on cdnjs.
*/
(function(){
"use strict";
var mq = matchMedia('(prefers-reduced-motion: reduce)');
var reduce = function(){ return mq.matches; };

var ORDER = ['s-identity','s-knowledge','s-projects','s-record'];
var NAME  = {'s-identity':'IDENTITY','s-knowledge':'KNOWLEDGE','s-projects':'PROJECTS','s-record':'RECORD'};
document.querySelectorAll('.screen[data-dossier]').forEach(function(sc){ NAME[sc.id] = sc.dataset.name; });

var stage   = document.getElementById('stage');
var stateEl = document.getElementById('state');
var routeEl = document.getElementById('route');
var scrEl   = document.getElementById('scr');
var readout = document.getElementById('readout');
var dock    = document.getElementById('dock');
var backBtn = document.getElementById('back');
var ret     = document.getElementById('ret');

var current = 's-identity';
var busy    = false;
var pending = null;    /* the last navigation asked for while busy */
var fromCard = null;   /* the card the dossier was entered from */

/* ---- index panels + rows once, so CSS stagger has something to read ---- */
document.querySelectorAll('.screen').forEach(function(sc){
  sc.tabIndex = -1;
  var i = 0;
  sc.querySelectorAll('.pn').forEach(function(p){ p.style.setProperty('--i', i++); });
  sc.querySelectorAll('.stream').forEach(function(s){
    var r = 0;
    Array.prototype.forEach.call(s.children, function(c){ c.style.setProperty('--r', r++); });
  });
});

/* ---- clock ---- */
var clk = document.getElementById('clk');
function tick(){
  var d = new Date();
  clk.textContent = [d.getHours(),d.getMinutes(),d.getSeconds()]
    .map(function(n){ return String(n).padStart(2,'0'); }).join(':');
}
tick(); setInterval(tick, 1000);

/* ---- redaction blocks: generated, never resolve ---- */
var BL = '███▓▒██░█▓█▒██░▓';
document.querySelectorAll('.rd').forEach(function(el){
  var w = +el.dataset.w, out = '';
  for (var i = 0; i < w; i++) out += BL[(Math.random()*BL.length)|0];
  el.textContent = out;
});

/* ---- travelling reticle (pure transform) ---- */
var retOn = false;
function moveRet(el){
  if (reduce() || !el) { ret.classList.remove('on'); retOn = false; return; }
  var r = el.getBoundingClientRect();
  ret.style.setProperty('--w', r.width + 'px');
  ret.style.setProperty('--h', r.height + 'px');
  ret.style.setProperty('--x', r.left + 'px');
  ret.style.setProperty('--y', r.top + 'px');
  if (!retOn) { ret.classList.add('on'); retOn = true; }
}
function hideRet(){ ret.classList.remove('on'); retOn = false; }

document.addEventListener('focusin', function(e){
  if (e.target.classList && e.target.classList.contains('tgt')) moveRet(e.target);
  else hideRet();
});
document.addEventListener('focusout', function(){ setTimeout(function(){
  if (!document.activeElement || !document.activeElement.classList ||
      !document.activeElement.classList.contains('tgt')) hideRet();
}, 0); });
window.addEventListener('resize', function(){
  if (retOn && document.activeElement && document.activeElement.classList.contains('tgt'))
    moveRet(document.activeElement);
});
stage.addEventListener('scroll', function(){
  updateCue();
  if (retOn) moveRet(document.activeElement);
}, true);

/* ---- scroll cue: shown while the live screen has more below the fold ---- */
function updateCue(){
  var sc = document.getElementById(current);
  document.body.classList.toggle('more', sc.scrollHeight - sc.clientHeight - sc.scrollTop > 8);
}
window.addEventListener('resize', updateCue);

/* ---- chrome readouts ---- */
function setRail(st, wait, from, to){
  stateEl.textContent = st;
  stateEl.classList.toggle('wait', !!wait);
  if (from) routeEl.textContent = NAME[from] + ' → ' + NAME[to];
  var n = ORDER.indexOf(current);
  scrEl.textContent = n >= 0 ? ('SCREEN 0' + (n+1) + '/04')
    : 'DOSSIER ' + String(document.getElementById(current).dataset.dossier).padStart(2, '0');
}
function markDock(){
  Array.prototype.forEach.call(dock.querySelectorAll('[data-go]'), function(b){
    b.setAttribute('aria-current', b.dataset.go === current ? 'true' : 'false');
  });
  backBtn.hidden = (ORDER.indexOf(current) >= 0);
  document.body.classList.toggle('in-dossier', !backBtn.hidden);
}

/* ================= THE TRANSITION =================
   Three stages, orchestrated here, animated by CSS:
     1 UNMOUNT   the live screen leaves        (200 / 220ms)
     2 ROUTE     sweep + readout + frame kick  (overlapping)
     3 ASSEMBLE  panels lock, then rows stream (380-420ms + stagger)
   mode: 'lateral' | 'dive' | 'surface'
==================================================== */
var timers = [];
function clearTimers(){ timers.forEach(clearTimeout); timers = []; }

function go(to, mode, dir, focusEl){
  if (to === current) return;
  var from = current, fromEl = document.getElementById(from), toEl = document.getElementById(to);
  if (!toEl) return;

  clearTimers();
  fromEl.className = 'screen';
  toEl.className = 'screen';

  /* ---- reduced motion: instant swap, nothing lost ---- */
  if (reduce()) {
    fromEl.hidden = true; toEl.hidden = false; toEl.scrollTop = 0;
    current = to; document.body.dataset.screen = to;
    setRail('READY', false, from, to); markDock();
    if (window.__lat) window.__lat.snap(to);
    land(toEl, focusEl);
    return;
  }

  busy = true;
  hideRet();
  document.body.classList.add('busy');
  document.body.classList.remove('more');
  if (window.__lat) window.__lat.go(to, mode);
  document.body.classList.toggle('dive', mode !== 'lateral');
  document.body.classList.toggle('rev', dir === 'l' || mode === 'surface');
  readout.firstChild.nodeValue = (mode === 'dive' ? 'MOUNT DOSSIER'
                                : mode === 'surface' ? 'UNMOUNT DOSSIER' : 'ROUTE');
  readout.querySelector('s').textContent = NAME[from] + '  ▸  ' + NAME[to];
  setRail('UNMOUNT', true, from, to);

  /* stage 1 — exit */
  fromEl.classList.add(mode === 'dive' ? 'out-dive'
                     : mode === 'surface' ? 'out-surf'
                     : (dir === 'l' ? 'out-r' : 'out-l'));

  var exitMs = (mode === 'lateral') ? 200 : 220;
  var gapMs  = (mode === 'lateral') ? 90  : 200;   /* the interstitial beat */

  /* stage 2 — interstitial: old screen gone, nothing but machinery on screen */
  timers.push(setTimeout(function(){
    fromEl.hidden = true;
    fromEl.className = 'screen';
    setRail('ROUTE', true, from, to);
  }, exitMs));

  /* stage 3 — assemble */
  timers.push(setTimeout(function(){
    toEl.hidden = false;
    toEl.scrollTop = 0;
    toEl.classList.add(mode === 'dive' ? 'in-dive'
                     : mode === 'surface' ? 'in-surf'
                     : (dir === 'l' ? 'in-l' : 'in-r'));
    /* next frame: let the lock + row stream run */
    requestAnimationFrame(function(){ toEl.classList.add('landed'); });
    current = to;
    document.body.dataset.screen = to;
    setRail('ASSEMBLE', true, from, to);
    markDock();
    document.body.classList.remove('busy');
  }, exitMs + gapMs));

  /* settle */
  var total = exitMs + gapMs + (mode === 'lateral' ? 470 : 460);
  timers.push(setTimeout(function(){
    document.body.classList.remove('dive','rev');
    setRail('READY', false, from, to);
    busy = false;
    if (pending) { var p = pending; pending = null; p(); if (busy) return; }
    land(toEl, focusEl);
  }, total));
}

function scrollBehavior(){ return reduce() ? 'auto' : 'smooth'; }
function focusOn(el){
  try { el.focus({preventScroll:true}); } catch(e){ el.focus(); }
  if (el.classList.contains('tgt')) el.scrollIntoView({block:'nearest', behavior: scrollBehavior()});
}
/* Focus always lands somewhere useful: the given element, the first target, or the screen itself. */
function land(sc, el){
  focusOn(el || sc.querySelector('.tgt') || sc);
  updateCue();
}

/* ---- navigation intents: while a transition plays, the last one asked for is kept ---- */
function intent(fn){ if (busy) pending = fn; else fn(); }
function goto(to){
  intent(function(){
    var a = ORDER.indexOf(current), b = ORDER.indexOf(to);
    if (b < 0) return;
    if (a < 0) { go(to, 'surface'); return; }          /* leaving a dossier sideways */
    go(to, 'lateral', b < a ? 'l' : 'r');
  });
}
function dive(id, card){ intent(function(){ fromCard = card || null; go(id, 'dive'); }); }
function surface(){
  intent(function(){
    if (ORDER.indexOf(current) >= 0) return;
    go('s-projects', 'surface', null, fromCard);
  });
}
/* A target beside the highlighted one on the same row (multi-column layouts), or null. */
function beside(sc, ae, d){
  var r = ae.getBoundingClientRect(), best = null, gap = Infinity;
  sc.querySelectorAll('.tgt').forEach(function(t){
    if (t === ae) return;
    var b = t.getBoundingClientRect(), cy = (b.top + b.bottom) / 2;
    if (cy < r.top || cy > r.bottom) return;
    var dx = d > 0 ? b.left - r.right : r.left - b.right;
    if (dx >= 0 && dx < gap) { gap = dx; best = t; }
  });
  return best;
}
/* The nearest target below/above the highlighted one, preferring its own column, or null. */
function under(sc, ae, d){
  var r = ae.getBoundingClientRect(), best = null, bestLap = -Infinity, gap = Infinity;
  sc.querySelectorAll('.tgt').forEach(function(t){
    if (t === ae) return;
    var b = t.getBoundingClientRect();
    var dy = d > 0 ? b.top - r.bottom : r.top - b.bottom;
    if (dy < -1) return;
    var lap = Math.min(r.right, b.right) - Math.max(r.left, b.left);
    if (lap <= 0) lap = -Infinity;
    /* overlaps within 2px count as the same column */
    if (lap > bestLap + 2 || (lap > bestLap - 2 && dy < gap)) { bestLap = lap; gap = dy; best = t; }
  });
  return best;
}
function step(d){
  if (ORDER.indexOf(current) < 0) { if (d < 0) surface(); return; }
  var i = ORDER.indexOf(current) + d;
  if (i >= 0 && i < ORDER.length) goto(ORDER[i]);
}

/* ---- pointer ---- */
dock.addEventListener('click', function(e){
  var b = e.target.closest('button'); if (!b) return;
  if (b === backBtn) surface(); else goto(b.dataset.go);
});
stage.addEventListener('click', function(e){
  var c = e.target.closest('[data-open]');
  if (c) dive(c.dataset.open, c);
});

/* ---- touch: a horizontal swipe on the stage is ← / → ---- */
var tx = null, ty = 0;
stage.addEventListener('touchstart', function(e){
  var t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY;
}, {passive:true});
stage.addEventListener('touchend', function(e){
  if (tx === null) return;
  var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  tx = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
  step(dx < 0 ? 1 : -1);
}, {passive:true});

/* ---- keyboard ---- */
function pageStep(){ return stage.clientHeight * 0.6; }
function scrollScreen(sc, dy){ sc.scrollBy({top: dy, behavior: scrollBehavior()}); }
function scrollTop(sc, y){ sc.scrollTo({top: y, behavior: scrollBehavior()}); }

document.addEventListener('keydown', function(e){
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  var k = e.key, sc = document.getElementById(current), ae = document.activeElement;
  var onTgt = !!(ae && ae.classList && ae.classList.contains('tgt') && sc.contains(ae));

  if (k === 'Escape' || k === 'Backspace') {
    e.preventDefault();
    if (ORDER.indexOf(current) < 0) surface();
    else if (onTgt) { focusOn(sc); scrollTop(sc, 0); }
    else if (current !== 's-identity') goto('s-identity');
    else scrollTop(sc, 0);
    return;
  }
  if (k === 'ArrowLeft' || k === 'ArrowRight') {
    e.preventDefault();
    var d = k === 'ArrowRight' ? 1 : -1, side = onTgt && beside(sc, ae, d);
    if (side) focusOn(side); else step(d);
    return;
  }
  if (k === 'ArrowUp' || k === 'ArrowDown') {
    e.preventDefault();
    var down = k === 'ArrowDown';
    var list = Array.prototype.slice.call(sc.querySelectorAll('.tgt'));
    var n = -1;
    if (onTgt) n = list.indexOf(under(sc, ae, down ? 1 : -1));
    else if (down) {   /* first target not already scrolled past */
      var top = stage.getBoundingClientRect().top;
      n = 0;
      while (n < list.length && list[n].getBoundingClientRect().bottom < top) n++;
    }
    if (n >= 0 && n < list.length) focusOn(list[n]);
    else scrollScreen(sc, down ? pageStep() : -pageStep());
    return;
  }
  if (k === 'Home' || k === 'End') {
    e.preventDefault();
    scrollTop(sc, k === 'Home' ? 0 : sc.scrollHeight);
    return;
  }
  if (k === 'PageDown' || k === 'PageUp' || (k === ' ' && !(ae && ae.tagName === 'BUTTON'))) {
    e.preventDefault();
    var up = k === 'PageUp' || (k === ' ' && e.shiftKey);
    scrollScreen(sc, up ? -pageStep() : pageStep());
  }
});

/* ---- signal path: one hop lit at a time, only while its dossier is the live screen ---- */
(function(){
  var hops = [], at = 0, id = null, live = null;
  function step(){
    hops.forEach(function(h,i){ h.classList.toggle('on', i === at); });
    at = (at + 1) % hops.length;
  }
  function sync(){
    var sc = document.getElementById(current);
    var want = (sc.dataset.dossier && !reduce()) ? sc : null;
    if (want === live) return;
    if (id) { clearInterval(id); id = null; hops.forEach(function(h){ h.classList.add('on'); }); }
    live = want;
    hops = want ? Array.prototype.slice.call(want.querySelectorAll('.path s')) : [];
    if (hops.length) { at = 0; step(); id = setInterval(step, 620); }
  }
  setInterval(sync, 300);   /* cheap state poll, not per-frame work */
  document.querySelectorAll('.path s').forEach(function(h){ h.classList.add('on'); });
  sync();
})();

/* ---- boot ---- */
var boot = document.getElementById('s-identity');
document.body.dataset.screen = current;
markDock();
setRail('READY', false);
if (!reduce()) {
  boot.classList.add('in-r');
  requestAnimationFrame(function(){ boot.classList.add('landed'); });
}
updateCue(); setTimeout(updateCue, 900);
mq.addEventListener && mq.addEventListener('change', function(){
  clearTimers(); busy = false; pending = null;
  document.body.classList.remove('busy','dive','rev');
});
})();
