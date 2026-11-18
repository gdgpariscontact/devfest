/**
 * Génère openfeedback-import.json depuis js/agenda.js (modèle OpenFeedback).
 * Usage: node scripts/generate-openfeedback-import.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const EVENT_DATE = '2026-11-27';
const TZ = '+01:00';
const SITE_ORIGIN = 'https://devfest.gdgparis.fr';
const OPENFEEDBACK_DAY_URL = 'https://openfeedback.io/sBSRvQdfgZv87UJ1Zr8p/2026-11-27';
const SKIP_TYPES = new Set(['Arrival', 'Break', 'End']);

const agendaPath = path.join(__dirname, '..', 'js', 'agenda.js');
const outPath = path.join(__dirname, '..', 'openfeedback-import.json');
const mapJsPath = path.join(__dirname, '..', 'js', 'openfeedback-sessions.js');

const agendaSource = fs.readFileSync(agendaPath, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(
  `${agendaSource}\nthis.agendaData = agendaData;\nthis.speakerProfiles = speakerProfiles;`,
  sandbox
);

const { agendaData, speakerProfiles } = sandbox;

function slugId(value) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toIso(timeHM) {
  const [h, m] = timeHM.split(':');
  return `${EVENT_DATE}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00${TZ}`;
}

function absPhotoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_ORIGIN}/${url.replace(/^\//, '')}`;
}

function buildSocials(profile) {
  if (!profile) return [];
  const socials = [];
  if (profile.twitter) socials.push({ name: 'twitter', link: profile.twitter });
  if (profile.linkedin) socials.push({ name: 'linkedin', link: profile.linkedin });
  if (profile.github) socials.push({ name: 'github', link: profile.github });
  return socials;
}

const speakersMap = {};
const sessionsMap = {};
const websiteSessionIds = {};
let sessionIndex = 0;

function websiteSessionKey(session) {
  return `${session.timeStart}\u0001${session.title}`;
}

for (const session of agendaData) {
  if (SKIP_TYPES.has(session.type)) continue;

  const sessionId = `df26-${String(sessionIndex).padStart(3, '0')}`;
  sessionIndex += 1;

  const speakerIds = [];
  for (const sp of session.speakers || []) {
    if (sp.panelRole === 'moderator') continue;

    const speakerId = slugId(sp.name);
    speakerIds.push(speakerId);

    if (!speakersMap[speakerId]) {
      const profile = speakerProfiles[sp.name];
      speakersMap[speakerId] = {
        id: speakerId,
        name: sp.name,
        company: (profile && profile.company) || sp.role || '',
        photoUrl: absPhotoUrl((profile && profile.avatar) || sp.avatar || ''),
        socials: buildSocials(profile),
      };
    }
  }

  const tags = [session.type];
  if (session.lang) tags.push(session.lang.toUpperCase());

  websiteSessionIds[websiteSessionKey(session)] = sessionId;

  sessionsMap[sessionId] = {
    id: sessionId,
    title: session.title,
    description: session.description || '',
    tags,
    speakers: speakerIds,
    startTime: toIso(session.timeStart),
    endTime: toIso(session.timeEnd),
    trackTitle: session.track || '',
  };
}

const output = {
  sessions: sessionsMap,
  speakers: speakersMap,
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

const mapJs = `// Auto-généré par scripts/generate-openfeedback-import.js — ne pas éditer à la main.
window.OPENFEEDBACK_DAY_URL = ${JSON.stringify(OPENFEEDBACK_DAY_URL)};
window.OPENFEEDBACK_SESSION_IDS = ${JSON.stringify(websiteSessionIds, null, 2)};

window.getOpenFeedbackUrl = function getOpenFeedbackUrl(session) {
  if (!session || !window.OPENFEEDBACK_SESSION_IDS) return null;
  const key = session.timeStart + '\\u0001' + session.title;
  const sessionId = window.OPENFEEDBACK_SESSION_IDS[key];
  if (!sessionId) return null;
  return window.OPENFEEDBACK_DAY_URL + '/' + sessionId;
};
`;
fs.writeFileSync(mapJsPath, mapJs, 'utf8');

console.log(
  `Wrote ${outPath}: ${Object.keys(sessionsMap).length} sessions, ${Object.keys(speakersMap).length} speakers.`
);
console.log(`Wrote ${mapJsPath}`);