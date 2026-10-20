import gallery, { find, body, wire } from './exhibit.js';
import { esc } from './render/h.js';

/* Open exhibit `id` from gallery.json in a modal dialog; focus returns to `opener` on close. */
export function open(id, opener) {
  var x = find(id); if (!x) return;
  var d = document.createElement('dialog');
  d.className = 'modal';
  d.setAttribute('aria-label', x.title);
  d.innerHTML = '<div class="hdr"><i>[view]</i><h2>' + esc(x.title) + '</h2><hr><span class="sub">' + esc(x.sub) + '</span>' +
    '<button class="m-close tgt">' + esc(gallery.close) + '</button></div>' + body(x);
  wire(d);
  d.querySelector('.m-close').addEventListener('click', function () { d.close(); });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  d.addEventListener('close', function () {
    d.remove();
    if (opener) opener.focus();
  });
  document.body.appendChild(d);
  d.showModal();
  d.querySelector('.m-close').focus();
}
