// The room numbers and positions follow the four venue plans. Only five rooms
// currently have tracks in agenda.js; the remaining spaces stay explorable.
(function () {
  const TRACK_BY_ROOM = {
    '0.2': 'Salle 4', '0.3': 'Salle 3',
    '1.2': 'Salle 1', '1.3': 'Salle 2', '2.1': 'Salle Keynote'
  };
  const ROOM_BY_TRACK = Object.fromEntries(Object.entries(TRACK_BY_ROOM).map(([room, track]) => [track, room]));

  const FLOORS = [
    {
      id: '2', label: { fr: 'Keynote & conférences', en: 'Keynote & conferences' }, initial: '2.1',
      rooms: [{ id: '2.1', x: 265, y: 32, w: 350, h: 204 }],
      terrace: { x: 18, y: 30, w: 228, h: 210 }, amenities: []
    },
    {
      id: '1', label: { fr: 'Conférences', en: 'Conferences' }, initial: '1.2',
      rooms: [
        { id: '1.1', x: 257, y: 28, w: 59, h: 92 },
        { id: '1.2', x: 323, y: 28, w: 122, h: 92 },
        { id: '1.3', x: 452, y: 28, w: 172, h: 92 },
        { id: '1.4', x: 316, y: 168, w: 62, h: 70 },
        { id: '1.5', x: 385, y: 168, w: 72, h: 70 },
        { id: '1.6', x: 495, y: 168, w: 58, h: 70 },
        { id: '1.7', x: 560, y: 168, w: 64, h: 70 }
      ],
      terrace: { x: 18, y: 30, w: 228, h: 210 }, amenities: []
    },
    {
      id: '0', label: { fr: 'Ateliers & entrée', en: 'Workshops & entrance' }, initial: '0.3',
      rooms: [
        { id: '0.1', x: 142, y: 32, w: 190, h: 112 },
        { id: '0.2', x: 339, y: 32, w: 120, h: 112 },
        { id: '0.3', x: 466, y: 32, w: 158, h: 112 }
      ],
      terrace: null, amenities: [{ x: 150, y: 166, w: 470, h: 70, kind: 'foyer' }]
    },
    {
      id: '-1', label: { fr: 'Sponsors & restauration', en: 'Sponsors & catering' }, initial: null,
      rooms: [], terrace: null,
      amenities: [
        { x: 60, y: 36, w: 188, h: 188, kind: 'sponsors' },
        { x: 258, y: 36, w: 366, h: 188, kind: 'catering' }
      ]
    }
  ];

  let selectedFloor = '1';
  let selectedRoom = '1.2';
  let pendingRoomFocus = null;
  const copy = {
    fr: {
      floor: 'Niveau', room: 'Salle', terrace: 'Terrasse', foyer: 'Entrée & espace commun',
      sponsors: 'Espace sponsors', catering: 'Restauration & bar', sessions: 'sessions au programme',
      noSessions: 'Aucune session de l’agenda n’est actuellement associée à cette salle.',
      selectRoom: 'Sélectionnez une salle sur le plan pour voir son programme.',
      floorOnly: 'Cet étage accueille les espaces sponsors, le bar et la restauration.',
      viewAgenda: 'Voir tout l’agenda', openSession: 'Voir les détails de la session',
      talks: 'Programme de la salle', other: 'Espace du lieu',
      floorDescription: 'Choisissez une salle sur le plan pour explorer les conférences et ateliers.',
      expand: 'Afficher le plan', collapse: 'Masquer le plan'
    },
    en: {
      floor: 'Level', room: 'Room', terrace: 'Terrace', foyer: 'Entrance & shared space',
      sponsors: 'Sponsor area', catering: 'Catering & bar', sessions: 'scheduled sessions',
      noSessions: 'No agenda sessions are currently assigned to this room.',
      selectRoom: 'Select a room on the map to see its schedule.',
      floorOnly: 'This floor hosts the sponsor area, bar, and catering.',
      viewAgenda: 'View the full agenda', openSession: 'View session details',
      talks: 'Room schedule', other: 'Venue space',
      floorDescription: 'Choose a room on the map to explore its talks and workshops.',
      expand: 'Show venue map', collapse: 'Hide venue map'
    }
  };

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';
  const t = key => copy[lang()][key];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const point = (x, y, z = 0) => [365 + (x - y) * .76, 111 + (x + y) * .35 - z];
  const points = corners => corners.map(([x, y, z]) => point(x, y, z).map(n => n.toFixed(1)).join(',')).join(' ');
  const polygon = (corners, className) => `<polygon points="${points(corners)}" class="${className}"/>`;

  function prism({ x, y, w, h }, kind, label, selected = false, interactive = false) {
    const height = kind === 'room' ? 35 : kind === 'terrace' ? 14 : 18;
    const top = [[x,y,height],[x+w,y,height],[x+w,y+h,height],[x,y+h,height]];
    const east = [[x+w,y,height],[x+w,y+h,height],[x+w,y+h,0],[x+w,y,0]];
    const south = [[x,y+h,height],[x+w,y+h,height],[x+w,y+h,0],[x,y+h,0]];
    const [cx, cy] = point(x + w / 2, y + h / 2, height + 2);
    const safeLabel = esc(label);
    const roomAttrs = interactive
      ? `role="button" tabindex="0" data-room="${esc(label)}" aria-label="${esc(t('room'))} ${safeLabel}${TRACK_BY_ROOM[label] ? `, ${getSessions(label).length} ${esc(t('sessions'))}` : ''}" aria-pressed="${selected}"`
      : '';
    const roomClass = interactive ? ' venue-room' : '';
    return `<g class="venue-block venue-block-${kind}${selected ? ' is-selected' : ''}${roomClass}" ${roomAttrs}>
      ${polygon(east, 'venue-face venue-face-east')}
      ${polygon(south, 'venue-face venue-face-south')}
      ${polygon(top, 'venue-face venue-face-top')}
      <text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" class="venue-block-label" text-anchor="middle" dominant-baseline="central">${safeLabel}</text>
    </g>`;
  }

  function getSessions(room) {
    const track = TRACK_BY_ROOM[room];
    return (window.agendaData || []).filter(item => item.track === track && item.type !== 'Break')
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }

  function renderFloorButtons() {
    const host = document.getElementById('venue-map-floors');
    if (!host) return;
    host.setAttribute('aria-label', lang() === 'fr' ? 'Étages' : 'Floors');
    host.innerHTML = FLOORS.map(floor => `<button type="button" class="venue-floor-btn${floor.id === selectedFloor ? ' is-active' : ''}"
      data-floor="${floor.id}" aria-pressed="${floor.id === selectedFloor}">
      <span class="venue-floor-number">${floor.id}</span><span class="venue-floor-name">${esc(floor.label[lang()])}</span>
    </button>`).join('');
  }

  function renderMap() {
    const host = document.getElementById('venue-map-canvas');
    if (!host) return;
    const floor = FLOORS.find(item => item.id === selectedFloor);
    const base = floor.id === '-1' ? { x: 38, y: 18, w: 610, h: 238 } : { x: 0, y: 12, w: 650, h: 246 };
    const { x, y, w, h } = base;
    const slab = polygon([[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]], 'venue-slab-top') +
      polygon([[x+w,y,0],[x+w,y+h,0],[x+w,y+h,-16],[x+w,y,-16]], 'venue-slab-east') +
      polygon([[x,y+h,0],[x+w,y+h,0],[x+w,y+h,-16],[x,y+h,-16]], 'venue-slab-south');
    const floorLabel = `${t('floor')} ${floor.id} · ${floor.label[lang()]}`;
    const spaces = [];
    if (floor.terrace) spaces.push(prism(floor.terrace, 'terrace', t('terrace')));
    floor.amenities.forEach(space => spaces.push(prism(space, 'amenity', t(space.kind))));
    floor.rooms.forEach(room => spaces.push(prism(room, 'room', room.id, room.id === selectedRoom, true)));
    host.innerHTML = `<svg viewBox="0 0 1030 500" role="group" aria-label="${esc(floorLabel)}" preserveAspectRatio="xMidYMid meet">
      <defs><filter id="venue-shadow" x="-30%" y="-40%" width="160%" height="200%"><feGaussianBlur stdDeviation="14"/></filter></defs>
      <ellipse cx="520" cy="425" rx="330" ry="34" fill="#000" opacity=".27" filter="url(#venue-shadow)"/>
      <g class="venue-slab">${slab}</g>
      <text x="74" y="67" class="venue-svg-eyebrow">DEVFEST PARIS 2026</text>
      <text x="74" y="101" class="venue-svg-title">${esc(floorLabel)}</text>
      ${spaces.join('')}
      <text x="832" y="460" class="venue-svg-compass">N ↑</text>
    </svg>`;
    if (window.matchMedia('(max-width: 640px)').matches) {
      host.scrollLeft = Math.max(0, (host.scrollWidth - host.clientWidth) / 2);
    }
  }

  function renderDetails() {
    const host = document.getElementById('venue-map-details');
    if (!host) return;
    const floor = FLOORS.find(item => item.id === selectedFloor);
    const room = floor.rooms.find(item => item.id === selectedRoom);
    if (!room) {
      host.innerHTML = `<div class="venue-detail-kicker">${esc(t('floor'))} ${esc(floor.id)}</div>
        <h3>${esc(floor.label[lang()])}</h3><p class="venue-detail-intro">${esc(floor.id === '-1' ? t('floorOnly') : t('selectRoom'))}</p>
        <div class="venue-detail-note">${esc(floor.id === '-1' ? `${t('sponsors')} · ${t('catering')}` : t('floorDescription'))}</div>`;
      return;
    }
    const sessions = getSessions(room.id);
    const list = sessions.length
      ? `<p class="venue-detail-subtitle">${esc(t('talks'))}</p><div class="venue-session-list">${sessions.map(session => {
          const index = (window.agendaData || []).indexOf(session);
          const speakers = (session.speakers || []).map(s => s.name).join(', ');
          return `<button type="button" class="venue-session" data-session="${index}" aria-label="${esc(t('openSession'))}: ${esc(session.title)}">
            <span class="venue-session-time">${esc(session.timeStart)} – ${esc(session.timeEnd)}</span>
            <strong>${esc(session.title)}</strong>
            ${speakers ? `<small>${esc(speakers)}</small>` : ''}
            <span class="venue-session-arrow" aria-hidden="true">↗</span>
          </button>`;
        }).join('')}</div>`
      : `<p class="venue-detail-empty">${esc(t('noSessions'))}</p>`;
    host.innerHTML = `<div class="venue-detail-kicker">${esc(t('floor'))} ${esc(floor.id)} · ${esc(sessions.length ? t('talks') : t('other'))}</div>
      <h3>${esc(t('room'))} ${esc(room.id)}</h3>
      <p class="venue-detail-intro">${sessions.length ? `${sessions.length} ${esc(t('sessions'))}` : esc(t('noSessions'))}</p>
      ${list}
      <a href="/agenda" class="venue-detail-agenda-link">${esc(t('viewAgenda'))}<span aria-hidden="true">↗</span></a>`;
  }

  function syncToggle() {
    const layout = document.getElementById('venue-map-layout');
    const toggle = document.getElementById('venue-map-toggle');
    const label = document.getElementById('venue-map-toggle-label');
    if (!layout || !toggle || !label) return;
    const expanded = !layout.hidden;
    toggle.setAttribute('aria-expanded', String(expanded));
    label.textContent = t(expanded ? 'collapse' : 'expand');
  }

  window.updateVenueMapRoute = function (route) {
    const section = document.getElementById('venue-map');
    const layout = document.getElementById('venue-map-layout');
    if (!section || !layout) return;
    const isAgenda = route === 'agenda';
    section.classList.toggle('is-agenda', isAgenda);
    layout.hidden = isAgenda;
    syncToggle();
    if (isAgenda && pendingRoomFocus) {
      const room = pendingRoomFocus;
      pendingRoomFocus = null;
      revealRoom(room);
    }
  };

  function render() { renderFloorButtons(); renderMap(); renderDetails(); syncToggle(); }

  function revealRoom(room) {
    const section = document.getElementById('venue-map');
    const layout = document.getElementById('venue-map-layout');
    if (!section || !layout) return;
    selectedFloor = room.split('.')[0];
    selectedRoom = room;
    layout.hidden = false;
    render();
    requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  window.focusVenueRoomByTrack = function (track) {
    const room = ROOM_BY_TRACK[track];
    if (!room) return false;
    window.closeSessionModal?.();
    const route = typeof getRoute === 'function' ? getRoute() : 'home';
    if (route === 'home' || route === 'agenda') {
      revealRoom(room);
    } else if (typeof navigate === 'function') {
      pendingRoomFocus = room;
      navigate('agenda');
    }
    return true;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('venue-map');
    if (!section) return;
    section.addEventListener('click', event => {
      if (event.target.closest('#venue-map-toggle')) {
        const layout = document.getElementById('venue-map-layout');
        layout.hidden = !layout.hidden;
        syncToggle();
        return;
      }
      const floorButton = event.target.closest('[data-floor]');
      if (floorButton) {
        selectedFloor = floorButton.dataset.floor;
        selectedRoom = FLOORS.find(floor => floor.id === selectedFloor).initial;
        render();
        return;
      }
      const roomTarget = event.target.closest('[data-room]');
      if (roomTarget) {
        const canvas = document.getElementById('venue-map-canvas');
        const scrollLeft = canvas.scrollLeft;
        selectedRoom = roomTarget.dataset.room;
        render();
        canvas.scrollLeft = scrollLeft;
        if (window.matchMedia('(max-width: 767px)').matches) {
          document.getElementById('venue-map-details').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }
      const sessionButton = event.target.closest('[data-session]');
      if (sessionButton && window.openSessionModal) {
        const session = window.agendaData?.[Number(sessionButton.dataset.session)];
        if (!session) return;
        const list = window._sessionsList || (window._sessionsList = []);
        let index = list.indexOf(session);
        if (index < 0) index = list.push(session) - 1;
        window.openSessionModal(index);
      }
    });
    section.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-room]')) {
        event.preventDefault();
        event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    window.addEventListener('devfestlanguagechange', render);
    render();
    window.updateVenueMapRoute(typeof getRoute === 'function' ? getRoute() : 'home');
  });
})();
