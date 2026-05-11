import type { UserRole } from "@/types/domain";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

// Desktop header navigation — only what makes sense per role
export const desktopNavItems: Record<UserRole, NavItem[]> = {
  guest: [
    { icon: "oglasi", label: "Oglasi", href: "/oglasi" },
    { icon: "gradovi", label: "Gradovi", href: "/gradovi" },
    { icon: "kategorije", label: "Kategorije", href: "/kategorije" },
    { icon: "firme", label: "Firme", href: "/firme" },
    { icon: "za-firme", label: "Za firme", href: "/za-firme" }
  ],
  candidate: [
    { icon: "oglasi", label: "Oglasi", href: "/oglasi" },
    { icon: "profil", label: "Moj profil", href: "/profil" },
    { icon: "biografija", label: "Biografija", href: "/profil/biografija" },
    { icon: "prijave", label: "Moje prijave", href: "/profil/prijave" }
  ],
  company: [
    { icon: "pregled", label: "Pregled", href: "/firma" },
    { icon: "oglasi", label: "Moji oglasi", href: "/firma/oglasi" },
    { icon: "novi", label: "Novi oglas", href: "/firma/novi-oglas" },
    { icon: "selekcija", label: "Selekcija", href: "/firma/selekcija" },
    { icon: "pretplata", label: "Pretplata", href: "/firma/pretplata" }
  ],
  admin: [
    { icon: "pregled", label: "Pregled", href: "/admin" },
    { icon: "uplate", label: "Uplate", href: "/admin/uplate" },
    { icon: "oglasi", label: "Oglasi", href: "/admin/oglasi" },
    { icon: "firme", label: "Firme", href: "/admin/firme" },
    { icon: "korisnici", label: "Korisnici", href: "/admin/korisnici" },
    { icon: "baneri", label: "Baneri", href: "/admin/baneri" },
    { icon: "paketi", label: "Paketi", href: "/admin/paketi" }
  ]
};

// Mobile bottom nav — max 5 items, most important per role
export const mobileNavItems: Record<UserRole, NavItem[]> = {
  guest: [
    { icon: "home", label: "Početna", href: "/" },
    { icon: "oglasi", label: "Oglasi", href: "/oglasi" },
    { icon: "firme", label: "Firme", href: "/firme" },
    { icon: "za-firme", label: "Za firme", href: "/za-firme" },
    { icon: "login", label: "Prijava", href: "/login" }
  ],
  candidate: [
    { icon: "oglasi",     label: "Oglasi",     href: "/oglasi" },
    { icon: "prijave",    label: "Prijave",    href: "/profil/prijave" },
    { icon: "sacuvani",   label: "Sačuvano",   href: "/profil/sacuvani" },
    { icon: "profil",     label: "Profil",     href: "/profil" },
    { icon: "upozorenja", label: "Alertovi",   href: "/profil/upozorenja" }
  ],
  company: [
    { icon: "pregled", label: "Pregled", href: "/firma" },
    { icon: "novi", label: "Novi oglas", href: "/firma/novi-oglas" },
    { icon: "selekcija", label: "Selekcija", href: "/firma/selekcija" },
    { icon: "pretplata", label: "Pretplata", href: "/firma/pretplata" },
    { icon: "odjava", label: "Odjava", href: "/logout" }
  ],
  admin: [
    { icon: "home", label: "Pregled", href: "/admin" },
    { icon: "uplate", label: "Uplate", href: "/admin/uplate" },
    { icon: "oglasi", label: "Oglasi", href: "/admin/oglasi" },
    { icon: "firme", label: "Firme", href: "/admin/firme" },
    { icon: "paketi", label: "Paketi", href: "/admin/paketi" }
  ]
};
