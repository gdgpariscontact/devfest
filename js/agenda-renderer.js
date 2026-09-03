// Distinct vibrant room color palette (Blue, Red, Yellow, Emerald, Purple)
const TRACK_COLORS = {
  "Salle Keynote":     "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "Salle 1":     "bg-red-500/20 text-red-300 border-red-500/40",
  "Salle 2":     "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  "Salle 3": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  "Salle 4": "bg-purple-500/20 text-purple-300 border-purple-500/40",
  "All":               "bg-neutral-700/20 text-neutral-400 border-neutral-600/30"
};

// Card top-border accent colors (used as border-t-4)
const TRACK_BGS = {
  "Salle Keynote":     "bg-blue-600",
  "Salle 1":     "bg-red-600",
  "Salle 2":     "bg-yellow-600",
  "Salle 3": "bg-emerald-600",
  "Salle 4": "bg-purple-600",
  "All":               "bg-neutral-600"
};

// Track header gradient configs for Par Salle column headers
const TRACK_HEADER_STYLE = {
  "Salle Keynote":     { grad: 'from-blue-900/90 to-blue-800/50 border-blue-500/40',       text: 'text-blue-200',    icon: '🎤', dot: 'bg-blue-400' },
  "Salle 1":     { grad: 'from-red-900/90 to-red-800/50 border-red-500/40',         text: 'text-red-200',     icon: '💬', dot: 'bg-red-400' },
  "Salle 2":     { grad: 'from-yellow-900/90 to-yellow-800/50 border-yellow-500/40', text: 'text-yellow-200',  icon: '🗣️', dot: 'bg-yellow-400' },
  "Salle 3": { grad: 'from-emerald-900/90 to-emerald-800/50 border-emerald-500/40',text: 'text-emerald-200',icon: '🔨', dot: 'bg-emerald-400' },
  "Salle 4": { grad: 'from-purple-900/90 to-purple-800/50 border-purple-500/40', text: 'text-purple-200', icon: '⚙️', dot: 'bg-purple-400' },
};

const TRACKS_ORDER = [
  "Salle Keynote",
  "Salle 1",
  "Salle 2",
  "Salle 3",
  "Salle 4"
];

let currentAgendaView = 'time'; // 'time' or 'track'
// Multiselect sets — empty = no filter (show all)
let activeTypeFilters = new Set();
let activeTrackFilters = new Set();
let activeTopicFilters = new Set();

function resolveSpeakerAvatar(avatar) {
  if (!avatar || !avatar.startsWith('images/')) return avatar;
  return window.location.protocol === 'file:' ? avatar : `/${avatar}`;
}

function agendaCopy() {
  const language = document.documentElement.lang || 'fr';
  const translations = language === 'en' ? window.translations_en : window.translations_fr;
  return translations?.agenda || {};
}

function agendaText(key, fallback) {
  return agendaCopy()[key] || fallback;
}

function localizedTrackName(track) {
  if ((document.documentElement.lang || 'fr') !== 'en') return track;
  const names = {
    'Salle Keynote': 'Keynote Room',
    'Salle 1': 'Salle 1',
    'Salle 2': 'Salle 2',
    'Salle 3': 'Salle 3',
    'Salle 4': 'Salle 4',
    'All': 'All rooms'
  };
  return names[track] || track;
}

function localizedBreakTitle(session) {
  if (session.timeStart === '12:45') return agendaText('lunch_break', 'Lunch Break');
  if (session.timeStart === '15:25') return agendaText('coffee_break', 'Coffee Break');
  return agendaText('transition_break', 'Transition Break');
}

// Chip colors — matches active state per chip value
const CHIP_ACTIVE_CLASSES = {
    'Keynote':           'bg-blue-500/30 text-blue-200 border-blue-500/60 shadow-blue-500/20 shadow-sm',
    'Conference':        'bg-red-500/30 text-red-200 border-red-500/60 shadow-red-500/20 shadow-sm',
    'Quick Talk':        'bg-yellow-500/30 text-yellow-200 border-yellow-500/60 shadow-yellow-500/20 shadow-sm',
    'Workshop':          'bg-green-500/30 text-green-200 border-green-500/60 shadow-green-500/20 shadow-sm',
    'Salle Keynote':     'bg-blue-500/30 text-blue-200 border-blue-500/60 shadow-blue-500/20 shadow-sm',
    'Salle 1':     'bg-red-500/30 text-red-200 border-red-500/60 shadow-red-500/20 shadow-sm',
    'Salle 2':     'bg-yellow-500/30 text-yellow-200 border-yellow-500/60 shadow-yellow-500/20 shadow-sm',
    'Salle 3': 'bg-green-500/30 text-green-200 border-green-500/60 shadow-green-500/20 shadow-sm',
    'Salle 4': 'bg-purple-500/30 text-purple-200 border-purple-500/60 shadow-purple-500/20 shadow-sm',
    'AI & Data':         'bg-orange-500/30 text-orange-200 border-orange-500/60 shadow-orange-500/20 shadow-sm',
    'Cloud & DevSecOps': 'bg-sky-500/30 text-sky-200 border-sky-500/60 shadow-sky-500/20 shadow-sm',
    'Frontend':          'bg-pink-500/30 text-pink-200 border-pink-500/60 shadow-pink-500/20 shadow-sm',
    'Backend':           'bg-amber-500/30 text-amber-200 border-amber-500/60 shadow-amber-500/20 shadow-sm',
    'Mobile':            'bg-purple-500/30 text-purple-200 border-purple-500/60 shadow-purple-500/20 shadow-sm',
    'Architecture':      'bg-emerald-500/30 text-emerald-200 border-emerald-500/60 shadow-emerald-500/20 shadow-sm',
};
const CHIP_INACTIVE = 'bg-white/5 text-white/60 border-white/10';

function focusAgendaSection() {
  const agendaSection = document.getElementById('agenda');
  if (!agendaSection) return;
  agendaSection.style.scrollMarginTop = '5rem';
  agendaSection.scrollIntoView({ behavior: 'auto', block: 'start' });
}

window.toggleFilterChip = function(btn, filterType, value) {
    const set = filterType === 'type'
      ? activeTypeFilters
      : filterType === 'track'
        ? activeTrackFilters
        : activeTopicFilters;

    if (set.has(value)) {
        set.delete(value);
        btn.className = `filter-chip px-3 py-1 rounded-full text-xs font-bold border transition-all ${CHIP_INACTIVE}`;
    } else {
        set.add(value);
        btn.className = `filter-chip px-3 py-1 rounded-full text-xs font-bold border transition-all ${CHIP_ACTIVE_CLASSES[value] || CHIP_INACTIVE}`;
    }

    renderAgenda();
    if (window.lucide) lucide.createIcons();
    focusAgendaSection();
};

function sessionTopics(session) {
  if (Array.isArray(session.topics)) return session.topics;

  const content = [session.title, session.description, session.type]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
  const topics = [];
  if (/\b(ai|ia|llm|machine learning|ml|data|donn[ée]es?|pytorch|langchain|vertex)\b/.test(content)) topics.push('AI & Data');
  if (/\b(cloud|devops|devsecops|gitops|kubernetes|docker|aws|gcp|azure|ci\/?cd|infra|security|s[ée]curit[ée])\b/.test(content)) topics.push('Cloud & DevSecOps');
  if (/\b(frontend|front-end|javascript|typescript|react|angular|vue|css|html|web|ui|ux|browser|bundler)\b/.test(content)) topics.push('Frontend');
  if (/\b(backend|back-end|java|spring|node(?:js)?|api|database|kotlin|server)\b/.test(content)) topics.push('Backend');
  if (/\b(mobile|android|ios|flutter|react native)\b/.test(content)) topics.push('Mobile');
  if (/\b(architecture|architectur|design pattern|system design|conception)\b/.test(content)) topics.push('Architecture');
  return topics;
}

function getFilteredData() {
    const data = window.agendaData || [];
    return data.filter(session => {
        if (session.type === 'Break') return true;
        const matchType  = activeTypeFilters.size  === 0 || activeTypeFilters.has(session.type);
        const matchTrack = activeTrackFilters.size === 0 || activeTrackFilters.has(session.track);
        const matchTopic = activeTopicFilters.size === 0 || sessionTopics(session).some(topic => activeTopicFilters.has(topic));
        return matchType && matchTrack && matchTopic;
    });
}

function renderAgenda() {
  const container = document.getElementById('agenda-container');
  if (!container) return;

  // Reset session registry on each render
  window._sessionsList = [];

  const data = getFilteredData();

  if (currentAgendaView === 'time') {
    container.innerHTML = renderByTime(data);
  } else {
    container.innerHTML = renderByTrack(data);
    initTrackScrollControls();
  }
}


// Store rendered sessions for modal access
window._sessionsList = [];

function renderSessionCard(session, showTrack = true, isParSalle = false) {
  const colorClasses = TRACK_COLORS[session.track] || TRACK_COLORS['All'];
  const langBadge = session.lang === 'en'
    ? `<span class="inline-flex items-center justify-center bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded border border-indigo-500/30">🇬🇧 EN</span>`
    : '';

  // Register this session and get its index
  let sessionIndex = window._sessionsList.findIndex(s => s === session);
  if (sessionIndex === -1) {
    sessionIndex = window._sessionsList.length;
    window._sessionsList.push(session);
  }

  // Render speakers (compact, clickable)
  let speakersHtml = '';
  if (session.speakers && session.speakers.length > 0) {
    speakersHtml = `<div class="mt-auto pt-2 border-t border-white/5 flex flex-col gap-1 shrink-0">`;
    session.speakers.forEach(speaker => {
      const company = window.speakerProfiles?.[speaker.name]?.company || speaker.role;
      const avatarSrc = resolveSpeakerAvatar(window.speakerProfiles?.[speaker.name]?.avatar || speaker.avatar);
      const avatar = avatarSrc
        ? `<img src="${avatarSrc}" alt="${speaker.name}" class="w-full h-full object-cover">`
        : `<i data-lucide="user" class="w-3.5 h-3.5 m-1 text-white/50"></i>`;
      speakersHtml += `
        <button onclick="event.stopPropagation(); openSpeakerByName('${speaker.name.replace(/'/g, "\\'")}')"
          class="flex items-center gap-2 group/sp hover:bg-white/5 rounded-lg px-1.5 py-0.5 transition-colors text-left w-full">
          <div class="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0">${avatar}</div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-xs font-bold text-white group-hover/sp:text-amber-400 transition-colors truncate">${speaker.name}</span>
            ${company ? `<span class="text-[10px] text-white/40 truncate">${company}</span>` : ''}
          </div>
          <i data-lucide="chevron-right" class="w-3 h-3 text-white/20 group-hover/sp:text-amber-400 ml-auto transition-colors shrink-0"></i>
        </button>`;
    });
    speakersHtml += `</div>`;
  }

  // Break cards (non-clickable)
  if (session.type === 'Break') {
    return `
      <div class="glass-panel p-4 rounded-xl border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorClasses} text-sm font-bold w-fit">
          <i data-lucide="coffee" class="w-4 h-4"></i> ${session.timeLabel}
        </div>
        <h4 class="text-lg font-bold text-white/80">${localizedBreakTitle(session)}</h4>
      </div>`;
  }

  const borderColor = TRACK_BGS[session.track]?.replace('bg-', 'border-') || 'border-white/10';

  // Duration alignment & fixed height classes for Par Salle grid
  let heightClass = 'h-full';
  let durationBadge = '';
  if (isParSalle) {
    if (session.type === 'Workshop') {
      if (session.timeLabel.includes('12:15') || session.timeLabel.includes('03:25')) {
        heightClass = 'min-h-[450px] max-h-[450px] shrink-0'; // Double talk slot + transition (220 + 10 + 220)
        durationBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">⏳ 1h40</span>`;
      } else {
        heightClass = 'min-h-[370px] max-h-[370px] shrink-0'; // Talk slot + transition + Quick Talk (220 + 10 + 140)
        durationBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">⏳ 1h15</span>`;
      }
    } else if (session.type === 'Conference' || session.type === 'Keynote') {
      heightClass = 'min-h-[220px] max-h-[220px] shrink-0';
      durationBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px] font-bold border border-white/10">⏳ 45 min</span>`;
    } else if (session.type === 'Quick Talk') {
      heightClass = 'min-h-[140px] max-h-[140px] shrink-0';
      durationBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold border border-yellow-500/30">⚡ 20 min</span>`;
    }
  }

  return `
    <div onclick="openSessionModal(${sessionIndex})"
      class="glass-panel p-5 rounded-2xl border-t-4 ${borderColor} hover:bg-white/5 hover:scale-[1.01] transition-all cursor-pointer relative flex flex-col ${heightClass} shadow-lg shadow-black/20 group overflow-hidden">

      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="text-white/30 text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          ${agendaText('details', 'Détails')}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 mb-2 shrink-0">
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 text-[11px] font-bold border border-white/10">
          <i data-lucide="clock" class="w-3 h-3"></i> ${session.timeLabel}
        </span>
        ${showTrack ? `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${colorClasses} text-[11px] font-bold border">
            <i data-lucide="map-pin" class="w-3 h-3"></i> ${localizedTrackName(session.track)}
          </span>` : ''}
        ${durationBadge}
        ${langBadge}
      </div>

      <h4 class="text-lg font-bold text-white mb-2 leading-snug line-clamp-2 shrink-0">${session.title}</h4>

      <div class="mt-auto shrink-0">
        <span class="text-xs text-brand-copper font-medium flex items-center gap-1.5 mb-1">
          <i data-lucide="tag" class="w-3 h-3"></i> ${session.type}
        </span>
        ${speakersHtml}
      </div>
    </div>`;
}

// ─── Session Modal ─────────────────────────────────────────────────────────────

function ensureSessionModal() {
  if (document.getElementById('session-modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'session-modal-overlay';
  overlay.className = 'fixed inset-0 z-[190] flex items-end sm:items-center justify-center p-0 sm:p-6 opacity-0 pointer-events-none transition-opacity duration-300';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.backdropFilter = 'blur(10px)';

  overlay.innerHTML = `
    <div id="session-modal"
      class="relative w-full sm:max-w-xl max-h-[92vh] bg-[#0f0f0f] border border-white/10 sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col transform translate-y-8 sm:scale-95 transition-all duration-300">

      <!-- Close -->
      <button onclick="closeSessionModal()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
        <i data-lucide="x" class="w-4 h-4 text-white"></i>
      </button>

      <!-- Coloured header band -->
      <div id="session-modal-header" class="px-8 pt-10 pb-6 shrink-0" style="background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, #0a0a0a 100%);">
        <div class="flex flex-wrap gap-2 mb-4" id="session-modal-badges"></div>
        <h2 id="session-modal-title" class="text-2xl font-display font-black text-white leading-snug"></h2>
      </div>

      <!-- Scrollable body -->
      <div class="overflow-y-auto flex-1 px-8 py-6 space-y-6">

        <!-- Speakers -->
        <div id="session-modal-speakers-block">
          <h4 class="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">${agendaText('speakers', 'Speaker(s)')}</h4>
          <div id="session-modal-speakers" class="space-y-3"></div>
        </div>

        <!-- Description -->
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">${agendaText('description', 'Description')}</h4>
          <p id="session-modal-desc" class="text-slate-300 text-sm leading-relaxed"></p>
        </div>

      </div>
    </div>`;

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSessionModal();
  });

  document.body.appendChild(overlay);
  if (window.lucide) lucide.createIcons();
}

window.openSessionModal = function(index) {
  ensureSessionModal();
  const session = window._sessionsList[index];
  if (!session) return;

  // Build badge row
  const trackColor = TRACK_COLORS[session.track] || TRACK_COLORS['All'];
  const trackBg = TRACK_BGS[session.track] || 'bg-gray-600';
  const langBadge = session.lang === 'en'
    ? `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">🇬🇧 EN</span>`
    : `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/20">🇫🇷 FR</span>`;

  document.getElementById('session-modal-badges').innerHTML = `
    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs font-bold border border-white/10">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      ${session.timeLabel}
    </span>
    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full ${trackColor} text-xs font-bold border">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      ${localizedTrackName(session.track)}
    </span>
    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">${session.type}</span>
    ${langBadge}`;

  // Title
  document.getElementById('session-modal-title').textContent = session.title;

  // Description — placeholder until real content is added
  document.getElementById('session-modal-desc').textContent =
    session.description ||
    agendaText('session_details', 'Les détails complets de cette session seront disponibles prochainement. Retrouvez "{title}" le 27 novembre 2026 à La Fabrique de la Connaissance, Nanterre.')
      .replace('{title}', session.title);

  // Speakers
  const speakersEl = document.getElementById('session-modal-speakers');
  const speakersBlock = document.getElementById('session-modal-speakers-block');

  if (session.speakers && session.speakers.length > 0) {
    speakersBlock.classList.remove('hidden');
    speakersEl.innerHTML = session.speakers.map(sp => {
      const avatarSrc = resolveSpeakerAvatar(window.speakerProfiles?.[sp.name]?.avatar || sp.avatar);
      const avatar = avatarSrc
        ? `<img src="${avatarSrc}" alt="${sp.name}" class="w-full h-full object-cover">`
        : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(sp.name)}&background=1a1209&color=C8943E&bold=true&size=80" alt="${sp.name}" class="w-full h-full object-cover">`;
      return `
        <button onclick="openSpeakerByName('${sp.name.replace(/'/g, "\\'")}')"
          class="w-full flex items-center gap-4 glass-panel p-4 rounded-2xl hover:bg-white/5 hover:border-amber-500/30 border border-white/5 transition-all group/speaker text-left">
          <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-black/50">${avatar}</div>
          <div class="flex-1">
            <p class="font-bold text-white group-hover/speaker:text-amber-400 transition-colors">${sp.name}</p>
            ${sp.role ? `<p class="text-xs text-white/50 mt-0.5">${sp.role}</p>` : ''}
          </div>
          <svg class="w-4 h-4 text-white/20 group-hover/speaker:text-amber-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </button>`;
    }).join('');
  } else {
    speakersBlock.classList.add('hidden');
  }

  // Gradient accent color based on track
  const accentMap = {
    'Salle Keynote': '#b45309', 'Salle 1': '#c2410c',
    'Salle 2': '#a16207', 'Salle 3': '#78716c', 'Salle 4': '#991b1b'
  };
  const accent = accentMap[session.track] || '#b45309';
  document.getElementById('session-modal-header').style.background =
    `linear-gradient(135deg, ${accent}22 0%, #0a0a0a 100%)`;

  // Show
  const overlay = document.getElementById('session-modal-overlay');
  const modal = document.getElementById('session-modal');
  overlay.style.pointerEvents = 'all';
  overlay.style.opacity = '1';
  modal.style.transform = 'translateY(0) scale(1)';
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
};

window.closeSessionModal = function() {
  const overlay = document.getElementById('session-modal-overlay');
  const modal = document.getElementById('session-modal');
  if (!overlay) return;
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  modal.style.transform = window.innerWidth < 640 ? 'translateY(32px)' : 'scale(0.95)';
  document.body.style.overflow = '';
};

// Open a session from its card in a speaker profile.
window.openSessionFromSpeaker = function(title, timeStart) {
  const session = (window.agendaData || []).find(item =>
    item.title === title && item.timeStart === timeStart
  );
  if (!session) return;

  const sessions = window._sessionsList || [];
  let index = sessions.findIndex(item => item.title === session.title && item.timeStart === session.timeStart);
  if (index === -1) {
    sessions.push(session);
    index = sessions.length - 1;
    window._sessionsList = sessions;
  }

  window.closeSpeakerModal?.();
  window.openSessionModal(index);
};

// Open speaker modal by name (bridge between session modal and speaker modal)
window.openSpeakerByName = function(name) {
  const speakers = window._speakersList;
  if (!speakers) return;
  const idx = speakers.findIndex(s => s.name === name);
  if (idx !== -1) {
    closeSessionModal();
    setTimeout(() => {
      if (window.openSpeakerModal) window.openSpeakerModal(idx);
    }, 250);
  }
};


function renderByTime(data) {
  // Group by START TIME only (e.g. "10:35 AM") so sessions starting at the same time share 1 timeline node
  const timeSlots = [];
  data.forEach(session => {
    const startTime = session.timeLabel ? session.timeLabel.split(' - ')[0] : session.timeStart;
    let slot = timeSlots.find(s => s.startTime === startTime);
    if (!slot) {
      slot = { startTime, sessions: [] };
      timeSlots.push(slot);
    }
    slot.sessions.push(session);
  });

  let html = `<div class="flex flex-col gap-10">`;

  timeSlots.forEach(slot => {
    const isKeynoteSlot = slot.sessions.some(s => s.type === 'Keynote');

    html += `<div class="relative pl-4 md:pl-8 border-l-2 ${isKeynoteSlot ? 'border-amber-500/50' : 'border-white/10'}">`;
    html += `<div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${isKeynoteSlot ? 'bg-amber-400 ring-4 ring-amber-500/20' : 'bg-amber-500'} border-4 border-[#0a0a0a]"></div>`;

    if (isKeynoteSlot) {
      html += `
        <div class="flex items-center gap-2 mb-4 sticky top-20 bg-[#0a0a0a]/90 backdrop-blur z-10 py-2 inline-flex rounded-lg pr-4">
          <h3 class="text-2xl font-bold text-amber-400">${slot.startTime}</h3>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
            <span>👑</span> ${agendaText('opening', 'Keynotes & Ouverture')}
          </span>
        </div>`;
    } else {
      html += `<h3 class="text-2xl font-bold text-amber-400 mb-6 sticky top-20 bg-[#0a0a0a]/80 backdrop-blur z-10 py-2 inline-block rounded-lg pr-4">${slot.startTime}</h3>`;
    }

    // Single session in time slot (Keynote, Break, Closing) -> Render full width
    if (slot.sessions.length === 1) {
      html += `<div class="w-full">`;
      html += renderSessionCard(slot.sessions[0], true);
      html += `</div>`;
    } else {
      // Grid for multiple parallel sessions starting at the same time
      html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
      slot.sessions.forEach(session => {
        html += renderSessionCard(session, true);
      });
      html += `</div>`;
    }
    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

function renderBreakBanner(breakSession, icon, label, sub) {
  return `
    <div class="glass-panel px-6 py-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-black/60 flex items-center justify-between gap-4 shadow-lg my-2">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base">
          ${icon}
        </div>
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            ${breakSession.timeLabel}
          </span>
          <span class="text-base font-bold text-white ml-2">${label}</span>
        </div>
      </div>
      <span class="text-xs font-bold text-amber-300/80 uppercase tracking-wider hidden sm:inline">${sub}</span>
    </div>
  `;
}

function renderParallelBlock(blockSessions) {
  let html = `
    <div class="relative group">
      <!-- Clickable Left Scroll Arrow Button -->
      <button class="track-scroll-left-btn absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/90 border border-white/20 text-amber-400 shadow-2xl flex items-center justify-center transition-all duration-300 opacity-0 pointer-events-none hover:scale-110 hover:bg-black active:scale-95">
        <i data-lucide="chevron-left" class="w-6 h-6"></i>
      </button>

      <!-- Clickable Right Scroll Arrow Button -->
      <button class="track-scroll-right-btn absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/90 border border-white/20 text-amber-400 shadow-2xl flex items-center justify-center transition-all duration-300 opacity-100 pointer-events-auto hover:scale-110 hover:bg-black active:scale-95 animate-pulse">
        <i data-lucide="chevron-right" class="w-6 h-6"></i>
      </button>

      <!-- Simple scroll hint bar (fades out on scroll) -->
      <div class="flex items-center justify-end text-xs mb-2 px-1">
        <span class="track-scroll-hint-text flex items-center gap-1.5 text-amber-400 font-bold text-xs transition-all duration-300">
          ${agendaText('scroll_hint', 'Glisser pour voir toutes les salles')} <i data-lucide="arrow-right" class="w-4 h-4 animate-pulse"></i>
        </span>
      </div>

      <div class="track-scroll-box flex overflow-x-auto pb-6 snap-x snap-mandatory gap-5 hide-scrollbar relative z-10" style="scroll-padding: 1rem;" onscroll="handleTrackScroll(this)">
  `;

  TRACKS_ORDER.forEach(track => {
    if (activeTrackFilters.size > 0 && !activeTrackFilters.has(track)) return;

    const trackSessions = blockSessions.filter(s => s.track === track);
    if (trackSessions.length === 0) return;

    const hs = TRACK_HEADER_STYLE[track] || { grad: 'from-stone-800 to-stone-700 border-white/10', text: 'text-stone-200', icon: '📍', dot: 'bg-stone-400' };
    const shortName = localizedTrackName(track);

    html += `
      <div class="min-w-[300px] max-w-[380px] flex-1 flex flex-col gap-2.5 snap-start">
        <div class="bg-gradient-to-br ${hs.grad} border rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
          <span class="text-base">${hs.icon}</span>
          <div>
            <p class="text-[9px] font-bold uppercase tracking-widest text-white/40">${agendaText('room', 'Salle')}</p>
            <p class="font-display font-black text-base leading-tight ${hs.text}">${shortName}</p>
          </div>
          <span class="ml-auto w-2 h-2 rounded-full ${hs.dot} shadow-sm"></span>
        </div>
        <div class="flex flex-col gap-2.5">
    `;

    trackSessions.forEach(session => {
      html += renderSessionCard(session, false, true);
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;
  return html;
}

function renderByTrack(data) {
  let html = `<div class="flex flex-col gap-8">`;

  // 1. Morning Opening Keynotes block (09:20 AM - 10:25 AM)
  const openingKeynotes = data.filter(s => s.type === 'Keynote' && s.title !== 'Closing' && s.timeStart < '10:25');
  if (openingKeynotes.length > 0 && (activeTrackFilters.size === 0 || activeTrackFilters.has('Salle Keynote'))) {
    html += `
      <div class="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-amber-950/20 to-black/60 shadow-xl">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">👑</div>
            <div>
              <h3 class="text-xl font-bold font-display text-white">${agendaText('opening', 'Keynotes & Ouverture')} (${agendaText('main_hall', 'Main Hall')})</h3>
              <p class="text-xs text-amber-300/80">${agendaText('opening_sessions', 'Sessions Plénières')} • 09:20 AM - 10:25 AM</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">${agendaText('opening_tag', 'Ouverture')}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    `;
    openingKeynotes.forEach(session => { html += renderSessionCard(session, false); });
    html += `</div></div>`;
  }

  // 2. Morning Transition Break (10:25 AM - 10:35 AM)
  const transition1 = data.find(s => s.timeStart === '10:25' && s.type === 'Break');
  if (transition1) {
    html += renderBreakBanner(transition1, "☕", agendaText('transition_break', 'Transition Break'), agendaText('transition_detail', 'Pause & installation dans les salles'));
  }

  // 3. Morning Parallel Block (10:35 AM - 12:45 PM)
  const morningParallel = data.filter(s => s.type !== 'Keynote' && s.type !== 'Break' && s.timeStart >= '10:35' && s.timeStart < '12:45');
  if (morningParallel.length > 0) {
    html += renderParallelBlock(morningParallel);
  }

  // 4. Lunch Break (12:45 PM - 01:45 PM)
  const lunchBreak = data.find(s => (s.timeStart === '12:45' || s.title.toLowerCase().includes('lunch')) && s.type === 'Break');
  if (lunchBreak) {
    html += renderBreakBanner(lunchBreak, "🍱", agendaText('lunch_break', 'Lunch Break'), agendaText('lunch_detail', 'Pause Déjeuner (1 Heure)'));
  }

  // 5. Afternoon Parallel Block Part 1 (01:45 PM - 03:25 PM)
  const afternoonParallel1 = data.filter(s => s.type !== 'Keynote' && s.type !== 'Break' && s.timeStart >= '13:45' && s.timeStart < '15:25');
  if (afternoonParallel1.length > 0) {
    html += renderParallelBlock(afternoonParallel1);
  }

  // 6. Coffee Break (03:25 PM - 03:45 PM)
  const coffeeBreak = data.find(s => (s.timeStart === '15:25' || s.title.toLowerCase().includes('coffee')) && s.type === 'Break');
  if (coffeeBreak) {
    html += renderBreakBanner(coffeeBreak, "☕", agendaText('coffee_break', 'Coffee Break'), agendaText('coffee_detail', 'Pause Café (20 min)'));
  }

  // 7. Afternoon Parallel Block Part 2 (03:45 PM - 05:00 PM)
  const afternoonParallel2 = data.filter(s => s.type !== 'Keynote' && s.type !== 'Break' && s.timeStart >= '15:45' && s.timeStart < '17:00');
  if (afternoonParallel2.length > 0) {
    html += renderParallelBlock(afternoonParallel2);
  }

  // 8. Closing Plenary block (05:00 PM - 05:30 PM)
  const closingSessions = data.filter(s => s.title === 'Closing' || (s.type === 'Keynote' && s.timeStart >= '16:00'));
  if (closingSessions.length > 0 && (activeTrackFilters.size === 0 || activeTrackFilters.has('Salle Keynote'))) {
    html += `
      <div class="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 shadow-xl">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">🎉</div>
            <div>
              <h3 class="text-xl font-bold font-display text-white">${agendaText('closing', 'Clôture du DevFest')} (${agendaText('main_hall', 'Main Hall')})</h3>
              <p class="text-xs text-amber-300/80">${agendaText('closing_sessions', 'Session de fin')} • 05:00 PM - 05:30 PM</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">${agendaText('closing_tag', 'Clôture')}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    `;
    closingSessions.forEach(session => { html += renderSessionCard(session, false); });
    html += `</div></div>`;
  }

  // Accepted talks without a published room/time assignment
  const unscheduled = data.filter(s => s.timeStart === '99:00');
  if (unscheduled.length > 0) {
    html += `<div class="glass-panel p-6 rounded-3xl border border-white/10"><h3 class="text-xl font-bold font-display text-white mb-4">${agendaText('schedule_tba', 'Schedule TBA')}</h3><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
    unscheduled.forEach(session => { html += renderSessionCard(session, false); });
    html += `</div></div>`;
  }

  html += `</div>`;
  return html;
}

window.handleTrackScroll = function(el) {
  if (!el) return;
  const parent = el.closest('.relative');
  if (!parent) return;

  const leftBtn = parent.querySelector('.track-scroll-left-btn');
  const rightBtn = parent.querySelector('.track-scroll-right-btn');
  const hint = parent.querySelector('.track-scroll-hint-text');

  const scrollLeft = el.scrollLeft;
  const maxScroll = el.scrollWidth - el.clientWidth;

  if (leftBtn) {
    if (scrollLeft > 15) {
      leftBtn.style.opacity = '1';
      leftBtn.style.pointerEvents = 'auto';
    } else {
      leftBtn.style.opacity = '0';
      leftBtn.style.pointerEvents = 'none';
    }
  }

  if (rightBtn) {
    if (scrollLeft < maxScroll - 15) {
      rightBtn.style.opacity = '1';
      rightBtn.style.pointerEvents = 'auto';
    } else {
      rightBtn.style.opacity = '0';
      rightBtn.style.pointerEvents = 'none';
    }
  }

  if (hint) {
    if (scrollLeft > 5) {
      hint.style.opacity = '0';
      hint.style.visibility = 'hidden';
      hint.style.pointerEvents = 'none';
    } else {
      hint.style.opacity = '1';
      hint.style.visibility = 'visible';
      hint.style.pointerEvents = 'auto';
    }
  }
};

function initTrackScrollControls() {
  document.querySelectorAll('.track-scroll-box').forEach(el => {
    const parent = el.closest('.relative');
    if (!parent) return;

    const leftBtn = parent.querySelector('.track-scroll-left-btn');
    const rightBtn = parent.querySelector('.track-scroll-right-btn');

    if (leftBtn) {
      leftBtn.onclick = () => {
        el.scrollBy({ left: -320, behavior: 'smooth' });
        setTimeout(() => window.handleTrackScroll(el), 150);
      };
    }

    if (rightBtn) {
      rightBtn.onclick = () => {
        el.scrollBy({ left: 320, behavior: 'smooth' });
        setTimeout(() => window.handleTrackScroll(el), 150);
      };
    }

    window.handleTrackScroll(el);
  });

  if (window.lucide) lucide.createIcons();
}

window.toggleAgendaView = function(view) {
  currentAgendaView = view;
  
  // Update toggle buttons UI
  document.querySelectorAll('.agenda-toggle-btn').forEach(btn => {
    if (btn.dataset.view === view) {
      btn.classList.add('bg-white', 'text-slate-900', 'shadow-md');
      btn.classList.remove('text-white', 'hover:bg-white/10');
    } else {
      btn.classList.remove('bg-white', 'text-slate-900', 'shadow-md');
      btn.classList.add('text-white', 'hover:bg-white/10');
    }
  });

  renderAgenda();
  if (window.lucide) lucide.createIcons();

  // Smooth scroll up to top of Agenda section
  const agendaSection = document.getElementById('agenda');
  if (agendaSection) {
    focusAgendaSection();
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderAgenda();
    if (window.lucide) lucide.createIcons();
  }, 100);

  // Scroll-hide logic for the Agenda title row
  const agendaSection = document.getElementById('agenda');
  const titleRow = document.getElementById('agenda-title-row');

  if (agendaSection && titleRow) {
    let titleHidden = false;

    window.addEventListener('scroll', () => {
      const agendaTop = agendaSection.getBoundingClientRect().top;
      // Once the section has scrolled 80px above the viewport top, collapse the title
      const shouldHide = agendaTop < -80;

      if (shouldHide && !titleHidden) {
        titleHidden = true;
        titleRow.style.maxHeight = '0px';
        titleRow.style.opacity = '0';
        titleRow.style.paddingTop = '0';
        titleRow.style.paddingBottom = '0';
      } else if (!shouldHide && titleHidden) {
        titleHidden = false;
        titleRow.style.maxHeight = '80px';
        titleRow.style.opacity = '1';
      }
    }, { passive: true });
  }
});

window.addEventListener('devfestlanguagechange', () => {
  renderAgenda();
  if (window.lucide) lucide.createIcons();
});

// Escape closes session modal too
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    window.closeSessionModal?.();
  }
});
