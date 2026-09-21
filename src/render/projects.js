import { esc, html } from './h.js';
import evidence from '../content/evidence.json';
import repos from '../content/repos.json';

function repoUrl(name) {
  return repos.filter(function (r) { return r.name === name; })[0].url;
}
function repoHost(name) {
  return repoUrl(name).replace(/^https?:\/\//, '');
}
function fill(s) {
  var c = evidence.commits;
  return s.replace('{commits}', c.count + ' commits, as of ' + c.asOf).replace('{commitsUrl}', c.url);
}

function tags(list) {
  return '<div class="tags">' + list.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join('') + '</div>';
}

function card(e) {
  var body = '<span class="no">' + esc(e.no) + '</span><h3>' + esc(e.title) + '</h3>' +
    '<p>' + esc(e.p) + (e.repo ? ' Public repository — ' + esc(repoHost(e.repo)) + '.' : '') + '</p>' +
    tags(e.tags);
  if (e.statHtml) body += '<div class="stat">' + html(fill(e.statHtml)) + '</div>';
  return '<button class="card' + (e.flagship ? ' flag' : '') + ' tgt" data-open="' + esc(e.dossier.id) + '" id="' + esc(e.id) + '">' +
    body + '<span class="open">' + esc(e.open) + '</span></button>';
}

/* PROJECTS screen `.inner` from projects.json. */
export default function projects(d) {
  return '<div class="pn">' +
    '<div class="hdr"><i>[03]</i><h2>PROJECTS</h2><hr><span class="sub">what I built</span></div>' +
    '<p class="lead">' + esc(d.lead) + '</p>' +
    '<div class="grid stream">' + d.entries.map(card).join('') + '</div>' +
  '</div>' +
  '<div class="pn">' +
    '<div class="hdr"><i>[03b]</i><h2>GRAVEYARD</h2><hr><span class="sub">closed out · public</span></div>' +
    '<div class="grid stream">' + d.graveyard.map(card).join('') + '</div>' +
  '</div>';
}

function dossier(e, touchHint) {
  var s = e.dossier;
  return '<div class="pn">' +
    '<div class="hdr"><i>' + esc(s.no) + '</i><h2>' + esc(e.title) + '</h2><hr><span class="sub">' + esc(s.sub) + '</span></div>' +
    '<p class="lead">' + esc(s.lead) + (s.repo ? ' Source: ' + esc(repoHost(s.repo)) + '.' : '') + '</p>' +
  '</div>' +
  '<div class="pn"><div class="dossier stream">' +
    s.cells.map(function (c) { return '<div><b>' + esc(c.b) + '</b><p>' + esc(fill(c.p)) + '</p></div>'; }).join('') +
  '</div>' +
  (s.links ? '<div class="links">' + s.links.map(function (l) {
    return '<a class="tgt" href="' + esc(fill(l.url)) + '" target="_blank" rel="noopener">' + esc(l.label) + '<span>' + esc(l.k) + '</span></a>';
  }).join('') + '</div>' : '') +
  '</div>' +
  '<div class="pn">' +
    (s.path ? '<div class="hdr"><i>[path]</i><h2>SIGNAL PATH</h2><hr></div>' +
      '<div class="path">' + s.path.map(function (h) { return '<s>' + esc(h) + '</s>'; }).join('<i>→</i>') + '</div>' : '') +
    '<div class="risk"><em>' + esc(s.riskEm) + '</em> ' + esc(s.risk) + '</div>' +
    '<p class="hint"><span class="kb">' + html(s.hintHtml) + '</span><span class="tc">' + esc(touchHint) + '</span></p>' +
  '</div>';
}

/* One dossier screen per entry: id, name and number for the chrome, plus its `.inner` markup. */
export function dossiers(d) {
  return d.entries.concat(d.graveyard).map(function (e, i) {
    return { id: e.dossier.id, name: e.title, n: i + 1, markup: dossier(e, d.hintTouch) };
  });
}
