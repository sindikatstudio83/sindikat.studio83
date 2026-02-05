// assets/js/components.js

// reveal animacije (ako postoji animejs i elementi .reveal)
(function () {
  if (!window.anime) return;
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    els.forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 820,
          easing: "easeOutExpo",
        });
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  els.forEach((el) => io.observe(el));
})();

// heroBg parallax (ako postoji #heroBg)
(function () {
  const heroBg = document.getElementById("heroBg");
  if (!heroBg) return;

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        heroBg.style.transform = `translateY(${y * 0.06}px)`;
        ticking = false;
      });
    },
    { passive: true }
  );
})();



// assets/js/components.js

const prefersReduced =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Mobile menu toggle (radi sa elementima:
 * #mobileMenuBtn, #mobileMenu, #mobileOverlay)
 */
(function mobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileOverlay");

  if (!btn || !menu) return;

  function setOpen(open) {
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");

    if (overlay) {
      overlay.style.opacity = open ? "1" : "0";
      overlay.style.pointerEvents = open ? "auto" : "none";
    }
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!menu.classList.contains("open"));
  });

  overlay?.addEventListener("click", () => setOpen(false));

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    const inside = menu.contains(e.target) || btn.contains(e.target);
    if (!inside) setOpen(false);
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
})();

/**
 * Optional: partner marquee (ako postoji #partnersRow i želiš auto-move bez animejs)
 * Ako koristiš anime.js, preskoči ovo.
 */
(function partnersMarquee() {
  const row = document.getElementById("partnersRow");
  if (!row) return;
  if (prefersReduced) return;

  // Ako već imaš anime.js loop, ne diramo.
  if (window.anime) return;

  // Minimal CSS-driven fallback: ništa ne radi ovdje.
})();


// assets/js/components.js

(() => {
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileOverlay");

  if (!btn || !menu) return;

  const setMobile = (open) => {
    menu.classList.toggle("open", open);

    if (overlay) {
      overlay.style.opacity = open ? "1" : "0";
      overlay.style.pointerEvents = open ? "auto" : "none";
    }

    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMobile(!menu.classList.contains("open"));
  });

  overlay?.addEventListener("click", () => setMobile(false));

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    const inside = menu.contains(e.target) || btn.contains(e.target);
    if (!inside) setMobile(false);
  });

  // zatvori kad klikneš link u meniju
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMobile(false));
  });

  // ESC zatvara
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMobile(false);
  });

  // fail-safe: na resize preko breakpointa zatvori menu
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setMobile(false);
  });
})();
