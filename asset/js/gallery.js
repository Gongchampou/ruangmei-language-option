document.addEventListener('DOMContentLoaded',()=>{
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const grid=$('.gl-grid');
  const chips=$$('.gl-chip');
  const search=$('#glSearch');
  const viewer=$('.gl-viewer');
  const stageImg=$('.gl-stage img');
  const titleEl=$('#glTitle');
  const closeBtn=$('.gl-close');
  const prevBtn=$('#glPrev');
  const nextBtn=$('#glNext');
  const fullBtn=$('#glFull');
  const stage=$('.gl-stage');
  const fallbackEl=$('.gl-fallback');
  let items=[]; let visible=[]; let current=-1;

  const collect=()=>{ items=$$('.g-item',grid) };
  const computeVisible=()=>{ visible=items.filter(it=>!it.classList.contains('hide')) };
  const applyFilter=()=>{
    const active=$('.gl-chip.active');
    const filter=active?active.getAttribute('data-filter'):'all';
    const q=(search?.value||'').toLowerCase();
    items.forEach(it=>{
      const tags=(it.getAttribute('data-tags')||'').toLowerCase();
      const title=(it.getAttribute('data-title')||'').toLowerCase();
      const byType=(filter==='all')||tags.includes(filter);
      const byQuery=!q||(tags+' '+title).includes(q);
      it.classList.toggle('hide',!(byType&&byQuery));
    });
    computeVisible();
  };

  collect(); computeVisible();
  // Mark broken thumbnails without changing click behavior
  items.forEach(it=>{
    const img=it.querySelector('img');
    if(img){
      img.addEventListener('error',()=>{ it.classList.add('broken'); });
      img.addEventListener('load',()=>{ it.classList.remove('broken'); });
    }
  });
  chips.forEach(ch=>{ ch.addEventListener('click',()=>{ chips.forEach(c=>c.classList.remove('active')); ch.classList.add('active'); applyFilter(); }) });
  if(search){ search.addEventListener('input',applyFilter) }

  let fallbackTimer=null;
  const showFallback=(msg)=>{
    if(!fallbackEl) return;
    fallbackEl.textContent = msg || 'Preview failed';
    fallbackEl.classList.remove('hide');
    if(fallbackTimer) clearTimeout(fallbackTimer);
    // Auto-hide after a short duration so UI stays clean
    fallbackTimer = setTimeout(()=>{ fallbackEl.classList.add('hide'); }, 2200);
  };
  const hideFallback=()=>{ if(fallbackEl){ fallbackEl.classList.add('hide'); if(fallbackTimer) clearTimeout(fallbackTimer); } };

  const openViewer=(idx)=>{
    if(idx<0||idx>=visible.length) return;
    current=idx;
    const el=visible[current];
    const src=el.querySelector('img')?.getAttribute('src');
    const title=el.getAttribute('data-title')||'';
    hideFallback();
    // show neutral placeholder while loading/if failed
    stage?.classList.add('empty');
    if(stageImg){
      stageImg.onload=()=>{ hideFallback(); stage?.classList.remove('empty'); };
      stageImg.onerror=()=>{ showFallback('Preview failed • Use ◀ ▶ or press F'); stage?.classList.add('empty'); };
      if(src){ stageImg.setAttribute('src',src); }
    }
    if(titleEl){ titleEl.textContent = title; }
    viewer?.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  const move=(d)=>{ if(!visible.length) return; current=(current+d+visible.length)%visible.length; openViewer(current) };
  const close=()=>{ viewer?.classList.remove('open'); hideFallback(); stage?.classList.remove('empty'); document.body.classList.remove('no-scroll'); };

  if(grid){ grid.addEventListener('click',(e)=>{ const card=e.target.closest('.g-item'); if(!card) return; computeVisible(); const idx=visible.indexOf(card); openViewer(idx); }) }
  closeBtn?.addEventListener('click',close);
  viewer?.addEventListener('click',(e)=>{ if(e.target===viewer) close() });
  prevBtn?.addEventListener('click',()=>move(-1));
  nextBtn?.addEventListener('click',()=>move(1));

  // Fullscreen toggle using Fullscreen API
  const toggleFullscreen=()=>{
    const el=$('.gl-stage');
    if(!el) return;
    if(document.fullscreenElement){ document.exitFullscreen?.(); }
    else { el.requestFullscreen?.(); }
  };
  fullBtn?.addEventListener('click',toggleFullscreen);

  document.addEventListener('keydown',(e)=>{
    if(!viewer?.classList.contains('open')) return;
    if(e.key==='Escape'){ if(document.fullscreenElement){ document.exitFullscreen?.(); } else { close(); } }
    if(e.key==='ArrowLeft') move(-1);
    if(e.key==='ArrowRight') move(1);
    if(e.key.toLowerCase()==='f') toggleFullscreen();
  });
});
