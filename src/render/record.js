import { esc } from './h.js';
import d from '../content/record.json';
import ev from '../content/evidence.json';

/* `href` in record.json names an evidence.json entry; URLs live only there. */
function linkHref(key) {
  return key === 'commits' ? ev.commits.url : ev[key];
}
function linkLabel(l) {
  return l.href === 'commits'
    ? ev.commits.count + ' ' + l.label + ' · ' + ev.commits.asOf.toUpperCase()
    : l.label;
}

/* RECORD screen `.inner` from record.json + evidence.json. */
export default function record() {
  var rows = d.rows.map(function (r) {
    return '<div class="trow"><span class="yr">' + esc(r.yr) + '</span>' +
      '<div><h4>' + esc(r.h4) + '</h4><p>' + esc(r.p) + '</p></div></div>';
  }).join('');
  var sealed = d.sealed.map(function (s) {
    return '<div class="srow"><span class="ix">' + esc(s.ix) + '</span>' +
      '<span class="rd" data-w="' + esc(s.w) + '"></span>' +
      '<span class="dsc">' + esc(s.dsc) + '</span>' +
      '<span class="yr">' + esc(s.yr) + '</span></div>';
  }).join('');
  var links = d.links.map(function (l) {
    return '<a class="tgt" href="' + esc(linkHref(l.href)) + '" target="_blank" rel="noopener"><span>' + esc(linkLabel(l)) + '</span>' +
      '<b>' + esc(l.text) + '</b></a>';
  }).join('');
  return '<div class="pn">' +
    '<div class="hdr"><i>[04]</i><h2>RECORD</h2><hr><span class="sub">' + esc(d.sub) + '</span></div>' +
    '<div class="stream">' + rows + '</div>' +
  '</div>' +
  '<div class="pn">' +
    '<div class="hdr"><i>[04b]</i><h2>SEALED</h2><hr><span class="sub">' + esc(d.sealedSub) + '</span></div>' +
    '<p class="lead">' + esc(d.sealedLead) + '</p>' +
    '<div class="stream" id="seal">' + sealed + '</div>' +
  '</div>' +
  '<div class="pn">' +
    '<div class="hdr"><i>[end]</i><h2>WHERE TO FIND ME</h2><hr></div>' +
    '<div class="links">' + links + '</div>' +
    '<div class="sig">' + esc(d.sig) + '</div>' +
  '</div>';
}
