import './exhibit.css';
import { esc } from './render/h.js';
import gallery from './content/gallery.json';

var BASE = import.meta.env.BASE_URL;

/* Media path from gallery.json, resolved against the site base. */
function url(src) { return BASE + src; }

function embed(m) {
  return '<div class="ex-embed" data-src="' + esc(url(m.src)) + '">' +
    '<img src="' + esc(url(m.poster)) + '" alt="' + esc(m.alt) + '" loading="lazy">' +
    '<button class="ex-start tgt">' + esc(gallery.start) + '</button>' +
  '</div>' +
  '<p class="ex-note">' + esc(m.note) + ' <a href="' + esc(url(m.src)) + '" target="_blank" rel="noopener">' + esc(gallery.newTab) + '</a></p>';
}

function video(m) {
  return '<video class="ex-video" controls muted playsinline preload="none" poster="' + esc(url(m.poster)) + '" src="' + esc(url(m.src)) + '"></video>' +
    '<p class="ex-note">' + esc(m.label) + '</p>';
}

function stills(m) {
  return '<div class="ex-stills">' + m.items.map(function (s) {
    return '<a href="' + esc(url(s.src)) + '" target="_blank" rel="noopener"><img src="' + esc(url(s.src)) + '" alt="' + esc(s.alt) + '" loading="lazy"></a>';
  }).join('') + '</div>';
}

var KINDS = { embed: embed, video: video, stills: stills };

export function find(id) {
  return gallery.exhibits.filter(function (x) { return x.id === id; })[0];
}

/* Media and evidence links of one exhibit; the caller supplies the heading. */
export function body(x) {
  return '<p class="lead">' + esc(x.lead) + '</p>' +
    x.media.map(function (m) { return '<div class="ex-media">' + KINDS[m.kind](m) + '</div>'; }).join('') +
    '<div class="links">' + x.links.map(function (l) {
      return '<a class="tgt" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '<span>' + esc(l.k) + '</span></a>';
    }).join('') + '</div>';
}

/* Swap an embed's poster for its iframe on Start, so nothing heavy loads until asked. */
export function wire(root) {
  root.addEventListener('click', function (e) {
    var b = e.target.closest('.ex-start'); if (!b) return;
    var box = b.parentNode, f = document.createElement('iframe');
    f.src = box.dataset.src;
    f.title = box.querySelector('img').alt;
    f.allow = 'fullscreen; autoplay';
    box.replaceChildren(f);
    f.focus();
  });
}

export default gallery;
