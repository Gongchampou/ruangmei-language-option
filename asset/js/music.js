// Standalone music player controller (no dependency on other site scripts)
// Minimal, clean, and keyboard-friendly

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // Data: demo tracks (CORS-friendly)
  const tracks = [
    {
      id: 't1',
      title: 'Hills at Dawn',
      artist: 'Ava Liang',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover: 'https://images.pexels.com/photos/7130555/pexels-photo-7130555.jpeg?auto=compress&cs=tinysrgb&w=800',
      genre: 'ambient',
      length: '6:14'
    },
    {
      id: 't2',
      title: 'River Folk',
      artist: 'Zou Pamei',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      cover: 'https://images.pexels.com/photos/1649698/pexels-photo-1649698.jpeg?auto=compress&cs=tinysrgb&w=800',
      genre: 'folk',
      length: '5:32'
    },
    {
      id: 't3',
      title: 'Drum Steps',
      artist: 'Ngai Ensemble',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      cover: 'https://images.pexels.com/photos/373945/pexels-photo-373945.jpeg?auto=compress&cs=tinysrgb&w=800',
      genre: 'percussion',
      length: '4:21'
    },
    {
      id: 't4',
      title: 'Sky Threads',
      artist: 'R. Kamei',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      cover: 'https://images.pexels.com/photos/7135037/pexels-photo-7135037.jpeg?auto=compress&cs=tinysrgb&w=800',
      genre: 'instrumental',
      length: '7:10'
    },
    {
        id: 't5',
        title: 'River Folk',
        artist: 'Zou Pamei',
        url: 'https://pub-cd13a035309e4b5f85262d0c366d47e2.r2.dev/baby-love-song-124092.mp3',
        cover: 'https://wpengine.com/wp-content/uploads/2021/05/optimize-images-1024x681.jpg?auto=compress&cs=tinysrgb&w=800',
        genre: 'folk',
        length: '6:12'
    },
    {
        id: 't6',
        title: 'River Folk test',
        artist: 'Zou Pamei',
        url: 'https://pub-cd13a035309e4b5f85262d0c366d47e2.r2.dev/baby-love-song-124092.mp3',
        cover: 'https://images.pexels.com/photos/1649698/pexels-photo-1649698.jpeg?auto=compress&cs=tinysrgb&w=800',
        genre: 'folk',
        length: '6:12'
    },
    {
        id: 't7',
        title: 'Falling Star',
        artist: 'Zou Pamei',
        url: 'https://pub-cd13a035309e4b5f85262d0c366d47e2.r2.dev/-%20Falling%20Stars.mp3',
        cover: 'https://img.freepik.com/free-vector/bright-falling-shooting-star-comet-design_1017-53386.jpg?auto=compress&cs=tinysrgb&w=800',
        genre: 'instrumental',
        length: '3:20'
    },
    {
        id: 't8',
        title: 'River Folk',
        artist: 'Zou Pamei',
        url: 'https://pub-cd13a035309e4b5f85262d0c366d47e2.r2.dev/baby-love-song-124092.mp3',
        cover: 'https://images.pexels.com/photos/1649698/pexels-photo-1649698.jpeg?auto=compress&cs=tinysrgb&w=800',
        genre: 'folk',
        length: '6:12'
    },
    {
        id: 't8',
        title: 'Falling Star',
        artist: 'Zou Pamei',
        url: 'https://pub-cd13a035309e4b5f85262d0c366d47e2.r2.dev/-%20Falling%20Stars.mp3',
        cover: 'https://img.freepik.com/free-vector/bright-falling-shooting-star-comet-design_1017-53386.jpg?auto=compress&cs=tinysrgb&w=800',
        genre: 'instrumental',
        length: '3:20'
    },
  ];

  // Elements
  const app = document.body;
  const search = $('#muSearch');
  const chips = $$('.mu-chip');
  const queueEl = $('#muQueue');
  const audio = $('#muAudio');
  const sortSel = $('#muSort');

  const artImg = $('#muArt');
  const coverImg = $('#muCover');
  const songEl = $('#muSong');
  const artistEl = $('#muArtist');

  const btnPrev = $('#btnPrev');
  const btnPlay = $('#btnPlay');
  const btnNext = $('#btnNext');
  const btnShuffle = $('#btnShuffle');
  const btnRepeat = $('#btnRepeat');
  const prog = $('#muProgress');
  const tCur = $('#muCur');
  const tTot = $('#muTot');
  const vol = $('#muVol');
  const eqWrap = $('#muEq');
  const themeBtn = $('#muTheme');

  let idx = 0;
  let genre = 'all';
  let shuffled = false;
  let repeatMode = 'all'; // 'off' | 'all' | 'one'
  let userSeeking = false;
  let visibleIdx = [];
  let sortMode = sortSel?.value || 'name';

  // Convert Google Drive FILE links to direct download links for <audio>
  const toPlayableUrl = (url) => {
    if (!url) return url;
    try {
      // If it's a Drive FILE link, extract id and convert.
      // Examples:
      // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      // https://drive.google.com/open?id=FILE_ID
      // https://drive.google.com/uc?export=download&id=FILE_ID
      const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
      const openIdMatch = url.match(/[?&]id=([^&]+)/);
      const id = (fileIdMatch && fileIdMatch[1]) || (openIdMatch && openIdMatch[1]);
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    } catch {}
    return url;
  };

  // Theme: init from storage or system, and toggle on click
  const setTheme = (mode) => {
    const light = mode === 'light';
    document.body.classList.toggle('mu-light', light);
    if (themeBtn) themeBtn.textContent = light ? '☀️' : '🌙';
    try { localStorage.setItem('mu-theme', mode); } catch {}
  };
  const initTheme = () => {
    let mode = 'dark';
    try {
      const saved = localStorage.getItem('mu-theme');
      if (saved === 'light' || saved === 'dark') mode = saved;
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) mode = 'light';
    } catch {}
    setTheme(mode);
  };
  initTheme();
  themeBtn?.addEventListener('click', () => {
    const next = document.body.classList.contains('mu-light') ? 'dark' : 'light';
    setTheme(next);
    // re-apply range fills to match new base track color
    applyRangeFills();
  });

  // Helpers
  const PROG_FILL = '#e11d48'; // red progress line
  const VOL_FILL  = '#000000'; // black volume line
  const trackBase = () => document.body.classList.contains('mu-light') ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.12)';

  const updateRangeFill = (el, pct, fill) => {
    const base = trackBase();
    const p = Math.max(0, Math.min(100, pct || 0));
    el.style.background = `linear-gradient(to right, ${fill} 0%, ${fill} ${p}%, ${base} ${p}%, ${base} 100%)`;
  };

  const applyRangeFills = () => {
    // progress is 0..1000, convert to 0..100
    const progPct = Number(prog?.value || 0) / 10;
    updateRangeFill(prog, progPct, PROG_FILL);
    updateRangeFill(vol, Number(vol?.value || 0), VOL_FILL);
  };
  const fmt = (sec) => {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timeToSec = (str) => {
    if (!str) return 0;
    const [m, s] = String(str).split(':');
    return (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
  };
  const dateToTs = (v) => {
    if (!v) return 0;
    const ts = Date.parse(v);
    return isNaN(ts) ? 0 : ts;
  };
  const dateFmt = (v) => {
    const ts = dateToTs(v);
    if (!ts) return '';
    return new Date(ts).toLocaleDateString();
  };

  const setPlayingUI = (playing) => {
    app.classList.toggle('mu-playing', playing);
    btnPlay.innerHTML = playing ? '❚❚' : '▶';
  };

  const renderQueue = () => {
    const q = (search?.value || '').toLowerCase();
    let list = tracks
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => (genre === 'all' || t.genre === genre))
      .filter(({ t }) => `${t.title} ${t.artist} ${t.genre}`.toLowerCase().includes(q));

    // sort according to mode
    if (sortMode === 'name') {
      list.sort((a, b) => a.t.title.localeCompare(b.t.title, undefined, { sensitivity: 'base' }));
    } else if (sortMode === 'time') {
      list.sort((a, b) => timeToSec(a.t.length) - timeToSec(b.t.length));
    } else if (sortMode === 'date') {
      // newest first
      list.sort((a, b) => dateToTs(b.t.updated) - dateToTs(a.t.updated));
    }

    // remember the order of visible track indices
    visibleIdx = list.map(({ i }) => i);

    queueEl.innerHTML = '';
    list.forEach(({ t, i }) => {
      const row = document.createElement('div');
      row.className = 'mu-track' + (i === idx ? ' active' : '');
      row.dataset.index = String(i);
      row.innerHTML = `
        <div class="t-cover"><img src="${t.cover}" alt="${t.title}" loading="lazy"></div>
        <div>
          <div class="t-title">${t.title}</div>
          <div class="t-artist">${t.artist}</div>
        </div>
        <div class="t-time">${t.length || ''}${t.updated ? ' · ' + dateFmt(t.updated) : ''}</div>
      `;
      row.addEventListener('click', () => {
        load(i);
        play();
      });
      queueEl.appendChild(row);
    });
  };

  const load = (i) => {
    idx = i;
    const tr = tracks[idx];
    audio.src = toPlayableUrl(tr.url);
    artImg.src = tr.cover;
    coverImg.src = tr.cover;
    songEl.textContent = tr.title;
    artistEl.textContent = tr.artist;

    // Active highlight (match by original track index)
    $$('.mu-track').forEach((el) => el.classList.toggle('active', Number(el.dataset.index) === idx));

    // Featured panel
    $('#featName').textContent = tr.artist;
    $('#featTag').textContent = tr.genre;
  };

  const play = async () => {
    try {
      await audio.play();
      setPlayingUI(true);
      eqWrap?.classList.add('mu-playing');
    } catch (e) {
      setPlayingUI(false);
    }
  };

  const pause = () => {
    audio.pause();
    setPlayingUI(false);
    eqWrap?.classList.remove('mu-playing');
  };

  const next = () => {
    if (!visibleIdx.length) return;
    if (shuffled) {
      let n;
      do { n = visibleIdx[Math.floor(Math.random() * visibleIdx.length)]; } while (n === idx && visibleIdx.length > 1);
      load(n);
    } else {
      const pos = visibleIdx.indexOf(idx);
      const n = pos === -1 ? visibleIdx[0] : visibleIdx[(pos + 1) % visibleIdx.length];
      load(n);
    }
    play();
  };

  const prev = () => {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    if (!visibleIdx.length) return;
    if (shuffled) {
      let p;
      do { p = visibleIdx[Math.floor(Math.random() * visibleIdx.length)]; } while (p === idx && visibleIdx.length > 1);
      load(p);
    } else {
      const pos = visibleIdx.indexOf(idx);
      const p = pos === -1 ? visibleIdx[visibleIdx.length - 1] : visibleIdx[(pos - 1 + visibleIdx.length) % visibleIdx.length];
      load(p);
    }
    play();
  };

  // Controls
  btnPlay.addEventListener('click', () => (audio.paused ? play() : pause()));
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  btnShuffle.addEventListener('click', () => {
    shuffled = !shuffled;
    btnShuffle.classList.toggle('toggled', shuffled);
  });

  btnRepeat.addEventListener('click', () => {
    // cycle: all -> one -> off -> all
    repeatMode = repeatMode === 'all' ? 'one' : repeatMode === 'one' ? 'off' : 'all';
    btnRepeat.dataset.mode = repeatMode;
    btnRepeat.classList.toggle('toggled', repeatMode !== 'off');
  });

  // Progress and time
  audio.addEventListener('timeupdate', () => {
    if (userSeeking) return;
    const c = audio.currentTime, d = audio.duration || 0;
    prog.value = d ? String((c / d) * 1000) : '0';
    tCur.textContent = fmt(c);
    tTot.textContent = fmt(d);
    // visual progress fill (0..100)
    updateRangeFill(prog, d ? (c / d) * 100 : 0, PROG_FILL);
  });
  prog.addEventListener('input', () => {
    userSeeking = true;
    // show preview of where you'll seek
    updateRangeFill(prog, Number(prog.value) / 10, PROG_FILL);
  });
  prog.addEventListener('change', () => {
    const d = audio.duration || 0;
    const v = Number(prog.value) / 1000;
    audio.currentTime = d * v;
    userSeeking = false;
  });

  // Volume
  vol.addEventListener('input', () => {
    audio.volume = Number(vol.value) / 100;
    updateRangeFill(vol, Number(vol.value), VOL_FILL);
  });
  audio.volume = 0.8; vol.value = '80';
  // initial range backgrounds
  applyRangeFills();

  // Ended behavior
  audio.addEventListener('ended', () => {
    if (repeatMode === 'one') { audio.currentTime = 0; play(); return; }
    if (!visibleIdx.length) { pause(); return; }
    if (shuffled) { next(); return; }
    const pos = visibleIdx.indexOf(idx);
    if (repeatMode === 'off' && pos === visibleIdx.length - 1) { pause(); return; }
    const n = pos === -1 ? visibleIdx[0] : visibleIdx[(pos + 1) % visibleIdx.length];
    load(n); play();
  });

  // Filters
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    genre = ch.dataset.genre || 'all';
    renderQueue();
  }));

  search?.addEventListener('input', renderQueue);
  sortSel?.addEventListener('change', (e) => {
    sortMode = e.target.value || 'name';
    renderQueue();
  });
;

  // Init
  renderQueue();
  load(0);
});
