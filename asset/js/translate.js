// Simple client-side i18n for a static site
// - 10 languages: en, hi, es, fr, de, ar, zh, ru, pt, ja
// - Works across all pages without changing HTML (best-effort text/attribute mapping)
// - Optional precise keys via data-i18n and data-i18n-* attributes
// - Persists selection in localStorage and respects ?lang=
// - Observes DOM mutations to translate dynamic content
// - RTL support for Arabic

(function () {
  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
    { code: 'zh', label: '中文' },
    { code: 'ru', label: 'Русский' },
    { code: 'pt', label: 'Português' },
    { code: 'ja', label: '日本語' }
  ];

  const RTL = new Set(['ar']);

  // Helper: trim and collapse spaces
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // Base dictionary: key is the English source string (normalized),
  // values are per-language translations including 'en'.
  // You can expand this over time. Unknown strings are left as-is.
  const T = {};
  const add = (en, vals) => { T[norm(en)] = { en: en, ...vals }; };

  // Navigation and common UI
  add('Home',       { hi:'होम', es:'Inicio', fr:'Accueil', de:'Startseite', ar:'الرئيسية', zh:'首页', ru:'Главная', pt:'Início', ja:'ホーム' });
  add('About',      { hi:'परिचय', es:'Acerca de', fr:'À propos', de:'Über', ar:'حول', zh:'关于', ru:'О нас', pt:'Sobre', ja:'概要' });
  add('Culture',    { hi:'संस्कृति', es:'Cultura', fr:'Culture', de:'Kultur', ar:'الثقافة', zh:'文化', ru:'Культура', pt:'Cultura', ja:'文化' });
  add('Gallery',    { hi:'गैलरी', es:'Galería', fr:'Galerie', de:'Galerie', ar:'معرض', zh:'画廊', ru:'Галерея', pt:'Galeria', ja:'ギャラリー' });
  add('Resources',  { hi:'संसाधन', es:'Recursos', fr:'Ressources', de:'Ressourcen', ar:'الموارد', zh:'资源', ru:'Ресурсы', pt:'Recursos', ja:'リソース' });
  add('Books',      { hi:'पुस्तकें', es:'Libros', fr:'Livres', de:'Bücher', ar:'كتب', zh:'书籍', ru:'Книги', pt:'Livros', ja:'本' });
  add('Music',      { hi:'संगीत', es:'Música', fr:'Musique', de:'Musik', ar:'موسيقى', zh:'音乐', ru:'Музыка', pt:'Música', ja:'音楽' });
  add('Contribute', { hi:'योगदान', es:'Contribuir', fr:'Contribuer', de:'Beitragen', ar:'ساهم', zh:'贡献', ru:'Внести вклад', pt:'Contribuir', ja:'貢献' });
  add('Contribution', { hi:'योगदान', es:'Contribución', fr:'Contribution', de:'Beitrag', ar:'مساهمة', zh:'贡献', ru:'Вклад', pt:'Contribuição', ja:'貢献' });
  add('Videos',     { hi:'वीडियो', es:'Videos', fr:'Vidéos', de:'Videos', ar:'فيديوهات', zh:'视频', ru:'Видео', pt:'Vídeos', ja:'動画' });
  add('Community',  { hi:'समुदाय', es:'Comunidad', fr:'Communauté', de:'Gemeinschaft', ar:'المجتمع', zh:'社区', ru:'Сообщество', pt:'Comunidade', ja:'コミュニティ' });
  add('Contact',    { hi:'संपर्क', es:'Contacto', fr:'Contact', de:'Kontakt', ar:'اتصال', zh:'联系', ru:'Контакты', pt:'Contato', ja:'連絡先' });
  add('Skip to content', { hi:'सामग्री पर जाएँ', es:'Saltar al contenido', fr:'Aller au contenu', de:'Zum Inhalt springen', ar:'تخطي إلى المحتوى', zh:'跳到内容', ru:'Перейти к содержимому', pt:'Ir para o conteúdo', ja:'本文へスキップ' });
  add('Toggle dark mode', { hi:'डार्क मोड बदलें', es:'Cambiar modo oscuro', fr:'Basculer le mode sombre', de:'Dunkelmodus umschalten', ar:'تبديل الوضع الداكن', zh:'切换深色模式', ru:'Переключить тёмную тему', pt:'Alternar modo escuro', ja:'ダークモード切替' });

  // Index / sections / buttons
  add('Explore Resources', { hi:'संसाधन देखें', es:'Explorar recursos', fr:'Explorer les ressources', de:'Ressourcen erkunden', ar:'استكشاف الموارد', zh:'探索资源', ru:'Исследовать ресурсы', pt:'Explorar recursos', ja:'リソースを見る' });
  add('Join & Contribute', { hi:'जुड़ें और योगदान करें', es:'Unirse y contribuir', fr:'Rejoindre et contribuer', de:'Mitmachen & beitragen', ar:'انضم وساهم', zh:'参与并贡献', ru:'Присоединиться и помочь', pt:'Juntar-se e contribuir', ja:'参加して貢献' });
  add('Resources', { hi:'संसाधन', es:'Recursos', fr:'Ressources', de:'Ressourcen', ar:'الموارد', zh:'资源', ru:'Ресурсы', pt:'Recursos', ja:'リソース' });
  add('All', { hi:'सभी', es:'Todo', fr:'Tout', de:'Alle', ar:'الكل', zh:'全部', ru:'Все', pt:'Tudo', ja:'すべて' });
  add('Photos', { hi:'तस्वीरें', es:'Fotos', fr:'Photos', de:'Fotos', ar:'صور', zh:'照片', ru:'Фото', pt:'Fotos', ja:'写真' });
  add('Other', { hi:'अन्य', es:'Otros', fr:'Autres', de:'Andere', ar:'أخرى', zh:'其他', ru:'Другое', pt:'Outros', ja:'その他' });
  add('Download', { hi:'डाउनलोड', es:'Descargar', fr:'Télécharger', de:'Herunterladen', ar:'تحميل', zh:'下载', ru:'Скачать', pt:'Baixar', ja:'ダウンロード' });
  add('Preview', { hi:'पूर्वावलोकन', es:'Vista previa', fr:'Aperçu', de:'Vorschau', ar:'معاينة', zh:'预览', ru:'Предпросмотр', pt:'Prévia', ja:'プレビュー' });
  add('Back to top', { hi:'ऊपर जाएँ', es:'Volver arriba', fr:'Haut de page', de:'Nach oben', ar:'العودة للأعلى', zh:'返回顶部', ru:'Наверх', pt:'Voltar ao topo', ja:'ページ先頭へ' });
  add('Back to top ↑', { hi:'ऊपर जाएँ', es:'Volver arriba', fr:'Haut de page', de:'Nach oben', ar:'العودة للأعلى', zh:'返回顶部', ru:'Наверх', pt:'Voltar ao topo', ja:'ページ先頭へ' });

  // Gallery page
  add('Image Library', { hi:'छवि पुस्तकालय', es:'Biblioteca de imágenes', fr:'Bibliothèque d’images', de:'Bildbibliothek', ar:'مكتبة الصور', zh:'图片库', ru:'Библиотека изображений', pt:'Biblioteca de imagens', ja:'画像ライブラリ' });
  add('Festival', { hi:'उत्सव', es:'Festival', fr:'Festival', de:'Festival', ar:'مهرجان', zh:'节日', ru:'Фестиваль', pt:'Festival', ja:'祭り' });
  add('Attire', { hi:'पोशाक', es:'Vestimenta', fr:'Tenue', de:'Kleidung', ar:'ملابس', zh:'服饰', ru:'Одежда', pt:'Traje', ja:'衣装' });
  add('Landscape', { hi:'परिदृश्य', es:'Paisaje', fr:'Paysage', de:'Landschaft', ar:'منظر طبيعي', zh:'风景', ru:'Ландшафт', pt:'Paisagem', ja:'風景' });
  add('Motif', { hi:'आकृति', es:'Motivo', fr:'Motif', de:'Motiv', ar:'نقش', zh:'图案', ru:'Мотив', pt:'Motivo', ja:'モチーフ' });
  add('Archive', { hi:'अभिलेख', es:'Archivo', fr:'Archive', de:'Archiv', ar:'أرشيف', zh:'档案', ru:'Архив', pt:'Arquivo', ja:'アーカイブ' });
  add('Previous', { hi:'पिछला', es:'Anterior', fr:'Précédent', de:'Zurück', ar:'السابق', zh:'上一個', ru:'Предыдущий', pt:'Anterior', ja:'前へ' });
  add('Next', { hi:'अगला', es:'Siguiente', fr:'Suivant', de:'Weiter', ar:'التالي', zh:'下一個', ru:'Следующий', pt:'Próximo', ja:'次へ' });
  add('Enter fullscreen', { hi:'पूर्ण स्क्रीन', es:'Pantalla completa', fr:'Plein écran', de:'Vollbild', ar:'ملء الشاشة', zh:'全屏', ru:'Во весь экран', pt:'Tela cheia', ja:'全画面' });
  add('Close', { hi:'बंद करें', es:'Cerrar', fr:'Fermer', de:'Schließen', ar:'إغلاق', zh:'关闭', ru:'Закрыть', pt:'Fechar', ja:'閉じる' });

  // Videos page
  add('All Videos', { hi:'सभी वीडियो', es:'Todos los videos', fr:'Toutes les vidéos', de:'Alle Videos', ar:'كل الفيديوهات', zh:'全部视频', ru:'Все видео', pt:'Todos os vídeos', ja:'すべての動画' });
  add('Sort by', { hi:'क्रमबद्ध करें', es:'Ordenar por', fr:'Trier par', de:'Sortieren nach', ar:'رتّب حسب', zh:'排序', ru:'Сортировать по', pt:'Ordenar por', ja:'並び替え' });
  add('Name', { hi:'नाम', es:'Nombre', fr:'Nom', de:'Name', ar:'الاسم', zh:'名称', ru:'Имя', pt:'Nome', ja:'名前' });
  add('Source', { hi:'स्रोत', es:'Fuente', fr:'Source', de:'Quelle', ar:'المصدر', zh:'来源', ru:'Источник', pt:'Fonte', ja:'ソース' });
  add('Date updated', { hi:'तिथि अपडेट', es:'Fecha de actualización', fr:'Date de mise à jour', de:'Aktualisiert am', ar:'تاريخ التحديث', zh:'更新日期', ru:'Дата обновления', pt:'Data de atualização', ja:'更新日' });

  // Contact page
  add('Get in touch', { hi:'संपर्क करें', es:'Ponerse en contacto', fr:'Prendre contact', de:'Kontakt aufnehmen', ar:'تواصل معنا', zh:'取得联系', ru:'Связаться', pt:'Entrar em contato', ja:'お問い合わせ' });
  add('Send a message', { hi:'संदेश भेजें', es:'Enviar un mensaje', fr:'Envoyer un message', de:'Nachricht senden', ar:'أرسل رسالة', zh:'发送消息', ru:'Отправить сообщение', pt:'Enviar mensagem', ja:'メッセージを送る' });
  add('Contact info', { hi:'संपर्क जानकारी', es:'Información de contacto', fr:'Coordonnées', de:'Kontaktinfo', ar:'معلومات الاتصال', zh:'联系信息', ru:'Контакты', pt:'Informações de contato', ja:'連絡先情報' });
  add('Quick tags', { hi:'त्वरित टैग', es:'Etiquetas rápidas', fr:'Tags rapides', de:'Schnelle Tags', ar:'وسوم سريعة', zh:'快速标签', ru:'Быстрые теги', pt:'Tags rápidos', ja:'クイックタグ' });
  add('Hours', { hi:'समय', es:'Horario', fr:'Horaires', de:'Stunden', ar:'الساعات', zh:'时间', ru:'Время', pt:'Horário', ja:'時間' });
  add('FAQ', { hi:'प्रश्नोत्तर', es:'Preguntas frecuentes', fr:'FAQ', de:'FAQ', ar:'الأسئلة الشائعة', zh:'常见问题', ru:'Вопросы и ответы', pt:'Perguntas frequentes', ja:'よくある質問' });
  add('Tips for quick replies', { hi:'शीघ्र उत्तर के सुझाव', es:'Consejos para respuestas rápidas', fr:'Astuces pour des réponses rapides', de:'Tipps für schnelle Antworten', ar:'نصائح للرد السريع', zh:'快速回复提示', ru:'Советы для быстрых ответов', pt:'Dicas para respostas rápidas', ja:'迅速な返信のコツ' });

  // Community page (selected items)
  add('Who we are', { hi:'हम कौन हैं', es:'Quiénes somos', fr:'Qui nous sommes', de:'Wer wir sind', ar:'من نحن', zh:'我们是谁', ru:'Кто мы', pt:'Quem somos', ja:'私たちについて' });
  add('Get involved', { hi:'शामिल हों', es:'Participar', fr:'S’impliquer', de:'Mitmachen', ar:'شارك', zh:'参与进来', ru:'Принять участие', pt:'Envolva-se', ja:'参加する' });
  add('References & Links', { hi:'संदर्भ और लिंक', es:'Referencias y enlaces', fr:'Références et liens', de:'Referenzen & Links', ar:'مراجع وروابط', zh:'参考与链接', ru:'Ссылки и материалы', pt:'Referências e links', ja:'参考文献とリンク' });

  // Placeholders and aria-labels
  add('Search resources', { hi:'संसाधन खोजें', es:'Buscar recursos', fr:'Rechercher des ressources', de:'Ressourcen suchen', ar:'ابحث في الموارد', zh:'搜索资源', ru:'Поиск ресурсов', pt:'Pesquisar recursos', ja:'リソース検索' });
  add('Search images', { hi:'छवियाँ खोजें', es:'Buscar imágenes', fr:'Rechercher des images', de:'Bilder suchen', ar:'ابحث عن الصور', zh:'搜索图片', ru:'Поиск изображений', pt:'Pesquisar imagens', ja:'画像検索' });
  add('Search videos', { hi:'वीडियो खोजें', es:'Buscar videos', fr:'Rechercher des vidéos', de:'Videos suchen', ar:'ابحث عن الفيديوهات', zh:'搜索视频', ru:'Поиск видео', pt:'Pesquisar vídeos', ja:'動画検索' });
  add('Filter by title or ID...', { hi:'शीर्षक या आईडी से फ़िल्टर करें...', es:'Filtrar por título o ID...', fr:'Filtrer par titre ou ID...', de:'Nach Titel oder ID filtern...', ar:'تصفية حسب العنوان أو المعرّف...', zh:'按标题或ID筛选...', ru:'Фильтр по названию или ID...', pt:'Filtrar por título ou ID...', ja:'タイトルやIDで絞り込み…' });

  // Translator core
  let currentLang = 'en';

  let MT_ENABLED = true;
  let MT_ENDPOINT = (window.I18N_MT && window.I18N_MT.endpoint) || 'https://libretranslate.de/translate';
  let MT_API_KEY = (window.I18N_MT && window.I18N_MT.apiKey) || null;
  if (window.I18N_MT && typeof window.I18N_MT.enable === 'boolean') { MT_ENABLED = window.I18N_MT.enable; }
  let MT_CACHE = {};
  try { MT_CACHE = JSON.parse(localStorage.getItem('i18n_mt_cache_v1') || '{}') || {}; } catch(e) { MT_CACHE = {}; }
  const mtCacheKey = (lang, text) => lang + '|' + norm(text);
  const getMtCached = (lang, text) => MT_CACHE[mtCacheKey(lang, text)];
  const setMtCached = (lang, text, val) => { MT_CACHE[mtCacheKey(lang, text)] = val; try { localStorage.setItem('i18n_mt_cache_v1', JSON.stringify(MT_CACHE)); } catch(e) {} };
  const MT_PENDING = new Map();
  const mtTranslate = async (text, lang) => {
    if (!MT_ENABLED || !lang || lang === 'en') return text;
    const cached = getMtCached(lang, text);
    if (cached) return cached;
    const key = mtCacheKey(lang, text);
    if (MT_PENDING.has(key)) return MT_PENDING.get(key);
    const p = fetch(MT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: text, source: 'en', target: lang, format: 'text', api_key: MT_API_KEY || undefined }) })
      .then(r => r.json())
      .then(j => {
        const out = (j && j.translatedText) || (Array.isArray(j) && j[0] && j[0].translatedText) || text;
        setMtCached(lang, text, out);
        MT_PENDING.delete(key);
        return out;
      })
      .catch(() => { MT_PENDING.delete(key); return text; });
    MT_PENDING.set(key, p);
    return p;
  };

  const translateString = (s, lang) => {
    const key = norm(s);
    const row = T[key];
    if (!row) return s; // unknown
    return row[lang] || row['en'] || s;
  };

  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  // Tags to skip when walking text nodes
  const SKIP_TEXT_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA']);

  // data-i18n support: data-i18n="Key"; attribute-specific: data-i18n-placeholder, etc.
  const getExplicitKey = (el, attr) => {
    if (!el || !el.getAttribute) return null;
    const aKey = attr ? el.getAttribute(`data-i18n-${attr}`) : null;
    if (aKey) return aKey;
    const base = el.getAttribute('data-i18n');
    return base || null;
  };

  // Walk and translate all text nodes under a root element
  function translateTextNodes(root, lang) {
    if (!root || root.nodeType !== 1) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TEXT_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        const t = norm(node.nodeValue || '');
        if (!t) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const toUpdate = [];
    while (walker.nextNode()) {
      toUpdate.push(walker.currentNode);
    }
    toUpdate.forEach(node => {
      const src = norm(node.nodeValue || '');
      if (!src) return;
      const translated = translateString(src, lang);
      if (translated && translated !== src) {
        node.nodeValue = translated;
      } else if (lang && lang !== 'en') {
        mtTranslate(src, lang).then(v => {
          if (!v || v === src) return;
          if (document.documentElement.getAttribute('lang') !== lang) return;
          node.nodeValue = v;
        });
      }
    });
  }

  const translateElement = (el, lang) => {
    if (!el || el.nodeType !== 1) return;

    // Attributes first
    ATTRS.forEach(attr => {
      const expKey = getExplicitKey(el, attr);
      const src = expKey ? expKey : el.getAttribute(attr);
      if (!src) return;
      const translated = translateString(src, lang);
      if (translated && translated !== src) {
        el.setAttribute(attr, translated);
      } else if (lang && lang !== 'en') {
        mtTranslate(src, lang).then(v => {
          if (!v || v === src) return;
          if (document.documentElement.getAttribute('lang') !== lang) return;
          el.setAttribute(attr, v);
        });
      }
    });

    // Text content: try leaf nodes and common UI containers
    // Avoid clobbering complex innerHTML; only replace when element contains only text (no element children)
    const hasElementChildren = Array.from(el.childNodes).some(n => n.nodeType === 1);
    if (!hasElementChildren) {
      const txt = norm(el.textContent);
      if (txt) {
        const translated = translateString(txt, lang);
        if (translated && translated !== txt) {
          el.textContent = translated;
        } else if (lang && lang !== 'en') {
          mtTranslate(txt, lang).then(v => {
            if (!v || v === txt) return;
            if (document.documentElement.getAttribute('lang') !== lang) return;
            el.textContent = v;
          });
        }
      }
    } else {
      translateTextNodes(el, lang);
    }
  };

  const walkAndTranslate = (root, lang) => {
    if (!root) return;
    // First pass: translate all text nodes broadly
    translateTextNodes(root, lang);
    // Then handle attributes and remaining text for common UI containers
    // Broad but safe selector set; plus anything with data-i18n
    const nodes = root.querySelectorAll([
      'a','button','label','strong','b','span','p','h1','h2','h3','h4','h5','h6',
      'input','textarea','select','option',
      '.btn','.chip','.gl-chip','.pill','.badge','.brand-text','.g-cap','.stat .label'
    ].join(','));
    nodes.forEach(el => translateElement(el, lang));
  };

  const applyDir = (lang) => {
    if (RTL.has(lang)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
      document.body.removeAttribute('dir');
    }
  };

  const applyLang = (lang) => {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    applyDir(lang);
    walkAndTranslate(document, lang);
  };

  // Observe DOM for dynamic content (e.g., cards loaded later)
  const startObserver = () => {
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) walkAndTranslate(n, currentLang);
          });
        } else if (m.type === 'attributes') {
          translateElement(m.target, currentLang);
        }
      }
    });
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  };

  // Language selector UI
  const makeSelector = (initial) => {
    const sel = document.createElement('select');
    sel.id = 'langSelect';
    sel.className = 'lang-select';
    sel.setAttribute('aria-label', 'Language');
    LANGS.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code; opt.textContent = l.label;
      if (l.code === initial) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => applyLang(sel.value));
    // Minimal inline style to avoid extra CSS files
    sel.style.marginLeft = '0.5rem';
    sel.style.padding = '0.25rem 0.5rem';
    sel.style.borderRadius = '6px';
    sel.style.border = '1px solid var(--border, #ccc)';
    sel.style.background = 'var(--card, #fff)';
    sel.style.color = 'inherit';
    return sel;
  };

  const mountSelector = (initial) => {
    const sel = makeSelector(initial);
    // Preferred: generic mount point present on most pages
    const genericMount = document.getElementById('langMount');
    if (genericMount) {
      genericMount.appendChild(sel);
      return;
    }

    // Contact page: mount inside page content if mount point exists
    const contactMount = document.getElementById('contactLangMount');
    if (contactMount) {
      contactMount.appendChild(sel);
      return;
    }

    // Try header pattern used across pages
    const headerInner = document.querySelector('.header-inner');
    if (headerInner) {
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle && themeToggle.parentElement) {
        themeToggle.parentElement.insertBefore(sel, themeToggle.nextSibling);
        return;
      }
      headerInner.appendChild(sel);
      return;
    }

    // Music page or others: try app bars
    const appbars = document.querySelectorAll('.mu-appbar, header');
    if (appbars.length) {
      appbars[0].appendChild(sel);
      return;
    }

    // Fallback: fixed corner
    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.bottom = '12px';
    box.style.left = '12px';
    box.style.zIndex = '9999';
    box.appendChild(sel);
    document.body.appendChild(box);
  };

  const init = () => {
    // Determine initial language from ?lang= or localStorage or document
    const urlLang = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('lang');
    const docLang = document.documentElement.getAttribute('lang');
    const initial = (urlLang || saved || docLang || 'en').toLowerCase();
    const initialValid = LANGS.some(l => l.code === initial) ? initial : 'en';

    mountSelector(initialValid);
    applyLang(initialValid);
    startObserver();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

