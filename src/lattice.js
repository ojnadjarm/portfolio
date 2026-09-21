import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ColorManagement, FogExp2, Group, LinearSRGBColorSpace, LineBasicMaterial, LineSegments, PerspectiveCamera, Points, PointsMaterial, Scene, Vector3, WebGLRenderer } from 'three';
const T = { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ColorManagement, FogExp2, Group, LinearSRGBColorSpace, LineBasicMaterial, LineSegments, PerspectiveCamera, Points, PointsMaterial, Scene, Vector3, WebGLRenderer };
T.ColorManagement.enabled = false;
(function(){
"use strict";
/* T imported above */
var cv = document.getElementById('bg');
if (!T || !cv || !T.WebGLRenderer) { if (cv) cv.style.display = 'none'; return; }

var mq = matchMedia('(prefers-reduced-motion: reduce)');
var reduce = function(){ return mq.matches; };

var renderer;
try {
  renderer = new T.WebGLRenderer({canvas:cv, antialias:false, alpha:true, powerPreference:'low-power'});
} catch(e){ cv.style.display = 'none'; return; }
renderer.outputColorSpace = T.LinearSRGBColorSpace;

var AMBER = new T.Color(0xffb000);           /* the only hue in the scene */
var scene = new T.Scene();
scene.fog = new T.FogExp2(0x000000, 0.018);  /* depth does the work */
var cam = new T.PerspectiveCamera(58, 1, 0.1, 260);

var narrow = innerWidth < 620;
var NODES  = narrow ? 190 : 420;
var SPAN_X = 44, SPAN_Y = 26, SPAN_Z = 150;

/* ---- build one continuous sparse lattice ---- */
var pts = [], i, j;
for (i = 0; i < NODES; i++){
  pts.push(new T.Vector3(
    (Math.random()-0.5) * SPAN_X,
    (Math.random()-0.5) * SPAN_Y,
    -Math.random() * SPAN_Z
  ));
}
/* edges: nearest neighbours only, capped — sparse, like a pruned graph */
var segs = [], segMid = [];
for (i = 0; i < NODES; i++){
  var near = [];
  for (j = 0; j < NODES; j++){
    if (i === j) continue;
    var d = pts[i].distanceTo(pts[j]);
    if (d < 15) near.push([d, j]);
  }
  near.sort(function(a,b){ return a[0]-b[0]; });
  for (var k = 0; k < Math.min(2, near.length); k++){
    if (near[k][1] < i) continue;            /* one edge per pair */
    segs.push(pts[i], pts[near[k][1]]);
    segMid.push((pts[i].z + pts[near[k][1]].z) * 0.5);
  }
}

var lineGeo = new T.BufferGeometry().setFromPoints(segs);
var lineCol = new Float32Array(segs.length * 3);
for (i = 0; i < segs.length; i++){
  var b = 0.12 + 0.58 * Math.max(0, 1 + segs[i].z / SPAN_Z);
  lineCol[i*3] = AMBER.r * b; lineCol[i*3+1] = AMBER.g * b; lineCol[i*3+2] = AMBER.b * b;
}
lineGeo.setAttribute('color', new T.BufferAttribute(lineCol, 3));
var lineMat = new T.LineBasicMaterial({vertexColors:true, transparent:true, opacity:0.62, fog:true,
                                       blending:T.AdditiveBlending, depthWrite:false});
var lines = new T.LineSegments(lineGeo, lineMat);

var nodeGeo = new T.BufferGeometry().setFromPoints(pts);
var nodeCol = new Float32Array(NODES * 3);
var nodeBase = new Float32Array(NODES);
for (i = 0; i < NODES; i++){
  nodeBase[i] = 0.34 + 0.66 * Math.pow(Math.random(), 2);   /* a few near and bright */
}
nodeGeo.setAttribute('color', new T.BufferAttribute(nodeCol, 3));
/* fixed pixel size: near nodes must not bloom into blocks. Depth is fog + brightness. */
var nodeMat = new T.PointsMaterial({size: narrow ? 1.8 : 2.2, vertexColors:true, transparent:true,
                                    opacity:0.95, fog:true, sizeAttenuation:false,
                                    blending:T.AdditiveBlending, depthWrite:false});
var nodes = new T.Points(nodeGeo, nodeMat);

var graph = new T.Group();
graph.add(lines); graph.add(nodes);
scene.add(graph);

/* ---- one region of the graph per screen ---- */
var REGION = {
  's-identity' : {x:  0,  y:  1.5, z: -6,   ry:  0.00, rx: 0.00},
  's-knowledge': {x: -13, y:  4,   z: -34,  ry:  0.16, rx:-0.05},
  's-projects' : {x:  12, y: -3,   z: -66,  ry: -0.16, rx: 0.05},
  's-record'   : {x: -6,  y: -6,   z: -98,  ry:  0.08, rx: 0.08},
  's-dark-eye' : {x:  12, y: -3,   z: -84,  ry: -0.06, rx: 0.02}   /* deeper, same region as projects */
};
var target = Object.assign({}, REGION['s-identity']);
var pos    = Object.assign({}, REGION['s-identity']);
var pulse  = 0;        /* transition energy: edges release, nodes flare */
var travel = 0;        /* extra camera ease while routing */

window.__lat = {
  go: function(to, mode){
    var r = REGION[to] || REGION['s-identity'];
    target = Object.assign({}, r);
    pulse  = 1;
    travel = (mode === 'lateral') ? 1 : 1.5;
    if (reduce()) { pos = Object.assign({}, target); pulse = 0; draw(0); }
    wake();
  },
  snap: function(to){
    var r = REGION[to] || REGION['s-identity'];
    target = Object.assign({}, r); pos = Object.assign({}, r); pulse = 0;
    draw(0);
  }
};

/* ---- pointer / scroll parallax ---- */
var px = 0, py = 0, tpx = 0, tpy = 0;
addEventListener('pointermove', function(e){
  tpx = (e.clientX / innerWidth  - 0.5) * 2;
  tpy = (e.clientY / innerHeight - 0.5) * 2;
  wake();
}, {passive:true});
document.getElementById('stage').addEventListener('scroll', function(e){
  var el = e.target;
  if (el && el.scrollHeight > el.clientHeight)
    tpy = (el.scrollTop / (el.scrollHeight - el.clientHeight) - 0.5) * 1.6;
  wake();
}, true);

/* ---- size ---- */
function resize(){
  var w = innerWidth, h = innerHeight;
  var dpr = Math.min(devicePixelRatio || 1, w < 620 ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  cam.aspect = w / h; cam.updateProjectionMatrix();
}
addEventListener('resize', function(){ resize(); draw(0); wake(); });
resize();

/* ---- draw ---- */
var t0 = performance.now();
function draw(dt){
  var t = (performance.now() - t0) * 0.001;
  var ease = 0.045 + 0.06 * travel;
  pos.x += (target.x - pos.x) * ease;
  pos.y += (target.y - pos.y) * ease;
  pos.z += (target.z - pos.z) * ease;
  pos.ry += (target.ry - pos.ry) * ease;
  pos.rx += (target.rx - pos.rx) * ease;

  px += (tpx - px) * 0.05; py += (tpy - py) * 0.05;

  cam.position.set(pos.x + px * 3.2, pos.y - py * 2.2, pos.z + 16 + Math.sin(t*0.12) * 1.2);
  cam.rotation.set(pos.rx - py * 0.045, pos.ry + px * 0.05, 0);

  graph.rotation.y = Math.sin(t * 0.045) * 0.05;
  graph.rotation.x = Math.cos(t * 0.035) * 0.03;

  /* edges release during a transition, then come back */
  lineMat.opacity = 0.62 * (1 - pulse * 0.88);
  /* nodes flare as the incoming screen assembles */
  var col = nodeGeo.attributes.color.array;
  for (var n = 0; n < NODES; n++){
    var flare = pulse * (0.55 + 0.45 * Math.sin(t * 5 + n * 0.7));
    var b = Math.min(1.25, nodeBase[n] * (0.55 + 0.45 * Math.sin(t * 0.5 + n)) + flare);
    col[n*3] = AMBER.r * b; col[n*3+1] = AMBER.g * b; col[n*3+2] = AMBER.b * b;
  }
  nodeGeo.attributes.color.needsUpdate = true;

  pulse  *= 0.93;  if (pulse  < 0.003) pulse  = 0;
  travel *= 0.96;  if (travel < 0.01)  travel = 0;

  renderer.render(scene, cam);
}

/* ---- loop: paused when hidden, paused when idle, off under reduced motion ---- */
var raf = null, idleAt = performance.now() + 45000;
function frame(){
  raf = null;
  if (reduce() || document.hidden) return;
  draw(0);
  if (performance.now() > idleAt && pulse === 0 && travel === 0 &&
      Math.abs(tpx - px) < 0.01 && Math.abs(tpy - py) < 0.01) return;   /* idle: stop */
  raf = requestAnimationFrame(frame);
}
function wake(){
  idleAt = performance.now() + 45000;
  if (!raf && !reduce() && !document.hidden) raf = requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', function(){ if (!document.hidden) wake(); });
addEventListener('keydown', wake, {passive:true});
addEventListener('pointerdown', wake, {passive:true});
mq.addEventListener && mq.addEventListener('change', function(){
  if (reduce()) { if (raf) cancelAnimationFrame(raf); raf = null; pulse = 0; travel = 0;
                  pos = Object.assign({}, target); draw(0); }
  else wake();
});

draw(0);                       /* one still frame always exists */
if (!reduce()) wake();         /* reduced motion: that still frame is all there is */
})();
