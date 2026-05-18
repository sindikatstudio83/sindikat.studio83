import Link from "next/link";
import { PageLabel } from "@/components/ui";

const sections = [
  {
    title: "Javno",
    links: [
      { href: "/", label: "Početna" },
      { href: "/oglasi", label: "Oglasi" },
      { href: "/firme", label: "Poslodavci" },
      { href: "/gradovi", label: "Gradovi" },
      { href: "/kategorije", label: "Kategorije" },
      { href: "/za-firme", label: "Za firme" },
    ],
  },
  {
    title: "Kandidat",
    links: [
      { href: "/profil", label: "Profil" },
      { href: "/profil/biografija", label: "Biografija" },
      { href: "/profil/prijave", label: "Moje prijave" },
      { href: "/profil/sacuvani", label: "Sačuvani oglasi" },
      { href: "/profil/upozorenja", label: "Upozorenja" },
    ],
  },
  {
    title: "Firma",
    links: [
      { href: "/firma", label: "Pregled firme" },
      { href: "/firma/novi-oglas", label: "Novi oglas" },
      { href: "/firma/oglasi", label: "Oglasi firme" },
      { href: "/firma/selekcija", label: "Selekcija" },
      { href: "/firma/pretplata", label: "Pretplata" },
      { href: "/firma/baneri", label: "Banneri" },
    ],
  },
  {
    title: "Nalog i pravila",
    links: [
      { href: "/login", label: "Prijava" },
      { href: "/registracija", label: "Registracija" },
      { href: "/privatnost", label: "Privatnost" },
      { href: "/uslovi-koriscenja", label: "Uslovi korišćenja" },
      { href: "/sitemap.xml", label: "XML sitemap" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <section className="live-info-page">
      <PageLabel>imaposla.me</PageLabel>
      <h1>Mapa sajta</h1>
      <p className="lead">Pregled najvažnijih djelova platforme i direktni linkovi za provjeru ruta.</p>
      <div className="sitemap-grid">
        {sections.map((section) => (
          <article className="sitemap-card" key={section.title}>
            <h2>{section.title}</h2>
            <div className="sitemap-links">
              {section.links.map((link) => (
                <Link href={link.href} key={link.href}>
                  <span>{link.label}</span>
                  <strong aria-hidden="true">-&gt;</strong>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
