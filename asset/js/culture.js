/* --- Utility: smooth scrolling for sidebar anchors --- */
document.querySelectorAll("nav.toc a").forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    const id = this.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* --- Scrollspy: highlight active section in sidebar --- */
(function scrollSpy() {
  const tocLinks = Array.from(document.querySelectorAll("nav.toc a"));
  const sections = tocLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    tocLinks.forEach((l) =>
      l.classList.toggle("active", l.getAttribute("href") === "#" + id),
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "0px 0px -70% 0px", threshold: 0.15 },
  );

  sections.forEach((sec) => observer.observe(sec));

  // On click, set active immediately
  tocLinks.forEach((a) =>
    a.addEventListener("click", () => {
      const id = a.getAttribute("href").slice(1);
      setActive(id);
    }),
  );

  // Initialize
  if (sections[0]) setActive(sections[0].id);
})();

/* --- Accordion: open/close content panels --- */
(function initAccordion() {
  const items = document.querySelectorAll(".acc-item");
  items.forEach(function (item) {
    const trigger = item.querySelector(".acc-trigger");
    const content = item.querySelector(".acc-content");
    trigger.addEventListener("click", function () {
      const isOpen = content.classList.contains("open");
      // close all (optional)
      items.forEach(function (i) {
        i.querySelector(".acc-content").classList.remove("open");
        i.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        content.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      } else {
        content.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    // keyboard accessibility
    trigger.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        trigger.click();
      }
    });
  });
})();

/* --- Gallery lightbox --- */
(function galleryLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  document.querySelectorAll(".gallery .tile img").forEach(function (img) {
    const full = img.dataset.full || img.src;
    img.addEventListener("click", function () {
      lightboxImg.src = full;
      lightboxImg.alt = img.alt || "Photo";
      lightbox.classList.add("show");
      // trap focus (basic)
      lightbox.setAttribute("tabindex", "-1");
      lightbox.focus();
    });
    img.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        img.click();
      }
    });
  });
  // Also bind events to tiles for better keyboard support
  document.querySelectorAll(".gallery .tile").forEach(function (tile) {
    const img = tile.querySelector("img");
    if (!img) return;
    const full = img.dataset.full || img.src;
    const open = function () {
      lightboxImg.src = full;
      lightboxImg.alt = img.alt || "Photo";
      lightbox.classList.add("show");
      lightbox.setAttribute("tabindex", "-1");
      lightbox.focus();
    };
    tile.addEventListener("click", open);
    tile.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        open();
      }
    });
  });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target === lightboxImg) {
      lightbox.classList.remove("show");
    }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      lightbox.classList.remove("show");
    }
  });
})();

/* --- Accessibility: reduce motion if user prefers reduced motion --- */
(function prefersReduceMotion() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) {
    document.documentElement.style.scrollBehavior = "auto";
    // optionally disable CSS transitions by adding a class
    document.documentElement.classList.add("reduced-motion");
  }
})();

/* --- OPTIONAL: Scripted print button (uncomment to add a print control) ---
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print this page';
    printBtn.style.position='fixed';
    printBtn.style.right='18px';
    printBtn.style.bottom='18px';
    printBtn.style.padding='10px 14px';
    printBtn.style.borderRadius='8px';
    printBtn.style.background='var(--accent)';
    printBtn.style.color='white';
    printBtn.style.border='none';
    printBtn.style.boxShadow='var(--glass-shadow)';
    printBtn.addEventListener('click', ()=>window.print());
    document.body.appendChild(printBtn);
    */
