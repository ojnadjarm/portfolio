import './style.css';
import './gallery.css';
import gallery, { find, body, wire } from './exhibit.js';
import { esc } from './render/h.js';

var BASE = import.meta.env.BASE_URL;
var main = document.getElementById('gal');
var where = document.getElementById('where');

function hdr(no, title, sub) {
  return '<div class="hdr"><i>' + esc(no) + '</i><h2>' + esc(title) + '</h2><hr><span class="sub">' + esc(sub) + '</span></div>';
}

/* The index: one tile per exhibit, poster first. */
function index() {
  return hdr('[G]', gallery.title, gallery.sub) +
    '<p class="lead">' + esc(gallery.lead) + '</p>' +
    '<div class="gal-grid">' + gallery.exhibits.map(function (x, i) {
      var poster = x.media.filter(function (m) { return m.poster; })[0];
      return '<a class="gal-tile tgt" href="#' + esc(x.id) + '">' +
        (poster ? '<img src="' + esc(BASE + poster.poster) + '" alt="" loading="lazy">' : '') +
        '<span class="no">[G·' + String(i + 1).padStart(2, '0') + ']</span><b>' + esc(x.title) + '</b><span class="sub">' + esc(x.sub) + '</span></a>';
    }).join('') + '</div>' +
    '<p class="gal-back"><a class="tgt" href="../">' + esc(gallery.back) + '</a></p>';
}

function exhibit(x) {
  var n = gallery.exhibits.indexOf(x) + 1;
  return '<p class="gal-back"><a class="tgt" href="#">' + esc(gallery.index) + '</a></p>' +
    hdr('[G·' + String(n).padStart(2, '0') + ']', x.title, x.sub) + body(x);
}

/* Hash route: #<exhibit id> shows that exhibit, anything else the index. */
function route() {
  var x = find(location.hash.slice(1));
  main.innerHTML = x ? exhibit(x) : index();
  where.textContent = x ? 'GALLERY · ' + x.title : 'GALLERY';
  document.title = (x ? x.title + ' — ' : '') + 'Gallery — Oscar Nadjar';
  window.scrollTo(0, 0);
  var first = main.querySelector('.ex-start') || main.querySelector('.gal-tile') || main.querySelector('.tgt');
  if (first) first.focus({ preventScroll: true });
}

/* Esc: from an exhibit back to the index, from the index back to the portfolio. */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (find(location.hash.slice(1))) location.hash = '';
  else location.href = BASE;
});

wire(main);
window.addEventListener('hashchange', route);
route();
