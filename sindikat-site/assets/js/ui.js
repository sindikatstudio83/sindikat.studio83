// MOBILE MENU — shared across pages
(() => {
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");

  if (!mobileBtn || !mobileMenu) return;

  function setMobile(open){
    mobileMenu.classList.toggle("open", open);

    if (mobileOverlay){
      mobileOverlay.style.opacity = open ? "1" : "0";
      mobileOverlay.style.pointerEvents = open ? "auto" : "none";
    }

    mobileBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  mobileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMobile(!mobileMenu.classList.contains("open"));
  });

  mobileOverlay?.addEventListener("click", () => setMobile(false));

  document.addEventListener("click", (e) => {
    if (!mobileMenu.classList.contains("open")) return;
    const inside = mobileMenu.contains(e.target) || mobileBtn.contains(e.target);
    if (!inside) setMobile(false);
  });

  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMobile(false));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMobile(false);
  });
})();
