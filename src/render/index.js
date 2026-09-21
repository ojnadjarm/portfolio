import evidence from '../content/evidence.json';
import identityData from '../content/identity.json';
import knowledgeData from '../content/knowledge.json';
import identity from './identity.js';
import knowledge from './knowledge.js';
import projects, { dossiers } from './projects.js';
import projectsData from '../content/projects.json';
import record from './record.js';
import { esc } from './h.js';

/* Fill every screen's `.inner` synchronously, before app.js indexes the DOM. */
function fill(id, markup) {
  document.querySelector('#' + id + ' .inner').innerHTML = markup;
}
fill('s-identity', identity(identityData, evidence));
fill('s-knowledge', knowledge(knowledgeData));
fill('s-projects', projects(projectsData));
fill('s-record', record());

/* Dossier shells are generated after PROJECTS; app.js reads data-dossier / data-name for the chrome. */
var shells = dossiers(projectsData).map(function (s) {
  return '<section class="screen" id="' + esc(s.id) + '" aria-label="' + esc(s.name) + ' — dossier" hidden' +
    ' data-dossier="' + s.n + '" data-name="' + esc(s.name) + '"><div class="inner">' + s.markup + '</div></section>';
}).join('');
document.getElementById('s-projects').insertAdjacentHTML('afterend', shells);
