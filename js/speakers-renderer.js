// Color themes per index
const SPEAKER_COLORS = [
    { border: 'hover:border-amber-500/40', text: 'text-amber-400', glow: 'from-amber-500/40 via-transparent to-amber-500/40', active: 'border-amber-500/40 bg-amber-500/5', accent: '#f59e0b' },
    { border: 'hover:border-red-500/40',   text: 'text-red-400',   glow: 'from-red-500/40 via-transparent to-red-500/40',   active: 'border-red-500/40 bg-red-500/5',   accent: '#ef4444' },
    { border: 'hover:border-blue-500/40',  text: 'text-blue-400',  glow: 'from-blue-500/40 via-transparent to-blue-500/40',  active: 'border-blue-500/40 bg-blue-500/5',  accent: '#3b82f6' },
    { border: 'hover:border-green-500/40', text: 'text-green-400', glow: 'from-green-500/40 via-transparent to-green-500/40',active: 'border-green-500/40 bg-green-500/5', accent: '#22c55e' },
    { border: 'hover:border-purple-500/40',text: 'text-purple-400',glow: 'from-purple-500/40 via-transparent to-purple-500/40',active:'border-purple-500/40 bg-purple-500/5',accent: '#a855f7' },
];

const TRACK_COLORS_MAP = {
    'Salle Keynote':    { text: 'text-blue-400',   bg: 'bg-blue-500/20 border-blue-500/30' },
    'Salle 1':    { text: 'text-red-400',    bg: 'bg-red-500/20 border-red-500/30' },
    'Salle 2':    { text: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
    'Salle 3':{ text: 'text-green-400',  bg: 'bg-green-500/20 border-green-500/30' },
    'Salle 4':{ text: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
};

function resolveSpeakerAvatar(avatar) {
    if (!avatar || !avatar.startsWith('images/')) return avatar;
    return window.location.protocol === 'file:' ? avatar : `/${avatar}`;
}

function buildSpeakerList() {
    const data = window.agendaData || [];
    const profiles = window.speakerProfiles || {};
    const language = document.documentElement.lang || 'fr';
    const map = new Map();

    data.forEach(session => {
        if (!session.speakers || session.speakers.length === 0) return;
        session.speakers.forEach(sp => {
            if (!map.has(sp.name)) {
                const profile = profiles[sp.name] || {};
                map.set(sp.name, {
                    name: sp.name,
                    role: sp.role || profile.company || '',
                    position: profile.position || sp.role || '',
                    company: profile.company || sp.role || '',
                    bio: (language === 'en' ? profile.bioEn : profile.bioFr) || profile.bio || '',
                    twitter: profile.twitter || '',
                    linkedin: profile.linkedin || '',
                    github: profile.github || '',
                    avatar: resolveSpeakerAvatar(profile.avatar || sp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sp.name)}&background=1a1209&color=C8943E&bold=true&size=200`),
                    sessions: [session]
                });
            } else {
                map.get(sp.name).sessions.push(session);
            }
        });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function renderSpeakers() {
    const container = document.getElementById('speakers-container');
    if (!container) return;

    const speakers = buildSpeakerList();
    let html = '';

    speakers.forEach((speaker, i) => {
        const c = SPEAKER_COLORS[i % SPEAKER_COLORS.length];
        const firstSession = speaker.sessions[0];
        const sessionTitle = speaker.sessions.map(s => s.title).join(' • ');

        html += `
        <div onclick="openSpeakerModal(${i})"
            class="glass-panel p-8 rounded-[2.5rem] border border-white/5 text-center group cursor-pointer ${c.border} transition-all duration-500 relative overflow-hidden flex flex-col items-center hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40"
            data-speaker-index="${i}">

            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div class="w-32 h-32 rounded-full mx-auto mb-5 p-1 bg-gradient-to-tr ${c.glow} group-hover:scale-110 transition-transform duration-500">
                <div class="w-full h-full rounded-full overflow-hidden border-2 border-white/10 bg-black/50">
                    <img src="${speaker.avatar}" alt="${speaker.name}"
                        class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=1a1209&color=C8943E&bold=true&size=200'">
                </div>
            </div>

            <h3 class="text-xl font-bold text-white mb-1 relative z-10 group-hover:${c.text} transition-colors">${speaker.name}</h3>
            <p class="${c.text} text-xs font-black uppercase tracking-widest mb-1 relative z-10">${speaker.position}</p>
            <p class="text-white/40 text-xs mb-4 relative z-10">${speaker.company}</p>

            <div class="mt-auto border-t border-white/5 pt-4 w-full">
                <p class="text-slate-400 text-xs leading-relaxed italic line-clamp-2">"${sessionTitle}"</p>
            </div>

            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-white/30 text-xs flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    Voir profil
                </span>
            </div>
        </div>`;
    });

    // "Vous?" card
    html += `
    <div class="glass-panel p-8 rounded-[2.5rem] border-white/10 border-dashed text-center group cursor-pointer hover:bg-white/5 transition-all duration-500 opacity-70 flex flex-col justify-center items-center hover:opacity-100">
        <div class="w-32 h-32 rounded-full mx-auto mb-5 flex items-center justify-center bg-slate-900 border-2 border-dashed border-slate-700 group-hover:border-amber-400/50 group-hover:scale-105 transition-all">
            <i data-lucide="user-plus" class="w-10 h-10 text-slate-700 group-hover:text-amber-400 transition-colors"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-400 mb-1">Vous ?</h3>
        <p class="text-slate-500 text-xs font-medium mb-6">Proposez votre talk !</p>
        <a href="javascript:void(0)" onclick="event.stopPropagation(); if(window.scrollToSection) scrollToSection('cfp');"
            class="inline-block bg-amber-500/10 text-amber-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter hover:bg-amber-500 hover:text-black transition-all">
            Accéder au CFP
        </a>
    </div>`;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Store built speakers for modal access
    window._speakersList = speakers;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ensureSpeakerModal() {
    if (document.getElementById('speaker-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'speaker-modal-overlay';
    overlay.className = 'fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 opacity-0 pointer-events-none transition-opacity duration-300';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.backdropFilter = 'blur(12px)';
    overlay.innerHTML = `
        <div id="speaker-modal"
            class="relative w-full sm:max-w-2xl max-h-[92vh] bg-[#0f0f0f] border border-white/10 sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col transform translate-y-8 sm:translate-y-0 sm:scale-95 transition-all duration-300">

            <!-- Close -->
            <button onclick="closeSpeakerModal()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <i data-lucide="x" class="w-4 h-4 text-white"></i>
            </button>

            <!-- Header gradient -->
            <div id="modal-header-bg" class="h-48 sm:h-56 relative overflow-hidden bg-gradient-to-br from-amber-900/60 to-slate-900 shrink-0">
                <div class="absolute inset-0 flex items-end pb-6 px-8 gap-5">
                    <div id="modal-avatar-wrap" class="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500/60 via-transparent to-amber-500/60 shrink-0">
                        <div class="w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-black/60">
                            <img id="modal-avatar" src="" alt="" class="w-full h-full object-cover">
                        </div>
                    </div>
                    <div class="mb-1">
                        <h2 id="modal-name" class="text-2xl sm:text-3xl font-display font-black text-white leading-tight"></h2>
                        <p id="modal-position" class="text-amber-400 text-sm font-bold uppercase tracking-wider mt-0.5"></p>
                        <p id="modal-company" class="text-white/50 text-sm"></p>
                    </div>
                </div>
            </div>

            <!-- Body (scrollable) -->
            <div class="overflow-y-auto flex-1 px-8 py-6 space-y-6">

                <!-- Socials -->
                <div id="modal-socials" class="flex gap-3"></div>

                <!-- Bio -->
                <div id="modal-bio-block">
                    <h4 class="text-xs font-black uppercase tracking-widest text-white/30 mb-2">Bio</h4>
                    <p id="modal-bio" class="text-slate-300 text-sm leading-relaxed"></p>
                </div>

                <!-- Sessions -->
                <div id="modal-sessions-block">
                    <h4 class="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Sessions</h4>
                    <div id="modal-sessions" class="space-y-3"></div>
                </div>
            </div>
        </div>
    `;

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeSpeakerModal();
    });

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();
}

window.openSpeakerModal = function(index) {
    ensureSpeakerModal();
    const speakers = window._speakersList;
    if (!speakers || !speakers[index]) return;

    const sp = speakers[index];
    const c = SPEAKER_COLORS[index % SPEAKER_COLORS.length];

    // Populate header
    document.getElementById('modal-avatar').src = sp.avatar;
    document.getElementById('modal-avatar').alt = sp.name;
    document.getElementById('modal-name').textContent = sp.name;
    document.getElementById('modal-position').textContent = sp.position;
    document.getElementById('modal-company').textContent = sp.company;

    // Gradient color
    document.getElementById('modal-header-bg').style.background =
        `linear-gradient(135deg, ${c.accent}22 0%, #0a0a0a 100%)`;
    document.getElementById('modal-avatar-wrap').style.background =
        `linear-gradient(135deg, ${c.accent}80, transparent, ${c.accent}80)`;

    // Socials
    const socialsEl = document.getElementById('modal-socials');
    let socialsHtml = '';
    if (sp.twitter) socialsHtml += `<a href="${sp.twitter}" target="_blank" rel="noopener" class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-white/60 hover:text-blue-300 transition-all text-xs font-bold"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg> Twitter / X</a>`;
    if (sp.linkedin) socialsHtml += `<a href="${sp.linkedin}" target="_blank" rel="noopener" class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-600/30 text-white/60 hover:text-blue-400 transition-all text-xs font-bold"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> LinkedIn</a>`;
    if (sp.github) socialsHtml += `<a href="${sp.github}" target="_blank" rel="noopener" class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-slate-500/20 border border-white/10 hover:border-slate-400/30 text-white/60 hover:text-slate-300 transition-all text-xs font-bold"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> GitHub</a>`;
    socialsEl.innerHTML = socialsHtml || '<span class="text-white/20 text-xs">Pas de réseaux sociaux disponibles</span>';

    // Bio
    const bioEl = document.getElementById('modal-bio');
    const bioPanelEl = document.getElementById('modal-bio-block');
    if (sp.bio) {
        bioEl.textContent = sp.bio;
        bioPanelEl.classList.remove('hidden');
    } else {
        bioPanelEl.classList.add('hidden');
    }

    // Sessions
    const sessionsEl = document.getElementById('modal-sessions');
    sessionsEl.innerHTML = sp.sessions.map(s => {
        const tc = TRACK_COLORS_MAP[s.track] || { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
        const langBadge = s.lang === 'en' ? `<span class="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">🇬🇧 EN</span>` : '';
        const sessionTitle = JSON.stringify(s.title).replace(/"/g, '&quot;');
        return `
        <button type="button" onclick="openSessionFromSpeaker(${sessionTitle}, '${s.timeStart}')"
            class="glass-panel w-full p-5 rounded-2xl border border-white/5 text-left transition-all hover:border-amber-500/40 hover:bg-white/5 group/session">
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs font-bold border border-white/10">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    ${s.timeLabel}
                </span>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${tc.bg} ${tc.text}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    ${s.track}
                </span>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">${s.type}</span>
                ${langBadge}
            </div>
            <div class="flex items-start gap-3">
                <h5 class="flex-1 text-white font-bold text-sm leading-snug group-hover/session:text-amber-300 transition-colors">${s.title}</h5>
                <i data-lucide="arrow-up-right" class="w-4 h-4 shrink-0 text-white/25 group-hover/session:text-amber-300 transition-colors"></i>
            </div>
        </button>`;
    }).join('');

    // Show modal
    const overlay = document.getElementById('speaker-modal-overlay');
    const modal = document.getElementById('speaker-modal');
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
    modal.style.transform = 'translateY(0) scale(1)';
    document.body.style.overflow = 'hidden';
};

window.closeSpeakerModal = function() {
    const overlay = document.getElementById('speaker-modal-overlay');
    const modal = document.getElementById('speaker-modal');
    if (!overlay) return;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    modal.style.transform = window.innerWidth < 640 ? 'translateY(32px)' : 'scale(0.95)';
    document.body.style.overflow = '';
};

// Close on Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeSpeakerModal?.();
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderSpeakers();
        ensureSpeakerModal();
    }, 50);
});
