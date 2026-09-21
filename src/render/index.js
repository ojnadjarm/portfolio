import evidence from '../content/evidence.json';
import identityData from '../content/identity.json';
import knowledgeData from '../content/knowledge.json';
import identity from './identity.js';
import knowledge from './knowledge.js';
import projects, { dossier } from './projects.js';
import projectsData from '../content/projects.json';
import record from './record.js';

/* Fill every screen's `.inner` synchronously, before app.js indexes the DOM. */
function fill(id, markup) {
  document.querySelector('#' + id + ' .inner').innerHTML = markup;
}
fill('s-identity', identity(identityData, evidence));
fill('s-knowledge', knowledge(knowledgeData));
fill('s-projects', projects(projectsData));
fill('s-dark-eye', dossier(projectsData));
fill('s-record', record());
