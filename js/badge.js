(() => {
  const canvas = document.getElementById('badge-preview');
  const form = document.getElementById('badge-form');
  if (!canvas || !form) return;

  const ctx = canvas.getContext('2d');
  const nameInput = document.getElementById('badge-name');
  const titleInput = document.getElementById('badge-title');
  const companyInput = document.getElementById('badge-company');
  const photoInput = document.getElementById('badge-photo');
  const photoControls = document.getElementById('badge-photo-controls');
  const zoomInput = document.getElementById('badge-photo-zoom');
  const status = document.getElementById('badge-status');
  const downloadButton = form.querySelector('[type="submit"]');
  const scriptURL = document.currentScript.src;
  const templateBase = new URL('../images/badges/', scriptURL);
  const types = ['attendee', 'speaker', 'volunteer'];
  const templates = {};
  const templatePromises = {};
  const photoHole = { x: 676, y: 596, w: 353, h: 534 };
  const state = { type: 'attendee', photo: null, photoURL: null, zoom: 1, offsetX: 0, offsetY: 0, pointer: null };
  let renderQueued = false;
  let initialized = false;
  let inlineFontsReady = false;

  function badgeFont(family) {
    if (!inlineFontsReady) return family;
    return family === 'Badge Google Sans' ? 'Badge Google Sans Inline' : 'Badge Google Sans Mono Inline';
  }

  function loadBadgeFonts() {
    if (inlineFontsReady) return Promise.resolve();
    return Promise.allSettled([
      document.fonts.load('500 52px "Badge Google Sans"'),
      document.fonts.load('500 38px "Badge Google Sans Mono"')
    ]);
  }

  function translation(key) {
    const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
    return window[`translations_${language}`]?.badge?.[key] || '';
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function fitFont(text, family, weight, initialSize, maxWidth, minSize) {
    let size = initialSize;
    do {
      ctx.font = `${weight} ${size}px "${family}"`;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 1;
    } while (size > minSize);
    return size;
  }

  function drawText(text, y, family, weight, size, width) {
    family = badgeFont(family);
    const fitted = fitFont(text, family, weight, size, width, 22);
    ctx.font = `${weight} ${fitted}px "${family}"`;
    ctx.fillText(text, 116, y, width);
    return fitted;
  }

  function photoRect() {
    if (!state.photo) return null;
    const baseScale = Math.max(photoHole.w / state.photo.naturalWidth, photoHole.h / state.photo.naturalHeight);
    const scale = baseScale * state.zoom;
    const width = state.photo.naturalWidth * scale;
    const height = state.photo.naturalHeight * scale;
    const maxOffsetX = Math.max(0, (width - photoHole.w) / 2);
    const maxOffsetY = Math.max(0, (height - photoHole.h) / 2);
    state.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, state.offsetX));
    state.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, state.offsetY));
    return {
      x: photoHole.x + (photoHole.w - width) / 2 + state.offsetX,
      y: photoHole.y + (photoHole.h - height) / 2 + state.offsetY,
      width,
      height
    };
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#03172b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photo = photoRect();
    if (photo) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoHole.x, photoHole.y, photoHole.w, photoHole.h);
      ctx.clip();
      ctx.drawImage(state.photo, photo.x, photo.y, photo.width, photo.height);
      ctx.restore();
    }

    if (templates[state.type]?.complete) {
      ctx.drawImage(templates[state.type], 0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = '#ffe7a6';
    ctx.textBaseline = 'alphabetic';
    const name = nameInput.value.trim() || translation('name_placeholder');
    const title = titleInput.value.trim();
    const company = companyInput.value.trim();
    drawText(name, 528, 'Badge Google Sans', 500, 52, 500);
    let detailY = 620;
    // Only occupied fields advance the line position: a lone company sits below the name.
    for (const detail of [title, company]) {
      if (!detail) continue;
      drawText(detail, detailY, 'Badge Google Sans Mono', 500, 38, 500);
      detailY += 65;
    }
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }

  function loadTemplate(type) {
    const image = new Image();
    templates[type] = image;
    templatePromises[type] = new Promise((resolve, reject) => {
      image.onload = () => {
        if (state.type === type) {
          setStatus('');
          downloadButton.disabled = false;
        }
        queueRender();
        resolve(image);
      };
      image.onerror = () => {
        if (state.type === type) setStatus(translation('template_error'));
        reject(new Error(`Badge artwork unavailable: ${type}`));
      };
      image.src = window.location.protocol === 'file:'
        ? window.devfestBadgeArtwork[type]
        : new URL(`${type}.png`, templateBase).href;
    });
    templatePromises[type].catch(() => {});
  }

  function selectType(type) {
    if (!types.includes(type)) return;
    state.type = type;
    downloadButton.disabled = !templates[type]?.naturalWidth;
    document.querySelectorAll('[data-badge-type]').forEach(button => {
      const active = button.dataset.badgeType === type;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    queueRender();
  }

  function updatePlaceholders() {
    form.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
      input.placeholder = translation(input.dataset.i18nPlaceholder.split('.')[1]);
    });
    queueRender();
  }

  document.getElementById('badge-types').addEventListener('click', event => {
    const button = event.target.closest('[data-badge-type]');
    if (button) selectType(button.dataset.badgeType);
  });
  [nameInput, titleInput, companyInput].forEach(input => input.addEventListener('input', queueRender));

  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus(translation('photo_error'));
      return;
    }
    const nextURL = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (state.photoURL) URL.revokeObjectURL(state.photoURL);
      state.photoURL = nextURL;
      state.photo = image;
      state.zoom = 1;
      state.offsetX = 0;
      state.offsetY = 0;
      zoomInput.value = '1';
      photoControls.hidden = false;
      canvas.classList.add('is-draggable');
      setStatus('');
      queueRender();
    };
    image.onerror = () => {
      URL.revokeObjectURL(nextURL);
      setStatus(translation('photo_error'));
    };
    image.src = nextURL;
  });

  zoomInput.addEventListener('input', () => {
    state.zoom = Number(zoomInput.value);
    queueRender();
  });

  canvas.addEventListener('pointerdown', event => {
    if (!state.photo) return;
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left) * canvas.width / box.width;
    const y = (event.clientY - box.top) * canvas.height / box.height;
    if (x < photoHole.x || x > photoHole.x + photoHole.w || y < photoHole.y || y > photoHole.y + photoHole.h) return;
    state.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', event => {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;
    const box = canvas.getBoundingClientRect();
    state.offsetX += (event.clientX - state.pointer.x) * canvas.width / box.width;
    state.offsetY += (event.clientY - state.pointer.y) * canvas.height / box.height;
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    queueRender();
  });
  function endDrag() {
    state.pointer = null;
    canvas.classList.remove('is-dragging');
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!nameInput.value.trim()) nameInput.value = '';
    if (!form.reportValidity()) return;
    downloadButton.disabled = true;
    setStatus('');
    try {
      await Promise.all([loadBadgeFonts(), templatePromises[state.type]]);
      if (!templates[state.type]?.complete || !templates[state.type].naturalWidth) {
        throw new Error('Badge artwork unavailable');
      }
      render();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const slug = nameInput.value.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'badge';
      link.href = url;
      link.download = `devfest-paris-2026-${state.type}-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error(error);
      setStatus(translation(error?.name === 'SecurityError' ? 'security_error' : 'download_error'));
    } finally {
      downloadButton.disabled = false;
    }
  });

  window.addEventListener('devfestlanguagechange', updatePlaceholders);
  function prepareArtwork() {
    if (window.location.protocol !== 'file:') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('badge-artwork-inline.js', scriptURL).href;
      script.onload = () => window.devfestBadgeArtwork ? resolve() : reject(new Error('Inline badge artwork missing'));
      script.onerror = () => reject(new Error('Inline badge artwork unavailable'));
      document.head.appendChild(script);
    }).then(async () => {
      if (!window.FontFace || !window.devfestBadgeFontData) return;
      try {
        const faces = [
          new window.FontFace('Badge Google Sans Inline', `url("${window.devfestBadgeFontData.sans}")`, { weight: '500' }),
          new window.FontFace('Badge Google Sans Mono Inline', `url("${window.devfestBadgeFontData.mono}")`, { weight: '500' })
        ];
        await Promise.all(faces.map(face => face.load()));
        faces.forEach(face => document.fonts.add(face));
        inlineFontsReady = true;
      } catch (error) {
        console.warn('Inline badge fonts unavailable; using browser fonts', error);
      }
    });
  }
  window.addEventListener('devfestroutechange', event => {
    if (event.detail.route !== 'badge' || initialized) return;
    initialized = true;
    downloadButton.disabled = true;
    setStatus(translation('loading'));
    prepareArtwork().then(() => types.forEach(loadTemplate)).catch(error => {
      console.error(error);
      setStatus(translation('template_error'));
    });
    loadBadgeFonts().then(queueRender).catch(queueRender);
    updatePlaceholders();
  });
})();
