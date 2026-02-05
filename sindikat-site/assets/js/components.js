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
