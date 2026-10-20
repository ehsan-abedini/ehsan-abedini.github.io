      (() => {
        // 1. Progress Bar & Back-to-Top Handler
        const progress = document.getElementById("progressBar");
        const header = document.querySelector('.site-header');
        const backTop = document.getElementById("backToTop");
        let ticking = false;

        const updateScrollMetrics = () => {
          const y = window.scrollY || document.documentElement.scrollTop;
          const max =
            document.documentElement.scrollHeight - window.innerHeight;
          if (progress)
            progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
          if (header) {
            if (y > 180) {
              header.classList.add('is-condensed');
            } else if (y < 10) {
              header.classList.remove('is-condensed');
            }
          }
          if (backTop) backTop.classList.toggle("visible", y > 400);

          if (max > 0 && y >= max - 20) {
            setActiveNav("contact");
          }
          ticking = false;
        };

        window.addEventListener(
          "scroll",
          () => {
            if (!ticking) {
              window.requestAnimationFrame(updateScrollMetrics);
              ticking = true;
            }
          },
          { passive: true },
        );

        updateScrollMetrics();

        backTop?.addEventListener("click", () => {
          window.scrollTo({
            top: 0,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          });
        });

        // 2. High-Performance Scrollspy via IntersectionObserver
        const navLinks = Array.from(
          document.querySelectorAll('nav a[href^="#"]'),
        );
        const trackedIds = navLinks.map((link) =>
          link.getAttribute("href").slice(1),
        );
        const trackedSections = trackedIds
          .map((id) => document.getElementById(id))
          .filter(Boolean);

        const setActiveNav = (activeId) => {
          navLinks.forEach((link) => {
            const match = link.getAttribute("href") === `#${activeId}`;
            link.classList.toggle("active", match);
            if (match) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        };

        if ("IntersectionObserver" in window && trackedSections.length > 0) {
          const observerOptions = {
            root: null,
            rootMargin: "-20% 0px -65% 0px",
            threshold: 0,
          };

          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveNav(entry.target.id);
              }
            });
          }, observerOptions);

          trackedSections.forEach((section) => observer.observe(section));
        }
      })();
// Research Lab Tab Controller
(function initResearchLabTabs() {
  const tablist = document.querySelector('.lab-tablist');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('.lab-tab'));
  const panels = Array.from(document.querySelectorAll('.lab-panel'));

  function activateTab(targetTab) {
    tabs.forEach(tab => {
      const isSelected = tab === targetTab;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', isSelected);
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    const targetPanelId = targetTab.getAttribute('aria-controls');
    panels.forEach(panel => {
      if (panel.id === targetPanelId) {
        panel.removeAttribute('hidden');
        panel.classList.add('is-active');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('is-active');
      }
    });
  }

  // رویداد کلیک تب‌ها
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
  });

  // پشتیبانی کامل از کلیدهای جهت‌نمای کیبورد (Accessibility W3C)
  tablist.addEventListener('keydown', (e) => {
    const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    let nextIndex = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    }
  });
})();

