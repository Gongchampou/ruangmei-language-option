 // App bootstrap: wait for DOM to be ready
 document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  // Footer year stamp
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile navigation toggle
  const navToggle = $('#navToggle');
  const menu = $('#primary-menu');
  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('#primary-menu a').forEach(a => a.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Submenu toggle support (click/keyboard) for touch devices and accessibility
  (function setupSubmenus(){
    const toggles = $$('.submenu-toggle');
    if (!toggles.length) return;
    toggles.forEach(tg => {
      tg.setAttribute('role', 'button');
      tg.setAttribute('tabindex', '0');
      const li = tg.closest('.has-submenu');
      const toggleOpen = (ev) => {
        if (ev) ev.preventDefault();
        if (!li) return;
        const isOpen = li.classList.toggle('open');
        tg.setAttribute('aria-expanded', String(isOpen));
      };
      tg.addEventListener('click', toggleOpen);
      tg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleOpen();
        }
      });
    });
    // Close submenus on outside click
    document.addEventListener('click', (e) => {
      const anyOpen = $$('.has-submenu.open');
      if (!anyOpen.length) return;
      const inMenu = e.target.closest && e.target.closest('.has-submenu');
      if (!inMenu) anyOpen.forEach(li => li.classList.remove('open'));
    });
    // Close submenus on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.has-submenu.open').forEach(li => li.classList.remove('open'));
      }
    });
  })();

  // Mark active nav item based on current page
  (function markActiveNav(){
    const links = $$('#primary-menu a');
    if (!links.length) return;
    const here = window.location.pathname;
    let set = false;
    links.forEach(a => a.classList.remove('active'));
    links.forEach(a => {
      const url = new URL(a.getAttribute('href'), window.location.href);
      if (url.pathname === here) {
        a.classList.add('active');
        set = true;
      }
    });
    // Fallback: on index.html, highlight Home (#home)
    if (!set && /\/index\.html?$/.test(here)) {
      const home = links.find(a => (a.getAttribute('href') || '').startsWith('#home'));
      if (home) home.classList.add('active');
    }
  })();

  // Also set active immediately on click (before navigation completes)
  (() => {
    const links = $$('#primary-menu a');
    links.forEach(a => a.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      a.classList.add('active');
    }));
  })();


  // Theme toggle with localStorage persistence
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('theme');
  const applyTheme = (theme, animate = true) => {
    if (animate) {
      document.documentElement.classList.add('theme-transition');
      setTimeout(() => document.documentElement.classList.remove('theme-transition'), 120);
    }
    if (theme === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';//you can change the icon
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  };

  const initialTheme = savedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(initialTheme, false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light', true);
    });
  }

  // Back-to-top smooth scroll
  const backToTop = $('#backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Resources: state and elements
  const listEl = $('#resourceList');
  const chips = $$('.chip');
  const searchEl = $('#resourceSearch');
  let items = [];
  let filter = 'all';
  let query = '';

  // Render resource cards based on type filter and search query
  const render = () => {
    if (!listEl) return;
    const q = query.trim().toLowerCase();
    const filtered = items.filter(it => {
      const byType = filter === 'all' || it.type === filter;
      if (!byType) return false;
      if (!q) return true;
      const hay = `${it.title} ${it.description || ''} ${it.source || ''} ${(it.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });

    listEl.innerHTML = filtered.map(it => {
      const metaBits = [
        it.type ? it.type[0].toUpperCase() + it.type.slice(1) : '',
        it.year || '',
        it.source || ''
      ].filter(Boolean).join(' • ');
      const dlAttr = it.fileUrl && (new URL(it.fileUrl, window.location.href)).origin === window.location.origin ? ' download' : '';
      return `
        <article class="card resource" data-type="${it.type}">
          <h3>${it.title}</h3>
          ${metaBits ? `<p class="meta">${metaBits}${it.sizeLabel ? ` • ${it.sizeLabel}` : ''}</p>` : ''}
          ${it.description ? `<p>${it.description}</p>` : ''}
          <div class="actions">
            ${it.fileUrl ? `<a class="btn primary" href="${it.fileUrl}" target="_blank" rel="noreferrer"${dlAttr}>Download</a>` : ''}
            ${it.previewUrl ? `<a class="btn" href="${it.previewUrl}" target="_blank" rel="noreferrer">Preview</a>` : ''}
          </div>
        </article>
      `;
    }).join('');
  };

  // Filter chips: set active and update current filter
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filter = chip.getAttribute('data-filter') || 'all';
      render();
    });
  });

  // Search box: update query on input
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      query = searchEl.value || '';
      render();
    });
  }
  /*(comment out when json is available and when it started using)
  // Fallback data used when JSON manifest is unavailable
  const fallback = [
    {
      id: 'book-gaan-ngai',
      title: 'Gaan-Ngai Festival Overview',
      type: 'book',
      year: 2019,
      source: 'Community placeholder',
      description: 'A concise introduction to the post-harvest festival celebrated with dance, music, and communal feasts.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      sizeLabel: '~1 MB',
      tags: ['festival','culture']
    },
    {
      id: 'photo-shawl',
      title: 'Traditional Shawl Pattern (placeholder)',
      type: 'photo',
      year: 2021,
      source: 'Unsplash placeholder',
      description: 'Representative textile motif. Replace with community-authorized image.',
      fileUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=75',
      previewUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=75',
      tags: ['attire','textile']
    },
    {
      id: 'music-drum',
      title: 'Traditional Drum Loop (placeholder)',
      type: 'music',
      year: 2020,
      source: 'Sample audio',
      description: 'Short audio sample. Replace with community-approved field recordings.',
      fileUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
      previewUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
      sizeLabel: '~100 KB',
      tags: ['music']
    },
    {
      id: 'other-glossary',
      title: 'Community Terms Glossary (CSV placeholder)',
      type: 'other',
      year: 2018,
      source: 'Open sample',
      description: 'Replace with language glossary or wordlist (CSV/TSV).',
      fileUrl: 'https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv',
      sizeLabel: '~1 KB',
      tags: ['language']
    }
  ];
*/

  // Load resources from JSON manifest only on pages that include a resource list
  if (listEl) {
    fetch('asset/data/resources.json')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(data => {
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.resources)) {
          items = data.resources;
        } else {
          items = [];
        }
        render();
      })
      .catch(() => { items = []; render(); });
  }
});
