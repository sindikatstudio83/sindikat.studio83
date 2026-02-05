
// assets/js/core.js

// godina u footeru
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// helper: page key iz <body data-page="...">
window.SINDIKAT_PAGE = document.body?.dataset?.page || "";





// assets/js/core.js

// year: <span data-year></span>
(function setYear() {
  const y = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = y));
})();

// prefers-reduced-motion helper
const prefersReduced =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// reveal animation (CSS radi tranziciju; JS samo dodaje klasu)
(function revealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.14 }
  );

  items.forEach((el) => io.observe(el));
})();

// heroBg parallax (ako postoji)
(function heroParallax() {
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

// blobs base position (ako postoje)
(function blobsBase() {
  const b1 = document.getElementById("blob1");
  const b2 = document.getElementById("blob2");
  if (!b1 && !b2) return;

  const setBase = () => {
    const w = window.innerWidth,
      h = window.innerHeight;
    if (b1) {
      b1.style.left = Math.max(12, w * 0.06) + "px";
      b1.style.top = Math.max(12, h * 0.18) + "px";
    }
    if (b2) {
      b2.style.left = Math.max(12, w * 0.6) + "px";
      b2.style.top = Math.max(12, h * 0.1) + "px";
    }
  };

  setBase();
  window.addEventListener("resize", setBase);
})();



// assets/js/core.js

(() => {
  // Year in footer: <span data-year></span>
  document.querySelectorAll("[data-year]").forEach((n) => {
    n.textContent = String(new Date().getFullYear());
  });

  // Prefers reduced motion
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll (elements with .reveal)
  if (!reduceMotion) {
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (window.anime) {
              window.anime({
                targets: entry.target,
                opacity: [0, 1],
                translateY: [18, 0],
                duration: 820,
                easing: "easeOutExpo",
              });
            } else {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "none";
            }
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.14 }
      );

      revealEls.forEach((el) => io.observe(el));
    }
  } else {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  // Background parallax (heroBg)
  const heroBg = document.getElementById("heroBg");
  if (heroBg && !reduceMotion) {
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
  }

  // Blobs base positioning
  const b1 = document.getElementById("blob1");
  const b2 = document.getElementById("blob2");

  const setBlobsBase = () => {
    if (!b1 || !b2) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    b1.style.left = Math.max(12, w * 0.06) + "px";
    b1.style.top = Math.max(12, h * 0.18) + "px";

    b2.style.left = Math.max(12, w * 0.60) + "px";
    b2.style.top = Math.max(12, h * 0.10) + "px";
  };

  setBlobsBase();
  window.addEventListener("resize", setBlobsBase);

  // Blob floating
  if (!reduceMotion && window.anime && b1 && b2) {
    window.anime({
      targets: "#blob1",
      translateX: [0, 18, -10, 0],
      translateY: [0, -12, 16, 0],
      duration: 9000,
      easing: "easeInOutSine",
      loop: true,
    });

    window.anime({
      targets: "#blob2",
      translateX: [0, -14, 10, 0],
      translateY: [0, 14, -10, 0],
      duration: 11000,
      easing: "easeInOutSine",
      loop: true,
    });
  }

  // Optional: partners marquee (if exists)
  const partnersRow = document.getElementById("partnersRow");
  if (!reduceMotion && window.anime && partnersRow) {
    window.anime({
      targets: "#partnersRow",
      translateX: ["0%", "-50%"],
      duration: 18000,
      easing: "linear",
      loop: true,
    });
  }
})();
