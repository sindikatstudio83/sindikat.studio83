
// assets/js/core.js

// godina u footeru
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// helper: page key iz <body data-page="...">
window.SINDIKAT_PAGE = document.body?.dataset?.page || "";
