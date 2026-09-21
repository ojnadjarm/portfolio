import { esc, html } from './h.js';

/* IDENTITY screen `.inner` from identity.json + evidence.json. */
export default function identity(d, ev) {
  var cells = d.split.map(function (c) {
    var n = c.commits ? ev.commits.count : c.n;
    var label = c.commits ? c.label + ' ' + ev.commits.asOf : c.label;
    var num = c.commits
      ? '<a href="' + esc(ev.commits.url) + '" target="_blank" rel="noopener">' + esc(n) + '</a>'
      : esc(n);
    return '<div>' +
      '<b' + (c.muted ? ' class="n"' : '') + '>' + num + '</b>' +
      '<span>' + esc(label) + '</span>' +
      '<em>' + esc(c.em) + '</em>' +
    '</div>';
  }).join('');
  var links = d.links.map(function (l) {
    return '<a class="tgt" href="' + esc(ev[l.href]) + '" target="_blank" rel="noopener"><span>' + esc(l.label) + '</span>' +
      '<b>' + esc(l.text) + '</b></a>';
  }).join('');
  return '<div class="pn">' +
    '<div class="kick">' + esc(d.kick) + '</div>' +
    '<h1>' + esc(d.h1) + '<span class="cur">_</span></h1>' +
    '<blockquote>' + html(d.heroHtml) + '<cite>' + esc(d.cite) + '</cite></blockquote>' +
    '<p class="who">' + html(d.whoHtml) + '</p>' +
  '</div>' +
  '<div class="pn">' +
    '<div class="split">' + cells + '</div>' +
    '<div class="links">' + links + '</div>' +
    '<p class="hint"><span class="kb">' + html(d.hintHtml) + '</span><span class="tc">' + esc(d.hintTouch) + '</span></p>' +
  '</div>';
}
