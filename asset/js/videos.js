// Videos page controller: renders cards from JS and plays in iframe
// Edit the `videos` array below to add your links

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // Data source for the list/grid.
  // Each video item supports:
  // - id: unique string
  // - title: card title
  // - source: provider label (e.g., YouTube, Vimeo)
  // - url: original watch/file URL; converted to iframe src via toEmbedUrl()
  // - thumb: optional explicit thumbnail URL; if missing, thumbFor(url) will derive
  // - date/updated: optional ISO date used when sorting by "date"
  // Data: Replace with your own items
  const videos = [
    {
      id: 'v1',
      title: 'Gaan-Ngai Festival Highlights',
      source: 'YouTube',
      url: 'https://pub-cd13a035309e4b5f85262d0c366d47e2.r2.dev/Vidoes/TOP%207%20BEST%20ASUS%20LAPTOP%20IN%202025%20%F0%9F%94%A5%20Don%20t%20Buy%20an%20Asus%20laptop%20%F0%9F%92%BB.mp4',
      thumb: 'https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'v2',
      title: 'Traditional Dance (Sample)',
      source: 'Vimeo',
      url: 'https://vimeo.com/76979871',
      thumb: 'https://i.vimeocdn.com/video/752147887_640x360.jpg'
    },
    {
      id: 'v3',
      title: 'Traditional Dance (Sample)',
      source: 'Vimeo',
      url: 'https://vimeo.com/76979871',
      thumb: 'https://i.vimeocdn.com/video/752147887_640x360.jpg'
    }
  ];

  // Convert `url` to an embeddable iframe src.
  // Supports YouTube (watch/shorts/youtu.be), Vimeo, Google Drive; otherwise returns `url`.
  function toEmbedUrl(url) {
    try {
      if (!url) return '';
      // YouTube watch
      const ytWatch = url.match(/youtube\.com\/(?:watch\?v=|shorts\/)([\w-]{6,})/);
      if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?rel=0`;
      // YouTube short youtu.be
      const ytShort = url.match(/youtu\.be\/([\w-]{6,})/);
      if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?rel=0`;
      // Vimeo
      const vimeo = url.match(/vimeo\.com\/(\d+)/);
      if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
      // Google Drive file -> preview
      const gDrive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
      if (gDrive) return `https://drive.google.com/file/d/${gDrive[1]}/preview`;
      return url; // fallback (some hosts support iframe directly)
    } catch { return url; }
  }

  // Derive a thumbnail for known sources.
  // Priority: YouTube thumbnail → Vimeo placeholder → generic fallback image.
  function thumbFor(url) {
    try {
      const ytWatch = url.match(/youtube\.com\/(?:watch\?v=|shorts\/)([\w-]{6,})/);
      const ytShort = url.match(/youtu\.be\/([\w-]{6,})/);
      const ytId = (ytWatch && ytWatch[1]) || (ytShort && ytShort[1]);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      // Basic Vimeo thumb placeholder (real Vimeo thumb needs API)
      if (/vimeo\.com\//.test(url)) return 'https://i.vimeocdn.com/video/752147887_640x360.jpg';
      return 'https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?w=800&auto=format&fit=crop&q=60';
    } catch { return 'https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?w=800&auto=format&fit=crop&q=60'; }
  }

  const grid = $('#viGrid');
  const frame = $('#viFrame');
  const titleEl = $('#viTitle');
  const infoEl = $('#viInfo');
  const search = $('#viSearch');
  const sortSel = $('#viSort');
  const modal = $('#viModal');
  const modalFrame = $('#viModalFrame');
  const modalTitle = $('#viModalTitle');
  const modalInfo = $('#viModalInfo');
  const modalClose = $('#viClose');

  // Render cards into the grid from `list`.
  // Each item becomes an <article>. Click opens the modal overlay player.
  function render(list) {
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach((v, i) => {
      const card = document.createElement('article');
      card.className = 'vi-card';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <div class="vi-thumb"><img src="${v.thumb || thumbFor(v.url)}" alt="${v.title}" loading="lazy"></div>
        <div class="vi-ctitle">${v.title}</div>
        <div class="vi-cmeta">${v.source || ''}</div>
      `;
      card.addEventListener('click', () => openModal(v));
      grid.appendChild(card);
    });
  }

  // Legacy inline player support (kept for reference; not used with modal-first UI).
  function play(v) {
    const src = toEmbedUrl(v.url);
    if (frame) frame.src = src;
    if (titleEl) titleEl.textContent = v.title;
    if (infoEl) infoEl.textContent = v.source || '';
    // scroll into view on small screens
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.querySelector('.vi-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Open modal overlay and start playback (autoplay=1). Also locks page scroll.
  function openModal(v) {
    const src = toEmbedUrl(v.url);
    if (modalFrame) {
      const auto = src.includes('?') ? '&autoplay=1' : '?autoplay=1';
      modalFrame.src = src + auto;
    }
    if (modalTitle) modalTitle.textContent = v.title;
    if (modalInfo) modalInfo.textContent = v.source || '';
    modal?.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  }

  // Close modal overlay and stop playback by clearing the iframe src. Unlocks scroll.
  function closeModal() {
    if (modalFrame) modalFrame.src = '';
    modal?.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }

  // Search + sort pipeline: filter by query, then apply current sort mode, then render.
  function applySearch() {
    const q = (search?.value || '').toLowerCase();
    const filtered = !q ? videos : videos.filter(v => `${v.title} ${v.source || ''}`.toLowerCase().includes(q));
    const sorted = sortSel ? sortList(filtered) : filtered;
    render(sorted);
  }

  search?.addEventListener('input', applySearch);
  sortSel?.addEventListener('change', applySearch);
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal?.classList.contains('hidden')) closeModal(); });

  // Sorting modes: name (title asc), source (asc), date (newest first using date/updated).
  function sortList(list) {
    const mode = sortSel?.value || 'name';
    if (mode === 'name') return list.slice().sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (mode === 'source') return list.slice().sort((a, b) => (a.source || '').localeCompare(b.source || ''));
    if (mode === 'date') {
      const toTime = v => new Date(v.date || v.updated || 0).getTime() || 0;
      return list.slice().sort((a, b) => toTime(b) - toTime(a));
    }
    return list.slice();
  }

  // Init: render the sorted list and do not auto-play; modal opens on card click.
  const initial = sortSel ? sortList(videos.slice()) : videos.slice();
  render(initial);
  if (initial.length) {}
});
