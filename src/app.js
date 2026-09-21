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
var NAME  = {'s-identity':'IDENTITY','s-knowledge':'KNOWLEDGE','s-projects':'PROJECTS','s-record':'RECORD','s-dark-eye':'DARK EYE'};

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
var fromCard = null;   /* the card the dossier was entered from */

/* ---- index panels + rows once, so CSS stagger has something to read ---- */
document.querySelectorAll('.screen').forEach(function(sc){
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
stage.addEventListener('scroll', hideRet, true);

/* ---- chrome readouts ---- */
function setRail(st, wait, from, to){
  stateEl.textContent = st;
  stateEl.classList.toggle('wait', !!wait);
  if (from) routeEl.textContent = NAME[from] + ' → ' + NAME[to];
  var n = ORDER.indexOf(current);
  scrEl.textContent = n >= 0 ? ('SCREEN 0' + (n+1) + '/04') : 'DOSSIER 01';
}
function markDock(){
  Array.prototype.forEach.call(dock.querySelectorAll('[data-go]'), function(b){
    b.setAttribute('aria-current', b.dataset.go === current ? 'true' : 'false');
  });
  backBtn.hidden = (ORDER.indexOf(current) >= 0);
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

function go(to, mode, dir){
  if (busy || to === current) return;
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
    focusFirst(toEl);
    return;
  }

  busy = true;
  hideRet();
  document.body.classList.add('busy');
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
    focusFirst(toEl);
  }, total));
}

function focusFirst(sc){
  var t = sc.querySelector('.tgt');
  if (t && document.activeElement !== document.body) { try { t.focus({preventScroll:true}); } catch(e){ t.focus(); } }
}

/* ---- navigation intents ---- */
function goto(to){
  var a = ORDER.indexOf(current), b = ORDER.indexOf(to);
  if (b < 0) return;
  if (a < 0) { go(to, 'surface'); return; }          /* leaving a dossier sideways */
  go(to, 'lateral', b < a ? 'l' : 'r');
}
function dive(id, card){ fromCard = card || null; go(id, 'dive'); }
function surface(){
  if (ORDER.indexOf(current) >= 0) return;
  go('s-projects', 'surface');
  if (fromCard) {
    var c = fromCard;
    setTimeout(function(){ try { c.focus({preventScroll:true}); } catch(e){ c.focus(); } },
               reduce() ? 0 : 760);
  }
}

/* ---- pointer ---- */
dock.addEventListener('click', function(e){
  var b = e.target.closest('button'); if (!b) return;
  if (b === backBtn) surface(); else goto(b.dataset.go);
});
stage.addEventListener('click', function(e){
  var c = e.target.closest('[data-open]'); if (!c) return;
  dive(c.dataset.open, c);
});

/* ---- keyboard ---- */
document.addEventListener('keydown', function(e){
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  var k = e.key;

  if (k === 'Escape' || k === 'Backspace') {
    if (ORDER.indexOf(current) < 0) { e.preventDefault(); surface(); }
    return;
  }
  if (k === 'ArrowLeft' || k === 'ArrowRight') {
    e.preventDefault();
    if (ORDER.indexOf(current) < 0) { if (k === 'ArrowLeft') surface(); return; }
    var i = ORDER.indexOf(current) + (k === 'ArrowRight' ? 1 : -1);
    if (i >= 0 && i < ORDER.length) goto(ORDER[i]);
    return;
  }
  if (k === 'ArrowUp' || k === 'ArrowDown') {
    var sc = document.getElementById(current);
    var list = Array.prototype.slice.call(sc.querySelectorAll('.tgt'));
    if (!list.length) return;
    e.preventDefault();
    var at = list.indexOf(document.activeElement);
    var n  = (k === 'ArrowDown') ? (at + 1) : (at - 1 + list.length);
    if (at < 0) n = 0;
    var el = list[n % list.length];
    el.focus();
    el.scrollIntoView({block:'nearest', behavior: reduce() ? 'auto' : 'smooth'});
    return;
  }
});

/* ---- signal path: one hop lit at a time, only while the dossier is the live screen ---- */
(function(){
  var hops = document.querySelectorAll('#path s');
  var at = 0, id = null;
  function step(){
    hops.forEach(function(h,i){ h.classList.toggle('on', i === at); });
    at = (at + 1) % hops.length;
  }
  function sync(){
    var live = (current === 's-dark-eye') && !reduce();
    if (live && !id) { at = 0; step(); id = setInterval(step, 620); }
    else if (!live && id) { clearInterval(id); id = null;
      hops.forEach(function(h){ h.classList.add('on'); }); }
  }
  setInterval(sync, 300);   /* cheap state poll, not per-frame work */
  hops.forEach(function(h){ h.classList.add('on'); });
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
mq.addEventListener && mq.addEventListener('change', function(){
  clearTimers(); busy = false;
  document.body.classList.remove('busy','dive','rev');
});
})();
