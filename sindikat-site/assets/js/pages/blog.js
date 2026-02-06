/* assets/js/pages/blog.js */

const posts = [
  {
    id: "p1",
    title: "Kako postaviti tracking da optimizacija ima smisla",
    tag: "ops",
    date: "2026-01-20",
    excerpt:
      "Bez čistih događaja i jasnog atribuiranja, kampanja se optimizuje na pogrešne signale. Ovo je minimalni setup koji tražimo prije skaliranja.",
  },
  {
    id: "p2",
    title: "Creative test: 6 varijanti, 7 dana, jedna odluka",
    tag: "creative",
    date: "2026-01-28",
    excerpt:
      "Test nije 'pusti oglase'. Test je dizajn eksperimenta: koji hook, koji proof, koja publika i šta je kriterijum pobjede.",
  },
  {
    id: "p3",
    title: "Event kao pojačivač: šta mora da postoji da bi radio",
    tag: "activation",
    date: "2026-02-02",
    excerpt:
      "Event nije kraj — nego početak. Ako ne proizvodi sadržaj, leadove i signal za kampanju, onda je samo trošak.",
  },
  {
    id: "p4",
    title: "Performance struktura: jedna poruka, više uglova",
    tag: "performance",
    date: "2026-02-04",
    excerpt:
      "Najbrže se gubi budžet kad se testira sve odjednom. Ovdje je struktura koja čuva fokus, a daje dovoljno varijacija za učenje.",
  },
];

const $ = (id) => document.getElementById(id);

function tagLabel(t) {
  if (t === "performance") return "Performance";
  if (t === "creative") return "Creative";
  if (t === "activation") return "Activation";
  if (t === "ops") return "Ops";
  return "Tema";
}

function render() {
  const q = ($("blogSearch")?.value || "").trim().toLowerCase();
  const tag = $("blogTag")?.value || "";

  const filtered = posts.filter((p) => {
    const hitQ =
      !q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q);
    const hitTag = !tag || p.tag === tag;
    return hitQ && hitTag;
  });

  const grid = $("blogGrid");
  const empty = $("blogEmpty");
  if (!grid || !empty) return;

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  grid.innerHTML = filtered
    .map(
      (p) => `
      <article class="card blogCard reveal">
        <h3>${p.title}</h3>
        <div class="blogMeta">
          <span class="badge">${tagLabel(p.tag)}</span>
          <span class="badge">Datum: ${new Date(p.date).toLocaleDateString()}</span>
        </div>
        <p class="blogExcerpt">${p.excerpt}</p>
        <div class="blogActions">
          <a class="btn" href="/kontakt.html">Pričajmo</a>
          <a class="btn primary" href="/kontakt.html"><span class="dot"></span> Zakaži poziv</a>
        </div>
      </article>
    `
    )
    .join("");

  // activate reveal if global animation is present (fallback: show)
  const revealEls = grid.querySelectorAll(".reveal");
  revealEls.forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("blogSearch")?.addEventListener("input", render);
  $("blogTag")?.addEventListener("change", render);
  render();
});
