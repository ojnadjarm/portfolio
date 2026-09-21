import { esc, html } from './h.js';
import evidence from '../content/evidence.json';
import repos from '../content/repos.json';

function repoHost(name) {
  return repos.filter(function (r) { return r.name === name; })[0].url.replace(/^https?:\/\//, '');
}

function tags(list) {
  return '<div class="tags">' + list.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join('') + '</div>';
}

function card(e) {
  var body = '<span class="no">' + esc(e.no) + '</span><h3>' + esc(e.title) + '</h3>' +
    '<p>' + esc(e.p) + (e.repo ? ' Public repository — ' + esc(repoHost(e.repo)) + '.' : '') + '</p>' +
    tags(e.tags);
  if (e.flagship) {
    return '<button class="card flag tgt" data-open="' + esc(e.dossier.id) + '" id="' + esc(e.id) + '">' +
      body + '<span class="open">' + esc(e.open) + '</span></button>';
  }
  if (e.statHtml) {
    var c = evidence.commits;
    body += '<div class="stat">' + html(e.statHtml.replace('{commits}', c.count + ' commits, as of ' + c.asOf)) + '</div>';
  }
  return '<div class="card static">' + body + '</div>';
}

function graveCard(e) {
  return '<div class="card static"><span class="no">' + esc(e.no) + '</span><h3>' + esc(e.title) + '</h3>' +
    '<p>' + esc(e.p) + '</p>' + tags(e.tags) +
    '<div class="stat">' + e.links.map(function (l) {
      return esc(l.k) + ' <a href="' + esc(l.url) + '"><u>' + esc(l.label) + '</u></a>';
    }).join(' · ') + '</div></div>';
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
    '<div class="grid stream">' + d.graveyard.map(graveCard).join('') + '</div>' +
  '</div>';
}

/* Dossier screen `.inner` for the flagship entry. */
export function dossier(d) {
  var e = d.entries.filter(function (x) { return x.dossier; })[0];
  var s = e.dossier;
  return '<div class="pn">' +
    '<div class="hdr"><i>' + esc(s.no) + '</i><h2>' + esc(e.title) + '</h2><hr><span class="sub">' + esc(s.sub) + '</span></div>' +
    '<p class="lead">' + esc(s.lead) + ' Source: ' + esc(repoHost(s.repo)) + '.</p>' +
  '</div>' +
  '<div class="pn"><div class="dossier stream">' +
    s.cells.map(function (c) { return '<div><b>' + esc(c.b) + '</b><p>' + esc(c.p) + '</p></div>'; }).join('') +
  '</div></div>' +
  '<div class="pn">' +
    '<div class="hdr"><i>[path]</i><h2>SIGNAL PATH</h2><hr></div>' +
    '<div class="path" id="path">' + s.path.map(function (h) { return '<s>' + esc(h) + '</s>'; }).join('<i>→</i>') + '</div>' +
    '<div class="risk"><em>' + esc(s.riskEm) + '</em> ' + esc(s.risk) + '</div>' +
    '<p class="hint">' + html(s.hintHtml) + '</p>' +
  '</div>';
}
