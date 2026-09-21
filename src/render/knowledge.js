import { esc, html } from './h.js';

function rows(list) {
  return list.map(function (r) {
    return '<div class="krow"><span class="k">' + esc(r.k) + '</span>' +
      '<span class="t' + (r.t === 'HOT' ? ' hot' : '') + '">' + esc(r.t) + '</span>' +
      '<p>' + esc(r.p) + '</p></div>';
  }).join('');
}

/* KNOWLEDGE screen `.inner` from knowledge.json. */
export default function knowledge(d) {
  return '<div class="pn">' +
    '<div class="hdr"><i>[02]</i><h2>KNOWLEDGE</h2><hr><span class="sub">what I know</span></div>' +
    '<p class="lead">' + html(d.leadHtml) + '</p>' +
    '<div class="stream">' + rows(d.rows) + '</div>' +
  '</div>' +
  '<div class="pn">' +
    '<div class="hdr"><i>[02b]</i><h2>METHOD</h2><hr></div>' +
    '<div class="stream">' + rows(d.method) + '</div>' +
  '</div>' +
  '<div class="pn">' +
    '<div class="hdr"><i>[02c]</i><h2>EXPLORED</h2><hr><span class="sub">no results claimed</span></div>' +
    '<div class="stream">' + rows(d.explored) + '</div>' +
  '</div>';
}
