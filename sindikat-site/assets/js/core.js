
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
