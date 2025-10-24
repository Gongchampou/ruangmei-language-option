/* ======== DOM References ======== */
      const grid = document.getElementById("grid");
      const filterInput = document.getElementById("filterInput");
      const searchBtn = document.getElementById("searchBtn");
      const clearBtn = document.getElementById("clearBtn");
      const themeSelect = document.getElementById("themeSelect");
      const filterMode = document.getElementById("filterMode");
      const visibleCount = document.getElementById("visibleCount");
      const totalCount = document.getElementById("totalCount");
      const noResults = document.getElementById("noResults");

      /* ======== Theme Handling (Light, Dark, Night) ======== */
      const THEME_KEY = "theme";
      function applyTheme(theme, animate = true) {
        if (animate) {
          document.documentElement.classList.add('theme-transition');
          setTimeout(() => document.documentElement.classList.remove('theme-transition'), 120);
        }
        document.documentElement.classList.remove("theme-dark", "theme-night");
        if (theme === "dark") document.documentElement.classList.add("theme-dark");
        if (theme === "night") document.documentElement.classList.add("theme-night");
        if (theme === 'light') {
          document.body.setAttribute('data-theme', 'light');
        } else {
          document.body.removeAttribute('data-theme');
        }
        themeSelect.value = theme;
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
      }
      (function initTheme() {
        const saved = (() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();
        const fallback = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        applyTheme(saved || fallback, false);
      })();
      themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));

      /* ======== Static Cards: counts and filtering ======== */
      function updateVisibleCount() {
        const visible = grid.querySelectorAll(".card:not(.hidden)").length;
        visibleCount.textContent = String(visible);
        noResults.style.display = visible === 0 ? "block" : "none";
      }

      function initCounts() {
        const cards = grid.querySelectorAll(".card");
        totalCount.textContent = String(cards.length);
        updateVisibleCount();
      }

      function filterCards(query) {
        const q = query.trim().toLowerCase();
        const cards = grid.querySelectorAll(".card");
        if (!q) {
          cards.forEach((c) => c.classList.remove("hidden"));
          updateVisibleCount();
          return null;
        }
        let firstMatch = null;
        cards.forEach((card) => {
          const idPart = (card.id || "");
          const text = ((card.dataset.keywords || card.textContent || "") + " " + idPart).toLowerCase();
          let matched = false;
          switch ((filterMode?.value || "contains")) {
            case "starts":
              matched = text.startsWith(q);
              break;
            case "ends":
              matched = text.endsWith(q);
              break;
            case "equals":
              matched = text.trim() === q;
              break;
            case "contains":
            default:
              matched = text.includes(q);
          }
          if (matched) {
            card.classList.remove("hidden");
            if (!firstMatch) firstMatch = card;
          } else {
            card.classList.add("hidden");
          }
        });
        updateVisibleCount();
        return firstMatch;
      }

      // Re-filter on mode change
      if (filterMode) {
        filterMode.addEventListener("change", () => {
          filterCards(filterInput.value);
        });
      }

      // Show/hide the inline clear icon
      function toggleClearIcon() {
        if (!clearBtn) return;
        clearBtn.style.display = filterInput.value ? "flex" : "none";
      }

      // Initialize counts on load
      initCounts();
      toggleClearIcon();

      // Live filtering while typing
      filterInput.addEventListener("input", (e) => {
        filterCards(e.target.value);
        toggleClearIcon();
      });

      // Search button: scroll to first match and briefly highlight
      if (searchBtn) {
        searchBtn.addEventListener("click", () => {
          const first = filterCards(filterInput.value);
          if (first) {
            first.scrollIntoView({ behavior: "smooth", block: "center" });
            first.style.outline = "2px solid var(--accent)";
            first.style.outlineOffset = "2px";
            setTimeout(() => { first.style.outline = ""; first.style.outlineOffset = ""; }, 1200);
          }
        });
      }

      // Clear (X) inside input resets filter
      clearBtn.addEventListener("click", () => {
        filterInput.value = "";
        filterCards("");
        filterInput.focus();
        toggleClearIcon();
      });

      // Accessibility: Enter in filter triggers search
      filterInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          if (searchBtn) {
            searchBtn.click();
          } else {
            const first = filterCards(filterInput.value);
            if (first) {
              first.scrollIntoView({ behavior: "smooth", block: "center" });
              first.style.outline = "2px solid var(--accent)";
              first.style.outlineOffset = "2px";
              setTimeout(() => { first.style.outline = ""; first.style.outlineOffset = ""; }, 1200);
            }
          }
        }
      });