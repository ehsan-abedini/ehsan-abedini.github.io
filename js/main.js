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
